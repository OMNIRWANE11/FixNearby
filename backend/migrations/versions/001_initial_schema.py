"""Initial FixNearby complete schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-06 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('phone', sa.String(length=25), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='customer'),
        sa.Column('saved_address', sa.Text(), nullable=True),
        sa.Column('saved_latitude', sa.Float(), nullable=True),
        sa.Column('saved_longitude', sa.Float(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('idx_users_email', 'users', ['email'], unique=True)

    # 2. service_categories
    op.create_table(
        'service_categories',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('icon', sa.String(length=20), nullable=False),
        sa.Column('image_url', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code')
    )

    # 3. problem_types
    op.create_table(
        'problem_types',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=80), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('urgency_default', sa.String(length=20), nullable=False, server_default='HIGH'),
        sa.Column('safety_instructions', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['service_categories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('category_id', 'code', name='uq_category_problem')
    )

    # 4. technicians
    op.create_table(
        'technicians',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('badge_code', sa.String(length=10), nullable=False),
        sa.Column('trade', sa.String(length=100), nullable=False),
        sa.Column('experience_years', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('phone', sa.String(length=25), nullable=False),
        sa.Column('whatsapp_number', sa.String(length=25), nullable=False),
        sa.Column('rating', sa.Float(), nullable=False, server_default='5.0'),
        sa.Column('jobs_completed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('operating_radius_km', sa.Float(), nullable=False, server_default='15.0'),
        sa.Column('is_on_duty', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('profile_image_url', sa.String(length=255), nullable=True),
        sa.Column('specialties', sa.Text(), nullable=True),
        sa.Column('current_latitude', sa.Float(), nullable=False),
        sa.Column('current_longitude', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['service_categories.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('badge_code'),
        sa.UniqueConstraint('user_id')
    )

    # 5. credentials
    op.create_table(
        'credentials',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('technician_id', sa.String(length=36), nullable=False),
        sa.Column('legal_name', sa.String(length=150), nullable=False),
        sa.Column('identity_verified', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('identity_document_type', sa.String(length=50), nullable=True),
        sa.Column('license_number', sa.String(length=100), nullable=True),
        sa.Column('trade_license_name', sa.String(length=150), nullable=True),
        sa.Column('license_verified', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('license_valid_until', sa.Date(), nullable=True),
        sa.Column('address_verified', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('residential_address', sa.Text(), nullable=True),
        sa.Column('police_verified', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('police_clearance_number', sa.String(length=100), nullable=True),
        sa.Column('police_check_date', sa.Date(), nullable=True),
        sa.Column('audit_notes', sa.Text(), nullable=True),
        sa.Column('failure_reasons', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['technician_id'], ['technicians.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('technician_id')
    )

    # 6. emergency_requests
    op.create_table(
        'emergency_requests',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('problem_type_id', sa.Integer(), nullable=True),
        sa.Column('problem_custom_desc', sa.Text(), nullable=True),
        sa.Column('severity', sa.String(length=20), nullable=False, server_default='HIGH'),
        sa.Column('customer_name', sa.String(length=150), nullable=False),
        sa.Column('customer_phone', sa.String(length=25), nullable=False),
        sa.Column('customer_address', sa.Text(), nullable=True),
        sa.Column('customer_latitude', sa.Float(), nullable=False),
        sa.Column('customer_longitude', sa.Float(), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='PENDING'),
        sa.Column('assigned_technician_id', sa.String(length=36), nullable=True),
        sa.Column('distance_km', sa.Float(), nullable=True),
        sa.Column('estimated_eta_minutes', sa.Integer(), nullable=True),
        sa.Column('route_polyline', sa.Text(), nullable=True),
        sa.Column('cancellation_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['assigned_technician_id'], ['technicians.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['category_id'], ['service_categories.id']),
        sa.ForeignKeyConstraint(['problem_type_id'], ['problem_types.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    # 7. location_logs
    op.create_table(
        'location_logs',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('technician_id', sa.String(length=36), nullable=False),
        sa.Column('request_id', sa.String(length=36), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('speed_kmh', sa.Float(), nullable=True),
        sa.Column('heading', sa.Float(), nullable=True),
        sa.Column('recorded_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['request_id'], ['emergency_requests.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['technician_id'], ['technicians.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 8. reviews
    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('request_id', sa.String(length=36), nullable=False),
        sa.Column('technician_id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('customer_name', sa.String(length=150), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['request_id'], ['emergency_requests.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['technician_id'], ['technicians.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('request_id')
    )

def downgrade():
    op.drop_table('reviews')
    op.drop_table('location_logs')
    op.drop_table('emergency_requests')
    op.drop_table('credentials')
    op.drop_table('technicians')
    op.drop_table('problem_types')
    op.drop_table('service_categories')
    op.drop_table('users')

