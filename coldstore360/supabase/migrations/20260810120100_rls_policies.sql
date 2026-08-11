-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE traders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE racks ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper Function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper Function to get trader id for the current user
CREATE OR REPLACE FUNCTION get_user_trader_id()
RETURNS UUID AS $$
  SELECT trader_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles
-- Everyone can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
-- Super admins can read and write all profiles
CREATE POLICY "Super admins can manage profiles" ON profiles
  FOR ALL USING (get_user_role() = 'super_admin');

-- Traders
-- Traders can read their own trader record
CREATE POLICY "Traders can read own record" ON traders
  FOR SELECT USING (id = get_user_trader_id());
-- Admins and managers can read all traders
CREATE POLICY "Staff can read all traders" ON traders
  FOR SELECT USING (get_user_role() IN ('super_admin', 'manager', 'gate_staff', 'warehouse_staff'));
-- Only super admins and managers can manage traders
CREATE POLICY "Admins/Managers can manage traders" ON traders
  FOR ALL USING (get_user_role() IN ('super_admin', 'manager'));

-- Products
-- Everyone can read products
CREATE POLICY "Everyone can read products" ON products
  FOR SELECT USING (true);
-- Super admins can manage products
CREATE POLICY "Super admins can manage products" ON products
  FOR ALL USING (get_user_role() = 'super_admin');

-- Facilities
CREATE POLICY "Staff can read facilities" ON facilities
  FOR SELECT USING (get_user_role() IN ('super_admin', 'manager', 'gate_staff', 'warehouse_staff'));
CREATE POLICY "Super admins can manage facilities" ON facilities
  FOR ALL USING (get_user_role() = 'super_admin');

-- Rooms
CREATE POLICY "Staff can read rooms" ON rooms
  FOR SELECT USING (get_user_role() IN ('super_admin', 'manager', 'gate_staff', 'warehouse_staff'));
CREATE POLICY "Super admins can manage rooms" ON rooms
  FOR ALL USING (get_user_role() = 'super_admin');

-- Racks
CREATE POLICY "Staff can read racks" ON racks
  FOR SELECT USING (get_user_role() IN ('super_admin', 'manager', 'gate_staff', 'warehouse_staff'));
CREATE POLICY "Super admins can manage racks" ON racks
  FOR ALL USING (get_user_role() = 'super_admin');

-- Slots
CREATE POLICY "Staff can read slots" ON slots
  FOR SELECT USING (get_user_role() IN ('super_admin', 'manager', 'gate_staff', 'warehouse_staff'));
CREATE POLICY "Super admins can manage slots" ON slots
  FOR ALL USING (get_user_role() = 'super_admin');

-- Stock Batches
-- Traders can read their own stock
CREATE POLICY "Traders can read own stock" ON stock_batches
  FOR SELECT USING (trader_id = get_user_trader_id());
-- Staff can read all stock
CREATE POLICY "Staff can read all stock" ON stock_batches
  FOR SELECT USING (get_user_role() IN ('super_admin', 'manager', 'gate_staff', 'warehouse_staff'));
-- Gate staff, managers, admins can create/update stock batches
CREATE POLICY "Staff can manage stock" ON stock_batches
  FOR ALL USING (get_user_role() IN ('super_admin', 'manager', 'gate_staff', 'warehouse_staff'));

-- Inventory Transactions
CREATE POLICY "Traders can read own transactions" ON inventory_transactions
  FOR SELECT USING (trader_id = get_user_trader_id());
CREATE POLICY "Staff can read all transactions" ON inventory_transactions
  FOR SELECT USING (get_user_role() IN ('super_admin', 'manager', 'gate_staff', 'warehouse_staff'));
CREATE POLICY "Staff can insert transactions" ON inventory_transactions
  FOR INSERT WITH CHECK (get_user_role() IN ('super_admin', 'manager', 'gate_staff', 'warehouse_staff'));

-- Storage Rates
CREATE POLICY "Everyone can read rates" ON storage_rates
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage rates" ON storage_rates
  FOR ALL USING (get_user_role() = 'super_admin');

-- Invoices & Items & Payments
CREATE POLICY "Traders can read own invoices" ON invoices
  FOR SELECT USING (trader_id = get_user_trader_id());
CREATE POLICY "Staff can read all invoices" ON invoices
  FOR SELECT USING (get_user_role() IN ('super_admin', 'manager'));
CREATE POLICY "Managers/Admins can manage invoices" ON invoices
  FOR ALL USING (get_user_role() IN ('super_admin', 'manager'));

CREATE POLICY "Traders can read own invoice items" ON invoice_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.trader_id = get_user_trader_id()));
CREATE POLICY "Staff can read all invoice items" ON invoice_items
  FOR SELECT USING (get_user_role() IN ('super_admin', 'manager'));
CREATE POLICY "Managers/Admins can manage invoice items" ON invoice_items
  FOR ALL USING (get_user_role() IN ('super_admin', 'manager'));

CREATE POLICY "Traders can read own payments" ON payments
  FOR SELECT USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payments.invoice_id AND invoices.trader_id = get_user_trader_id()));
CREATE POLICY "Staff can read all payments" ON payments
  FOR SELECT USING (get_user_role() IN ('super_admin', 'manager'));
CREATE POLICY "Managers/Admins can manage payments" ON payments
  FOR ALL USING (get_user_role() IN ('super_admin', 'manager'));

-- Stock Counts
CREATE POLICY "Staff can read stock counts" ON stock_counts
  FOR SELECT USING (get_user_role() IN ('super_admin', 'manager', 'warehouse_staff'));
CREATE POLICY "Warehouse staff can insert counts" ON stock_counts
  FOR INSERT WITH CHECK (get_user_role() IN ('warehouse_staff', 'manager', 'super_admin'));
CREATE POLICY "Managers/Admins can manage stock counts" ON stock_counts
  FOR ALL USING (get_user_role() IN ('super_admin', 'manager'));

-- Disputes
CREATE POLICY "Traders can read/insert own disputes" ON disputes
  FOR SELECT USING (trader_id = get_user_trader_id());
CREATE POLICY "Traders can insert own disputes" ON disputes
  FOR INSERT WITH CHECK (trader_id = get_user_trader_id());
CREATE POLICY "Staff can manage disputes" ON disputes
  FOR ALL USING (get_user_role() IN ('super_admin', 'manager'));

-- Audit Logs
CREATE POLICY "Admins/Managers can read audit logs" ON audit_logs
  FOR SELECT USING (get_user_role() IN ('super_admin', 'manager'));
-- System can insert logs (Need to bypass RLS in edge functions or use security definer triggers)
CREATE POLICY "Staff can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (get_user_role() IN ('super_admin', 'manager', 'gate_staff', 'warehouse_staff'));

-- Notifications
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
