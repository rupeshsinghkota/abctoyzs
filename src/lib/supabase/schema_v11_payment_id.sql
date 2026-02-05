-- Critical: Add payment_id to track Razorpay Reference IDs
alter table orders 
add column if not exists payment_id text;

comment on column orders.payment_id is 'External payment provider Reference ID (e.g. pay_Hq7...)';
