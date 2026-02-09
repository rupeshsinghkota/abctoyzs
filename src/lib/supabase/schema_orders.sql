-- Create orders table
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  total_amount decimal(10,2) not null,
  currency text default 'INR',
  status text default 'processing',
  payment_status text default 'pending',
  payment_method text default 'PREPAID',
  shipping_address_id uuid references addresses(id),
  razorpay_order_id text,
  shiprocket_order_id text,
  payment_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order items table
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id text not null,
  product_name text not null,
  product_image text,
  quantity integer default 1,
  price decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table orders enable row level security;
alter table order_items enable row level security;

-- Policies for orders
create policy "Users can view their own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own orders"
  on orders for insert
  with check (auth.uid() = user_id);

-- Policies for order items
-- Items are viewable if the parent order belongs to the user
create policy "Users can view their own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can insert items for their own orders"
  on order_items for insert
  with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- OPTIONAL: Insert mock data for testing (Commented out)
-- insert into orders (user_id, total_amount, status) values (auth.uid(), 299.99, 'delivered');
