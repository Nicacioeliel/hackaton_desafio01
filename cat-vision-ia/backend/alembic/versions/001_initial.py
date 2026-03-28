"""initial tables

Revision ID: 001
Revises:
Create Date: 2026-03-28

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "arts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("numero_art", sa.String(64), nullable=False),
        sa.Column("tipo_art", sa.String(64), nullable=True),
        sa.Column("profissional_nome", sa.String(512), nullable=True),
        sa.Column("titulo_profissional", sa.String(256), nullable=True),
        sa.Column("rnp", sa.String(64), nullable=True),
        sa.Column("registro", sa.String(64), nullable=True),
        sa.Column("empresa_contratada", sa.String(512), nullable=True),
        sa.Column("contratante_nome", sa.String(512), nullable=True),
        sa.Column("contratante_cnpj", sa.String(32), nullable=True),
        sa.Column("numero_contrato", sa.String(128), nullable=True),
        sa.Column("valor_contrato", sa.Float(), nullable=True),
        sa.Column("data_inicio", sa.String(32), nullable=True),
        sa.Column("data_fim", sa.String(32), nullable=True),
        sa.Column("endereco", sa.String(512), nullable=True),
        sa.Column("bairro", sa.String(256), nullable=True),
        sa.Column("cidade", sa.String(256), nullable=True),
        sa.Column("uf", sa.String(8), nullable=True),
        sa.Column("cep", sa.String(32), nullable=True),
        sa.Column("objeto", sa.Text(), nullable=True),
        sa.Column("observacoes", sa.Text(), nullable=True),
        sa.Column("status_art", sa.String(64), nullable=True),
        sa.Column("atividades_tecnicas", sa.Text(), nullable=True),
        sa.Column("quantitativos", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_arts_numero_art", "arts", ["numero_art"], unique=True)

    op.create_table(
        "document_uploads",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("filename", sa.String(512), nullable=False),
        sa.Column("original_name", sa.String(512), nullable=False),
        sa.Column("mime_type", sa.String(128), nullable=False),
        sa.Column("file_path", sa.String(1024), nullable=False),
        sa.Column("sha256", sa.String(64), nullable=False),
        sa.Column("creator", sa.String(512), nullable=True),
        sa.Column("producer", sa.String(512), nullable=True),
        sa.Column("created_at_pdf", sa.String(64), nullable=True),
        sa.Column("modified_at_pdf", sa.String(64), nullable=True),
        sa.Column("suspicious_metadata_flag", sa.Boolean(), server_default="0"),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_document_uploads_sha256", "document_uploads", ["sha256"])

    op.create_table(
        "document_extractions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("upload_id", sa.Integer(), nullable=False),
        sa.Column("extracted_text", sa.Text(), nullable=False),
        sa.Column("structured_json", sa.Text(), nullable=True),
        sa.Column("extraction_confidence", sa.Float(), nullable=True),
        sa.Column("ocr_engine", sa.String(64), nullable=True),
        sa.Column("processing_time_ms", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.ForeignKeyConstraint(["upload_id"], ["document_uploads.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "analyses",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("art_id", sa.Integer(), nullable=False),
        sa.Column("upload_id", sa.Integer(), nullable=False),
        sa.Column("overall_status", sa.String(32), nullable=False),
        sa.Column("risk_score", sa.Float(), nullable=False),
        sa.Column("executive_summary", sa.Text(), nullable=True),
        sa.Column("suggested_feedback", sa.Text(), nullable=True),
        sa.Column("cnpj_status", sa.String(32), nullable=True),
        sa.Column("processing_time_ms", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.ForeignKeyConstraint(["art_id"], ["arts.id"]),
        sa.ForeignKeyConstraint(["upload_id"], ["document_uploads.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_analyses_created_at", "analyses", ["created_at"])

    op.create_table(
        "analysis_field_results",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("analysis_id", sa.Integer(), nullable=False),
        sa.Column("field_name", sa.String(128), nullable=False),
        sa.Column("art_value", sa.Text(), nullable=True),
        sa.Column("extracted_value", sa.Text(), nullable=True),
        sa.Column("normalized_art_value", sa.Text(), nullable=True),
        sa.Column("normalized_extracted_value", sa.Text(), nullable=True),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("justification", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["analysis_id"], ["analyses.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_analysis_field_results_field_name", "analysis_field_results", ["field_name"])

    op.create_table(
        "table_extractions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("analysis_id", sa.Integer(), nullable=False),
        sa.Column("table_name", sa.String(256), nullable=False),
        sa.Column("csv_content", sa.Text(), nullable=True),
        sa.Column("json_content", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["analysis_id"], ["analyses.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "cnpj_validations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("analysis_id", sa.Integer(), nullable=False),
        sa.Column("cnpj_consultado", sa.String(32), nullable=False),
        sa.Column("razao_social_api", sa.String(512), nullable=True),
        sa.Column("situacao_cadastral", sa.String(128), nullable=True),
        sa.Column("raw_response_json", sa.Text(), nullable=True),
        sa.Column("status", sa.String(32), nullable=False),
        sa.ForeignKeyConstraint(["analysis_id"], ["analyses.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("analysis_id"),
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("action", sa.String(128), nullable=False),
        sa.Column("entity_type", sa.String(64), nullable=True),
        sa.Column("entity_id", sa.Integer(), nullable=True),
        sa.Column("detail", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("cnpj_validations")
    op.drop_table("table_extractions")
    op.drop_table("analysis_field_results")
    op.drop_table("analyses")
    op.drop_table("document_extractions")
    op.drop_table("document_uploads")
    op.drop_table("arts")
