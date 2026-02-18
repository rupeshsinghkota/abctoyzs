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

-- Policy: Allow public read access (for checkout/frontend)
CREATE POLICY "Public Read Settings" ON public.settings
    FOR SELECT USING (true);

-- Policy: Allow authenticated update access (for admin)
CREATE POLICY "Admin Update Settings" ON public.settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert default row if empty
INSERT INTO public.settings (cod_mode, cod_advance_type, cod_advance_value)
SELECT 'normal', 'percentage', 0
WHERE NOT EXISTS (SELECT 1 FROM public.settings);
