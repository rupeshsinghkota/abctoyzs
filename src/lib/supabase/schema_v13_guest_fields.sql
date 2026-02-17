-- Migration V13: Add guest email fields

-- 1. Add guest_email to orders table
ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "guest_email" text;

-- 2. Add email to addresses table (for guest checkout persistence)
ALTER TABLE "public"."addresses" ADD COLUMN IF NOT EXISTS "email" text;

-- 3. Notify schema reload
NOTIFY pgrst, 'reload schema';
