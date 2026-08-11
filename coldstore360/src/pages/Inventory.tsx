import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInventoryBatches, deleteInventoryBatch } from '../lib/api';
import ActionDropdown from '../components/ui/ActionDropdown';

const Inventory = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: batches = [], isLoading, error } = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventoryBatches
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInventoryBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });

  const [sortBy, setSortBy] = useState('date_desc');

  const filteredBatches = batches
    .filter(b => 
      b.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.traders?.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.products?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'batch') return a.batch_number.localeCompare(b.batch_number);
      if (sortBy === 'qty_desc') return b.quantity_available - a.quantity_available;
      if (sortBy === 'date_desc') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      return 0;
    });

  const handleComingSoon = () => alert('Feature coming soon!');

  return (
    <DashboardLayout>
      {/* Header Actions Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="font-display text-display font-semibold text-on-surface">Inventory</h2>
        </div>
        <div className="flex gap-3">
          <button onClick={handleComingSoon} className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md rounded hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Export
          </button>
          <button onClick={handleComingSoon} className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md rounded hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            Scan QR
          </button>
          <Link to="/outward" className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md rounded hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[18px]">output</span>
            Dispatch
          </Link>
          <Link to="/inward" className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded hover:bg-tertiary transition-colors">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Receive Stock
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded p-2 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            className="w-full pl-9 pr-3 py-1.5 bg-surface-container-lowest border-outline-variant text-on-surface font-body-sm text-body-sm focus:border-secondary focus:ring-1 focus:ring-secondary focus:ring-offset-0 rounded outline-none h-8"
            placeholder="Search batch, trader, or product..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-[1px] h-6 bg-outline-variant hidden md:block"></div>
        <select className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-sm text-body-sm py-1.5 pl-3 pr-8 rounded outline-none focus:border-secondary h-8 cursor-pointer min-w-[140px]">
          <option value="">All Traders</option>
          <option value="raj">Raj Traders</option>
          <option value="global">Global Fresh</option>
        </select>
        <select className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-sm text-body-sm py-1.5 pl-3 pr-8 rounded outline-none focus:border-secondary h-8 cursor-pointer min-w-[120px]">
          <option value="">All Rooms</option>
          <option value="A">Room A</option>
          <option value="B">Room B</option>
          <option value="C">Room C</option>
        </select>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-sm text-body-sm py-1.5 pl-3 pr-8 rounded outline-none focus:border-secondary h-8 cursor-pointer min-w-[120px]"
        >
          <option value="date_desc">Newest First</option>
          <option value="batch">Batch Num</option>
          <option value="qty_desc">High Qty</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low h-[32px]">
                <th className="px-4 py-2 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Batch</th>
                <th className="px-4 py-2 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Trader</th>
                <th className="px-4 py-2 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Product</th>
                <th className="px-4 py-2 font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-right">Qty</th>
                <th className="px-4 py-2 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Location</th>
                <th className="px-4 py-2 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Entry Date</th>
                <th className="px-4 py-2 font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-right">Duration</th>
                <th className="px-4 py-2 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Status</th>
                <th className="px-4 py-2 font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-on-surface-variant">
                    Loading inventory...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-error">
                    Error loading inventory. Please try again.
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-on-surface-variant">
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const entryDate = new Date(batch.entry_date);
                  const durationDays = Math.max(1, Math.floor((new Date().getTime() - entryDate.getTime()) / (1000 * 3600 * 24)));
                  
                  return (
                    <tr key={batch.id} className="border-b border-surface-variant hover:bg-surface-container-low h-[32px] transition-colors group">
                      <td className="px-4 py-1 font-mono-sm text-mono-sm text-on-surface">{batch.batch_number}</td>
                      <td className="px-4 py-1 font-medium text-on-surface">{batch.traders?.business_name || 'Unknown'}</td>
                      <td className="px-4 py-1 text-on-surface-variant">{batch.products?.name || 'Unknown'}</td>
                      <td className="px-4 py-1 text-right font-mono-sm text-mono-sm text-on-surface">{batch.quantity_available} {batch.unit}</td>
                      <td className="px-4 py-1 text-on-surface-variant">Rm A / Rck 03</td>
                      <td className="px-4 py-1 text-on-surface-variant">{entryDate.toLocaleDateString()}</td>
                      <td className="px-4 py-1 text-right font-mono-sm text-mono-sm text-on-surface">{durationDays}d</td>
                      <td className="px-4 py-1">
                        {batch.status === 'IN_STORAGE' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-[#e6f4ea] text-[#137333]">In Storage</span>
                        ) : batch.status === 'PARTIALLY_DISPATCHED' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-[#FEF9C3] text-[#854D0E]">Partial</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-surface-variant text-on-surface-variant">{batch.status}</span>
                        )}
                      </td>
                      <td className="px-4 py-1 text-center">
                        <ActionDropdown 
                          onDelete={() => deleteMutation.mutate(batch.id)} 
                          deleteLabel="Delete Batch"
                          isDestructive={true}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Showing 1 to 2 of 48 entries</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded text-outline-variant cursor-not-allowed">
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-secondary bg-secondary-fixed text-on-secondary-fixed rounded font-body-sm text-body-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded text-on-surface hover:bg-surface-container-low transition-colors font-body-sm text-body-sm">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded text-on-surface hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
