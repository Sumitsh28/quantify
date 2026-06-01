"""Add audit trigger and materialized view

Revision ID: e0439e7f945c
Revises: 46ca9adfe3df
Create Date: 2026-06-01 10:30:38.188061

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e0439e7f945c'
down_revision: Union[str, Sequence[str], None] = '46ca9adfe3df'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Trigger for Audit Log
    op.execute("""
    CREATE OR REPLACE FUNCTION log_inventory_change()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.quantity_in_stock IS DISTINCT FROM OLD.quantity_in_stock THEN
            INSERT INTO inventory_audit_log (product_id, old_qty, new_qty, reason)
            VALUES (NEW.id, OLD.quantity_in_stock, NEW.quantity_in_stock, 'Trigger: Stock update');
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """)

    op.execute("""
    CREATE TRIGGER inventory_update_trigger
    AFTER UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION log_inventory_change();
    """)

    # Materialized View
    op.execute("""
    CREATE MATERIALIZED VIEW dashboard_metrics AS
    SELECT
        (SELECT COUNT(*) FROM products) AS total_products,
        (SELECT COUNT(*) FROM customers) AS total_customers,
        (SELECT COUNT(*) FROM orders) AS total_orders,
        (SELECT COUNT(*) FROM products WHERE quantity_in_stock < 10) AS low_stock_count;
    """)

def downgrade() -> None:
    op.execute("DROP MATERIALIZED VIEW IF EXISTS dashboard_metrics;")
    op.execute("DROP TRIGGER IF EXISTS inventory_update_trigger ON products;")
    op.execute("DROP FUNCTION IF EXISTS log_inventory_change();")
