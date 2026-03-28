import csv
import io
import json
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.api.deps import get_session
from app.models.analysis import Analysis
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.art_repository import ArtRepository
from app.repositories.upload_repository import UploadRepository
from app.schemas.analysis import (
    AnalysisCreateRequest,
    AnalysisDetailRead,
    AnalysisListItem,
    CnpjValidationRead,
    FieldResultRead,
    ReportRead,
)
from app.schemas.extraction import TableExtractionRead
from app.services.comparison_service import FieldCompareResult
from app.services.report_service import build_report_payload
from app.workers.analysis_worker import run_analysis_pipeline

logger = logging.getLogger(__name__)
router = APIRouter()


def _to_detail(a: Analysis) -> AnalysisDetailRead:
    return AnalysisDetailRead(
        id=a.id,
        art_id=a.art_id,
        upload_id=a.upload_id,
        upload_mime_type=a.upload.mime_type if a.upload else None,
        upload_original_name=a.upload.original_name if a.upload else None,
        upload_suspicious_metadata=bool(a.upload.suspicious_metadata_flag)
        if a.upload
        else None,
        overall_status=a.overall_status,
        risk_score=a.risk_score,
        executive_summary=a.executive_summary,
        suggested_feedback=a.suggested_feedback,
        cnpj_status=a.cnpj_status,
        processing_time_ms=a.processing_time_ms,
        created_at=a.created_at,
        field_results=[FieldResultRead.model_validate(f) for f in (a.field_results or [])],
        tables=[TableExtractionRead.model_validate(t) for t in (a.tables or [])],
        cnpj_validation=CnpjValidationRead.model_validate(a.cnpj_validation)
        if a.cnpj_validation
        else None,
    )


def _fields_from_db(a: Analysis) -> list[FieldCompareResult]:
    return [
        FieldCompareResult(
            field_name=f.field_name,
            art_value=f.art_value,
            extracted_value=f.extracted_value,
            normalized_art=f.normalized_art_value or "",
            normalized_extracted=f.normalized_extracted_value or "",
            status=f.status,
            confidence=f.confidence,
            justification=f.justification,
        )
        for f in (a.field_results or [])
    ]


@router.post("", response_model=AnalysisDetailRead)
def create_analysis(body: AnalysisCreateRequest, db: Session = Depends(get_session)):
    if not ArtRepository(db).get(body.art_id):
        raise HTTPException(404, detail="ART não encontrada")
    if not UploadRepository(db).get(body.upload_id):
        raise HTTPException(404, detail="Upload não encontrado")

    row = Analysis(
        art_id=body.art_id,
        upload_id=body.upload_id,
        overall_status="AMARELO",
        risk_score=0.0,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    try:
        run_analysis_pipeline(db, row.id)
    except Exception as e:
        logger.exception("analysis pipeline failed")
        raise HTTPException(500, detail=f"Falha no processamento: {e!s}") from e

    repo = AnalysisRepository(db)
    done = repo.get(row.id)
    if not done:
        raise HTTPException(500, detail="Análise não encontrada após processamento")
    return _to_detail(done)


@router.get("", response_model=list[AnalysisListItem])
def list_analyses(
    db: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 50,
    status: str | None = Query(None),
    art_q: str | None = Query(None, description="Número da ART"),
):
    repo = AnalysisRepository(db)
    rows, _ = repo.list_page(skip=skip, limit=limit, status=status, art_query=art_q)
    out: list[AnalysisListItem] = []
    for a in rows:
        out.append(
            AnalysisListItem(
                id=a.id,
                art_id=a.art_id,
                upload_id=a.upload_id,
                overall_status=a.overall_status,
                risk_score=a.risk_score,
                cnpj_status=a.cnpj_status,
                created_at=a.created_at,
                art_numero=a.art.numero_art if a.art else None,
                upload_original_name=a.upload.original_name if a.upload else None,
            )
        )
    return out


@router.get("/{analysis_id}", response_model=AnalysisDetailRead)
def get_analysis(analysis_id: int, db: Session = Depends(get_session)):
    a = AnalysisRepository(db).get(analysis_id)
    if not a:
        raise HTTPException(404, detail="Análise não encontrada")
    return _to_detail(a)


@router.get("/{analysis_id}/report", response_model=ReportRead)
def get_report(analysis_id: int, db: Session = Depends(get_session)):
    a = AnalysisRepository(db).get(analysis_id)
    if not a:
        raise HTTPException(404, detail="Análise não encontrada")
    fields = _fields_from_db(a)
    payload = build_report_payload(
        a.id,
        fields,
        a.overall_status,
        a.risk_score,
        a.cnpj_status,
        bool(a.upload and a.upload.suspicious_metadata_flag),
    )
    return ReportRead.model_validate(payload)


@router.get("/{analysis_id}/export/json")
def export_json(analysis_id: int, db: Session = Depends(get_session)):
    a = AnalysisRepository(db).get(analysis_id)
    if not a:
        raise HTTPException(404, detail="Análise não encontrada")
    fields = _fields_from_db(a)
    payload = build_report_payload(
        a.id,
        fields,
        a.overall_status,
        a.risk_score,
        a.cnpj_status,
        bool(a.upload and a.upload.suspicious_metadata_flag),
    )
    return Response(
        content=json.dumps(payload, ensure_ascii=False, indent=2),
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="analise_{analysis_id}.json"'
        },
    )


@router.get("/{analysis_id}/export/csv")
def export_csv(analysis_id: int, db: Session = Depends(get_session)):
    a = AnalysisRepository(db).get(analysis_id)
    if not a:
        raise HTTPException(404, detail="Análise não encontrada")
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(
        [
            "field_name",
            "art_value",
            "extracted_value",
            "status",
            "confidence",
            "justification",
        ]
    )
    for f in a.field_results or []:
        w.writerow(
            [
                f.field_name,
                f.art_value or "",
                f.extracted_value or "",
                f.status,
                f.confidence or "",
                (f.justification or "").replace("\n", " "),
            ]
        )
    return Response(
        content=buf.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="analise_{analysis_id}.csv"'
        },
    )
