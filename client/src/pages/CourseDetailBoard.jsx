import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Users,
  Megaphone,
  BookOpen,
  MessageSquare,
  BarChart,
  ClipboardList,
  CalendarCheck,
  FileText
} from 'lucide-react';
import api from '../services/api';

export default function CourseDetailBoard() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  // MOCK DATA FOR UI PREVIEW
  const mockCourse = {
    code: 'CS253',
    title: 'Software Development and Engineering',
    credits: 4,
    instructorName: 'Prof. John Smith',
    announcements: [
      { id: 1, title: 'Welcome to CS253', body: 'The first lecture will be held on Monday.', date: '2024-01-10' },
      { id: 2, title: 'Midterm Relocation', body: 'The midterm will be in Hall 2.', date: '2024-02-15' }
    ],
    resources: {
      lecture: [{ id: 1, title: 'Lec 1: Intro to Agile', url: '#' }, { id: 2, title: 'Lec 2: Version Control', url: '#' }],
      other: [{ id: 3, title: 'Syllabus PDF', url: '#' }]
    },
    discussions: [
      { id: 1, authorName: 'Professor John Smith', content: 'Any questions regarding the group project?', is_anonymous: false },
      { id: 2, authorName: 'Student', content: 'Do we pick our own teams?', is_anonymous: true }
    ],
    gradeProgress: {
      currentNet: 45,
      currentMaxObtainable: 50,
      assessments: [
        { id: 1, name: 'Quiz 1', obtained: 18, total: 20, net: 4.5, netMax: 5.0 },
        { id: 2, name: 'Midterm', obtained: 81, total: 100, net: 40.5, netMax: 45.0 }
      ]
    }
  };

  useEffect(() => {
    // In actual implementation, we'd fetch full course details via ID from /api/academic/courses/
    // For now we'll mock the response to build out the UI.
    setTimeout(() => {
      setCourseData(mockCourse);
      setLoading(false);
    }, 500);
  }, [courseId]);

  if (loading) return <div className="p-10 text-white font-bold text-xl animate-pulse">Loading Workspace...</div>;

  const TABS = [
    { id: 'info', icon: BookOpen, label: 'Course Info' },
    { id: 'announcements', icon: Megaphone, label: 'Announcements' },
    { id: 'resources', icon: FileText, label: 'Resources' },
    { id: 'attendance', icon: CalendarCheck, label: 'Attendance' },
    { id: 'discussions', icon: MessageSquare, label: 'Discussions' },
    { id: 'progress', icon: BarChart, label: 'Grade Progress' },
    { id: 'assignments', icon: ClipboardList, label: 'Assignments' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-6">
        <button onClick={() => navigate('/courses')} className="p-2 border border-zinc-700 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-300">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-3">
             <span className="text-blue-400 font-black text-xl tracking-widest bg-blue-900/30 px-3 py-1 rounded-md border border-blue-800/50">
               {courseData.code}
             </span>
             <h1 className="text-3xl font-black text-white">{courseData.title}</h1>
          </div>
          <p className="text-zinc-500 mt-1 font-medium">{courseData.instructorName} • {courseData.credits} Credits</p>
        </div>
      </div>

      {/* Workspace Split */}
      <div className="flex flex-col md:flex-row gap-8 items-start h-[calc(100vh-200px)]">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 h-full overflow-y-auto">
          {activeTab === 'info' && (
            <div className="space-y-4">
               <h2 className="text-2xl font-bold text-white mb-6">Course Overview</h2>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                    <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Instructor</p>
                    <p className="text-white font-medium">{courseData.instructorName}</p>
                  </div>
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                    <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Credits</p>
                    <p className="text-white font-medium">{courseData.credits}</p>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-white">Grade Progress</h2>
                <div className="text-right">
                   <p className="text-zinc-500 font-bold text-sm uppercase">Current Weighting</p>
                   <p className="text-3xl font-black text-green-400">
                     {courseData.gradeProgress.currentNet} <span className="text-zinc-600 text-xl">/ {courseData.gradeProgress.currentMaxObtainable}%</span>
                   </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-950 text-zinc-400 text-sm font-bold uppercase tracking-wider border-b border-zinc-800">
                      <th className="p-4">Sr. No.</th>
                      <th className="p-4">Assessment Name</th>
                      <th className="p-4">Obtained Marks</th>
                      <th className="p-4">Total Marks</th>
                      <th className="p-4 text-blue-400">Net Obtained</th>
                      <th className="p-4 text-zinc-500">Max Obtainable</th>
                    </tr>
                  </thead>
                  <tbody className="text-white border-zinc-800 divide-y divide-zinc-800">
                    {courseData.gradeProgress.assessments.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-zinc-800/50 transition whitespace-nowrap text-sm font-medium">
                        <td className="p-4 text-zinc-500">{idx + 1}</td>
                        <td className="p-4">{item.name}</td>
                        <td className="p-4">{item.obtained}</td>
                        <td className="p-4">{item.total}</td>
                        <td className="p-4 text-blue-400">+{item.net}</td>
                        <td className="p-4 text-zinc-500">{item.netMax}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'discussions' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Anonymous Discussion Portal</h2>
              <div className="space-y-4">
                {courseData.discussions.map(post => (
                  <div key={post.id} className={`p-4 rounded-xl border ${post.is_anonymous ? 'bg-zinc-950 border-zinc-800' : 'bg-blue-900/10 border-blue-900/50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">
                         {post.authorName[0]}
                       </div>
                       <p className={`font-bold ${!post.is_anonymous ? 'text-blue-400' : 'text-zinc-300'}`}>
                         {post.authorName}
                       </p>
                    </div>
                    <p className="text-zinc-300 ml-10">{post.content}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                 <input type="text" placeholder="Type a message..." className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
                 <button className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-500">Send</button>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
             <div className="space-y-8">
               <div>
                  <h3 className="text-xl font-bold text-white mb-4 border-b border-zinc-800 pb-2">Lecture Notes</h3>
                  <ul className="space-y-2">
                    {courseData.resources.lecture.map(r => (
                      <li key={r.id} className="flex gap-2 items-center text-blue-400 hover:text-blue-300 font-medium">
                        <FileText size={16} /> <a href={r.url}>{r.title}</a>
                      </li>
                    ))}
                  </ul>
               </div>
               <div>
                  <h3 className="text-xl font-bold text-white mb-4 border-b border-zinc-800 pb-2">Other Resources</h3>
                  <ul className="space-y-2">
                    {courseData.resources.other.map(r => (
                      <li key={r.id} className="flex gap-2 items-center text-blue-400 hover:text-blue-300 font-medium">
                        <FileText size={16} /> <a href={r.url}>{r.title}</a>
                      </li>
                    ))}
                  </ul>
               </div>
             </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">Instructor Announcements</h2>
              {courseData.announcements.map(ann => (
                <div key={ann.id} className="bg-zinc-950 border-l-4 border-yellow-500 p-4 rounded-r-xl">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{ann.title}</h3>
                    <span className="text-xs text-zinc-500 font-bold bg-zinc-900 px-2 py-1 rounded-md">{ann.date}</span>
                  </div>
                  <p className="text-zinc-400">{ann.body}</p>
                </div>
              ))}
            </div>
          )}
          
          {(activeTab === 'attendance' || activeTab === 'assignments') && (
            <div className="py-20 text-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl">
              <p className="font-bold">Content mapped to other components/pages. Ready for data binding.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
