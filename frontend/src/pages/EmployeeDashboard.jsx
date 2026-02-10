import React, { useState, useEffect } from 'react';
import { employeeService } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
  User, LogOut, MapPin, Clock, Calendar as CalIcon, TrendingUp, Award, 
  Target, CheckCircle, XCircle, Zap, Menu, Activity, Star
} from 'lucide-react';

const EmployeeDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profRes, attRes] = await Promise.all([
        employeeService.getProfile(),
        employeeService.getAttendance()
      ]);
      setProfile(profRes.data);
      setAttendance(attRes.data);
    } catch (err) {
      toast.error("Failed to load data");
    }
  };

  const handleCheckIn = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await employeeService.checkIn(position.coords.latitude, position.coords.longitude);
          toast.success("✅ Checked In Successfully!");
          loadData();
        } catch (err) {
          toast.error(err.response?.data?.detail || "Check-in failed");
        }
      },
      () => toast.error("Unable to get location")
    );
  };

  const handleCheckOut = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await employeeService.checkOut(position.coords.latitude, position.coords.longitude);
          toast.success("👋 Checked Out Successfully!");
          loadData();
        } catch (err) {
          toast.error(err.response?.data?.detail || "Check-out failed");
        }
      },
      () => toast.error("Unable to get location")
    );
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dayLogs = attendance.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate.getDate() === date.getDate() &&
               logDate.getMonth() === date.getMonth() &&
               logDate.getFullYear() === date.getFullYear();
      });

      if (dayLogs.length > 0) {
        const isLate = dayLogs.some(log => log.status === 'Late');
        return isLate ? 'bg-orange-100 text-orange-600 font-bold border-2 border-orange-300' : 'bg-green-100 text-green-600 font-bold border-2 border-green-300';
      }
    }
    return null;
  };

  const totalPresent = attendance.filter(a => a.type === 'check_in').length;
  const totalLate = attendance.filter(a => a.status === 'Late').length;
  const attendanceRate = attendance.length > 0 ? Math.round((totalPresent / 30) * 100) : 0;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-emerald-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-80' : 'w-20'} bg-gradient-to-b from-[#00755e] to-emerald-800 text-white transition-all duration-300 flex flex-col shadow-2xl`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <User className="w-6 h-6" />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-black text-lg">AttendancePro</h2>
                <p className="text-xs text-emerald-200">Employee Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Profile Card */}
        {sidebarOpen && profile && (
          <div className="p-6 border-b border-white/10">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-[#00755e] rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-black text-white">{profile.name?.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{profile.name}</h3>
                  <p className="text-xs text-emerald-200">ID: {profile.employee_id}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-emerald-300" />
                  <span className="text-emerald-100">Role: {profile.role || 'Staff'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-emerald-300" />
                  <span className="text-emerald-100">Status: Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {sidebarOpen && (
          <div className="flex-1 p-6 space-y-4">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <h4 className="text-sm font-semibold text-emerald-200">Attendance Rate</h4>
              </div>
              <p className="text-4xl font-black text-white mb-2">{attendanceRate}%</p>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-400 to-emerald-300 rounded-full h-3 transition-all duration-500" style={{ width: `${attendanceRate}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs text-emerald-200">Present</span>
                </div>
                <p className="text-2xl font-black text-white">{totalPresent}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-orange-300" />
                  <span className="text-xs text-emerald-200">Late</span>
                </div>
                <p className="text-2xl font-black text-white">{totalLate}</p>
              </div>
            </div>
          </div>
        )}

        {/* Toggle & Logout */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => { localStorage.clear(); navigate('/'); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-800 mb-1">My Attendance</h1>
                <p className="text-slate-500 text-sm">Track your presence and performance</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="backdrop-blur-md bg-gradient-to-r from-[#00755e]/10 to-emerald-500/10 px-5 py-3 rounded-xl border border-[#00755e]/20">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#00755e]" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Performance Score</p>
                      <p className="text-2xl font-black text-[#00755e]">{attendanceRate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Check In/Out Actions */}
          <div className="backdrop-blur-xl bg-white/80 p-8 rounded-3xl shadow-xl border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-[#00755e] to-emerald-600 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleCheckIn} 
                className="w-full bg-gradient-to-r from-[#00755e] to-emerald-600 hover:from-emerald-700 hover:to-[#00755e] text-white font-bold py-5 rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-3"
              >
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg">Check In</span>
              </button>

              <button 
                onClick={handleCheckOut} 
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-5 rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-3"
              >
                <Clock className="w-6 h-6" />
                <span className="text-lg">Check Out</span>
              </button>
            </div>

            {/* Quick Info */}
            <div className="mt-8 space-y-3">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-[#00755e]" />
                  <span className="text-slate-600 font-medium">Location tracking enabled</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-600 font-medium">Auto-sync with company records</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="backdrop-blur-xl bg-white/80 p-8 rounded-3xl shadow-xl border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-[#00755e] to-emerald-600 rounded-xl">
                <CalIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Attendance Calendar</h2>
            </div>

            <div className="calendar-container mb-6">
              <Calendar 
                tileClassName={getTileClassName}
                className="w-full border-none shadow-none rounded-xl"
              />
            </div>

            <div className="flex gap-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-100 border-2 border-green-600 rounded-md"></div>
                <span className="text-sm font-semibold text-slate-600">On Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-orange-100 border-2 border-orange-600 rounded-md"></div>
                <span className="text-sm font-semibold text-slate-600">Late</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 backdrop-blur-xl bg-white/80 p-8 rounded-3xl shadow-xl border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-[#00755e] to-emerald-600 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="p-4 text-slate-600 font-bold">Date & Time</th>
                    <th className="p-4 text-slate-600 font-bold">Type</th>
                    <th className="p-4 text-slate-600 font-bold">Status</th>
                    <th className="p-4 text-slate-600 font-bold">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.slice(0, 10).map((log, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-emerald-50/50 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-slate-800">{new Date(log.timestamp).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          log.type === 'check_in'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {log.type === 'check_in' ? '→ Check In' : '← Check Out'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          log.status === 'Late'
                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          {log.status || 'On Time'}
                        </span>
                      </td>
                      <td className="p-4">
                        <code className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">
                          {log.latitude?.toFixed(4)}, {log.longitude?.toFixed(4)}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
