import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { getRooms } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const Rooms = () => {
  const navigate = useNavigate();
  
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => getRooms()
  });

  if (roomsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[500px]">
          <p className="text-on-surface-variant">Loading rooms...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Storage Rooms</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage physical storage spaces and capacity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => {
          const usagePercent = room.capacity > 0 ? (room.occupied_capacity / room.capacity) * 100 : 0;
          return (
            <div key={room.id} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">ac_unit</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">{room.name}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-medium bg-surface-variant text-on-surface-variant">
                      {room.temp_min}°C to {room.temp_max}°C
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 mt-2 space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <p className="font-label-md text-label-md text-on-surface-variant">Occupancy</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {room.occupied_capacity} / {room.capacity}
                    </p>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${usagePercent > 90 ? 'bg-error' : usagePercent > 70 ? 'bg-primary' : 'bg-secondary'}`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant mb-1">Type</p>
                  <p className="font-body-md text-body-md text-on-surface">{room.type}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-outline-variant text-center">
                <button 
                  onClick={() => navigate(`/rooms/${room.id}`)}
                  className="text-secondary font-label-md text-label-md hover:text-secondary/80 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default Rooms;
