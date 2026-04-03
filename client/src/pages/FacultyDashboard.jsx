import React, { useState, useEffect } from 'react';
import AtRiskSection from '../components/organisms/AtRiskList';
import CreateAssignmentModal from '../components/organisms/CreateAssignment';
import axios from 'axios';
import { 
  Users, BookOpen, AlertTriangle, BarChart, 
  MoreVertical, Search, Plus, Mail, FileSpreadsheet,
  Loader2, RefreshCcw
} from 'lucide-react';

// --- API CONFIGURATION ---
const ACADEMIC_API = 'http://localhost:8000/api';
const ANALYTICS_API = 'http://localhost:8001/api';

export default function FacultyDashboard() {
  const [courses, setCourses] = useState([]);
  const [riskStudents, setRiskStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const headers = { 'x-auth-token': token, 'x-user-id': user?.id };

      // 1. Fetch courses from Academic Service (Django)
      // 2. Fetch risk analytics from Analytics Service (FastAPI)
      const [courseRes, riskRes] = await Promise.all([
        axios.get(`${ACADEMIC_API}/courses/faculty-load/`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${ANALYTICS_API}/api/analytics/faculty/risk-alerts`, { headers }).catch(() => ({ data: [] }))
      ]);

      setCourses(courseRes.data);
      setRiskStudents(riskRes.data);
    } catch (err) {
      setError("System Sync Error: Could not connect to academic or analytics services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Faculty Overview</h1>
            <p className="text-gray-400 mt-1 font-medium">Real-time data from Academic & Analytics nodes</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              className="p-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white transition-all"
            >
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all">
              <Plus size={16} /> New Assessment
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-200 text-sm">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="text-blue-500" size={20} />
                My Active Classes
              </h2>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => <div key={i} className="h-48 bg-gray-800 animate-pulse rounded-2xl border border-gray-700" />)}
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map(course => <ClassSummaryCard key={course.id} course={course} />)}
              </div>
            ) : (
              <div className="bg-gray-800/20 border-2 border-dashed border-gray-700 p-12 rounded-2xl text-center">
                <p className="text-gray-500 font-medium italic">No active courses assigned to your profile.</p>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            <AtRiskSection students={riskStudents} loading={loading} />
            
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 shadow-xl shadow-blue-900/20">
              <h4 className="text-white font-black text-sm mb-2 uppercase tracking-tighter">System Insight</h4>
              <p className="text-blue-100 text-[11px] leading-relaxed opacity-90">
                Attendance patterns suggest a 12% increase in engagement for courses using the new Productivity tracker.
              </p>
              <div className="mt-5 flex gap-2">
                <button className="flex-1 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl transition-all flex items-center justify-center">
                  <Mail size={18} />
                </button>
                <button className="flex-[3] bg-white text-blue-700 text-[10px] font-black uppercase rounded-xl hover:shadow-lg transition-all">
                  Broadcast Update
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h4 className="text-white font-bold text-xs mb-4 flex items-center gap-2 uppercase">
                <BarChart size={14} className="text-purple-500" /> Quick Stats
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-gray-500 font-bold">GLOBAL PASS RATE</span>
                  <span className="text-lg font-black text-white">88.4%</span>
                </div>
                <div className="w-full bg-gray-700 h-1.5 rounded-full">
                  <div className="bg-green-500 h-1.5 rounded-full w-[88%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}