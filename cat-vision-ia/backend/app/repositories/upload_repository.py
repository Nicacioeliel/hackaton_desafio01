from sqlalchemy.orm import Session

from app.models.document_upload import DocumentUpload
from app.repositories.base import BaseRepository


class UploadRepository(BaseRepository[DocumentUpload]):
    def get(self, upload_id: int) -> DocumentUpload | None:
        return self.db.get(DocumentUpload, upload_id)

    def create(self, row: DocumentUpload) -> DocumentUpload:
        self.db.add(row)
        self.db.flush()
        return row
