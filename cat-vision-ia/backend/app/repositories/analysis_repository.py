from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.analysis import Analysis
from app.models.analysis_field_result import AnalysisFieldResult
from app.models.art import Art
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
    ) -> tuple[list[Analysis], int]:
        stmt = select(Analysis).options(
            joinedload(Analysis.art), joinedload(Analysis.upload)
        )
        count_stmt = select(func.count()).select_from(Analysis)
        if status:
            stmt = stmt.where(Analysis.overall_status == status)
            count_stmt = count_stmt.where(Analysis.overall_status == status)
        if art_query:
            aq = f"%{art_query.strip()}%"
            stmt = stmt.join(Art).where(Art.numero_art.ilike(aq))
            count_stmt = select(func.count()).select_from(Analysis).join(Art).where(
                Art.numero_art.ilike(aq)
            )
        total = self.db.execute(count_stmt).scalar_one()
        stmt = stmt.order_by(Analysis.created_at.desc()).offset(skip).limit(limit)
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
        return {
            "total": int(total or 0),
            "verde": int(green or 0),
            "amarelo": int(yellow or 0),
            "vermelho": int(red or 0),
            "avg_ms": float(avg_ms) if avg_ms is not None else None,
            "divergent_fields": [
                {"field": str(r[0]), "count": int(r[1])} for r in divergent_fields
            ],
        }
