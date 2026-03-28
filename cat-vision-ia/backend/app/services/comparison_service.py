import re
from dataclasses import dataclass

from app.core.constants import (
    CRITICALITY_BAIXA,
    CRITICALITY_CRITICA,
    CRITICALITY_MEDIA,
    CRITICALITY_NENHUMA,
    FIELD_STATUS_AUSENTE,
    FIELD_STATUS_COMPATIVEL,
    FIELD_STATUS_DIVERGENTE,
    FIELD_STATUS_NAO_IDENTIFICADO,
    FIELD_STATUS_NAO_VERIFICADO,
)
from app.services.normalization_service import normalize_field
from app.utils.fuzzy import address_similarity, semantic_object_score

# Alinhado a risk_scoring_service.WEIGHTS (evitar import circular)
_IMPACT_WEIGHTS: dict[str, float] = {
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

# Criticidade quando há divergência
_FIELD_DIV_CRITICALITY: dict[str, str] = {
    "cnpj": CRITICALITY_CRITICA,
    "profissional_nome": CRITICALITY_CRITICA,
    "crea_rnp": CRITICALITY_CRITICA,
    "numero_contrato": CRITICALITY_CRITICA,
    "numero_art": CRITICALITY_CRITICA,
    "contratante_nome": CRITICALITY_MEDIA,
    "municipio_uf": CRITICALITY_MEDIA,
    "endereco": CRITICALITY_MEDIA,
    "valor": CRITICALITY_MEDIA,
    "periodo_execucao": CRITICALITY_MEDIA,
    "objeto": CRITICALITY_BAIXA,
    "atividades_tecnicas": CRITICALITY_BAIXA,
    "quantitativos": CRITICALITY_BAIXA,
}

_FIELD_CATEGORY: dict[str, str] = {
    "numero_art": "contratual",
    "profissional_nome": "identificação profissional",
    "crea_rnp": "identificação profissional",
    "contratante_nome": "contratual",
    "cnpj": "contratual",
    "numero_contrato": "contratual",
    "objeto": "técnico",
    "periodo_execucao": "temporal",
    "endereco": "localização",
    "municipio_uf": "localização",
    "valor": "econômico",
    "atividades_tecnicas": "técnico",
    "quantitativos": "quantitativo",
}


def _category(key: str) -> str:
    return _FIELD_CATEGORY.get(key, "técnico")


def _divergence_criticality(key: str) -> str:
    return _FIELD_DIV_CRITICALITY.get(key, CRITICALITY_MEDIA)


def _impact_points(
    field_name: str,
    status: str,
    cnpj_api_failed: bool = False,
) -> float:
    w = _IMPACT_WEIGHTS.get(field_name, 8.0)
    if cnpj_api_failed and field_name == "cnpj":
        w *= 0.25
    if status == FIELD_STATUS_DIVERGENTE:
        return round(w, 2)
    if status == FIELD_STATUS_AUSENTE:
        return round(w * 0.75, 2)
    if status == FIELD_STATUS_NAO_IDENTIFICADO:
        return round(w * 0.7, 2)
    if status == FIELD_STATUS_NAO_VERIFICADO:
        return round(w * 0.35, 2)
    return 0.0


def _evidence_from_ocr(
    ocr_text: str,
    extracted: str | None,
    art_val: str | None,
) -> tuple[str | None, int | None]:
    """Trecho do OCR e página estimada (1 se texto único)."""
    if not ocr_text or not ocr_text.strip():
        return None, None
    compact = " ".join(ocr_text.split())
    for needle in (extracted, art_val):
        if not needle or len(needle.strip()) < 2:
            continue
        frag = needle.strip()[:50]
        low = compact.lower()
        idx = low.find(frag.lower())
        if idx >= 0:
            start = max(0, idx - 70)
            end = min(len(compact), idx + 130)
            excerpt = compact[start:end]
            if len(excerpt) > 220:
                excerpt = excerpt[:217] + "…"
            return excerpt, 1
    # palavras-chave por padrão
    if art_val and len(art_val) > 3:
        m = re.search(re.escape(art_val[:30]), ocr_text, re.IGNORECASE)
        if m:
            i = m.start()
            s = max(0, i - 50)
            e = min(len(ocr_text), i + 150)
            bit = " ".join(ocr_text[s:e].split())
            return (bit[:220] + "…") if len(bit) > 220 else bit, 1
    return None, None


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
    criticality: str
    category: str
    evidence_excerpt: str | None
    evidence_page: int | None
    score_impact: float


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


def compare_art_act(
    art_flat: dict,
    act_struct: dict,
    *,
    ocr_text: str = "",
    doc_confidence: float = 0.75,
    cnpj_api_failed: bool = False,
) -> list[FieldCompareResult]:
    results: list[FieldCompareResult] = []
    ocr_len = len((ocr_text or "").strip())

    for spec in COMPARISON_FIELDS:
        key = spec["key"]
        av = _get_art_val(art_flat, spec)
        ev = _get_act_val(act_struct, spec)
        na = normalize_field(key, av)
        ne = normalize_field(key, ev)
        cat = _category(key)

        if not ev or (isinstance(ev, str) and not ev.strip()):
            # Distinguir ausência documental x falha de extração
            if doc_confidence < 0.45 or (ocr_len > 400 and doc_confidence < 0.55):
                status = FIELD_STATUS_NAO_IDENTIFICADO
                conf = max(0.25, doc_confidence * 0.6)
                just = (
                    "O OCR/parser não localizou o campo com segurança no documento. "
                    "Pode existir no papel, mas não foi extraído de forma confiável — recomenda-se conferência visual."
                )
            else:
                status = FIELD_STATUS_AUSENTE
                conf = 0.35
                just = (
                    "Informação não encontrada no texto extraído do documento — interpretação: "
                    "ausência aparente no ACT ou trecho ilegível."
                )
            crit = CRITICALITY_MEDIA if av else CRITICALITY_BAIXA
            ex, pg = _evidence_from_ocr(ocr_text, None, av)
            if not ex:
                ex = (
                    f"Referência na ART: «{av}». Nenhum trecho correspondente localizado no OCR bruto."
                    if av
                    else "Sem valor de referência na ART e sem extração no ACT."
                )
        elif not av or (isinstance(av, str) and not str(av).strip()):
            status = FIELD_STATUS_NAO_VERIFICADO
            conf = 0.5
            just = (
                "Não verificado: valor não disponível na ART de referência para confronto automático "
                "(cadastro incompleto ou campo não aplicável)."
            )
            crit = CRITICALITY_NENHUMA
            ex, pg = _evidence_from_ocr(ocr_text, ev, None)
            if not ex:
                ex = f"Extraído do ACT: «{ev}»."
        elif na == ne and na:
            status = FIELD_STATUS_COMPATIVEL
            conf = 0.95
            just = (
                "Compatível após normalização (acentos, caixa, pontuação e formatação de CNPJ/datas/valores quando aplicável)."
            )
            crit = CRITICALITY_NENHUMA
            ex, pg = _evidence_from_ocr(ocr_text, ev, av)
            if not ex:
                ex = f"ART: «{av}» · ACT: «{ev}» — valores alinhados."
        elif spec.get("fuzzy_obj"):
            score = semantic_object_score(av, ev)
            if score >= 0.72:
                status = FIELD_STATUS_COMPATIVEL
                conf = score
                just = f"Compatível em nível semântico (similaridade aproximada {score:.0%})."
                crit = CRITICALITY_NENHUMA
            else:
                status = FIELD_STATUS_DIVERGENTE
                conf = score
                just = (
                    f"Divergente: conteúdo do objeto/atividades não converge semanticamente "
                    f"(similaridade {score:.0%}). ART: «{av}» · ACT: «{ev}»."
                )
                crit = _divergence_criticality(key)
            ex, pg = _evidence_from_ocr(ocr_text, ev, av)
            if not ex:
                ex = f"ART: «{av}» · ACT: «{ev}»."
        elif spec.get("address"):
            score = address_similarity(av, ev)
            if score >= 0.65:
                status = FIELD_STATUS_COMPATIVEL
                conf = score
                just = f"Local/endereço com sobreposição relevante ({score:.0%})."
                crit = CRITICALITY_NENHUMA
            else:
                status = FIELD_STATUS_DIVERGENTE
                conf = score
                just = (
                    f"Divergência de localização: ART «{av}» vs ACT «{ev}» "
                    f"(similaridade {score:.0%})."
                )
                crit = _divergence_criticality(key)
            ex, pg = _evidence_from_ocr(ocr_text, ev, av)
            if not ex:
                ex = f"ART: «{av}» · ACT: «{ev}»."
        else:
            status = FIELD_STATUS_DIVERGENTE
            conf = 0.4
            just = (
                f"Divergente após normalização. ART: «{av}» · ACT: «{ev}»."
            )
            crit = _divergence_criticality(key)
            ex, pg = _evidence_from_ocr(ocr_text, ev, av)
            if not ex:
                ex = f"ART: «{av}» · ACT: «{ev}»."

        imp = _impact_points(key, status, cnpj_api_failed)

        results.append(
            FieldCompareResult(
                field_name=key,
                art_value=av,
                extracted_value=ev if isinstance(ev, str) else ev,
                normalized_art=na,
                normalized_extracted=ne,
                status=status,
                confidence=conf,
                justification=just,
                criticality=crit,
                category=cat,
                evidence_excerpt=ex,
                evidence_page=pg,
                score_impact=imp,
            )
        )
    return results
