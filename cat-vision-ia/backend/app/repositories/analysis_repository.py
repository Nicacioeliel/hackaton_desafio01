from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.analysis import Analysis
from app.models.analysis_field_result import AnalysisFieldResult
from app.models.art import Art
from app.models.document_upload import DocumentUpload
from app.repositories.base import BaseRepository


class AnalysisRepository(BaseRepository[Analysis]):
    def get(self, analysis_id: int) -> Analysis | None:
        stmt = (
            select(Analysis)
            .options(
                joinedload(Analysis.field_results),
                joinedload(Analysis.tables),
                joinedload(Analysis.cnpj_validation),
                joinedload(Analysis.art),
                joinedload(Analysis.upload),
            )
            .where(Analysis.id == analysis_id)
        )
        return self.db.execute(stmt).unique().scalar_one_or_none()

    def create(self, row: Analysis) -> Analysis:
        self.db.add(row)
        self.db.flush()
        return row

    def list_page(
        self,
        skip: int = 0,
        limit: int = 50,
        status: str | None = None,
        art_query: str | None = None,
        risk_min: float | None = None,
        risk_max: float | None = None,
        search_q: str | None = None,
        sort: str = "date_desc",
    ) -> tuple[list[Analysis], int]:
        conditions: list = []
        if status:
            conditions.append(Analysis.overall_status == status)
        if risk_min is not None:
            conditions.append(Analysis.risk_score >= risk_min)
        if risk_max is not None:
            conditions.append(Analysis.risk_score <= risk_max)

        base_opts = joinedload(Analysis.art), joinedload(Analysis.upload)

        if search_q and search_q.strip():
            sq = f"%{search_q.strip()}%"
            search_cond = or_(
                Art.numero_art.ilike(sq),
                Art.profissional_nome.ilike(sq),
                Art.contratante_nome.ilike(sq),
                DocumentUpload.original_name.ilike(sq),
            )
            all_conds = [*conditions, search_cond]
            stmt = (
                select(Analysis)
                .options(*base_opts)
                .join(Art, Analysis.art_id == Art.id)
                .outerjoin(DocumentUpload, Analysis.upload_id == DocumentUpload.id)
                .where(and_(*all_conds))
            )
            count_stmt = (
                select(func.count())
                .select_from(Analysis)
                .join(Art, Analysis.art_id == Art.id)
                .outerjoin(DocumentUpload, Analysis.upload_id == DocumentUpload.id)
                .where(and_(*all_conds))
            )
        elif art_query and art_query.strip():
            aq = f"%{art_query.strip()}%"
            art_cond = Art.numero_art.ilike(aq)
            all_conds = [*conditions, art_cond]
            stmt = (
                select(Analysis)
                .options(*base_opts)
                .join(Art, Analysis.art_id == Art.id)
                .where(and_(*all_conds))
            )
            count_stmt = (
                select(func.count())
                .select_from(Analysis)
                .join(Art, Analysis.art_id == Art.id)
                .where(and_(*all_conds))
            )
        else:
            stmt = select(Analysis).options(*base_opts)
            count_stmt = select(func.count()).select_from(Analysis)
            if conditions:
                stmt = stmt.where(and_(*conditions))
                count_stmt = count_stmt.where(and_(*conditions))

        total = self.db.execute(count_stmt).scalar_one()

        if sort == "risk_desc":
            stmt = stmt.order_by(Analysis.risk_score.desc(), Analysis.created_at.desc())
        elif sort == "risk_asc":
            stmt = stmt.order_by(Analysis.risk_score.asc(), Analysis.created_at.desc())
        else:
            stmt = stmt.order_by(Analysis.created_at.desc())

        stmt = stmt.offset(skip).limit(limit)
        rows = list(self.db.execute(stmt).unique().scalars().all())
        return rows, int(total)


class DashboardRepository(BaseRepository[Analysis]):
    def metrics(self) -> dict:
        total = self.db.execute(select(func.count()).select_from(Analysis)).scalar_one()
        green = self.db.execute(
            select(func.count()).where(Analysis.overall_status == "VERDE")
        ).scalar_one()
        yellow = self.db.execute(
            select(func.count()).where(Analysis.overall_status == "AMARELO")
        ).scalar_one()
        red = self.db.execute(
            select(func.count()).where(Analysis.overall_status == "VERMELHO")
        ).scalar_one()
        avg_ms = self.db.execute(
            select(func.avg(Analysis.processing_time_ms)).where(
                Analysis.processing_time_ms.isnot(None)
            )
        ).scalar_one()
        avg_risk = self.db.execute(select(func.avg(Analysis.risk_score))).scalar_one()
        div_stmt = (
            select(
                AnalysisFieldResult.field_name,
                func.count(AnalysisFieldResult.id).label("cnt"),
            )
            .where(AnalysisFieldResult.status == "DIVERGENTE")
            .group_by(AnalysisFieldResult.field_name)
            .order_by(func.count(AnalysisFieldResult.id).desc())
            .limit(8)
        )
        divergent_fields = self.db.execute(div_stmt).all()
        crit_stmt = (
            select(
                AnalysisFieldResult.criticality,
                func.count(AnalysisFieldResult.id).label("cnt"),
            )
            .where(
                AnalysisFieldResult.status == "DIVERGENTE",
                AnalysisFieldResult.criticality.isnot(None),
            )
            .group_by(AnalysisFieldResult.criticality)
        )
        crit_dist = self.db.execute(crit_stmt).all()
        status_field_stmt = select(
            AnalysisFieldResult.status,
            func.count(AnalysisFieldResult.id).label("cnt"),
        ).group_by(AnalysisFieldResult.status)
        status_field_dist = self.db.execute(status_field_stmt).all()
        return {
            "total": int(total or 0),
            "verde": int(green or 0),
            "amarelo": int(yellow or 0),
            "vermelho": int(red or 0),
            "avg_ms": float(avg_ms) if avg_ms is not None else None,
            "avg_risk": float(avg_risk) if avg_risk is not None else None,
            "divergent_fields": [
                {"field": str(r[0]), "count": int(r[1])} for r in divergent_fields
            ],
            "criticality_distribution": [
                {"criticality": str(r[0]), "count": int(r[1])} for r in crit_dist
            ],
            "field_status_distribution": [
                {"status": str(r[0]), "count": int(r[1])} for r in status_field_dist
            ],
        }
