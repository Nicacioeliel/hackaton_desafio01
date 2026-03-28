import csv
import io
import json
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.api.deps import get_session
from app.core.constants import CNPJ_STATUS_NAO_VERIFICADO, REVIEW_CORRECAO, REVIEW_REVISADO
from app.models.analysis import Analysis
from app.models.analysis_field_result import AnalysisFieldResult
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.art_repository import ArtRepository
from app.repositories.upload_repository import UploadRepository
from app.schemas.analysis import (
    AnalysisCreateRequest,
    AnalysisDetailRead,
    AnalysisListItem,
    AnalysisReviewUpdate,
    CnpjValidationRead,
    FieldResultRead,
    ReportRead,
)
from app.schemas.extraction import TableExtractionRead
from app.services.field_result_adapter import orm_to_compare_results
from app.services.pdf_report_service import build_analysis_pdf_bytes
from app.services.report_service import (
    build_report_payload,
    regenerate_stored_opinion_from_analysis,
)
from app.workers.analysis_worker import run_analysis_pipeline

logger = logging.getLogger(__name__)
router = APIRouter()


def _cnpj_api_failed_heuristic(a: Analysis) -> bool:
    return a.cnpj_status == CNPJ_STATUS_NAO_VERIFICADO and a.cnpj_validation is None


def _parse_breakdown(a: Analysis) -> dict | None:
    if not a.score_breakdown_json:
        return None
    try:
        return json.loads(a.score_breakdown_json)
    except json.JSONDecodeError:
        return None


def _parse_normative_breakdown(a: Analysis) -> dict | None:
    if not getattr(a, "normative_breakdown_json", None):
        return None
    try:
        return json.loads(a.normative_breakdown_json)
    except json.JSONDecodeError:
        return None


def _parse_normative_rules(a: Analysis) -> list[dict]:
    if not getattr(a, "normative_results_json", None):
        return []
    try:
        raw = json.loads(a.normative_results_json)
        return raw if isinstance(raw, list) else []
    except json.JSONDecodeError:
        return []


def _serialize_field_result(f: AnalysisFieldResult) -> FieldResultRead:
    base = FieldResultRead.model_validate(f)
    applied: list = []
    if getattr(f, "applied_rules_json", None):
        try:
            parsed = json.loads(f.applied_rules_json)
            if isinstance(parsed, list):
                applied = parsed
        except json.JSONDecodeError:
            pass
    return base.model_copy(update={"applied_rules": applied})


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
        field_results=[_serialize_field_result(f) for f in (a.field_results or [])],
        tables=[TableExtractionRead.model_validate(t) for t in (a.tables or [])],
        cnpj_validation=CnpjValidationRead.model_validate(a.cnpj_validation)
        if a.cnpj_validation
        else None,
        technical_opinion=a.technical_opinion,
        score_breakdown=_parse_breakdown(a),
        review_status=a.review_status or "PENDENTE",
        normative_score=getattr(a, "normative_score", None),
        normative_status=getattr(a, "normative_status", None),
        normative_breakdown=_parse_normative_breakdown(a),
        normative_rules=_parse_normative_rules(a),
    )


def _fields_from_db(a: Analysis):
    return orm_to_compare_results(a.field_results or [])


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
    q: str | None = Query(None, description="Busca em ART, profissional, contratante, arquivo"),
    risk_min: float | None = Query(None),
    risk_max: float | None = Query(None),
    sort: str = Query("date_desc", description="date_desc | risk_desc | risk_asc"),
    normative_status: str | None = Query(
        None,
        description="CONFORME | PARCIAL | NAO_CONFORME",
    ),
):
    repo = AnalysisRepository(db)
    rows, _ = repo.list_page(
        skip=skip,
        limit=limit,
        status=status,
        art_query=art_q,
        search_q=q,
        risk_min=risk_min,
        risk_max=risk_max,
        sort=sort,
        normative_status=normative_status,
    )
    out: list[AnalysisListItem] = []
    for a in rows:
        hint = None
        if a.executive_summary:
            hint = a.executive_summary[:160].strip()
            if len(a.executive_summary) > 160:
                hint += "…"
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
                summary_hint=hint,
                normative_score=getattr(a, "normative_score", None),
                normative_status=getattr(a, "normative_status", None),
            )
        )
    return out


@router.get("/{analysis_id}", response_model=AnalysisDetailRead)
def get_analysis(analysis_id: int, db: Session = Depends(get_session)):
    a = AnalysisRepository(db).get(analysis_id)
    if not a:
        raise HTTPException(404, detail="Análise não encontrada")
    return _to_detail(a)


@router.patch("/{analysis_id}/review", response_model=AnalysisDetailRead)
def update_review(
    analysis_id: int,
    body: AnalysisReviewUpdate,
    db: Session = Depends(get_session),
):
    a = AnalysisRepository(db).get(analysis_id)
    if not a:
        raise HTTPException(404, detail="Análise não encontrada")
    allowed = {"PENDENTE", REVIEW_REVISADO, REVIEW_CORRECAO}
    if body.review_status not in allowed:
        raise HTTPException(400, detail="Status de revisão inválido")
    a.review_status = body.review_status
    db.commit()
    db.refresh(a)
    return _to_detail(a)


@router.post("/{analysis_id}/parecer", response_model=AnalysisDetailRead)
def regenerate_parecer(analysis_id: int, db: Session = Depends(get_session)):
    a = AnalysisRepository(db).get(analysis_id)
    if not a:
        raise HTTPException(404, detail="Análise não encontrada")
    opinion, bd_json = regenerate_stored_opinion_from_analysis(a)
    a.technical_opinion = opinion
    a.score_breakdown_json = bd_json
    db.commit()
    db.refresh(a)
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
        cnpj_api_failed=_cnpj_api_failed_heuristic(a),
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
        cnpj_api_failed=_cnpj_api_failed_heuristic(a),
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
            "category",
            "criticality",
            "art_value",
            "extracted_value",
            "status",
            "confidence",
            "score_impact",
            "evidence_excerpt",
            "justification",
        ]
    )
    for f in a.field_results or []:
        w.writerow(
            [
                f.field_name,
                f.category or "",
                f.criticality or "",
                f.art_value or "",
                f.extracted_value or "",
                f.status,
                f.confidence or "",
                f.score_impact or "",
                (f.evidence_excerpt or "").replace("\n", " ")[:500],
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


@router.get("/{analysis_id}/export/pdf")
def export_pdf(analysis_id: int, db: Session = Depends(get_session)):
    a = AnalysisRepository(db).get(analysis_id)
    if not a:
        raise HTTPException(404, detail="Análise não encontrada")
    try:
        data = build_analysis_pdf_bytes(a)
    except Exception as e:
        logger.exception("pdf export failed")
        raise HTTPException(500, detail=f"Falha ao gerar PDF: {e!s}") from e
    return Response(
        content=data,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="parecer_analise_{analysis_id}.pdf"'
        },
    )


@router.get("/{analysis_id}/export/txt")
def export_txt(analysis_id: int, db: Session = Depends(get_session)):
    a = AnalysisRepository(db).get(analysis_id)
    if not a:
        raise HTTPException(404, detail="Análise não encontrada")
    parts = [
        a.technical_opinion or "",
        "\n\n---\n\n",
        a.executive_summary or "",
        "\n\n---\n\n",
        a.suggested_feedback or "",
    ]
    return Response(
        content="".join(parts),
        media_type="text/plain; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="analise_{analysis_id}.txt"'
        },
    )
