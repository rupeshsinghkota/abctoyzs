-- Add Shiprocket shipment management columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS awb TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_id INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_scheduled_date TIMESTAMP;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_shipment_id ON orders(shipment_id);
CREATE INDEX IF NOT EXISTS idx_orders_awb ON orders(awb);
