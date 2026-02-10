import React, { useState, useEffect } from 'react';
import { superAdminService } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Server, Shield, LogOut, Trash2, Settings, Edit2, Power, X, Check, Plus, 
  Building2, Zap, Activity, Users, ShieldAlert, Menu, BarChart3, Lock 
} from 'lucide-react';

const SuperDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [hardware, setHardware] = useState([]);
  const [newCo, setNewCo] = useState({ name: '', admin_username: '', admin_pass: '', plan: 'basic', hardware_type: 'ESP32' });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('companies');
  
  // Track editing states
  const [editingHw, setEditingHw] = useState(null); 
  const [editingCo, setEditingCo] = useState(null);
  const [tempName, setTempName] = useState("");

  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [coRes, hwRes] = await Promise.all([
        superAdminService.getCompanies(),
        superAdminService.getHardware()
      ]);
      setCompanies(coRes.data.filter(c => c.status !== 'deleted'));
      setHardware(hwRes.data);
    } catch (err) { toast.error("Failed to load data"); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await superAdminService.createCompany(newCo);
      toast.success("Company Created!");
      loadData();
      setNewCo({ name: '', admin_username: '', admin_pass: '', plan: 'basic', hardware_type: 'ESP32' });
    } catch (err) { toast.error(err.response?.data?.detail || "Error"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Permanently delete? This cannot be undone.")) return;
    try {
      await superAdminService.deleteCompany(id);
      toast.success("Company Deleted");
      loadData();
    } catch (err) { toast.error("Delete failed"); }
  };

  const handleSuspend = async (id) => {
    try {
      await superAdminService.suspendCompany(id);
      toast.success("Company Suspended");
      loadData();
    } catch (err) { toast.error("Suspend failed"); }
  };

  const handleActivate = async (id) => {
    try {
      await superAdminService.activateCompany(id);
      toast.success("Company Activated");
      loadData();
    } catch (err) { toast.error("Activate failed"); }
  };

  const startRename = (co) => {
    setEditingCo(co.id);
    setTempName(co.name);
  };

  const saveRename = async (id) => {
    if(!tempName.trim()) return;
    try {
      await superAdminService.renameCompany(id, tempName.trim());
      toast.success("Company Renamed");
      loadData();
      setEditingCo(null);
    } catch (err) { toast.error("Rename failed"); }
  };

  const cancelRename = () => { setEditingCo(null); setTempName(""); };

  const startHwEdit = (hw) => {
    setEditingHw({ id: hw.id, device_type: hw.device_type, device_uid: hw.device_uid, company_id: hw.company_id });
  };

  const saveHwEdit = async () => {
    if(!editingHw.device_type || !editingHw.device_uid) return;
    try {
      await superAdminService.updateHardware(editingHw.id, {
        device_type: editingHw.device_type,
        device_uid: editingHw.device_uid,
        company_id: editingHw.company_id
      });
      toast.success("Hardware Updated");
      loadData();
      setEditingHw(null);
    } catch (err) { toast.error("Update failed"); }
  };

  const cancelHwEdit = () => { setEditingHw(null); };

  const menuItems = [
    { key: 'companies', label: 'Companies', icon: Building2 },
    { key: 'hardware', label: 'Hardware', icon: Server },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-gradient-to-b from-[#00755e] to-emerald-900 text-white transition-all duration-300 flex flex-col shadow-2xl border-r border-white/10`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Shield className="w-6 h-6" />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-black text-lg">AttendancePro</h2>
                <p className="text-xs text-emerald-200">Super Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.key
                    ? 'bg-white text-[#00755e] shadow-lg font-bold'
                    : 'hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Stats */}
        {sidebarOpen && (
          <div className="p-4 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-200">Total Companies</span>
                <span className="text-2xl font-black">{companies.length}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white rounded-full h-2" style={{ width: '85%' }}></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-200">Hardware Units</span>
                <span className="text-lg font-bold">{hardware.length}</span>
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
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white mb-1">
                  {menuItems.find(m => m.key === activeTab)?.label}
                </h1>
                <p className="text-emerald-200 text-sm">Centralized system control</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="backdrop-blur-md bg-white/10 px-5 py-3 rounded-xl border border-white/20">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-300" />
                    <div>
                      <p className="text-xs text-emerald-200 font-medium">System Status</p>
                      <p className="text-lg font-black text-white">ACTIVE</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* TAB: COMPANIES */}
        {activeTab === 'companies' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Company Form */}
            <div className="backdrop-blur-xl bg-white/10 p-8 rounded-3xl shadow-xl border border-white/20 h-fit">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-[#00755e] to-emerald-500 rounded-xl">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">New Company</h2>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-emerald-200 mb-2 block">Company Name</label>
                  <input 
                    placeholder="Acme Corp" 
                    className="w-full bg-white/20 border-2 border-white/30 text-white placeholder-white/50 p-3 rounded-xl focus:border-[#00755e] focus:bg-white/30 focus:outline-none transition-colors" 
                    value={newCo.name} 
                    onChange={e => setNewCo({...newCo, name: e.target.value})} 
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-emerald-200 mb-2 block">Admin Username</label>
                  <input 
                    placeholder="admin@acme" 
                    className="w-full bg-white/20 border-2 border-white/30 text-white placeholder-white/50 p-3 rounded-xl focus:border-[#00755e] focus:bg-white/30 focus:outline-none transition-colors" 
                    value={newCo.admin_username} 
                    onChange={e => setNewCo({...newCo, admin_username: e.target.value})} 
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-emerald-200 mb-2 block">Admin Password</label>
                  <input 
                    placeholder="••••••••" 
                    type="password" 
                    className="w-full bg-white/20 border-2 border-white/30 text-white placeholder-white/50 p-3 rounded-xl focus:border-[#00755e] focus:bg-white/30 focus:outline-none transition-colors" 
                    value={newCo.admin_pass} 
                    onChange={e => setNewCo({...newCo, admin_pass: e.target.value})} 
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-emerald-200 mb-2 block">Plan</label>
                    <select 
                      className="w-full bg-white/20 border-2 border-white/30 text-white p-3 rounded-xl focus:border-[#00755e] focus:bg-white/30 focus:outline-none transition-colors"
                      value={newCo.plan} 
                      onChange={e => setNewCo({...newCo, plan: e.target.value})}
                    >
                      <option value="basic" className="bg-slate-800">Basic</option>
                      <option value="premium" className="bg-slate-800">Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-emerald-200 mb-2 block">Hardware</label>
                    <select 
                      className="w-full bg-white/20 border-2 border-white/30 text-white p-3 rounded-xl focus:border-[#00755e] focus:bg-white/30 focus:outline-none transition-colors"
                      value={newCo.hardware_type} 
                      onChange={e => setNewCo({...newCo, hardware_type: e.target.value})}
                    >
                      <option value="ESP32" className="bg-slate-800">ESP32</option>
                      <option value="Arduino" className="bg-slate-800">Arduino</option>
                    </select>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-[#00755e] to-emerald-500 hover:from-emerald-600 hover:to-[#00755e] text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  Create Company
                </button>
              </form>
            </div>

            {/* Companies List */}
            <div className="lg:col-span-2 backdrop-blur-xl bg-white/10 p-6 rounded-3xl shadow-xl border border-white/20">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-emerald-300" />
                <h2 className="text-xl font-bold text-white">Registered Companies</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-white/20">
                      <th className="p-4 text-emerald-200 font-bold">ID</th>
                      <th className="p-4 text-emerald-200 font-bold">Company Name</th>
                      <th className="p-4 text-emerald-200 font-bold">Status</th>
                      <th className="p-4 text-emerald-200 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map(co => (
                      <tr key={co.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <code className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded font-mono text-xs font-bold">#{co.id}</code>
                        </td>
                        <td className="p-4">
                          {editingCo === co.id ? (
                            <div className="flex gap-2">
                              <input 
                                className="bg-white/20 border-2 border-white/30 text-white px-3 py-1 rounded-lg focus:border-[#00755e] focus:outline-none" 
                                value={tempName} 
                                onChange={e => setTempName(e.target.value)} 
                              />
                              <button onClick={() => saveRename(co.id)} className="text-green-400 hover:text-green-300">
                                <Check size={18}/>
                              </button>
                              <button onClick={cancelRename} className="text-red-400 hover:text-red-300">
                                <X size={18}/>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{co.name}</span>
                              <button onClick={() => startRename(co)} className="text-emerald-300 hover:text-emerald-200">
                                <Edit2 size={14}/>
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            co.status === 'suspended' 
                              ? 'bg-red-500/20 text-red-300 border border-red-400/30' 
                              : 'bg-green-500/20 text-green-300 border border-green-400/30'
                          }`}>
                            {co.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            {co.status === 'active' ? (
                              <button 
                                onClick={() => handleSuspend(co.id)} 
                                className="p-2 rounded-xl text-amber-400 bg-amber-500/20 hover:bg-amber-500/30 transition-all" 
                                title="Suspend"
                              >
                                <Power size={18}/>
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleActivate(co.id)} 
                                className="p-2 rounded-xl text-green-400 bg-green-500/20 hover:bg-green-500/30 transition-all" 
                                title="Activate"
                              >
                                <Check size={18}/>
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(co.id)} 
                              className="p-2 rounded-xl text-red-400 bg-red-500/20 hover:bg-red-500/30 transition-all"
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

        {/* TAB: HARDWARE */}
        {activeTab === 'hardware' && (
          <div className="backdrop-blur-xl bg-white/10 p-6 rounded-3xl shadow-xl border border-white/20">
            <div className="flex items-center gap-2 mb-6">
              <Server className="w-5 h-5 text-emerald-300" />
              <h2 className="text-xl font-bold text-white">Hardware Devices</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-white/20">
                    <th className="p-4 text-emerald-200 font-bold">ID</th>
                    <th className="p-4 text-emerald-200 font-bold">Type</th>
                    <th className="p-4 text-emerald-200 font-bold">UID</th>
                    <th className="p-4 text-emerald-200 font-bold">Company ID</th>
                    <th className="p-4 text-emerald-200 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hardware.map(hw => (
                    <tr key={hw.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <code className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded font-mono text-xs font-bold">#{hw.id}</code>
                      </td>
                      <td className="p-4">
                        {editingHw?.id === hw.id ? (
                          <input 
                            className="bg-white/20 border-2 border-white/30 text-white px-3 py-1 rounded-lg focus:border-[#00755e] focus:outline-none" 
                            value={editingHw.device_type} 
                            onChange={e => setEditingHw({...editingHw, device_type: e.target.value})} 
                          />
                        ) : (
                          <span className="font-semibold text-white">{hw.device_type}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {editingHw?.id === hw.id ? (
                          <input 
                            className="bg-white/20 border-2 border-white/30 text-white px-3 py-1 rounded-lg focus:border-[#00755e] focus:outline-none font-mono text-xs" 
                            value={editingHw.device_uid} 
                            onChange={e => setEditingHw({...editingHw, device_uid: e.target.value})} 
                          />
                        ) : (
                          <code className="text-emerald-300 font-mono text-xs">{hw.device_uid}</code>
                        )}
                      </td>
                      <td className="p-4">
                        {editingHw?.id === hw.id ? (
                          <input 
                            type="number" 
                            className="bg-white/20 border-2 border-white/30 text-white px-3 py-1 rounded-lg focus:border-[#00755e] focus:outline-none w-24" 
                            value={editingHw.company_id || ''} 
                            onChange={e => setEditingHw({...editingHw, company_id: e.target.value ? parseInt(e.target.value) : null})} 
                          />
                        ) : (
                          <span className="text-white">{hw.company_id || 'Unassigned'}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          {editingHw?.id === hw.id ? (
                            <>
                              <button onClick={saveHwEdit} className="p-2 rounded-xl text-green-400 bg-green-500/20 hover:bg-green-500/30 transition-all">
                                <Check size={18}/>
                              </button>
                              <button onClick={cancelHwEdit} className="p-2 rounded-xl text-red-400 bg-red-500/20 hover:bg-red-500/30 transition-all">
                                <X size={18}/>
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => startHwEdit(hw)} 
                              className="p-2 rounded-xl text-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30 transition-all"
                            >
                              <Edit2 size={18}/>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="backdrop-blur-xl bg-white/10 p-8 rounded-3xl shadow-xl border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-[#00755e] to-emerald-500 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">System Analytics</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-[#00755e]/20 to-emerald-500/20 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-emerald-200">Total Companies</h3>
                </div>
                <p className="text-4xl font-black text-white">{companies.length}</p>
                <p className="text-xs text-emerald-300 mt-2">+12% from last month</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-blue-200">Hardware Units</h3>
                </div>
                <p className="text-4xl font-black text-white">{hardware.length}</p>
                <p className="text-xs text-blue-300 mt-2">Active devices online</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-purple-200">Active Users</h3>
                </div>
                <p className="text-4xl font-black text-white">{companies.filter(c => c.status === 'active').length}</p>
                <p className="text-xs text-purple-300 mt-2">Companies online now</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-emerald-200">Database Performance</span>
                    <span className="text-white font-bold">98%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-[#00755e] to-emerald-400 rounded-full h-2" style={{ width: '98%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-blue-200">API Response Time</span>
                    <span className="text-white font-bold">92%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full h-2" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-purple-200">Server Uptime</span>
                    <span className="text-white font-bold">99.9%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-400 rounded-full h-2" style={{ width: '99.9%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperDashboard;
