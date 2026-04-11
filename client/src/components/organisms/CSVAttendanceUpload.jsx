import React, { useState } from 'react';
import { Upload, Calendar, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

export default function CSVAttendanceUpload({ courses }) {
  const [file, setFile] = useState(null);
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !courseId || !date) {
      setStatus({ type: 'error', message: 'Please provide course, date, and a CSV file.' });
      return;
    }

    const formData = new FormData();
    formData.append('course_id', courseId);
    formData.append('date', date);
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/attendance/mark/csv/', {
        method: 'POST',
        headers: {
          // Retrieve faculty user id dynamically from your auth state/localStorage
          'x-user-id': localStorage.getItem('userId') || ''
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: data.message || 'Attendance uploaded successfully!' });
        setFile(null); // Reset input state
        e.target.reset(); // Clear form
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to upload attendance.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error occurred during upload.' });
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Upload className="text-blue-500" size={24} />
        Bulk CSV Attendance Upload
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Upload a CSV file containing <code className="text-blue-400 bg-gray-900 px-1 rounded">student_id</code> and <code className="text-blue-400 bg-gray-900 px-1 rounded">status</code> (present/absent) headers to mark bulk attendance.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
              <BookOpen size={16} /> Course
            </label>
            <select
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">Select a Course</option>
              {courses?.map(course => (
                <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
              <Calendar size={16} /> Date
            </label>
            <input
              type="date"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 outline-none cursor-pointer"
          />
        </div>

        {status.message && (
          <div className={`p-3 rounded-xl flex items-center gap-2 text-sm font-bold ${status.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
            {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            {status.message}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Upload size={18} />
          Upload Attendance
        </button>
      </form>
    </div>
  );
}