import React from 'react';
import { BookOpen, User, Award, ArrowRight } from 'lucide-react';

/**
 * COURSE GRID ORGANISM
 * Displays a responsive grid of available courses for students to browse and enroll in.
 */
const CourseGrid = ({ courses = [], onEnroll, enrolledIds = [] }) => {
  // Safety check to ensure courses is always an array before calling .map()
  if (!Array.isArray(courses)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800">
        <BookOpen className="text-gray-700 mb-4" size={48} />
        <p className="text-gray-500 font-medium">No course data available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => {
        // Fallback for ID if it's missing to prevent key errors
        const courseId = course?.id || Math.random().toString(36).substr(2, 9);
        const isEnrolled = enrolledIds.includes(courseId);

        return (
          <div 
            key={courseId} 
            className="bg-gray-800/40 border border-gray-700 rounded-3xl p-6 hover:border-blue-500/50 transition-all group flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="bg-blue-600/10 p-3 rounded-2xl">
                <BookOpen className="text-blue-500" size={24} />
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-900 px-2 py-1 rounded-md">
                {course?.code || 'CS101'}
              </span>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-white leading-tight mb-2 group-hover:text-blue-400 transition-colors">
                {course?.title || "Untitled Course"}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                {course?.description || "No description provided for this course module."}
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <User size={14} className="text-gray-600" />
                  <span>Instructor: {course?.instructor_name || 'TBD'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <Award size={14} className="text-gray-600" />
                  <span>Credits: {course?.credits || 4} Units</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <button
                onClick={() => !isEnrolled && onEnroll && onEnroll(courseId)}
                disabled={isEnrolled}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  isEnrolled 
                    ? 'bg-green-600/10 text-green-500 cursor-default' 
                    : 'bg-white text-gray-900 hover:bg-blue-500 hover:text-white shadow-lg'
                }`}
              >
                {isEnrolled ? (
                  <>Already Enrolled</>
                ) : (
                  <>
                    Enroll Now <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CourseGrid;