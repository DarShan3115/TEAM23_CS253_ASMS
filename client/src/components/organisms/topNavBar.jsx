import React from 'react';
import { Search, Bell } from 'lucide-react';
import Avatar from '../atoms/Avatar';

/**
 * ORGANISM: TopNavbar
 * A secondary internal header for dashboards, providing search and user status.
 * Location: client/src/components/organisms/TopNavbar.jsx
 */
const TopNavbar = ({ user }) => (
  <header className="h-20 bg-gray-950 border-b border-gray-800 sticky top-0 z-10 px-8 flex items-center justify-between backdrop-blur-md bg-opacity-80">
    <div className="relative w-full max-w-md group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={18} />
      <input 
        className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600/50 transition-all" 
        placeholder="Search for courses, grades, or faculty..." 
      />
    </div>
    
    <div className="flex items-center space-x-6">
      <div className="relative cursor-pointer hover:text-white text-gray-500 transition-colors">
        <Bell size={22} />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 border-2 border-gray-950 rounded-full"></span>
      </div>
      
      <div className="h-8 w-px bg-gray-800"></div>
      
      <div className="flex items-center space-x-4 pl-2 text-right">
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-white leading-tight">
            {user?.first_name || 'Guest'} {user?.last_name || ''}
          </p>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-0.5">
            {user?.role || 'Student'}
          </p>
        </div>
        <Avatar first={user?.first_name} last={user?.last_name} />
      </div>
    </div>
  </header>
);

export default TopNavbar;