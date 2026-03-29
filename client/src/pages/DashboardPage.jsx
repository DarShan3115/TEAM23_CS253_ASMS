import { GraduationCap, BookOpen, Shield, ClipboardList, Users, BarChart3 } from 'lucide-react';
import useAuthStore from '../store/authStore';

const roleConfig = {
  student: {
    greeting: 'Student Dashboard',
    icon: GraduationCap,
    gradient: 'from-blue-600 to-blue-400',
    stats: [
      { label: 'Enrolled Courses', value: '--', icon: BookOpen, color: 'text-blue-400' },
      { label: 'Pending Assignments', value: '--', icon: ClipboardList, color: 'text-yellow-400' },
      { label: 'Attendance Rate', value: '--', icon: BarChart3, color: 'text-green-400' },
    ],
    actions: ['View Courses', 'My Assignments', 'Check Attendance', 'Announcements'],
  },
  faculty: {
    greeting: 'Professor Dashboard',
    icon: BookOpen,
    gradient: 'from-emerald-600 to-emerald-400',
    stats: [
      { label: 'My Courses', value: '--', icon: BookOpen, color: 'text-emerald-400' },
      { label: 'Total Students', value: '--', icon: Users, color: 'text-blue-400' },
      { label: 'Pending Grading', value: '--', icon: ClipboardList, color: 'text-yellow-400' },
    ],
    actions: ['Manage Courses', 'Grade Assignments', 'Mark Attendance', 'Post Notice'],
  },
  admin: {
    greeting: 'Admin Dashboard',
    icon: Shield,
    gradient: 'from-amber-600 to-amber-400',
    stats: [
      { label: 'Total Users', value: '--', icon: Users, color: 'text-amber-400' },
      { label: 'Active Courses', value: '--', icon: BookOpen, color: 'text-blue-400' },
      { label: 'Departments', value: '--', icon: BarChart3, color: 'text-emerald-400' },
    ],
    actions: ['Manage Users', 'Manage Departments', 'System Settings', 'View Analytics'],
  },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const config = roleConfig[user?.role] || roleConfig.student;
  const RoleIcon = config.icon;

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
        >
          <RoleIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {user?.first_name || 'User'}!
          </h1>
          <p className="text-zinc-400 text-sm">{config.greeting}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {config.stats.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start justify-between"
            >
              <div>
                <p className="text-sm text-zinc-400">{stat.label}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <StatIcon className={`w-5 h-5 ${stat.color} opacity-50`} />
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {config.actions.map((action) => (
            <button
              key={action}
              className="px-4 py-2 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/20 transition text-sm"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
