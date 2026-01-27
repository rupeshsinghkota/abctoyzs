-- Add attributes column to products (stores definitions like Color: [Red, Blue])
alter table products add column if not exists attributes jsonb default '[]';

-- Create product_variants table
create table if not exists product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null, -- FIXED: Changed to uuid
  name text not null, -- e.g. "Red - 12V"
  attributes jsonb not null default '{}', -- e.g. {"Color": "Red", "Voltage": "12V"}
  price decimal(10,2) not null,
  stock integer default 0,
  sku text,
  image text, -- specific image for this variant
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table product_variants enable row level security;

-- Policies for product_variants (public read, admin write)
create policy "Public can view product variants"
  on product_variants for select
  using (true);

create policy "Admins can insert product variants"
  on product_variants for insert
  with check (
    exists (
      select 1 from admins
      where admins.user_id = auth.uid()
    )
  );

create policy "Admins can update product variants"
  on product_variants for update
  using (
    exists (
      select 1 from admins
      where admins.user_id = auth.uid()
    )
  );

create policy "Admins can delete product variants"
  on product_variants for delete
  using (
    exists (
      select 1 from admins
      where admins.user_id = auth.uid()
    )
  );
