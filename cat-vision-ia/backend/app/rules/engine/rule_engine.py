"""Motor de execução de todas as regras normativas registradas."""

from __future__ import annotations

from app.core.constants import (
    CRITICALITY_BAIXA,
    CRITICALITY_CRITICA,
    CRITICALITY_MEDIA,
    NORMATIVE_GLOBAL_CONFORME,
    NORMATIVE_GLOBAL_NAO_CONFORME,
    NORMATIVE_GLOBAL_PARCIAL,
    NORMATIVE_INFORMATIVO,
    NORMATIVE_OBRIGATORIO,
    NORMATIVE_RECOMENDADO,
    NORMATIVE_STATUS_ATENDIDA,
    NORMATIVE_STATUS_ATENCAO,
    NORMATIVE_STATUS_NAO_ATENDIDA,
)
from app.rules.engine.rule_evaluator import evaluate_rule
from app.rules.normativa.normativa_registry import list_all_rules
from app.rules.schemas.rule_result import (
    NormativeContext,
    NormativeEvaluationSummary,
    NormativeRuleResult,
)


def _penalty(obr: str, sev: str) -> float:
    base = {
        CRITICALITY_CRITICA: 12.0,
        CRITICALITY_MEDIA: 7.0,
        CRITICALITY_BAIXA: 3.0,
    }.get(sev, 5.0)
    if obr == NORMATIVE_RECOMENDADO:
        base *= 0.55
    if obr == NORMATIVE_INFORMATIVO:
        base *= 0.25
    return base


def _build_summary(results: list[NormativeRuleResult]) -> NormativeEvaluationSummary:
    v_crit = v_med = v_low = 0
    obr_tot = sum(1 for r in results if r.obrigatoriedade == NORMATIVE_OBRIGATORIO)
    obr_ok = sum(
        1
        for r in results
        if r.obrigatoriedade == NORMATIVE_OBRIGATORIO
        and r.status == NORMATIVE_STATUS_ATENDIDA
    )

    score = 100.0
    for r in results:
        if r.status == NORMATIVE_STATUS_NAO_ATENDIDA:
            score -= _penalty(r.obrigatoriedade, r.severidade)
            if r.severidade == CRITICALITY_CRITICA:
                v_crit += 1
            elif r.severidade == CRITICALITY_MEDIA:
                v_med += 1
            else:
                v_low += 1
        elif r.status == NORMATIVE_STATUS_ATENCAO:
            score -= _penalty(r.obrigatoriedade, r.severidade) * 0.35

    score = max(0.0, min(100.0, round(score, 1)))

    crit_oblig_fail = any(
        r.obrigatoriedade == NORMATIVE_OBRIGATORIO
        and r.severidade == CRITICALITY_CRITICA
        and r.status == NORMATIVE_STATUS_NAO_ATENDIDA
        for r in results
    )
    if crit_oblig_fail or score < 45:
        glob = NORMATIVE_GLOBAL_NAO_CONFORME
    elif score >= 88 and obr_ok == obr_tot and v_crit == 0:
        glob = NORMATIVE_GLOBAL_CONFORME
    else:
        glob = NORMATIVE_GLOBAL_PARCIAL

    lines = [
        f"Conformidade normativa (referências parametrizadas): {score:.1f}%.",
        f"Classificação: {glob}.",
        f"Regras obrigatórias atendidas: {obr_ok}/{max(obr_tot, 1)}.",
        f"Violências contabilizadas — críticas: {v_crit}, médias: {v_med}, leves: {v_low}.",
        "Referência principal: Resolução nº 1.137/2023 (CONFEA), conteúdo típico do Anexo IV.",
    ]
    failures = [
        r
        for r in results
        if r.status
        in (
            NORMATIVE_STATUS_NAO_ATENDIDA,
            NORMATIVE_STATUS_ATENCAO,
        )
        and r.obrigatoriedade != NORMATIVE_INFORMATIVO
    ]
    top = [
        {"rule_id": r.rule_id, "nome": r.nome, "status": r.status}
        for r in failures[:12]
    ]

    return NormativeEvaluationSummary(
        normative_score=score,
        normative_status=glob,
        violations_critical=v_crit,
        violations_medium=v_med,
        violations_low=v_low,
        obligatory_met=obr_ok,
        obligatory_total=obr_tot,
        lines=lines,
        top_violations=top,
    )


def run_normative_evaluation(
    ctx: NormativeContext,
) -> tuple[list[NormativeRuleResult], NormativeEvaluationSummary]:
    rules = list_all_rules()
    results = [evaluate_rule(r, ctx) for r in rules]
    return results, _build_summary(results)
