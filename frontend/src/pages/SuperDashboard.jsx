import React, { useState, useEffect } from 'react';
import { superAdminService } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Server, Shield, LogOut, Trash2, Edit2, Power, X, Check, Plus, Building2, Zap } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Super Admin Panel</h1>
              <p className="text-emerald-200 text-sm">Manage companies & hardware</p>
            </div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} className="text-red-300 hover:text-white hover:bg-red-500/20 px-4 py-2 rounded-xl flex gap-2 items-center">
            <LogOut size={18}/> Logout
          </button>
        </header>

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

        {/* Hardware List */}
        <div className="mt-8 backdrop-blur-xl bg-white/10 p-6 rounded-3xl shadow-xl border border-white/20">
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
      </div>
    </div>
  );
};

export default SuperDashboard;
