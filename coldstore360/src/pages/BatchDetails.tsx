import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';

const BatchDetails = () => {
  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button className="text-outline hover:text-primary transition-colors flex items-center justify-center p-1 rounded hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h2 className="font-display text-display text-on-surface flex items-center gap-3">
              <span className="font-mono-sm text-mono-sm text-outline tracking-wider bg-surface-container-highest px-2 py-1 rounded">BTH-00124</span>
              Apples
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-tertiary-fixed text-on-tertiary-fixed uppercase ml-2">
              IN STORAGE
            </span>
          </div>
          <div className="flex items-center gap-4 text-on-surface-variant ml-10">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              <span className="font-body-sm text-body-sm">Raj Traders</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              <span className="font-body-sm text-body-sm">Rec: Aug 01, 2023</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface rounded font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2 active:scale-95">
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Adjust
          </button>
          <button className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface rounded font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2 active:scale-95">
            <span className="material-symbols-outlined text-[18px]">qr_code</span>
            Print QR
          </button>
          <button className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface rounded font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2 active:scale-95">
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
            Transfer
          </button>
          <button className="px-4 py-2 bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-tertiary transition-colors flex items-center gap-2 shadow-sm active:scale-95 border border-primary">
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            Dispatch
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Available Inventory</span>
            <span className="material-symbols-outlined text-outline text-[20px]">inventory_2</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-display text-[40px] leading-none text-on-surface font-semibold">380</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant mb-1">Pallets</span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary opacity-80"></div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Received</span>
            <span className="material-symbols-outlined text-outline text-[20px]">arrow_downward</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-display text-[40px] leading-none text-on-surface font-semibold">500</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant mb-1">Pallets</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Dispatched</span>
            <span className="material-symbols-outlined text-outline text-[20px]">arrow_upward</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-display text-[40px] leading-none text-on-surface font-semibold">120</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant mb-1">Pallets</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout for Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-8 mt-6">
        {/* Left Column: Location & Billing */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Current Location */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col h-full min-h-[220px]">
            <div className="px-5 py-4 border-b border-outline-variant flex items-center gap-2 bg-surface-bright">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">location_on</span>
              <h3 className="font-headline-md text-body-lg text-on-surface">Current Location</h3>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-center">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center pb-3 border-b border-surface-variant">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Zone / Chamber</span>
                  <span className="font-body-md text-body-md text-on-surface font-medium">Room-A</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-surface-variant">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Aisle / Rack</span>
                  <span className="font-body-md text-body-md text-on-surface font-medium">Rack-03</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Level / Slot</span>
                  <span className="font-body-md text-body-md text-on-surface font-medium">Slot-B</span>
                </div>
              </div>
            </div>
          </div>
          {/* Billing Snapshot */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col h-full min-h-[220px]">
            <div className="px-5 py-4 border-b border-outline-variant flex items-center gap-2 bg-surface-bright justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">receipt_long</span>
                <h3 className="font-headline-md text-body-lg text-on-surface">Billing Snapshot</h3>
              </div>
              <span className="font-label-md text-label-md bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded">Accruing</span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between bg-surface-bright">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Duration</p>
                  <p className="font-headline-md text-headline-md text-on-surface">9 Days</p>
                </div>
                <div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Daily Rate</p>
                  <p className="font-headline-md text-headline-md text-on-surface">₹2.00</p>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-outline-variant">
                <div className="flex justify-between items-end">
                  <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider">Est. Charge</span>
                  <span className="font-display text-[28px] leading-none text-on-surface font-semibold text-primary">₹6,840</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right Column: Timeline Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded flex flex-col min-h-[464px]">
          <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-bright">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">history</span>
              <h3 className="font-headline-md text-body-lg text-on-surface">Movement Timeline</h3>
            </div>
            <button className="text-outline hover:text-primary font-label-md text-label-md flex items-center gap-1 transition-colors">
              View All
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-outline-variant bg-surface">
                  <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider w-[120px]">Date</th>
                  <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider w-[100px]">Event</th>
                  <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider w-[80px] text-right">Qty</th>
                  <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider w-[140px]">Ref ID</th>
                  <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider">Operator</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-variant">
                <tr className="hover:bg-surface-container-low transition-colors h-[44px] group">
                  <td className="py-2 px-5 whitespace-nowrap text-on-surface-variant">Aug 05, 14:30</td>
                  <td className="py-2 px-5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-surface-variant text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">arrow_upward</span> Dispatched
                    </span>
                  </td>
                  <td className="py-2 px-5 whitespace-nowrap text-right font-mono-sm">-120</td>
                  <td className="py-2 px-5 whitespace-nowrap font-mono-sm text-outline group-hover:text-primary transition-colors">DSP-9982</td>
                  <td className="py-2 px-5 whitespace-nowrap">K. Sharma</td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors h-[44px] group">
                  <td className="py-2 px-5 whitespace-nowrap text-on-surface-variant">Aug 02, 09:15</td>
                  <td className="py-2 px-5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-surface-variant text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">sync_alt</span> Transferred
                    </span>
                  </td>
                  <td className="py-2 px-5 whitespace-nowrap text-right font-mono-sm">0</td>
                  <td className="py-2 px-5 whitespace-nowrap font-mono-sm text-outline group-hover:text-primary transition-colors">TRN-4410</td>
                  <td className="py-2 px-5 whitespace-nowrap">M. Patel</td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors h-[44px] group">
                  <td className="py-2 px-5 whitespace-nowrap text-on-surface-variant">Aug 01, 11:00</td>
                  <td className="py-2 px-5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-secondary-fixed-dim text-on-secondary-fixed">
                      <span className="material-symbols-outlined text-[14px]">arrow_downward</span> Received
                    </span>
                  </td>
                  <td className="py-2 px-5 whitespace-nowrap text-right font-mono-sm">+500</td>
                  <td className="py-2 px-5 whitespace-nowrap font-mono-sm text-outline group-hover:text-primary transition-colors">RCV-1004</td>
                  <td className="py-2 px-5 whitespace-nowrap">A. Singh</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Decorative pattern bottom area */}
          <div className="mt-auto h-24 border-t border-outline-variant bg-surface opacity-50 relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
            <p className="font-body-sm text-body-sm text-outline relative z-10 text-center max-w-sm">
              Complete audit trail maintained securely. Contact supervisor for detailed logs older than 90 days.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BatchDetails;
