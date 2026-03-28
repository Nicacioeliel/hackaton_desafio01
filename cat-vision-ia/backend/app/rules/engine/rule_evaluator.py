"""Avaliação unitária de cada regra normativa."""

from __future__ import annotations

from collections.abc import Callable

from app.core.constants import (
    FIELD_STATUS_COMPATIVEL,
    FIELD_STATUS_DIVERGENTE,
    FIELD_STATUS_NAO_IDENTIFICADO,
    FIELD_STATUS_NAO_VERIFICADO,
    NORMATIVE_STATUS_ATENDIDA,
    NORMATIVE_STATUS_ATENCAO,
    NORMATIVE_STATUS_NAO_ATENDIDA,
)
from app.rules.schemas.rule_definition import NormativeRuleDefinition
from app.rules.schemas.rule_result import NormativeContext, NormativeRuleResult
from app.services.comparison_service import FieldCompareResult


def _non_empty(val: object | None) -> bool:
    if val is None:
        return False
    s = str(val).strip()
    return bool(s)


def _field_compare(ctx: NormativeContext, key: str) -> FieldCompareResult | None:
    for f in ctx.field_results:
        if f.field_name == key:
            return f
    return None


def _result(
    rule: NormativeRuleDefinition,
    status: str,
    justificativa: str,
) -> NormativeRuleResult:
    return NormativeRuleResult(
        rule_id=rule.id,
        nome=rule.nome,
        resolucao=rule.resolucao,
        resolucao_versao=rule.resolucao_versao,
        artigo=rule.artigo,
        obrigatoriedade=rule.obrigatoriedade,
        campo_relacionado=rule.campo_relacionado,
        tipo_validacao=rule.tipo_validacao,
        status=status,
        severidade=rule.severidade,
        justificativa=justificativa,
        impacto_regulatorio=rule.impacto_regulatorio,
    )


def eval_presence_act_field(rule: NormativeRuleDefinition, ctx: NormativeContext) -> NormativeRuleResult:
    key = rule.campo_relacionado
    if not key:
        return _result(
            rule,
            NORMATIVE_STATUS_ATENCAO,
            "Campo relacionado não definido para esta regra.",
        )
    val = ctx.act.get(key)
    if _non_empty(val):
        return _result(
            rule,
            NORMATIVE_STATUS_ATENDIDA,
            f"{rule.mensagem_sucesso} Valor extraído: «{str(val)[:180]}»."
            if val
            else rule.mensagem_sucesso,
        )
    return _result(
        rule,
        NORMATIVE_STATUS_NAO_ATENDIDA,
        rule.mensagem_erro,
    )


def eval_presence_act_local(rule: NormativeRuleDefinition, ctx: NormativeContext) -> NormativeRuleResult:
    if _non_empty(ctx.act.get("endereco")) or _non_empty(ctx.act.get("cidade_uf")):
        return _result(
            rule,
            NORMATIVE_STATUS_ATENDIDA,
            rule.mensagem_sucesso,
        )
    return _result(rule, NORMATIVE_STATUS_NAO_ATENDIDA, rule.mensagem_erro)


def eval_presence_act_period(rule: NormativeRuleDefinition, ctx: NormativeContext) -> NormativeRuleResult:
    if _non_empty(ctx.act.get("data_inicio")) or _non_empty(ctx.act.get("data_fim")):
        return _result(rule, NORMATIVE_STATUS_ATENDIDA, rule.mensagem_sucesso)
    return _result(rule, NORMATIVE_STATUS_NAO_ATENDIDA, rule.mensagem_erro)


def eval_consistency_field_compatible(rule: NormativeRuleDefinition, ctx: NormativeContext) -> NormativeRuleResult:
    key = rule.campo_relacionado
    if not key:
        return _result(rule, NORMATIVE_STATUS_ATENCAO, "Campo não definido.")
    fr = _field_compare(ctx, key)
    if not fr:
        return _result(
            rule,
            NORMATIVE_STATUS_ATENCAO,
            "Comparação automática não disponível para este campo.",
        )
    if fr.status == FIELD_STATUS_COMPATIVEL:
        return _result(rule, NORMATIVE_STATUS_ATENDIDA, rule.mensagem_sucesso + " " + fr.justification)
    if fr.status == FIELD_STATUS_DIVERGENTE:
        return _result(
            rule,
            NORMATIVE_STATUS_NAO_ATENDIDA,
            f"{rule.mensagem_erro} Detalhe: {fr.justification}",
        )
    if fr.status in (FIELD_STATUS_NAO_IDENTIFICADO, FIELD_STATUS_NAO_VERIFICADO):
        return _result(
            rule,
            NORMATIVE_STATUS_ATENCAO,
            f"Não foi possível concluir a consistência ({fr.status}): {fr.justification}",
        )
    return _result(
        rule,
        NORMATIVE_STATUS_NAO_ATENDIDA,
        f"{rule.mensagem_erro} ({fr.status}). {fr.justification}",
    )


def eval_consistency_objeto_semantic(rule: NormativeRuleDefinition, ctx: NormativeContext) -> NormativeRuleResult:
    fr = _field_compare(ctx, "objeto")
    if not fr:
        return _result(rule, NORMATIVE_STATUS_ATENCAO, "Campo objeto não comparado.")
    if fr.status == FIELD_STATUS_COMPATIVEL:
        return _result(rule, NORMATIVE_STATUS_ATENDIDA, rule.mensagem_sucesso)
    if fr.status == FIELD_STATUS_DIVERGENTE:
        return _result(
            rule,
            NORMATIVE_STATUS_NAO_ATENDIDA,
            f"{rule.mensagem_erro} {fr.justification}",
        )
    return _result(
        rule,
        NORMATIVE_STATUS_ATENCAO,
        f"Conferência objetiva inconclusiva ({fr.status}). {fr.justification}",
    )


def eval_always_atencao_informativo(rule: NormativeRuleDefinition, _ctx: NormativeContext) -> NormativeRuleResult:
    return _result(rule, NORMATIVE_STATUS_ATENCAO, rule.mensagem_sucesso)


def eval_always_atendida_trilha(rule: NormativeRuleDefinition, _ctx: NormativeContext) -> NormativeRuleResult:
    return _result(rule, NORMATIVE_STATUS_ATENDIDA, rule.mensagem_sucesso)


_EVAL_REGISTRY: dict[str, Callable[[NormativeRuleDefinition, NormativeContext], NormativeRuleResult]] = {
    "presence_act_field": eval_presence_act_field,
    "presence_act_local": eval_presence_act_local,
    "presence_act_period": eval_presence_act_period,
    "consistency_field_compatible": eval_consistency_field_compatible,
    "consistency_objeto_semantic": eval_consistency_objeto_semantic,
    "always_atencao_informativo": eval_always_atencao_informativo,
    "always_atendida_trilha": eval_always_atendida_trilha,
}


def evaluate_rule(rule: NormativeRuleDefinition, ctx: NormativeContext) -> NormativeRuleResult:
    fn = _EVAL_REGISTRY.get(rule.funcao_validacao)
    if fn is None:
        return _result(
            rule,
            NORMATIVE_STATUS_ATENCAO,
            f"Função de validação não registrada: {rule.funcao_validacao}",
        )
    return fn(rule, ctx)
