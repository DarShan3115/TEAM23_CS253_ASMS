import useAuthStore from '../store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.first_name || 'User'}!
        </h1>
        <p className="text-zinc-400 mt-1">Here&apos;s your academic overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Enrolled Courses', value: '—', color: 'text-blue-400' },
          { label: 'Pending Assignments', value: '—', color: 'text-yellow-400' },
          { label: 'Attendance Rate', value: '—', color: 'text-green-400' },
        ].map((stat) => (
          <div key={stat.label} className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
            <p className="text-sm text-zinc-400">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/20 transition">
            View Courses
          </button>
          <button className="px-4 py-2 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/20 transition">
            My Assignments
          </button>
          <button className="px-4 py-2 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/20 transition">
            Announcements
          </button>
        </div>
      </div>
    </div>
  );
}
