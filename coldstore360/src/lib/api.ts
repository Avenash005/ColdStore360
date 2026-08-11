import { supabase } from './supabase';

// Types
export interface Trader {
  id: string;
  trader_code: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  product_code: string;
  name: string;
  category: string;
  unit: string;
  is_active: boolean;
}

export interface Facility {
  id: string;
  name: string;
  code: string;
  total_capacity: number;
}

export interface Room {
  id: string;
  facility_id: string;
  name: string;
  code: string;
  type: string;
  capacity: number;
  occupied_capacity: number;
  available_capacity: number;
  temp_min: number;
  temp_max: number;
}

export interface Rack {
  id: string;
  room_id: string;
  name: string;
  code: string;
  capacity: number;
  occupied_capacity: number;
}

export interface Slot {
  id: string;
  rack_id: string;
  code: string;
  capacity: number;
  occupied_capacity: number;
  status: string;
}

export interface StockBatch {
  id: string;
  batch_number: string;
  trader_id: string;
  product_id: string;
  quantity_received: number;
  quantity_available: number;
  unit: string;
  entry_date: string;
  status: string;
  slot_id?: string;
  slots?: Slot;
  traders?: Trader;
  products?: Product;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  trader_id: string;
  invoice_date: string;
  total_amount: number;
  status: string;
  due_date: string;
  traders?: Trader;
  invoice_items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  batch_id: string;
  product_id: string;
  description: string;
  quantity: number;
  storage_days: number;
  rate: number;
  amount: number;
  stock_batches?: StockBatch;
  products?: Product;
}

// Traders
export const getTraders = async (): Promise<Trader[]> => {
  const { data, error } = await supabase
    .from('traders')
    .select('*')
    .order('business_name', { ascending: true });
    
  if (error) throw error;
  return data;
};

export const createTrader = async (trader: Omit<Trader, 'id' | 'is_active'>) => {
  const { data, error } = await supabase
    .from('traders')
    .insert([trader])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deactivateTrader = async (traderId: string) => {
  const { data, error } = await supabase
    .from('traders')
    .update({ is_active: false })
    .eq('id', traderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });
    
  if (error) throw error;
  return data;
};

