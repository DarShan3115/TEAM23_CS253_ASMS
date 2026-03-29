import React from 'react';
import { FileText, Clock, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import PriorityTag from '../atoms/PriorityTag';
import StatusChip from '../atoms/StatusChip';

/**
 * MOLECULE: TaskItem
 * Detailed task entry for the Assignments Workspace.
 * Location: client/src/components/molecules/TaskItem.jsx
 */
const TaskItem = ({ task, onSelect }) => {
  if (!task) return null;

  return (
    <div 
      onClick={() => onSelect && onSelect(task)}
      className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-500/50 hover:bg-gray-800/60 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-4 flex-1">
        <div className="bg-gray-900 p-3 rounded-xl border border-gray-700 group-hover:scale-110 transition-transform">
          <FileText className="text-blue-400" size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              {task.course || 'General'}
            </p>
            <PriorityTag priority={task.priority} />
          </div>
          <h3 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">
            {task.title || 'New Task'}
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
              <Clock size={14} className="text-gray-600" />
              <span>Due: {task.dueDate || 'TBD'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
              <CalendarIcon size={14} className="text-gray-600" />
              <span>Posted: {task.postedAt || 'Recently'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <StatusChip status={task.status} />
        <div className="text-gray-600 group-hover:text-blue-400 transition-colors">
          <ExternalLink size={20} />
        </div>
      </div>
    </div>
  );
};

export default TaskItem;