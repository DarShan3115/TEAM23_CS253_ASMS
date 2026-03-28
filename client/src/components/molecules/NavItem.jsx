import React from 'react';

/**
 * MOLECULE: NavItem
 * Flexible navigation item used in Sidebars. 
 * Accepts a Lucide icon component as a prop.
 */
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`}
  >
    {Icon && <Icon size={20} />}
    <span className="font-medium">{label}</span>
  </button>
);

export default NavItem;