-- Create the settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Partial COD Settings
    cod_mode TEXT DEFAULT 'normal', -- 'normal' | 'partial'
    cod_advance_type TEXT DEFAULT 'percentage', -- 'percentage' | 'fixed'
    cod_advance_value NUMERIC DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Read Settings" ON public.settings;
DROP POLICY IF EXISTS "Admin Update Settings" ON public.settings;
DROP POLICY IF EXISTS "Admin Insert Settings" ON public.settings;

-- Policy: Allow public read access (for checkout/frontend)
CREATE POLICY "Public Read Settings" ON public.settings
    FOR SELECT USING (true);

-- Policy: Allow authenticated update access (for admin)
CREATE POLICY "Admin Update Settings" ON public.settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated insert access (for admin/initial setup)
CREATE POLICY "Admin Insert Settings" ON public.settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert default row if empty
INSERT INTO public.settings (cod_mode, cod_advance_type, cod_advance_value)
SELECT 'normal', 'percentage', 0
WHERE NOT EXISTS (SELECT 1 FROM public.settings);
