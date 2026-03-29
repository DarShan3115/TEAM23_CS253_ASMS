import React from 'react';
import { 
  LayoutDashboard, Users, Building2, 
  Activity, ShieldCheck, ShieldAlert, LogOut,
  ChevronRight
} from 'lucide-react';
import AdminNavItem from '../atoms/AdminNavItem';

/**
 * ORGANISM: AdminSidebar
 * Specialized navigation for system administrators.
 * Location: client/src/components/organisms/AdminSidebar.jsx
 */
const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'departments', label: 'Institutional Data', icon: Building2 },
    { id: 'system', label: 'Service Health', icon: Activity },
    { id: 'security', label: 'Access Logs', icon: ShieldCheck },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-950 border-r border-gray-800 p-6 hidden lg:flex flex-col">
      <div className="flex items-center space-x-3 mb-10 px-2">
        <div className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-600/30">
          <ShieldAlert className="text-white" size={22} />
        </div>
        <span className="text-lg font-black text-white tracking-tighter uppercase">Admin Core</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map(item => (
          <AdminNavItem 
            key={item.id}
            {...item}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-800">
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 hover:text-white transition-colors group">
          <LogOut size={18} className="group-hover:text-red-500 transition-colors" />
          <span className="text-sm font-bold">Exit Console</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;