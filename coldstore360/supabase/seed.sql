-- Seed Data for ColdStore360
-- Note: Run this script in the Supabase SQL Editor. It runs as postgres and bypasses RLS.

-- 1. Seed Traders
INSERT INTO traders (trader_code, business_name, contact_person, phone, email, address, gst_number)
VALUES 
  ('TRD-001', 'Raj Traders', 'Amit Raj', '9876543210', 'amit@rajtraders.com', '123 Market Road, Mumbai', '27ABCDE1234F1Z5'),
  ('TRD-002', 'Global Exports Ltd', 'Sarah Jenkins', '9876543211', 'sarah@globalexports.com', '45 Port Ave, Mumbai', '27XYZDE1234F1Z5'),
  ('TRD-003', 'Fresh Farms Co.', 'Vikram Singh', '9876543212', 'vikram@freshfarms.in', '78 Agri Zone, Pune', '27PQRST1234F1Z5')
ON CONFLICT (trader_code) DO NOTHING;

-- 2. Seed Products
INSERT INTO products (product_code, name, category, unit, description)
VALUES
  ('PRD-APL-01', 'Apples (Fuji)', 'Fresh Produce', 'Pallets', 'Premium Fuji Apples, requires 0-4°C'),
  ('PRD-PEA-02', 'Frozen Peas', 'Frozen Veg', 'Pallets', 'IQF Green Peas, requires -18°C'),
  ('PRD-GRP-03', 'Grapes (Thompson)', 'Fresh Produce', 'Pallets', 'Export quality grapes'),
  ('PRD-SAL-04', 'Frozen Salmon', 'Seafood', 'Pallets', 'Premium Salmon Fillets')
ON CONFLICT (product_code) DO NOTHING;

-- 3. Seed Facility
INSERT INTO facilities (id, name, code, total_capacity)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'ColdStore Alpha North', 'FAC-ALPHA', 12500)
ON CONFLICT (code) DO NOTHING;

-- 4. Seed Rooms
INSERT INTO rooms (id, facility_id, name, code, type, capacity, temp_min, temp_max)
VALUES
  ('r0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Cold Room A', 'ROOM-A', 'Fruit Storage', 5000, 2, 8),
  ('r0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'Cold Room B', 'ROOM-B', 'Vegetable Storage', 5000, 4, 10),
  ('r0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'Freezer', 'FREEZER', 'Frozen Goods', 2500, -20, -18)
ON CONFLICT (code) DO NOTHING;

-- 5. Seed Racks
INSERT INTO racks (id, room_id, name, code, capacity)
VALUES
  ('rk000000-0000-0000-0000-000000000001', 'r0000000-0000-0000-0000-000000000001', 'Rack A1', 'RACK-A1', 1000),
  ('rk000000-0000-0000-0000-000000000002', 'r0000000-0000-0000-0000-000000000001', 'Rack A2', 'RACK-A2', 1000)
ON CONFLICT (code) DO NOTHING;

-- 6. Seed Slots
INSERT INTO slots (id, rack_id, code, capacity)
VALUES
  ('s0000000-0000-0000-0000-000000000001', 'rk000000-0000-0000-0000-000000000001', 'A1-01', 100),
  ('s0000000-0000-0000-0000-000000000002', 'rk000000-0000-0000-0000-000000000001', 'A1-02', 100),
  ('s0000000-0000-0000-0000-000000000003', 'rk000000-0000-0000-0000-000000000001', 'A1-03', 100)
ON CONFLICT (code) DO NOTHING;
