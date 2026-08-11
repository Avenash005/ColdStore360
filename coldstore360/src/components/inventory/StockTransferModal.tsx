import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRooms, getRacks, getSlots, transferStock } from '../../lib/api';

interface StockTransferModalProps {
  batchId: string;
  currentSlotId?: string;
  batchQuantity: number;
  onClose: () => void;
}

const StockTransferModal: React.FC<StockTransferModalProps> = ({ batchId, currentSlotId, batchQuantity, onClose }) => {
  const queryClient = useQueryClient();
  const [roomId, setRoomId] = useState('');
  const [rackId, setRackId] = useState('');
  const [slotId, setSlotId] = useState('');
  
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({ queryKey: ['rooms'], queryFn: () => getRooms() });
  
  const { data: racks = [], isLoading: racksLoading } = useQuery({ 
    queryKey: ['racks', roomId], 
    queryFn: () => getRacks(roomId),
    enabled: !!roomId
  });
  
  const { data: slots = [], isLoading: slotsLoading } = useQuery({ 
    queryKey: ['slots', rackId], 
    queryFn: () => getSlots(rackId),
    enabled: !!rackId
  });

  const mutation = useMutation({
    mutationFn: transferStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_batches'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['racks'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotId) return;
    mutation.mutate({ batchId, newSlotId: slotId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/50 backdrop-blur-sm">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-lg border border-outline-variant overflow-hidden flex flex-col">
        <div className="p-6 border-b border-outline-variant flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Transfer Stock</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
            Move batch {batchId.split('-')[0]}... to a new location. Quantity: {batchQuantity}
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface">New Room</label>
              <select 
                required
                value={roomId}
                onChange={e => { setRoomId(e.target.value); setRackId(''); setSlotId(''); }}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-shadow font-body-sm px-3 py-2"
                disabled={roomsLoading}
              >
                <option value="" disabled>Select a room...</option>
                {rooms.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.name} (Avail: {r.available_capacity})</option>
                ))}
              </select>
            </div>

            {roomId && (
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface">New Rack</label>
                <select 
                  required
                  value={rackId}
                  onChange={e => { setRackId(e.target.value); setSlotId(''); }}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-shadow font-body-sm px-3 py-2"
                  disabled={racksLoading}
                >
                  <option value="" disabled>Select a rack...</option>
                  {racks.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.name} (Avail: {r.capacity - r.occupied_capacity})</option>
                  ))}
                </select>
              </div>
            )}

            {rackId && (
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface">New Slot</label>
                <select 
                  required
                  value={slotId}
                  onChange={e => setSlotId(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-shadow font-body-sm px-3 py-2"
                  disabled={slotsLoading}
                >
                  <option value="" disabled>Select a slot...</option>
                  {slots.map((s: any) => {
                    const avail = s.capacity - s.occupied_capacity;
                    const disabled = avail < batchQuantity || s.id === currentSlotId;
                    return (
                      <option key={s.id} value={s.id} disabled={disabled}>
                        Slot {s.code} (Avail: {avail}) {s.id === currentSlotId ? '- Current' : disabled ? '- Insufficient space' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        </form>

        <div className="p-4 border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-on-surface-variant font-label-md hover:bg-surface-container-low rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={mutation.isPending || !slotId}
            className="px-4 py-2 bg-primary text-on-primary font-label-md rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Transferring...' : 'Transfer Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockTransferModal;
