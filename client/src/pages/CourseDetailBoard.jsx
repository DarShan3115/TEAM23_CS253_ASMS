import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Megaphone,
  BookOpen,
  MessageSquare,
  BarChart,
  ClipboardList,
  CalendarCheck,
  FileText,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseInfo();
    fetchSecondaryData();
  }, [courseId]);

  const fetchCourseInfo = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${ACADEMIC_API}/courses/${courseId}/`);
      setCourseData(res.data);
    } catch (err) {
      setError("Course workspace offline.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSecondaryData = async () => {
    try {
      const [assignRes, annRes, resRes] = await Promise.all([
        api.get(`${PRODUCTIVITY_API}/courses/${courseId}/tasks`),
        api.get(`${ACADEMIC_API}/courses/${courseId}/announcements/`),
        api.get(`${ACADEMIC_API}/courses/${courseId}/resources/`)
      ]);
      setAssignments(assignRes.data || []);
      setAnnouncements(annRes.data || []);
      setResources(resRes.data || []);
    } catch (err) {
      console.warn("Could not fetch some course components", err);
    }
  };

  if (loading) return <div className="p-10 text-white font-bold text-xl animate-pulse">Synchronizing Workspace...</div>;
  if (!courseData && !loading) return <div className="p-10 text-red-400">Course not found.</div>;

  const TABS = [
    { id: 'info', icon: BookOpen, label: 'Course Info' },
    { id: 'assignments', icon: ClipboardList, label: 'Assignments' },
    { id: 'announcements', icon: Megaphone, label: 'Announcements' },
    { id: 'resources', icon: FileText, label: 'Resources' },
    { id: 'attendance', icon: CalendarCheck, label: 'Attendance' },
    { id: 'discussions', icon: MessageSquare, label: 'Discussions' },
  ];

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
          <p className="text-zinc-500 mt-1 text-sm font-medium">{courseData.instructor_name || 'Department Faculty'} • {courseData.credits} Credits</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start min-h-[500px]">
        {/* ── Sidebar Nav ── */}
        <div className="w-full md:w-56 flex flex-col gap-1 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
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
          
          {/* Info Tab */}
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
                    <p className="text-white text-sm font-medium">{courseData.credits} CR • {courseData.max_enrollment || 60} Students</p>
                  </div>
               </div>
               <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 italic text-zinc-400 text-sm leading-relaxed">
                  {courseData.description || 'No course description provided by the instructor.'}
               </div>
            </div>
          )}

          {/* Assignments Tab (LIVE SYNC) */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-white">Course Assignments</h2>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">{assignments.length} Total</span>
              </div>
              
              {assignments.length > 0 ? (
                <div className="space-y-3">
                  {assignments.map(ass => (
                    <div key={ass.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-950 rounded-lg flex items-center justify-center text-blue-400 border border-zinc-800">
                          <ClipboardList size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{ass.title}</h4>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-500 font-medium">
                            <span className="flex items-center gap-1"><Clock size={12} /> Due: {ass.due_date || 'N/A'}</span>
                            <span className="px-1.5 py-0.5 bg-zinc-800 rounded uppercase">{ass.priority}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate('/tasks')} // Link to submission page
                        className="p-2 text-zinc-500 hover:text-white"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-zinc-600">
                  <p className="text-sm">No assignments posted yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Announcements */}
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

          {/* Resources */}
          {activeTab === 'resources' && (
            <div className="space-y-8">
               <h3 className="text-lg font-semibold text-white mb-4">Lecture Materials</h3>
               {resources.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {resources.map(r => (
                     <a 
                       key={r.id}
                       href={r.file_url}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-blue-500/50 transition-all text-zinc-300 hover:text-white"
                     >
                       <div className="flex items-center gap-3">
                         <FileText size={18} className="text-blue-400" />
                         <div>
                           <p className="text-sm font-bold truncate max-w-[150px]">{r.title}</p>
                           <p className="text-[10px] text-zinc-600 uppercase font-black">{r.resource_type}</p>
                         </div>
                       </div>
                       <ExternalLink size={14} className="text-zinc-600" />
                     </a>
                   ))}
                 </div>
               ) : (
                 <p className="text-sm text-zinc-600 text-center py-10">No resources uploaded yet.</p>
               )}
            </div>
          )}

          {/* Fallback for other tabs */}
          {(activeTab === 'attendance' || activeTab === 'discussions') && (
            <div className="py-20 text-center flex flex-col items-center justify-center text-zinc-600">
              <AlertCircle size={32} className="mb-4 text-zinc-800" />
              <p className="text-sm font-medium">This module is active but synchronization is pending data input from classmates/instructor.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
