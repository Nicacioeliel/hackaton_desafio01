import asyncio
import logging
import time
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.constants import CNPJ_STATUS_NAO_VERIFICADO, CNPJ_STATUS_OK
from app.models.analysis import Analysis
from app.models.analysis_field_result import AnalysisFieldResult
from app.models.cnpj_validation import CnpjValidation
from app.models.document_extraction import DocumentExtraction
from app.models.table_extraction import TableExtraction
from app.repositories.analysis_repository import AnalysisRepository
from app.services.act_parser_service import parse_act
from app.services.art_parser_service import art_to_compare_dict
from app.services.cnpj_service import consultar_cnpj
from app.services.comparison_service import compare_art_act
from app.services.ocr_service import extract_text
from app.services.report_service import build_report_payload, derive_overall
from app.services.risk_scoring_service import compute_risk_score
from app.services.table_extraction_service import extract_tables_from_pdf
from app.utils.text import extract_cnpj
from app.utils.validators import only_digits

logger = logging.getLogger(__name__)


def run_analysis_pipeline(db: Session, analysis_id: int) -> None:
    repo = AnalysisRepository(db)
    analysis = repo.get(analysis_id)
    if not analysis or not analysis.art or not analysis.upload:
        logger.error("analysis %s incomplete", analysis_id)
        return

    t0 = time.perf_counter()
    path = Path(analysis.upload.file_path)
    mime = analysis.upload.mime_type

    text, engine, conf = extract_text(path, mime)
    parsed = parse_act(text)
    struct = parsed["structured"]

    extraction = DocumentExtraction(
        upload_id=analysis.upload_id,
        extracted_text=text[:500_000],
        structured_json=parsed["raw_json"],
        extraction_confidence=conf,
        ocr_engine=engine,
        processing_time_ms=int((time.perf_counter() - t0) * 1000),
    )
    db.add(extraction)
    db.flush()

    art_d = art_to_compare_dict(analysis.art)
    fields = compare_art_act(art_d, struct)

    cnpj_from_doc = struct.get("cnpj") or extract_cnpj(text)
    cnpj_digits = only_digits(cnpj_from_doc or "") if cnpj_from_doc else ""
    api_failed = False
    cnpj_row = None
    cnpj_status = CNPJ_STATUS_NAO_VERIFICADO
    if len(cnpj_digits) == 14:
        try:
            res = asyncio.run(consultar_cnpj(cnpj_digits))
            api_failed = res.get("status") != CNPJ_STATUS_OK
            cnpj_status = res.get("status", CNPJ_STATUS_NAO_VERIFICADO)
            cnpj_row = CnpjValidation(
                analysis_id=analysis.id,
                cnpj_consultado=cnpj_digits,
                razao_social_api=res.get("razao_social"),
                situacao_cadastral=res.get("situacao_cadastral"),
                raw_response_json=res.get("raw"),
                status=cnpj_status,
            )
            db.add(cnpj_row)
        except Exception as e:
            logger.warning("cnpj async: %s", e)
            cnpj_status = CNPJ_STATUS_NAO_VERIFICADO

    suspicious = bool(analysis.upload.suspicious_metadata_flag)

    risk = compute_risk_score(fields, suspicious, api_failed)

    overall = derive_overall(fields)
    if risk >= 55:
        overall = "VERMELHO"
    elif risk <= 20 and overall != "VERMELHO":
        overall = "VERDE"

    report = build_report_payload(
        analysis.id, fields, overall, risk, cnpj_status, suspicious
    )

    for f in fields:
        db.add(
            AnalysisFieldResult(
                analysis_id=analysis.id,
                field_name=f.field_name,
                art_value=f.art_value,
                extracted_value=f.extracted_value,
                normalized_art_value=f.normalized_art,
                normalized_extracted_value=f.normalized_extracted,
                status=f.status,
                confidence=f.confidence,
                justification=f.justification,
            )
        )

    if mime == "application/pdf" and path.suffix.lower() == ".pdf":
        for tbl in extract_tables_from_pdf(path):
            db.add(
                TableExtraction(
                    analysis_id=analysis.id,
                    table_name=tbl["table_name"],
                    csv_content=tbl["csv_content"],
                    json_content=tbl["json_content"],
                )
            )

    analysis.overall_status = overall
    analysis.risk_score = risk
    analysis.executive_summary = report["executive_summary"] + f" OCR: {engine}."
    analysis.suggested_feedback = report["suggested_feedback"]
    analysis.cnpj_status = cnpj_status
    analysis.processing_time_ms = int((time.perf_counter() - t0) * 1000)
    db.commit()
    logger.info("analysis %s done status=%s risk=%s", analysis_id, overall, risk)
