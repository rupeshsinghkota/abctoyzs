-- Add banners column to products table for storing marketing hero images
ALTER TABLE products ADD COLUMN IF NOT EXISTS banners text[] DEFAULT '{}';

-- Reload schema cache to ensure Next.js sees the change
NOTIFY pgrst, 'reload schema';
