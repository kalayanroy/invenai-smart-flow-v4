
-- Add purchase_order_id column to purchases table to support grouping items into orders
ALTER TABLE purchases ADD COLUMN purchase_order_id text;

-- Create an index for better query performance when filtering by purchase order ID
CREATE INDEX idx_purchases_purchase_order_id ON purchases(purchase_order_id);
