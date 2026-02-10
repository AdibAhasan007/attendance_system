import React, { useState, useEffect } from 'react';
import { companyService } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
  Building2, Users, MapPin, History, LogOut, Trash2, Power, UserCheck, 
  ShieldAlert, Fingerprint, Lock, Settings, Clock, X, Crosshair, Plus,
  TrendingUp, Zap, Calendar as CalIcon, Target, Globe
} from 'lucide-react';

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('staff'); 
  const [employees, setEmployees] = useState([]);
  const [devices, setDevices] = useState([]); 
  
  const [newEmp, setNewEmp] = useState({ employee_id: '', name: '', password: '', role: 'Staff' });
  const [manualAtt, setManualAtt] = useState({ employee_id: '', type: 'check_in', date: '', time: '' });
  
  const [settings, setSettings] = useState({ lat: '', lng: '', radius: '50' });
  const [schedule, setSchedule] = useState({ start: '09:00', end: '17:00' });

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadEmployees();
    loadDevices(); 
  }, []);

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      await companyService.updateSchedule(schedule.start, schedule.end);
      toast.success("Work Schedule Updated 🕒");
    } catch (err) { toast.error("Failed to update schedule"); }
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    try {
      await companyService.updateLocation(settings.lat, settings.lng, settings.radius);
      toast.success("Office Location Updated 📍");
    } catch (err) { toast.error("Failed to update location"); }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSettings({
          ...settings,
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString()
        });
        toast.success("Location Fetched!");
      },
      () => toast.error("Unable to retrieve your location")
    );
  };

  const loadEmployees = async () => {
    try {
      const res = await companyService.getEmployees();
      setEmployees(res.data.filter(e => !e.deleted_at)); 
    } catch (err) { toast.error("Failed to load staff"); }
  };
  
  const loadDevices = async () => {
    try {
      const res = await companyService.getDevices();
      setDevices(res.data);
    } catch (err) { console.error("No devices found"); }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await companyService.addEmployee(newEmp);
      toast.success("Employee Added");
      loadEmployees();
      setNewEmp({ employee_id: '', name: '', password: '', role: 'Staff' });
    } catch (err) { toast.error("Failed to add"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Remove this employee?")) return;
    try {
      await companyService.deleteEmployee(id);
      toast.success("Employee Removed");
      loadEmployees();
    } catch (err) { toast.error("Delete failed"); }
  };

  const handleToggleStatus = async (emp) => {
    const newStatus = emp.status === 'suspended' ? 'active' : 'suspended';
    try {
      await companyService.updateEmployee(emp.id, { status: newStatus });
      toast.success(`User ${newStatus}`);
      loadEmployees();
    } catch (err) { toast.error("Status update failed"); }
  };

  const handleManualAttendance = async (e) => {
    e.preventDefault();
    try {
      const timestamp = new Date(`${manualAtt.date}T${manualAtt.time}`).toISOString();
      await companyService.markAttendance({
        employee_id: manualAtt.employee_id,
        type: manualAtt.type,
        timestamp: timestamp
      });
      toast.success("Attendance Marked!");
    } catch (err) { toast.error("Failed to mark attendance"); }
  };

  const handleEmergencyOpen = async (deviceId) => {
    if(!window.confirm("⚠️ EMERGENCY: Open this door remotely?")) return;
    try {
      await companyService.emergencyOpen(deviceId, "Admin Remote Open");
      toast.success("Door Unlock Command Sent 🔓");
    } catch (err) { toast.error("Command Failed"); }
  };
  
  const openHistory = async (emp) => {
    setSelectedEmp(emp);
    setShowCalendar(true);
    setAttendanceHistory([]); 
    try {
      const res = await companyService.getEmployeeHistory(emp.employee_id);
      setAttendanceHistory(res.data);
    } catch (err) {
      toast.error("Could not fetch history");
    }
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dayLogs = attendanceHistory.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate.getDate() === date.getDate() &&
               logDate.getMonth() === date.getMonth() &&
               logDate.getFullYear() === date.getFullYear();
      });

      if (dayLogs.length > 0) {
        const isLate = dayLogs.some(log => log.status === 'Late');
        return isLate ? 'bg-orange-100 text-orange-600 font-bold' : 'bg-green-100 text-green-600 font-bold';
      }
    }
    return null;
  };

  const tabs = [
    { key: 'staff', label: 'Staff Management', icon: Users, gradient: 'from-blue-500 to-cyan-500' },
    { key: 'control', label: 'Control Center', icon: ShieldAlert, gradient: 'from-amber-500 to-orange-500' },
    { key: 'settings', label: 'Office Settings', icon: Settings, gradient: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 md:p-8">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/80 rounded-3xl p-6 mb-8 shadow-2xl border border-white/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800">Company Portal</h1>
              <p className="text-slate-500 text-sm font-medium">Manage your workforce efficiently</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="backdrop-blur-md bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-5 py-2 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-slate-600 font-medium">{employees.length} Employees</span>
              </div>
            </div>
            <button 
              onClick={() => { localStorage.clear(); navigate('/'); }} 
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
            >
              <LogOut size={18}/> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)} 
              className={`relative whitespace-nowrap px-6 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 ${
                activeTab === tab.key 
                  ? 'bg-white text-slate-800 shadow-2xl scale-105' 
                  : 'bg-white/50 text-slate-600 hover:bg-white/80'
              }`}
            >
              <Icon className={`w-5 h-5 ${activeTab === tab.key ? 'text-blue-600' : 'text-slate-400'}`} />
              {tab.label}
              {activeTab === tab.key && (
                <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} opacity-10 rounded-2xl`}></div>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: STAFF MANAGEMENT */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Staff Form */}
          <div className="backdrop-blur-xl bg-white/80 p-8 rounded-3xl shadow-2xl border border-white/50 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Add New Staff</h2>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Employee ID</label>
                <input 
                  placeholder="e.g. EMP01" 
                  className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" 
                  value={newEmp.employee_id} 
                  onChange={e => setNewEmp({...newEmp, employee_id: e.target.value})} 
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Full Name</label>
                <input 
                  placeholder="John Doe" 
                  className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" 
                  value={newEmp.name} 
                  onChange={e => setNewEmp({...newEmp, name: e.target.value})} 
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Password</label>
                <input 
                  placeholder="••••••••" 
                  type="password" 
                  className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" 
                  value={newEmp.password} 
                  onChange={e => setNewEmp({...newEmp, password: e.target.value})} 
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Role</label>
                <select 
                  className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" 
                  value={newEmp.role} 
                  onChange={e => setNewEmp({...newEmp, role: e.target.value})}
                >
                  <option value="Staff">Office Staff</option>
                  <option value="Marketing">Field Marketing</option>
                </select>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Register Employee
              </button>
            </form>
          </div>

          {/* Staff List */}
          <div className="lg:col-span-2 backdrop-blur-xl bg-white/80 p-6 rounded-3xl shadow-2xl border border-white/50">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-800">Employee Directory</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="p-4 text-slate-600 font-bold">ID</th>
                    <th className="p-4 text-slate-600 font-bold">Name</th>
                    <th className="p-4 text-slate-600 font-bold">Status</th>
                    <th className="p-4 text-slate-600 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors">
                      <td className="p-4">
                        <code className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono text-xs font-bold">{emp.employee_id}</code>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">{emp.name}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          emp.status === 'suspended' 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          {emp.status || 'active'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openHistory(emp)} 
                            className="p-2 rounded-xl text-blue-600 bg-blue-100 hover:bg-blue-200 transition-all" 
                            title="View Calendar"
                          >
                            <History size={18}/>
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(emp)} 
                            title={emp.status === 'suspended' ? "Activate" : "Suspend"}
                            className={`p-2 rounded-xl transition-all ${
                              emp.status === 'suspended' 
                                ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                                : 'text-amber-600 bg-amber-100 hover:bg-amber-200'
                            }`}
                          >
                            {emp.status === 'suspended' ? <UserCheck size={18}/> : <Power size={18}/>}
                          </button>
                          <button 
                            onClick={() => handleDelete(emp.id)} 
                            className="p-2 rounded-xl text-red-600 bg-red-100 hover:bg-red-200 transition-all"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTROL CENTER */}
      {activeTab === 'control' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manual Attendance */}
          <div className="backdrop-blur-xl bg-white/80 p-8 rounded-3xl shadow-2xl border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <Fingerprint className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Manual Attendance Entry</h2>
            </div>
            <form onSubmit={handleManualAttendance} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Employee ID</label>
                <input 
                  className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="e.g. EMP01" 
                  onChange={e => setManualAtt({...manualAtt, employee_id: e.target.value})} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" 
                    onChange={e => setManualAtt({...manualAtt, date: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">Time</label>
                  <input 
                    type="time" 
                    className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" 
                    onChange={e => setManualAtt({...manualAtt, time: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    value="check_in" 
                    defaultChecked 
                    onChange={() => setManualAtt({...manualAtt, type: 'check_in'})} 
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-medium text-slate-700">Check In</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    value="check_out" 
                    onChange={() => setManualAtt({...manualAtt, type: 'check_out'})} 
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-medium text-slate-700">Check Out</span>
                </label>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg">
                Submit Attendance
              </button>
            </form>
          </div>

          {/* Emergency Door Control */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-3xl shadow-2xl border-2 border-red-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl animate-pulse">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-red-800">Emergency Door Control</h2>
            </div>
            <div className="space-y-3">
              {devices.length === 0 ? (
                <p className="text-slate-500 italic text-center py-8">No devices configured.</p>
              ) : (
                devices.map(dev => (
                  <div key={dev.id} className="bg-white border-2 border-red-200 p-5 rounded-2xl flex justify-between items-center hover:shadow-lg transition-shadow">
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{dev.device_type}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-1">UID: {dev.device_uid}</p>
                    </div>
                    <button 
                      onClick={() => handleEmergencyOpen(dev.id)} 
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all transform hover:scale-105"
                    >
                      UNLOCK
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Schedule */}
          <div className="backdrop-blur-xl bg-white/80 p-8 rounded-3xl shadow-2xl border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Work Schedule</h2>
            </div>
            <form onSubmit={handleSaveSchedule} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Office Start Time</label>
                <input 
                  type="time" 
                  className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  value={schedule.start} 
                  onChange={e => setSchedule({...schedule, start: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Office End Time</label>
                <input 
                  type="time" 
                  className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  value={schedule.end} 
                  onChange={e => setSchedule({...schedule, end: e.target.value})} 
                  required 
                />
              </div>
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg">
                Update Schedule
              </button>
            </form>
          </div>

          {/* Location */}
          <div className="backdrop-blur-xl bg-white/80 p-8 rounded-3xl shadow-2xl border border-white/50">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Office Location</h2>
              </div>
              <button 
                type="button" 
                onClick={handleGetLocation} 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold text-sm shadow-lg transition-all"
              >
                <Crosshair size={16}/> Detect
              </button>
            </div>
            
            <form onSubmit={handleSaveLocation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">Latitude</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:outline-none transition-colors font-mono text-sm"
                    value={settings.lat} 
                    onChange={e => setSettings({...settings, lat: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">Longitude</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:outline-none transition-colors font-mono text-sm"
                    value={settings.lng} 
                    onChange={e => setSettings({...settings, lng: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Geofence Radius (Meters)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    value={settings.radius} 
                    onChange={e => setSettings({...settings, radius: e.target.value})} 
                    required 
                  />
                  <Target className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                </div>
                <p className="text-xs text-slate-400 mt-1">Acceptable distance from office center</p>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg">
                Update Location
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl relative animate-scale-in">
            <button 
              onClick={() => setShowCalendar(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-all"
            >
              <X size={24}/>
            </button>
            
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                  <CalIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{selectedEmp?.name}</h2>
              </div>
              <p className="text-slate-500 text-sm ml-11">Attendance History</p>
            </div>

            <div className="calendar-container mb-6">
              <Calendar 
                tileClassName={getTileClassName}
                className="w-full border-none shadow-none rounded-xl"
              />
            </div>

            <div className="flex gap-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-600 rounded"></div>
                <span className="text-sm font-medium text-slate-600">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 border-2 border-orange-600 rounded"></div>
                <span className="text-sm font-medium text-slate-600">Late</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CompanyDashboard;
