import React from 'react';
import { BookOpen, User, CheckCircle2, ArrowRight, Award } from 'lucide-react';
import CreditBadge from '../atoms/CreditBadge';

/**
 * MOLECULE: CourseCard
 * Used in the Course Catalog for student enrollments.
 * Includes safety guards to prevent crashes if course data is missing.
 */
const CourseCard = ({ course, isEnrolled, onEnroll, loading }) => {
  // Guard clause to prevent "Cannot read properties of undefined"
  if (!course) {
    return (
      <div className="bg-gray-800/20 border border-gray-800 border-dashed rounded-2xl p-5 h-48 flex items-center justify-center">
        <p className="text-gray-600 text-xs font-medium italic">Course loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 hover:border-blue-500/50 transition-all group flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-blue-600/20 p-2.5 rounded-xl group-hover:bg-blue-600 transition-colors">
          <BookOpen className="text-blue-400 group-hover:text-white" size={20} />
        </div>
        <CreditBadge credits={course.credits} />
      </div>

      <div className="flex-1">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          {course.code || 'UNKN101'}
        </p>
        <h3 className="text-lg font-bold text-white mt-1 group-hover:text-blue-400 transition-colors leading-snug">
          {course.title || 'Untitled Course'}
        </h3>
        <div className="flex items-center gap-2 mt-3 text-gray-400">
          <User size={14} className="text-gray-500" />
          <span className="text-sm font-medium">{course.instructor_name || 'Staff'}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700 flex items-center justify-between">
        {isEnrolled ? (
          <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
            <CheckCircle2 size={16} />
            Enrolled
          </div>
        ) : (
          <button 
            onClick={() => onEnroll && onEnroll(course.id)}
            disabled={loading}
            className="flex items-center gap-2 text-blue-400 hover:text-white font-bold text-sm transition-colors group/btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Enroll Now'}
            {!loading && <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;