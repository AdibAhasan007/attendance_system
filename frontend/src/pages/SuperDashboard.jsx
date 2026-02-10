import React, { useState, useEffect } from 'react';
import { superAdminService } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Server, Shield, LogOut, Trash2, Settings, Edit2, Power, X, Check, Plus, Building2, Zap, Activity } from 'lucide-react';

const SuperDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [hardware, setHardware] = useState([]);
  const [newCo, setNewCo] = useState({ name: '', admin_username: '', admin_pass: '', plan: 'basic', hardware_type: 'ESP32' });
  
  // Track editing states
  const [editingHw, setEditingHw] = useState(null); 
  const [editingCo, setEditingCo] = useState(null); // ID of company being renamed
  const [tempName, setTempName] = useState("");     // Temp storage for name edit

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

  // [NEW] Toggle Suspend/Active
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'active' ? 'Activate' : 'Suspend';
    
    if(!window.confirm(`${action} this company?`)) return;

    try {
      await superAdminService.updateCompany(id, null, newStatus);
      toast.success(`Company ${newStatus}`);
      loadData();
    } catch (err) { toast.error("Status update failed"); }
  };

  // [NEW] Rename Company
  const startEditCompany = (co) => {
    setEditingCo(co.id);
    setTempName(co.name);
  };

  const saveCompany = async (id) => {
    try {
      await superAdminService.updateCompany(id, tempName, null);
      toast.success("Name Updated");
      setEditingCo(null);
      loadData();
    } catch (err) { toast.error("Update failed"); }
  };

  // Hardware Update
  const handleUpdateHardware = async (id, newType) => {
    try {
      await superAdminService.updateHardware(id, newType);
      toast.success("Hardware Updated");
      setEditingHw(null);
      loadData();
    } catch (err) { toast.error("Update failed"); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 mb-8 border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">Super Admin</h1>
                  <p className="text-purple-200 text-sm">Enterprise Control Center</p>
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="backdrop-blur-md bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-400/30">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-300" />
                  <div>
                    <p className="text-xs text-emerald-200">Companies</p>
                    <p className="text-xl font-bold text-white">{companies.length}</p>
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-md bg-blue-500/20 px-4 py-2 rounded-xl border border-blue-400/30">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-300" />
                  <div>
                    <p className="text-xs text-blue-200">Devices</p>
                    <p className="text-xl font-bold text-white">{hardware.length}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { localStorage.clear(); navigate('/'); }} 
                className="backdrop-blur-md bg-red-500/20 hover:bg-red-500/30 text-red-200 px-6 rounded-xl border border-red-400/30 transition-all flex items-center gap-2 font-semibold"
              >
                <LogOut size={18}/> Logout
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Form - Left Side */}
          <div className="backdrop-blur-xl bg-white/5 p-8 rounded-2xl border border-white/10 shadow-2xl h-fit">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Deploy New Tenant</h2>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm text-purple-200 font-medium mb-1 block">Company Name</label>
                <input 
                  placeholder="e.g. Acme Corporation" 
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white placeholder-purple-300/50 focus:bg-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" 
                  onChange={e => setNewCo({...newCo, name: e.target.value})} 
                  required
                />
              </div>
              <div>
                <label className="text-sm text-purple-200 font-medium mb-1 block">Admin Username</label>
                <input 
                  placeholder="admin@company.com" 
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white placeholder-purple-300/50 focus:bg-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" 
                  onChange={e => setNewCo({...newCo, admin_username: e.target.value})} 
                  required
                />
              </div>
              <div>
                <label className="text-sm text-purple-200 font-medium mb-1 block">Admin Password</label>
                <input 
                  placeholder="••••••••" 
                  type="password" 
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white placeholder-purple-300/50 focus:bg-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" 
                  onChange={e => setNewCo({...newCo, admin_pass: e.target.value})} 
                  required
                />
              </div>
              <div>
                <label className="text-sm text-purple-200 font-medium mb-1 block">Hardware Type</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white focus:bg-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  onChange={e => setNewCo({...newCo, hardware_type: e.target.value})}
                >
                  <option value="ESP32" className="bg-slate-800">ESP32 Device</option>
                  <option value="RASPBERRY_PI" className="bg-slate-800">Raspberry Pi</option>
                </select>
              </div>
              <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Deploy Company
              </button>
            </form>
          </div>

          {/* Right Side - Tables */}
          <div className="lg:col-span-2 space-y-6">
            {/* Companies List */}
            <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Active Tenants</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-4 text-purple-200 font-semibold">Company</th>
                      <th className="p-4 text-purple-200 font-semibold">Status</th>
                      <th className="p-4 text-purple-200 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map(co => (
                      <tr key={co.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          {editingCo === co.id ? (
                            <div className="flex gap-2">
                              <input 
                                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                              />
                              <button onClick={() => saveCompany(co.id)} className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded">
                                <Check size={16}/>
                              </button>
                              <button onClick={() => setEditingCo(null)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                                <X size={16}/>
                              </button>
                            </div>
                          ) : (
                            <span className="flex items-center gap-2 text-white font-semibold">
                              {co.name}
                              <button onClick={() => startEditCompany(co)} className="text-purple-400 hover:text-purple-300">
                                <Edit2 size={14}/>
                              </button>
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            co.status === 'active' 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                              : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                          }`}>
                            <Activity className="w-3 h-3" />
                            {co.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleToggleStatus(co.id, co.status)} 
                              title={co.status === 'active' ? "Suspend Service" : "Activate Service"}
                              className={`p-2 rounded-lg transition-all ${
                                co.status === 'active' 
                                  ? 'text-amber-400 hover:bg-amber-500/20' 
                                  : 'text-emerald-400 hover:bg-emerald-500/20'
                              }`}
                            >
                              <Power size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(co.id)} 
                              className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-all" 
                              title="Delete Permanently"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hardware List */}
            <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Server className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Hardware Network</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-4 text-purple-200 font-semibold">Device UID</th>
                      <th className="p-4 text-purple-200 font-semibold">Type</th>
                      <th className="p-4 text-purple-200 font-semibold">Tenant</th>
                      <th className="p-4 text-purple-200 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hardware.map(hw => (
                      <tr key={hw.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <code className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2 py-1 rounded">{hw.uid}</code>
                        </td>
                        <td className="p-4 text-white">
                          {editingHw === hw.id ? (
                            <select 
                              className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm text-white"
                              defaultValue={hw.type}
                              onChange={(e) => handleUpdateHardware(hw.id, e.target.value)}
                            >
                              <option value="ESP32" className="bg-slate-800">ESP32</option>
                              <option value="RASPBERRY_PI" className="bg-slate-800">RASPBERRY_PI</option>
                              <option value="ZK_DEVICE" className="bg-slate-800">ZK_DEVICE</option>
                            </select>
                          ) : (
                            <span className="font-medium">{hw.type}</span>
                          )}
                        </td>
                        <td className="p-4 text-blue-300 font-medium">{hw.company}</td>
                        <td className="p-4">
                          {editingHw === hw.id ? (
                            <button onClick={() => setEditingHw(null)} className="text-slate-400 hover:text-white text-xs">Cancel</button>
                          ) : (
                            <button onClick={() => setEditingHw(hw.id)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all">
                              <Settings size={16}/>
                            </button>
                          )}
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
  );
};

export default SuperDashboard;