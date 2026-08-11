import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInventoryBatches, clearAllInventory } from '../lib/api';

const Settings = () => {
  const queryClient = useQueryClient();
  const [maxCapacity, setMaxCapacity] = useState('12500');
  const [showToast, setShowToast] = useState(false);
  
  const { data: batches = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventoryBatches
  });

  const currentOccupancy = batches.reduce((sum, batch) => sum + Number(batch.quantity_available), 0);

  useEffect(() => {
    const savedCapacity = localStorage.getItem('max_storage_capacity');
    if (savedCapacity) {
      setMaxCapacity(savedCapacity);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('max_storage_capacity', maxCapacity);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const clearInventoryMutation = useMutation({
    mutationFn: clearAllInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      alert('All inventory data cleared successfully.');
    },
    onError: (err: any) => {
      alert('Failed to clear inventory: ' + err.message);
    }
  });

  const handleClearInventory = () => {
    if (confirm('Are you absolutely sure you want to clear all inventory data? This cannot be undone.')) {
      clearInventoryMutation.mutate();
    }
  };

  const utilizationPercent = maxCapacity ? Math.min(100, Math.round((currentOccupancy / Number(maxCapacity)) * 100)) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto mt-6">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-display text-on-surface">Settings</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Manage facility configurations and system preferences.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md rounded hover:bg-surface-container-low transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Changes
            </button>
          </div>
        </div>

        {/* Settings Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Sidebar Navigation for Settings (Desktop) */}
          <div className="hidden md:block md:col-span-3 sticky top-[80px]">
            <nav className="flex flex-col gap-1">
              <a className="px-4 py-2.5 rounded text-primary bg-secondary/5 font-label-md text-label-md flex items-center gap-3 border-l-2 border-secondary" href="#facility">
                <span className="material-symbols-outlined text-[20px]">warehouse</span>
                Facility & Storage
              </a>
              <a className="px-4 py-2.5 rounded text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-label-md text-label-md flex items-center gap-3 border-l-2 border-transparent" href="#billing">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                Billing &amp; Invoicing
              </a>
              <a className="px-4 py-2.5 rounded text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-label-md text-label-md flex items-center gap-3 border-l-2 border-transparent" href="#users">
                <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                Users &amp; Roles
              </a>
              <a className="px-4 py-2.5 rounded text-error hover:bg-error-container/20 transition-colors font-label-md text-label-md flex items-center gap-3 border-l-2 border-transparent mt-4" href="#danger">
                <span className="material-symbols-outlined text-[20px]">warning</span>
                Danger Zone
              </a>
            </nav>
          </div>

          {/* Settings Content Panels */}
          <div className="col-span-1 md:col-span-9 flex flex-col gap-8">
            {/* Facility Section */}
            <section className="scroll-mt-24" id="facility">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-lowest flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">domain</span>
                  </div>
                  <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Facility Profile</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Core information about this warehouse location.</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="font-label-md text-label-md text-on-surface">Facility Name</label>
                      <input className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none font-body-md text-body-md text-on-surface transition-all" type="text" defaultValue="ColdStore Alpha North" />
                    </div>
                    
                    <div className="flex flex-col gap-1.5 sm:col-span-2 mt-4">
                      <h3 className="font-label-lg text-label-lg text-on-surface mb-2">Storage Capacity Limits</h3>
                      <div className="flex gap-4 items-end">
                        <div className="flex flex-col gap-1.5 flex-1">
                          <label className="font-label-md text-label-md text-on-surface">Maximum Total Capacity (Pallets)</label>
                          <input 
                            className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none font-mono-sm text-mono-sm text-on-surface transition-all" 
                            type="number" 
                            value={maxCapacity}
                            onChange={(e) => setMaxCapacity(e.target.value)} 
                          />
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">
                            Current Occupancy: <span className="font-medium text-on-surface">{currentOccupancy}</span> / {maxCapacity} ({utilizationPercent}%)
                          </p>
                          <div className="w-full bg-surface-variant rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${utilizationPercent}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 text-outline">
                        * Warning limits will trigger when utilization exceeds 90% of maximum capacity. This does not prevent inward flow, but alerts managers.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2 mt-4">
                      <label className="font-label-md text-label-md text-on-surface">Operating Timezone</label>
                      <select className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none font-body-md text-body-md text-on-surface transition-all appearance-none cursor-pointer">
                        <option>UTC-05:00 Eastern Time (US &amp; Canada)</option>
                        <option>UTC-06:00 Central Time</option>
                        <option>UTC-08:00 Pacific Time</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Billing & Invoicing Section */}
            <section className="scroll-mt-24" id="billing">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-lowest flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">receipt_long</span>
                  </div>
                  <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Billing & Invoicing</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Configure payment terms and tax rates.</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-on-surface">Default Tax Rate (%)</label>
                      <input className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none font-body-md text-body-md text-on-surface transition-all" type="number" defaultValue="18" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-on-surface">Payment Terms</label>
                      <select className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none font-body-md text-body-md text-on-surface transition-all appearance-none cursor-pointer">
                        <option>Net 15</option>
                        <option>Net 30</option>
                        <option>Net 60</option>
                        <option>Due on Receipt</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="font-label-md text-label-md text-on-surface">Company Billing Address</label>
                      <textarea className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none font-body-md text-body-md text-on-surface transition-all resize-none h-24" defaultValue="ColdStore Alpha North\n123 Logistics Way\nWarehouse District\nCity, ST 12345"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Users & Roles Section */}
            <section className="scroll-mt-24" id="users">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">manage_accounts</span>
                    </div>
                    <div>
                      <h2 className="font-headline-md text-headline-md text-on-surface">Users & Roles</h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Manage staff access and permissions.</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded hover:bg-primary/90 transition-colors shadow-sm">
                    Invite User
                  </button>
                </div>
                <div className="p-0">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        <th className="font-label-md text-label-md text-on-surface-variant py-3 px-6">Name</th>
                        <th className="font-label-md text-label-md text-on-surface-variant py-3 px-6">Email</th>
                        <th className="font-label-md text-label-md text-on-surface-variant py-3 px-6">Role</th>
                        <th className="font-label-md text-label-md text-on-surface-variant py-3 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-body-sm text-body-sm">
                      <tr className="border-b border-outline-variant">
                        <td className="py-3 px-6 text-on-surface font-medium">Alice Admin</td>
                        <td className="py-3 px-6 text-on-surface-variant">alice@coldstore.com</td>
                        <td className="py-3 px-6 text-on-surface-variant">Administrator</td>
                        <td className="py-3 px-6 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#DCFCE7] text-[#166534]">Active</span>
                        </td>
                      </tr>
                      <tr className="border-b border-outline-variant">
                        <td className="py-3 px-6 text-on-surface font-medium">Bob Warehouse</td>
                        <td className="py-3 px-6 text-on-surface-variant">bob@coldstore.com</td>
                        <td className="py-3 px-6 text-on-surface-variant">Warehouse Staff</td>
                        <td className="py-3 px-6 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#DCFCE7] text-[#166534]">Active</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-6 text-on-surface font-medium">Charlie Gate</td>
                        <td className="py-3 px-6 text-on-surface-variant">charlie@coldstore.com</td>
                        <td className="py-3 px-6 text-on-surface-variant">Gate Staff</td>
                        <td className="py-3 px-6 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F3F4F6] text-[#4B5563]">Offline</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Danger Zone Section */}
            <section className="scroll-mt-24 mb-16" id="danger">
              <div className="bg-error-container/10 border border-error/20 rounded-lg overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-error/20 bg-error-container/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-error/10 flex items-center justify-center text-error">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                  <div>
                    <h2 className="font-headline-md text-headline-md text-error">Danger Zone</h2>
                    <p className="font-body-sm text-body-sm text-error/80">Irreversible destructive actions.</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-label-lg text-label-lg text-on-surface">Clear All Inventory Data</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">This will permanently delete all stock batches and transaction history. Traders and Products will be kept.</p>
                    </div>
                    <button 
                      onClick={handleClearInventory}
                      className="px-4 py-2 bg-error text-white font-label-md text-label-md rounded hover:bg-error/90 transition-colors shadow-sm whitespace-nowrap"
                    >
                      Clear Inventory
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded shadow-lg flex items-center gap-3 animate-fade-in z-50">
          <span className="material-symbols-outlined text-[#4ADE80]">check_circle</span>
          <span className="font-body-sm text-body-sm">Settings saved successfully</span>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Settings;
