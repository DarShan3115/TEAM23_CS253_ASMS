import React from 'react';
import { Clock } from 'lucide-react';
import Badge from '../atoms/Badge';

const AssignmentItem = ({ task, course, due, priority = 'Medium' }) => (
  <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-xl space-y-3 relative overflow-hidden group hover:border-orange-500/30 transition-all">
    {/* Decorative priority border */}
    <div className={`absolute left-0 top-0 bottom-0 w-1 ${priority === 'High' ? 'bg-red-500' : 'bg-blue-500'}`} />
    
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          {course || 'General'}
        </p>
        <h4 className="font-bold text-white text-sm mt-0.5">
          {task || 'Untitled Assignment'}
        </h4>
      </div>
      <Badge variant={priority?.toLowerCase()}>{priority}</Badge>
    </div>

    <div className="flex items-center text-[11px] text-gray-400">
      <Clock size={12} className="mr-1 text-gray-500" /> 
      <span>Due: {due || 'No deadline'}</span>
    </div>
  </div>
);

export default AssignmentItem;