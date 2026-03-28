"""Normative compliance fields on analyses and field results.

Revision ID: 003
Revises: 002
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _cols(conn, table: str) -> set[str]:
    return {c["name"] for c in inspect(conn).get_columns(table)}


def upgrade() -> None:
    conn = op.get_bind()
    an = _cols(conn, "analyses")
    if "normative_score" not in an:
        op.add_column(
            "analyses", sa.Column("normative_score", sa.Float(), nullable=True)
        )
    if "normative_status" not in an:
        op.add_column(
            "analyses", sa.Column("normative_status", sa.String(32), nullable=True)
        )
    if "normative_breakdown_json" not in an:
        op.add_column(
            "analyses", sa.Column("normative_breakdown_json", sa.Text(), nullable=True)
        )
    if "normative_results_json" not in an:
        op.add_column(
            "analyses", sa.Column("normative_results_json", sa.Text(), nullable=True)
        )

    afr = _cols(conn, "analysis_field_results")
    if "normative_conformity" not in afr:
        op.add_column(
            "analysis_field_results",
            sa.Column("normative_conformity", sa.String(16), nullable=True),
        )
    if "regulatory_impact" not in afr:
        op.add_column(
            "analysis_field_results",
            sa.Column("regulatory_impact", sa.Text(), nullable=True),
        )
    if "applied_rules_json" not in afr:
        op.add_column(
            "analysis_field_results",
            sa.Column("applied_rules_json", sa.Text(), nullable=True),
        )


def downgrade() -> None:
    conn = op.get_bind()
    afr = _cols(conn, "analysis_field_results")
    if "applied_rules_json" in afr:
        op.drop_column("analysis_field_results", "applied_rules_json")
    if "regulatory_impact" in afr:
        op.drop_column("analysis_field_results", "regulatory_impact")
    if "normative_conformity" in afr:
        op.drop_column("analysis_field_results", "normative_conformity")

    an = _cols(conn, "analyses")
    if "normative_results_json" in an:
        op.drop_column("analyses", "normative_results_json")
    if "normative_breakdown_json" in an:
        op.drop_column("analyses", "normative_breakdown_json")
    if "normative_status" in an:
        op.drop_column("analyses", "normative_status")
    if "normative_score" in an:
        op.drop_column("analyses", "normative_score")
