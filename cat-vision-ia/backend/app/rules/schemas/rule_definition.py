"""Definição estruturada de regra normativa."""

from dataclasses import dataclass


@dataclass(frozen=True)
class NormativeRuleDefinition:
    """Regra auditável ligada a resolução e artigo (referência jurídica simplificada)."""

    id: str
    nome: str
    descricao: str
    resolucao: str
    resolucao_versao: str
    artigo: str
    obrigatoriedade: str
    campo_relacionado: str | None
    tipo_validacao: str
    severidade: str
    funcao_validacao: str
    mensagem_erro: str
    mensagem_sucesso: str
    impacto_regulatorio: str
