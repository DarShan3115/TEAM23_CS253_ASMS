import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Megaphone, BookOpen, MessageSquare, ClipboardList,
  CalendarCheck, FileText, Clock, ExternalLink, ArrowRight,
  Upload, Send, Lock, Users, BadgeCheck, CheckCircle2, XCircle, MinusCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const ACADEMIC_API = import.meta.env.VITE_ACADEMIC_API_URL || '/api/academic';
const PRODUCTIVITY_API = import.meta.env.VITE_PRODUCTIVITY_API_URL || '/api/productivity/v1';

export default function CourseDetailBoard() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [courseData, setCourseData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [resources, setResources] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [exams, setExams] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();
  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  // Resource upload state (faculty only)
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  // Discussion state
  const [newPost, setNewPost] = useState('');
  const [isAnon, setIsAnon] = useState(true);
  const [postLoading, setPostLoading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  // Assignment detail / submission state
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [subFiles, setSubFiles] = useState([]);
  const [subNote, setSubNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null); // existing submission record
  const subFileRef = React.useRef();

  useEffect(() => {
    fetchCourseInfo();
    fetchSecondaryData();
  }, [courseId]);

  const fetchCourseInfo = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${ACADEMIC_API}/courses/${courseId}/`);
      setCourseData(res.data);
    } catch { /* handled below */ }
    finally { setLoading(false); }
  };

  const fetchSecondaryData = async () => {
    try {
      const [assignRes, annRes, resRes, attRes, discRes, examsRes] = await Promise.allSettled([
        api.get(`${ACADEMIC_API}/courses/${courseId}/assignments/`),
        api.get(`${ACADEMIC_API}/courses/${courseId}/announcements/`),
        api.get(`${ACADEMIC_API}/courses/${courseId}/resources/`),
        api.get(`${ACADEMIC_API}/courses/${courseId}/attendance/`),
        api.get(`${PRODUCTIVITY_API}/discussions/${courseId}`),
        api.get(`${ACADEMIC_API}/courses/${courseId}/exams/`),
      ]);
      if (assignRes.status === 'fulfilled') setAssignments(assignRes.value.data || []);
      if (annRes.status === 'fulfilled') setAnnouncements(annRes.value.data || []);
      if (resRes.status === 'fulfilled') setResources(resRes.value.data || []);
      if (attRes.status === 'fulfilled') setAttendance(attRes.value.data || []);
      if (examsRes.status === 'fulfilled') setExams(examsRes.value.data || []);
      if (discRes.status === 'fulfilled') {
        const dData = discRes.value.data;
        setPosts(Array.isArray(dData) ? dData : []);
      }
    } catch (err) {
      console.warn('Could not fetch some course components', err);
    }
  };

  const handleResourceUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('title', uploadTitle || uploadFile.name);
    formData.append('resource_type', uploadFile.name.split('.').pop() || 'file');
    formData.append('file', uploadFile);
    try {
      const res = await api.post(`${ACADEMIC_API}/courses/${courseId}/resources/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResources(prev => [res.data, ...prev]);
      setUploadFile(null);
      setUploadTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const openAssignment = async (ass) => {
    setSelectedAssignment(ass);
    setSubFiles([]);
    setSubNote('');
    setSubmitted(false);
    setSubmissionStatus(null);
    if (!isFaculty) {
      try {
        const res = await api.get(`${ACADEMIC_API}/courses/${courseId}/assignments/${ass.id}/my-submission/`);
        if (res.data.submitted) {
          setSubmissionStatus(res.data);
          setSubmitted(true);
        }
      } catch { } // 404 = not submitted yet
    }
  };

  const handlePost = async (parentId = null) => {
    const text = parentId ? (replyTo?.content || '') : newPost;
    if (!text.trim()) return;
    setPostLoading(true);
    try {
      await api.post(`${PRODUCTIVITY_API}/discussions`, {
        course_id: courseId,
        content: text,
        is_anonymous: isFaculty ? false : isAnon,
        parent_id: parentId,
      });
      setNewPost('');
      setReplyTo(null);
      const res = await api.get(`${PRODUCTIVITY_API}/discussions/${courseId}`);
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Post failed', err);
    } finally {
      setPostLoading(false);
    }
  };

if (loading) return <div className="p-10 text-white font-bold text-xl animate-pulse">Synchronizing Workspace...</div>;
if (!courseData) return <div className="p-10 text-red-400">Course not found.</div>;

const totalClasses = attendance.length;
const presentCount = attendance.filter(a => a.status === 'present').length;
const attendancePct = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

const TABS = [
  { id: 'info', icon: BookOpen, label: 'Course Info' },
  { id: 'assignments', icon: ClipboardList, label: 'Assignments' },
  { id: 'announcements', icon: Megaphone, label: 'Announcements' },
  { id: 'resources', icon: FileText, label: 'Resources' },
  { id: 'attendance', icon: CalendarCheck, label: 'Attendance' },
  { id: 'exams', icon: Clock, label: 'Exam Schedule' },
  { id: 'discussions', icon: MessageSquare, label: 'Discussions' },
];

// ── Assignment submission panel ────────────────────────────────────────────
const renderSubmissionPanel = (ass) => {
  const isOverdue = ass.due_date && new Date(ass.due_date) < new Date();

  if (submissionStatus && submitted) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 size={36} className="text-green-400 mb-2" />
          <p className="text-white font-bold">Already Submitted</p>
          <p className="text-zinc-500 text-xs mt-1">Submitted on {new Date(submissionStatus.submitted_at).toLocaleDateString()}</p>
        </div>
        {submissionStatus.marks !== null && submissionStatus.marks !== undefined && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Result</p>
            <p className="text-2xl font-black text-white">{submissionStatus.marks} marks</p>
            {submissionStatus.feedback && <p className="text-sm text-zinc-400 italic">{submissionStatus.feedback}</p>}
          </div>
        )}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle2 size={36} className="text-green-400 mb-2" />
        <p className="text-white font-bold">Submitted!</p>
        <p className="text-zinc-500 text-xs mt-1">Your work has been received.</p>
      </div>
    );
  }

  if (isOverdue && !isFaculty) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-red-500/30 rounded-xl bg-red-500/5">
        <XCircle size={36} className="text-red-400 mb-2" />
        <p className="text-red-400 font-bold text-sm">Submissions Closed</p>
        <p className="text-zinc-500 text-xs mt-1">The deadline for this assignment has passed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => subFileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); setSubFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); }}
        className="border-2 border-dashed border-zinc-700 hover:border-blue-500/60 rounded-xl p-5 text-center cursor-pointer transition-colors"
      >
        <Upload size={20} className="text-zinc-600 mx-auto mb-1" />
        <p className="text-xs font-bold text-zinc-400">Drop files or click to browse</p>
        <p className="text-[10px] text-zinc-600 mt-0.5">PDF, ZIP, JPG · Multiple files</p>
        <input ref={subFileRef} type="file" multiple accept=".pdf,.zip,.jpg,.jpeg,.png" className="hidden"
          onChange={e => setSubFiles(prev => [...prev, ...Array.from(e.target.files)])}
        />
      </div>
      {/* File list */}
      {subFiles.map((f, i) => (
        <div key={i} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
          <span className="text-xs text-white truncate">{f.name}</span>
          <button onClick={() => setSubFiles(p => p.filter((_, j) => j !== i))} className="text-zinc-600 hover:text-red-400 ml-2">
            <XCircle size={14} />
          </button>
        </div>
      ))}
      <textarea
        value={subNote}
        onChange={e => setSubNote(e.target.value)}
        placeholder="Add a note or link (optional)..."
        rows={2}
        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500/60 resize-none placeholder-zinc-600"
      />
      <button
        disabled={submitting || (subFiles.length === 0 && !subNote.trim())}
        onClick={async () => {
          setSubmitting(true);
          try {
            const fd = new FormData();
            subFiles.forEach(f => fd.append('files', f));
            fd.append('content', subNote);
            
            if (ass.storage_url) {
              // Route actual files to external remote storage server requested by professor
              try {
                await fetch(ass.storage_url, {
                  method: 'POST',
                  body: fd,
                  mode: 'no-cors' // bypass strict CORS block for one-way external uploads
                });
              } catch (err) {
                console.error("External upload trace: ", err);
              }
              // Register local completion trace without duplicate file storage
              const traceFd = new FormData();
              traceFd.append('content', subNote + `\n\n[System Info] Files automatically routed to external storage target: ${ass.storage_url}`);
              await api.post(`${ACADEMIC_API}/courses/${courseId}/assignments/${ass.id}/submit/`, traceFd);
            } else {
              // Default local persistence
              await api.post(
                `${ACADEMIC_API}/courses/${courseId}/assignments/${ass.id}/submit/`,
                fd,
                { headers: { 'Content-Type': 'multipart/form-data' } }
              );
            }
            setSubmitted(true);
          } catch (err) { console.error(err); }
          finally { setSubmitting(false); }
        }}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Send size={14} /> {submitting ? 'Submitting...' : 'Submit Assignment'}
      </button>
    </div>
  );
};

