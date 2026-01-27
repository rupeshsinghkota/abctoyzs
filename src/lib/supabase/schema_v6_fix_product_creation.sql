-- Comprehensive Schema Fix for Product Creation Error
-- Run this in your Supabase SQL Editor to ensure all columns exist.

-- 1. Pricing Enhancements
ALTER TABLE products ADD COLUMN IF NOT EXISTS mrp numeric;

-- 1b. Core Fields (Fixing missing columns)
ALTER TABLE products ADD COLUMN IF NOT EXISTS category text DEFAULT 'cars';
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS prompt_notes text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;

-- 2. Media arrays
ALTER TABLE products ADD COLUMN IF NOT EXISTS videos text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS box_content text[] DEFAULT '{}';

-- 3. Attributes (for dynamic variations)
ALTER TABLE products ADD COLUMN IF NOT EXISTS attributes jsonb DEFAULT '[]';

-- 4. Logistics & Dimensions
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_dimensions text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS box_dimensions text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS net_weight text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gross_weight text;

-- 5. Product Variants Table (if missing)
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  attributes jsonb NOT NULL DEFAULT '{}',
  price decimal(10,2) NOT NULL,
  stock integer DEFAULT 0,
  sku text,
  image text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for variants
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Grant access policies (idempotent checks are hard in standard SQL, 
-- but creating if not exists is safe-ish or just ignore errors if policy exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view product variants') THEN
        CREATE POLICY "Public can view product variants" ON product_variants FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert product variants') THEN
        CREATE POLICY "Admins can insert product variants" ON product_variants FOR INSERT WITH CHECK (
            exists (select 1 from admins where admins.user_id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update product variants') THEN
        CREATE POLICY "Admins can update product variants" ON product_variants FOR UPDATE USING (
            exists (select 1 from admins where admins.user_id = auth.uid())
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete product variants') THEN
        CREATE POLICY "Admins can delete product variants" ON product_variants FOR DELETE USING (
            exists (select 1 from admins where admins.user_id = auth.uid())
        );
    END IF;
END
$$;

-- 6. Force Schema Cache Reload (Critical for "Could not find column" errors)
NOTIFY pgrst, 'reload schema';
