from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.art import Art
from app.repositories.base import BaseRepository


class ArtRepository(BaseRepository[Art]):
    def get(self, art_id: int) -> Art | None:
        return self.db.get(Art, art_id)

    def get_by_numero(self, numero: str) -> Art | None:
        stmt = select(Art).where(Art.numero_art == numero.strip())
        return self.db.execute(stmt).scalar_one_or_none()

    def list_all(self, skip: int = 0, limit: int = 200, q: str | None = None) -> tuple[list[Art], int]:
        stmt = select(Art)
        count_stmt = select(func.count()).select_from(Art)
        if q:
            like = f"%{q.strip()}%"
            filt = or_(
                Art.numero_art.ilike(like),
                Art.profissional_nome.ilike(like),
                Art.contratante_nome.ilike(like),
                Art.cidade.ilike(like),
            )
            stmt = stmt.where(filt)
            count_stmt = select(func.count()).select_from(Art).where(filt)
        total = self.db.execute(count_stmt).scalar_one()
        stmt = stmt.order_by(Art.numero_art).offset(skip).limit(limit)
        rows = list(self.db.execute(stmt).scalars().all())
        return rows, int(total)
