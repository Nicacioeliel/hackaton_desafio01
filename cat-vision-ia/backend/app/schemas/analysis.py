from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel
from app.schemas.extraction import TableExtractionRead


class FieldResultRead(ORMModel):
    id: int
    field_name: str
    art_value: str | None = None
    extracted_value: str | None = None
    normalized_art_value: str | None = None
    normalized_extracted_value: str | None = None
    status: str
    confidence: float | None = None
    justification: str | None = None
    criticality: str | None = None
    category: str | None = None
    evidence_excerpt: str | None = None
    evidence_page: int | None = None
    score_impact: float | None = None
    normative_conformity: str | None = None
    regulatory_impact: str | None = None
    applied_rules: list[dict[str, Any]] = Field(default_factory=list)


class CnpjValidationRead(ORMModel):
    id: int
    cnpj_consultado: str
    razao_social_api: str | None = None
    situacao_cadastral: str | None = None
    status: str


class AnalysisCreateRequest(BaseModel):
    upload_id: int
    art_id: int


class AnalysisListItem(ORMModel):
    id: int
    art_id: int
    upload_id: int
    overall_status: str
    risk_score: float
    cnpj_status: str | None = None
    created_at: datetime | None = None
    art_numero: str | None = None
    upload_original_name: str | None = None
    summary_hint: str | None = None
    normative_score: float | None = None
    normative_status: str | None = None


class AnalysisDetailRead(ORMModel):
    id: int
    art_id: int
    upload_id: int
    upload_mime_type: str | None = None
    upload_original_name: str | None = None
    upload_suspicious_metadata: bool | None = None
    overall_status: str
    risk_score: float
    executive_summary: str | None = None
    suggested_feedback: str | None = None
    cnpj_status: str | None = None
    processing_time_ms: int | None = None
    created_at: datetime | None = None
    field_results: list[FieldResultRead] = Field(default_factory=list)
    tables: list[TableExtractionRead] = Field(default_factory=list)
    cnpj_validation: CnpjValidationRead | None = None
    technical_opinion: str | None = None
    score_breakdown: dict[str, Any] | None = None
    review_status: str | None = None
    normative_score: float | None = None
    normative_status: str | None = None
    normative_breakdown: dict[str, Any] | None = None
    normative_rules: list[dict[str, Any]] = Field(default_factory=list)


class AnalysisReviewUpdate(BaseModel):
    review_status: str


class ReportRead(BaseModel):
    analysis_id: int
    overall_status: str
    risk_score: float
    executive_summary: str
    suggested_feedback: str
    cnpj_status: str | None
    compatibles: list[str]
    ausentes: list[str]
    divergentes: list[str]
    metadata_alerts: list[str]
    field_results: list[dict[str, Any]]


class CnpjValidateRequest(BaseModel):
    cnpj: str


class CnpjValidateResponse(BaseModel):
    cnpj: str
    razao_social: str | None = None
    situacao_cadastral: str | None = None
    status: str
    message: str | None = None
