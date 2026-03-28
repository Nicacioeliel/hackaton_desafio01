"""Consolida resultados normativos por campo (AnalysisFieldResult)."""

from __future__ import annotations

import json
from typing import Any

from app.core.constants import (
    NORMATIVE_FIELD_NAO,
    NORMATIVE_FIELD_PARCIAL,
    NORMATIVE_FIELD_SIM,
    NORMATIVE_OBRIGATORIO,
    NORMATIVE_STATUS_ATENDIDA,
    NORMATIVE_STATUS_ATENCAO,
    NORMATIVE_STATUS_NAO_ATENDIDA,
)
from app.rules.schemas.rule_result import NormativeRuleResult


def bundle_for_field(
    norm_results: list[NormativeRuleResult],
    field_name: str,
) -> dict[str, Any]:
    rel = [r for r in norm_results if r.campo_relacionado == field_name]
    if not rel:
        return {
            "normative_conformity": None,
            "regulatory_impact": None,
            "applied_rules_json": None,
        }
    payload_rules = [
        {
            "rule_id": r.rule_id,
            "status": r.status,
            "nome": r.nome,
            "obrigatoriedade": r.obrigatoriedade,
        }
        for r in rel
    ]
    nao_obr = [
        r
        for r in rel
        if r.status == NORMATIVE_STATUS_NAO_ATENDIDA
        and r.obrigatoriedade == NORMATIVE_OBRIGATORIO
    ]
    nao_any = [r for r in rel if r.status == NORMATIVE_STATUS_NAO_ATENDIDA]
    atn = [r for r in rel if r.status == NORMATIVE_STATUS_ATENCAO]
    ok_all = all(r.status == NORMATIVE_STATUS_ATENDIDA for r in rel)

    if nao_obr:
        conform = NORMATIVE_FIELD_NAO
    elif nao_any or atn:
        conform = NORMATIVE_FIELD_PARCIAL
    elif ok_all:
        conform = NORMATIVE_FIELD_SIM
    else:
        conform = NORMATIVE_FIELD_PARCIAL

    impacts: list[str] = []
    for r in rel:
        if r.status != NORMATIVE_STATUS_ATENDIDA:
            impacts.append(r.impacto_regulatorio)
    impact_text = " ".join(dict.fromkeys(impacts)) if impacts else None

    return {
        "normative_conformity": conform,
        "regulatory_impact": impact_text,
        "applied_rules_json": json.dumps(payload_rules, ensure_ascii=False),
    }
