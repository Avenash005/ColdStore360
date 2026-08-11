import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { getInventoryBatches } from '../lib/api';

const Reports = () => {
  const { data: batches = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventoryBatches
  });

  const totalPalletsIn = batches.reduce((sum, batch) => sum + Number(batch.quantity_received), 0);
  const totalPalletsOut = batches.reduce((sum, batch) => sum + (Number(batch.quantity_received) - Number(batch.quantity_available)), 0);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Reports & Analytics</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Generate and export operational reports.</p>
        </div>
        <button onClick={() => alert("Feature coming soon!")} className="px-4 py-2 bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-primary/90 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Full Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg shadow-sm">
          <h3 className="font-label-md text-label-md text-on-surface-variant mb-2">Total Inward Volume</h3>
          <p className="font-display text-display text-primary">{totalPalletsIn}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">Pallets received all time</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg shadow-sm">
          <h3 className="font-label-md text-label-md text-on-surface-variant mb-2">Total Outward Volume</h3>
          <p className="font-display text-display text-secondary">{totalPalletsOut}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">Pallets dispatched all time</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg shadow-sm">
          <h3 className="font-label-md text-label-md text-on-surface-variant mb-2">Storage Efficiency</h3>
          <p className="font-display text-display text-tertiary">92%</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">Average utilization</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Recent Activity Logs</h3>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="py-3 font-label-md text-label-md text-on-surface-variant">Date</th>
                <th className="py-3 font-label-md text-label-md text-on-surface-variant">Batch No</th>
                <th className="py-3 font-label-md text-label-md text-on-surface-variant">Trader</th>
                <th className="py-3 font-label-md text-label-md text-on-surface-variant">Type</th>
                <th className="py-3 font-label-md text-label-md text-on-surface-variant text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant font-body-sm text-body-sm">
              {batches.slice(0, 10).map((batch) => (
                <tr key={batch.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3">{new Date(batch.entry_date).toLocaleDateString()}</td>
                  <td className="py-3 font-mono-sm">{batch.batch_number}</td>
                  <td className="py-3">{batch.traders?.business_name}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-[11px]">INWARD</span>
                  </td>
                  <td className="py-3 text-right">{batch.quantity_received}</td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant">No activity data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