export const deactivateProduct = async (productId: string) => {
  const { data, error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', productId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Inventory
export const getInventoryBatches = async (): Promise<StockBatch[]> => {
  const { data, error } = await supabase
    .from('stock_batches')
    .select(`
      *,
      traders:trader_id (
        id, business_name, contact_person
      ),
      products:product_id (
        id, name, category, unit
      ),
      slots:slot_id (
        id, code,
        racks:rack_id (
          id, name,
          rooms:room_id (
            id, name
          )
        )
      )
    `)
    .order('entry_date', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const deleteInventoryBatch = async (batchId: string) => {
  const { error } = await supabase
    .from('stock_batches')
    .delete()
    .eq('id', batchId);

  if (error) throw error;
  return true;
};

export const clearAllInventory = async () => {
  // In a real app, this is very dangerous and usually requires a special RPC or backend function.
  // For the demo, we attempt to delete all stock_batches. This might fail if there are FK constraints
  // (like invoice_items or inventory_transactions pointing to them), but we can try to delete everything.
  
  // First clear transactions
  await supabase.from('inventory_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // Then clear counts
  await supabase.from('stock_counts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Then clear batches
  const { data, error } = await supabase
    .from('stock_batches')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) throw error;
  return data;
};

// Facilities & Storage
export const getFacilities = async (): Promise<Facility[]> => {
  const { data, error } = await supabase.from('facilities').select('*').order('name');
  if (error) throw error;
  return data;
};

export const getRooms = async (facilityId?: string): Promise<Room[]> => {
  let query = supabase.from('rooms').select('*').order('name');
  if (facilityId) query = query.eq('facility_id', facilityId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getRacks = async (roomId?: string): Promise<Rack[]> => {
  let query = supabase.from('racks').select('*').order('name');
  if (roomId) query = query.eq('room_id', roomId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getSlots = async (rackId?: string): Promise<Slot[]> => {
  let query = supabase.from('slots').select('*').order('code');
  if (rackId) query = query.eq('rack_id', rackId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getAvailableBatchesForTrader = async (traderId: string): Promise<StockBatch[]> => {
  const { data, error } = await supabase
    .from('stock_batches')
    .select(`
      *,
      products:product_id (
        id, name, unit
      ),
      slots:slot_id (
        id, code,
        racks:rack_id (
          id, name,
          rooms:room_id (
            id, name
          )
        )
      )
    `)
    .eq('trader_id', traderId)
    .gt('quantity_available', 0)
    .order('entry_date', { ascending: true });
    
  if (error) throw error;
  return data;
};

// Workflows
export const processInward = async (inwardData: {
  traderId: string;
  productId: string;
  quantity: number;
  vehicleNumber: string;
  driverName?: string;
  slotId: string;
}) => {
  const batchNumber = `BTH-${Date.now().toString().slice(-6)}`;
  
  // 1. Insert Stock Batch
  const { data: batch, error: batchError } = await supabase
    .from('stock_batches')
    .insert({
      batch_number: batchNumber,
      trader_id: inwardData.traderId,
      product_id: inwardData.productId,
      quantity_received: inwardData.quantity,
      quantity_available: inwardData.quantity,
      unit: 'Pallets', // defaulting for now, ideally fetch from product
      entry_date: new Date().toISOString(),
      vehicle_number: inwardData.vehicleNumber,
      driver_name: inwardData.driverName,
      slot_id: inwardData.slotId,
      status: 'IN_STORAGE'
    })
    .select()
    .single();

  if (batchError) throw batchError;

  // 2. Insert Transaction
  const transactionNumber = `TXN-IN-${Date.now().toString().slice(-6)}`;
  const { error: txnError } = await supabase
    .from('inventory_transactions')
    .insert({
      transaction_number: transactionNumber,
      batch_id: batch.id,
      trader_id: inwardData.traderId,
      product_id: inwardData.productId,
      transaction_type: 'INWARD',
      quantity: inwardData.quantity,
      before_quantity: 0,
      after_quantity: inwardData.quantity,
      notes: `Inward receipt from vehicle ${inwardData.vehicleNumber}`
    });

  if (txnError) throw txnError;

  return batch;
};

export const transferStock = async (transferData: {
  batchId: string;
  newSlotId: string;
}) => {
  // Update batch location
  const { data, error } = await supabase
    .from('stock_batches')
    .update({ slot_id: transferData.newSlotId })
    .eq('id', transferData.batchId)
    .select()
    .single();

  if (error) throw error;

  // Ideally, add a transaction record for TRANSFER type here.
  // We'll skip for brevity as it requires updating the DB schema for transaction_type 'TRANSFER'.

  return data;
};

export const processOutward = async (outwardData: {
  batchId: string;
  traderId: string;
  productId: string;
  dispatchQuantity: number;
  currentAvailable: number;
  vehicleNumber: string;
  driverName?: string;
}) => {
  const { batchId, dispatchQuantity, currentAvailable, traderId, productId, vehicleNumber } = outwardData;
  const newAvailable = currentAvailable - dispatchQuantity;
  const newStatus = newAvailable === 0 ? 'FULLY_DISPATCHED' : 'PARTIALLY_DISPATCHED';

  // 1. Update Stock Batch
  const { data: batch, error: batchError } = await supabase
    .from('stock_batches')
    .update({ 
      quantity_available: newAvailable,
      status: newStatus 
    })
    .eq('id', batchId)
    .select()
    .single();

  if (batchError) throw batchError;

  // 2. Insert Transaction
  const transactionNumber = `TXN-OUT-${Date.now().toString().slice(-6)}`;
  const { error: txnError } = await supabase
    .from('inventory_transactions')
    .insert({
      transaction_number: transactionNumber,
      batch_id: batchId,
      trader_id: traderId,
      product_id: productId,
      transaction_type: 'OUTWARD',
      quantity: dispatchQuantity,
      before_quantity: currentAvailable,
      after_quantity: newAvailable,
      notes: `Outward dispatch via vehicle ${vehicleNumber}`
    });

  if (txnError) throw txnError;

  return batch;
};

// Billing & Finance
export const getInvoices = async (): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      traders:trader_id (
        id, business_name
      )
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const getUninvoicedBatches = async (traderId: string): Promise<StockBatch[]> => {
  // Get fully dispatched batches
  const { data: batches, error: batchError } = await supabase
    .from('stock_batches')
    .select(`
      *,
      products:product_id (
        id, name, unit
      )
    `)
    .eq('trader_id', traderId)
    .eq('status', 'FULLY_DISPATCHED');
    
  if (batchError) throw batchError;
  
  if (!batches || batches.length === 0) return [];

  // Get invoice items to check what's already invoiced
  const { data: invoiceItems, error: itemsError } = await supabase
    .from('invoice_items')
    .select('batch_id')
    .in('batch_id', batches.map(b => b.id));
    
  if (itemsError) throw itemsError;
  
  const invoicedBatchIds = new Set(invoiceItems.map(item => item.batch_id));
  
  // Return batches that aren't in invoice_items
  return batches.filter(b => !invoicedBatchIds.has(b.id));
};

export const generateInvoice = async (traderId: string, batchIds: string[], ratePerDay: number = 10) => {
  if (batchIds.length === 0) throw new Error("No batches selected");

  // 1. Fetch the selected batches
  const { data: batches, error: batchError } = await supabase
    .from('stock_batches')
    .select(`
      *,
      products:product_id (
        id, name
      )
    `)
    .in('id', batchIds);
    
  if (batchError) throw batchError;
  if (!batches) throw new Error("Could not find batches");

  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
  let totalAmount = 0;
  
  // Prepare invoice items
  const itemsToInsert = batches.map(batch => {
    // Calculate days between entry_date and today
    const entry = new Date(batch.entry_date);
    const today = new Date();
    // Default to at least 1 day
    const diffTime = Math.abs(today.getTime() - entry.getTime());
    const diffDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
    
    const amount = diffDays * batch.quantity_received * ratePerDay;
    totalAmount += amount;
    
    return {
      batch_id: batch.id,
      product_id: batch.product_id,
      description: `Storage for ${batch.batch_number} - ${batch.products?.name}`,
      quantity: batch.quantity_received,
      storage_days: diffDays,
      rate: ratePerDay,
      amount: amount
    };
  });

  // 2. Insert Invoice
  const due = new Date();
  due.setDate(due.getDate() + 15); // Net 15
  
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      trader_id: traderId,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: due.toISOString().split('T')[0],
      subtotal: totalAmount,
      total_amount: totalAmount,
      status: 'DRAFT'
    })
    .select()
    .single();
    
  if (invoiceError) throw invoiceError;

  // 3. Insert Invoice Items
  const itemsWithInvoiceId = itemsToInsert.map(item => ({
    ...item,
    invoice_id: invoice.id
  }));
  
  const { error: itemsInsertError } = await supabase
    .from('invoice_items')
    .insert(itemsWithInvoiceId);
    
  if (itemsInsertError) throw itemsInsertError;

  return invoice;
};

export const markInvoiceAsPaid = async (invoiceId: string) => {
  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'PAID' })
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
// Reconciliation & Audit Logs
export interface StockCount {
  id: string;
  batch_id: string;
  expected_quantity: number;
  physical_quantity: number;
  difference: number;
  reason: string;
  status: string;
  counted_at: string;
  stock_batches?: StockBatch;
}

export const getStockCounts = async (): Promise<StockCount[]> => {
  const { data, error } = await supabase
    .from('stock_counts')
    .select(`
      *,
      stock_batches:batch_id (
        batch_number,
        products:product_id (name)
      )
    `)
    .order('counted_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const logStockCount = async (data: {
  batchId: string;
  expectedQuantity: number;
  physicalQuantity: number;
  reason: string;
  userId?: string; // Optional since we are testing without Auth
}) => {
  const difference = data.physicalQuantity - data.expectedQuantity;

  let finalUserId = data.userId;
  
  if (!finalUserId) {
    // Attempt to find any existing profile to satisfy the NOT NULL constraint for testing
    const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
    if (profiles && profiles.length > 0) {
      finalUserId = profiles[0].id;
    } else {
      // If no profile exists, this will likely fail the NOT NULL constraint.
      // In a real app, the user would be logged in.
      // For testing, we might need to alter the table or ensure a profile exists.
      finalUserId = undefined; 
    }
  }

  // 1. Insert Stock Count
  const { data: countResult, error: countError } = await supabase
    .from('stock_counts')
    .insert({
      batch_id: data.batchId,
      expected_quantity: data.expectedQuantity,
      physical_quantity: data.physicalQuantity,
      difference: difference,
      reason: data.reason,
      status: 'APPROVED', 
      counted_by: finalUserId
    })
    .select()
    .single();

  if (countError) throw countError;

  // 2. Adjust Stock Batch if there is a difference
  if (difference !== 0) {
    const { data: batch, error: batchFetchError } = await supabase
      .from('stock_batches')
      .select('*')
      .eq('id', data.batchId)
      .single();
      
    if (batchFetchError) throw batchFetchError;

    const newAvailable = batch.quantity_available + difference;
    const newStatus = newAvailable <= 0 ? 'FULLY_DISPATCHED' : batch.status;

    const { error: batchUpdateError } = await supabase
      .from('stock_batches')
      .update({ 
        quantity_available: newAvailable,
        status: newStatus
      })
      .eq('id', data.batchId);

    if (batchUpdateError) throw batchUpdateError;

    // 3. Log Adjustment Transaction
    const transactionNumber = `TXN-ADJ-${Date.now().toString().slice(-6)}`;
    const { error: txnError } = await supabase
      .from('inventory_transactions')
      .insert({
        transaction_number: transactionNumber,
        batch_id: data.batchId,
        trader_id: batch.trader_id,
        product_id: batch.product_id,
        transaction_type: 'ADJUSTMENT',
        quantity: Math.abs(difference),
        before_quantity: batch.quantity_available,
        after_quantity: newAvailable,
        notes: `Stock count adjustment. Reason: ${data.reason}`
      });

    if (txnError) throw txnError;
  }

  // 4. Record Audit Log
  const { error: auditError } = await supabase
    .from('audit_logs')
    .insert({
      user_id: data.userId || null,
      action: 'STOCK_COUNT_LOGGED',
      entity_type: 'stock_counts',
      entity_id: countResult.id,
      new_data: { difference, reason: data.reason }
    });

  if (auditError) throw auditError;

  return countResult;
};

// Dashboard Metrics
export interface DashboardMetrics {
  totalInventory: number;
  activeTraders: number;
  pendingInvoices: number;
  openDiscrepancies: number;
  todayInward: number;
  todayOutward: number;
}

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  // 1. Total Inventory
  const { data: batches } = await supabase.from('stock_batches').select('quantity_available');
  const totalInventory = batches?.reduce((sum, b) => sum + Number(b.quantity_available || 0), 0) || 0;

  // 2. Active Traders
  const { count: tradersCount } = await supabase.from('traders').select('*', { count: 'exact', head: true }).eq('is_active', true);
  
  // 3. Pending Invoices
  const { count: invoicesCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'DRAFT');

  // 4. Open Discrepancies (just any stock counts that might need review, or simply all counts in the MVP)
  const { count: discrepanciesCount } = await supabase.from('stock_counts').select('*', { count: 'exact', head: true }).eq('status', 'PENDING');

  // 5. Today's Transactions
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { data: todayTxns } = await supabase
    .from('inventory_transactions')
    .select('transaction_type, quantity')
    .gte('transaction_date', startOfDay.toISOString());

  const todayInward = todayTxns?.filter(t => t.transaction_type === 'INWARD').reduce((sum, t) => sum + Number(t.quantity || 0), 0) || 0;
  const todayOutward = todayTxns?.filter(t => t.transaction_type === 'OUTWARD').reduce((sum, t) => sum + Number(t.quantity || 0), 0) || 0;

  return {
    totalInventory,
    activeTraders: tradersCount || 0,
    pendingInvoices: invoicesCount || 0,
    openDiscrepancies: discrepanciesCount || 0,
    todayInward,
    todayOutward
  };
};

export const getRecentTransactions = async () => {
  const { data, error } = await supabase
    .from('inventory_transactions')
    .select(`
      *,
      traders:trader_id (business_name)
    `)
    .order('transaction_date', { ascending: false })
    .limit(10);
    
  if (error) throw error;
  return data;
};
