"""explainability: field criticality, evidence, opinion, review

Revision ID: 002
Revises: 001
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_names(connection, table: str) -> set[str]:
    insp = inspect(connection)
    return {c["name"] for c in insp.get_columns(table)}


def upgrade() -> None:
    """Adiciona colunas apenas se ainda não existirem (upgrade parcial / DB fora de sync)."""
    conn = op.get_bind()
    afr = _column_names(conn, "analysis_field_results")
    if "criticality" not in afr:
        op.add_column(
            "analysis_field_results",
            sa.Column("criticality", sa.String(16), nullable=True),
        )
    if "category" not in afr:
        op.add_column(
            "analysis_field_results",
            sa.Column("category", sa.String(64), nullable=True),
        )
    if "evidence_excerpt" not in afr:
        op.add_column(
            "analysis_field_results",
            sa.Column("evidence_excerpt", sa.Text(), nullable=True),
        )
    if "evidence_page" not in afr:
        op.add_column(
            "analysis_field_results",
            sa.Column("evidence_page", sa.Integer(), nullable=True),
        )
    if "score_impact" not in afr:
        op.add_column(
            "analysis_field_results",
            sa.Column("score_impact", sa.Float(), nullable=True),
        )

    an = _column_names(conn, "analyses")
    if "technical_opinion" not in an:
        op.add_column("analyses", sa.Column("technical_opinion", sa.Text(), nullable=True))
    if "score_breakdown_json" not in an:
        op.add_column(
            "analyses",
            sa.Column("score_breakdown_json", sa.Text(), nullable=True),
        )
    if "review_status" not in an:
        op.add_column(
            "analyses",
            sa.Column("review_status", sa.String(32), nullable=True),
        )


def downgrade() -> None:
    conn = op.get_bind()
    an = _column_names(conn, "analyses")
    if "review_status" in an:
        op.drop_column("analyses", "review_status")
    if "score_breakdown_json" in an:
        op.drop_column("analyses", "score_breakdown_json")
    if "technical_opinion" in an:
        op.drop_column("analyses", "technical_opinion")

    afr = _column_names(conn, "analysis_field_results")
    if "score_impact" in afr:
        op.drop_column("analysis_field_results", "score_impact")
    if "evidence_page" in afr:
        op.drop_column("analysis_field_results", "evidence_page")
    if "evidence_excerpt" in afr:
        op.drop_column("analysis_field_results", "evidence_excerpt")
    if "category" in afr:
        op.drop_column("analysis_field_results", "category")
    if "criticality" in afr:
        op.drop_column("analysis_field_results", "criticality")
