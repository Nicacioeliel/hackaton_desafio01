from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CnpjValidation(Base):
    __tablename__ = "cnpj_validations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.id"), unique=True)
    cnpj_consultado: Mapped[str] = mapped_column(String(32))
    razao_social_api: Mapped[str | None] = mapped_column(String(512), nullable=True)
    situacao_cadastral: Mapped[str | None] = mapped_column(String(128), nullable=True)
    raw_response_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32))

    analysis: Mapped["Analysis"] = relationship(
        "Analysis", back_populates="cnpj_validation"
    )
