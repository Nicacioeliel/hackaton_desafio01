"""Converte registros ORM de resultado de campo em FieldCompareResult."""

from typing import TYPE_CHECKING, Any

from app.core.constants import CRITICALITY_NENHUMA
from app.services.comparison_service import FieldCompareResult

if TYPE_CHECKING:
    from app.models.analysis_field_result import AnalysisFieldResult


def orm_to_compare_results(rows: list[Any]) -> list[FieldCompareResult]:
    out: list[FieldCompareResult] = []
    for f in rows:
        out.append(
            FieldCompareResult(
                field_name=f.field_name,
                art_value=f.art_value,
                extracted_value=f.extracted_value,
                normalized_art=f.normalized_art_value or "",
                normalized_extracted=f.normalized_extracted_value or "",
                status=f.status,
                confidence=f.confidence,
                justification=f.justification or "",
                criticality=f.criticality or CRITICALITY_NENHUMA,
                category=f.category or "técnico",
                evidence_excerpt=f.evidence_excerpt,
                evidence_page=f.evidence_page,
                score_impact=float(f.score_impact or 0),
            )
        )
    return out
