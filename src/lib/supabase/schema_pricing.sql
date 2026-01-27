-- Upgrade Schema for Pricing Enhancements
-- Run this in your Supabase SQL Editor

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS mrp numeric;

COMMENT ON COLUMN products.mrp IS 'Maximum Retail Price (for strike-through display)';
