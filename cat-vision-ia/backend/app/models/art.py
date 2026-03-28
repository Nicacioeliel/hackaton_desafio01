from datetime import datetime

from sqlalchemy import DateTime, Float, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Art(Base):
    __tablename__ = "arts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    numero_art: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    tipo_art: Mapped[str | None] = mapped_column(String(64), nullable=True)
    profissional_nome: Mapped[str | None] = mapped_column(String(512), nullable=True)
    titulo_profissional: Mapped[str | None] = mapped_column(String(256), nullable=True)
    rnp: Mapped[str | None] = mapped_column(String(64), nullable=True)
    registro: Mapped[str | None] = mapped_column(String(64), nullable=True)
    empresa_contratada: Mapped[str | None] = mapped_column(String(512), nullable=True)
    contratante_nome: Mapped[str | None] = mapped_column(String(512), nullable=True)
    contratante_cnpj: Mapped[str | None] = mapped_column(String(32), nullable=True)
    numero_contrato: Mapped[str | None] = mapped_column(String(128), nullable=True)
    valor_contrato: Mapped[float | None] = mapped_column(Float, nullable=True)
    data_inicio: Mapped[str | None] = mapped_column(String(32), nullable=True)
    data_fim: Mapped[str | None] = mapped_column(String(32), nullable=True)
    endereco: Mapped[str | None] = mapped_column(String(512), nullable=True)
    bairro: Mapped[str | None] = mapped_column(String(256), nullable=True)
    cidade: Mapped[str | None] = mapped_column(String(256), nullable=True)
    uf: Mapped[str | None] = mapped_column(String(8), nullable=True)
    cep: Mapped[str | None] = mapped_column(String(32), nullable=True)
    objeto: Mapped[str | None] = mapped_column(Text, nullable=True)
    observacoes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status_art: Mapped[str | None] = mapped_column(String(64), nullable=True)
    atividades_tecnicas: Mapped[str | None] = mapped_column(Text, nullable=True)
    quantitativos: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    analyses: Mapped[list["Analysis"]] = relationship(
        "Analysis", back_populates="art"
    )
