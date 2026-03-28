from app.services.comparison_service import FieldCompareResult

METADATA_SUSPICIOUS_WEIGHT = 12.0


def compute_risk_score(
    fields: list[FieldCompareResult],
    suspicious_pdf: bool,
    _cnpj_api_failed: bool,
) -> float:
    """
    Score 0–100 (maior = mais risco). Usa score_impact já calculado por campo
    na comparação (inclui redução quando a API de CNPJ falha).
    """
    total = sum(f.score_impact for f in fields)
    if suspicious_pdf:
        total += METADATA_SUSPICIOUS_WEIGHT
    return min(100.0, round(total, 1))
