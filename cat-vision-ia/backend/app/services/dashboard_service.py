import json
from collections import Counter

from sqlalchemy import select

from app.models.analysis import Analysis
from app.repositories.analysis_repository import DashboardRepository
from app.schemas.dashboard import DashboardMetrics


def _top_normative_violations(db, limit_rows: int = 300) -> list[dict[str, str | int]]:
    stmt = (
        select(Analysis.normative_breakdown_json)
        .where(Analysis.normative_breakdown_json.isnot(None))
        .order_by(Analysis.created_at.desc())
        .limit(limit_rows)
    )
    c: Counter[str] = Counter()
    for (raw,) in db.execute(stmt).all():
        if not raw:
            continue
        try:
            d = json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            continue
        for t in d.get("top_violations") or []:
            rid = str(t.get("rule_id") or "")
            if rid:
                c[rid] += 1
    return [{"rule_id": k, "count": v} for k, v in c.most_common(12)]


def get_dashboard_metrics(db) -> DashboardMetrics:
    repo = DashboardRepository(db)
    m = repo.metrics()
    total = max(m["total"] or 0, 1)
    div_pct = (m["vermelho"] / total) * 100
    n_conf = m.get("normative_conforme") or 0
    n_parc = m.get("normative_parcial") or 0
    n_nc = m.get("normative_nao_conforme") or 0
    n_norm = n_conf + n_parc + n_nc
    taxa_norm = (
        round((n_conf / max(n_norm, 1)) * 100, 1) if n_norm > 0 else None
    )
    top_nv = _top_normative_violations(db)
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
        normativa_conforme=n_conf,
        normativa_parcial=n_parc,
        normativa_nao_conforme=n_nc,
        taxa_conformidade_normativa_pct=taxa_norm,
        top_normative_violations=top_nv,
    )
