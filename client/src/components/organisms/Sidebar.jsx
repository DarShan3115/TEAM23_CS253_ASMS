import React from 'react';
import { 
  LayoutDashboard, BookOpen, ClipboardList, 
  BarChart3, MessageSquare, ShieldAlert, LogOut,
  User, Settings
} from 'lucide-react';

/**
 * ROLE-BASED SIDEBAR
 * Automatically adjusts navigation items based on the user's role.
 */
const Sidebar = ({ user, activeTab, setActiveTab, onLogout }) => {
  const role = user?.role || 'student';

  const menuItems = {
    student: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'catalog', label: 'Course Catalog', icon: BookOpen },
      { id: 'assignments', label: 'Assignments', icon: ClipboardList },
      { id: 'progress', label: 'Academic Progress', icon: BarChart3 },
      { id: 'discussions', label: 'Anonymous Portal', icon: MessageSquare },
    ],
    faculty: [
      { id: 'faculty-dash', label: 'Faculty Hub', icon: LayoutDashboard },
      { id: 'grading', label: 'Grading Room', icon: ClipboardList },
      { id: 'discussions', label: 'Course Forums', icon: MessageSquare },
    ],
    admin: [
      { id: 'admin-panel', label: 'System Admin', icon: ShieldAlert },
      { id: 'health', label: 'Service Health', icon: Settings },
    ]
  };

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
            <BookOpen className="text-white" size={20} />
          </div>
          <span className="text-xl font-black text-white tracking-tighter">ASMS.</span>
        </div>

        <nav className="space-y-2">
          {menuItems[role].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-gray-500 hover:text-white hover:bg-gray-900'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white uppercase">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;