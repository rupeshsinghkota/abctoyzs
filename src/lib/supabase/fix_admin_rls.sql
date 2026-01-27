-- Fix for Admin Visibility
-- We previously enabled RLS but forgot to allow admins to "see" themselves in the table.

-- 1. Check if policy exists (to be safe), then drop it to recreate or just create if not exists
drop policy if exists "Admins can read own entry" on public.admins;

-- 2. Create the policy
-- This allows a user to query the 'admins' table ONLY if they are looking for their own user_id.
create policy "Admins can read own entry"
  on public.admins
  for select
  using (auth.uid() = user_id);

-- 3. Also allow them to insert (just in case)
drop policy if exists "Admins can insert themselves" on public.admins;
create policy "Admins can insert themselves"
  on public.admins
  for insert
  with check (auth.uid() = user_id);
