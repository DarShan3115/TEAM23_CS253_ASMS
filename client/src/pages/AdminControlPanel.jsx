import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/organisms/AdminSidebar';
import UserTable from '../components/organisms/UserTable';
import DepartmentCard from '../components/molecules/DepartmentCard';
import { 
  ShieldAlert, 
  Users, 
  Building2, 
  Settings, 
  Activity, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Search,
  Filter,
  CheckCircle,
  Database
} from 'lucide-react';
import axios from 'axios';

export default function AdminControlPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([
    { id: '1', first_name: 'Super', last_name: 'Admin', email: 'root@asms.edu', role: 'admin', is_active: true },
    { id: '2', first_name: 'Professor', last_name: 'Xavier', email: 'xavier@asms.edu', role: 'faculty', is_active: true },
    { id: '3', first_name: 'John', last_name: 'Doe', email: 'john@student.asms.edu', role: 'student', is_active: false },
  ]);

  const toggleUserStatus = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="lg:ml-64 min-h-screen">
        <header className="h-20 border-b border-gray-800 px-8 flex items-center justify-between sticky top-0 bg-gray-950/80 backdrop-blur-xl z-20">
          <div>
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest">Management Console</h2>
            <p className="text-lg font-bold text-white capitalize">{activeTab.replace('-', ' ')}</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                System Operational
             </div>
             <div className="w-10 h-10 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 font-black text-xs">SA</div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
          
          {activeTab === 'users' && (
            <section className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter">Global Identities</h1>
                  <p className="text-gray-500 text-sm mt-1">Manage cross-service user accounts and access levels.</p>
                </div>
              </div>
              <UserTable 
                users={users} 
                onToggle={toggleUserStatus} 
                onEdit={(u) => console.log("Edit", u)} 
              />
            </section>
          )}

          {activeTab === 'departments' && (
            <section className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter">Master Data</h1>
                  <p className="text-gray-500 text-sm mt-1">Configure institutional departments and faculty headers.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all">
                  Create Dept
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DepartmentCard 
                  dept={{ name: 'Computer Science', code: 'CS-DEPT', head: 'Dr. Tandel' }} 
                  onSettings={() => {}}
                />
                <DepartmentCard 
                  dept={{ name: 'Electronic Eng.', code: 'EE-DEPT', head: 'Dr. Mehta' }} 
                  onSettings={() => {}}
                />
              </div>
            </section>
          )}

          {activeTab === 'system' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-gray-800/40 border border-gray-700 rounded-3xl p-8 space-y-6">
                  <h3 className="text-white font-black text-sm uppercase flex items-center gap-2"><Server size={18} className="text-blue-500"/> Infrastructure Logs</h3>
                  <div className="space-y-3">
                     {['auth-service', 'academic-service', 'productivity-service', 'analytics-service'].map(s => (
                       <div key={s} className="flex justify-between items-center p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
                          <span className="text-xs font-bold text-gray-300">{s}</span>
                          <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded uppercase">Healthy</span>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="bg-gray-800/40 border border-gray-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <Database size={40} className="text-green-500" />
                  </div>
                  <h3 className="text-2xl font-black text-white">Database Cluster</h3>
                  <p className="text-gray-500 text-sm mt-2 max-w-xs">Primary PostgreSQL instance is running at 12% capacity. All backups verified.</p>
                  <button className="mt-8 bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase transition-all">Maintenance Mode</button>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}