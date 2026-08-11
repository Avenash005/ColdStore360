import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStockCounts, getInventoryBatches, logStockCount } from '../lib/api';

const Reconciliation = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [physicalQty, setPhysicalQty] = useState('');
  const [reason, setReason] = useState('');

  const { data: counts = [], isLoading: countsLoading } = useQuery({
    queryKey: ['stock_counts'],
    queryFn: getStockCounts
  });

  const { data: batches = [] } = useQuery({
    queryKey: ['inventory_batches'],
    queryFn: getInventoryBatches
  });

  const selectedBatch = batches.find(b => b.id === selectedBatchId);
  const expectedQty = selectedBatch?.quantity_available || 0;
  const pQty = Number(physicalQty) || 0;
  const difference = selectedBatch ? pQty - expectedQty : 0;

  const logMutation = useMutation({
    mutationFn: (data: { batchId: string; expectedQuantity: number; physicalQuantity: number; reason: string }) => 
      logStockCount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_counts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory_batches'] });
      setIsModalOpen(false);
      setSelectedBatchId('');
      setPhysicalQty('');
      setReason('');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBatch) {
      logMutation.mutate({
        batchId: selectedBatch.id,
        expectedQuantity: expectedQty,
        physicalQuantity: pQty,
        reason
      });
    }
  };

  const activeBatches = batches.filter(b => b.status !== 'FULLY_DISPATCHED');

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Reconciliation</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Log physical stock counts and audit discrepancies.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary rounded text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">fact_check</span>
            Log Stock Count
          </button>
        </div>
      </div>

      {/* Discrepancy History Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-headline-md text-headline-md text-on-surface">Stock Count History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="font-label-md text-label-md text-on-surface-variant py-3 px-4">Date</th>
                <th className="font-label-md text-label-md text-on-surface-variant py-3 px-4">Batch</th>
                <th className="font-label-md text-label-md text-on-surface-variant py-3 px-4 text-right">System Qty</th>
                <th className="font-label-md text-label-md text-on-surface-variant py-3 px-4 text-right">Physical Qty</th>
                <th className="font-label-md text-label-md text-on-surface-variant py-3 px-4 text-right">Difference</th>
                <th className="font-label-md text-label-md text-on-surface-variant py-3 px-4">Reason</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm">
              {countsLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant">Loading records...</td>
                </tr>
              ) : counts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant">No stock counts logged yet.</td>
                </tr>
              ) : (
                counts.map((c) => (
                  <tr key={c.id} className="border-b border-outline-variant hover:bg-[#F1F5F9] transition-colors">
                    <td className="py-2.5 px-4 text-on-surface-variant">{new Date(c.counted_at).toLocaleString()}</td>
                    <td className="py-2.5 px-4 font-mono-sm text-mono-sm text-on-surface">
                      {c.stock_batches?.batch_number}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono-sm text-on-surface">{c.expected_quantity}</td>
                    <td className="py-2.5 px-4 text-right font-mono-sm text-on-surface">{c.physical_quantity}</td>
                    <td className="py-2.5 px-4 text-right">
                      {c.difference === 0 ? (
                        <span className="text-on-surface-variant">Match</span>
                      ) : c.difference > 0 ? (
                        <span className="text-primary font-bold">+{c.difference}</span>
                      ) : (
                        <span className="text-error font-bold">{c.difference}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-on-surface">{c.reason || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Stock Count Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 p-4">
          <div className="bg-surface-container-lowest rounded-lg shadow-lg w-full max-w-lg border border-outline-variant flex flex-col">
            <div className="p-5 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-on-surface">Log Physical Count</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface">Select Batch</label>
                <select 
                  required
                  value={selectedBatchId}
                  onChange={e => {
                    setSelectedBatchId(e.target.value);
                    setPhysicalQty('');
                  }}
                  className="w-full h-[40px] px-3 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                >
                  <option value="" disabled>Select an active batch...</option>
                  {activeBatches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.batch_number} - {b.products?.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBatch && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-label-md text-label-md text-on-surface-variant">System Quantity</label>
                      <div className="h-[40px] px-3 bg-surface-container-low border border-outline-variant rounded flex items-center text-on-surface font-mono-sm text-mono-sm">
                        {expectedQty} {selectedBatch.unit}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-md text-label-md text-on-surface">Physical Quantity</label>
                      <input 
                        type="number"
                        required
                        min="0"
                        value={physicalQty}
                        onChange={e => setPhysicalQty(e.target.value)}
                        className="w-full h-[40px] px-3 bg-surface-container-lowest border border-outline-variant text-on-surface font-mono-sm text-mono-sm rounded focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {physicalQty !== '' && difference !== 0 && (
                    <div className={`p-3 rounded border ${difference < 0 ? 'bg-error-container border-error text-error' : 'bg-[#E0E7FF] border-[#3730A3] text-[#3730A3]'}`}>
                      <p className="font-label-md flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">
                          {difference < 0 ? 'warning' : 'info'}
                        </span>
                        {difference < 0 ? 'Shortage Detected' : 'Excess Detected'}: {Math.abs(difference)} {selectedBatch.unit}
                      </p>
                      <p className="text-[12px] mt-1 opacity-80">
                        Submitting this will automatically adjust the inventory ledger.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface">Reason / Notes</label>
                    <textarea 
                      required
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      rows={2}
                      className="w-full p-3 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                      placeholder={difference < 0 ? "E.g., Spoiled goods disposed" : "E.g., Found unaccounted pallets"}
                    />
                  </div>
                </>
              )}
              
              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant text-on-surface font-label-md rounded hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={logMutation.isPending || !selectedBatchId}
                  className={`px-4 py-2 font-label-md rounded transition-colors disabled:opacity-50 text-white ${difference < 0 ? 'bg-error hover:bg-error/90' : 'bg-primary hover:bg-primary/90'}`}
                >
                  {logMutation.isPending ? 'Logging...' : 'Confirm Count & Adjust'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default Reconciliation;
