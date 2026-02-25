-- Reviews Storage Table for abcToyz
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS product_reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    customer_name text NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    images text[] DEFAULT '{}',
    location text,
    is_verified boolean DEFAULT true,
    is_approved boolean DEFAULT false,
    helpful_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Index for fast lookups by product
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews (product_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews" ON product_reviews
    FOR SELECT USING (is_approved = true);

-- Policy: Customers can insert their own reviews
CREATE POLICY "Anyone can insert reviews" ON product_reviews
    FOR INSERT WITH CHECK (true);

-- Policy: Admin (service_role) can do everything
CREATE POLICY "Service role full access" ON product_reviews
    FOR ALL USING (auth.role() = 'service_role');
