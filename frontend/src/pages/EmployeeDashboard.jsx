import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services/api';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; 
import { 
  LogOut, User, Calendar as CalendarIcon, CheckCircle, AlertTriangle, 
  XCircle, BarChart3, TrendingUp, Award, Clock, Sparkles
} from 'lucide-react';

const EmployeeDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todayLog, setTodayLog] = useState(null); 
  const [stats, setStats] = useState({ present: 0, late: 0, absent: 0 });

  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    loadHistory();
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      calculateMonthlyStats(new Date());
      handleDateClick(new Date());
    }
  }, [history]);

  const loadProfile = async () => {
    try {
      const res = await employeeService.getProfile();
      setProfile(res.data);
    } catch (err) {
      toast.error("Session expired");
      navigate('/');
    }
  };

  const loadHistory = async () => {
    try {
      const res = await employeeService.getHistory();
      
      const uniqueMap = new Map();
      res.data.forEach(log => {
        if (!uniqueMap.has(log.date_only)) {
          uniqueMap.set(log.date_only, log);
        }
      });
      
      const uniqueHistory = Array.from(uniqueMap.values());
      setHistory(uniqueHistory);

    } catch (err) {
      console.error("Failed to load history");
    }
  };

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateKey = formatDateKey(date);
    const log = history.find(h => h.date_only === dateKey);
    setTodayLog(log || null);
  };

  const calculateMonthlyStats = (referenceDate) => {
    const viewYear = referenceDate.getFullYear();
    const viewMonth = referenceDate.getMonth();

    const thisMonthLogs = history.filter(log => {
      if (!log.date_only) return false;
      const [y, m, d] = log.date_only.split('-').map(Number);
      return (m - 1) === viewMonth && y === viewYear;
    });

    let presentCount = 0;
    let lateCount = 0;

    thisMonthLogs.forEach(l => {
        const status = l.status ? l.status.toLowerCase() : "";
        if (status === 'late') lateCount++;
        else if (status === 'present') presentCount++;
    });

    let workingDaysCount = 0;
    const now = new Date();
    
    const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const limitDay = isCurrentMonth ? now.getDate() : daysInMonth;

    for (let i = 1; i <= limitDay; i++) {
      const dayCheck = new Date(viewYear, viewMonth, i);
      const dayOfWeek = dayCheck.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDaysCount++;
      }
    }

    const totalAttended = presentCount + lateCount;
    const absentCount = Math.max(0, workingDaysCount - totalAttended);

    setStats({ present: presentCount, late: lateCount, absent: absentCount });
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateKey = formatDateKey(date); 
      const today = new Date();
      today.setHours(0,0,0,0);

      const log = history.find(l => l.date_only === dateKey);
      
      if (log) {
        const isLate = log.status && log.status.toLowerCase() === 'late';
        return isLate 
          ? 'bg-orange-100 text-orange-600 font-bold rounded-lg hover:bg-orange-200' 
          : 'bg-green-100 text-green-600 font-bold rounded-lg hover:bg-green-200';
      }

      if (date < today && date.getDay() !== 0 && date.getDay() !== 6) {
        return 'bg-red-50 text-red-400 rounded-lg';
      }
    }
    return null;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!profile) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-purple-600 font-semibold">Loading your profile...</p>
      </div>
    </div>
  );

  const attendanceScore = stats.present + stats.late > 0 
    ? Math.round((stats.present / (stats.present + stats.late + stats.absent)) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 md:p-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-300/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-300/20 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/80 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl border border-white/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
                  <User size={40} className="text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                  <CheckCircle size={16} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-1">{profile.name}</h1>
                <p className="text-slate-500 font-mono text-sm mb-2">{profile.employee_id}</p>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-700 font-bold text-sm uppercase tracking-wide">{profile.role}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl transition-all transform hover:scale-105 flex items-center gap-3"
            >
              <LogOut size={20}/> 
              <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats */}
          <div className="space-y-6">
            {/* Performance Score */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500 to-pink-500 p-8 rounded-3xl shadow-2xl border border-white/20 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6" />
                <h3 className="text-lg font-bold">Performance Score</h3>
              </div>
              <div className="relative pt-4">
                <div className="text-6xl font-black mb-2">{attendanceScore}%</div>
                <p className="text-purple-100 text-sm">This Month</p>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="backdrop-blur-xl bg-white/80 p-6 rounded-3xl shadow-2xl border border-white/50">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-800">Monthly Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-xl">
                      <CheckCircle size={20} className="text-white" />
                    </div>
                    <span className="font-semibold text-slate-700">Present</span>
                  </div>
                  <div className="text-3xl font-black text-green-600">{stats.present}</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500 rounded-xl">
                      <AlertTriangle size={20} className="text-white" />
                    </div>
                    <span className="font-semibold text-slate-700">Late</span>
                  </div>
                  <div className="text-3xl font-black text-orange-600">{stats.late}</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500 rounded-xl">
                      <XCircle size={20} className="text-white" />
                    </div>
                    <span className="font-semibold text-slate-700">Absent</span>
                  </div>
                  <div className="text-3xl font-black text-red-600">{stats.absent}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Calendar & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar */}
            <div className="backdrop-blur-xl bg-white/80 p-8 rounded-3xl shadow-2xl border border-white/50">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <CalendarIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Attendance Calendar</h2>
                </div>
                <div className="flex gap-4 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span> 
                    <span className="text-slate-600">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span> 
                    <span className="text-slate-600">Late</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-400 rounded-full"></span> 
                    <span className="text-slate-600">Absent</span>
                  </div>
                </div>
              </div>
              <div className="calendar-wrapper modern-calendar">
                <Calendar 
                  onChange={handleDateClick} 
                  onActiveStartDateChange={({ activeStartDate }) => calculateMonthlyStats(activeStartDate)}
                  value={selectedDate} 
                  tileClassName={getTileClassName} 
                  className="w-full border-none font-sans"
                />
              </div>
            </div>

            {/* Selected Date Details */}
            <div className="backdrop-blur-xl bg-white/80 p-8 rounded-3xl shadow-2xl border border-white/50">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-800">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
              </div>
              {todayLog ? (
                <div className={`p-6 rounded-2xl border-2 ${
                  todayLog.status && todayLog.status.toLowerCase() === 'late' 
                    ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300' 
                    : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-2xl ${
                      todayLog.status && todayLog.status.toLowerCase() === 'late' 
                        ? 'bg-orange-500' 
                        : 'bg-green-500'
                    }`}>
                      {todayLog.status && todayLog.status.toLowerCase() === 'late' 
                        ? <AlertTriangle size={32} className="text-white" /> 
                        : <CheckCircle size={32} className="text-white" />
                      }
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-slate-800 mb-2">
                        Status: {todayLog.status}
                      </h4>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock size={16} />
                        <span className="font-mono font-bold text-lg">
                          {new Date(todayLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <XCircle size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">No attendance record for this day</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modern-calendar {
          font-family: inherit;
        }
        .modern-calendar .react-calendar {
          border-radius: 1rem;
          padding: 1rem;
        }
        .modern-calendar .react-calendar__tile {
          padding: 1rem;
          border-radius: 0.75rem;
          transition: all 0.2s;
        }
        .modern-calendar .react-calendar__tile:hover {
          transform: scale(1.05);
        }
        .modern-calendar .react-calendar__tile--now {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: bold;
        }
        .modern-calendar .react-calendar__month-view__days__day--weekend {
          color: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default EmployeeDashboard;
