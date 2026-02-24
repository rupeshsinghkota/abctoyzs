-- Add follow-up tracking to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_followup_step INT DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_followup_at TIMESTAMPTZ;

-- Index for performance
CREATE INDEX IF NOT EXISTS leads_followup_idx ON leads (last_followup_step, last_followup_at);

COMMENT ON COLUMN leads.last_followup_step IS 'Current step in the 3-day nurture sequence (0 to 3)';
