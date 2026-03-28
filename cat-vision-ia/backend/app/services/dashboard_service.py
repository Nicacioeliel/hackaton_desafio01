from app.repositories.analysis_repository import DashboardRepository
from app.schemas.dashboard import DashboardMetrics


def get_dashboard_metrics(db) -> DashboardMetrics:
    repo = DashboardRepository(db)
    m = repo.metrics()
    total = m["total"] or 1
    div_pct = (m["vermelho"] / total) * 100
    return DashboardMetrics(
        total_analyses=m["total"],
        conformidade_verde=m["verde"],
        atencao_amarelo=m["amarelo"],
        divergencia_vermelho=m["vermelho"],
        taxa_divergencias_pct=round(div_pct, 1),
        tempo_medio_ms=m["avg_ms"],
        top_inconsistencies=m["divergent_fields"],
    )
