-- Upgrade Schema for Premium Product Features
-- Run this in your Supabase SQL Editor

-- 1. Add Support for Videos
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS videos text[] DEFAULT '{}';

-- 2. Add "What's in the Box" content list
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS box_content text[] DEFAULT '{}';

-- 3. Add Logistics / Dimensions
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS product_dimensions text, -- e.g. "108 x 66 x 55 cm"
ADD COLUMN IF NOT EXISTS box_dimensions text,     -- e.g. "110 x 68 x 40 cm"
ADD COLUMN IF NOT EXISTS net_weight text,         -- e.g. "15 kg"
ADD COLUMN IF NOT EXISTS gross_weight text;       -- e.g. "18 kg"

-- 4. Note on Advanced Specs:
-- We will continue to use the existing 'specs' JSONB column for:
-- motor, seats, tire_type, seat_material, remote_control, features
-- No schema change needed there, just data entry updates.
