import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Shield, ClipboardList, Users, BarChart3, Building2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const roleConfig = {
  student: {
    label: 'Student',
    icon: GraduationCap,
    stats: [
      { key: 'enrolledCourses',    label: 'Enrolled Courses',    icon: BookOpen,     color: 'text-blue-400'   },
      { key: 'cpi',                label: 'Overall CPI',         icon: BarChart3,    color: 'text-green-400'  },
      { key: 'pendingAssignments', label: 'Pending Tasks',       icon: ClipboardList,color: 'text-yellow-400' },
    ],
  },
  faculty: {
    label: 'Instructor',
    icon: BookOpen,
    stats: [
      { key: 'activeCourses',  label: 'Active Courses',  icon: BookOpen,     color: 'text-blue-400'   },
      { key: 'totalStudents',  label: 'Total Students',  icon: Users,        color: 'text-emerald-400'},
      { key: 'pendingGrades',  label: 'Pending Grades',  icon: ClipboardList,color: 'text-yellow-400' },
    ],
  },
  admin: {
    label: 'Administrator',
    icon: Shield,
    stats: [
      { key: 'totalUsers',   label: 'Total Users',    icon: Users,    color: 'text-blue-400'  },
      { key: 'activeCourses',label: 'Active Courses', icon: BookOpen, color: 'text-green-400' },
      { key: 'departments',  label: 'Departments',    icon: BarChart3,color: 'text-zinc-400'  },
    ],
  },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role || 'student';
  const config = roleConfig[role] || roleConfig.student;
  const RoleIcon = config.icon;

  const [statsData, setStatsData] = useState({
    enrolledCourses: '—', cpi: '—', pendingAssignments: '—',
    activeCourses: '—', totalStudents: '—', pendingGrades: '—',
    totalUsers: '—', departments: '—',
  });

  useEffect(() => {
    if (role === 'student') fetchStudentData();
  }, [role]);

  const fetchStudentData = async () => {
    try {
      const [scheduleRes, analyticsRes] = await Promise.all([
        api.get('/api/academic/courses/my-schedule/'),
        api.get('/api/analytics/student/overview'),
      ]);
      setStatsData(prev => ({
        ...prev,
        enrolledCourses:    scheduleRes.data?.length ?? 0,
        cpi:                analyticsRes.data?.gpa?.toFixed(2) ?? '—',
        pendingAssignments: analyticsRes.data?.pending_assignments ?? '—',
      }));
    } catch {
      // non-fatal — keep defaults
    }
  };

  const statValues = config.stats.map(s => ({ ...s, value: statsData[s.key] ?? '—' }));

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="flex items-center gap-5 pb-6 border-b border-zinc-800">
        <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl font-semibold text-white shrink-0">
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="avatar" className="w-full h-full rounded-full object-cover" />
            : <>{user?.first_name?.[0]}{user?.last_name?.[0]}</>
          }
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Welcome back, {user?.first_name}!
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-md">
              <RoleIcon size={13} className="text-blue-400" /> {config.label}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-md">
              <Building2 size={13} className="text-zinc-500" /> Dept. of Computer Science
            </span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {statValues.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div key={stat.label}
              className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 mb-2">{stat.label}</p>
                <p className={`text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className="p-2.5 bg-zinc-800 rounded-lg">
                <StatIcon size={18} className={stat.color} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
