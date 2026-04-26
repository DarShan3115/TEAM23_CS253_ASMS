import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Megaphone, BookOpen, UserCheck, BarChart2, ClipboardList,
  MessageSquare, Upload, Plus, Trash2, Save, CheckCircle, AlertCircle, FileText, Send, Copy, Check, KeyRound, Clock, Calendar, Info, X
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const ACADEMIC = import.meta.env.VITE_ACADEMIC_API_URL || '/api/academic';
const PRODUCTIVITY = import.meta.env.VITE_PRODUCTIVITY_API_URL || '/api/productivity/v1';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const inputClass = 'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm';
const labelClass = 'text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block';

const Feedback = ({ msg }) => {
  if (!msg?.text) return null;
  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold ${msg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
      {msg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
      {msg.text}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tab: Course Info & Timings
// ---------------------------------------------------------------------------
function InfoTab({ course }) {
  const [schedules, setSchedules] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [newSchedule, setNewSchedule] = useState({ day: 'Monday', start_time: '09:00', end_time: '10:00', type: 'Lec' });
  const [scheduleMsg, setScheduleMsg] = useState({});
  const navigate = useNavigate();

  const fetchSchedules = async () => {
    try {
      const res = await api.get(`${ACADEMIC}/courses/${course.id}/schedule/`);
      setSchedules(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  useEffect(() => {
    if (course?.id) fetchSchedules();
  }, [course?.id]);

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post(`${ACADEMIC}/courses/${course.id}/schedule/`, {
        day: newSchedule.day,
        start_time: newSchedule.start_time,
        end_time: newSchedule.end_time,
        class_type: newSchedule.type
      });
      setScheduleMsg({ type: 'success', text: 'Schedule added' });
      setNewSchedule({ day: 'Monday', start_time: '09:00', end_time: '10:00', type: 'Lec' });
      fetchSchedules();
    } catch {
      setScheduleMsg({ type: 'error', text: 'Failed to add schedule' });
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await api.delete(`${ACADEMIC}/courses/${course.id}/schedule/`, { params: { schedule_id: id } });
      fetchSchedules();
    } catch {}
  };

  const formatTime = (t) => t?.substring(0, 5) || '—';

  const handleBulkInvite = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const emails = text.split(/\r?\n/).map(l => l.trim()).filter(l => l && l.includes('@'));
      if (!emails.length) {
        setScheduleMsg({ type: 'error', text: 'No valid emails found.' });
        return;
      }
      try {
        setScheduleMsg({ type: 'success', text: `Dispatching to ${emails.length} addresses. Wait...` });
        const res = await api.post(`${ACADEMIC}/courses/${course.id}/invite/`, { emails });
        setScheduleMsg({ type: 'success', text: res.data.message });
      } catch (err) {
        setScheduleMsg({ type: 'error', text: err.response?.data?.error || 'Email dispatch failed.' });
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteCourse = async () => {
    if (deleteInput !== course.code) return;
    try {
      await api.delete(`${ACADEMIC}/courses/${course.id}/`);
      navigate('/faculty-hub');
    } catch {
      setScheduleMsg({ type: 'error', text: 'Deactivation failed' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timings Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2"><Clock size={14} className="text-blue-400"/> Class & Lab Timings</h3>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/50 text-zinc-500 font-black uppercase tracking-widest border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Day</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {schedules.map(s => (
                  <tr key={s.id} className="text-zinc-300 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3 font-bold">{s.day}</td>
                    <td className="px-4 py-3">{formatTime(s.start_time)} - {formatTime(s.end_time)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${s.type === 'Lab' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        {s.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDeleteSchedule(s.id)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
                {!schedules.length && <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-600 italic">No schedules defined</td></tr>}
              </tbody>
            </table>
          </div>
          <form onSubmit={handleAddSchedule} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
            <div>
              <label className={labelClass}>Day</label>
              <select className={inputClass} value={newSchedule.day} onChange={e => setNewSchedule({...newSchedule, day: e.target.value})}>
                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Start</label>
              <input type="time" className={inputClass} value={newSchedule.start_time} onChange={e => setNewSchedule({...newSchedule, start_time: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>End</label>
              <input type="time" className={inputClass} value={newSchedule.end_time} onChange={e => setNewSchedule({...newSchedule, end_time: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select className={inputClass} value={newSchedule.type} onChange={e => setNewSchedule({...newSchedule, type: e.target.value})}>
                <option value="Lec">Lecture</option>
                <option value="Lab">Lab</option>
                <option value="Tut">Tutorial</option>
              </select>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white h-10 rounded-lg flex items-center justify-center gap-2 font-bold text-xs"><Plus size={14}/> Add</button>
          </form>
          <Feedback msg={scheduleMsg} />
        </div>

        {/* Info & Settings Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2"><Info size={14} className="text-zinc-400"/> Course Description</h3>
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-400 text-sm leading-relaxed italic">
              {course?.description || 'No description provided.'}
            </div>
          </div>

          <div className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-2xl w-full">
            <h3 className="text-white font-bold mb-1 flex items-center gap-2"><Send size={16} className="text-blue-400"/> Mass Email Invitation (.CSV/.TXT)</h3>
            <p className="text-xs text-blue-400/80 mb-4">Upload a file with one email address per line to automatically dispatch the secure 16-character enrollment key.</p>
            <label className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-colors inline-block text-sm">
              Choose File & Dispatch
              <input type="file" accept=".csv,.txt" className="hidden" onChange={handleBulkInvite} />
            </label>
          </div>

          <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-4">
            <h3 className="text-red-400 font-black text-xs uppercase tracking-widest flex items-center gap-2"><Trash2 size={14}/> Danger Zone</h3>
            <p className="text-xs text-zinc-500">Deactivating the course will remove it from student listings and stop all further activities. This action is reversible by admins.</p>
            
            {!showDeleteConfirm ? (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-black transition-all"
              >
                DEACTIVATE COURSE
              </button>
            ) : (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-[10px] text-red-400 font-bold">Type <span className="underline">{course.code}</span> to confirm:</p>
                <div className="flex gap-2">
                  <input 
                    className={inputClass + ' border-red-500/40 focus:ring-red-500/20'} 
                    placeholder={course.code}
                    value={deleteInput}
                    onChange={e => setDeleteInput(e.target.value)}
                  />
                  <button 
                    onClick={handleDeleteCourse}
                    disabled={deleteInput !== course.code}
                    className="px-6 bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white font-black text-xs rounded-xl"
                  >
                    CONFIRM
                  </button>
                  <button onClick={() => {setShowDeleteConfirm(false); setDeleteInput('')}} className="p-2.5 bg-zinc-800 rounded-xl text-zinc-400"><X size={16}/></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
// Tab: Resources — Faculty Material Upload
// ---------------------------------------------------------------------------
const FILE_TYPE_STYLES = {
  pdf:  { label: 'PDF',  color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20'  },
  doc:  { label: 'DOC',  color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  docx: { label: 'DOCX', color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  ppt:  { label: 'PPT',  color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  pptx: { label: 'PPTX', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  xls:  { label: 'XLS',  color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
  xlsx: { label: 'XLSX', color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
  png:  { label: 'IMG',  color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  jpg:  { label: 'IMG',  color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  jpeg: { label: 'IMG',  color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  zip:  { label: 'ZIP',  color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
};
const getFileStyle = (filename = '') => {
  const ext = filename.split('.').pop().toLowerCase();
  return FILE_TYPE_STYLES[ext] || { label: ext.toUpperCase(), color: 'text-zinc-400', bg: 'bg-zinc-800', border: 'border-zinc-700' };
};
const fmtSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function ResourcesTab({ courseId }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [resourceType, setResourceType] = useState('lecture');
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = React.useRef();

  const fetchResources = async () => {
    try {
      const res = await api.get(`${ACADEMIC}/courses/${courseId}/resources/`);
      setResources(Array.isArray(res.data) ? res.data : []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchResources(); }, [courseId]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) setUploadFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    setMsg({});
    const fd = new FormData();
    fd.append('file', uploadFile);
    fd.append('title', uploadTitle || uploadFile.name.replace(/\.[^.]+$/, ''));
    fd.append('resource_type', resourceType);
    try {
      const res = await api.post(`${ACADEMIC}/courses/${courseId}/resources/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResources(prev => [res.data, ...prev]);
      setUploadFile(null);
      setUploadTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setMsg({ type: 'success', text: `"${res.data.title}" uploaded successfully.` });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Upload failed. Check file type and size (max 10MB).' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`${ACADEMIC}/resources/${id}/`);
      setResources(prev => prev.filter(r => r.id !== id));
    } catch {
      setMsg({ type: 'error', text: 'Failed to delete resource.' });
    }
  };

  const lectures = resources.filter(r => r.resource_type === 'lecture');
  const others   = resources.filter(r => r.resource_type !== 'lecture');

  const ResourceRow = ({ r }) => {
    const style = getFileStyle(r.file_name || r.title);
    return (
      <div className="flex items-center gap-4 p-3.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl group transition-all">
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black border ${style.bg} ${style.color} ${style.border}`}>
          {style.label}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{r.title}</p>
          {r.file_size && <p className="text-[10px] text-zinc-600 mt-0.5">{fmtSize(r.file_size)}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {r.file_url && (
            <a href={r.file_url} target="_blank" rel="noopener noreferrer"
              className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
              title="Open / Download">
              <FileText size={14} />
            </a>
          )}
          <button onClick={() => handleDelete(r.id)}
            className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Upload Panel */}
      <form onSubmit={handleUpload} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <Upload size={18} className="text-blue-400" /> Upload Course Material
        </h3>
        <p className="text-xs text-zinc-500">Allowed: PDF, Office docs (DOCX, PPTX, XLSX), Images, ZIP · No video files · Max 10MB</p>

        {/* Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver ? 'border-blue-500 bg-blue-500/5' : uploadFile ? 'border-green-500/60 bg-green-500/5' : 'border-zinc-700 hover:border-zinc-600'
          }`}
        >
          <Upload size={28} className={`mx-auto mb-2 ${uploadFile ? 'text-green-400' : 'text-zinc-600'}`} />
          {uploadFile ? (
            <div>
              <p className="text-sm font-bold text-green-400">{uploadFile.name}</p>
              <p className="text-xs text-zinc-500 mt-1">{fmtSize(uploadFile.size)} · Click to change</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-zinc-400">Drag & drop a file here or click to browse</p>
              <p className="text-xs text-zinc-600 mt-1">PDF, PPTX, DOCX, XLSX, images, ZIP</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.csv,.jpg,.jpeg,.png,.gif,.svg,.html,.zip"
            onChange={e => setUploadFile(e.target.files[0])}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Resource Title (optional)</label>
            <input className={inputClass} value={uploadTitle} onChange={e => setUploadTitle(e.target.value)}
              placeholder={uploadFile ? uploadFile.name.replace(/\.[^.]+$/, '') : 'e.g. Week 4 — Sorting Algorithms'} />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select className={inputClass} value={resourceType} onChange={e => setResourceType(e.target.value)}>
              <option value="lecture">📑 Lecture Notes / Slides</option>
              <option value="other">📎 Other Resource</option>
            </select>
          </div>
        </div>

        <Feedback msg={msg} />
        <button type="submit" disabled={!uploadFile || uploading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2">
          {uploading ? <><span className="animate-spin">↻</span> Uploading…</> : <><Upload size={16} /> Upload File</>}
        </button>
      </form>

      {/* Material Lists */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-zinc-900 animate-pulse rounded-xl border border-zinc-800" />)}</div>
      ) : (
        <>
          {/* Lecture Notes */}
          <div className="space-y-3">
            <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
              📑 Lecture Notes & Slides <span className="text-zinc-600 font-medium normal-case">({lectures.length})</span>
            </h3>
            {lectures.length === 0
              ? <p className="text-sm text-zinc-600 italic py-4 text-center border-2 border-dashed border-zinc-800 rounded-xl">No lecture materials uploaded yet.</p>
              : <div className="space-y-2">{lectures.map(r => <ResourceRow key={r.id} r={r} />)}</div>
            }
          </div>

          {/* Other Resources */}
          {others.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                📎 Other Resources <span className="text-zinc-600 font-medium normal-case">({others.length})</span>
              </h3>
              <div className="space-y-2">{others.map(r => <ResourceRow key={r.id} r={r} />)}</div>
            </div>
          )}
        </>
      )}
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

  const handleBiometricUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result.toLowerCase();
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      
      const newAttendance = {};
      students.forEach(s => {
        const emailMatch = lines.includes(s.email.toLowerCase());
        const nameMatch = lines.includes(s.first_name.toLowerCase()) || lines.includes((s.first_name + ' ' + s.last_name).toLowerCase());
        newAttendance[s.id] = (emailMatch || nameMatch) ? 'present' : 'absent';
      });
      setAttendance(newAttendance);
      setMsg({ type: 'success', text: `Biometric log loaded. Marked ${Object.values(newAttendance).filter(v => v === 'present').length} present. Review and Save.` });
    };
    reader.readAsText(file);
  };

  const statusColors = { present: 'bg-green-500', absent: 'bg-red-500', late: 'bg-yellow-500' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <UserCheck className="text-blue-500" /> <h3 className="text-white font-bold tracking-wide text-sm">Attendance Control</h3>
          </div>
          <div className="flex flex-wrap items-end gap-5 justify-between">
            <div>
              <label className={labelClass}>Date Record</label>
              <input type="date" className={inputClass + ' w-48'} value={date} onChange={e => setDate(e.target.value)} />
            </div>
            
            <div className="flex flex-col gap-1 items-start bg-zinc-950 p-2 rounded-xl border border-zinc-800 flex-1 max-w-sm">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black px-2">Advance Biometric Log (.txt/.csv)</label>
              <input type="file" accept=".txt,.log,.csv" onChange={handleBiometricUpload} className="w-full text-xs text-zinc-400 file:bg-zinc-800 file:text-zinc-300 file:border-0 file:rounded-lg file:px-3 file:py-1.5 cursor-pointer outline-none" />
            </div>

            <button onClick={handleMark} className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0">
               Save Attendance
            </button>
          </div>
        </div>
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
  const [uploadFile, setUploadFile] = useState(null);
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
    const formData = new FormData();
    formData.append('title', newAssignment.title);
    formData.append('description', newAssignment.description);
    formData.append('due_date', newAssignment.due_date);
    formData.append('max_marks', newAssignment.max_marks);
    formData.append('weightage', newAssignment.weightage);
    if (newAssignment.storage_url) formData.append('storage_url', newAssignment.storage_url);
    if (uploadFile) formData.append('file', uploadFile);

    try {
      const res = await api.post(`${ACADEMIC}/courses/${courseId}/assignments/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAssignments([...assignments, res.data]);
      setNewAssignment({ title: '', description: '', due_date: '', max_marks: 100, weightage: 10, storage_url: '' });
      setUploadFile(null);
      setShowCreateForm(false);
      setMsg({ type: 'success', text: 'Assessment created!' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to create assessment.' });
    }
  };

  const handleBulkFinalGrades = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      const grades = [];
      lines.forEach((line, idx) => {
        if(idx === 0 && line.toLowerCase().includes('email')) return; // skip header
        const parts = line.split(',');
        if (parts.length >= 2) {
            grades.push({ email: parts[0], grade: parts[1] });
        }
      });
      if (grades.length === 0) {
        setMsg({ type: 'error', text: 'No valid grades found in CSV.' });
        return;
      }
      try {
        setMsg({ type: 'success', text: `Syncing ${grades.length} grades...` });
        const res = await api.post(`${ACADEMIC}/courses/${courseId}/grades/csv/`, { grades });
        setMsg({ type: 'success', text: res.data.message });
      } catch (err) {
         setMsg({ type: 'error', text: err.response?.data?.error || 'Grade sync failed.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-green-900/10 border border-green-500/20 p-5 rounded-2xl w-full mb-6 relative overflow-hidden">
        <h3 className="text-white font-bold mb-1 flex items-center gap-2"><Award size={16} className="text-green-400"/> Official Final Course Grades (.CSV)</h3>
        <p className="text-xs text-green-400/80 mb-4">Upload a CSV file containing <code>email,grade</code> (e.g. <code>student@iitk.ac.in,A</code>) to seamlessly post official transcript grades into the DB for CPI/SPI calculations.</p>
        <label className="bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-colors inline-block text-sm">
          Upload Final Grades CSV
          <input type="file" accept=".csv" className="hidden" onChange={handleBulkFinalGrades} />
        </label>
      </div>

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
            <label className={labelClass}>Instruction File (PDF/Docs)</label>
            <input 
              type="file" 
              onChange={e => setUploadFile(e.target.files[0])}
              className="w-full text-zinc-500 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 cursor-pointer"
            />
          </div>
          <div>
            <label className={labelClass}>Server Location for Student Submissions (Optional)</label>
            <input className={inputClass} type="url" value={newAssignment.storage_url || ''} onChange={e => setNewAssignment({ ...newAssignment, storage_url: e.target.value })} placeholder="e.g. https://your-server.com/upload" />
          </div>
          <div>
            <label className={labelClass}>Description / Instructions</label>
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
            <div className="flex gap-2 items-center mt-1">
               <p className="text-[10px] opacity-60">Max: {a.max_marks} marks · Weight: {a.weightage}%</p>
               {a.file_url && <FileText size={12} className="text-zinc-500" />}
            </div>
          </button>
        ))}
      </div>

      {selectedAssignment && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
            <p className="text-sm font-bold text-white">
              Submissions — <span className="text-blue-400">{assignments.find(a => a.id === selectedAssignment)?.title}</span>
            </p>
            <span className="text-xs text-zinc-500">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                <th className="p-4">Student</th>
                <th className="p-4">Submission</th>
                <th className="p-4">Date</th>
                <th className="p-4 w-32">Marks</th>
                <th className="p-4">Feedback</th>
                <th className="p-4 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {submissions.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-8 text-zinc-500 italic">No submissions yet.</td></tr>
              ) : submissions.map(sub => (
                <tr key={sub.id} className="hover:bg-zinc-900/50">
                  <td className="p-4">
                    <p className="font-bold text-white text-sm">{sub.student_name || 'Student'}</p>
                    <p className="text-[10px] text-zinc-600 font-mono">{String(sub.student_id || '').substring(0, 8)}…</p>
                  </td>
                  <td className="p-4 max-w-[180px]">
                    {sub.content
                      ? <p className="text-xs text-zinc-400 truncate" title={sub.content}>{sub.content}</p>
                      : <span className="text-[10px] text-zinc-600 italic">File only</span>
                    }
                    {sub.file_url && (
                      <a href={sub.file_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 mt-1">
                        <FileText size={10} /> View file
                      </a>
                    )}
                  </td>
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
    api.get(`${PRODUCTIVITY}/discussions/${courseId}`)
      .then(r => {
        const data = r.data;
        setPosts(Array.isArray(data) ? data : (data?.results || data?.posts || data?.data || []));
      })
      .catch(() => setPosts([]));
  }, [courseId]);

  const handlePost = async () => {
    if (!content.trim()) return;
    try {
      const res = await api.post(`${PRODUCTIVITY}/discussions`, { course_id: courseId, content, is_anonymous: false });
      setPosts(prev => [{ ...res.data, author_name: `Professor ${user?.first_name} ${user?.last_name}` }, ...(Array.isArray(prev) ? prev : [])]);
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
// Tab: Exams & Quizzes
// ---------------------------------------------------------------------------
function ExamsTab({ courseId }) {
  const [exams, setExams] = useState([]);
  const [examForm, setExamForm] = useState({ exam_type: 'quiz', exam_date: '', start_time: '', duration_minutes: 30, venue: '', weightage: 5 });
  const [msg, setMsg] = useState({});

  useEffect(() => {
    api.get(`${ACADEMIC}/courses/${courseId}/exams/`).then(r => setExams(r.data)).catch(() => {});
  }, [courseId]);

  const handleScheduleExam = async (e) => {
    e.preventDefault();
    try {
      await api.post(`${ACADEMIC}/courses/${courseId}/exams/`, examForm);
      setMsg({ type: 'success', text: 'Quiz scheduled successfully!' });
      api.get(`${ACADEMIC}/courses/${courseId}/exams/`).then(r => setExams(r.data));
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to schedule quiz.' });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleScheduleExam} className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2"><Clock size={18} className="text-blue-500" /> Schedule Quiz</h3>
        <p className="text-xs text-zinc-500">Note: Mid & End Semester exams are scheduled heavily by Admins.</p>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Date</label><input required type="date" className={inputClass} value={examForm.exam_date} onChange={e=>setExamForm({...examForm, exam_date: e.target.value})} /></div>
          <div><label className={labelClass}>Start Time</label><input required type="time" className={inputClass} value={examForm.start_time} onChange={e=>setExamForm({...examForm, start_time: e.target.value})} /></div>
          <div><label className={labelClass}>Duration (mins)</label><input required type="number" className={inputClass} value={examForm.duration_minutes} onChange={e=>setExamForm({...examForm, duration_minutes: e.target.value})} /></div>
          <div><label className={labelClass}>Weightage (%)</label><input required type="number" className={inputClass} value={examForm.weightage} onChange={e=>setExamForm({...examForm, weightage: e.target.value})} /></div>
          <div className="col-span-2"><label className={labelClass}>Venue (Optional)</label><input className={inputClass} value={examForm.venue} placeholder="e.g. Online / L1" onChange={e=>setExamForm({...examForm, venue: e.target.value})} /></div>
        </div>
        <Feedback msg={msg} />
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-2.5 rounded-xl transition-all">Schedule Quiz</button>
      </form>

      <div className="space-y-3">
        <h3 className="text-white font-bold mt-8 mb-2">Current Schedule</h3>
        {exams.length === 0 && <p className="text-zinc-500 text-sm">No exams or quizzes scheduled.</p>}
        {exams.map(e => (
          <div key={e.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-white font-bold tracking-wide capitalize">{e.exam_type.replace('_', ' ')}</p>
              <p className="text-zinc-400 text-xs mt-1">{e.exam_date} at {e.start_time} · {e.duration_minutes} mins</p>
            </div>
            <div className="text-right">
              <span className="block text-blue-400 font-black text-sm">{e.weightage}%</span>
              <span className="text-zinc-600 text-[10px] uppercase">Weightage</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FacultyCourseBoard() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('announcements');
  const [course, setCourse] = useState(null);
  const [keyCopied, setKeyCopied] = useState(false);

  const fetchCourse = () => {
    api.get(`${ACADEMIC}/courses/${courseId}/`).then(r => setCourse(r.data)).catch(() => setCourse({ code: '------', title: 'Course Workspace', credits: 0, instructor_name: 'You' }));
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const copyKey = () => {
    if (!course?.enrollment_key) return;
    navigator.clipboard.writeText(course.enrollment_key);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const TABS = [
    { id: 'info', icon: Info, label: 'Course Info' },
    { id: 'announcements', icon: Megaphone, label: 'Announcements' },
    { id: 'resources', icon: BookOpen, label: 'Resources' },
    { id: 'attendance', icon: UserCheck, label: 'Attendance' },
    { id: 'exams', icon: Clock, label: 'Exams & Quizzes' },
    { id: 'marks', icon: BarChart2, label: 'Marks & Assessments' },
    { id: 'discussions', icon: MessageSquare, label: 'Discussions' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 space-y-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/faculty-hub')} className="p-2 border border-zinc-700 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-300 transition-colors"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-blue-400 font-black text-xl tracking-widest bg-blue-900/30 px-3 py-1 rounded-md border border-blue-800/50">{course?.code || '——'}</span>
              <h1 className="text-3xl font-black text-white">{course?.title || 'Loading…'}</h1>
            </div>
            <p className="text-zinc-500 mt-1 font-medium">{course?.instructor_name} · {course?.credits} Credits</p>
          </div>
          
          {course?.enrollment_key && (
            <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 shrink-0">
               <KeyRound size={14} className="text-amber-400 shrink-0" />
               <code className="text-amber-400 font-mono font-bold tracking-widest text-sm">{course.enrollment_key}</code>
               <button onClick={copyKey} className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${keyCopied ? 'bg-green-600/20 text-green-400' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
                 {keyCopied ? <><Check size={12}/> Copied</> : <><Copy size={12}/> Copy</>}
               </button>
            </div>
          )}
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
          {activeTab === 'info' && <InfoTab course={course} onRefresh={fetchCourse} />}
          {activeTab === 'announcements' && <AnnouncementsTab courseId={courseId} />}
          {activeTab === 'resources' && <ResourcesTab courseId={courseId} />}
          {activeTab === 'attendance' && <AttendanceTab courseId={courseId} />}
          {activeTab === 'exams' && <ExamsTab courseId={courseId} />}
          {activeTab === 'marks' && <MarksTab courseId={courseId} />}
          {activeTab === 'discussions' && <DiscussionsTab courseId={courseId} />}
        </div>
      </div>
    </div>
  );
}
