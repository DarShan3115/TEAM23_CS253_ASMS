import React from 'react';
import { 
  ClipboardList, 
  FileText, 
  Clock, 
  Calendar as CalendarIcon, 
  ExternalLink 
} from 'lucide-react';
import TaskItem from '../molecules/TaskItem';

/**
 * ORGANISM: TaskWorkspace
 * Manages the layout and rendering of task lists in the Assignments view.
 */
const TaskWorkspace = ({ tasks = [], onSelect }) => (
  <div className="space-y-4">
    {tasks.length > 0 ? (
      tasks.map(task => (
        <TaskItem key={task.id} task={task} onSelect={onSelect} />
      ))
    ) : (
      <div className="py-24 text-center flex flex-col items-center bg-gray-800/20 border border-gray-700 border-dashed rounded-3xl">
        <ClipboardList size={48} className="text-gray-700 mb-4 opacity-50" />
        <h3 className="text-white font-bold text-xl">No active assignments</h3>
        <p className="text-gray-500 text-sm mt-1">You're all caught up for the current semester!</p>
      </div>
    )}
  </div>
);

export default TaskWorkspace;