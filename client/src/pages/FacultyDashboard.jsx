import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, RefreshCcw, ArrowRight, GraduationCap,
  Building2, ClipboardCheck, Plus, X, Copy, Check,
  Calendar, Bell, BarChart2, Clock, MessageSquare
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const ACADEMIC = import.meta.env.VITE_ACADEMIC_API_URL || '/api/academic';
const PRODUCTIVITY = import.meta.env.VITE_PRODUCTIVITY_API_URL || '/api/productivity/v1';

const TODAY_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ── Add Course Modal ──────────────────────────────────────────────────────────
function AddCourseModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ code: '', title: '', description: '', credits: 3, semester: '', max_enrollment: 60 });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.title.trim()) { setError('Course code and title are required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await api.post(`${ACADEMIC}/courses/`, {
        code: form.code.trim().toUpperCase(), title: form.title.trim(),
        description: form.description.trim(), credits: Number(form.credits) || 3,
        semester: form.semester.trim() || 'Ongoing', max_enrollment: Number(form.max_enrollment) || 60,
      });
      setResult(res.data);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create course. Please try again.');
    } finally { setSaving(false); }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(result.enrollment_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inp = 'w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition-colors placeholder-zinc-600';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-white">Create New Course</h2>
            <p className="text-xs text-zinc-500 mt-0.5">An enrollment key will be auto-generated</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"><X size={18} /></button>
        </div>

        {result ? (
          <div className="p-6 space-y-5">
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-12 h-12 bg-green-500/15 rounded-full flex items-center justify-center mb-3">
                <Check size={24} className="text-green-400" />
              </div>
              <h3 className="text-white font-bold text-lg">Course Created!</h3>
              <p className="text-zinc-400 text-sm mt-1">Share the enrollment key with your students.</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-700 rounded-xl p-4">
              <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">Enrollment Key</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-blue-400 font-mono text-lg font-bold tracking-widest">{result.enrollment_key}</code>
                <button onClick={copyKey} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${copied ? 'bg-green-600/20 text-green-400' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
                  {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                </button>
              </div>
            </div>
            <button onClick={onClose} className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase block mb-1.5">Course Code *</label>
                <input type="text" placeholder="e.g. CS253" maxLength={12} value={form.code} onChange={e => set('code', e.target.value)} className={inp + ' uppercase'} />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase block mb-1.5">Credits</label>
                <input type="number" min={1} max={15} value={form.credits} onChange={e => set('credits', e.target.value)} className={inp} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase block mb-1.5">Course Title *</label>
              <input type="text" placeholder="e.g. Software Engineering" value={form.title} onChange={e => set('title', e.target.value)} className={inp} />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase block mb-1.5">Description</label>
              <textarea placeholder="Brief course overview..." rows={3} value={form.description} onChange={e => set('description', e.target.value)} className={inp + ' resize-none'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase block mb-1.5">Semester</label>
                <input type="text" placeholder="e.g. 2025-I" value={form.semester} onChange={e => set('semester', e.target.value)} className={inp} />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase block mb-1.5">Max Enrollment</label>
                <input type="number" min={1} max={500} value={form.max_enrollment} onChange={e => set('max_enrollment', e.target.value)} className={inp} />
              </div>
            </div>
            {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-lg">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-colors text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                {saving ? 'Creating…' : <><Plus size={15} /> Create Course</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main Faculty Dashboard ────────────────────────────────────────────────────
export default function FacultyDashboard() {
  const { user }    = useAuthStore();
  const navigate    = useNavigate();
  const [courses, setCourses]       = useState([]);
  const [timetable, setTimetable]   = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseRes, ttRes] = await Promise.allSettled([
        api.get(`${ACADEMIC}/courses/faculty-load/`),
        api.get(`${ACADEMIC}/timetable/`)
      ]);

      const courseList = courseRes.status === 'fulfilled' ? (courseRes.value.data || []) : [];
      const tt         = ttRes.status     === 'fulfilled' ? (ttRes.value.data   || []) : [];

      setCourses(courseList);
      setTimetable(tt);

      // Fetch latest announcements from managed courses
      if (courseList.length > 0) {
        const annResults = await Promise.allSettled(
          courseList.slice(0, 3).map(c => api.get(`${ACADEMIC}/courses/${c.id}/announcements/`))
        );
        const allAnn = annResults
          .filter(r => r.status === 'fulfilled')
          .flatMap(r => r.value.data || [])
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 4);
        setAnnouncements(allAnn);
      }
    } catch (err) {
      console.error('Faculty dashboard error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Today's schedule
  const todayName  = TODAY_DAYS[new Date().getDay()];
  const todaySched = timetable
    .filter(s => s.day === todayName)
    .sort((a, b) => a.start_time?.localeCompare(b.start_time));

  const fmtTime = (t = '') => {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  const totalStudents = courses.reduce((s, c) => s + (c.students_count || 0), 0);

  const statCards = [
    { label: 'Courses Instructing',   value: loading ? '…' : courses.length,    icon: BookOpen,      color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
    { label: 'Total Students',   value: loading ? '…' : totalStudents,      icon: Users,         color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: "Today's Classes",  value: loading ? '…' : todaySched.length,  icon: Calendar,      color: 'text-violet-400',  bg: 'bg-violet-500/10'  },
  ];

  const typeColors = {
    Lec: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Lab: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Tut: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="space-y-8">
      {showModal && (
        <AddCourseModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); fetchData(); }} />
      )}

      {/* ── Welcome Banner ── */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-800 rounded-3xl p-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/8 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-blue-500/20 shrink-0">
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
                : <>{user?.first_name?.[0]}{user?.last_name?.[0]}</>}
            </div>
            <div>
              <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">{todayName} · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</p>
              <h1 className="text-2xl font-black text-white">Welcome, Prof. {user?.first_name}!</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-lg">
                  <GraduationCap size={12} className="text-emerald-400" /> Instructor
                </span>
                <span className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-lg">
                  <Building2 size={12} className="text-zinc-500" /> Computer Science
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus size={16} /> New Course
            </button>
            <button onClick={fetchData} className="p-2.5 border border-zinc-700 bg-zinc-800 rounded-xl text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors">
              <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{s.label}</p>
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon size={14} className={s.color} />
              </div>
            </div>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Courses + Timetable ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Today's Teaching Schedule */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} className="text-violet-400" /> Today's Teaching ({todayName})
              </h2>
            </div>

            {loading ? (
              <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-16 bg-zinc-900 animate-pulse rounded-xl border border-zinc-800" />)}</div>
            ) : todaySched.length > 0 ? (
              <div className="space-y-2">
                {todaySched.map(cls => (
                  <div key={cls.id} className={`flex items-center gap-3 p-3.5 rounded-xl border ${typeColors[cls.type] || typeColors.Lec}`}>
                    <div className={`shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center text-center ${typeColors[cls.type] || typeColors.Lec}`}>
                      <span className="text-[9px] font-black uppercase">{cls.type || 'LEC'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{cls.course_title}</p>
                      <p className="text-xs text-zinc-500">{fmtTime(cls.start_time)} — {fmtTime(cls.end_time)}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg shrink-0 ${typeColors[cls.type] || typeColors.Lec}`}>{cls.course_code}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center gap-3 text-zinc-600">
                <Calendar size={20} />
                <p className="text-sm">No classes scheduled for today.</p>
              </div>
            )}
          </div>

          {/* My Courses */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={14} className="text-blue-400" /> My Courses
              </h2>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-black rounded-lg transition-all">
                <Plus size={12} /> Add Course
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-zinc-900 animate-pulse rounded-xl border border-zinc-800" />)}</div>
            ) : courses.length === 0 ? (
              <div onClick={() => setShowModal(true)} className="py-16 border-2 border-dashed border-zinc-700 hover:border-blue-500/40 rounded-xl text-center cursor-pointer transition-colors group">
                <div className="w-12 h-12 bg-zinc-800 group-hover:bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
                  <Plus size={22} className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
                </div>
                <p className="text-zinc-500 text-sm font-medium group-hover:text-zinc-300 transition-colors">No courses yet — click to create your first one</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Add tile */}
                <div
                  onClick={() => setShowModal(true)}
                  className="border-2 border-dashed border-zinc-700 hover:border-blue-500/40 rounded-xl p-5 cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[140px] transition-all group"
                >
                  <div className="w-10 h-10 bg-zinc-800 group-hover:bg-blue-600/10 rounded-lg flex items-center justify-center transition-colors">
                    <Plus size={20} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <p className="text-sm font-black text-zinc-500 group-hover:text-zinc-300 transition-colors">Add Course</p>
                </div>

                {courses.map(course => (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/faculty/courses/${course.id}`)}
                    className="bg-zinc-900 border border-zinc-800 hover:border-blue-500/30 rounded-xl p-5 cursor-pointer group transition-all hover:shadow-lg hover:shadow-blue-500/5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-blue-600/10 transition-colors">
                        <BookOpen size={16} className="text-blue-400" />
                      </div>
                      <span className="text-xs font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">{course.code}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors leading-tight mb-1">{course.title}</h3>
                    <p className="text-xs text-zinc-500">{course.credits || 3} Credits · {course.semester || '—'}</p>
                    <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500 flex items-center gap-1"><Users size={11} /> {course.students_count || 0}</span>
                        {course.avg_attendance && (
                          <span className="text-xs text-zinc-600 flex items-center gap-1"><BarChart2 size={11} /> {course.avg_attendance}%</span>
                        )}
                      </div>
                      <ArrowRight size={14} className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-5">

          {/* Grade Submission Portal */}
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-3">
              <ClipboardCheck size={14} className="text-emerald-400" /> Grade Submissions
            </h2>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <p className="text-xs text-zinc-400">Finalize and submit official semester grades for all your assigned courses.</p>
              <button onClick={() => navigate('/faculty/grades')} className="w-full py-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2">
                Open Grade Portal <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Recent Announcements from my courses */}
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-3">
              <Bell size={14} className="text-blue-400" /> Course Notices
            </h2>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
              {loading ? (
                <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-12 bg-zinc-900 animate-pulse rounded-lg" />)}</div>
              ) : announcements.length > 0 ? (
                announcements.map(ann => (
                  <div key={ann.id} className="border-l-2 border-blue-500/30 pl-3 py-0.5">
                    <p className="text-xs font-bold text-white leading-tight">{ann.title}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{ann.body?.slice(0, 70)}{ann.body?.length > 70 ? '…' : ''}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-600 text-center py-3">No recent announcements posted.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}