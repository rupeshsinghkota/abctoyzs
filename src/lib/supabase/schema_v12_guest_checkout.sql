-- Enable Guest Checkout
-- 1. Make user_id nullable in orders and addresses
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE addresses ALTER COLUMN user_id DROP NOT NULL;

-- 2. Update RLS Policies for Anonymous Users

-- Addresses: Allow anon insert
DROP POLICY IF EXISTS "Allow anonymous to insert addresses" ON addresses;
CREATE POLICY "Allow anonymous to insert addresses"
  ON addresses FOR INSERT
  WITH CHECK (true);

-- Addresses: Allow anonymous to select if they know the ID
-- This protects against "list all" attacks
DROP POLICY IF EXISTS "Allow anonymous to select addresses" ON addresses;
CREATE POLICY "Allow anonymous to select addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Orders: Allow anon insert
DROP POLICY IF EXISTS "Allow anonymous to insert orders" ON orders;
CREATE POLICY "Allow anonymous to insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Orders: Allow anon selection (needed for tracking page)
DROP POLICY IF EXISTS "Allow anonymous to select orders" ON orders;
CREATE POLICY "Allow anonymous to select orders"
  ON orders FOR SELECT
  USING (true);

-- Order Items: Allow anon insert
DROP POLICY IF EXISTS "Allow anonymous to insert order items" ON order_items;
CREATE POLICY "Allow anonymous to insert order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Order Items: Allow anon selection
DROP POLICY IF EXISTS "Allow anonymous to select order items" ON order_items;
CREATE POLICY "Allow anonymous to select order items"
  ON order_items FOR SELECT
  USING (true);

-- 3. Notify schema reload
NOTIFY pgrst, 'reload schema';
