-- Create a table for newsletter subscriptions
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public sign up)
CREATE POLICY "Public insert access" ON newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

-- Allow only admins to read or manage
CREATE POLICY "Admin full access" ON newsletter_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    );
