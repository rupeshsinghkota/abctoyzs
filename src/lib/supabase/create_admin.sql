-- 1. Enable pgcrypto for password hashing
create extension if not exists pgcrypto;

-- 2. Use a DO block to execute logic (Safe vs Constraints)
do $$
declare
  target_user_id uuid;
begin
  -- A. Check if user exists by email
  select id into target_user_id from auth.users where email = 'rupeshsinghkota@gmail.com';

  -- B. If user does not exist, create them
  if target_user_id is null then
    target_user_id := gen_random_uuid();
    
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      target_user_id,
      'authenticated',
      'authenticated',
      'rupeshsinghkota@gmail.com',
      crypt('Sheikh8051@', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  end if;

  -- C. Ensure the admins table exists
  create table if not exists public.admins (
    user_id uuid references auth.users(id) on delete cascade primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- D. Enable RLS (Safe to run multiple times)
  alter table public.admins enable row level security;

  -- E. Add user to admins table if not already there
  if not exists (select 1 from public.admins where user_id = target_user_id) then
    insert into public.admins (user_id) values (target_user_id);
  end if;
  
end $$;
