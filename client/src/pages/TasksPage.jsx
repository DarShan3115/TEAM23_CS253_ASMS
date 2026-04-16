import React, { useState, useEffect, useCallback } from 'react';
import { CheckSquare, Filter, Plus, CalendarDays, Save, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PRODUCTIVITY_API = import.meta.env.VITE_PRODUCTIVITY_API_URL || '/api/productivity/v1';
const ACADEMIC_API = import.meta.env.VITE_ACADEMIC_API_URL || '/api/academic';

// Strip ISO timestamp suffix — shows only YYYY-MM-DD
const formatDate = (raw) => {
  if (!raw) return '—';
  return String(raw).split('T')[0];
};

// Normalize time to HH:MM — handles HH:MM:SS or null
const formatTime = (raw) => {
  if (!raw) return '';
  const parts = String(raw).split(':');
  if (parts.length >= 2) return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}`;
  return '';
};

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function TasksPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('checklist');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'due_date', direction: 'asc' });

  // Calendar navigation state
  const today = new Date();
  const [calYear, setCalYear]   = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-indexed

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get(`${PRODUCTIVITY_API}/tasks`);
      setTasks(res.data || []);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Pull assignments from enrolled courses and merge them as tasks with course code as tag
  const syncAssignmentsAsTasks = useCallback(async () => {
    try {
      const scheduleRes = await api.get(`${ACADEMIC_API}/courses/my-schedule/`);
      const courses = scheduleRes.data || [];

      const assignmentFetches = courses.map(course =>
        api.get(`${ACADEMIC_API}/courses/${course.id}/assignments/`)
          .then(r => (r.data || []).map(a => ({
            id:           `asgn-${a.id}`,
            assignmentId: a.id,          // real UUID for navigation
            courseId:     course.id,     // real UUID for navigation
            title:        a.title,
            due_date:     a.due_date || null,
            due_time:     null,
            course_tag:   course.code,
            custom_tag:   course.code,
            is_completed: false,
            isAssignment: true,
          })))
          .catch(() => [])
      );

      const results = await Promise.all(assignmentFetches);
      const assignmentTasks = results.flat();

      setTasks(prev => {
        // Remove old synced assignment entries and re-merge fresh ones
        const manualTasks = prev.filter(t => !t.isAssignment);
        return [...assignmentTasks, ...manualTasks];
      });
    } catch (err) {
      console.error('Assignment sync failed', err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    syncAssignmentsAsTasks();
  }, [fetchTasks, syncAssignmentsAsTasks]);

  const handleNewTask = () => {
    const newTask = { id: 'temp-' + Date.now(), title: '', due_date: '', due_time: '', custom_tag: '', is_completed: false, isNew: true };
    setTasks(prev => [newTask, ...prev]);
    setActiveTab('checklist');
  };

  const handleSaveTask = async (task) => {
    if (task.isAssignment) return; // assignments are read-only
    try {
      if (task.isNew) {
        const payload = {
          title:      task.title || 'Untitled',
          due_date:   task.due_date || null,
          due_time:   task.due_time || null,
          custom_tag: task.custom_tag || null,
        };
        const res = await api.post(`${PRODUCTIVITY_API}/tasks`, payload);
        setTasks(prev => prev.map(t => t.id === task.id ? { ...res.data, isNew: false } : t));
      } else {
        await api.put(`${PRODUCTIVITY_API}/tasks/${task.id}`, task);
      }
    } catch (err) {
      console.error('Error saving task', err);
    }
  };

  const toggleTask = async (task) => {
    if (task.isAssignment) return;
    const updated = !task.is_completed;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_completed: updated } : t));
    if (!task.isNew) {
      try { await api.put(`${PRODUCTIVITY_API}/tasks/${task.id}`, { ...task, is_completed: updated }); }
      catch (err) { console.error('Toggle failed', err); }
    }
  };

  const handleDeleteTask = async (id, isNew) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (!isNew) {
      try { await api.delete(`${PRODUCTIVITY_API}/tasks/${id}`); }
      catch (err) { console.error('Delete failed', err); }
    }
  };

  const handleTaskChange = (id, field, value) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  // Unique tags (course codes + custom tags), no # prefix
  const uniqueTags = Array.from(new Set(tasks.map(t => t.custom_tag || t.course_tag).filter(Boolean)));

  const displayedTasks = tasks.filter(task => {
    if (task.isNew) return true;
    if (selectedFolder === 'All') return true;
    return (task.custom_tag === selectedFolder || task.course_tag === selectedFolder);
  }).sort((a, b) => {
    if (a.isNew) return -1;
    if (b.isNew) return 1;
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key] || '';
    const bVal = b[sortConfig.key] || '';
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = () => {
    if (!sortConfig.key) setSortConfig({ key: 'due_date', direction: 'asc' });
    else if (sortConfig.direction === 'asc') setSortConfig({ key: 'due_date', direction: 'desc' });
    else setSortConfig({ key: null, direction: 'asc' });
  };

  // ── Calendar helpers ──────────────────────────────────────────────────────────
  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const renderCalendar = () => {
    const firstDay    = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const isCurrentMonth = calYear === today.getFullYear() && calMonth === today.getMonth();

    const cells = [];

    // Empty cells for offset
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="min-h-[90px]" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTasks = tasks.filter(t => formatDate(t.due_date) === dayStr);
      const isToday  = isCurrentMonth && d === today.getDate();

      cells.push(
        <div key={d} className={`min-h-[90px] bg-zinc-950 border rounded-xl p-2 flex flex-col gap-1 ${isToday ? 'border-blue-500/60 bg-blue-950/20' : 'border-zinc-800'}`}>
          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full self-start ${
            isToday ? 'bg-blue-600 text-white' : 'text-zinc-500'
          }`}>{d}</span>
          {dayTasks.map(t => (
            <div key={t.id} className={`text-[10px] font-bold px-1.5 py-0.5 rounded truncate flex items-center gap-1 ${
              t.isAssignment ? 'bg-purple-500/15 text-purple-400' :
              t.is_completed ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
            }`}>
              {t.course_tag && <span className="opacity-75">{t.course_tag}</span>}
              {t.course_tag && '·'} {t.title}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="p-6 space-y-5">
        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="text-blue-500" size={22} />
            {MONTH_NAMES[calMonth]} {calYear}
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => { setCalMonth(today.getMonth()); setCalYear(today.getFullYear()); }}
              className="px-3 py-1.5 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors">
              Today
            </button>
            <button onClick={nextMonth} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-1">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {cells}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 pt-2 border-t border-zinc-800">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500"><span className="w-2 h-2 rounded-sm bg-purple-500/50" /> Assignment</span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500"><span className="w-2 h-2 rounded-sm bg-blue-500/50" /> Task</span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500"><span className="w-2 h-2 rounded-sm bg-green-500/50" /> Done</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <CheckSquare className="text-blue-500" /> Task Management
          </h1>
          <p className="text-zinc-400 mt-2 font-medium">Assignments synced automatically. Add personal tasks below.</p>
        </div>
        <button onClick={handleNewTask} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-500 flex items-center gap-2 shadow-lg shadow-blue-500/20">
          <Plus size={18} /> New Task
        </button>
      </div>

      <div className="flex gap-4">
        <button onClick={() => setActiveTab('checklist')} className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === 'checklist' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Checklist</button>
        <button onClick={() => setActiveTab('calendar')} className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === 'calendar' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Calendar Timeline</button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl min-h-[500px] overflow-hidden shadow-2xl">
        {activeTab === 'checklist' && (
          <div>
            {/* Tag filters — no # */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border-b border-zinc-800 bg-zinc-950 rounded-t-2xl gap-4">
              <div className="flex gap-2 items-center overflow-x-auto pb-1 w-full sm:w-auto">
                <button onClick={() => setSelectedFolder('All')} className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${selectedFolder === 'All' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>All Tasks</button>
                {uniqueTags.map(tag => (
                  <button key={tag} onClick={() => setSelectedFolder(tag)} className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${selectedFolder === tag ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                    {tag}
                  </button>
                ))}
              </div>
              <button onClick={toggleSort} className="flex shrink-0 items-center gap-2 text-zinc-400 hover:text-white bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700 text-sm font-bold transition-colors">
                <Filter size={16} /> Sort by Date {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="text-zinc-500 text-xs font-bold uppercase tracking-wider border-b border-zinc-800 bg-zinc-900">
                    <th className="p-4 w-10" />
                    <th className="p-4 min-w-[220px]">Task / Assignment</th>
                    <th className="p-4 w-36">Due Date</th>
                    <th className="p-4 w-32">Time</th>
                    <th className="p-4 w-32">Course / Tag</th>
                    <th className="p-4 w-24" />
                  </tr>
                </thead>
                <tbody className="text-white divide-y divide-zinc-800/50">
                  {displayedTasks.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-zinc-500 font-bold">
                        No tasks found. Create one to get started!
                      </td>
                    </tr>
                  )}
                  {displayedTasks.map(task => (
                    <tr
                      key={task.id}
                      className={`hover:bg-zinc-800/50 transition-colors ${task.is_completed ? 'opacity-50' : ''}`}
                    >
                      <td className="p-4">
                        <input type="checkbox" checked={task.is_completed || false} onChange={() => toggleTask(task)}
                          className="w-5 h-5 rounded border-zinc-700 text-blue-600 cursor-pointer focus:ring-0 bg-transparent" />
                      </td>
                      <td className={`p-4 font-bold ${task.is_completed ? 'line-through text-zinc-500' : ''}`}>
                        <input type="text" placeholder="Task title..." value={task.title}
                          onChange={e => handleTaskChange(task.id, 'title', e.target.value)}
                          onBlur={() => !task.isNew && !task.isAssignment && handleSaveTask(task)}
                          readOnly={task.isAssignment}
                          className={`w-full bg-transparent border-none px-2 py-1.5 outline-none transition-colors ${task.isNew ? 'bg-zinc-950 border-zinc-700 border rounded-lg focus:border-blue-500' : ''}`} />
                      </td>
                      <td className="p-4 w-36">
                        {task.isAssignment ? (
                          <span className="text-zinc-400 font-mono text-sm whitespace-nowrap">{formatDate(task.due_date)}</span>
                        ) : (
                          <input type="date" value={formatDate(task.due_date)}
                            onChange={e => handleTaskChange(task.id, 'due_date', e.target.value)}
                            onBlur={() => !task.isNew && handleSaveTask(task)}
                            className={`w-full bg-transparent border-none text-zinc-400 font-mono text-sm outline-none cursor-pointer ${task.isNew ? 'bg-zinc-950 border-zinc-700 border rounded-lg px-2 py-1 focus:border-blue-500' : 'px-2 py-1'}`} />
                        )}
                      </td>
                      <td className="p-4 w-32">
                        {task.isAssignment || !task.due_time
                          ? <span className="text-zinc-600 font-mono text-sm">—</span>
                          : (
                            <input
                              type="time"
                              value={formatTime(task.due_time)}
                              onChange={e => handleTaskChange(task.id, 'due_time', e.target.value)}
                              onBlur={() => !task.isNew && handleSaveTask(task)}
                              className={`bg-transparent border-none text-zinc-300 font-mono text-sm outline-none cursor-pointer ${task.isNew ? 'bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 focus:border-blue-500' : 'px-2 py-1'}`}
                            />
                        )}
                      </td>
                      <td className="p-4">
                        {task.isAssignment ? (
                          <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-1 rounded uppercase">{task.course_tag}</span>
                        ) : (
                          <>
                            <input list="tag-suggestions" placeholder="Tag..." value={task.custom_tag || ''}
                              onChange={e => handleTaskChange(task.id, 'custom_tag', e.target.value)}
                              onBlur={() => !task.isNew && handleSaveTask(task)}
                              className={`w-28 bg-blue-900/10 text-blue-400 border border-transparent hover:border-blue-800/50 px-2 py-1.5 rounded-md text-xs font-black uppercase outline-none focus:border-blue-500 transition-colors ${task.isNew ? 'bg-zinc-950 border-zinc-700 text-white' : ''}`} />
                            <datalist id="tag-suggestions">{uniqueTags.map(tag => <option key={tag} value={tag} />)}</datalist>
                          </>
                        )}
                      </td>
                      <td className="p-4 flex gap-2">
                        {task.isNew && (
                          <button onClick={() => handleSaveTask(task)} className="p-2 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white rounded-lg transition-colors"><Save size={16} /></button>
                        )}
                        {!task.isAssignment && (
                          <button onClick={() => handleDeleteTask(task.id, task.isNew)} className="p-2 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors"><Trash2 size={16} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'calendar' && renderCalendar()}
      </div>
    </div>
  );
}
