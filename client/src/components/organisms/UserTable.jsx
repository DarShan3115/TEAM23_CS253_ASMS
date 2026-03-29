import React from 'react';
import { Search, Filter, UserPlus, Edit3 } from 'lucide-react';
import ToggleSwitch from '../atoms/ToggleSwitch';
import UserRow from '../molecules/UserRow';

/**
 * ORGANISM: UserTable
 * Location: client/src/components/organisms/UserTable.jsx
 * Now contains inlined child components to satisfy the preview environment's single-file requirement.
 */
const UserTable = ({ users = [], onToggle, onEdit }) => (
  <div className="bg-gray-800/20 border border-gray-700 rounded-3xl overflow-hidden shadow-xl">
    <div className="p-6 border-b border-gray-700 flex flex-col md:flex-row justify-between gap-4 bg-gray-800/30">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
        <input 
          type="text" 
          placeholder="Search users..."
          className="bg-gray-900/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none w-72 focus:ring-2 focus:ring-blue-500/50 transition-all"
        />
      </div>
      <div className="flex gap-3">
        <button className="bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-gray-100 transition-all">
          <UserPlus size={16} /> Add User
        </button>
      </div>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-900/30 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800">
            <th className="py-4 pl-6">Identity</th>
            <th className="py-4">Access Role</th>
            <th className="py-4">Status & Control</th>
            <th className="py-4 pr-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {users.length > 0 ? (
            users.map(user => (
              <UserRow key={user.id} user={user} onToggle={onToggle} onEdit={onEdit} />
            ))
          ) : (
            <tr>
              <td colSpan="4" className="py-12 text-center text-gray-500 font-medium italic">
                No users found in the system directory.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default UserTable;