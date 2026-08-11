import React, { type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="font-body-md text-body-md antialiased overflow-x-hidden flex bg-surface min-h-screen">
      {/* SideNavBar Component */}
      <nav className="bg-surface-container-lowest w-[240px] h-screen fixed left-0 top-0 border-r border-outline-variant flex flex-col py-6 z-20">
        <div className="px-6 mb-8">
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">ColdStore360</h1>
          <p className="font-label-md text-label-md text-on-surface-variant mt-1">Logistics Management</p>
        </div>
        <ul className="flex flex-col space-y-1 flex-grow">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 cursor-pointer transition-colors ${
                  isActive
                    ? 'text-secondary font-bold border-r-2 border-secondary bg-surface-container-low'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`
              }
            >
              <span className="material-symbols-outlined mr-4" style={{ fontVariationSettings: "'FILL' 1" }}>
                dashboard
              </span>
              <span className="font-label-md text-label-md">Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 cursor-pointer transition-colors ${
                  isActive
                    ? 'text-secondary font-bold border-r-2 border-secondary bg-surface-container-low'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`
              }
            >
              <span className="material-symbols-outlined mr-4">inventory_2</span>
              <span className="font-label-md text-label-md">Inventory</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/rooms"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 cursor-pointer transition-colors ${
                  isActive
                    ? 'text-secondary font-bold border-r-2 border-secondary bg-surface-container-low'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`
              }
            >
              <span className="material-symbols-outlined mr-4">door_open</span>
              <span className="font-label-md text-label-md">Rooms</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/reconciliation"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 cursor-pointer transition-colors ${
                  isActive
                    ? 'text-secondary font-bold border-r-2 border-secondary bg-surface-container-low'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`
              }
            >
              <span className="material-symbols-outlined mr-4">fact_check</span>
              <span className="font-label-md text-label-md">Reconciliation</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/inward"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 cursor-pointer transition-colors ${
                  isActive
                    ? 'text-secondary font-bold border-r-2 border-secondary bg-surface-container-low'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`
              }
            >
              <span className="material-symbols-outlined mr-4">input</span>
              <span className="font-label-md text-label-md">Inward</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/outward"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 cursor-pointer transition-colors ${
                  isActive
                    ? 'text-secondary font-bold border-r-2 border-secondary bg-surface-container-low'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`
              }
            >
              <span className="material-symbols-outlined mr-4">output</span>
              <span className="font-label-md text-label-md">Outward</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/finance"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 cursor-pointer transition-colors ${
                  isActive
                    ? 'text-secondary font-bold border-r-2 border-secondary bg-surface-container-low'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`
              }
            >
              <span className="material-symbols-outlined mr-4">payments</span>
              <span className="font-label-md text-label-md">Finance</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/traders"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 cursor-pointer transition-colors ${
                  isActive
                    ? 'text-secondary font-bold border-r-2 border-secondary bg-surface-container-low'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`
              }
            >
              <span className="material-symbols-outlined mr-4">groups</span>
              <span className="font-label-md text-label-md">Traders</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 cursor-pointer transition-colors ${
                  isActive
                    ? 'text-secondary font-bold border-r-2 border-secondary bg-surface-container-low'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`
              }
            >
              <span className="material-symbols-outlined mr-4">analytics</span>
              <span className="font-label-md text-label-md">Reports</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 cursor-pointer transition-colors ${
                  isActive
                    ? 'text-secondary font-bold border-r-2 border-secondary bg-surface-container-low'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`
              }
            >
              <span className="material-symbols-outlined mr-4">settings</span>
              <span className="font-label-md text-label-md">Settings</span>
            </NavLink>
          </li>
          <li className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-6 py-3 cursor-pointer text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined mr-4">logout</span>
              <span className="font-label-md text-label-md">Log Out</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* TopNavBar Component */}
      <header className="bg-surface-container-lowest fixed top-0 right-0 left-[240px] h-[44px] border-b border-outline-variant flex items-center justify-between px-6 w-[calc(100%-240px)] z-10">
        <div className="flex items-center">
          {/* Header search removed per request */}
        </div>
        <div className="flex items-center space-x-4">
          {/* Header icons removed per request */}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="ml-[240px] mt-[44px] p-6 w-[calc(100%-240px)] min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
