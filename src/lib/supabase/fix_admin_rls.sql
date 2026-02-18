
-- Fix RLS for Admins on Addresses and Orders

-- 1. Addresses
DROP POLICY IF EXISTS "Admins can view all addresses" ON addresses;
CREATE POLICY "Admins can view all addresses"
  ON addresses FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can update all addresses" ON addresses;
CREATE POLICY "Admins can update all addresses"
  ON addresses FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 2. Orders (Ensure Admins can see all, though currently 'true' is risky)
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 3. Order Items
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- 4. Profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

NOTIFY pgrst, 'reload schema';
