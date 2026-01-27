-- Add Flags for New & Featured Products
-- Run this in Supabase SQL Editor

-- 1. Add Columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- 2. Force Cache Reload
NOTIFY pgrst, 'reload schema';
