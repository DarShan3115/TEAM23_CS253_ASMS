import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * ATOM: AdminNavItem
 * A navigation button used in the Admin Sidebar.
 * Handles cases where the icon or label might be missing to prevent runtime errors.
 */
const AdminNavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`}
  >
    <div className="flex items-center space-x-3">
      {/* Safety check: Only render Icon if it is a valid component */}
      {Icon ? <Icon size={18} /> : <div className="w-[18px]" />}
      
      <span className="text-sm font-bold">
        {typeof label === 'string' || typeof label === 'number' ? label : 'Navigation Item'}
      </span>
    </div>
    
    {active && <ChevronRight size={14} />}
  </button>
);

export default AdminNavItem;