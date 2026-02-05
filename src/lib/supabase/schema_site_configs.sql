-- Create a table for global site configurations
CREATE TABLE IF NOT EXISTS site_configs (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE site_configs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (for public SEO tags)
CREATE POLICY "Public read access" ON site_configs
    FOR SELECT USING (true);

-- Allow admins to insert/update
CREATE POLICY "Admin full access" ON site_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    );

-- Insert default SEO config if not exists
INSERT INTO site_configs (key, value)
VALUES ('seo', '{
    "defaultTitle": "abctoyz - Premium Ride-on Toys for Kids in India",
    "titleTemplate": "%s | abctoyz",
    "defaultDescription": "Explore the best premium ride-on cars, bikes, and jeeps for kids in India. Quality guaranteed with 24-48 hour dispatch.",
    "defaultKeywords": ["ride-on toys", "kids electric cars", "toy bikes", "ride-on jeeps", "battery operated cars"],
    "ogImage": "/og-image.png",
    "twitterHandle": "@abctoyz"
}'::jsonb)
ON CONFLICT (key) DO NOTHING;
