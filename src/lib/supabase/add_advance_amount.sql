-- Add advance_amount to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS advance_amount NUMERIC DEFAULT 0;

-- Update existing COD orders (optional, or leave as 0)
-- We can default to 0.
