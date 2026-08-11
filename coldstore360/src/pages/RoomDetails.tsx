import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../components/layout/DashboardLayout';
import { getRooms, getRacks, getSlots } from '../lib/api';

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => getRooms()
  });

  const room = rooms.find(r => r.id === id);

  const { data: racks = [], isLoading: racksLoading } = useQuery({
    queryKey: ['racks', id],
    queryFn: () => getRacks(id),
    enabled: !!id
  });

  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ['slots'],
    queryFn: () => getSlots(),
    enabled: racks.length > 0
  });

  if (roomsLoading || racksLoading || slotsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[500px]">
          <p className="text-on-surface-variant">Loading room details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!room) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <p className="text-on-surface-variant mb-4">Room not found</p>
          <button onClick={() => navigate('/rooms')} className="btn-primary">Back to Rooms</button>
        </div>
      </DashboardLayout>
    );
  }

  const usagePercent = room.capacity > 0 ? (room.occupied_capacity / room.capacity) * 100 : 0;

  // Group slots by rack
  const slotsByRack = slots.reduce((acc, slot) => {
    if (!acc[slot.rack_id]) acc[slot.rack_id] = [];
    acc[slot.rack_id].push(slot);
    return acc;
  }, {} as Record<string, typeof slots>);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/rooms')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="font-label-lg text-label-lg">Back to Rooms</span>
        </button>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">{room.name} ({room.code})</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">{room.type} • {room.temp_min}°C to {room.temp_max}°C</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 min-w-[250px]">
            <div className="flex justify-between items-end mb-1">
              <p className="font-label-md text-label-md text-on-surface-variant">Overall Occupancy</p>
              <p className="font-label-md text-label-md text-on-surface-variant">
                {room.occupied_capacity} / {room.capacity}
              </p>
            </div>
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden mt-2">
              <div 
                className={`h-full ${usagePercent > 90 ? 'bg-error' : usagePercent > 70 ? 'bg-primary' : 'bg-secondary'}`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="font-headline-md text-headline-md text-on-surface">Storage Layout</h3>
        
        {racks.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">shelves</span>
            <p className="font-body-lg text-body-lg text-on-surface">No racks found</p>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">This room does not have any racks configured yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {racks.map(rack => (
              <div key={rack.id} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-outline-variant">
                  <div>
                    <h4 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-secondary">shelves</span>
                      {rack.name} ({rack.code})
                    </h4>
                  </div>
                  <div className="text-right">
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Capacity</p>
                    <p className="font-body-md text-body-md text-on-surface">{rack.occupied_capacity} / {rack.capacity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(slotsByRack[rack.id] || []).map(slot => {
                    const slotUsage = slot.capacity > 0 ? (slot.occupied_capacity / slot.capacity) * 100 : 0;
                    const isFull = slotUsage >= 100;
                    const isEmpty = slot.occupied_capacity === 0;

                    return (
                      <div 
                        key={slot.id} 
                        className={`p-3 rounded border flex flex-col justify-between ${
                          isFull 
                            ? 'bg-error-container/20 border-error-container' 
                            : isEmpty 
                              ? 'bg-surface-container border-outline-variant border-dashed'
                              : 'bg-primary-container/10 border-primary-container/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-label-md text-label-md text-on-surface">Slot {slot.code}</span>
                          {isFull && <span className="material-symbols-outlined text-[16px] text-error">warning</span>}
                        </div>
                        
                        <div>
                          <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">
                            {slot.occupied_capacity} / {slot.capacity}
                          </p>
                          <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${isFull ? 'bg-error' : isEmpty ? 'bg-transparent' : 'bg-primary'}`}
                              style={{ width: `${Math.min(slotUsage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RoomDetails;
