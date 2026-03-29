import React from 'react';
import { Edit3 } from 'lucide-react';

/**
 * ATOM: ToggleSwitch
 * Included here to resolve resolution errors in the preview environment.
 * In your local IDE, this can remain in ../atoms/ToggleSwitch.jsx
 */
const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
      enabled ? 'bg-blue-600' : 'bg-gray-700'
    }`}
  >
    <span
      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

/**
 * MOLECULE: UserRow
 * Location: client/src/components/molecules/UserRow.jsx
 */
const UserRow = ({ user, onToggle, onEdit }) => {
  // Safety check to prevent "Cannot read properties of undefined" errors
  if (!user) return null;

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors group">
      <td className="py-4 pl-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-700 flex items-center justify-center font-bold text-xs text-white border border-gray-700">
            {user.first_name?.[0] || '?'}{user.last_name?.[0] || ''}
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              {user.first_name || 'Unknown'} {user.last_name || 'User'}
            </p>
            <p className="text-[10px] text-gray-500 font-medium">
              {user.email || 'no-email@asms.edu'}
            </p>
          </div>
        </div>
      </td>
      <td className="py-4">
        <span className="text-[10px] font-black uppercase px-2 py-1 rounded-md bg-gray-800 text-gray-400 border border-gray-700">
          {user.role || 'student'}
        </span>
      </td>
      <td className="py-4">
        <div className="flex items-center gap-3">
          <ToggleSwitch 
            enabled={user.is_active || false} 
            onChange={() => onToggle && onToggle(user.id)} 
          />
          <span className={`text-[10px] font-black uppercase tracking-tighter ${user.is_active ? 'text-green-500' : 'text-red-500'}`}>
            {user.is_active ? 'Active' : 'Suspended'}
          </span>
        </div>
      </td>
      <td className="py-4 pr-4 text-right">
        <div className="flex justify-end">
          <button 
            onClick={() => onEdit && onEdit(user)} 
            className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
            title="Edit User"
          >
            <Edit3 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserRow;