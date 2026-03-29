import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import SubjectStatCard from '../molecules/SubjectStatCard';

/**
 * ORGANISM: PerformanceOverview
 * Renders a collection of SubjectStatCards.
 */
const PerformanceOverview = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="bg-gray-800/10 border border-gray-700 border-dashed rounded-3xl p-12 text-center">
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No performance data available yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((item, idx) => (
        <SubjectStatCard key={idx} {...item} />
      ))}
    </div>
  );
};

export default PerformanceOverview;