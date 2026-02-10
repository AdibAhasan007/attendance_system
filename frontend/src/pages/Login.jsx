import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, setAuthToken } from '../services/api';
import toast from 'react-hot-toast';
import { Building2, User, Shield, Lock, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('company'); 
  const [formData, setFormData] = useState({ username: '', password: '', deviceId: 'WEB_CLIENT_01' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      
      if (activeTab === 'super') {
        res = await authService.loginSuperAdmin(formData.username, formData.password);
        setAuthToken(res.data.access_token);
        localStorage.setItem('role', 'super_admin');
        navigate('/super-dashboard');
      } 
      else if (activeTab === 'company') {
        res = await authService.loginCompany(formData.username, formData.password);
        setAuthToken(res.data.access_token);
        localStorage.setItem('role', 'admin');
        localStorage.setItem('company_id', res.data.company_id);
        navigate('/company-dashboard');
      } 
      else {
        // Employee
        res = await authService.loginEmployee(formData.username, formData.password, formData.deviceId);
        if(res.data.status === 'error') throw new Error(res.data.message);
        
        setAuthToken(res.data.access_token);
        localStorage.setItem('role', 'employee');
        navigate('/employee-dashboard');
      }
      toast.success("Welcome back!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || err.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { key: 'company', label: 'Company', icon: Building2, gradient: 'from-blue-500 to-cyan-500' },
    { key: 'employee', label: 'Employee', icon: User, gradient: 'from-purple-500 to-pink-500' },
    { key: 'super', label: 'Owner', icon: Shield, gradient: 'from-orange-500 to-red-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl mb-4 transform hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            Attendance<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Pro</span>
          </h1>
          <p className="text-purple-200 text-sm font-medium">Enterprise Workforce Management</p>
        </div>

        {/* Login Card */}
        <div className="backdrop-blur-xl bg-white/10 p-8 rounded-3xl shadow-2xl border border-white/20 animate-fade-in-up">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            {roles.map(role => {
              const Icon = role.icon;
              return (
                <button
                  key={role.key}
                  onClick={() => setActiveTab(role.key)}
                  className={`relative p-4 rounded-xl font-bold text-sm transition-all duration-300 group ${
                    activeTab === role.key 
                      ? 'bg-white text-slate-900 shadow-lg scale-105' 
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className={`w-5 h-5 ${
                      activeTab === role.key 
                        ? 'text-purple-600' 
                        : 'text-white/40 group-hover:text-white/60'
                    }`} />
                    <span>{role.label}</span>
                  </div>
                  {activeTab === role.key && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-20 rounded-xl animate-pulse`}></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-purple-300 group-focus-within:text-purple-400 transition-colors" />
              </div>
              <input
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-200/50 focus:bg-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                placeholder={activeTab === 'employee' ? 'Employee ID (e.g. EMP001)' : 'Username'}
                onChange={e => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-purple-300 group-focus-within:text-purple-400 transition-colors" />
              </div>
              <input
                type="password"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-200/50 focus:bg-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                placeholder="Password"
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <button 
              disabled={loading}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as {activeTab === 'super' ? 'Owner' : roles.find(r => r.key === activeTab)?.label}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-purple-200/60 text-xs">Secured with enterprise-grade encryption</p>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-6 text-purple-200/40 text-xs">
          © 2026 AttendancePro. All rights reserved.
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
};

export default Login;