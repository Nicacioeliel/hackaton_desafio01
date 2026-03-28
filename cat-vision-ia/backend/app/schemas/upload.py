from datetime import datetime

from app.schemas.common import ORMModel


class UploadResponse(ORMModel):
    id: int
    filename: str
    original_name: str
    mime_type: str
    sha256: str
    creator: str | None = None
    producer: str | None = None
    created_at_pdf: str | None = None
    modified_at_pdf: str | None = None
    suspicious_metadata_flag: bool = False
    uploaded_at: datetime | None = None
