import React, { useState, useEffect } from 'react';
import CourseGrid from '../components/organisms/CourseGrid';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  BookOpen, 
  User, 
  Award, 
  Clock, 
  CheckCircle2, 
  PlusCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

// --- API CONFIG ---
const ACADEMIC_API = 'http://localhost:8000/api';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoadingId, setEnrollLoadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      const [courseRes, enrollRes] = await Promise.all([
        axios.get(`${ACADEMIC_API}/courses/`, { headers }),
        axios.get(`${ACADEMIC_API}/courses/my-schedule/`, { headers })
      ]);

      setCourses(courseRes.data);
      setEnrollments(enrollRes.data);
    } catch (err) {
      setError("Failed to sync with the Academic Service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrollLoadingId(courseId);
    try {
      const token = localStorage.getItem('token');
      // In a real scenario, this POSTs to the enrollment endpoint
      await axios.post(`${ACADEMIC_API}/courses/enroll/`, { course_id: courseId }, {
        headers: { 'x-auth-token': token }
      });
      
      // Update local state to reflect enrollment
      setEnrollments([...enrollments, { course_id: courseId, status: 'enrolled' }]);
    } catch (err) {
      console.error("Enrollment error", err);
    } finally {
      setEnrollLoadingId(null);
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Molecule */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tight">Academic Catalog</h1>
            <p className="text-gray-400 font-medium">Browse and enroll in available courses for the current semester.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Search by code or title..."
                className="bg-gray-800 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 w-64 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="bg-gray-800 border border-gray-700 p-2.5 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-200 animate-in fade-in slide-in-from-top-4">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {/* Catalog Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
            <h2 className="text-xl font-bold text-white">Available Subjects</h2>
            <span className="bg-gray-800 text-gray-400 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
              {filteredCourses.length} Found
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-800/50 animate-pulse rounded-2xl border border-gray-700" />
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <CourseGrid 
              courses={filteredCourses} 
              enrollments={enrollments} 
              onEnroll={handleEnroll}
              loadingId={enrollLoadingId}
            />
          ) : (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4 text-gray-600">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">No courses match your search</h3>
              <p className="text-gray-500 mt-1">Try searching for a different keyword or department code.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}