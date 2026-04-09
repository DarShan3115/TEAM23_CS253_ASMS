import React from 'react';
import { GraduationCap, BookOpen, Shield, ClipboardList, Users, BarChart3 } from 'lucide-react';
import {useAuthStore} from '../store/authStore';

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
  },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const config = roleConfig[user?.role] || roleConfig.student;
  const RoleIcon = config.icon;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}
        >
          <RoleIcon className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome, {user?.first_name || 'User'}!
          </h1>
          <p className="text-zinc-400 mt-1">{config.greeting}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {config.stats.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-start justify-between group hover:border-zinc-700 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-zinc-500 mb-2">{stat.label}</p>
                <p className={`text-4xl font-black ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-zinc-950/50 group-hover:bg-zinc-800 transition-colors`}>
                <StatIcon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
