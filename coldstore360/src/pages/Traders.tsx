import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTraders, createTrader, deactivateTrader, type Trader } from '../lib/api';
import ActionDropdown from '../components/ui/ActionDropdown';

const Traders = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    trader_code: '',
    business_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: ''
  });

  const { data: traders = [], isLoading, error } = useQuery({
    queryKey: ['traders'],
    queryFn: getTraders
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateTrader,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traders'] });
    }
  });

  const createMutation = useMutation({
    mutationFn: createTrader,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traders'] });
      setIsModalOpen(false);
      setFormData({ trader_code: '', business_name: '', contact_person: '', phone: '', email: '', address: '' });
    }
  });

  const [sortBy, setSortBy] = useState('name_asc');

  const filteredTraders = traders
    .filter(t => 
      t.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.trader_code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name_asc') return a.business_name.localeCompare(b.business_name);
      if (sortBy === 'recent') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      return 0; // Default or Total Volume (requires aggregation not currently in API)
    });

  const handleComingSoon = () => alert('Feature coming soon!');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display text-on-surface font-semibold tracking-tight">Traders Directory</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage trader accounts, profiles, and active contracts</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleComingSoon} className="h-row-height-sm px-4 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md rounded flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export List
          </button>
          <button onClick={() => setIsModalOpen(true)} className="h-row-height-sm px-4 bg-primary text-on-primary font-label-md text-label-md rounded flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Trader
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-bright">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input 
                className="w-full h-row-height-sm pl-9 pr-4 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-outline" 
                placeholder="Search traders..." 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="h-row-height-sm px-3 bg-surface-container-lowest border border-outline-variant text-on-surface rounded flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors" title="Filter options">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              <span className="font-label-md text-label-md hidden sm:inline">Filter</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-row-height-sm px-3 pr-8 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary appearance-none cursor-pointer"
            >
              <option value="name_asc">Trader Name (A-Z)</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-outline-variant bg-surface">
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider w-[240px]">Trader Name</th>
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider w-[120px]">ID</th>
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider w-[160px]">Contact Person</th>
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider w-[120px] text-right">Active Pallets</th>
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider w-[120px]">Status</th>
                <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider w-[80px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-variant">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                    Loading traders...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-error">
                    Error loading traders. Please try again.
                  </td>
                </tr>
              ) : filteredTraders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                    No traders found.
                  </td>
                </tr>
              ) : (
                filteredTraders.map((trader) => (
                  <tr key={trader.id} className="hover:bg-surface-container-low transition-colors group h-row-height-md">
                    <td className="py-2 px-5 whitespace-nowrap">
                      <div className="font-medium text-on-surface">{trader.business_name}</div>
                    </td>
                    <td className="py-2 px-5 whitespace-nowrap font-mono-sm text-outline">{trader.trader_code}</td>
                    <td className="py-2 px-5 whitespace-nowrap">{trader.contact_person}</td>
                    <td className="py-2 px-5 whitespace-nowrap text-right font-mono-sm">-</td>
                    <td className="py-2 px-5 whitespace-nowrap">
                      {trader.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#DCFCE7] text-[#166534]">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F3F4F6] text-[#4B5563]">Inactive</span>
                      )}
                    </td>
                    <td className="py-2 px-5 whitespace-nowrap text-center">
                      <ActionDropdown 
                        onDelete={() => deactivateMutation.mutate(trader.id)} 
                        deleteLabel={trader.is_active ? "Deactivate Trader" : "Trader Deactivated"}
                        isDestructive={trader.is_active}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-outline-variant flex items-center justify-between bg-surface-bright">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Showing 1 to 3 of 45 traders</span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded text-outline hover:bg-surface-container-low disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-highest text-on-surface font-label-md text-label-md">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-low text-on-surface-variant font-label-md text-label-md">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-low text-on-surface-variant font-label-md text-label-md">3</button>
            <span className="text-on-surface-variant mx-1">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded text-outline hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Trader Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Add New Trader</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors rounded-full p-1 hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">Trader Code</label>
                <input 
                  required
                  name="trader_code"
                  value={formData.trader_code}
                  onChange={handleChange}
                  className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none font-body-sm text-body-sm" 
                  placeholder="e.g., TDR-101" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">Business Name</label>
                <input 
                  required
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none font-body-sm text-body-sm" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">Contact Person</label>
                <input 
                  required
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none font-body-sm text-body-sm" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface">Email</label>
                  <input 
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none font-body-sm text-body-sm" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface">Phone</label>
                  <input 
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none font-body-sm text-body-sm" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">Address</label>
                <textarea 
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none font-body-sm text-body-sm resize-none" 
                />
              </div>
              
              {mutation.isError && (
                <div className="p-3 bg-error-container text-error rounded font-body-sm text-body-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  Failed to add trader. Code might exist.
                </div>
              )}

              <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-4 py-2 bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {mutation.isPending ? 'Saving...' : 'Save Trader'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Traders;
