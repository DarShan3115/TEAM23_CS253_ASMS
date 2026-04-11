import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Calendar,
  MessageSquare,
  User
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const ACADEMIC_API = import.meta.env.VITE_ACADEMIC_API_URL || '/api/academic';
const PRODUCTIVITY_API = import.meta.env.VITE_PRODUCTIVITY_API_URL || '/api/productivity/v1';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [schedule, setSchedule] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch both schedule and tasks in parallel
      const [scheduleRes, tasksRes] = await Promise.all([
        api.get(`${ACADEMIC_API}/courses/my-schedule/`),
        api.get(`${PRODUCTIVITY_API}/tasks`)
      ]);
      
      setSchedule(scheduleRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    { label: 'Active Courses', value: schedule.length, icon: BookOpen, color: 'text-blue-500' },
    { label: 'Pending Tasks', value: tasks.filter(t => !t.is_completed).length, icon: Clock, color: 'text-amber-500' },
    { label: 'Completed', value: tasks.filter(t => t.is_completed).length, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Attendance (Avg)', value: '92%', icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── Welcome Piece ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-white">Welcome back, {user?.first_name || 'Student'}!</h1>
            <p className="text-zinc-400 mt-2 font-medium">You have {tasks.filter(t => !t.is_completed).length} items requiring your attention today.</p>
          </div>
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                <User size={16} />
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
              +12
            </div>
          </div>
        </div>
        
        {/* Subtle geometric accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl rounded-full -mr-20 -mt-20" />
      </div>

      {/* ── Quick Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors group">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-zinc-900 group-hover:scale-110 transition-transform ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-semibold text-white mt-0.5">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Today's Schedule (Live) ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <Calendar size={20} className="text-blue-500" /> Today's Schedule
            </h2>
            <button className="text-xs font-bold text-blue-500 hover:text-blue-400 Transition">Full Calendar</button>
          </div>
          
          <div className="space-y-3">
            {schedule.length > 0 ? schedule.slice(0, 4).map((cls) => (
              <div key={cls.id} className="bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex items-center justify-between group transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-950 rounded-xl flex flex-col items-center justify-center border border-zinc-800 group-hover:border-blue-500/30 transition-colors">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">LEC</span>
                    <span className="text-xs font-bold text-zinc-400">{cls.room || 'TBD'}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{cls.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1">{cls.time || 'Schedule pending'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-zinc-400">{cls.instructor || 'TBD'}</p>
                  <p className="text-[10px] text-zinc-600 mt-1 font-black uppercase tracking-widest">{cls.code || 'CORE'}</p>
                </div>
              </div>
            )) : (
              <div className="py-12 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-zinc-600">
                <p className="text-sm">No classes scheduled for today.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Activity / Alerts ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-semibold text-white">Coming Up</h2>
             <MessageSquare size={18} className="text-zinc-600" />
          </div>
          
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6">
            {tasks.filter(t => !t.is_completed).slice(0, 3).map((task) => (
              <div key={task.id} className="relative pl-6 border-l-2 border-zinc-800 pb-2">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500" />
                <h4 className="text-sm font-semibold text-white">{task.title}</h4>
                <p className="text-zinc-500 text-xs mt-1">Due: {task.due_date || 'No Date'}</p>
              </div>
            ))}
            
            {tasks.filter(t => !t.is_completed).length === 0 && (
               <p className="text-sm text-zinc-600 text-center py-4">All caught up!</p>
            )}

            <button className="w-full py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 text-xs font-bold hover:text-white hover:border-zinc-700 transition-all flex items-center justify-center gap-2">
              View All Activity <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
