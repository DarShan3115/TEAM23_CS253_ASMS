import React from 'react';
import { MoreVertical } from 'lucide-react';

/**
 * MOLECULE: StatCard
 * Displays a single metric with an icon and contextual background.
 */
const StatCard = ({ label, value, icon: Icon, color, bg, loading }) => (
  <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl hover:border-gray-600 transition-colors">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${bg}`}>
        {Icon && <Icon className={color} size={24} />}
      </div>
      <MoreVertical size={20} className="text-gray-500 cursor-pointer" />
    </div>
    <p className="text-gray-400 text-sm font-medium">{label}</p>
    {loading ? (
      <div className="h-8 w-24 bg-gray-700 animate-pulse rounded mt-1" />
    ) : (
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    )}
  </div>
);

export default StatCard;