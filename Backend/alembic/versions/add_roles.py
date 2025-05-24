"""add roles

Revision ID: add_roles
Revises: 
Create Date: 2024-03-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_roles'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create enum type
    role_enum = postgresql.ENUM('ADMIN', 'MODERATOR', 'NORMAL', name='role')
    role_enum.create(op.get_bind())
    
    # Add role column as nullable first
    op.add_column('users', sa.Column('role', sa.Enum('ADMIN', 'MODERATOR', 'NORMAL', name='role'), nullable=True))
    
    # Update existing records with default value
    op.execute("UPDATE users SET role = 'NORMAL' WHERE role IS NULL")
    
    # Make the column NOT NULL
    op.alter_column('users', 'role',
               existing_type=sa.Enum('ADMIN', 'MODERATOR', 'NORMAL', name='role'),
               nullable=False)

def downgrade():
    # Remove the role column
    op.drop_column('users', 'role')
    
    # Drop the enum type
    role_enum = postgresql.ENUM('ADMIN', 'MODERATOR', 'NORMAL', name='role')
    role_enum.drop(op.get_bind())