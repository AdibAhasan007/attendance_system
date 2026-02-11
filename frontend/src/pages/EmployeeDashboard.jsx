import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services/api';
import toast from 'react-hot-toast';
import { 
  LogOut, User, Calendar as CalendarIcon, 
  CheckCircle, AlertTriangle, XCircle, BarChart3,
  Home, Settings, Clock, TrendingUp, Users, HelpCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

const EmployeeDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todayLog, setTodayLog] = useState(null); 
  const [stats, setStats] = useState({ present: 0, late: 0, absent: 0 });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    loadHistory();
  }, []);

  // Recalculate stats whenever history updates
  useEffect(() => {
    if (history.length > 0) {
      calculateMonthlyStats(currentMonth);
      handleDateClick(new Date());
    }
  }, [history, currentMonth]);

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

  const getDateStatus = (date) => {
    const dateKey = formatDateKey(date);
    const log = history.find(l => l.date_only === dateKey);
    
    if (log) {
      const status = log.status ? log.status.toLowerCase() : "";
      if (status === 'late') return 'late';
      if (status === 'present') return 'present';
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    if (date < today && date.getDay() !== 0 && date.getDay() !== 6) {
      return 'absent';
    }
    return 'none';
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('company_id');
    navigate('/');
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    return days;
  };

  const previousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  if (!profile) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl font-semibold">Loading Profile...</div>
    </div>
  );

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const calendarDays = generateCalendarDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 font-sans">
      <div className="flex h-screen overflow-hidden">
        
        {/* ===== MODERN SIDEBAR ===== */}
        <div className="w-64 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col shadow-2xl">
          
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-700/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm truncate">{profile.name}</h3>
                <p className="text-xs text-blue-300 truncate">{profile.employee_id}</p>
              </div>
            </div>
            <div className="inline-block px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30 rounded-full text-xs font-bold uppercase">
              {profile.role}
            </div>
          </div>

          {/* Sidebar Menu */}
          <div className="flex-1 p-4 space-y-2 mt-4">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 rounded-xl border border-blue-500/30 text-blue-200 text-sm font-semibold flex items-center gap-3">
              <Home className="w-5 h-5" />
              Dashboard
            </div>
            <div className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm font-medium flex items-center gap-3 cursor-pointer transition rounded-lg hover:bg-slate-700/30">
              <BarChart3 className="w-5 h-5" />
              Analytics
            </div>
            <div className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm font-medium flex items-center gap-3 cursor-pointer transition rounded-lg hover:bg-slate-700/30">
              <Clock className="w-5 h-5" />
              Time Sheet
            </div>
            <div className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm font-medium flex items-center gap-3 cursor-pointer transition rounded-lg hover:bg-slate-700/30">
              <Settings className="w-5 h-5" />
              Settings
            </div>
            <div className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm font-medium flex items-center gap-3 cursor-pointer transition rounded-lg hover:bg-slate-700/30">
              <HelpCircle className="w-5 h-5" />
              Help
            </div>
          </div>

          {/* Stats Panel in Sidebar */}
          <div className="p-4 border-t border-slate-700/30">
            <div className="text-xs text-slate-400 uppercase font-bold mb-3">Monthly Stats</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Present</span>
                <span className="font-bold text-green-400 text-lg">{stats.present}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-400" /> Late</span>
                <span className="font-bold text-orange-400 text-lg">{stats.late}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> Absent</span>
                <span className="font-bold text-red-400 text-lg">{stats.absent}</span>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-700/30">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold py-2.5 rounded-lg transition border border-red-500/30 text-sm"
            >
              <LogOut size={16}/> Logout
            </button>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800/80 to-blue-800/80 backdrop-blur-xl border-b border-slate-700/50 px-8 py-6 flex items-center justify-between shadow-xl">
            <div>
              <h1 className="text-3xl font-black text-white">My Attendance</h1>
              <p className="text-sm text-blue-200 mt-1">Track your daily presence and performance</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-bold">Welcome back,</p>
              <p className="text-lg font-bold text-white">{profile.name}</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-8">
            <div className="grid grid-cols-3 gap-8 h-full">
              
              {/* ===== MODERN iPhone-STYLE CALENDAR ===== */}
              <div className="col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-600/50">
                  
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-8">
                    <button 
                      onClick={previousMonth}
                      className="p-2 hover:bg-slate-600/50 rounded-xl transition text-slate-300 hover:text-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-black text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {monthName}
                    </h2>
                    <button 
                      onClick={nextMonth}
                      className="p-2 hover:bg-slate-600/50 rounded-xl transition text-slate-300 hover:text-white"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Week Days Header */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                      <div key={day} className="text-center text-xs font-bold text-slate-400 py-2 uppercase tracking-wider">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((date, idx) => {
                      if (!date) {
                        return <div key={`empty-${idx}`} className="aspect-square"></div>;
                      }

                      const status = getDateStatus(date);
                      const isCurrentDay = isToday(date);
                      
                      let bgClass = 'bg-slate-700/30 text-slate-300 hover:bg-slate-600/50';
                      let borderClass = 'border border-slate-600/30';
                      let numberColor = 'text-slate-300';

                      if (isCurrentDay) {
                        bgClass = 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70';
                        borderClass = 'border border-slate-400/30';
                        numberColor = 'text-white';
                      } else if (status === 'present') {
                        numberColor = 'text-green-400 font-bold';
                        bgClass = 'bg-green-500/10 hover:bg-green-500/20 text-white';
                        borderClass = 'border border-green-500/30 hover:border-green-500/50';
                      } else if (status === 'late') {
                        numberColor = 'text-orange-400 font-bold';
                        bgClass = 'bg-orange-500/10 hover:bg-orange-500/20 text-white';
                        borderClass = 'border border-orange-500/30 hover:border-orange-500/50';
                      } else if (status === 'absent') {
                        numberColor = 'text-red-400 font-bold';
                        bgClass = 'bg-red-500/10 hover:bg-red-500/20 text-white';
                        borderClass = 'border border-red-500/30 hover:border-red-500/50';
                      }

                      return (
                        <button
                          key={date.toString()}
                          onClick={() => handleDateClick(date)}
                          className={`aspect-square rounded-2xl flex items-center justify-center font-bold transition-all cursor-pointer transform hover:scale-105 ${bgClass} ${borderClass}`}
                        >
                          <span className={numberColor}>{date.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Calendar Legend */}
                  <div className="mt-6 pt-6 border-t border-slate-600/30 flex gap-6 justify-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg"></div>
                      <span className="text-slate-300">Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-lg bg-green-500/30 border border-green-500/50"></div>
                      <span className="text-slate-300">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-lg bg-orange-500/30 border border-orange-500/50"></div>
                      <span className="text-slate-300">Late</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-lg bg-red-500/30 border border-red-500/50"></div>
                      <span className="text-slate-300">Absent</span>
                    </div>
                  </div>
                </div>

                {/* Details Card */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-600/50">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Details for {selectedDate.toLocaleDateString()}</h3>
                  {todayLog ? (
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${todayLog.status && todayLog.status.toLowerCase() === 'late' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                        {todayLog.status && todayLog.status.toLowerCase() === 'late' ? <AlertTriangle size={32}/> : <CheckCircle size={32}/>}
                      </div>
                      <div>
                        <h4 className="font-black text-2xl text-white">You were <span className={todayLog.status && todayLog.status.toLowerCase() === 'late' ? 'text-orange-400' : 'text-green-400'}>{todayLog.status}</span></h4>
                        <p className="text-slate-400 text-sm mt-1">
                          Check-in: <span className="font-bold text-slate-200">
                            {new Date(todayLog.check_in_time || todayLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-center py-8">No attendance record for this day.</p>
                  )}
                </div>
              </div>

              {/* ===== RIGHT SIDE: PERFORMANCE CARD ===== */}
              <div className="col-span-1 space-y-6">
                {/* Performance Score */}
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-blue-400/30 flex flex-col h-64">
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-6">Performance Score</h3>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative w-24 h-24 mb-4">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#334155" strokeWidth="8" />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke="url(#gradient)" 
                          strokeWidth="8"
                          strokeDasharray={`${(stats.present / (stats.present + stats.late + stats.absent || 1)) * 283} 283`}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-black text-white">
                          {stats.present + stats.late === 0 ? 0 : Math.round((stats.present / (stats.present + stats.late + Math.max(stats.absent, 1))) * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm text-center">Attendance Rate</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-5 border border-green-400/30 hover:border-green-400/50 transition">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Present Days</p>
                    <p className="text-3xl font-black text-green-400">{stats.present}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-xl rounded-2xl p-5 border border-orange-400/30 hover:border-orange-400/50 transition">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Late Arrivals</p>
                    <p className="text-3xl font-black text-orange-400">{stats.late}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 backdrop-blur-xl rounded-2xl p-5 border border-red-400/30 hover:border-red-400/50 transition">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Absent Days</p>
                    <p className="text-3xl font-black text-red-400">{stats.absent}</p>
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-600/50">
                  <p className="text-xs text-slate-400 font-bold uppercase mb-3">Current Month</p>
                  <p className="text-2xl font-black text-white mb-2">{monthName}</p>
                  <p className="text-xs text-slate-400">Total working days tracked</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EmployeeDashboard;
