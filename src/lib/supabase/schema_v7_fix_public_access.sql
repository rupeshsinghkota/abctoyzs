-- Fix Public Access to Products (Solves 404 Error)
-- Run this in Supabase SQL Editor

-- 1. Ensure RLS is enabled (good practice)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Add Policy for Public Read Access
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view products') THEN
        CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
    END IF;
END
$$;

-- 3. Force Cache Reload
NOTIFY pgrst, 'reload schema';
