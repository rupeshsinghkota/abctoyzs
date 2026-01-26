-- Admin Users Table
create table if not exists admins (
  user_id uuid references auth.users(id) primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products Table
create table if not exists products (
  id serial primary key,
  slug text unique not null,
  name text not null,
  description text,
  base_price decimal(10,2) not null,
  category text not null, -- cars, jeeps, bikes, etc.
  subcategory text,
  images text[] default '{}',
  specs jsonb default '{}', -- {battery, mobile_app, max_load, speed}
  voltage text, -- 12V, 24V, 36V, 48V
  age_group text, -- 1-3, 3-6, 6-10, 10+
  stock integer default 0,
  rating decimal(2,1) default 0,
  review_count integer default 0,
  is_new boolean default false,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table admins enable row level security;
alter table products enable row level security;

-- Admin Policies
create policy "Admins are viewable by admins only"
  on admins for select
  using (exists (select 1 from admins where user_id = auth.uid()));

-- Product Policies
create policy "Products are viewable by everyone"
  on products for select
  using (true);

create policy "Only admins can insert products"
  on products for insert
  with check (exists (select 1 from admins where user_id = auth.uid()));

create policy "Only admins can update products"
  on products for update
  using (exists (select 1 from admins where user_id = auth.uid()));

create policy "Only admins can delete products"
  on products for delete
  using (exists (select 1 from admins where user_id = auth.uid()));

-- Function to automatically update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_products_updated_at before update on products
  for each row execute procedure update_updated_at_column();

-- IMPORTANT: After running this schema, insert your user as admin:
-- insert into admins (user_id) values ('YOUR_USER_ID_FROM_AUTH_USERS');
-- You can get your user_id by running: select id from auth.users where email = 'your@email.com';
