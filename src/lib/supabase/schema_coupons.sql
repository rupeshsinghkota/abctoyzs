-- Coupon Code System Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
    discount_value NUMERIC NOT NULL,
    min_order_amount NUMERIC DEFAULT 0,
    max_discount NUMERIC, -- Optional cap for percentage discounts
    expires_at TIMESTAMPTZ,
    usage_limit INT, -- Total number of times this coupon can be used
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Admin Policy (Full Access)
DROP POLICY IF EXISTS "Admins have full access to coupons" ON coupons;
CREATE POLICY "Admins have full access to coupons" 
ON coupons FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Public Policy (Read-only for validation)
DROP POLICY IF EXISTS "Anyone can view active coupons for validation" ON coupons;
CREATE POLICY "Anyone can view active coupons for validation" 
ON coupons FOR SELECT 
TO anon, authenticated 
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Comment for clarity
COMMENT ON TABLE coupons IS 'Store discount codes for the checkout process.';

-- Update orders table to support coupons
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- Function to increment coupon usage safely (atomic)
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE coupons
    SET used_count = used_count + 1
    WHERE code = UPPER(coupon_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
