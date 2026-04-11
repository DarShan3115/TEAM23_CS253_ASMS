import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Megaphone, BookOpen, UserCheck, BarChart2, ClipboardList,
  MessageSquare, Upload, Plus, Trash2, Save, CheckCircle, AlertCircle, FileText, Send
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const ACADEMIC = '/api/academic';
const PRODUCTIVITY = '/api/v1';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const inputClass = 'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all';
const labelClass = 'text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block';

const Feedback = ({ msg }) => {
  if (!msg?.text) return null;
  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${msg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
      {msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {msg.text}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tab: Announcements
// ---------------------------------------------------------------------------
function AnnouncementsTab({ courseId }) {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: '', body: '' });
  const [msg, setMsg] = useState({});

  useEffect(() => {
    api.get(`${ACADEMIC}/courses/${courseId}/announcements/`).then(r => setAnnouncements(r.data)).catch(() => {});
  }, [courseId]);

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`${ACADEMIC}/courses/${courseId}/announcements/`, form);
      setAnnouncements([res.data, ...announcements]);
      setForm({ title: '', body: '' });
      setMsg({ type: 'success', text: 'Announcement posted successfully.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to post announcement.' });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handlePost} className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2"><Plus size={18} className="text-yellow-500" /> Post New Announcement</h3>
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Midterm Rescheduled" />
        </div>
        <div>
          <label className={labelClass}>Message</label>
          <textarea className={inputClass} rows={3} required value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Write your announcement…" />
        </div>
        <Feedback msg={msg} />
        <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-6 py-2.5 rounded-xl transition-all">Post Announcement</button>
      </form>

      <div className="space-y-3">
        {announcements.length === 0 && <p className="text-zinc-500 text-center py-8">No announcements posted yet.</p>}
        {announcements.map(ann => (
          <div key={ann.id} className="border-l-4 border-yellow-500 bg-zinc-950 p-4 rounded-r-xl">
            <div className="flex justify-between items-start">
              <p className="text-white font-bold">{ann.title}</p>
              <span className="text-xs text-zinc-500">{ann.created_at ? new Date(ann.created_at).toLocaleDateString() : ''}</span>
            </div>
            <p className="text-zinc-400 text-sm mt-1">{ann.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Resources
// ---------------------------------------------------------------------------
function ResourcesTab({ courseId }) {
  const [resources, setResources] = useState({ lecture: [], other: [] });
  const [form, setForm] = useState({ title: '', resource_type: 'lecture', file_url: '' });
  const [msg, setMsg] = useState({});

  useEffect(() => {
    api.get(`${ACADEMIC}/courses/${courseId}/resources/`).then(r => {
      const all = r.data || [];
      setResources({ lecture: all.filter(x => x.resource_type === 'lecture'), other: all.filter(x => x.resource_type === 'other') });
    }).catch(() => {});
  }, [courseId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`${ACADEMIC}/courses/${courseId}/resources/`, form);
      const updated = { ...resources };
      updated[form.resource_type] = [...updated[form.resource_type], res.data];
      setResources(updated);
      setForm({ title: '', resource_type: 'lecture', file_url: '' });
      setMsg({ type: 'success', text: 'Resource added.' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to add resource.' });
    }
  };

  const handleDelete = async (id, type) => {
    try {
      await api.delete(`${ACADEMIC}/resources/${id}/`);
      setResources({ ...resources, [type]: resources[type].filter(r => r.id !== id) });
    } catch {}
  };

  const ResourceList = ({ items, type }) => (
    <div>
      <h3 className="text-white font-bold text-lg border-b border-zinc-800 pb-3 mb-4">
        {type === 'lecture' ? '📑 Lecture Notes' : '📎 Other Resources'}
      </h3>
      {items.length === 0 ? <p className="text-zinc-500 italic text-sm">No resources uploaded yet.</p> : (
        <ul className="space-y-2">
          {items.map(r => (
            <li key={r.id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl group">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-blue-400" />
                <a href={r.file_url || '#'} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 font-medium text-sm">{r.title}</a>
              </div>
              <button onClick={() => handleDelete(r.id, type)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2"><Upload size={18} className="text-blue-400" /> Add Resource</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Resource Title</label>
            <input className={inputClass} required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Lecture 4: Searching Algorithms" />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select className={inputClass} value={form.resource_type} onChange={e => setForm({ ...form, resource_type: e.target.value })}>
              <option value="lecture">Lecture Notes</option>
              <option value="other">Other Resource</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>File URL / Link</label>
          <input className={inputClass} value={form.file_url} onChange={e => setForm({ ...form, file_url: e.target.value })} placeholder="https://drive.google.com/..." />
        </div>
        <Feedback msg={msg} />
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2"><Save size={16} /> Save Resource</button>
      </form>
      <ResourceList items={resources.lecture} type="lecture" />
      <ResourceList items={resources.other} type="other" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Attendance
// ---------------------------------------------------------------------------
function AttendanceTab({ courseId }) {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [msg, setMsg] = useState({});

  useEffect(() => {
    api.get(`${ACADEMIC}/courses/${courseId}/students/`).then(r => {
      setStudents(r.data || []);
      const init = {};
      (r.data || []).forEach(s => { init[s.id] = 'present'; });
      setAttendance(init);
    }).catch(() => {});
  }, [courseId]);

  const handleMark = async () => {
    const payload = {
      course_id: courseId,
      date,
      students: Object.entries(attendance).map(([id, status]) => ({ id, status }))
    };
    try {
      await api.post(`${ACADEMIC}/attendance/mark/`, payload);
      setMsg({ type: 'success', text: `Attendance saved for ${date}` });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to save attendance.' });
    }
  };

  const statusColors = { present: 'bg-green-500', absent: 'bg-red-500', late: 'bg-yellow-500' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" className={inputClass + ' w-48'} value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <button onClick={handleMark} className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2">
          <UserCheck size={16} /> Save Attendance
        </button>
      </div>

      <Feedback msg={msg} />

      {students.length === 0 ? (
        <p className="text-zinc-500 text-center py-12 italic">No students enrolled yet.</p>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                <th className="p-4">Student</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-white">{s.first_name?.[0]}{s.last_name?.[0]}</div>
                      <span className="text-white font-medium">{s.first_name} {s.last_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-400 text-sm">{s.email}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {['present', 'absent', 'late'].map(status => (
                        <button key={status} onClick={() => setAttendance({ ...attendance, [s.id]: status })}
                          className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${attendance[s.id] === status ? statusColors[status] + ' text-white' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}>
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Marks / Grade Entry
// ---------------------------------------------------------------------------
function MarksTab({ courseId }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [grading, setGrading] = useState({});
  const [msg, setMsg] = useState({});
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', due_date: '', max_marks: 100, weightage: 10 });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    api.get(`${ACADEMIC}/courses/${courseId}/assignments/`).then(r => setAssignments(r.data || [])).catch(() => {});
  }, [courseId]);

  const loadSubmissions = async (assignmentId) => {
    setSelectedAssignment(assignmentId);
    try {
      const res = await api.get(`${PRODUCTIVITY}/assignments/${assignmentId}/submissions`);
      setSubmissions(res.data || []);
      const g = {};
      (res.data || []).forEach(s => { g[s.id] = { marks: s.marks || '', feedback: s.feedback || '' }; });
      setGrading(g);
    } catch { setSubmissions([]); }
  };

  const handleGrade = async (submissionId) => {
    try {
      await api.put(`${PRODUCTIVITY}/submissions/${submissionId}/grade`, grading[submissionId]);
      setMsg({ type: 'success', text: 'Grade saved!' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to save grade.' });
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`${ACADEMIC}/courses/${courseId}/assignments/`, newAssignment);
      setAssignments([...assignments, res.data]);
      setNewAssignment({ title: '', description: '', due_date: '', max_marks: 100, weightage: 10 });
      setShowCreateForm(false);
      setMsg({ type: 'success', text: 'Assessment created!' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to create assessment.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-bold text-lg">Assessments & Grading</h3>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-sm">
          <Plus size={16} /> Create Assessment
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateAssignment} className="bg-zinc-950 border border-blue-800/40 p-6 rounded-2xl space-y-4">
          <h4 className="text-blue-400 font-bold">New Assessment</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Assessment Title</label>
              <input className={inputClass} required value={newAssignment.title} onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })} placeholder="e.g. Midterm Exam" />
            </div>
            <div>
              <label className={labelClass}>Due Date</label>
              <input className={inputClass} type="datetime-local" value={newAssignment.due_date} onChange={e => setNewAssignment({ ...newAssignment, due_date: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Max Marks</label>
              <input className={inputClass} type="number" min="1" required value={newAssignment.max_marks} onChange={e => setNewAssignment({ ...newAssignment, max_marks: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Weightage (% of total grade)</label>
              <input className={inputClass} type="number" min="1" max="100" required value={newAssignment.weightage} onChange={e => setNewAssignment({ ...newAssignment, weightage: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea className={inputClass} rows={2} value={newAssignment.description} onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })} placeholder="Instructions for students…" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2 rounded-xl transition-all">Create</button>
            <button type="button" onClick={() => setShowCreateForm(false)} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-5 py-2 rounded-xl transition-all">Cancel</button>
          </div>
        </form>
      )}

      <Feedback msg={msg} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {assignments.map(a => (
          <button key={a.id} onClick={() => loadSubmissions(a.id)}
            className={`text-left p-4 rounded-xl border transition-all ${selectedAssignment === a.id ? 'bg-blue-600/15 border-blue-500/40 text-blue-400' : 'bg-zinc-950 border-zinc-800 text-white hover:border-zinc-600'}`}>
            <p className="font-bold text-sm">{a.title}</p>
            <p className="text-xs mt-1 opacity-60">Max: {a.max_marks} marks · Weight: {a.weightage}%</p>
          </button>
        ))}
      </div>

      {selectedAssignment && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                <th className="p-4">Student</th>
                <th className="p-4">Submitted</th>
                <th className="p-4 w-32">Marks</th>
                <th className="p-4">Feedback</th>
                <th className="p-4 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {submissions.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-8 text-zinc-500 italic">No submissions yet.</td></tr>
              ) : submissions.map(sub => (
                <tr key={sub.id} className="hover:bg-zinc-900/50">
                  <td className="p-4 font-medium text-white text-sm">{sub.student_id?.substring(0, 8)}…</td>
                  <td className="p-4 text-zinc-400 text-xs">{sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : '—'}</td>
                  <td className="p-4">
                    <input type="number" min="0" className="w-24 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-blue-500"
                      value={grading[sub.id]?.marks || ''} onChange={e => setGrading({ ...grading, [sub.id]: { ...grading[sub.id], marks: e.target.value } })} />
                  </td>
                  <td className="p-4">
                    <input type="text" placeholder="Feedback…" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-blue-500"
                      value={grading[sub.id]?.feedback || ''} onChange={e => setGrading({ ...grading, [sub.id]: { ...grading[sub.id], feedback: e.target.value } })} />
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleGrade(sub.id)} className="bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white border border-green-700/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"><Save size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Discussions
// ---------------------------------------------------------------------------
function DiscussionsTab({ courseId }) {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    api.get(`${PRODUCTIVITY}/discussions/${courseId}`).then(r => setPosts(r.data || [])).catch(() => {});
  }, [courseId]);

  const handlePost = async () => {
    if (!content.trim()) return;
    try {
      const res = await api.post(`${PRODUCTIVITY}/discussions`, { course_id: courseId, content, is_anonymous: false });
      // Faculty are never anonymous
      setPosts([{ ...res.data, author_name: `Professor ${user?.first_name} ${user?.last_name}` }, ...posts]);
      setContent('');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={2} placeholder="Reply to your students…"
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
        <button onClick={handlePost} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 rounded-xl transition-all flex items-center gap-2"><Send size={16} /></button>
      </div>

      <div className="space-y-4">
        {posts.map(p => (
          <div key={p.id} className={`p-4 rounded-xl border ${!p.is_anonymous ? 'bg-blue-900/10 border-blue-800/50' : 'bg-zinc-950 border-zinc-800'}`}>
            <p className={`font-bold text-sm mb-1 ${!p.is_anonymous ? 'text-blue-400' : 'text-zinc-300'}`}>{p.author_name || 'Student'}</p>
            <p className="text-zinc-300 text-sm">{p.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Faculty Course Board
// ---------------------------------------------------------------------------
export default function FacultyCourseBoard() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('announcements');
  const [course, setCourse] = useState(null);

  useEffect(() => {
    api.get(`${ACADEMIC}/courses/${courseId}/`).then(r => setCourse(r.data)).catch(() => setCourse({ code: '------', title: 'Course Workspace', credits: 0, instructor_name: 'You' }));
  }, [courseId]);

  const TABS = [
    { id: 'announcements', icon: Megaphone, label: 'Announcements' },
    { id: 'resources', icon: BookOpen, label: 'Resources' },
    { id: 'attendance', icon: UserCheck, label: 'Attendance' },
    { id: 'marks', icon: BarChart2, label: 'Marks & Assessments' },
    { id: 'discussions', icon: MessageSquare, label: 'Discussions' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-6">
        <button onClick={() => navigate('/faculty-hub')} className="p-2 border border-zinc-700 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-300"><ArrowLeft size={20} /></button>
        <div>
          <div className="flex items-center gap-3">
            <span className="text-blue-400 font-black text-xl tracking-widest bg-blue-900/30 px-3 py-1 rounded-md border border-blue-800/50">{course?.code || '——'}</span>
            <h1 className="text-3xl font-black text-white">{course?.title || 'Loading…'}</h1>
          </div>
          <p className="text-zinc-500 mt-1 font-medium">{course?.instructor_name} · {course?.credits} Credits</p>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Tab Nav */}
        <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
              <tab.icon size={18} />{tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 min-h-[520px]">
          {activeTab === 'announcements' && <AnnouncementsTab courseId={courseId} />}
          {activeTab === 'resources' && <ResourcesTab courseId={courseId} />}
          {activeTab === 'attendance' && <AttendanceTab courseId={courseId} />}
          {activeTab === 'marks' && <MarksTab courseId={courseId} />}
          {activeTab === 'discussions' && <DiscussionsTab courseId={courseId} />}
        </div>
      </div>
    </div>
  );
}
