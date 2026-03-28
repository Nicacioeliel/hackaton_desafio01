from dataclasses import dataclass

from app.core.constants import (
    FIELD_STATUS_AUSENTE,
    FIELD_STATUS_COMPATIVEL,
    FIELD_STATUS_DIVERGENTE,
    FIELD_STATUS_NAO_VERIFICADO,
)
from app.services.normalization_service import normalize_field
from app.utils.fuzzy import address_similarity, semantic_object_score


@dataclass
class FieldCompareResult:
    field_name: str
    art_value: str | None
    extracted_value: str | None
    normalized_art: str
    normalized_extracted: str
    status: str
    confidence: float | None
    justification: str


COMPARISON_FIELDS: list[dict] = [
    {"key": "numero_art", "art": "numero_art", "act": "numero_art", "fuzzy_obj": False},
    {"key": "profissional_nome", "art": "profissional_nome", "act": "profissional_nome", "fuzzy_obj": False},
    {"key": "crea_rnp", "art": "crea_rnp", "act": "crea_rnp", "fuzzy_obj": False},
    {"key": "contratante_nome", "art": "contratante_nome", "act": "contratante_nome", "fuzzy_obj": False},
    {"key": "cnpj", "art": "cnpj", "act": "cnpj", "fuzzy_obj": False},
    {"key": "numero_contrato", "art": "numero_contrato", "act": "numero_contrato", "fuzzy_obj": False},
    {"key": "objeto", "art": "objeto", "act": "objeto", "fuzzy_obj": True},
    {"key": "periodo_execucao", "art": None, "act": None, "fuzzy_obj": False, "combine_dates": True},
    {"key": "endereco", "art": "endereco", "act": "endereco", "fuzzy_obj": False, "address": True},
    {"key": "municipio_uf", "art": "cidade_uf", "act": "cidade_uf", "fuzzy_obj": False},
    {"key": "valor", "art": "valor", "act": "valor", "fuzzy_obj": False},
    {"key": "atividades_tecnicas", "art": "atividades_tecnicas", "act": "atividades_tecnicas", "fuzzy_obj": True},
    {"key": "quantitativos", "art": "quantitativos", "act": "quantitativos", "fuzzy_obj": True},
]


def _get_art_val(art: dict, spec: dict) -> str | None:
    if spec.get("combine_dates"):
        a1 = art.get("data_inicio")
        a2 = art.get("data_fim")
        if a1 or a2:
            return f"{a1 or ''} | {a2 or ''}".strip()
        return None
    k = spec["art"]
    return art.get(k) if k else None


def _get_act_val(act_struct: dict, spec: dict) -> str | None:
    if spec.get("combine_dates"):
        e1 = act_struct.get("data_inicio")
        e2 = act_struct.get("data_fim")
        if e1 or e2:
            return f"{e1 or ''} | {e2 or ''}".strip()
        return None
    k = spec["act"]
    return act_struct.get(k) if k else None


def compare_art_act(art_flat: dict, act_struct: dict) -> list[FieldCompareResult]:
    results: list[FieldCompareResult] = []
    for spec in COMPARISON_FIELDS:
        key = spec["key"]
        av = _get_art_val(art_flat, spec)
        ev = _get_act_val(act_struct, spec)

        na = normalize_field(key, av)
        ne = normalize_field(key, ev)

        if not ev or (isinstance(ev, str) and not ev.strip()):
            status = FIELD_STATUS_AUSENTE
            conf = 0.4
            just = "Campo não identificado no documento enviado (OCR/parsing)."
        elif not av or (isinstance(av, str) and not str(av).strip()):
            status = FIELD_STATUS_NAO_VERIFICADO
            conf = 0.5
            just = "Valor não disponível na ART de referência para confronto direto."
        elif na == ne and na:
            status = FIELD_STATUS_COMPATIVEL
            conf = 0.95
            just = "Correspondência literal ou após normalização (acentos, pontuação, caixa)."
        elif spec.get("fuzzy_obj"):
            score = semantic_object_score(av, ev)
            if score >= 0.72:
                status = FIELD_STATUS_COMPATIVEL
                conf = score
                just = f"Compatível semanticamente (similaridade {score:.0%})."
            else:
                status = FIELD_STATUS_DIVERGENTE
                conf = score
                just = "Divergência ou baixa similaridade no texto do objeto/atividades."
        elif spec.get("address"):
            score = address_similarity(av, ev)
            if score >= 0.65:
                status = FIELD_STATUS_COMPATIVEL
                conf = score
                just = f"Endereço/local com alta sobreposição ({score:.0%})."
            else:
                status = FIELD_STATUS_DIVERGENTE
                conf = score
                just = "Endereço/local divergente ou insuficientemente alinhado."
        else:
            status = FIELD_STATUS_DIVERGENTE
            conf = 0.35
            just = "Valores divergentes após normalização."

        results.append(
            FieldCompareResult(
                field_name=key,
                art_value=av,
                extracted_value=ev,
                normalized_art=na,
                normalized_extracted=ne,
                status=status,
                confidence=conf,
                justification=just,
            )
        )
    return results
