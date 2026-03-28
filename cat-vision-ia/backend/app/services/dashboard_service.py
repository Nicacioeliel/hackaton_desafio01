from app.repositories.analysis_repository import DashboardRepository
from app.schemas.dashboard import DashboardMetrics


def get_dashboard_metrics(db) -> DashboardMetrics:
    repo = DashboardRepository(db)
    m = repo.metrics()
    total = max(m["total"] or 0, 1)
    div_pct = (m["vermelho"] / total) * 100
    return DashboardMetrics(
        total_analyses=m["total"],
        conformidade_verde=m["verde"],
        atencao_amarelo=m["amarelo"],
        divergencia_vermelho=m["vermelho"],
        taxa_divergencias_pct=round(div_pct, 1),
        tempo_medio_ms=m["avg_ms"],
        media_risco=round(m["avg_risk"], 2) if m.get("avg_risk") is not None else None,
        top_inconsistencies=m["divergent_fields"],
        distribuicao_criticidade=m["criticality_distribution"],
        distribuicao_status_campos=m["field_status_distribution"],
    )
