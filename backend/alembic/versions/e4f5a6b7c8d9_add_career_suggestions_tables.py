"""add_career_suggestions_tables

Revision ID: e4f5a6b7c8d9
Revises: c1a92b3d8e5f
Create Date: 2026-08-17 21:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e4f5a6b7c8d9'
down_revision: Union[str, None] = 'c1a92b3d8e5f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    tables = insp.get_table_names()

    # 1. Create career_suggestions table
    if 'career_suggestions' not in tables:
        op.create_table(
            'career_suggestions',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
            sa.Column('resume_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('resumes.id'), nullable=True),
            sa.Column('preferences', sa.JSON(), nullable=True),
            sa.Column('summary', sa.String(), nullable=True),
            sa.Column('candidate_strengths', sa.JSON(), nullable=True),
            sa.Column('recommended_certifications', sa.JSON(), nullable=True),
            sa.Column('engine_version', sa.String(), server_default='career-v1', nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        )
        op.create_index('ix_career_suggestions_user_id', 'career_suggestions', ['user_id'])
        op.create_index('ix_career_suggestions_resume_id', 'career_suggestions', ['resume_id'])

    # 2. Create career_suggestion_items table
    if 'career_suggestion_items' not in tables:
        op.create_table(
            'career_suggestion_items',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('suggestion_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('career_suggestions.id'), nullable=False),
            sa.Column('career_id', sa.String(), nullable=False),
            sa.Column('career_title', sa.String(), nullable=False),
            sa.Column('category', sa.String(), nullable=False),
            sa.Column('match_score', sa.Float(), nullable=False),
            sa.Column('match_level', sa.String(), nullable=False),
            sa.Column('matching_skills', sa.JSON(), nullable=False),
            sa.Column('missing_skills', sa.JSON(), nullable=False),
            sa.Column('transition_difficulty', sa.String(), nullable=False),
            sa.Column('why_fit', sa.String(), nullable=True),
            sa.Column('growth_trajectory', sa.String(), nullable=True),
            sa.Column('recommended_steps', sa.JSON(), nullable=True),
            sa.Column('salary_snapshot', sa.JSON(), nullable=True),
            sa.Column('market_demand_snapshot', sa.String(), nullable=True),
            sa.Column('is_alternative', sa.String(), server_default='false', nullable=False),
        )
        op.create_index('ix_career_suggestion_items_suggestion_id', 'career_suggestion_items', ['suggestion_id'])
        op.create_index('ix_career_suggestion_items_career_id', 'career_suggestion_items', ['career_id'])


def downgrade() -> None:
    op.drop_table('career_suggestion_items')
    op.drop_table('career_suggestions')
