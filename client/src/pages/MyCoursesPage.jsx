import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  BookOpen, 
  Plus, 
  Search, 
  ArrowRight,
  Key,
  X,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

const ACADEMIC_API = import.meta.env.VITE_ACADEMIC_API_URL || '/api/academic';

export default function MyCoursesPage() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ code: '', key: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    fetchMySchedule();
  }, []);

  const fetchMySchedule = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${ACADEMIC_API}/courses/my-schedule/`);
      setEnrollments(res.data || []);
    } catch (err) {
      setError("Failed to fetch your academic schedule. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCourse = async (e) => {
    e.preventDefault();
    if (!addForm.code || !addForm.key) {
      setAddError("Both Course Code and Enrollment Key are required.");
      return;
    }

    setAddLoading(true);
    setAddError('');
    try {
      // We send the code and key. The backend finds the course by code and verifies the key.
      await api.post(`${ACADEMIC_API}/courses/enroll-by-code/`, {
        course_code: addForm.code.toUpperCase(),
        enrollment_key: addForm.key
      });
      
      setShowAddModal(false);
      setAddForm({ code: '', key: '' });
      fetchMySchedule(); // Refresh list
    } catch (err) {
      setAddError(err.response?.data?.message || "Invalid Course Code or Enrollment Key.");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Header Piece ── */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">My Academic Schedule</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your active enrollments and course workspaces.</p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-600/10"
        >
          <Plus size={18} /> Enroll in New Course
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* ── Enrolled Courses List ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrollments.map((course) => (
            <div 
              key={course.id}
              onClick={() => navigate(`/courses/${course.id}`)}
              className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center text-blue-400">
                  <BookOpen size={20} />
                </div>
                <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded uppercase tracking-wider">
                  {course.code}
                </span>
              </div>
              
              <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors mb-1 truncate">
                {course.title}
              </h3>
              <p className="text-xs text-zinc-500 mb-4">{course.credits} Credits · {course.semester}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <span className="text-xs text-green-500 font-medium flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active Enrollment
                </span>
                <ArrowRight size={16} className="text-zinc-700 group-hover:text-blue-400 transition-all" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-700">
            <GraduationCap size={32} />
          </div>
          <h3 className="text-lg font-semibold text-white">No active enrollments</h3>
          <p className="text-zinc-500 text-sm mt-1 max-w-xs text-center">
            You haven't joined any courses yet. Click the button above to unlock a course workspace.
          </p>
        </div>
      )}

      {/* ── Gain Access Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Key className="text-blue-500" size={18} /> Gain Course Access
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Enter the Course Code and the secret key provided by your instructor to unlock the workspace.
            </p>
            
            <form onSubmit={handleJoinCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Course Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. CS253"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition-all placeholder-zinc-600 uppercase"
                  value={addForm.code}
                  onChange={e => setAddForm({ ...addForm, code: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Enrollment Key</label>
                <input 
                  type="password" 
                  placeholder="Enter secret key"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition-all placeholder-zinc-600"
                  value={addForm.key}
                  onChange={e => setAddForm({ ...addForm, key: e.target.value })}
                  required
                />
              </div>

              {addError && <p className="text-red-400 text-xs font-medium bg-red-400/10 p-2.5 rounded border border-red-400/20">{addError}</p>}
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  disabled={addLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {addLoading ? 'Verifying...' : 'Unlock Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}