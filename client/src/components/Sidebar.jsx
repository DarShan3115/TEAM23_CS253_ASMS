import { NavLink } from 'react-router-dom';

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
    </aside>
  );
}
