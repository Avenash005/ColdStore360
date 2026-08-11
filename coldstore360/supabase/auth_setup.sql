-- Phase 7: Auth & Security Setup

-- 1. Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    'warehouse_staff' -- Default role for MVP
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists to allow re-running
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Enable Row Level Security (RLS) and create policies

-- We want to enable RLS but keep it simple for the MVP:
-- If the user is authenticated, they have full access.
-- If the user is anon (not logged in), they have no access.

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users on profiles" 
  ON profiles FOR ALL 
  TO authenticated USING (true) WITH CHECK (true);

-- Traders
ALTER TABLE traders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users on traders" 
  ON traders FOR ALL 
  TO authenticated USING (true) WITH CHECK (true);

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users on products" 
  ON products FOR ALL 
  TO authenticated USING (true) WITH CHECK (true);

-- Storage Locations
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users on storage_locations" 
  ON storage_locations FOR ALL 
  TO authenticated USING (true) WITH CHECK (true);

-- Stock Batches
ALTER TABLE stock_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users on stock_batches" 
  ON stock_batches FOR ALL 
  TO authenticated USING (true) WITH CHECK (true);

-- Inventory Transactions
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users on inventory_transactions" 
  ON inventory_transactions FOR ALL 
  TO authenticated USING (true) WITH CHECK (true);

-- Invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users on invoices" 
  ON invoices FOR ALL 
  TO authenticated USING (true) WITH CHECK (true);

-- Invoice Items
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users on invoice_items" 
  ON invoice_items FOR ALL 
  TO authenticated USING (true) WITH CHECK (true);

-- Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users on payments" 
  ON payments FOR ALL 
  TO authenticated USING (true) WITH CHECK (true);

-- Stock Counts
ALTER TABLE stock_counts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users on stock_counts" 
  ON stock_counts FOR ALL 
  TO authenticated USING (true) WITH CHECK (true);

-- Disputes
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users on disputes" 
  ON disputes FOR ALL 
  TO authenticated USING (true) WITH CHECK (true);

-- Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users on audit_logs" 
  ON audit_logs FOR ALL 
  TO authenticated USING (true) WITH CHECK (true);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users on notifications" 
  ON notifications FOR ALL 
  TO authenticated USING (true) WITH CHECK (true);
