-- Add order lifecycle timestamps and refund tracking
alter table orders 
add column if not exists shipped_at timestamp with time zone,
add column if not exists delivered_at timestamp with time zone,
add column if not exists returned_at timestamp with time zone,
add column if not exists canceled_at timestamp with time zone,
add column if not exists refunded_at timestamp with time zone,
add column if not exists refunded_amount decimal(10,2),
add column if not exists razorpay_refund_id text;

-- Update status comments to include new workflows
comment on column orders.status is 'processing, shipped, delivered, cancelled, returned, refunded';
comment on column orders.payment_status is 'paid, pending, partially_paid, refunded';
