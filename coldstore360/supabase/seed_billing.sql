-- 4. Seed Stock Batches for Billing Testing
-- We need some batches that are FULLY_DISPATCHED to test invoicing.
-- We will insert them with past dates to test duration calculations.

-- Ensure Traders exist first (from seed.sql)
DO $$ 
DECLARE
  v_trader_id UUID;
  v_product_id UUID;
  v_batch_id UUID;
BEGIN
  -- Get Raj Traders
  SELECT id INTO v_trader_id FROM traders WHERE trader_code = 'TRD-001' LIMIT 1;
  -- Get Apples
  SELECT id INTO v_product_id FROM products WHERE product_code = 'PRD-APL-01' LIMIT 1;
  
  IF v_trader_id IS NOT NULL AND v_product_id IS NOT NULL THEN
    -- Insert a batch from 30 days ago, that is now fully dispatched
    INSERT INTO stock_batches (id, batch_number, trader_id, product_id, quantity_received, quantity_available, unit, entry_date, status)
    VALUES (
      gen_random_uuid(),
      'BTH-BILLING-TEST-01',
      v_trader_id,
      v_product_id,
      100,
      0,
      'Pallets',
      timezone('utc', now() - interval '30 days'),
      'FULLY_DISPATCHED'
    ) RETURNING id INTO v_batch_id;

    -- Insert Inward Transaction
    INSERT INTO inventory_transactions (transaction_number, batch_id, trader_id, product_id, transaction_type, quantity, before_quantity, after_quantity, notes)
    VALUES (
      'TXN-IN-BILLING-TEST-01',
      v_batch_id,
      v_trader_id,
      v_product_id,
      'INWARD',
      100,
      0,
      100,
      'Initial mock inward'
    );
    
    -- Insert Outward Transaction (Dispatch today)
    INSERT INTO inventory_transactions (transaction_number, batch_id, trader_id, product_id, transaction_type, quantity, before_quantity, after_quantity, notes)
    VALUES (
      'TXN-OUT-BILLING-TEST-01',
      v_batch_id,
      v_trader_id,
      v_product_id,
      'OUTWARD',
      100,
      100,
      0,
      'Mock full dispatch'
    );
  END IF;
END $$;
