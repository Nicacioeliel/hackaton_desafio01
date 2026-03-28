from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class DocumentUpload(Base):
    __tablename__ = "document_uploads"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    filename: Mapped[str] = mapped_column(String(512))
    original_name: Mapped[str] = mapped_column(String(512))
    mime_type: Mapped[str] = mapped_column(String(128))
    file_path: Mapped[str] = mapped_column(String(1024))
    sha256: Mapped[str] = mapped_column(String(64), index=True)
    creator: Mapped[str | None] = mapped_column(String(512), nullable=True)
    producer: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at_pdf: Mapped[str | None] = mapped_column(String(64), nullable=True)
    modified_at_pdf: Mapped[str | None] = mapped_column(String(64), nullable=True)
    suspicious_metadata_flag: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="0"
    )
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    extractions: Mapped[list["DocumentExtraction"]] = relationship(
        "DocumentExtraction", back_populates="upload"
    )
    analyses: Mapped[list["Analysis"]] = relationship(
        "Analysis", back_populates="upload"
    )
