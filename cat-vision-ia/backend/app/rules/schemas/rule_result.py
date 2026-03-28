"""Resultado da avaliação normativa."""

from dataclasses import dataclass, field
from typing import Any

from app.services.comparison_service import FieldCompareResult


@dataclass
class NormativeContext:
    """Entrada do motor: ART (cadastro), ACT (extraído) e resultado da comparação campo a campo."""

    art: dict[str, Any]
    act: dict[str, Any]
    field_results: list[FieldCompareResult]


@dataclass
class NormativeRuleResult:
    rule_id: str
    nome: str
    resolucao: str
    resolucao_versao: str
    artigo: str
    obrigatoriedade: str
    campo_relacionado: str | None
    tipo_validacao: str
    status: str
    severidade: str
    justificativa: str
    impacto_regulatorio: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "rule_id": self.rule_id,
            "nome": self.nome,
            "resolucao": self.resolucao,
            "resolucao_versao": self.resolucao_versao,
            "artigo": self.artigo,
            "obrigatoriedade": self.obrigatoriedade,
            "campo_relacionado": self.campo_relacionado,
            "tipo_validacao": self.tipo_validacao,
            "status": self.status,
            "severidade": self.severidade,
            "justificativa": self.justificativa,
            "impacto_regulatorio": self.impacto_regulatorio,
        }


@dataclass
class NormativeEvaluationSummary:
    normative_score: float
    normative_status: str
    violations_critical: int
    violations_medium: int
    violations_low: int
    obligatory_met: int
    obligatory_total: int
    lines: list[str] = field(default_factory=list)
    top_violations: list[dict[str, str]] = field(default_factory=list)

    def breakdown_dict(self) -> dict[str, Any]:
        return {
            "normative_score": self.normative_score,
            "normative_status": self.normative_status,
            "violations_critical": self.violations_critical,
            "violations_medium": self.violations_medium,
            "violations_low": self.violations_low,
            "obligatory_met": self.obligatory_met,
            "obligatory_total": self.obligatory_total,
            "lines": self.lines,
            "top_violations": self.top_violations,
        }
