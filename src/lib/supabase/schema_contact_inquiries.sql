-- Contact Inquiries Table
create table if not exists contact_inquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text default 'pending', -- pending, contacted, resolved
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add phone column if it doesn't exist (for WhatsApp leads)
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='contact_inquiries' and column_name='phone') then
    alter table contact_inquiries add column phone text;
  end if;
end $$;

-- Enable RLS
alter table contact_inquiries enable row level security;

-- Policies (Drop and Recreate to avoid "already exists" errors)
drop policy if exists "Anyone can insert contact inquiries" on contact_inquiries;
create policy "Anyone can insert contact inquiries"
  on contact_inquiries for insert
  with check (true);

drop policy if exists "Only admins can view contact inquiries" on contact_inquiries;
create policy "Only admins can view contact inquiries"
  on contact_inquiries for select
  using (exists (select 1 from admins where user_id = auth.uid()));

drop policy if exists "Only admins can update contact inquiries" on contact_inquiries;
create policy "Only admins can update contact inquiries"
  on contact_inquiries for update
  using (exists (select 1 from admins where user_id = auth.uid()));

-- Trigger for updated_at
drop trigger if exists update_contact_inquiries_updated_at on contact_inquiries;
create trigger update_contact_inquiries_updated_at before update on contact_inquiries
  for each row execute procedure update_updated_at_column();
