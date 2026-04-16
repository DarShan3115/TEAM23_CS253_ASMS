import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import api from '../services/api';

const ACADEMIC_API = import.meta.env.VITE_ACADEMIC_API_URL || '/api/academic';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const START_HOUR = 8;
const END_HOUR = 19; // 7 PM
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

export default function TimetablePage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.get(`${ACADEMIC_API}/timetable/`);
        setSchedule(res.data || []);
      } catch (err) {
        console.error("Could not load timetable", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  // Helper to parse "08:30:00" to decimal hours relative to START_HOUR (e.g., 0.5)
  const getOffset = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h + m / 60) - START_HOUR;
  };

  const getDuration = (start, end) => {
    return getOffset(end) - getOffset(start);
  };

  if (loading) {
    return <div className="p-10 font-bold text-white animate-pulse">Synchronizing Timetable...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-6">
        <div className="p-3 bg-blue-600/10 text-blue-500 rounded-xl border border-blue-500/20">
          <Calendar size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Weekly Timetable</h1>
          <p className="text-sm text-zinc-400 mt-1">Your comprehensive class and lab schedule</p>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex">
          {/* Time Gutter */}
          <div className="w-20 shrink-0 border-r border-zinc-800 bg-zinc-900/50">
            <div className="h-12 border-b border-zinc-800"></div> {/* Header empty space */}
            {HOURS.slice(0, -1).map(hour => (
              <div key={hour} className="h-20 border-b border-zinc-800/50 flex items-start justify-center pt-2">
                <span className="text-xs font-bold text-zinc-500">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </span>
              </div>
            ))}
          </div>

          {/* Days Columns */}
          <div className="flex-1 flex overflow-x-auto">
            {DAYS.map(day => {
              const dayEvents = schedule.filter(s => s.day === day);
              return (
                <div key={day} className="flex-1 min-w-[200px] border-r border-zinc-800 last:border-r-0 relative bg-zinc-950">
                  {/* Day Header */}
                  <div className="h-12 border-b border-zinc-800 flex items-center justify-center bg-zinc-900/80 sticky top-0 z-10">
                    <span className="text-sm font-bold text-white">{day}</span>
                  </div>

                  {/* Grid Lines */}
                  <div className="relative w-full" style={{ height: `${(END_HOUR - START_HOUR) * 80}px` }}>
                    {HOURS.slice(0, -1).map(hour => (
                      <div key={hour} className="absolute w-full h-20 border-b border-zinc-800/20" style={{ top: `${(hour - START_HOUR) * 80}px` }}></div>
                    ))}

                    {/* Events */}
                    {dayEvents.map(ev => {
                      const top = getOffset(ev.start_time) * 80;
                      const height = getDuration(ev.start_time, ev.end_time) * 80;
                      
                      // Determine visual styling based on type
                      let bgClass = "bg-green-600/20 border-green-500 text-green-300";
                      let headerClass = "bg-green-600 font-bold text-white";
                      if (ev.type === 'Lab' || ev.type === 'Prc') {
                         bgClass = "bg-purple-600/20 border-purple-500 text-purple-300";
                         headerClass = "bg-purple-600 font-bold text-white";
                      } else if (ev.type === 'Tut') {
                         bgClass = "bg-amber-600/20 border-amber-500 text-amber-300";
                         headerClass = "bg-amber-600 font-bold text-white";
                      }

                      return (
                        <div 
                          key={ev.id} 
                          className={`absolute w-[94%] left-[3%] rounded-lg border shadow-lg overflow-hidden flex flex-col hover:scale-[1.01] transition-transform z-20 ${bgClass}`}
                          style={{ top: `${top}px`, height: `${height}px` }}
                        >
                          <div className={`px-2 py-1 text-[10px] uppercase tracking-wider flex justify-between items-center ${headerClass}`}>
                            <span>{ev.start_time.slice(0,5)} - {ev.end_time.slice(0,5)}</span>
                            <span className="opacity-80">{ev.type}</span>
                          </div>
                          <div className="p-2 flex-1">
                            <h3 className="text-xs font-bold truncate text-white">{ev.course_code}</h3>
                            <p className="text-[10px] opacity-80 mt-1 line-clamp-2">{ev.course_title}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
