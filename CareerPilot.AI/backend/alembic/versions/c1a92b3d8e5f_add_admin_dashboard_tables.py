"""add_admin_dashboard_tables

Revision ID: c1a92b3d8e5f
Revises: 8f2657c8f410
Create Date: 2026-08-13 18:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c1a92b3d8e5f'
down_revision: Union[str, None] = '8f2657c8f410'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    
    # 1. Add role & is_admin to users if not present
    user_cols = [c['name'] for c in insp.get_columns('users')]
    if 'role' not in user_cols:
        op.add_column('users', sa.Column('role', sa.String(), server_default='user', nullable=False))
        op.create_index('ix_users_role', 'users', ['role'])
    if 'is_admin' not in user_cols:
        op.add_column('users', sa.Column('is_admin', sa.Boolean(), server_default='false', nullable=False))
        op.create_index('ix_users_is_admin', 'users', ['is_admin'])

    tables = insp.get_table_names()
    
    # 2. Create admin_audit_logs table
    if 'admin_audit_logs' not in tables:
        op.create_table(
            'admin_audit_logs',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('admin_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
            sa.Column('action', sa.String(), nullable=False),
            sa.Column('target_type', sa.String(), nullable=False),
            sa.Column('target_id', sa.String(), nullable=True),
            sa.Column('before_state', sa.JSON(), nullable=True),
            sa.Column('after_state', sa.JSON(), nullable=True),
            sa.Column('ip_address', sa.String(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        )
        op.create_index('ix_admin_audit_logs_admin_user_id', 'admin_audit_logs', ['admin_user_id'])
        op.create_index('ix_admin_audit_logs_created_at', 'admin_audit_logs', ['created_at'])
        op.create_index('idx_admin_audit_user_created', 'admin_audit_logs', ['admin_user_id', 'created_at'])

    # 3. Create job_descriptions table
    if 'job_descriptions' not in tables:
        op.create_table(
            'job_descriptions',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('title', sa.String(), nullable=False),
            sa.Column('company', sa.String(), nullable=True),
            sa.Column('raw_text', sa.Text(), nullable=False),
            sa.Column('required_skills', sa.JSON(), nullable=True),
            sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
            sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        )

    # 4. Create course_catalog table
    if 'course_catalog' not in tables:
        op.create_table(
            'course_catalog',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('title', sa.String(), nullable=False),
            sa.Column('provider', sa.String(), nullable=False),
            sa.Column('url', sa.String(), nullable=True),
            sa.Column('skill_tags', sa.JSON(), nullable=True),
            sa.Column('category', sa.String(), server_default='General', nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        )

    # 5. Create user_feedback table
    if 'user_feedback' not in tables:
        op.create_table(
            'user_feedback',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
            sa.Column('category', sa.String(), server_default='general', nullable=False),
            sa.Column('rating', sa.Integer(), nullable=True),
            sa.Column('message', sa.Text(), nullable=False),
            sa.Column('status', sa.String(), server_default='new', nullable=False),
            sa.Column('admin_response', sa.Text(), nullable=True),
            sa.Column('resolved_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        )
        op.create_index('ix_user_feedback_status', 'user_feedback', ['status'])
        op.create_index('idx_feedback_status_created', 'user_feedback', ['status', 'created_at'])

    # 6. Create system_alerts table
    if 'system_alerts' not in tables:
        op.create_table(
            'system_alerts',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('title', sa.String(), nullable=False),
            sa.Column('message', sa.Text(), nullable=False),
            sa.Column('severity', sa.String(), server_default='info', nullable=False),
            sa.Column('is_broadcast', sa.Boolean(), server_default='true', nullable=False),
            sa.Column('target_role', sa.String(), nullable=True),
            sa.Column('target_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
            sa.Column('starts_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('ends_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        )
    else:
        alert_cols = [c['name'] for c in insp.get_columns('system_alerts')]
        if 'target_user_id' not in alert_cols:
            op.add_column('system_alerts', sa.Column('target_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True))

    # 7. Create admin_export_jobs table
    if 'admin_export_jobs' not in tables:
        op.create_table(
            'admin_export_jobs',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('admin_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
            sa.Column('report_type', sa.String(), nullable=False),
            sa.Column('format', sa.String(), server_default='csv', nullable=False),
            sa.Column('status', sa.String(), server_default='pending', nullable=False),
            sa.Column('file_path', sa.String(), nullable=True),
            sa.Column('error_message', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    op.drop_table('admin_export_jobs')
    op.drop_table('system_alerts')
    op.drop_table('user_feedback')
    op.drop_table('course_catalog')
    op.drop_table('job_descriptions')
    op.drop_table('admin_audit_logs')
    op.drop_index('ix_users_is_admin', table_name='users')
    op.drop_index('ix_users_role', table_name='users')
    op.drop_column('users', 'is_admin')
    op.drop_column('users', 'role')
