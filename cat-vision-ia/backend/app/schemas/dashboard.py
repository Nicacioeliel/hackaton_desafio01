from pydantic import BaseModel, Field


class DashboardMetrics(BaseModel):
    total_analyses: int = 0
    conformidade_verde: int = 0
    atencao_amarelo: int = 0
    divergencia_vermelho: int = 0
    taxa_divergencias_pct: float = 0.0
    tempo_medio_ms: float | None = None
    media_risco: float | None = None
    top_inconsistencies: list[dict[str, str | int]] = Field(default_factory=list)
    distribuicao_criticidade: list[dict[str, str | int]] = Field(default_factory=list)
    distribuicao_status_campos: list[dict[str, str | int]] = Field(default_factory=list)
    normativa_conforme: int = 0
    normativa_parcial: int = 0
    normativa_nao_conforme: int = 0
    taxa_conformidade_normativa_pct: float | None = None
    top_normative_violations: list[dict[str, str | int]] = Field(default_factory=list)
