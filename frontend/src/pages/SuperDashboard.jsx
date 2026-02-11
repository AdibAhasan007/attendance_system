import React, { useState, useEffect } from 'react';
import { superAdminService } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Server, Shield, LogOut, Trash2, Edit2, Power, X, Check, Plus, Building2, Zap, Home, Settings, BarChart3, TrendingUp, Users, HelpCircle, ChevronDown } from 'lucide-react';

const SuperDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [hardware, setHardware] = useState([]);
  const [newCo, setNewCo] = useState({ name: '', admin_username: '', admin_pass: '', plan: 'basic', hardware_type: 'ESP32' });
  
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
        
        {/* ===== MODERN SIDEBAR ===== */}
        <div className="w-64 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col shadow-2xl">
          
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-700/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Owner Portal</h3>
                <p className="text-xs text-purple-300">Platform Control</p>
              </div>
            </div>
          </div>

          {/* Sidebar Menu */}
          <div className="flex-1 p-4 space-y-2 mt-4">
            {[
              { id: 'companies', label: 'Companies', icon: Building2 },
              { id: 'hardware', label: 'Hardware', icon: Zap }
            ].map(tab => (
              <button
                key={tab.id}
                className={`w-full px-4 py-3 text-left rounded-xl font-semibold text-sm transition-all flex items-center gap-3 bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white border border-purple-500/30`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Platform Stats */}
          <div className="p-4 border-t border-slate-700/30 space-y-3">
            <div className="text-xs text-slate-400 uppercase font-bold mb-3">Platform Stats</div>
            <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/30">
              <p className="text-xs text-slate-400 mb-1">Total Companies</p>
              <p className="text-2xl font-bold text-purple-400">{companies.length}</p>
            </div>
            <div className="bg-pink-500/10 rounded-xl p-3 border border-pink-500/30">
              <p className="text-xs text-slate-400 mb-1">Total Devices</p>
              <p className="text-2xl font-bold text-pink-400">{hardware.length}</p>
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
          <div className="bg-gradient-to-r from-slate-800/80 to-purple-800/80 backdrop-blur-xl border-b border-slate-700/50 px-8 py-6 flex items-center justify-between shadow-xl">
            <div>
              <h1 className="text-3xl font-black text-white">Platform Owner</h1>
              <p className="text-sm text-purple-200 mt-1">Manage all companies and IoT devices</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-bold">Super Admin</p>
              <p className="text-lg font-bold text-white">Control Center</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-8">
            <div className="space-y-8">
              
              {/* ===== CREATE COMPANY SECTION ===== */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Create Company Form */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-600/50">
                  <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <Plus className="text-purple-400" size={24} /> Create New Company
                  </h3>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Company Name</label>
                      <input 
                        placeholder="Acme Corporation" 
                        className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 p-3 rounded-xl focus:border-purple-500 focus:outline-none transition"
                        value={newCo.name} 
                        onChange={e => setNewCo({...newCo, name: e.target.value})} 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Admin Username</label>
                      <input 
                        placeholder="admin@company" 
                        className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 p-3 rounded-xl focus:border-purple-500 focus:outline-none transition"
                        value={newCo.admin_username} 
                        onChange={e => setNewCo({...newCo, admin_username: e.target.value})} 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Admin Password</label>
                      <input 
                        placeholder="••••••••" 
                        type="password" 
                        className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 p-3 rounded-xl focus:border-purple-500 focus:outline-none transition"
                        value={newCo.admin_pass} 
                        onChange={e => setNewCo({...newCo, admin_pass: e.target.value})} 
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Plan</label>
                        <select 
                          className="w-full bg-slate-700/50 border border-slate-600 text-white p-3 rounded-xl focus:border-purple-500 focus:outline-none transition"
                          value={newCo.plan} 
                          onChange={e => setNewCo({...newCo, plan: e.target.value})}
                        >
                          <option value="basic">Basic</option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Hardware</label>
                        <select 
                          className="w-full bg-slate-700/50 border border-slate-600 text-white p-3 rounded-xl focus:border-purple-500 focus:outline-none transition"
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
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Zap size={18} /> Create Company
                    </button>
                  </form>
                </div>

                {/* Companies List */}
                <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-600/50">
                  <div className="p-6 border-b border-slate-600/30 bg-gradient-to-r from-slate-700/50 to-slate-600/30">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Building2 className="text-purple-400" /> Registered Companies ({companies.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-700/50 sticky top-0 border-b border-slate-600/30">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Company Name</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Status</th>
                          <th className="px-6 py-3 text-center text-xs font-bold text-slate-300 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-600/30">
                        {companies.map(co => (
                          <tr key={co.id} className="hover:bg-slate-700/30 transition">
                            <td className="px-6 py-4">
                              <code className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded font-mono text-xs font-bold border border-purple-500/30">#{co.id}</code>
                            </td>
                            <td className="px-6 py-4">
                              {editingCo === co.id ? (
                                <div className="flex gap-2 items-center">
                                  <input 
                                    className="bg-slate-700/50 border border-slate-600 text-white px-3 py-1 rounded-lg focus:border-purple-500 focus:outline-none text-sm flex-1"
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
                                  <button onClick={() => startRename(co)} className="text-purple-300 hover:text-purple-200 p-1">
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
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-600/50">
                <div className="p-6 border-b border-slate-600/30 bg-gradient-to-r from-slate-700/50 to-slate-600/30">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="text-pink-400" /> IoT Hardware Devices ({hardware.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-700/50 border-b border-slate-600/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Device Type</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Unique ID</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Company ID</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-600/30">
                      {hardware.map(hw => (
                        <tr key={hw.id} className="hover:bg-slate-700/30 transition">
                          <td className="px-6 py-4">
                            <code className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded font-mono text-xs font-bold border border-pink-500/30">#{hw.id}</code>
                          </td>
                          <td className="px-6 py-4">
                            {editingHw?.id === hw.id ? (
                              <input 
                                className="bg-slate-700/50 border border-slate-600 text-white px-3 py-1 rounded-lg focus:border-purple-500 focus:outline-none text-sm w-32"
                                value={editingHw.device_type} 
                                onChange={e => setEditingHw({...editingHw, device_type: e.target.value})} 
                              />
                            ) : (
                              <span className="font-semibold text-white bg-pink-500/20 px-2 py-1 rounded border border-pink-500/30 inline-block">{hw.device_type}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editingHw?.id === hw.id ? (
                              <input 
                                className="bg-slate-700/50 border border-slate-600 text-white px-3 py-1 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-xs w-40"
                                value={editingHw.device_uid} 
                                onChange={e => setEditingHw({...editingHw, device_uid: e.target.value})} 
                              />
                            ) : (
                              <code className="text-purple-300 font-mono text-xs bg-slate-700/30 px-2 py-1 rounded border border-purple-500/30">{hw.device_uid}</code>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editingHw?.id === hw.id ? (
                              <input 
                                type="number" 
                                className="bg-slate-700/50 border border-slate-600 text-white px-3 py-1 rounded-lg focus:border-purple-500 focus:outline-none w-20"
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
                                  className="p-2 rounded-lg text-purple-400 bg-purple-500/20 hover:bg-purple-500/30 transition-all"
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
