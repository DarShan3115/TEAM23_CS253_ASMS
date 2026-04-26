import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  CheckCircle, Clock, User, FileText, Send, 
  ChevronLeft, Award, Loader2 
} from 'lucide-react';

const PRODUCTIVITY_API = '/api/productivity/v1';

export default function FacultyGradingPage({ assignmentId, onBack }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [gradeInput, setGradeInput] = useState({ grade: '', feedback: '' });

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get(`${PRODUCTIVITY_API}/assignments/${assignmentId}/submissions`);
        setSubmissions(res.data);
      } catch (err) {
        console.error("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    if (assignmentId) fetchSubmissions();
  }, [assignmentId]);

  const handleGradeSubmit = async () => {
    if (!selectedSub) return;
    try {
      await api.put(`${PRODUCTIVITY_API}/submissions/${selectedSub.id}/grade`, {
        grade: parseFloat(gradeInput.grade),
        feedback: gradeInput.feedback
      });
      setSubmissions(submissions.map(s => 
        s.id === selectedSub.id ? { ...s, grade: gradeInput.grade, feedback: gradeInput.feedback } : s
      ));
      setSelectedSub(null);
    } catch (err) {
      console.error("Grading failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-black text-white">Submissions</h1>
            {loading ? (
              <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : submissions.map(sub => (
              <div 
                key={sub.id}
                onClick={() => { setSelectedSub(sub); setGradeInput({ grade: sub.grade || '', feedback: sub.feedback || '' }); }}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedSub?.id === sub.id ? 'bg-blue-600/10 border-blue-500' : 'bg-gray-800 border-gray-700'}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold">{sub.student_id?.[0]}</div>
                    <div>
                      <p className="font-bold text-white">Student ID: {sub.student_id.substring(0, 8)}...</p>
                      <p className="text-xs text-gray-500">Submitted: {new Date(sub.submitted_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {sub.grade ? <span className="text-green-400 font-black">{sub.grade}%</span> : <span className="text-yellow-500 text-[10px] font-bold uppercase">Pending</span>}
                </div>
              </div>
            ))}
          </div>

          {selectedSub && (
            <div className="w-full md:w-96 bg-gray-800 border border-gray-700 rounded-3xl p-8 sticky top-8">
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2"><Award className="text-blue-500" />Grade Task</h3>
              <div className="space-y-4">
                <input type="number" value={gradeInput.grade} onChange={(e) => setGradeInput({...gradeInput, grade: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none" placeholder="Score (0-100)"/>
                <textarea value={gradeInput.feedback} onChange={(e) => setGradeInput({...gradeInput, feedback: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white outline-none" rows="4" placeholder="Feedback..."/>
                <button onClick={handleGradeSubmit} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black transition-all">Submit Grade</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}