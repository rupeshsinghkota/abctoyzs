-- Contact Inquiries Table
create table if not exists contact_inquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text, -- WhatsApp number for leads
  subject text not null,
  message text not null,
  status text default 'pending', -- pending, contacted, resolved
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table contact_inquiries enable row level security;

-- Policies
create policy "Anyone can insert contact inquiries"
  on contact_inquiries for insert
  with check (true);

create policy "Only admins can view contact inquiries"
  on contact_inquiries for select
  using (exists (select 1 from admins where user_id = auth.uid()));

create policy "Only admins can update contact inquiries"
  on contact_inquiries for update
  using (exists (select 1 from admins where user_id = auth.uid()));

-- Trigger for updated_at
create trigger update_contact_inquiries_updated_at before update on contact_inquiries
  for each row execute procedure update_updated_at_column();
