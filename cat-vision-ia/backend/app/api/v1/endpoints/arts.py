from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_session
from app.repositories.art_repository import ArtRepository
from app.schemas.art import ArtListResponse, ArtRead

router = APIRouter()


@router.get("", response_model=ArtListResponse)
def list_arts(
    db: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 200,
    q: str | None = Query(None, description="Busca em número ART, profissional, contratante, cidade"),
):
    repo = ArtRepository(db)
    rows, total = repo.list_all(skip=skip, limit=limit, q=q)
    return ArtListResponse(items=[ArtRead.model_validate(r) for r in rows], total=total)


@router.get("/{art_id}", response_model=ArtRead)
def get_art(art_id: int, db: Session = Depends(get_session)):
    repo = ArtRepository(db)
    row = repo.get(art_id)
    if not row:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="ART não encontrada")
    return ArtRead.model_validate(row)
