import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck, Cpu, Zap, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMessage = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
        ? detail.map((d) => d.msg || d).join(', ')
        : typeof detail === 'object' && detail !== null
        ? detail.msg || JSON.stringify(detail)
        : 'Authentication failed. Please verify credentials.';
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
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30 text-white ring-1 ring-white/20">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-heading font-black text-2xl text-slate-100 tracking-tight leading-none">PhishGuard AI</h1>
                <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase block mt-1">Autonomous Threat Defense</span>
              </div>
            </div>

            <div className="space-y-4 my-8">
              <h2 className="font-heading font-extrabold text-2xl lg:text-3xl text-slate-100 tracking-tight leading-tight">
                Enterprise AI Phishing & Fraud Prevention Platform
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Scan URLs, phishing emails, SMS/WhatsApp spam, and QR code payloads in real-time with explainable AI detection signals.
              </p>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-800/80">
            <div className="p-3 bg-[#111b2e]/80 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-mono font-bold">NLP + Computer Vision</span>
              </div>
              <p className="text-[11px] text-slate-400">Multi-vector lexical & QR matrix scan</p>
            </div>
            <div className="p-3 bg-[#111b2e]/80 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-mono font-bold">Action Checklists</span>
              </div>
              <p className="text-[11px] text-slate-400">Interactive step-by-step mitigation</p>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center bg-[#0d1424]/60">
          <div className="mb-8">
            <h3 className="font-heading font-black text-2xl text-slate-100 tracking-tight">Access Defense Console</h3>
            <p className="text-xs text-slate-400 mt-1">Enter registered credentials to launch your security workspace</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-rose-300 text-xs flex items-start gap-3 shadow-lg shadow-rose-950/20">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                User Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@secops.io"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-[#070b14] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition duration-200"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Security Password
                </label>
                <Link to="/forgot-password" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-[#070b14] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-heading font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Authenticating JWT Session...
                </span>
              ) : (
                <>
                  Sign In To Command Center <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Need a security profile?{' '}
            <Link to="/register" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
              Create new account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
