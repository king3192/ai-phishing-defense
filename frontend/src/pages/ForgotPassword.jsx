import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, ArrowRight, CheckCircle2, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';
import API from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Request Token, 2: Reset Password, 3: Completed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/forgot-password', { email });
      if (res.data.reset_token) {
        setToken(res.data.reset_token);
        setSuccessMsg("Reset token generated successfully! Enter your new password below.");
        setStep(2);
      } else {
        setSuccessMsg("If your account exists in our system, password reset instructions have been generated.");
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate password reset token.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Reset token is required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.post('/auth/reset-password', {
        token: token.trim(),
        new_password: newPassword
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password. Token may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Cyber Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0d1424]/90 backdrop-blur-2xl p-8 rounded-3xl border border-slate-800/90 shadow-2xl relative z-10 glow-cyan">
        <div className="text-center mb-6">
          <div className="inline-flex p-3.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30 text-white mb-4 ring-1 ring-white/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-heading font-black text-2xl text-slate-100 tracking-tight">
            {step === 3 ? "Password Reset Complete" : step === 2 ? "Set New Security Password" : "Reset Account Password"}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {step === 1 && "Enter your registered defense account email to dispatch a secure password reset token."}
            {step === 2 && "Enter your authorization reset token and your desired new password."}
            {step === 3 && "Your credentials have been securely updated. You can now access your dashboard."}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2 shadow-md">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && step === 2 && (
          <div className="mb-5 p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@phishguard.ai"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-[#070b14] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-heading font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Dispatching Token...
                </span>
              ) : (
                <>
                  Generate Reset Token <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
              >
                Already have a reset token? Enter it here
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                Authorization Reset Token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste JWT reset token..."
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#070b14] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs font-mono transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                New Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters..."
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-[#070b14] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword.trim()}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-heading font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating Password...
                </span>
              ) : (
                <>
                  Update Password <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-mono text-slate-400 hover:text-slate-200"
              >
                ← Back to Request Token
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-center space-y-4 shadow-lg shadow-emerald-950/20">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="font-heading font-black text-lg text-slate-100">Password Successfully Updated!</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Your security password has been changed. You can now log into your PhishGuard AI console.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-heading font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition"
              >
                Proceed to Login
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center pt-4 border-t border-slate-800/80">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
