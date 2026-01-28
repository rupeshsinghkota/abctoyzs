-- MASTER SCHEMA FIX
-- Run this in your Supabase SQL Editor to ensure ALL expected columns exist.
-- This fixes "Failed to update" and "Failed to create" errors.

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS mrp numeric,
ADD COLUMN IF NOT EXISTS category text DEFAULT 'cars',
ADD COLUMN IF NOT EXISTS subcategory text,
ADD COLUMN IF NOT EXISTS prompt_notes text,
ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS videos text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS box_content text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS banners text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS attributes jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS product_dimensions text,
ADD COLUMN IF NOT EXISTS box_dimensions text,
ADD COLUMN IF NOT EXISTS net_weight text,
ADD COLUMN IF NOT EXISTS gross_weight text,
ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS marketing_suite jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS voltage text,
ADD COLUMN IF NOT EXISTS age_group text;

-- Ensure specs exists as JSONB (usually it does by default, but just in case)
-- ALTER TABLE products ALTER COLUMN specs SET DATA TYPE jsonb USING specs::jsonb;

-- Force schema reload
NOTIFY pgrst, 'reload schema';