return (
  <div className="space-y-6">
    {/* ── Header ── */}
    <div className="flex items-center gap-4 border-b border-zinc-800 pb-6">
      <button onClick={() => navigate('/courses')} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors">
        <ArrowLeft size={18} />
      </button>
      <div>
        <div className="flex items-center gap-3">
          <span className="text-blue-400 font-bold text-xs bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20 uppercase tracking-wider">
            {courseData.code}
          </span>
          <h1 className="text-2xl font-semibold text-white">{courseData.title}</h1>
        </div>
        <p className="text-zinc-500 mt-1 text-sm font-medium">
          {courseData.instructor_name || 'Department Faculty'} · {courseData.credits} Credits
        </p>
      </div>
    </div>

    <div className="flex flex-col md:flex-row gap-8 items-start min-h-[500px]">
      {/* ── Sidebar Nav ── */}
      <div className="w-full md:w-56 flex flex-col gap-1 shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedAssignment(null); }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Dynamic Content Area ── */}
      <div className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 overflow-y-auto">

        {/* ── Course Info ── */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Course Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <p className="text-zinc-500 text-[10px] font-bold uppercase mb-1.5">Instructor</p>
                <p className="text-white text-sm font-medium">{courseData.instructor_name || 'N/A'}</p>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <p className="text-zinc-500 text-[10px] font-bold uppercase mb-1.5">Credits / Max Size</p>
                <p className="text-white text-sm font-medium">{courseData.credits} CR · {courseData.max_enrollment || 60} Students</p>
              </div>
            </div>
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 italic text-zinc-400 text-sm leading-relaxed">
              {courseData.description || 'No course description provided by the instructor.'}
            </div>
          </div>
        )}

        {/* ── Assignments ── */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            {selectedAssignment ? (
              /* ── Assignment Detail View ── */
              <div className="space-y-5">
                <button
                  onClick={() => { setSelectedAssignment(null); setSubFiles([]); setSubNote(''); setSubmitted(false); setSubmissionStatus(null); }}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-medium transition-colors"
                >
                  <ArrowLeft size={16} /> Back to Assignments
                </button>

                {/* Title + meta */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded uppercase">Assignment</span>
                    {selectedAssignment.due_date && (() => {
                      const d = Math.ceil((new Date(selectedAssignment.due_date) - new Date()) / 86400000);
                      return (
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${d < 0 ? 'bg-red-500/10 text-red-400' : d <= 2 ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'
                          }`}>{d < 0 ? 'Overdue' : d === 0 ? 'Due Today' : `${d}d left`}</span>
                      );
                    })()}
                  </div>
                  <h2 className="text-xl font-bold text-white">{selectedAssignment.title}</h2>
                  <p className="text-zinc-500 text-xs mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Clock size={11} /> Due: {String(selectedAssignment.due_date || '').split('T')[0]}</span>
                    <span>{selectedAssignment.max_marks} Marks · {selectedAssignment.weightage}% weight</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Instructions + Attachments */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <FileText size={12} /> Instructions
                    </h3>
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedAssignment.description || 'No instructions provided.'}
                    </p>
                    {selectedAssignment.file_url && (
                      <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          <Upload size={10} className="text-blue-500" /> Instructor Attachments
                        </p>
                        <a
                          href={selectedAssignment.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl hover:bg-blue-600/20 transition-all text-blue-400 font-bold text-xs"
                        >
                          <FileText size={16} />
                          Download Instructions
                          <ExternalLink size={12} className="opacity-50" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Submission Panel */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Upload size={12} /> Submit Assignment
                    </h3>
                    {renderSubmissionPanel(selectedAssignment)}
                  </div>
                </div>
              </div>
            ) : (
              /* ── Assignment List ── */
              <>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-white">Course Assignments</h2>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">{assignments.length} Total</span>
                </div>
                {assignments.length > 0 ? (
                  <div className="space-y-3">
                    {assignments.map(ass => {
                      const overdue = ass.due_date && new Date(ass.due_date) < new Date();
                      return (
                        <div
                          key={ass.id}
                          onClick={() => openAssignment(ass)}
                          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group hover:border-blue-500/40 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-zinc-950 rounded-lg flex items-center justify-center text-blue-400 border border-zinc-800">
                              <ClipboardList size={18} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{ass.title}</h4>
                              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-500 font-medium">
                                <span className="flex items-center gap-1"><Clock size={12} /> Due: {String(ass.due_date || '').split('T')[0]}</span>
                                <span className="px-1.5 py-0.5 bg-zinc-800 rounded">{ass.max_marks} Marks</span>
                                {overdue && !isFaculty && (
                                  <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded font-black uppercase">Closed</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-20 text-center text-zinc-600"><p className="text-sm">No assignments posted yet.</p></div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Announcements ── */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-6">Course Bulletin</h3>
            {announcements.length > 0 ? (
              announcements.map(ann => (
                <div key={ann.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl border-l-4 border-l-blue-600">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                    <span className="text-[10px] text-zinc-500 font-medium">{new Date(ann.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{ann.body}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-600 text-center py-10">No recent announcements.</p>
            )}
          </div>
        )}

        {/* ── Resources ── */}
        {activeTab === 'resources' && (
          <div className="space-y-8">
            <h3 className="text-lg font-semibold text-white">Lecture Materials</h3>
            {isFaculty && (
              <form onSubmit={handleResourceUpload} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-black text-zinc-500 uppercase block mb-1">Resource Title (Optional)</label>
                  <input type="text" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="e.g. Chapter 1 Slides" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" />
                </div>
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-black text-zinc-500 uppercase block mb-1">Select File</label>
                  <input type="file" onChange={e => setUploadFile(e.target.files[0])} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.jpg,.jpeg,.png,.gif,.zip" className="w-full text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 cursor-pointer" />
                </div>
                <button disabled={!uploadFile || uploading} type="submit" className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </form>
            )}
            {resources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resources.map(r => {
                  const ext = (r.file_name || r.title || '').split('.').pop().toLowerCase();
                  const typeColors = {
                    pdf: 'text-red-400 bg-red-500/10 border-red-500/20',
                    docx: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                    doc: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                    pptx: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
                    ppt: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
                    xlsx: 'text-green-400 bg-green-500/10 border-green-500/20',
                    xls: 'text-green-400 bg-green-500/10 border-green-500/20',
                    zip: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                  };
                  const style = typeColors[ext] || 'text-zinc-400 bg-zinc-800 border-zinc-700';
                  const isImg = ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext);
                  return (
                    <a key={r.id} href={r.file_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-blue-500/50 transition-all group">
                      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black border ${isImg ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' : style}`}>
                        {isImg ? 'IMG' : ext.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">{r.title}</p>
                        {r.file_size && <p className="text-[10px] text-zinc-600">{r.file_size > 1048576 ? `${(r.file_size / 1048576).toFixed(1)} MB` : `${(r.file_size / 1024).toFixed(0)} KB`}</p>}
                      </div>
                      <ExternalLink size={14} className="text-zinc-600 group-hover:text-blue-400 shrink-0 transition-colors" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-zinc-600 text-center py-10">No resources uploaded yet.</p>
            )}
          </div>
        )}

        {/* ── Attendance ── */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Attendance Record</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Total Classes</p>
                <p className="text-2xl font-black text-white">{totalClasses}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Present</p>
                <p className="text-2xl font-black text-green-400">{presentCount}</p>
              </div>
              <div className={`border rounded-xl p-4 text-center ${attendancePct >= 75 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Percentage</p>
                <p className={`text-2xl font-black ${attendancePct >= 75 ? 'text-green-400' : 'text-red-400'}`}>{attendancePct}%</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase mb-1.5">
                <span>Attendance Rate</span>
                <span className={attendancePct < 75 ? 'text-red-400' : 'text-green-400'}>{attendancePct < 75 ? 'Below 75% threshold!' : 'On Track'}</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${attendancePct >= 75 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${attendancePct}%` }} />
              </div>
            </div>
            {attendance.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {attendance.slice().reverse().map((rec, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      {rec.status === 'present'
                        ? <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                        : rec.status === 'absent'
                          ? <XCircle size={16} className="text-red-400 shrink-0" />
                          : <MinusCircle size={16} className="text-zinc-500 shrink-0" />}
                      <span className="text-sm text-white font-medium">{new Date(rec.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${rec.status === 'present' ? 'text-green-400 bg-green-400/10' :
                      rec.status === 'absent' ? 'text-red-400 bg-red-400/10' : 'text-zinc-400 bg-zinc-800'
                      }`}>{rec.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600 text-center py-10">No attendance records found for this course.</p>
            )}
          </div>
        )}

        {/* ── Discussions (Threaded Q&A) ── */}
        {activeTab === 'discussions' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-lg font-semibold text-white">Course Q&A</h3>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="Have a doubt? Ask it here..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-white outline-none focus:border-blue-500/60 min-h-[90px] text-sm resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  {!isFaculty && (
                    <button
                      onClick={() => setIsAnon(!isAnon)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isAnon ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}
                    >
                      {isAnon ? <Lock size={13} /> : <Users size={13} />}
                      {isAnon ? 'Anonymity ON' : 'Anonymity OFF'}
                    </button>
                  )}
                </div>
                <button onClick={() => handlePost(null)} disabled={postLoading || !newPost.trim()} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors">
                  {postLoading ? 'Posting...' : <><Send size={14} /> Post Question</>}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {(() => {
                const questions = Array.isArray(posts) ? posts.filter(p => !p.parent_id) : [];
                const getReplies = (pid) => Array.isArray(posts) ? posts.filter(p => p.parent_id === pid).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) : [];

                if (questions.length === 0) return <p className="text-sm text-zinc-600 text-center py-10 italic">No discussions yet. Be the first to start one!</p>;

                return questions.map(q => (
                  <div key={q.id} className="space-y-4">
                    {/* Top Level Post */}
                    <div className={`p-5 rounded-2xl border ${q.role === 'faculty' ? 'bg-blue-600/5 border-blue-500/20' : 'bg-zinc-900/40 border-zinc-800'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${q.role === 'faculty' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                            {q.role === 'faculty' ? 'FAC' : 'STD'}
                          </div>
                          <div>
                            <p className="text-xs font-black text-white flex items-center gap-1.5">
                              {q.author_name || 'Anonymous Student'}
                              {q.role === 'faculty' && <BadgeCheck size={14} className="text-blue-400" />}
                            </p>
                            <p className="text-[10px] text-zinc-600">{new Date(q.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {q.role === 'faculty' && <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">Certified Response</span>}
                      </div>
                      <p className="text-zinc-200 text-sm leading-relaxed mb-4">{q.content}</p>

                      <button
                        onClick={() => setReplyTo(replyTo?.id === q.id ? null : { id: q.id, content: '' })}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${replyTo?.id === q.id ? 'text-red-400' : 'text-zinc-500 hover:text-indigo-400 font-black'}`}
                      >
                        {replyTo?.id === q.id ? 'Cancel Reply' : 'Reply'}
                      </button>
                    </div>

                    {/* Replies List */}
                    <div className="ml-10 space-y-3 border-l-2 border-zinc-800/30 pl-6">
                      {getReplies(q.id).map(r => (
                        <div key={r.id} className={`p-4 rounded-xl border ${r.role === 'faculty' ? 'bg-blue-900/10 border-blue-800/20 shadow-lg shadow-blue-500/5' : 'bg-zinc-950 border-zinc-800'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${r.role === 'faculty' ? 'bg-blue-600/10 text-blue-400' : 'bg-zinc-800 text-zinc-500'}`}>
                              {r.author_name || 'Anonymous Student'}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-300">{r.content}</p>
                        </div>
                      ))}

                      {/* Reply UI */}
                      {replyTo?.id === q.id && (
                        <div className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                          <input
                            autoFocus
                            className="flex-1 bg-zinc-900 border border-indigo-500/30 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-indigo-500"
                            placeholder="Write your answer..."
                            value={replyTo.content}
                            onChange={e => setReplyTo({ ...replyTo, content: e.target.value })}
                            onKeyDown={e => e.key === 'Enter' && handlePost(q.id)}
                          />
                          <button
                            onClick={() => handlePost(q.id)}
                            className="bg-indigo-600 p-2.5 rounded-xl text-white hover:bg-indigo-500 transition-all flex items-center justify-center"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
  );
}
