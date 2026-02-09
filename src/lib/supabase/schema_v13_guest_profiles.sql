-- Enable Guest Profiles
-- 1. Modify profiles table to support guest entries
-- First, find and drop the foreign key constraint if it exists
-- Usually named 'profiles_id_fkey' or similar
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
    END IF;
END $$;

-- 2. Add is_guest flag if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;

-- 3. Add email column to profiles if it doesn't exist (good for guest records)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 4. Update RLS Policies for Profiles
-- Allow anyone to insert into profiles (needed for guest checkout)
DROP POLICY IF EXISTS "Anyone can insert profiles" ON profiles;
CREATE POLICY "Anyone can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Allow guests to select their own profile (if they have the ID)
DROP POLICY IF EXISTS "Guests can view their own profile" ON profiles;
CREATE POLICY "Guests can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_guest = TRUE);

-- Allow guests to update their own profile (if they have the ID)
DROP POLICY IF EXISTS "Guests can update their own profile" ON profiles;
CREATE POLICY "Guests can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_guest = TRUE);

-- 5. Notify schema reload
NOTIFY pgrst, 'reload schema';
