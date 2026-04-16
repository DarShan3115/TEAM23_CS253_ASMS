import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Clock, CheckCircle2, ArrowRight,
  TrendingUp, Calendar, MessageSquare, User,
  ClipboardList, Bell
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const ACADEMIC_API = import.meta.env.VITE_ACADEMIC_API_URL || '/api/academic';
const PRODUCTIVITY_API = import.meta.env.VITE_PRODUCTIVITY_API_URL || '/api/productivity/v1';

const TODAY_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [timetable, setTimetable]             = useState([]);
  const [tasks, setTasks]                     = useState([]);
  const [announcements, setAnnouncements]     = useState([]);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [schedRes, ttRes, taskRes] = await Promise.allSettled([
        api.get(`${ACADEMIC_API}/courses/my-schedule/`),   // enrolled courses list
        api.get(`${ACADEMIC_API}/timetable/`),             // actual schedule slots with day/time
        api.get(`${PRODUCTIVITY_API}/tasks`),
      ]);

      const courses = schedRes.status === 'fulfilled' ? (schedRes.value.data || []) : [];
      const tt      = ttRes.status   === 'fulfilled' ? (ttRes.value.data || [])     : [];
      const taskArr = taskRes.status === 'fulfilled' ? (taskRes.value.data || [])   : [];

      setEnrolledCourses(courses);
      setTimetable(tt);
      setTasks(taskArr);

      // Fetch upcoming announcements from all enrolled courses
      if (courses.length > 0) {
        const annResults = await Promise.allSettled(
          courses.slice(0, 3).map(c =>
            api.get(`${ACADEMIC_API}/courses/${c.id}/announcements/`)
          )
        );
        const allAnn = annResults
          .filter(r => r.status === 'fulfilled')
          .flatMap(r => r.value.data || [])
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 4);
        setAnnouncements(allAnn);
      }
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter timetable to today's day
  const todayName  = TODAY_DAYS[new Date().getDay()];
  const todaySched = timetable
    .filter(s => s.day === todayName)
    .sort((a, b) => a.start_time?.localeCompare(b.start_time));

  // Format time like "09:00" → "9:00 AM"
  const fmtTime = (t = '') => {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const pendingTasks    = tasks.filter(t => !t.is_completed);
  const completedTasks  = tasks.filter(t => t.is_completed);

  const stats = [
    { label: 'Active Courses',   value: loading ? '…' : enrolledCourses.length,   icon: BookOpen,      color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
    { label: 'Pending Tasks',    value: loading ? '…' : pendingTasks.length,       icon: Clock,         color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
    { label: 'Completed Tasks',  value: loading ? '…' : completedTasks.length,     icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: "Today's Classes",  value: loading ? '…' : todaySched.length,         icon: TrendingUp,    color: 'text-purple-400',  bg: 'bg-purple-500/10'  },
  ];

  const typeColors = { Lec: 'bg-blue-500/10 text-blue-400', Lab: 'bg-purple-500/10 text-purple-400', Tut: 'bg-amber-500/10 text-amber-400' };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* ── Welcome Banner ── */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-800 rounded-3xl p-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">{todayName} · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <h1 className="text-3xl font-black text-white">Welcome back, {user?.first_name || 'Student'}!</h1>
            <p className="text-zinc-400 mt-1 text-sm">
              {pendingTasks.length > 0
                ? `You have ${pendingTasks.length} pending task${pendingTasks.length > 1 ? 's' : ''} requiring your attention.`
                : 'All caught up! Great work.'}
            </p>
          </div>
          <div className="flex -space-x-2 shrink-0">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-9 h-9 rounded-full border-2 border-zinc-900 bg-zinc-700 flex items-center justify-center">
                <User size={14} className="text-zinc-400" />
              </div>
            ))}
            <div className="w-9 h-9 rounded-full border-2 border-zinc-900 bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">
              +{enrolledCourses.length * 12}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon size={14} className={s.color} />
              </div>
            </div>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Today's Schedule ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Calendar size={16} className="text-blue-400" /> Today's Schedule
              <span className="text-zinc-600 font-medium normal-case text-xs ml-1">({todayName})</span>
            </h2>
            <Link to="/timetable" className="text-xs font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors">Full View →</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-20 bg-zinc-900 animate-pulse rounded-2xl border border-zinc-800" />)}
            </div>
          ) : todaySched.length > 0 ? (
            <div className="space-y-3">
              {todaySched.map(cls => (
                <div key={cls.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex items-center gap-4 transition-all group">
                  <div className={`shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-center ${typeColors[cls.type] || typeColors.Lec}`}>
                    <span className="text-[9px] font-black uppercase tracking-tighter">{cls.type || 'LEC'}</span>
                    <span className="text-xs font-black mt-0.5">{cls.course_code}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">{cls.course_title}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {fmtTime(cls.start_time)} — {fmtTime(cls.end_time)}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg shrink-0 ${typeColors[cls.type] || typeColors.Lec}`}>
                    {cls.type === 'Lab' ? 'Lab Session' : cls.type === 'Tut' ? 'Tutorial' : 'Lecture'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
              <Calendar size={28} className="text-zinc-700" />
              <p className="text-sm text-zinc-600 font-medium">No classes scheduled for today.</p>
              <p className="text-xs text-zinc-700">Check the full timetable for the rest of the week.</p>
            </div>
          )}

          {/* ── Active Courses ── */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={16} className="text-emerald-400" /> Active Courses
            </h2>
            {loading ? (
              <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-14 bg-zinc-900 animate-pulse rounded-xl border border-zinc-800" />)}</div>
            ) : enrolledCourses.length > 0 ? (
              <div className="space-y-2">
                {enrolledCourses.map(c => (
                  <Link
                    key={c.id}
                    to={`/courses/${c.id}`}
                    className="flex items-center justify-between p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-emerald-500/30 hover:bg-zinc-900/80 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">{c.code}</span>
                      <span className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{c.title}</span>
                    </div>
                    <ArrowRight size={14} className="text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 border-2 border-dashed border-zinc-800 rounded-xl text-center">
                <p className="text-sm text-zinc-600">Not enrolled in any courses yet.</p>
                <Link to="/courses" className="text-xs text-blue-400 font-bold hover:text-blue-300 mt-1 inline-block">Browse Courses →</Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Coming Up sidebar ── */}
        <div className="space-y-4">
          {/* Pending Tasks */}
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2 mb-3">
              <ClipboardList size={16} className="text-amber-400" /> Coming Up
            </h2>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-4">
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-zinc-900 animate-pulse rounded-lg" />)}</div>
              ) : pendingTasks.length > 0 ? (
                pendingTasks.slice(0, 4).map(task => (
                  <div key={task.id} className="relative pl-5 border-l-2 border-amber-500/30 pb-1">
                    <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-zinc-950" />
                    <h4 className="text-sm font-semibold text-white leading-tight">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      {task.course_tag && <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">{task.course_tag}</span>}
                      <p className="text-zinc-500 text-xs">Due: {task.due_date || 'No date'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center">
                  <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-1" />
                  <p className="text-sm text-zinc-500">All caught up!</p>
                </div>
              )}
              <Link to="/tasks" className="w-full py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 text-xs font-bold hover:text-white hover:border-zinc-700 transition-all flex items-center justify-center gap-2 mt-2">
                View All Tasks <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Announcements */}
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2 mb-3">
              <Bell size={16} className="text-blue-400" /> Recent Notices
            </h2>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
              {loading ? (
                <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-12 bg-zinc-900 animate-pulse rounded-lg" />)}</div>
              ) : announcements.length > 0 ? (
                announcements.map(ann => (
                  <div key={ann.id} className="border-l-2 border-blue-500/40 pl-3 py-0.5">
                    <p className="text-xs font-bold text-white leading-tight">{ann.title}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{ann.body?.slice(0, 60)}{ann.body?.length > 60 ? '…' : ''}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-600 text-center py-3">No recent announcements.</p>
              )}
              <Link to="/discussions" className="w-full py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 text-xs font-bold hover:text-blue-400 hover:border-blue-500/30 transition-all flex items-center justify-center gap-2 mt-1">
                <MessageSquare size={12} /> Open Discussions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
