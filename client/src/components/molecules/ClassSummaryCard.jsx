import React from 'react';
import { BookOpen, MoreVertical } from 'lucide-react';

/**
 * MOLECULE: ClassSummaryCard
 * Used primarily in the Faculty Dashboard to show class health metrics.
 * Added safety guards to prevent crashes if the course prop is undefined.
 */
const ClassSummaryCard = ({ course }) => {
  // Guard clause to prevent "Cannot read properties of undefined" errors
  if (!course) {
    return (
      <div className="bg-gray-800/20 border border-gray-800 border-dashed rounded-2xl p-6 flex items-center justify-center">
        <p className="text-gray-600 text-xs font-medium italic">Course data unavailable</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-blue-600/20 p-3 rounded-xl">
          <BookOpen className="text-blue-400" size={24} />
        </div>
        <button className="text-gray-500 hover:text-white transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
      
      <div className="mb-6">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          {course.code || 'CODE101'}
        </p>
        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
          {course.title || 'Untitled Course'}
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-gray-900/50 rounded-xl border border-gray-700/50">
          <p className="text-[9px] font-bold text-gray-500 uppercase">Enrollment</p>
          <p className="text-sm font-black text-white">{course.students_count ?? 0}</p>
        </div>
        <div className="text-center p-2 bg-gray-900/50 rounded-xl border border-gray-700/50">
          <p className="text-[9px] font-bold text-gray-500 uppercase">Attnd.</p>
          <p className="text-sm font-black text-green-400">{course.avg_attendance ?? '0'}%</p>
        </div>
        <div className="text-center p-2 bg-gray-900/50 rounded-xl border border-gray-700/50">
          <p className="text-[9px] font-bold text-gray-500 uppercase">Avg Grade</p>
          <p className="text-sm font-black text-white">{course.avg_grade || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default ClassSummaryCard;