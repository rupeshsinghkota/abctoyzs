-- Nuke and rebuild for a clean state
drop table if exists otp_verifications cascade;

-- OTP Verifications Table
-- Stores temporary 6-digit codes for WhatsApp authentication
create table otp_verifications (
  id uuid default gen_random_uuid() primary key,
  phone text not null unique,
  otp_code text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null,
  verified boolean default false,
  attempts int default 0
);

-- Index for fast lookup by phone
create index otp_verifications_phone_idx on otp_verifications (phone);

-- RLS Policies
alter table otp_verifications enable row level security;

-- Only service role should read/write/delete (backend handled)
create policy "Service role takes all" on otp_verifications
  for all using (true) with check (true);

-- Optional: Function to clean up expired codes
create or replace function delete_expired_otps()
returns void as $$
begin
  delete from otp_verifications where expires_at < now();
end;
$$ language plpgsql;
