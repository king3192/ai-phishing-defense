import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, User, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck, Cpu, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength evaluation
  const isMinLength = password.length >= 6;
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const strengthScore = [isMinLength, hasDigit, hasSpecial].filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isMinLength) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMessage = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
        ? detail.map((d) => d.msg || d).join(', ')
        : typeof detail === 'object' && detail !== null
        ? detail.msg || JSON.stringify(detail)
        : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Background Cyber Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-800/80 bg-[#0d1424]/90 backdrop-blur-2xl shadow-2xl relative z-10">
        
        {/* Left Side: Brand Feature Showcase */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#0e1728] via-[#0b1220] to-[#070b14] p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30 text-white ring-1 ring-white/20">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-heading font-black text-2xl text-slate-100 tracking-tight leading-none">PhishGuard AI</h1>
                <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase block mt-1">Join Defense Network</span>
              </div>
            </div>

            <div className="space-y-4 my-8">
              <h2 className="font-heading font-extrabold text-2xl lg:text-3xl text-slate-100 tracking-tight leading-tight">
                Empower Your Personal & Organization Threat Defense
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Create your account to unlock AI threat scores, custom explainability panels, interactive step-by-step risk mitigation plans, and CSV audit exports.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-6 border-t border-slate-800/80">
            {['Zero-Day Threat Detection Engine', 'Custom Security Score Tracking', 'Real-Time Alert Notifications'].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs font-medium text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center bg-[#0d1424]/60">
          <div className="mb-6">
            <h3 className="font-heading font-black text-2xl text-slate-100 tracking-tight">Create Agent Account</h3>
            <p className="text-xs text-slate-400 mt-1">Fill out the parameters below to provision your defense profile</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-rose-300 text-xs flex items-start gap-3 shadow-lg shadow-rose-950/20">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#070b14] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Work / Personal Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@secops.io"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#070b14] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#070b14] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition duration-200"
                />
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1.5 h-1.5 pt-1">
                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthScore >= 1 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-slate-800'}`}></div>
                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthScore >= 2 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-slate-800'}`}></div>
                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthScore >= 3 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-800'}`}></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-0.5">
                    <span>Password Strength:</span>
                    <span className={`font-bold uppercase ${
                      strengthScore === 1 ? 'text-rose-400' : strengthScore === 2 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {strengthScore === 1 ? 'Weak' : strengthScore === 2 ? 'Medium' : 'Strong'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Role-Based Access Control */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Account Security Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-[#070b14] border border-slate-800 rounded-xl text-slate-100 text-sm font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="user">User (Standard Analyst)</option>
                <option value="admin">Administrator (Platform Operations)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-heading font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Provisioning Profile...
                </span>
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Already have a profile?{' '}
            <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
              Sign in here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
