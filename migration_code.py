def upgrade() -> None:
    # Create enum type for ProductStatus if it doesn't exist
    op.execute("CREATE TYPE IF NOT EXISTS productstatus AS ENUM ('PENDING', 'ACCEPTED')")
    
    # Add status column with default value 'PENDING'
    op.add_column('products', sa.Column('status', sa.Enum('PENDING', 'ACCEPTED', name='productstatus'), 
                                       nullable=False, server_default=sa.text("'PENDING'::productstatus")))


def downgrade() -> None:
    # Remove the status column
    op.drop_column('products', 'status')
    
    # Drop the enum type
    op.execute("DROP TYPE IF EXISTS productstatus")
