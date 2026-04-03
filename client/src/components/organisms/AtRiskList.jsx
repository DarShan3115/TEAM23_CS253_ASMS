import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import RiskBadge from '../atoms/RiskBadge';

/**
 * ORGANISM: AtRiskList
 * Displays student performance alerts based on Analytics Service data.
 * Location: client/src/components/organisms/AtRiskList.jsx
 */
const AtRiskList = ({ students = [], loading }) => (
  <div className="bg-gray-800/30 border border-gray-700 rounded-2xl overflow-hidden">
    <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
      <h3 className="text-white font-bold text-sm flex items-center gap-2">
        <AlertTriangle className="text-yellow-500" size={16} />
        Performance Alerts
      </h3>
    </div>
    <div className="divide-y divide-gray-700/50 min-h-[200px]">
      {loading ? (
        <div className="flex flex-col items-center justify-center p-10 gap-3">
          <Loader2 className="animate-spin text-blue-500" size={24} />
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Analyzing Risk Patterns...</p>
        </div>
      ) : students.length > 0 ? (
        students.map((student, idx) => (
          <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-700/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-[10px] font-bold border border-blue-500/20">
                {student.name?.[0] || '?'}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{student.name || 'Anonymous Student'}</p>
                <p className="text-[10px] text-gray-500 font-medium">{student.reason || 'No details provided'}</p>
              </div>
            </div>
            <RiskBadge level={student.level} />
          </div>
        ))
      ) : (
        <div className="p-10 text-center text-gray-500 text-xs font-medium italic">
          No active alerts. All students are currently stable.
        </div>
      )}
    </div>
  </div>
);

export default AtRiskList;