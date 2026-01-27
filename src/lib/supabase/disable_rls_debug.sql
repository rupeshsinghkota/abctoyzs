-- Debugging: Disable RLS on admins table to ensure visibility
-- Run this to confirm if RLS was blocking the read.

alter table public.admins disable row level security;

-- Verify the user exists
-- You can run this SELECT to see if your user is in the table:
select * from public.admins;
