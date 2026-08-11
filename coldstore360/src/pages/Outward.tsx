import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTraders, getAvailableBatchesForTrader, processOutward } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const Outward = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    traderId: '',
    batchId: '',
    dispatchQuantity: '',
    vehicleNumber: '',
    driverName: '',
  });

  const { data: traders = [], isLoading: tradersLoading } = useQuery({
    queryKey: ['traders'],
    queryFn: getTraders
  });

  const { data: availableBatches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ['available_batches', formData.traderId],
    queryFn: () => getAvailableBatchesForTrader(formData.traderId),
    enabled: !!formData.traderId
  });

  const mutation = useMutation({
    mutationFn: processOutward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_batches'] });
      queryClient.invalidateQueries({ queryKey: ['available_batches'] });
      setStep(5); // Success step
    }
  });

  const selectedTrader = traders.find(t => t.id === formData.traderId);
  const selectedBatch = availableBatches.find(b => b.id === formData.batchId);

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 4) {
      if (!selectedBatch) return;
      mutation.mutate({
        batchId: formData.batchId,
        traderId: formData.traderId,
        productId: selectedBatch.product_id,
        dispatchQuantity: Number(formData.dispatchQuantity),
        currentAvailable: selectedBatch.quantity_available,
        vehicleNumber: formData.vehicleNumber,
        driverName: formData.driverName,
      });
    } else {
      handleNext();
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-display text-on-surface">Dispatch Stock</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Process outbound shipments and generate gate passes.</p>
        </div>
      </div>

      {/* Stepper Progress */}
      {step < 5 && (
        <div className="mb-8 border-b border-surface-variant pb-4">
          <ol className="flex items-center w-full">
            {[
              { num: 1, label: 'Trader' },
              { num: 2, label: 'Batch & Qty' },
              { num: 3, label: 'Vehicle' },
              { num: 4, label: 'Review' }
            ].map((s, idx) => (
              <li key={s.num} className={`flex ${idx < 3 ? 'w-full' : ''} items-center ${step > s.num ? 'text-on-surface-variant' : step === s.num ? 'text-secondary' : 'text-surface-variant'} ${idx < 3 ? "after:content-[''] after:w-full after:h-px after:border-b after:border-surface-variant after:border-solid after:inline-block" : ""}`}>
                <span className={`flex items-center justify-center w-6 h-6 rounded-full lg:h-8 lg:w-8 shrink-0 mr-2 font-mono-sm border ${step > s.num ? 'bg-surface-container-low border-surface-variant' : step === s.num ? 'bg-secondary text-on-secondary border-secondary' : 'bg-surface-container-lowest border-surface-variant text-on-surface-variant'}`}>
                  {step > s.num ? <span className="material-symbols-outlined text-[14px]">check</span> : s.num}
                </span>
                <span className={`font-label-md text-label-md mr-4 whitespace-nowrap ${step === s.num ? 'font-bold' : ''}`}>{s.label}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm">
        
        {step === 1 && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant pb-4">Select Trader</h3>
            
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface">Trader <span className="text-error">*</span></label>
              <select 
                required
                value={formData.traderId}
                onChange={e => {
                  setFormData({...formData, traderId: e.target.value, batchId: '', dispatchQuantity: ''});
                }}
                className="w-full h-[40px] px-3 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 appearance-none cursor-pointer"
              >
                <option value="" disabled>Select Trader...</option>
                {traders.map(t => (
                  <option key={t.id} value={t.id}>{t.business_name} ({t.trader_code})</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant pb-4">Select Batch & Quantity</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface">Available Batches <span className="text-error">*</span></label>
                <select 
                  required
                  value={formData.batchId}
                  onChange={e => setFormData({...formData, batchId: e.target.value, dispatchQuantity: ''})}
                  className="w-full h-[40px] px-3 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select a batch...</option>
                  {availableBatches.map((b: any) => {
                    const loc = b.slots ? `${b.slots?.racks?.rooms?.name} > ${b.slots?.racks?.name} > ${b.slots?.code}` : 'No Location';
                    return (
                      <option key={b.id} value={b.id}>
                        {b.batch_number} - {b.products?.name} ({b.quantity_available} {b.unit} avail) [{loc}]
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface">Dispatch Quantity <span className="text-error">*</span></label>
                <input 
                  type="number"
                  required
                  min="1"
                  max={selectedBatch?.quantity_available || 1}
                  value={formData.dispatchQuantity}
                  onChange={e => setFormData({...formData, dispatchQuantity: e.target.value})}
                  disabled={!formData.batchId}
                  className="w-full h-[40px] px-3 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 placeholder:text-outline disabled:opacity-50"
                  placeholder="0"
                />
                {selectedBatch && (
                   <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">
                     Max available: {selectedBatch.quantity_available} {selectedBatch.unit}
                   </p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant pb-4">Vehicle Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface">Vehicle Number <span className="text-error">*</span></label>
                <input 
                  type="text" 
                  required
                  value={formData.vehicleNumber}
                  onChange={e => setFormData({...formData, vehicleNumber: e.target.value})}
                  placeholder="e.g. MH-12-AB-3456"
                  className="w-full h-[40px] px-3 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 placeholder:text-outline uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface">Driver Name</label>
                <input 
                  type="text" 
                  value={formData.driverName}
                  onChange={e => setFormData({...formData, driverName: e.target.value})}
                  placeholder="Name and Contact"
                  className="w-full h-[40px] px-3 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 placeholder:text-outline"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant pb-4">Review Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b border-surface-variant pb-2">
                <span className="text-on-surface-variant">Trader:</span>
                <span className="font-medium text-on-surface">{selectedTrader?.business_name}</span>
              </div>
              <div className="flex justify-between border-b border-surface-variant pb-2">
                <span className="text-on-surface-variant">Batch / Product:</span>
                <span className="font-medium text-on-surface">{selectedBatch?.batch_number} - {selectedBatch?.products?.name}</span>
              </div>
              <div className="flex justify-between border-b border-surface-variant pb-2">
                <span className="text-on-surface-variant">Location:</span>
                <span className="font-mono-sm text-on-surface">
                  {selectedBatch?.slots ? `${selectedBatch.slots.racks?.rooms?.name} > ${selectedBatch.slots.racks?.name} > Slot ${selectedBatch.slots.code}` : 'No Location'}
                </span>
              </div>
              <div className="flex justify-between border-b border-surface-variant pb-2">
                <span className="text-on-surface-variant">Dispatch Qty:</span>
                <span className="font-mono-sm font-medium text-on-surface">{formData.dispatchQuantity} {selectedBatch?.unit}</span>
              </div>
              <div className="flex justify-between border-b border-surface-variant pb-2">
                <span className="text-on-surface-variant">Vehicle:</span>
                <span className="font-mono-sm text-on-surface">{formData.vehicleNumber}</span>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 text-center py-8">
            <div className="w-16 h-16 bg-[#DCFCE7] text-[#166534] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">check</span>
            </div>
            <h3 className="font-display text-display text-on-surface">Dispatch Successful!</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
              The stock has been marked as dispatched. The inventory has been updated and a gate pass is ready for printing.
            </p>
            
            <div className="mt-8 flex justify-center gap-4">
              <button 
                type="button"
                onClick={() => navigate('/inventory')}
                className="px-6 py-2 border border-outline-variant text-on-surface font-label-md rounded hover:bg-surface-container-low transition-colors"
              >
                View Inventory
              </button>
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-2 bg-primary text-on-primary font-label-md text-label-md rounded hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                Print Gate Pass
              </button>
            </div>
          </div>
        )}

        {step < 5 && (
          <div className="mt-8 pt-6 border-t border-surface-variant flex justify-between">
            <button 
              type="button" 
              onClick={handleBack}
              disabled={step === 1 || mutation.isPending}
              className="px-6 py-2 border border-outline-variant text-on-surface font-label-md rounded hover:bg-surface-container-low transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button 
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2 bg-primary text-on-primary font-label-md rounded flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? 'Processing...' : step === 4 ? 'Confirm Dispatch' : 'Next Step'}
            </button>
          </div>
        )}
      </form>
    </DashboardLayout>
  );
};

export default Outward;
