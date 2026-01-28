-- Migration to add marketing_suite column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS marketing_suite JSONB DEFAULT '{}'::jsonb;
