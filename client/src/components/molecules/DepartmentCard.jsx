import React from 'react';
import { Building2, Settings } from 'lucide-react';

/**
 * MOLECULE: DepartmentCard
 * Admin-level card for managing university departments.
 * Added safety guards to prevent crashes if the dept prop is missing.
 */
const DepartmentCard = ({ dept, onSettings }) => {
  // Guard clause to prevent "Cannot read properties of undefined" errors
  if (!dept) {
    return (
      <div className="bg-gray-800/20 border border-gray-800 border-dashed rounded-3xl p-6 flex items-center justify-center">
        <p className="text-gray-600 text-xs font-medium italic">Department data unavailable</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/40 border border-gray-700 p-6 rounded-3xl group hover:border-blue-500/30 transition-all shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div className="bg-blue-600/10 p-3 rounded-2xl border border-blue-500/20">
          <Building2 className="text-blue-500" size={24} />
        </div>
        <button 
          onClick={() => onSettings && onSettings(dept)} 
          className="text-gray-600 hover:text-white transition-colors"
        >
          <Settings size={18} />
        </button>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
          {dept.code || 'DEPT'}
        </span>
        <h3 className="text-lg font-bold text-white leading-tight">
          {dept.name || 'Untitled Department'}
        </h3>
        <p className="text-xs text-gray-500 font-medium mt-2">
          Head: {dept.head || 'TBD'}
        </p>
      </div>
      <div className="mt-6 pt-4 border-t border-gray-700/50 flex items-center justify-between">
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className="w-6 h-6 rounded-full border-2 border-gray-900 bg-gray-700 text-[8px] flex items-center justify-center font-bold text-white uppercase"
            >
              {dept.name?.[i - 1] || 'U'}
            </div>
          ))}
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase">
          {dept.faculty_count || 0} Faculty Members
        </span>
      </div>
    </div>
  );
};

export default DepartmentCard;