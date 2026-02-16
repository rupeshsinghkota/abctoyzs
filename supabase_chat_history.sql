-- Chat History Storage Table for WhatsApp Conversations
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number text NOT NULL,
    role text NOT NULL CHECK (role IN ('user', 'model')),
    message text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_phone_created ON whatsapp_conversations (phone_number, created_at DESC);

-- Enable Row Level Security
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (for webhook)
CREATE POLICY "Service role full access" ON whatsapp_conversations
    FOR ALL USING (auth.role() = 'service_role');

-- Optional: Auto-delete old messages (keep last 30 days)
-- This prevents the table from growing infinitely
CREATE OR REPLACE FUNCTION cleanup_old_conversations()
RETURNS void AS $$
BEGIN
    DELETE FROM whatsapp_conversations 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (optional - run via cron or manually)
-- SELECT cleanup_old_conversations();
