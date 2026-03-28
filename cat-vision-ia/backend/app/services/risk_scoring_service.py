from app.core.constants import (
    FIELD_STATUS_AUSENTE,
    FIELD_STATUS_DIVERGENTE,
    FIELD_STATUS_NAO_VERIFICADO,
)
from app.services.comparison_service import FieldCompareResult

WEIGHTS: dict[str, float] = {
    "cnpj": 25,
    "profissional_nome": 22,
    "crea_rnp": 22,
    "numero_contrato": 20,
    "numero_art": 20,
    "municipio_uf": 15,
    "endereco": 15,
    "valor": 12,
    "objeto": 10,
    "periodo_execucao": 12,
    "atividades_tecnicas": 8,
    "quantitativos": 6,
    "contratante_nome": 10,
}

METADATA_SUSPICIOUS_WEIGHT = 12


def compute_risk_score(
    fields: list[FieldCompareResult],
    suspicious_pdf: bool,
    cnpj_api_failed: bool,
) -> float:
    """
    Score 0-100 (maior = mais risco). API CNPJ indisponível não aumenta score.
    """
    total = 0.0
    for f in fields:
        w = WEIGHTS.get(f.field_name, 8)
        if cnpj_api_failed and f.field_name == "cnpj":
            w *= 0.25
        if f.status == FIELD_STATUS_DIVERGENTE:
            total += w
        elif f.status == FIELD_STATUS_AUSENTE:
            total += w * 0.75
        elif f.status == FIELD_STATUS_NAO_VERIFICADO:
            total += w * 0.35
    if suspicious_pdf:
        total += METADATA_SUSPICIOUS_WEIGHT
    # cap
    return min(100.0, round(total, 1))
