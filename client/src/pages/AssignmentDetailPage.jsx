import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Upload, X, CheckCircle2,
  Clock, BookOpen, Paperclip, AlertCircle, ExternalLink, Send
} from 'lucide-react';
import api from '../services/api';

const ACADEMIC_API = import.meta.env.VITE_ACADEMIC_API_URL || '/api/academic';

const FILE_ICON_MAP = {
  pdf:  { color: 'text-red-400',    bg: 'bg-red-400/10'    },
  zip:  { color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  jpg:  { color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
  jpeg: { color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
  png:  { color: 'text-green-400',  bg: 'bg-green-400/10'  },
  pptx: { color: 'text-orange-400', bg: 'bg-orange-400/10' },
  docx: { color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
};

const extOf = (name = '') => name.split('.').pop().toLowerCase();
const fileStyle = (name) => FILE_ICON_MAP[extOf(name)] || { color: 'text-zinc-400', bg: 'bg-zinc-800' };

export default function AssignmentDetailPage() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Submission state
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [submissionNote, setSubmissionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`${ACADEMIC_API}/courses/${courseId}/assignments/${assignmentId}/`);
        setAssignment(res.data);
      } catch (err) {
        setError('Assignment not found or could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [courseId, assignmentId]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files) => {
    const allowed = files.filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ['pdf', 'zip', 'jpg', 'jpeg', 'png'].includes(ext);
    });
    setSubmissionFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name));
      return [...prev, ...allowed.filter(f => !existingNames.has(f.name))];
    });
  };

  const removeFile = (name) => {
    setSubmissionFiles(prev => prev.filter(f => f.name !== name));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submissionFiles.length === 0 && !submissionNote.trim()) {
      setSubmitError('Please upload at least one file or add a note before submitting.');
      return;
    }
    setSubmitError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      submissionFiles.forEach(f => formData.append('files', f));
      formData.append('content', submissionNote);
      await api.post(
        `${ACADEMIC_API}/courses/${courseId}/assignments/${assignmentId}/submit/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="p-10 text-white font-bold text-xl animate-pulse">Loading Assignment...</div>
  );
  if (error) return (
    <div className="p-10 text-red-400 flex items-center gap-3"><AlertCircle />{error}</div>
  );

  const daysLeft = assignment?.due_date
    ? Math.ceil((new Date(assignment.due_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ── Back + Header ── */}
      <div className="flex items-start gap-4 border-b border-zinc-800 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2 py-0.5 rounded uppercase tracking-wider">
              Assignment
            </span>
            {daysLeft !== null && (
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                daysLeft < 0 ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                daysLeft <= 2 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-green-500/10 text-green-400 border-green-500/20'
              }`}>
                {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Due Today' : `${daysLeft}d left`}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">{assignment.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5"><Clock size={12} /> Due: {String(assignment.due_date || '').split('T')[0] || 'N/A'}</span>
            <span className="flex items-center gap-1.5"><BookOpen size={12} /> {assignment.max_marks} Marks · Weightage {assignment.weightage}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Instructions + Attachments ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Instructions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText size={14} /> Instructions
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
              {assignment.description || 'No instructions provided by the professor.'}
            </div>
          </div>

          {/* Professor Attachments */}
          {assignment.attachments?.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Paperclip size={14} /> Professor's Attachments
              </h2>
              <div className="space-y-2">
                {assignment.attachments.map((att, idx) => {
                  const style = fileStyle(att.name || att.file_url || '');
                  return (
                    <a
                      key={idx}
                      href={att.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${style.bg} ${style.color}`}>
                          {extOf(att.name || att.file_url || '').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{att.name || 'Attachment'}</p>
                          <p className="text-[10px] text-zinc-600">{att.size || ''}</p>
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-zinc-600 group-hover:text-blue-400" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Submission Box ── */}
        <div>
          {submitted ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
              <CheckCircle2 size={40} className="text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Submitted!</h3>
              <p className="text-sm text-zinc-400 mt-1">Your assignment has been received successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Upload size={14} /> Submit Assignment
              </h2>

              {/* Drop Zone */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 hover:border-blue-500/60 rounded-xl p-6 text-center cursor-pointer transition-colors group"
              >
                <Upload size={24} className="text-zinc-600 group-hover:text-blue-400 mx-auto mb-2 transition-colors" />
                <p className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">Drop files or click to browse</p>
                <p className="text-[10px] text-zinc-600 mt-1">PDF, ZIP, JPG · Multiple files allowed</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.zip,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileDrop}
                />
              </div>

              {/* Selected files */}
              {submissionFiles.length > 0 && (
                <div className="space-y-2">
                  {submissionFiles.map(f => {
                    const style = fileStyle(f.name);
                    return (
                      <div key={f.name} className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-black shrink-0 ${style.bg} ${style.color}`}>
                            {extOf(f.name).toUpperCase()}
                          </div>
                          <p className="text-xs font-medium text-white truncate">{f.name}</p>
                        </div>
                        <button type="button" onClick={() => removeFile(f.name)} className="text-zinc-600 hover:text-red-400 transition-colors shrink-0 ml-2">
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Note */}
              <textarea
                value={submissionNote}
                onChange={e => setSubmissionNote(e.target.value)}
                placeholder="Add a note or submission link (optional)..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500/60 resize-none placeholder-zinc-600"
              />

              {submitError && (
                <p className="text-xs text-red-400 bg-red-400/10 p-2.5 rounded-lg border border-red-400/20">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {submitting ? 'Submitting...' : <><Send size={16} /> Submit Assignment</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
