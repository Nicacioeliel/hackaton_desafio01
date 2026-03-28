from app.schemas.common import ORMModel


class TableExtractionRead(ORMModel):
    id: int
    table_name: str
    csv_content: str | None = None
    json_content: str | None = None


class DocumentExtractionRead(ORMModel):
    id: int
    upload_id: int
    extracted_text: str
    structured_json: str | None = None
    extraction_confidence: float | None = None
    ocr_engine: str | None = None
    processing_time_ms: int | None = None
