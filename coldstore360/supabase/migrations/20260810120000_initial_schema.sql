-- Enum for Roles
CREATE TYPE user_role AS ENUM ('super_admin', 'manager', 'gate_staff', 'warehouse_staff', 'trader');

-- Profiles table (linked to auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'trader',
  trader_id UUID, -- Will add foreign key later
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Traders
CREATE TABLE traders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trader_code TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  gst_number TEXT,
  pan_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add foreign key to profiles now that traders exists
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_trader
  FOREIGN KEY (trader_id) REFERENCES traders(id) ON DELETE SET NULL;

-- Products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL, -- e.g., crates, bags, kg
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Facilities
CREATE TABLE facilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  total_capacity NUMERIC NOT NULL CHECK (total_capacity > 0),
  status TEXT DEFAULT 'Operational',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Rooms
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID REFERENCES facilities(id) NOT NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  capacity NUMERIC NOT NULL CHECK (capacity > 0),
  occupied_capacity NUMERIC NOT NULL DEFAULT 0 CHECK (occupied_capacity >= 0),
  available_capacity NUMERIC GENERATED ALWAYS AS (capacity - occupied_capacity) STORED,
  temp_min NUMERIC NOT NULL,
  temp_max NUMERIC NOT NULL,
  status TEXT DEFAULT 'Operational',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Racks
CREATE TABLE racks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) NOT NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  capacity NUMERIC NOT NULL CHECK (capacity > 0),
  occupied_capacity NUMERIC NOT NULL DEFAULT 0 CHECK (occupied_capacity >= 0),
  status TEXT DEFAULT 'Operational',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Slots
CREATE TABLE slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rack_id UUID REFERENCES racks(id) NOT NULL,
  code TEXT UNIQUE NOT NULL,
  capacity NUMERIC NOT NULL CHECK (capacity > 0),
  occupied_capacity NUMERIC NOT NULL DEFAULT 0 CHECK (occupied_capacity >= 0),
  status TEXT DEFAULT 'Available',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Stock Batches
CREATE TABLE stock_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_number TEXT UNIQUE NOT NULL,
  trader_id UUID REFERENCES traders(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity_received NUMERIC NOT NULL CHECK (quantity_received > 0),
  quantity_available NUMERIC NOT NULL CHECK (quantity_available >= 0),
  unit TEXT NOT NULL,
  entry_date TIMESTAMPTZ NOT NULL,
  expected_exit_date TIMESTAMPTZ,
  slot_id UUID REFERENCES slots(id),
  vehicle_number TEXT NOT NULL,
  driver_name TEXT,
  driver_phone TEXT,
  reference_number TEXT,
  status TEXT NOT NULL DEFAULT 'IN_STORAGE', -- IN_STORAGE, PARTIALLY_DISPATCHED, FULLY_DISPATCHED, DAMAGED, QUARANTINED, CANCELLED
  qr_code TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inventory Transactions
CREATE TABLE inventory_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_number TEXT UNIQUE NOT NULL,
  batch_id UUID REFERENCES stock_batches(id) NOT NULL,
  trader_id UUID REFERENCES traders(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  transaction_type TEXT NOT NULL, -- INWARD, OUTWARD, TRANSFER, ADJUSTMENT, DAMAGE, CORRECTION
  quantity NUMERIC NOT NULL,
  before_quantity NUMERIC NOT NULL,
  after_quantity NUMERIC NOT NULL,
  reference_id UUID,
  performed_by UUID REFERENCES profiles(id),
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  notes TEXT
);

-- Storage Rates
CREATE TABLE storage_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id), -- Null means default rate
  storage_type TEXT NOT NULL,
  rate NUMERIC NOT NULL CHECK (rate >= 0),
  rate_unit TEXT NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  minimum_charge_days INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Invoices
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  trader_id UUID REFERENCES traders(id) NOT NULL,
  invoice_date DATE NOT NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  tax_amount NUMERIC NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  discount_amount NUMERIC NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount NUMERIC NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, ISSUED, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED, DISPUTED
  due_date DATE,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Invoice Items
