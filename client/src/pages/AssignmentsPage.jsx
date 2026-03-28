import React, { useState, useEffect } from 'react';
import TaskWorkspace from '../components/organisms/TaskWorkspace';
import PriorityTag from '../components/atoms/PriorityTag';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ExternalLink,
  Upload,
  Calendar as CalendarIcon
} from 'lucide-react';

export default function AssignmentsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);

  // Mock data representing state from Productivity Service (Go)
  const [tasks] = useState([
    { id: 1, title: 'Neural Network Architecture Design', course: 'Machine Learning', dueDate: 'Oct 30, 2023', postedAt: 'Oct 20', priority: 'High', status: 'Pending' },
    { id: 2, title: 'B-Tree Indexing Implementation', course: 'Database Systems', dueDate: 'Nov 02, 2023', postedAt: 'Oct 22', priority: 'Medium', status: 'Pending' },
    { id: 3, title: 'Process Scheduling Analysis', course: 'Operating Systems', dueDate: 'Oct 25, 2023', postedAt: 'Oct 15', priority: 'High', status: 'Submitted' },
    { id: 4, title: 'Greedy Algorithms Problem Set', course: 'Advanced Algorithms', dueDate: 'Oct 18, 2023', postedAt: 'Oct 10', priority: 'Low', status: 'Submitted' },
  ]);

  const filteredTasks = tasks.filter(t => 
    activeFilter === 'All' || t.status === activeFilter
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Molecule */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-600/20">
                <ClipboardList size={24} className="text-white" />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">Task Workspace</h1>
            </div>
            <p className="text-gray-400 font-medium">Manage your assignments and academic deliverables.</p>
          </div>

          <div className="flex bg-gray-800 p-1.5 rounded-2xl border border-gray-700">
            {['All', 'Pending', 'Submitted'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeFilter === filter 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main List Column */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Active Assignments
                <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded-full text-gray-500">{filteredTasks.length}</span>
              </h2>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-white transition-colors"><Search size={18} /></button>
                <button className="p-2 text-gray-500 hover:text-white transition-colors"><Filter size={18} /></button>
              </div>
            </div>
            
            <TaskWorkspace tasks={filteredTasks} onSelect={setSelectedTask} />
          </div>

          {/* Side Context Column */}
          <div className="space-y-6">
            <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl space-y-4">
              <h4 className="text-blue-400 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                <AlertCircle size={16} />
                Submission Tip
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Ensure your files are in <strong>PDF format</strong> unless specified otherwise. Submit before 11:59 PM to avoid late penalties.
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-3xl p-6">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                Next Deadline
              </h4>
              <div className="space-y-4">
                <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-700">
                  <p className="text-[10px] font-black text-gray-500 uppercase">2 Days Left</p>
                  <h5 className="text-sm font-bold text-white mt-1">Neural Network Design</h5>
                  <div className="mt-3 w-full bg-gray-800 rounded-full h-1.5">
                    <div className="bg-red-500 h-1.5 rounded-full w-4/5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action / Modal Overlay Placeholder */}
        {selectedTask && (
          <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95">
              <div className="flex justify-between items-start">
                <div>
                  <PriorityTag priority={selectedTask.priority} />
                  <h2 className="text-2xl font-black text-white mt-2">{selectedTask.title}</h2>
                  <p className="text-gray-500 text-sm">{selectedTask.course}</p>
                </div>
                <button onClick={() => setSelectedTask(null)} className="text-gray-500 hover:text-white">&times;</button>
              </div>

              <div className="space-y-4">
                <div className="p-6 border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center text-center group hover:border-blue-500/50 transition-colors cursor-pointer">
                  <div className="bg-gray-800 p-4 rounded-full mb-3 group-hover:bg-blue-600/10 transition-colors">
                    <Upload size={32} className="text-gray-600 group-hover:text-blue-500" />
                  </div>
                  <p className="text-sm font-bold text-white">Upload your solution</p>
                  <p className="text-[10px] text-gray-500 mt-1">Drag & drop or click to browse files</p>
                </div>
                <textarea 
                  className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Add a comment or submission link..."
                  rows="3"
                ></textarea>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-600/20">
                Submit Assignment
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}