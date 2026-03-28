from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    art_id: Mapped[int] = mapped_column(ForeignKey("arts.id"))
    upload_id: Mapped[int] = mapped_column(ForeignKey("document_uploads.id"))
    overall_status: Mapped[str] = mapped_column(String(32), default="AMARELO")
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    executive_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    suggested_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    cnpj_status: Mapped[str | None] = mapped_column(String(32), nullable=True)
    processing_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    technical_opinion: Mapped[str | None] = mapped_column(Text, nullable=True)
    score_breakdown_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    review_status: Mapped[str | None] = mapped_column(String(32), nullable=True)
    normative_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    normative_status: Mapped[str | None] = mapped_column(String(32), nullable=True)
    normative_breakdown_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    normative_results_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    art: Mapped["Art"] = relationship("Art", back_populates="analyses")
    upload: Mapped["DocumentUpload"] = relationship(
        "DocumentUpload", back_populates="analyses"
    )
    field_results: Mapped[list["AnalysisFieldResult"]] = relationship(
        "AnalysisFieldResult",
        back_populates="analysis",
        cascade="all, delete-orphan",
    )
    tables: Mapped[list["TableExtraction"]] = relationship(
        "TableExtraction",
        back_populates="analysis",
        cascade="all, delete-orphan",
    )
    cnpj_validation: Mapped["CnpjValidation | None"] = relationship(
        "CnpjValidation",
        back_populates="analysis",
        uselist=False,
        cascade="all, delete-orphan",
    )
