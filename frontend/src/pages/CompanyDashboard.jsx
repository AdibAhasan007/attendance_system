import React, { useState, useEffect } from 'react';
import { companyService } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, Settings as SettingsIcon, LogOut, 
  Trash2, Power, UserCheck, Plus, Edit2, X, MapPin,
  Clock, Home, BarChart3, Zap, ChevronDown, Save, AlertCircle, 
  Trophy, TrendingUp, HelpCircle, Fingerprint, Lock, Crosshair
} from 'lucide-react';


const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('staff');
  const [employees, setEmployees] = useState([]);
  const [devices, setDevices] = useState([]);
  const [newEmp, setNewEmp] = useState({ employee_id: '', name: '', password: '', role: 'Staff' });
  const [manualAtt, setManualAtt] = useState({ employee_id: '', type: 'check_in', date: '', time: '' });
  const [settings, setSettings] = useState({ lat: '', lng: '', radius: '50' });
  const [schedule, setSchedule] = useState({ start: '09:00', end: '17:00' });
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadEmployees();
    loadDevices();
  }, []);

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
    if (!newEmp.employee_id || !newEmp.name || !newEmp.password) {
      toast.error("All fields required");
      return;
    }
    try {
      await companyService.addEmployee(newEmp);
      toast.success("✅ Employee Added Successfully!");
      loadEmployees();
      setNewEmp({ employee_id: '', name: '', password: '', role: 'Staff' });
      setShowAddForm(false);
    } catch (err) { toast.error("Failed to add employee"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
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
      toast.success(`✅ User ${newStatus}`);
      loadEmployees();
    } catch (err) { toast.error("Status update failed"); }
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!settings.lat || !settings.lng) {
      toast.error("Please fill location fields");
      return;
    }
    try {
      await companyService.updateLocation(settings.lat, settings.lng, settings.radius);
      toast.success("✅ Location Updated!");
    } catch (err) { toast.error("Failed to update location"); }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSettings({
          ...settings,
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString()
        });
        toast.success("✅ Location detected!");
      },
      () => toast.error("Unable to get location")
    );
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!schedule.start || !schedule.end) {
      toast.error("Please set work hours");
      return;
    }
    try {
      await companyService.updateSchedule(schedule.start, schedule.end);
      toast.success("✅ Schedule Updated!");
    } catch (err) { toast.error("Failed to update schedule"); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('company_id');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 font-sans">
      <div className="flex h-screen overflow-hidden">
        
        {/* ===== MODERN SIDEBAR ===== */}
        <div className="w-64 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col shadow-2xl">
          
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-700/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Admin Panel</h3>
                <p className="text-xs text-cyan-300">Company Management</p>
              </div>
            </div>
          </div>

          {/* Sidebar Menu */}
          <div className="flex-1 p-4 space-y-2 mt-4">
            {[
              { id: 'staff', label: 'Staff Management', icon: Users },
              { id: 'control', label: 'Control Center', icon: Zap },
              { id: 'settings', label: 'Settings', icon: SettingsIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-4 py-3 text-left rounded-xl font-semibold text-sm transition-all flex items-center gap-3 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-white border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-t border-slate-700/30 space-y-3">
            <div className="text-xs text-slate-400 uppercase font-bold mb-3">Quick Stats</div>
            <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/30">
              <p className="text-xs text-slate-400 mb-1">Total Staff</p>
              <p className="text-2xl font-bold text-blue-400">{employees.length}</p>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/30">
              <p className="text-xs text-slate-400 mb-1">Active Devices</p>
              <p className="text-2xl font-bold text-purple-400">{devices.length}</p>
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
              <h1 className="text-3xl font-black text-white">Company Admin</h1>
              <p className="text-sm text-blue-200 mt-1">Manage your workforce and operations</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-bold">Administrator</p>
              <p className="text-lg font-bold text-white">Portal</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-8">
            
            {/* ===== STAFF TAB ===== */}
            {activeTab === 'staff' && (
              <div className="space-y-6">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus size={20} /> Add New Employee
                </button>

                {showAddForm && (
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-600/50">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                      <UserCheck className="text-cyan-400" /> Add New Employee
                    </h3>
                    <form onSubmit={handleAddEmployee} className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Employee ID</label>
                        <input
                          type="text"
                          placeholder="EMP001"
                          value={newEmp.employee_id}
                          onChange={(e) => setNewEmp({...newEmp, employee_id: e.target.value})}
                          className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={newEmp.name}
                          onChange={(e) => setNewEmp({...newEmp, name: e.target.value})}
                          className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={newEmp.password}
                          onChange={(e) => setNewEmp({...newEmp, password: e.target.value})}
                          className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Role</label>
                        <select
                          value={newEmp.role}
                          onChange={(e) => setNewEmp({...newEmp, role: e.target.value})}
                          className="w-full bg-slate-700/50 border border-slate-600 text-white p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition"
                        >
                          <option>Staff</option>
                          <option>Manager</option>
                          <option>Supervisor</option>
                          <option>Marketing</option>
                        </select>
                      </div>
                      <div className="col-span-2 flex gap-4">
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-xl transition-all"
                        >
                          Add Employee
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Employees Table */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-600/50">
                  <div className="p-6 border-b border-slate-600/30">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Users className="text-cyan-400" /> Team Members ({employees.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-700/50 border-b border-slate-600/30">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Employee ID</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Status</th>
                          <th className="px-6 py-3 text-center text-xs font-bold text-slate-300 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-600/30">
                        {employees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-slate-700/30 transition">
                            <td className="px-6 py-4 text-sm font-mono text-cyan-400">{emp.employee_id}</td>
                            <td className="px-6 py-4 text-sm text-white font-semibold">{emp.name}</td>
                            <td className="px-6 py-4 text-sm text-slate-300">{emp.role}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                emp.status === 'active' 
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}>
                                {emp.status === 'active' ? '🟢 Active' : '🔴 Suspended'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleToggleStatus(emp)}
                                  className={`p-2 rounded-lg transition ${
                                    emp.status === 'active'
                                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                  }`}
                                  title={emp.status === 'active' ? 'Suspend' : 'Activate'}
                                >
                                  <Power size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(emp.id)}
                                  className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
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

            {/* ===== CONTROL CENTER TAB ===== */}
            {activeTab === 'control' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-600/50">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Zap className="text-yellow-400" /> Hardware Devices ({devices.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {devices.length > 0 ? (
                      devices.map((device) => (
                        <div key={device.id} className="bg-slate-700/50 border border-slate-600/30 rounded-xl p-4 flex items-center justify-between hover:border-slate-600/50 transition">
                          <div>
                            <p className="font-bold text-white">{device.device_uid}</p>
                            <p className="text-sm text-slate-400">{device.device_type} • {device.location}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              device.active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                            }`}>
                              {device.active ? '🟢 Online' : '🔴 Offline'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-8">No devices configured yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ===== SETTINGS TAB ===== */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                
                {/* Location Settings */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-600/50">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <MapPin className="text-red-400" /> Office Location & Geofence
                  </h3>
                  <form onSubmit={handleSaveLocation} className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Latitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          placeholder="23.8103"
                          value={settings.lat}
                          onChange={(e) => setSettings({...settings, lat: e.target.value})}
                          className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Longitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          placeholder="90.4125"
                          value={settings.lng}
                          onChange={(e) => setSettings({...settings, lng: e.target.value})}
                          className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Radius (meters)</label>
                      <input
                        type="number"
                        placeholder="50"
                        value={settings.radius}
                        onChange={(e) => setSettings({...settings, radius: e.target.value})}
                        className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all"
                      >
                        Auto-Detect Location
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Save size={18} /> Save Location
                      </button>
                    </div>
                  </form>
                </div>

                {/* Work Schedule Settings */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-600/50">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Clock className="text-blue-400" /> Work Schedule
                  </h3>
                  <form onSubmit={handleSaveSchedule} className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Work Start Time</label>
                        <input
                          type="time"
                          value={schedule.start}
                          onChange={(e) => setSchedule({...schedule, start: e.target.value})}
                          className="w-full bg-slate-700/50 border border-slate-600 text-white p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Work End Time</label>
                        <input
                          type="time"
                          value={schedule.end}
                          onChange={(e) => setSchedule({...schedule, end: e.target.value})}
                          className="w-full bg-slate-700/50 border border-slate-600 text-white p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={18} /> Save Work Schedule
                    </button>
                  </form>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
