"""
Resolução nº 1.160 — estrutura preparada para expansão (normas futuras).

Inclui regras informativas placeholder até incorporação jurídica detalhada.
"""

from app.core.constants import CRITICALITY_BAIXA, NORMATIVE_INFORMATIVO
from app.rules.schemas.rule_definition import NormativeRuleDefinition

RESOLUCAO = "Resolução nº 1.160"
VERSAO = "2025"

RULES_RESOLUCAO_1160: tuple[NormativeRuleDefinition, ...] = (
    NormativeRuleDefinition(
        id="R1160_PLACEHOLDER_CADASTRO",
        nome="[1160] Regras adicionais — em incorporação",
        descricao="Pacote de regras da Resolução 1.160/2025 será expandido conforme "
        "parametrização institucional do CREA.",
        resolucao=RESOLUCAO,
        resolucao_versao=VERSAO,
        artigo="A definir conforme norma publicada",
        obrigatoriedade=NORMATIVE_INFORMATIVO,
        campo_relacionado=None,
        tipo_validacao="INFORMATIVO",
        severidade=CRITICALITY_BAIXA,
        funcao_validacao="always_atencao_informativo",
        mensagem_erro="",
        mensagem_sucesso="Estrutura multi-normativa ativa; aguardando regras 1.160 específicas.",
        impacto_regulatorio="Sem efeito automático até regras detalhadas serem parametrizadas.",
    ),
)
