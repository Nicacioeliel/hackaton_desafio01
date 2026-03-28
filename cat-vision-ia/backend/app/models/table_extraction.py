from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TableExtraction(Base):
    __tablename__ = "table_extractions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.id"))
    table_name: Mapped[str] = mapped_column(String(256))
    csv_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    json_content: Mapped[str | None] = mapped_column(Text, nullable=True)

    analysis: Mapped["Analysis"] = relationship("Analysis", back_populates="tables")
