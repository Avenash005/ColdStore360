import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTraders, getProducts, processInward, getRooms, getRacks, getSlots } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const Inward = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    traderId: '',
    productId: '',
    quantity: '',
    roomId: '',
    rackId: '',
    slotId: '',
    vehicleNumber: '',
    driverName: '',
  });

  const { data: traders = [], isLoading: tradersLoading } = useQuery({ queryKey: ['traders'], queryFn: getTraders });
  const { data: products = [], isLoading: productsLoading } = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: () => getRooms() });
  
  const { data: racks = [] } = useQuery({ 
    queryKey: ['racks', formData.roomId], 
    queryFn: () => getRacks(formData.roomId),
    enabled: !!formData.roomId
  });
  
  const { data: slots = [] } = useQuery({ 
    queryKey: ['slots', formData.rackId], 
    queryFn: () => getSlots(formData.rackId),
    enabled: !!formData.rackId
  });

  const mutation = useMutation({
    mutationFn: processInward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_batches'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['racks'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      navigate('/inventory');
    }
  });

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 5) {
      mutation.mutate({
        traderId: formData.traderId,
        productId: formData.productId,
        quantity: Number(formData.quantity),
        vehicleNumber: formData.vehicleNumber,
        driverName: formData.driverName,
        slotId: formData.slotId
      });
    } else {
      handleNext();
    }
  };

  const selectedTrader = traders.find(t => t.id === formData.traderId);
  const selectedProduct = products.find(p => p.id === formData.productId);
  const selectedRoom = rooms.find(r => r.id === formData.roomId);
  const selectedRack = racks.find(r => r.id === formData.rackId);
  const selectedSlot = slots.find(s => s.id === formData.slotId);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Receive Stock</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Inward Processing</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-8 border-b border-surface-variant pb-4 overflow-x-auto">
        <ol className="flex items-center w-full min-w-[600px]">
          {[
            { num: 1, label: 'Trader & Product' },
            { num: 2, label: 'Quantity' },
            { num: 3, label: 'Location' },
            { num: 4, label: 'Vehicle Details' },
            { num: 5, label: 'Review' }
          ].map((s, idx) => (
            <li key={s.num} className={`flex ${idx < 4 ? 'w-full' : ''} items-center ${step > s.num ? 'text-on-surface-variant' : step === s.num ? 'text-secondary' : 'text-surface-variant'} ${idx < 4 ? "after:content-[''] after:w-full after:h-px after:border-b after:border-surface-variant after:border-solid after:inline-block" : ""}`}>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full lg:h-8 lg:w-8 shrink-0 mr-2 font-mono-sm border ${step > s.num ? 'bg-surface-container-low border-surface-variant' : step === s.num ? 'bg-secondary text-on-secondary border-secondary' : 'bg-surface-container-lowest border-surface-variant text-on-surface-variant'}`}>
                {step > s.num ? <span className="material-symbols-outlined text-[14px]">check</span> : s.num}
              </span>
              <span className={`font-label-md text-label-md mr-4 whitespace-nowrap ${step === s.num ? 'font-bold' : ''}`}>{s.label}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-surface-variant rounded-lg p-6 shadow-sm">
          
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-surface-variant pb-2">Select Trader & Product</h3>
              
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                  Trader <span className="text-error">*</span>
                </label>
                <select 
                  required
                  value={formData.traderId}
                  onChange={e => setFormData({...formData, traderId: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-surface-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-50 focus:outline-none transition-shadow font-body-sm text-body-sm text-on-surface px-3 py-2"
                >
                  <option value="" disabled>Select a trader...</option>
                  {traders.map(t => (
                    <option key={t.id} value={t.id}>{t.business_name} ({t.trader_code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                  Product <span className="text-error">*</span>
                </label>
                <select 
                  required
                  value={formData.productId}
                  onChange={e => setFormData({...formData, productId: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-surface-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-50 focus:outline-none transition-shadow font-body-sm text-body-sm text-on-surface px-3 py-2"
                >
                  <option value="" disabled>Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.category}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-surface-variant pb-2">Enter Quantity</h3>
              
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                  Quantity ({selectedProduct?.unit || 'Units'}) <span className="text-error">*</span>
                </label>
                <input 
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-surface-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-50 focus:outline-none transition-shadow font-body-sm text-body-sm text-on-surface px-3 py-2 font-mono-sm"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-surface-variant pb-2">Storage Location</h3>
              
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                  Room <span className="text-error">*</span>
                </label>
                <select 
                  required
                  value={formData.roomId}
                  onChange={e => setFormData({...formData, roomId: e.target.value, rackId: '', slotId: ''})}
                  className="w-full bg-surface-container-lowest border border-surface-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-50 focus:outline-none transition-shadow font-body-sm text-body-sm text-on-surface px-3 py-2"
                >
                  <option value="" disabled>Select a room...</option>
                  {rooms.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.name} (Avail: {r.available_capacity})</option>
                  ))}
                </select>
              </div>

              {formData.roomId && (
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                    Rack <span className="text-error">*</span>
                  </label>
                  <select 
                    required
                    value={formData.rackId}
                    onChange={e => setFormData({...formData, rackId: e.target.value, slotId: ''})}
                    className="w-full bg-surface-container-lowest border border-surface-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-50 focus:outline-none transition-shadow font-body-sm text-body-sm text-on-surface px-3 py-2"
                  >
                    <option value="" disabled>Select a rack...</option>
                    {racks.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.name} (Avail: {r.capacity - r.occupied_capacity})</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.rackId && (
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                    Slot <span className="text-error">*</span>
                  </label>
                  <select 
                    required
                    value={formData.slotId}
                    onChange={e => setFormData({...formData, slotId: e.target.value})}
                    className="w-full bg-surface-container-lowest border border-surface-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-50 focus:outline-none transition-shadow font-body-sm text-body-sm text-on-surface px-3 py-2"
                  >
                    <option value="" disabled>Select a slot...</option>
                    {slots.map((s: any) => {
                      const avail = s.capacity - s.occupied_capacity;
                      const disabled = avail < Number(formData.quantity);
                      return (
                        <option key={s.id} value={s.id} disabled={disabled}>
                          Slot {s.code} (Avail: {avail}) {disabled ? '- Insufficient space' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-surface-variant pb-2">Vehicle Details</h3>
              
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                  Vehicle Number <span className="text-error">*</span>
                </label>
                <input 
                  type="text"
                  required
                  value={formData.vehicleNumber}
                  onChange={e => setFormData({...formData, vehicleNumber: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-surface-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-50 focus:outline-none transition-shadow font-body-sm text-body-sm text-on-surface px-3 py-2 uppercase"
                  placeholder="e.g. MH 04 AB 1234"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                  Driver Name
                </label>
                <input 
                  type="text"
                  value={formData.driverName}
                  onChange={e => setFormData({...formData, driverName: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-surface-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-50 focus:outline-none transition-shadow font-body-sm text-body-sm text-on-surface px-3 py-2"
                  placeholder="Driver's Full Name"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-surface-variant pb-2">Review Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b border-surface-variant pb-2">
                  <span className="text-on-surface-variant">Trader:</span>
                  <span className="font-medium text-on-surface">{selectedTrader?.business_name}</span>
                </div>
                <div className="flex justify-between border-b border-surface-variant pb-2">
                  <span className="text-on-surface-variant">Product:</span>
                  <span className="font-medium text-on-surface">{selectedProduct?.name}</span>
                </div>
                <div className="flex justify-between border-b border-surface-variant pb-2">
                  <span className="text-on-surface-variant">Quantity:</span>
                  <span className="font-mono-sm font-medium text-on-surface">{formData.quantity} {selectedProduct?.unit}</span>
                </div>
                <div className="flex justify-between border-b border-surface-variant pb-2">
                  <span className="text-on-surface-variant">Location:</span>
                  <span className="font-mono-sm text-on-surface">{selectedRoom?.name} &gt; {selectedRack?.name} &gt; {selectedSlot?.code}</span>
                </div>
                <div className="flex justify-between border-b border-surface-variant pb-2">
                  <span className="text-on-surface-variant">Vehicle:</span>
                  <span className="font-mono-sm text-on-surface">{formData.vehicleNumber}</span>
                </div>
              </div>
            </div>
          )}

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
              {mutation.isPending ? 'Processing...' : step === 5 ? 'Confirm & Receive' : 'Next Step'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-5 shadow-sm">
            <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-4 border-b border-surface-variant pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Workflow Info
            </h3>
            <p className="font-body-sm text-on-surface-variant mb-4">
              Ensure physical verification of goods before completing the inward process. The system will automatically generate a batch number and record the transaction.
            </p>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default Inward;
