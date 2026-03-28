import React, { useState } from 'react';
import { X, Calendar, Flag, AlignLeft, Send } from 'lucide-react';
import axios from 'axios';

/**
 * ORGANISM: CreateAssignmentModal
 * Interactive form for Faculty to publish new tasks to the Productivity Service.
 */
export default function CreateAssignmentModal({ courseId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Medium'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user?.id) throw new Error("Unauthorized");

      await axios.post('http://localhost:8080/api/v1/tasks', {
        ...formData,
        course_id: courseId
      }, {
        headers: { 
          'x-auth-token': token, 
          'x-user-id': user.id 
        }
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      alert("Error creating assignment. Please check your connection.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600/10 p-2 rounded-lg text-blue-500"><Send size={20} /></div>
             <h2 className="text-2xl font-black text-white tracking-tight">New Assignment</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Title</label>
            <input 
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="e.g., Midterm Project"
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Due Date</label>
              <input 
                type="date"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                onChange={e => setFormData({...formData, due_date: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Priority</label>
              <select 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                onChange={e => setFormData({...formData, priority: e.target.value})}
                defaultValue="Medium"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Instructions</label>
            <textarea 
              rows="4"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              placeholder="Describe the task and submission requirements..."
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20">
            Publish Assignment
          </button>
        </form>
      </div>
    </div>
  );
}