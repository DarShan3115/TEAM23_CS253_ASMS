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
  ArrowRight,
  X,
  Key
} from 'lucide-react';

// --- API CONFIG ---
const ACADEMIC_API = import.meta.env.VITE_ACADEMIC_API_URL || '/api/academic';

// --- DUMMY DATA FALLBACK ---
const DUMMY_COURSES = [
  { id: 'mock-1', code: 'CS101', title: 'Introduction to Programming', instructor_name: 'Dr. Alan Turing', credits: 4 },
  { id: 'mock-2', code: 'MTH201', title: 'Calculus II', instructor_name: 'Dr. Isaac Newton', credits: 3 },
  { id: 'mock-3', code: 'PHY301', title: 'Quantum Mechanics', instructor_name: 'Dr. Marie Curie', credits: 4 },
  { id: 'mock-4', code: 'ENG105', title: 'Technical Communication', instructor_name: 'Prof. J.R.R. Tolkien', credits: 2 }
];

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoadingId, setEnrollLoadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  
  // Enrollment Modal States
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseKey, setCourseKey] = useState('');
  const [enrollError, setEnrollError] = useState('');

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

      setCourses(courseRes.data?.length ? courseRes.data : DUMMY_COURSES);
      setEnrollments(enrollRes.data || []);
    } catch (err) {
      setError("Academic Service offline. Showing mock courses. Use key '1234' to test enrollment.");
      setCourses(DUMMY_COURSES);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course);
    setCourseKey('');
    setEnrollError('');
    setEnrollModalOpen(true);
  };

  const confirmEnrollment = async (e) => {
    e.preventDefault();
    if (!courseKey.trim()) {
      setEnrollError('Course key is required.');
      return;
    }

    setEnrollLoadingId(selectedCourse.id);
    setEnrollError('');
    
    try {
      // MOCK MODE FALLBACK CHECK
      if (selectedCourse.id.startsWith('mock-')) {
        await new Promise(r => setTimeout(r, 800)); // Simulate network delay
        if (courseKey === '1234') {
          setEnrollments([...enrollments, { course_id: selectedCourse.id, status: 'enrolled' }]);
          setEnrollModalOpen(false);
        } else {
          setEnrollError("Invalid mock key. Use '1234' for offline testing.");
        }
        setEnrollLoadingId(null);
        return;
      }

      const token = localStorage.getItem('token');
      await axios.post(`${ACADEMIC_API}/courses/enroll/`, { 
        course_id: selectedCourse.id,
        course_key: courseKey 
      }, { headers: { 'x-auth-token': token } });
      
      setEnrollments([...enrollments, { course_id: selectedCourse.id, status: 'enrolled' }]);
      setEnrollModalOpen(false);
    } catch (err) {
      console.error("Enrollment error", err);
      setEnrollError(err.response?.data?.message || "Invalid course key or server error.");
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
              onEnroll={handleEnrollClick}
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

        {/* Secure Enrollment Key Modal */}
        {enrollModalOpen && selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Key className="text-blue-500" size={20} /> Course Verification
                </h3>
                <button onClick={() => setEnrollModalOpen(false)} className="p-1 text-gray-500 hover:text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                You are requesting to enroll in <strong className="text-white">{selectedCourse.code} - {selectedCourse.title}</strong>. 
                Please enter the secret enrollment key provided by your instructor.
              </p>
              
              <form onSubmit={confirmEnrollment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Enrollment Key</label>
                  <input 
                    type="text" 
                    value={courseKey}
                    onChange={(e) => setCourseKey(e.target.value)}
                    placeholder="e.g. SP2024-SEC1"
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono tracking-widest uppercase"
                  />
                </div>
                
                {enrollError && <p className="text-red-400 text-xs font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20">{enrollError}</p>}
                
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setEnrollModalOpen(false)} className="flex-1 py-3.5 px-4 rounded-xl font-bold text-gray-400 bg-gray-800 hover:text-white hover:bg-gray-700 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={enrollLoadingId === selectedCourse.id} className="flex-1 py-3.5 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2">
                    {enrollLoadingId === selectedCourse.id ? 'Verifying...' : 'Unlock Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}