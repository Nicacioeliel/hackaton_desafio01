import logging
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_session
from app.core.config import get_settings
from app.models.audit_log import AuditLog
from app.models.document_upload import DocumentUpload
from app.repositories.upload_repository import UploadRepository
from app.services.file_service import save_upload
from app.services.hash_service import sha256_bytes
from app.services.pdf_metadata_service import read_pdf_metadata
from app.schemas.upload import UploadResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=UploadResponse)
async def create_upload(
    file: UploadFile = File(...),
    db: Session = Depends(get_session),
):
    settings = get_settings()
    data = await file.read()
    max_b = settings.max_upload_mb * 1024 * 1024
    if len(data) > max_b:
        raise HTTPException(413, detail="Arquivo excede o limite configurado")

    mime = file.content_type or "application/octet-stream"
    path, stored = save_upload(file.filename or "upload", data)
    digest = sha256_bytes(data)

    meta: dict = {}
    if mime == "application/pdf" or (file.filename or "").lower().endswith(".pdf"):
        meta = read_pdf_metadata(path)

    row = DocumentUpload(
        filename=stored,
        original_name=file.filename or stored,
        mime_type=mime,
        file_path=str(path.resolve()),
        sha256=digest,
        creator=meta.get("creator"),
        producer=meta.get("producer"),
        created_at_pdf=meta.get("created_at_pdf"),
        modified_at_pdf=meta.get("modified_at_pdf"),
        suspicious_metadata_flag=bool(meta.get("suspicious_metadata_flag")),
    )
    UploadRepository(db).create(row)
    db.add(
        AuditLog(
            action="UPLOAD_CREATE",
            entity_type="DocumentUpload",
            entity_id=row.id,
            detail=f"sha256={digest[:12]}...",
        )
    )
    db.commit()
    db.refresh(row)
    return UploadResponse.model_validate(row)


@router.get("/{upload_id}/file")
def download_upload_file(upload_id: int, db: Session = Depends(get_session)):
    """Serve o arquivo original para visualização no painel do analista (MVP)."""
    row = UploadRepository(db).get(upload_id)
    if not row:
        raise HTTPException(404, detail="Upload não encontrado")
    path = Path(row.file_path)
    if not path.is_file():
        raise HTTPException(404, detail="Arquivo não encontrado no disco")
    return FileResponse(
        path,
        media_type=row.mime_type or "application/octet-stream",
        filename=row.original_name,
    )
