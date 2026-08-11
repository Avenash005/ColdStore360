import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDashboardMetrics, getRecentTransactions } from '../lib/api';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard_metrics'],
    queryFn: getDashboardMetrics,
    refetchInterval: 30000 // Refetch every 30s as a fallback
  });

  const { data: recentActivity = [], isLoading: activityLoading } = useQuery({
    queryKey: ['recent_activity'],
    queryFn: getRecentTransactions
  });

  useEffect(() => {
    // Listen for new inventory transactions
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inventory_transactions',
        },
        (payload) => {
          const type = payload.new.transaction_type;
          const qty = payload.new.quantity;
          
          setToastMessage(`New ${type} logged: ${qty} units`);
          
          // Auto-hide toast
          setTimeout(() => setToastMessage(null), 5000);

          // Invalidate queries to update dashboard instantly
          queryClient.invalidateQueries({ queryKey: ['dashboard_metrics'] });
          queryClient.invalidateQueries({ queryKey: ['recent_activity'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const currentDate = new Date().toLocaleString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const maxCapacity = Number(localStorage.getItem('max_storage_capacity') || 12500);
  const currentOccupancy = metrics?.totalInventory || 0;
  const storageUtilization = Math.min(100, Math.round((currentOccupancy / maxCapacity) * 100));

  return (
    <DashboardLayout>
      {/* Real-time Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in-up">
          <div className="bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 font-label-md">
            <span className="material-symbols-outlined text-secondary">notifications_active</span>
            {toastMessage}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Operational Summary
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-sm flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </span>
            Live Data as of {currentDate}
          </p>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <div className="bg-surface-container-lowest border border-surface-variant p-4 flex flex-col justify-between shadow-sm rounded-lg">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">
            Total Inventory
          </span>
          <span className="font-display text-display text-primary">
            {metricsLoading ? '...' : currentOccupancy.toLocaleString()}
          </span>
          <span className="font-mono-sm text-mono-sm text-on-surface-variant mt-1">units</span>
        </div>
        <div className="bg-surface-container-lowest border border-surface-variant p-4 flex flex-col justify-between shadow-sm rounded-lg">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">
            Storage Occupancy
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="font-display text-display text-primary">
              {metricsLoading ? '...' : `${storageUtilization}%`}
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-sm">
              of {maxCapacity >= 1000 ? `${maxCapacity / 1000}k` : maxCapacity} cap
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-1 mt-2 rounded-full overflow-hidden">
            <div className="bg-primary h-1" style={{ width: `${storageUtilization}%` }}></div>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-surface-variant p-4 flex flex-col justify-between shadow-sm rounded-lg">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">
            Today's Inward
          </span>
          <span className="font-display text-display text-primary">
            {metricsLoading ? '...' : metrics?.todayInward?.toLocaleString() || 0}
          </span>
          <span className="font-mono-sm text-mono-sm text-on-surface-variant mt-1">units</span>
        </div>
        <div className="bg-surface-container-lowest border border-surface-variant p-4 flex flex-col justify-between shadow-sm rounded-lg">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">
            Today's Outward
          </span>
          <span className="font-display text-display text-primary">
            {metricsLoading ? '...' : metrics?.todayOutward?.toLocaleString() || 0}
          </span>
          <span className="font-mono-sm text-mono-sm text-on-surface-variant mt-1">units</span>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-surface-container-lowest border border-surface-variant p-3 flex items-center justify-between rounded-lg shadow-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Active Traders</span>
          <span className="font-headline-md text-headline-md font-mono-sm">{metricsLoading ? '-' : metrics?.activeTraders || 0}</span>
        </div>
        <div className="bg-surface-container-lowest border border-surface-variant p-3 flex items-center justify-between rounded-lg shadow-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Pending Invoices</span>
          <span className="font-headline-md text-headline-md font-mono-sm">{metricsLoading ? '-' : metrics?.pendingInvoices || 0}</span>
        </div>
        <div className="bg-surface-container-lowest border border-surface-variant p-3 flex items-center justify-between rounded-lg shadow-sm opacity-50">
          <span className="font-label-md text-label-md text-on-surface-variant">Outstanding Pymts</span>
          <span className="font-headline-md text-headline-md font-mono-sm">N/A</span>
        </div>
        <div className="bg-surface-container-lowest border border-surface-variant p-3 flex items-center justify-between rounded-lg shadow-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Open Discrepancies</span>
          <span className={`font-headline-md text-headline-md font-mono-sm ${(metrics?.openDiscrepancies || 0) > 0 ? 'text-error font-bold' : ''}`}>
            {metricsLoading ? '-' : metrics?.openDiscrepancies || 0}
          </span>
        </div>
      </div>

      {/* Main Content Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Occupancy Chart/List */}
        <div className="lg:col-span-1 bg-surface-container-lowest border border-surface-variant flex flex-col rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-surface-variant bg-surface-container-low/30">
            <h3 className="font-headline-md text-headline-md text-on-surface text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">warehouse</span>
              Storage Breakdown
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="flex justify-between font-label-md text-label-md mb-1">
                <span className="text-on-surface">Cold Room A</span>
                <span className="font-mono-sm">82%</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-2" style={{ width: '82%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between font-label-md text-label-md mb-1">
                <span className="text-on-surface">Cold Room B</span>
                <span className="font-mono-sm">64%</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-2" style={{ width: '64%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between font-label-md text-label-md mb-1">
                <span className="text-on-surface">Cold Room C</span>
                <span className="font-mono-sm text-error">91%</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-error h-2" style={{ width: '91%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between font-label-md text-label-md mb-1">
                <span className="text-on-surface">Freezer</span>
                <span className="font-mono-sm">57%</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-secondary-container h-2" style={{ width: '57%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-auto p-4 border-t border-surface-variant bg-surface-container-lowest">
            <Link to="/inventory" className="w-full flex justify-center font-label-md text-label-md text-primary bg-surface-container-lowest border border-surface-variant hover:bg-surface-container-low py-2 transition-colors rounded">
              View Detailed Map
            </Link>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-surface-variant flex flex-col rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-surface-variant flex justify-between items-center bg-surface-container-low/30">
            <h3 className="font-headline-md text-headline-md text-on-surface text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">history</span>
              Recent Activity
            </h3>
            <Link to="/inventory" className="font-label-md text-label-md text-secondary hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest border-b border-surface-variant font-label-md text-label-md text-on-surface-variant">
                  <th className="p-3 font-medium">Txn No.</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Trader</th>
                  <th className="p-3 font-medium text-right">Qty</th>
                  <th className="p-3 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface">
                {activityLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">Loading real-time activity...</td>
                  </tr>
                ) : recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">No recent activity.</td>
                  </tr>
                ) : (
                  recentActivity.map(txn => (
                    <tr key={txn.id} className="border-b border-surface-variant hover:bg-[#F1F5F9] transition-colors h-[44px]">
                      <td className="p-3 font-mono-sm text-on-surface-variant">{txn.transaction_number}</td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 font-label-md">
                          {txn.transaction_type === 'INWARD' && <span className="material-symbols-outlined text-[16px] text-[#16a34a]">arrow_downward</span>}
                          {txn.transaction_type === 'OUTWARD' && <span className="material-symbols-outlined text-[16px] text-[#ea580c]">arrow_upward</span>}
                          {txn.transaction_type === 'ADJUSTMENT' && <span className="material-symbols-outlined text-[16px] text-error">warning</span>}
                          {txn.transaction_type}
                        </span>
                      </td>
                      <td className="p-3">{txn.traders?.business_name || '-'}</td>
                      <td className="p-3 font-mono-sm text-right">
                        {txn.transaction_type === 'OUTWARD' || txn.after_quantity < txn.before_quantity 
                          ? `-${txn.quantity}` 
                          : `+${txn.quantity}`}
                      </td>
                      <td className="p-3 font-mono-sm text-right text-on-surface-variant">
                        {new Date(txn.transaction_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
