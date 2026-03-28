"""Registro central de normas — ponto de extensão multi-resolução."""

from app.rules.normativa.regras_gerais import RULES_GERAIS
from app.rules.normativa.resolucao_1137 import RULES_RESOLUCAO_1137
from app.rules.normativa.resolucao_1160 import RULES_RESOLUCAO_1160
from app.rules.schemas.rule_definition import NormativeRuleDefinition


def list_all_rules() -> list[NormativeRuleDefinition]:
    """Retorna todas as regras ativas, na ordem de execução desejada."""
    return [
        *RULES_RESOLUCAO_1137,
        *RULES_RESOLUCAO_1160,
        *RULES_GERAIS,
    ]
