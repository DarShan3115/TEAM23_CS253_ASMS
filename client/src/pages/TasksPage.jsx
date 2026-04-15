import React, { useState } from 'react';
import { CheckSquare, Calendar as CalendarIcon, Filter, Plus, CalendarDays, Save } from 'lucide-react';

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('checklist');
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Read Chapter 4', date: '2024-02-15', time: '14:00', tag: 'CS253', isCompleted: false },
    { id: 2, title: 'Upload Assignment 1', date: '2024-02-16', time: '23:59', tag: 'CSO220', isCompleted: true },
    { id: 3, title: 'Buy Groceries', date: '2024-02-17', time: '', tag: 'Personal', isCompleted: false },
  ]);
  const [filterText, setFilterText] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const handleNewTask = () => {
    const newTask = { id: Date.now(), title: '', date: '', time: '', tag: '', isCompleted: false, isNew: true };
    setTasks([newTask, ...tasks]);
    setActiveTab('checklist');
  };

  const handleSaveTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isNew: false } : t));
  };

  const handleCancelTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleTaskChange = (id, field, value) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const toggleSort = () => {
    if (!sortConfig.key) setSortConfig({ key: 'date', direction: 'asc' });
    else if (sortConfig.direction === 'asc') setSortConfig({ key: 'date', direction: 'desc' });
    else setSortConfig({ key: null, direction: 'asc' });
  };

  const displayedTasks = tasks.filter(task => {
    if (task.isNew) return true; // Keep editing tasks visible regardless of active filter
    if (!filterText) return true;
    const lower = filterText.toLowerCase();
    return task.title.toLowerCase().includes(lower) || task.tag.toLowerCase().includes(lower);
  }).sort((a, b) => {
    if (a.isNew) return -1; // Keep editing tasks pinned to top
    if (b.isNew) return 1;
    if (!sortConfig.key) return 0;
    
    const aVal = a[sortConfig.key] || '';
    const bVal = b[sortConfig.key] || '';
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
        <div>
           <h1 className="text-3xl font-black text-white flex items-center gap-3">
             <CheckSquare className="text-blue-500" /> Task Management
           </h1>
           <p className="text-zinc-400 mt-2 font-medium">Organize your assignments and personal workflow.</p>
        </div>
        <button 
           onClick={handleNewTask} 
           className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-500 flex items-center gap-2">
           <Plus size={18} /> New Task
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4">
         <button onClick={() => setActiveTab('checklist')} className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'checklist' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Checklist</button>
         <button onClick={() => setActiveTab('calendar')} className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'calendar' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Calendar Timeline</button>
         <button onClick={() => setActiveTab('schedule')} className={`px-4 py-2 font-bold rounded-lg ${activeTab === 'schedule' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Class Schedule</button>
      </div>

      {/* Content Area */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl min-h-[500px]">
         {activeTab === 'checklist' && (
           <div className="p-0">
              <div className="flex justify-between p-4 border-b border-zinc-800 bg-zinc-950 rounded-t-2xl">
                 <div className="relative">
                    <input type="text" placeholder="Filter tasks by name or tag..." value={filterText} onChange={e => setFilterText(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg px-4 py-2 w-64 outline-none focus:border-blue-500" />
                 </div>
                 <button 
                    onClick={toggleSort} 
                    className="flex items-center gap-2 text-zinc-400 hover:text-white bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700 text-sm font-bold">
                    <Filter size={16} /> {sortConfig.key ? `Sort: Date (${sortConfig.direction === 'asc' ? '↑' : '↓'})` : 'Sort/Filter'}
                 </button>
              </div>
              <table className="w-full text-left">
                 <thead>
                   <tr className="text-zinc-500 text-xs font-bold uppercase tracking-wider border-b border-zinc-800 bg-zinc-900">
                     <th className="p-4 w-12"></th>
                     <th className="p-4">Task Name</th>
                     <th className="p-4">Deadline (Date)</th>
                     <th className="p-4">Deadline (Time)</th>
                     <th className="p-4">Tags</th>
                     <th className="p-4 w-16"></th>
                   </tr>
                 </thead>
                 <tbody className="text-white divide-y divide-zinc-800/50">
                    {displayedTasks.map(task => (
                      <tr key={task.id} className={`hover:bg-zinc-800/50 transition-colors ${task.isCompleted ? 'opacity-50' : ''}`}>
                      <tr 
                         key={task.id} 
                         className={`hover:bg-zinc-800/50 transition-colors ${task.isCompleted ? 'opacity-50' : ''}`}
                         onBlur={(e) => {
                           if (task.isNew && !e.currentTarget.contains(e.relatedTarget)) {
                             handleCancelTask(task.id);
                           }
                         }}
                         onKeyDown={(e) => {
                           if (task.isNew && e.key === 'Escape') handleCancelTask(task.id);
                           else if (task.isNew && e.key === 'Enter') handleSaveTask(task.id);
                         }}
                      >
                         <td className="p-4">
                            <input 
                              type="checkbox" 
                              checked={task.isCompleted} 
                              onChange={() => toggleTask(task.id)}
                              className="w-5 h-5 rounded border-zinc-700 text-blue-600 focus:ring-blue-500 bg-zinc-900 cursor-pointer"
                            />
                         </td>
                         <td className={`p-4 font-bold ${task.isCompleted ? 'line-through text-zinc-500' : ''}`}>
                           {task.isNew ? (
                             <input type="text" placeholder="Task name..." value={task.title} onChange={e => handleTaskChange(task.id, 'title', e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-white text-sm outline-none focus:border-blue-500" autoFocus />
                           ) : task.title}
                         </td>
                         <td className="p-4 text-zinc-400 font-mono text-sm">
                           {task.isNew ? (
                             <input type="date" value={task.date} onChange={e => handleTaskChange(task.id, 'date', e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-white text-sm outline-none focus:border-blue-500" />
                           ) : (task.date || '--')}
                         </td>
                         <td className="p-4 text-zinc-400 font-mono text-sm">
                           {task.isNew ? (
                             <input type="time" value={task.time} onChange={e => handleTaskChange(task.id, 'time', e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-white text-sm outline-none focus:border-blue-500" />
                           ) : (task.time || '--')}
                         </td>
                         <td className="p-4">
                           {task.isNew ? (
                             <input type="text" placeholder="Tag..." value={task.tag} onChange={e => handleTaskChange(task.id, 'tag', e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-white text-sm outline-none focus:border-blue-500" />
                           ) : (
                             <span className="bg-blue-900/30 text-blue-400 border border-blue-800/50 px-2 py-1 rounded-md text-xs font-black uppercase tracking-wider">
                               #{task.tag || 'None'}
                             </span>
                           )}
                         </td>
                         <td className="p-4">
                           {task.isNew && (
                             <button onClick={() => handleSaveTask(task.id)} className="p-1.5 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white rounded-lg transition-colors border border-green-700/50" title="Save Task">
                               <Save size={16} />
                             </button>
                           )}
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
         )}

         {activeTab === 'calendar' && (
            <div className="flex flex-col items-center justify-center py-32 text-zinc-500">
               <CalendarDays size={48} className="mb-4 opacity-50" />
               <h3 className="text-xl font-bold text-white">Calendar View</h3>
               <p className="max-w-md text-center mt-2">The Gantt/Calendar mapping logic will natively plot the tasks seen in the Checklist directly onto here in a later build pass.</p>
            </div>
         )}
         
         {activeTab === 'schedule' && (
            <div className="flex flex-col items-center justify-center py-32 text-zinc-500">
               <CalendarIcon size={48} className="mb-4 opacity-50" />
               <h3 className="text-xl font-bold text-white">Weekly Schedule Grid</h3>
               <p className="max-w-md text-center mt-2">Connected to the Academic Django Service to plot your class times visually.</p>
            </div>
         )}
      </div>
    </div>
  );
}
