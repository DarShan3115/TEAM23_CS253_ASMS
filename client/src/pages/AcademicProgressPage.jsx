import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PerformanceOverview from '../components/organisms/PerformanceOverview';
import { useAuthStore } from '../store/authStore';
import { BarChart3, PieChart, TrendingUp, Info } from 'lucide-react';

const ACADEMIC_API = import.meta.env.VITE_ACADEMIC_API_URL || '/api/academic';

export default function AcademicProgressPage() {
  const { user } = useAuthStore();
  const [academicData, setAcademicData] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [overview, setOverview] = useState({ gpa: 0 });
  const [targetCPI, setTargetCPI] = useState(9.5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch analytics overview (CPI, subjects)
        const analyticsRes = await api.get('/api/analytics/student/overview');
        if (analyticsRes.data) {
          setAcademicData(analyticsRes.data.subjects || []);
          setOverview({ gpa: analyticsRes.data.gpa || 0 });
        }
      } catch (err) {
        console.error('Analytics fetch failed:', err);
      }

      try {
        // Fetch student's own enrolled courses for subject breakdown
        const scheduleRes = await api.get(`${ACADEMIC_API}/courses/my-schedule/`);
        setEnrolledCourses(scheduleRes.data || []);
      } catch (err) {
        console.error('Schedule fetch failed:', err);
      }

      setLoading(false);
    };
    fetchAll();
  }, []);

  // Build subject breakdown from enrolled courses, merged with any analytics data
  const subjectBreakdown = enrolledCourses.map(course => {
    const analyticsMatch = academicData.find(
      s => s.code === course.code || s.subject === course.code || s.subject === course.title
    );
    return {
      subject: course.code,
      title: course.title,
      attendance: analyticsMatch?.attendance ?? null,
      grade: course.grade || analyticsMatch?.grade || null,
      credits: course.credits,
      status: course.status || 'enrolled',
    };
  });

  const currentCPI = overview.gpa;
  const cpiProgress = Math.min((currentCPI / targetCPI) * 100, 100);
  const cpiDiff = (targetCPI - currentCPI).toFixed(2);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex items-center justify-center">
        <p className="text-xl font-bold animate-pulse text-blue-500">Loading your academic metrics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-600 p-2 rounded-lg shadow-lg shadow-purple-600/20">
                <BarChart3 size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Academic Progress</h1>
            </div>
            <p className="text-gray-400 font-medium">Your semester performance and subject breakdown.</p>
          </div>
        </div>

        {/* ── Top Summary Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* CPI Banner */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-blue-900/20">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2 text-center md:text-left">
                  <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Current Standing</p>
                  <h2 className="text-2xl font-black text-white">
                    {currentCPI >= 8 ? "Dean's List Eligible!" : currentCPI >= 6 ? "Good Standing" : "Needs Improvement"}
                  </h2>
                  <p className="text-blue-100 text-sm max-w-sm">
                    Your current CPI is <strong>{currentCPI.toFixed(2)}</strong>.
                    {currentCPI < targetCPI
                      ? ` You need +${cpiDiff} to reach your target of ${targetCPI}.`
                      : ' You have met your CPI target!'}
                  </p>
                </div>
                <div className="flex items-center gap-8 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-blue-200 uppercase mb-1">Overall CPI</p>
                    <p className="text-3xl font-black text-white">{currentCPI.toFixed(2)}</p>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-blue-200 uppercase mb-1">Enrolled</p>
                    <p className="text-3xl font-black text-white">{enrolledCourses.length}</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            </div>
          </div>

          {/* Target CPI Widget */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-3xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">Target CPI</h3>
              <Info size={16} className="text-gray-500" />
            </div>
            <div className="my-4">
              {/* Editable Target */}
              <div className="flex items-end gap-2 mb-3">
                <input
                  type="number"
                  min="0" max="10" step="0.1"
                  value={targetCPI}
                  onChange={e => setTargetCPI(parseFloat(e.target.value) || 0)}
                  className="text-3xl font-black text-white bg-transparent border-b border-zinc-600 focus:border-blue-500 outline-none w-20"
                />
                <span className={`text-xs font-bold pb-1 ${cpiDiff > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                  {cpiDiff > 0 ? `+${cpiDiff} needed` : '✓ Achieved'}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${cpiDiff <= 0 ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${cpiProgress}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 font-medium italic">Click the number above to set your target.</p>
          </div>
        </div>

        {/* ── Subject Breakdown (Enrolled Courses Only) ── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PieChart className="text-blue-500" size={20} />
              Subject Breakdown
            </h2>
            <span className="text-xs text-gray-500 font-medium">{enrolledCourses.length} enrolled courses</span>
          </div>

          {subjectBreakdown.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjectBreakdown.map((course, idx) => (
                <div key={idx} className="bg-gray-800/30 border border-gray-700 rounded-2xl p-5 hover:border-gray-600 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded uppercase tracking-wider">
                        {course.subject}
                      </span>
                      <h4 className="text-white font-bold text-sm mt-2 leading-tight">{course.title}</h4>
                    </div>
                    {course.grade && (
                      <span className="text-lg font-black text-green-400">{course.grade}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-700/50">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Credits</p>
                      <p className="text-sm font-bold text-white">{course.credits}</p>
                    </div>
                    {course.attendance !== null && (
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Attendance</p>
                        <p className={`text-sm font-bold ${course.attendance >= 75 ? 'text-green-400' : 'text-red-400'}`}>
                          {course.attendance}%
                        </p>
                      </div>
                    )}
                    <div className="ml-auto">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                        course.status === 'completed' ? 'bg-green-400/10 text-green-400' :
                        course.status === 'enrolled' ? 'bg-blue-400/10 text-blue-400' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>{course.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800/10 border border-gray-700 border-dashed rounded-3xl p-12 text-center">
              <TrendingUp size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No enrolled courses yet</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}