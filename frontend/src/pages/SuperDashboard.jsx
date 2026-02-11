import React, { useState, useEffect } from 'react';
import { superAdminService } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Server, Shield, LogOut, Trash2, Edit2, Power, X, Check, Plus, Building2, Zap, Home, Settings, BarChart3, TrendingUp, Users, HelpCircle, ChevronDown, Menu } from 'lucide-react';

const SuperDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [hardware, setHardware] = useState([]);
  const [newCo, setNewCo] = useState({ name: '', admin_username: '', admin_pass: '', plan: 'basic', hardware_type: 'ESP32' });
  
  // Track editing states
  const [editingHw, setEditingHw] = useState(null); 
  const [editingCo, setEditingCo] = useState(null);\n  const [tempName, setTempName] = useState("");\n  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [coRes, hwRes] = await Promise.all([
        superAdminService.getCompanies(),
        superAdminService.getHardware()
      ]);
      // Filter out fully deleted companies
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 font-sans">
      <div className="flex h-screen overflow-hidden">
        
        {/* ===== MODERN SIDEBAR (Hidden on mobile) ===== */}
        <div className={`transform transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative md:translate-x-0 w-60 md:w-72 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col shadow-2xl z-50 h-full`}>
          
          {/* Sidebar Header */}
          <div className="p-4 md:p-8 border-b border-slate-700/40">
            <div className="flex items-center gap-2 md:gap-4 mb-0 md:mb-2 justify-between">
              <div className="flex items-center gap-2 md:gap-4 min-w-0">
                <div className="w-10 md:w-14 h-10 md:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform flex-shrink-0">
                  <Shield className="w-5 md:w-7 h-5 md:w-7 text-white font-bold" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-white text-sm md:text-lg truncate\">SUPER ADMIN</h3>
                  <p className="text-xs text-blue-300 font-semibold truncate\">Platform Master</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className=\"md:hidden text-slate-400 hover:text-white flex-shrink-0\">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Sidebar Menu */}
          <div className="flex-1 p-6 space-y-3 mt-4">
            {[
              { id: 'companies', label: 'Companies', icon: Building2 },
              { id: 'hardware', label: 'Hardware', icon: Zap }
            ].map(tab => (
              <button
                key={tab.id}
                className={`w-full px-5 py-4 text-left rounded-2xl font-bold text-sm transition-all flex items-center gap-4 bg-gradient-to-r from-blue-500/15 to-cyan-600/15 text-cyan-100 border border-blue-400/40 hover:from-blue-500/25 hover:to-cyan-600/25 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20 group`}
              >
                <tab.icon className="w-5 h-5 group-hover:scale-125 transition-transform text-cyan-400" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Platform Stats */}
          <div className="p-6 border-t border-slate-700/40 space-y-3">
            <div className="text-xs text-slate-400 uppercase font-black tracking-wider mb-4">PLATFORM METRICS</div>
            <div className="bg-gradient-to-br from-cyan-500/15 to-blue-600/15 rounded-2xl p-4 border border-cyan-400/40 hover:border-cyan-400/60 transition-all">
              <p className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">Total Companies</p>
              <p className="text-3xl font-black text-cyan-300">{companies.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/15 to-pink-600/15 rounded-2xl p-4 border border-purple-400/40 hover:border-purple-400/60 transition-all">
              <p className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">IoT Devices</p>
              <p className="text-3xl font-black text-purple-300">{hardware.length}</p>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 md:p-6 border-t border-slate-700/40">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600/30 to-red-700/30 hover:from-red-600/50 hover:to-red-700/50 text-red-200 font-bold py-2 md:py-3 rounded-xl transition-all transform hover:scale-105 border border-red-500/40 text-xs md:text-sm shadow-lg hover:shadow-red-500/20"
            >
              <LogOut size={16}/> <span className=\"hidden sm:inline\">Logout</span>\n            </button>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800/60 via-blue-800/40 to-slate-800/60 backdrop-blur-2xl border-b border-blue-500/20 px-4 md:px-10 py-4 md:py-8 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white hover:bg-slate-700/50 p-2 rounded-lg">
                <Menu size={24} />
              </button>
              <div className="min-w-0">
              <h1 className="text-xl md:text-4xl font-black text-white drop-shadow-lg">Platform Owner</h1>
              <p className="text-xs md:text-sm text-blue-200 mt-0.5 md:mt-2 font-semibold">Manage all companies</p>
            </div>
            </div>
            <div className="text-right bg-gradient-to-br from-blue-500/15 to-cyan-600/15 px-3 md:px-6 py-2 md:py-4 rounded-2xl border border-blue-400/40 hidden md:block">
              <p className="text-xs text-slate-300 uppercase font-black tracking-wider">Access Level</p>
              <p className="text-lg md:text-2xl font-black bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">SUPER ADMIN</p>
            </div>
          </div>

          {/* Content Area */}
          <div className=\"flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-b from-slate-950/50 to-slate-900/50\">
            <div className=\"space-y-6 md:space-y-8\">
              
              {/* ===== CREATE COMPANY SECTION ===== */}
              <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8\">
                
                {/* Create Company Form */}
                <div className="bg-gradient-to-br from-slate-800/60 via-slate-750/60 to-slate-800/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-blue-400/30 hover:border-blue-400/50 transition-all">
                  <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
                      <Plus className="text-white" size={24} />
                    </div>
                    Create Company
                  </h3>
                  <form onSubmit={handleCreate} className="space-y-5">
                    <div>
                      <label className="block text-sm font-black text-blue-300 mb-2 uppercase tracking-wider">Company Name</label>
                      <input 
                        placeholder="Acme Corporation" 
                        className="w-full bg-slate-700/40 border-2 border-slate-600/60 text-white placeholder-slate-500/80 p-4 rounded-2xl focus:border-blue-400 focus:bg-slate-700/60 focus:outline-none transition text-sm font-semibold"
                        value={newCo.name} 
                        onChange={e => setNewCo({...newCo, name: e.target.value})} 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-blue-300 mb-2 uppercase tracking-wider">Admin Username</label>
                      <input 
                        placeholder="admin@company" 
                        className="w-full bg-slate-700/40 border-2 border-slate-600/60 text-white placeholder-slate-500/80 p-4 rounded-2xl focus:border-blue-400 focus:bg-slate-700/60 focus:outline-none transition text-sm font-semibold"
                        value={newCo.admin_username} 
                        onChange={e => setNewCo({...newCo, admin_username: e.target.value})} 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-blue-300 mb-2 uppercase tracking-wider">Admin Password</label>
                      <input 
                        placeholder="••••••••" 
                        type="password" 
                        className="w-full bg-slate-700/40 border-2 border-slate-600/60 text-white placeholder-slate-500/80 p-4 rounded-2xl focus:border-blue-400 focus:bg-slate-700/60 focus:outline-none transition text-sm font-semibold"
                        value={newCo.admin_pass} 
                        onChange={e => setNewCo({...newCo, admin_pass: e.target.value})} 
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black text-blue-300 mb-2 uppercase tracking-wider">Plan</label>
                        <select 
                          className="w-full bg-slate-700/40 border-2 border-slate-600/60 text-white p-4 rounded-2xl focus:border-blue-400 focus:bg-slate-700/60 focus:outline-none transition text-sm font-semibold"
                          value={newCo.plan} 
                          onChange={e => setNewCo({...newCo, plan: e.target.value})}
                        >
                          <option value="basic">Basic</option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-black text-blue-300 mb-2 uppercase tracking-wider">Hardware</label>
                        <select 
                          className="w-full bg-slate-700/40 border-2 border-slate-600/60 text-white p-4 rounded-2xl focus:border-blue-400 focus:bg-slate-700/60 focus:outline-none transition text-sm font-semibold"
                          value={newCo.hardware_type} 
                          onChange={e => setNewCo({...newCo, hardware_type: e.target.value})}
                        >
                          <option value="ESP32">ESP32</option>
                          <option value="Arduino">Arduino</option>
                          <option value="Raspberry_Pi">Raspberry Pi</option>
                        </select>
                      </div>
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-black py-4 rounded-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-2xl text-base tracking-wide"
                    >
                      <Zap size={20} /> CREATE COMPANY
                    </button>
                  </form>
                </div>

                {/* Companies List */}
                <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/60 via-slate-750/60 to-slate-800/60 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-blue-400/30 hover:border-blue-400/50 transition-all">
                  <div className="p-6 border-b border-blue-400/20 bg-gradient-to-r from-slate-700/40 to-slate-600/30">
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                      <Building2 className="text-blue-400" size={24} /> Registered Companies
                      <span className="ml-auto bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">{companies.length}</span>
                    </h3>
                  </div>
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-700/40 sticky top-0 border-b border-blue-400/20">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-black text-blue-300 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-4 text-left text-xs font-black text-blue-300 uppercase tracking-wider">Company</th>
                          <th className="px-6 py-4 text-left text-xs font-black text-blue-300 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-center text-xs font-black text-blue-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/40">
                        {companies.map(co => (
                          <tr key={co.id} className="hover:bg-slate-700/50 transition-all">
                            <td className="px-6 py-4">
                              <code className="bg-gradient-to-r from-blue-500/30 to-cyan-600/30 text-blue-300 px-3 py-1 rounded-lg font-mono text-xs font-black border border-blue-400/40">#ID{co.id}</code>
                            </td>
                            <td className="px-6 py-4">
                              {editingCo === co.id ? (
                                <div className="flex gap-2 items-center">
                                  <input 
                                    className="bg-slate-700/50 border border-slate-600 text-white px-3 py-1 rounded-lg focus:border-blue-500 focus:outline-none text-sm flex-1"
                                    value={tempName} 
                                    onChange={e => setTempName(e.target.value)} 
                                  />
                                  <button onClick={() => saveRename(co.id)} className="text-green-400 hover:text-green-300 p-1">
                                    <Check size={16}/>
                                  </button>
                                  <button onClick={cancelRename} className="text-red-400 hover:text-red-300 p-1">
                                    <X size={16}/>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white">{co.name}</span>
                                  <button onClick={() => startRename(co)} className="text-blue-300 hover:text-blue-200 p-1">
                                    <Edit2 size={14}/>
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                                co.status === 'suspended' 
                                  ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                                  : 'bg-green-500/20 text-green-300 border-green-500/30'
                              }`}>
                                {co.status === 'suspended' ? '🔴 Suspended' : '🟢 Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                {co.status === 'active' ? (
                                  <button 
                                    onClick={() => handleSuspend(co.id)} 
                                    className="p-2 rounded-lg text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30 transition-all"
                                    title="Suspend"
                                  >
                                    <Power size={16}/>
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleActivate(co.id)} 
                                    className="p-2 rounded-lg text-green-400 bg-green-500/20 hover:bg-green-500/30 transition-all"
                                    title="Activate"
                                  >
                                    <Check size={16}/>
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDelete(co.id)} 
                                  className="p-2 rounded-lg text-red-400 bg-red-500/20 hover:bg-red-500/30 transition-all"
                                  title="Delete"
                                >
                                  <Trash2 size={16}/>
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

              {/* ===== HARDWARE SECTION ===== */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-blue-500/40">
                <div className="p-6 border-b border-blue-400/30 bg-gradient-to-r from-slate-700/50 to-slate-600/30">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="text-blue-400" /> IoT Hardware Devices ({hardware.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-700/50 border-b border-blue-400/20">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-300 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-300 uppercase">Device Type</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-300 uppercase">Unique ID</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-300 uppercase">Company ID</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-blue-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-600/30">
                      {hardware.map(hw => (
                        <tr key={hw.id} className="hover:bg-slate-700/30 transition">
                          <td className="px-6 py-4">
                            <code className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-mono text-xs font-bold border border-blue-500/30">#{hw.id}</code>
                          </td>
                          <td className="px-6 py-4">
                            {editingHw?.id === hw.id ? (
                              <input 
                                className="bg-slate-700/50 border border-slate-600 text-white px-3 py-1 rounded-lg focus:border-blue-500 focus:outline-none text-sm w-32"
                                value={editingHw.device_type} 
                                onChange={e => setEditingHw({...editingHw, device_type: e.target.value})} 
                              />
                            ) : (
                              <span className="font-semibold text-white bg-blue-500/20 px-2 py-1 rounded border border-blue-500/30 inline-block">{hw.device_type}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editingHw?.id === hw.id ? (
                              <input 
                                className="bg-slate-700/50 border border-slate-600 text-white px-3 py-1 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-xs w-40"
                                value={editingHw.device_uid} 
                                onChange={e => setEditingHw({...editingHw, device_uid: e.target.value})} 
                              />
                            ) : (
                              <code className="text-blue-300 font-mono text-xs bg-slate-700/30 px-2 py-1 rounded border border-blue-500/30">{hw.device_uid}</code>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editingHw?.id === hw.id ? (
                              <input 
                                type="number" 
                                className="bg-slate-700/50 border border-slate-600 text-white px-3 py-1 rounded-lg focus:border-blue-500 focus:outline-none w-20"
                                value={editingHw.company_id || ''} 
                                onChange={e => setEditingHw({...editingHw, company_id: e.target.value ? parseInt(e.target.value) : null})} 
                              />
                            ) : (
                              <span className={`px-2 py-1 rounded text-xs font-bold ${hw.company_id ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'}`}>
                                {hw.company_id ? `Company ${hw.company_id}` : 'Unassigned'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              {editingHw?.id === hw.id ? (
                                <>
                                  <button onClick={saveHwEdit} className="p-2 rounded-lg text-green-400 bg-green-500/20 hover:bg-green-500/30 transition-all">
                                    <Check size={16}/>
                                  </button>
                                  <button onClick={cancelHwEdit} className="p-2 rounded-lg text-red-400 bg-red-500/20 hover:bg-red-500/30 transition-all">
                                    <X size={16}/>
                                  </button>
                                </>
                              ) : (
                                <button 
                                  onClick={() => startHwEdit(hw)} 
                                  className="p-2 rounded-lg text-blue-400 bg-blue-500/20 hover:bg-blue-500/30 transition-all"
                                  title="Edit"
                                >
                                  <Edit2 size={16}/>
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

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperDashboard;
