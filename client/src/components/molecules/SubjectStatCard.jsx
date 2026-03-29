import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import CircularProgress from '../atoms/CircularProgress';

/**
 * MOLECULE: SubjectStatCard
 * Used in Academic Progress to show specific course metrics.
 * Location: client/src/components/molecules/SubjectStatCard.jsx
 */
const SubjectStatCard = ({ subject, attendance = 0, grade = 'N/A', trend = '0%' }) => {
  const isWarning = attendance < 75;

  return (
    <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">
            {subject || 'Course Module'}
          </h3>
          <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-tighter">Current Semester</p>
        </div>
        <CircularProgress 
          percentage={attendance} 
          color={isWarning ? 'red' : attendance > 90 ? 'green' : 'blue'} 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Grade</p>
          <p className="text-lg font-black text-white">{grade}</p>
        </div>
        <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Trend</p>
          <div className="flex items-center gap-1 text-green-400 font-bold">
            <TrendingUp size={14} />
            <span className="text-sm">{trend}</span>
          </div>
        </div>
      </div>

      {isWarning && (
        <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-500/10 p-2 rounded-lg text-[11px] font-medium">
          <AlertCircle size={14} />
          Low attendance warning!
        </div>
      )}
    </div>
  );
};

export default SubjectStatCard;