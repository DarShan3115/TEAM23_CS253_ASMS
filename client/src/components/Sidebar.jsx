import { NavLink } from 'react-router-dom';
<<<<<<< HEAD

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/courses', label: 'Courses' },
  { to: '/assignments', label: 'Assignments' },
  { to: '/attendance', label: 'Attendance' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-zinc-800 bg-zinc-950 p-4 gap-1">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg text-sm transition ${
              isActive
                ? 'bg-brand-primary/10 text-brand-primary font-medium'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
=======
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  Bell,
  Users,
  Building2,
  Settings,
  BarChart3,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const navByRole = {
  student: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/notices', label: 'Notices', icon: Bell },
  ],
  faculty: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'My Courses', icon: BookOpen },
    { to: '/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/notices', label: 'Notices', icon: Bell },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/users', label: 'Users', icon: Users },
    { to: '/departments', label: 'Departments', icon: Building2 },
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/notices', label: 'Notices', icon: Bell },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
};

export default function Sidebar() {
  const { user } = useAuthStore();
  const links = navByRole[user?.role] || navByRole.student;

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-zinc-800 bg-zinc-950 p-4 gap-1">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-brand-primary/10 text-brand-primary font-medium'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {link.label}
          </NavLink>
        );
      })}
>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da
    </aside>
  );
}
