import React, { useState } from 'react';
import PerformanceOverview from '../components/organisms/PerformanceOverview';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  ChevronRight,
  Info
} from 'lucide-react';

export default function AcademicProgressPage() {
  // Mock data representing state that will eventually come from the Analytics Service
  const [academicData] = useState([
    { subject: 'Advanced Algorithms', attendance: 92, grade: 'A', trend: '+4%' },
    { subject: 'Database Systems', attendance: 84, grade: 'B+', trend: '+2.5%' },
    { subject: 'Machine Learning', attendance: 72, grade: 'A-', trend: '+1.2%' },
    { subject: 'Operating Systems', attendance: 98, grade: 'A', trend: '+0.5%' },
  ]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Molecule */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-600 p-2 rounded-lg shadow-lg shadow-purple-600/20">
                <BarChart3 size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Academic Progress</h1>
            </div>
            <p className="text-gray-400 font-medium">Detailed tracking of your attendance and academic standing.</p>
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-gray-800 border border-gray-700 px-4 py-2 rounded-xl text-sm font-bold text-gray-300 hover:text-white transition-all">
              <Calendar size={16} />
              Export Report
            </button>
          </div>
        </div>

        {/* Top Summary Organism */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
             <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-blue-900/20">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-4 text-center md:text-left">
                    <h2 className="text-2xl font-black text-white">Dean's List Eligible!</h2>
                    <p className="text-blue-100 text-sm max-w-sm">Your current GPA of 3.85 puts you in the top 5% of your class. Keep up the consistent attendance!</p>
                    <button className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-black text-sm hover:bg-blue-50 transition-all flex items-center gap-2 mx-auto md:mx-0">
                      View Certificate <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-8 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                     <div className="text-center">
                        <p className="text-[10px] font-bold text-blue-200 uppercase mb-1">Total Present</p>
                        <p className="text-3xl font-black text-white">142</p>
                     </div>
                     <div className="w-px h-10 bg-white/20"></div>
                     <div className="text-center">
                        <p className="text-[10px] font-bold text-blue-200 uppercase mb-1">Avg Grade</p>
                        <p className="text-3xl font-black text-white">A</p>
                     </div>
                  </div>
                </div>
                {/* Decorative SVG Shapes */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
             </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-3xl p-6 flex flex-col justify-between">
             <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">Target GPA</h3>
                <Info size={16} className="text-gray-500" />
             </div>
             <div className="my-6">
                <div className="flex items-end gap-2 mb-2">
                   <span className="text-4xl font-black text-white">3.90</span>
                   <span className="text-green-400 text-xs font-bold pb-1">+0.05 needed</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                   <div className="bg-blue-500 h-2 rounded-full w-[94%]"></div>
                </div>
             </div>
             <p className="text-[10px] text-gray-500 font-medium italic">Based on remaining credits for this term.</p>
          </div>
        </div>

        {/* Detailed Breakdown Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PieChart className="text-blue-500" size={20} />
              Subject Breakdown
            </h2>
            <div className="flex items-center gap-2">
               <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Excellent
               </span>
               <span className="flex items-center gap-1.5 text-xs text-gray-400 ml-4">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Critical
               </span>
            </div>
          </div>

          <PerformanceOverview data={academicData} />
        </section>

        {/* Recent Activity Log Molecule */}
        <div className="bg-gray-800/20 border border-gray-700 rounded-2xl p-6">
           <h3 className="text-white font-bold mb-4 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              Latest Attendance Logs
           </h3>
           <div className="space-y-3">
              {[
                { time: 'Today, 09:15 AM', subject: 'Advanced Algorithms', status: 'Present' },
                { time: 'Yesterday, 11:05 AM', subject: 'Database Systems', status: 'Present' },
              ].map((log, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/40 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-sm font-bold text-white">{log.subject}</p>
                      <p className="text-[10px] text-gray-500">{log.time}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-green-400 bg-green-400/10 px-2 py-1 rounded">
                    {log.status}
                  </span>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}