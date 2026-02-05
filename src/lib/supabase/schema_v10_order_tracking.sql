-- Add new columns to orders table for fulfillment and tracking
alter table orders 
add column if not exists payment_status text default 'pending',
add column if not exists tracking_id text,
add column if not exists shipping_carrier text,
add column if not exists admin_notes text,
add column if not exists customer_notes text;

-- Add comment for clarity
comment on column orders.payment_status is 'paid, pending, refunded';
comment on column orders.status is 'processing, shipped, delivered, cancelled';
