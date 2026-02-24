-- Lead Capture System Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    email TEXT,
    name TEXT,
    source TEXT DEFAULT 'checkout', -- 'checkout', 'popup', etc.
    cart_summary JSONB, -- Optional: Store what was in their cart
    status TEXT DEFAULT 'new', -- 'new', 'contacted', 'converted'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by phone
CREATE UNIQUE INDEX IF NOT EXISTS leads_phone_unique_idx ON leads (phone);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Admin Policy (Full Access)
DROP POLICY IF EXISTS "Admins have full access to leads" ON leads;
CREATE POLICY "Admins have full access to leads" 
ON leads FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Public Policy (Insert only for lead capture)
DROP POLICY IF EXISTS "Anyone can create leads" ON leads;
CREATE POLICY "Anyone can create leads" 
ON leads FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_leads_updated_at ON leads;
CREATE TRIGGER set_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Comment for clarity
COMMENT ON TABLE leads IS 'Store prospective customer contact info for abandoned cart recovery.';
