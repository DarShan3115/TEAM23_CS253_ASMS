import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, RefreshCcw, ArrowRight, GraduationCap,
  Building2, ClipboardCheck
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const ACADEMIC = '/api/academic';
const PRODUCTIVITY = '/api/v1';

export default function FacultyDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ totalStudents: '--', activeCourses: '--', pendingGrades: '--' });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${ACADEMIC}/courses/faculty-load/`);
      const data = res.data || [];
      setCourses(data);
      const totalStudents = data.reduce((sum, c) => sum + (c.students_count || 0), 0);
      setStats({
        activeCourses: data.length,
        totalStudents,
        pendingGrades: '--'  // Will be wired when submission service expands
      });
    } catch {
      const mock = [
        { id: 'mock-1', code: 'CS253', title: 'Software Engineering',   credits: 4, students_count: 62, semester: '2024-II' },
        { id: 'mock-2', code: 'CS340', title: 'Operating Systems',      credits: 3, students_count: 45, semester: '2024-II' },
      ];
      setCourses(mock);
      setStats({ activeCourses: mock.length, totalStudents: 107, pendingGrades: '--' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const statCards = [
    { label: 'Active Courses',   value: stats.activeCourses,   icon: BookOpen,      color: 'text-blue-400',   bg: 'from-blue-600/20 to-blue-900/10' },
    { label: 'Total Students',   value: stats.totalStudents,   icon: Users,         color: 'text-emerald-400', bg: 'from-emerald-600/20 to-emerald-900/10' },
    { label: 'Pending Grades',   value: stats.pendingGrades,   icon: ClipboardCheck, color: 'text-yellow-400', bg: 'from-yellow-600/20 to-yellow-900/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex items-center gap-5 pb-6 border-b border-zinc-800">
        <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl font-semibold text-white shrink-0">
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
            : <>{user?.first_name?.[0]}{user?.last_name?.[0]}</>
          }
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Welcome, Prof. {user?.first_name}!
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-md">
              <GraduationCap size={13} className="text-emerald-400" /> Instructor
            </span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-md">
              <Building2 size={13} className="text-zinc-500" /> Dept. of Computer Science
            </span>
          </div>
        </div>
        <button onClick={fetchData} className="ml-auto p-2 border border-zinc-700 bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stat Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {statCards.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 mb-2">{s.label}</p>
                <p className={`text-3xl font-semibold ${s.color}`}>{s.value}</p>
              </div>
              <div className="p-2.5 bg-zinc-800 rounded-lg">
                <Icon size={18} className={s.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Grid */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen size={16} className="text-blue-400" /> My Courses
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-zinc-900 animate-pulse rounded-xl border border-zinc-800" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-16 border-2 border-dashed border-zinc-800 rounded-xl text-center">
            <GraduationCap size={36} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No courses assigned to your profile yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map(course => (
              <div key={course.id} onClick={() => navigate(`/faculty/courses/${course.id}`)}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 cursor-pointer group transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-zinc-800 rounded-lg">
                    <BookOpen size={18} className="text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-blue-400 bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-md">{course.code}</span>
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">{course.title}</h3>
                <p className="text-sm text-zinc-500">{course.credits} Credits · {course.semester}</p>
                <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 flex items-center gap-1.5"><Users size={13} /> {course.students_count || 0} students</span>
                  <ArrowRight size={15} className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}