"""link patient cases to users

Revision ID: c9b1f8d2a7e1
Revises: fe644d4865c3
Create Date: 2026-04-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c9b1f8d2a7e1"
down_revision: Union[str, Sequence[str], None] = "fe644d4865c3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("patient_cases", sa.Column("patient_email", sa.String(length=255), nullable=True))
    op.add_column("patient_cases", sa.Column("patient_user_id", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_patient_cases_patient_email"), "patient_cases", ["patient_email"], unique=False)
    op.create_index(op.f("ix_patient_cases_patient_user_id"), "patient_cases", ["patient_user_id"], unique=False)
    op.create_foreign_key(
        "fk_patient_cases_patient_user_id_users",
        "patient_cases",
        "users",
        ["patient_user_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_patient_cases_patient_user_id_users", "patient_cases", type_="foreignkey")
    op.drop_index(op.f("ix_patient_cases_patient_user_id"), table_name="patient_cases")
    op.drop_index(op.f("ix_patient_cases_patient_email"), table_name="patient_cases")
    op.drop_column("patient_cases", "patient_user_id")
    op.drop_column("patient_cases", "patient_email")
