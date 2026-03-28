"""Princípios gerais de rastreabilidade e transparência da triagem."""

from app.core.constants import CRITICALITY_BAIXA, NORMATIVE_INFORMATIVO
from app.rules.schemas.rule_definition import NormativeRuleDefinition

RULES_GERAIS: tuple[NormativeRuleDefinition, ...] = (
    NormativeRuleDefinition(
        id="GERAL_RASTREABILIDADE",
        nome="Rastreabilidade da análise automatizada",
        descricao="A triagem deve ser reproduzível com base em dados extraídos e regras declaradas.",
        resolucao="Diretrizes CAT Vision IA",
        resolucao_versao="1",
        artigo="Transparência algorítmica (apoio à decisão)",
        obrigatoriedade=NORMATIVE_INFORMATIVO,
        campo_relacionado=None,
        tipo_validacao="INFORMATIVO",
        severidade=CRITICALITY_BAIXA,
        funcao_validacao="always_atendida_trilha",
        mensagem_erro="",
        mensagem_sucesso="Resultado produzido com referência a resoluções e campos confrontados.",
        impacto_regulatorio="Fortalece defesa técnica e auditoria interna do processo de análise.",
    ),
)
