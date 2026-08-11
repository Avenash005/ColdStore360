import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInvoices, getTraders, getUninvoicedBatches, generateInvoice, markInvoiceAsPaid } from '../lib/api';

const Finance = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTraderId, setSelectedTraderId] = useState('');
  const [rate, setRate] = useState('10');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices
  });

  const { data: traders = [] } = useQuery({
    queryKey: ['traders'],
    queryFn: getTraders
  });

  const { data: uninvoicedBatches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ['uninvoiced', selectedTraderId],
    queryFn: () => getUninvoicedBatches(selectedTraderId),
    enabled: !!selectedTraderId
  });

  const generateMutation = useMutation({
    mutationFn: (data: { traderId: string; batchIds: string[]; rate: number }) => 
      generateInvoice(data.traderId, data.batchIds, data.rate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['uninvoiced'] });
      setIsModalOpen(false);
      setSelectedTraderId('');
    }
  });

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (uninvoicedBatches.length > 0 && selectedTraderId) {
      generateMutation.mutate({
        traderId: selectedTraderId,
        batchIds: uninvoicedBatches.map(b => b.id),
        rate: Number(rate)
      });
    }
  };

  const markPaidMutation = useMutation({
    mutationFn: markInvoiceAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PAID': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#DCFCE7] text-[#166534]">Paid</span>;
      case 'DRAFT': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container-high text-on-surface-variant">Draft</span>;
      case 'ISSUED': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#E0E7FF] text-[#3730A3]">Issued</span>;
      case 'OVERDUE': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-error-container text-error">Overdue</span>;
      default: return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FEF9C3] text-[#854D0E]">{status}</span>;
    }
  };

  const handleComingSoon = () => alert('Feature coming soon!');

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter(inv => 
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.traders?.business_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime();
      if (sortBy === 'date_asc') return new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime();
      if (sortBy === 'amount_desc') return Number(b.total_amount) - Number(a.total_amount);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  // Metrics calculation
  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const pendingCount = invoices.filter(i => i.status !== 'PAID').length;
  const pendingAmount = invoices.filter(i => i.status !== 'PAID').reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const paidAmount = invoices.filter(i => i.status === 'PAID').reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Finance</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Overview and invoice management</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleComingSoon} className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary rounded text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Generate Invoice
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Billed</span>
            <div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-sm">account_balance_wallet</span>
            </div>
          </div>
          <div>
            <div className="font-display text-display text-on-surface font-semibold font-mono-sm text-mono-sm tracking-tight">
              ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Pending</span>
            <div className="w-8 h-8 rounded-full bg-surface-tint/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-surface-tint text-sm">pending_actions</span>
            </div>
          </div>
          <div>
            <div className="font-display text-display text-on-surface font-semibold font-mono-sm text-mono-sm tracking-tight">
              ₹{pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center mt-2 text-on-surface-variant font-body-sm text-body-sm gap-1">
              <span>{pendingCount} Invoices pending</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Paid</span>
            <div className="w-8 h-8 rounded-full bg-[#166534]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#166534] text-sm">check_circle</span>
            </div>
          </div>
          <div>
            <div className="font-display text-display text-on-surface font-semibold font-mono-sm text-mono-sm tracking-tight">
              ₹{paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Overdue</span>
            <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-sm">warning</span>
            </div>
          </div>
          <div>
            <div className="font-display text-display text-on-surface font-semibold font-mono-sm text-mono-sm tracking-tight">
              {overdueCount}
            </div>
            <div className="flex items-center mt-2 text-error font-body-sm text-body-sm gap-1">
              <span>Invoices overdue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm">
        <div className="p-4 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-headline-md text-headline-md text-on-surface">Recent Invoices</h3>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Search invoices..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-body-sm text-on-surface focus:border-secondary outline-none w-full md:w-64"
            />
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-row-height-sm py-1.5 px-3 pr-8 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary appearance-none cursor-pointer"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="font-label-md text-label-md text-on-surface-variant py-3 px-4 w-[120px]">Invoice ID</th>
                <th className="font-label-md text-label-md text-on-surface-variant py-3 px-4">Trader Name</th>
                <th className="font-label-md text-label-md text-on-surface-variant py-3 px-4 w-[140px]">Date</th>
                <th className="font-label-md text-label-md text-on-surface-variant py-3 px-4 w-[140px] text-right">Amount</th>
                <th className="font-label-md text-label-md text-on-surface-variant py-3 px-4 w-[120px]">Status</th>
                <th className="font-label-md text-label-md text-on-surface-variant py-3 px-4 w-[120px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant">Loading invoices...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant">No invoices found.</td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-outline-variant hover:bg-[#F1F5F9] transition-colors group">
                    <td className="py-2.5 px-4 font-mono-sm text-mono-sm text-on-surface">{inv.invoice_number}</td>
                    <td className="py-2.5 px-4 text-on-surface font-medium">{inv.traders?.business_name}</td>
                    <td className="py-2.5 px-4 text-on-surface-variant">{inv.invoice_date}</td>
                    <td className="py-2.5 px-4 font-mono-sm text-mono-sm text-on-surface text-right">₹{Number(inv.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-4">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {inv.status !== 'PAID' && (
                        <button
                          onClick={() => markPaidMutation.mutate(inv.id)}
                          className="px-2 py-1 bg-[#166534] text-white text-[11px] font-medium rounded hover:bg-[#166534]/90 transition-colors"
                        >
                          Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 p-4">
          <div className="bg-surface-container-lowest rounded-lg shadow-lg w-full max-w-lg border border-outline-variant flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-on-surface">Generate Invoice</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleGenerateInvoice} className="p-5 overflow-y-auto space-y-4">
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface">Select Trader</label>
                <select 
                  required
                  value={selectedTraderId}
                  onChange={e => setSelectedTraderId(e.target.value)}
                  className="w-full h-[40px] px-3 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                >
                  <option value="" disabled>Select Trader...</option>
                  {traders.map(t => (
                    <option key={t.id} value={t.id}>{t.business_name}</option>
                  ))}
                </select>
              </div>

              {selectedTraderId && (
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface">Daily Storage Rate (₹ per Pallet)</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    value={rate}
                    onChange={e => setRate(e.target.value)}
                    className="w-full h-[40px] px-3 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
              )}

              {selectedTraderId && (
                <div className="mt-4 p-4 bg-surface-container-low rounded border border-outline-variant">
                  <h4 className="font-label-md text-label-md text-on-surface mb-2">Uninvoiced Dispatched Batches</h4>
                  {batchesLoading ? (
                    <p className="text-body-sm text-on-surface-variant">Checking batches...</p>
                  ) : uninvoicedBatches.length > 0 ? (
                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                      {uninvoicedBatches.map(b => (
                        <li key={b.id} className="text-body-sm text-on-surface-variant flex justify-between border-b border-surface-variant pb-1">
                          <span>{b.batch_number} - {b.products?.name}</span>
                          <span className="font-mono-sm">{b.quantity_received} {b.unit}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-body-sm text-error">No fully dispatched, uninvoiced batches found for this trader.</p>
                  )}
                </div>
              )}
              
              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant mt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant text-on-surface font-label-md rounded hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={generateMutation.isPending || uninvoicedBatches.length === 0}
                  className="px-4 py-2 bg-primary text-on-primary font-label-md rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {generateMutation.isPending ? 'Generating...' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default Finance;