CREATE TABLE invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  batch_id UUID REFERENCES stock_batches(id),
  product_id UUID REFERENCES products(id) NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  storage_days NUMERIC NOT NULL CHECK (storage_days >= 0),
  rate NUMERIC NOT NULL CHECK (rate >= 0),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Payments
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL, -- CASH, UPI, BANK_TRANSFER, CARD, OTHER
  payment_reference TEXT,
  payment_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  recorded_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Stock Counts (Reconciliation)
CREATE TABLE stock_counts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID REFERENCES stock_batches(id) NOT NULL,
  expected_quantity NUMERIC NOT NULL,
  physical_quantity NUMERIC NOT NULL,
  difference NUMERIC NOT NULL,
  counted_by UUID REFERENCES profiles(id) NOT NULL,
  counted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, UNDER_REVIEW, APPROVED, REJECTED
  approved_by UUID REFERENCES profiles(id)
);

-- Disputes
CREATE TABLE disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trader_id UUID REFERENCES traders(id) NOT NULL,
  invoice_id UUID REFERENCES invoices(id),
  batch_id UUID REFERENCES stock_batches(id),
  type TEXT NOT NULL, -- BILLING, QUANTITY, STORAGE_DURATION, DAMAGE, OTHER
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, UNDER_REVIEW, RESOLVED, REJECTED
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id)
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- STOCK_ALERT, BILLING, DISCREPANCY, LONG_STORAGE, PAYMENT, SYSTEM
  reference_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Storage Hierarchy Triggers
CREATE OR REPLACE FUNCTION update_rack_and_room_capacity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- A batch is added, slot occupancy needs to be updated manually or via this trigger?
    -- Actually, it's better to update slot capacity via trigger on stock_batches
    -- But since slot capacity is tracked, we can just update rack/room from slots.
    NULL; -- Trigger logic will be handled below
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update slot occupied capacity when stock_batches changes
CREATE OR REPLACE FUNCTION update_slot_capacity()
RETURNS TRIGGER AS $$
DECLARE
  qty_diff NUMERIC;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.slot_id IS NOT NULL THEN
      UPDATE slots SET occupied_capacity = occupied_capacity + NEW.quantity_available WHERE id = NEW.slot_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If slot changed
    IF OLD.slot_id IS DISTINCT FROM NEW.slot_id THEN
      IF OLD.slot_id IS NOT NULL THEN
        UPDATE slots SET occupied_capacity = occupied_capacity - OLD.quantity_available WHERE id = OLD.slot_id;
      END IF;
      IF NEW.slot_id IS NOT NULL THEN
        UPDATE slots SET occupied_capacity = occupied_capacity + NEW.quantity_available WHERE id = NEW.slot_id;
      END IF;
    ELSE
      -- Quantity changed in same slot
      IF OLD.quantity_available IS DISTINCT FROM NEW.quantity_available AND NEW.slot_id IS NOT NULL THEN
        qty_diff := NEW.quantity_available - OLD.quantity_available;
        UPDATE slots SET occupied_capacity = occupied_capacity + qty_diff WHERE id = NEW.slot_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.slot_id IS NOT NULL THEN
      UPDATE slots SET occupied_capacity = occupied_capacity - OLD.quantity_available WHERE id = OLD.slot_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_slot_capacity_trigger
AFTER INSERT OR UPDATE OR DELETE ON stock_batches
FOR EACH ROW EXECUTE FUNCTION update_slot_capacity();


-- Trigger to update rack and room based on slot updates
CREATE OR REPLACE FUNCTION update_parent_capacities()
RETURNS TRIGGER AS $$
DECLARE
  qty_diff NUMERIC;
  v_rack_id UUID;
  v_room_id UUID;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.occupied_capacity IS DISTINCT FROM NEW.occupied_capacity THEN
    qty_diff := NEW.occupied_capacity - OLD.occupied_capacity;
    
    -- Update Rack
    UPDATE racks SET occupied_capacity = occupied_capacity + qty_diff WHERE id = NEW.rack_id RETURNING room_id INTO v_room_id;
    
    -- Update Room
    UPDATE rooms SET occupied_capacity = occupied_capacity + qty_diff WHERE id = v_room_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parent_capacities_trigger
AFTER UPDATE ON slots
FOR EACH ROW EXECUTE FUNCTION update_parent_capacities();

