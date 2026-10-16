import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import API from '../services/api';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Lock, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  AlertTriangle, 
  Trash2, 
  Download, 
  FileText, 
  X, 
  KeyRound,
  ShieldAlert
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, refreshUser } = useAuth();
  const { fetchNotifications } = useNotifications();

  // Profile fields state
  const [name, setName] = useState(user?.name || '');
  const [emailAlerts, setEmailAlerts] = useState(user?.email_alerts_enabled ?? true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Danger Zone - Reset All Data Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmWord, setResetConfirmWord] = useState('');
  const [resetAccountPassword, setResetAccountPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetModalError, setResetModalError] = useState('');
  const [dangerZoneSuccessMsg, setDangerZoneSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        email_alerts_enabled: emailAlerts,
      };

      if (newPassword) {
        if (!currentPassword) {
          setError('Current password is required to set a new password.');
          setLoading(false);
          return;
        }
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      await updateProfile(payload);
      setMessage('Profile settings updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMessage = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
        ? detail.map((d) => d.msg || d).join(', ')
        : typeof detail === 'object' && detail !== null
        ? detail.msg || JSON.stringify(detail)
        : 'Failed to update profile.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (format) => {
    try {
      const endpoint = format === 'pdf' ? '/reports/export/pdf' : '/reports/export/csv';
      const res = await API.get(endpoint, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phishguard_backup_${format}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Download backup error:", err);
    }
  };

  const handleExecuteResetData = async () => {
    setResetModalError('');
    if (resetConfirmWord.trim() !== 'RESET') {
      setResetModalError('You must type RESET in all caps to confirm.');
      return;
    }
    if (!resetAccountPassword.trim()) {
      setResetModalError('Account password is required for confirmation.');
      return;
    }

    setResetLoading(true);
    try {
      // Backend protected endpoint DELETE /api/v1/users/me/data
      const res = await API.delete('/users/me/data', {
        data: { password: resetAccountPassword.trim() }
      });

      // Close modal and reset input states
      setIsResetModalOpen(false);
      setResetConfirmWord('');
      setResetAccountPassword('');
      setDangerZoneSuccessMsg(res.data?.message || 'All personal scan history, notifications, and reports have been permanently reset.');
      
      // Refresh AuthContext user state and NotificationContext
      if (refreshUser) await refreshUser();
      if (fetchNotifications) await fetchNotifications();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMsg = typeof detail === 'string' ? detail : 'Failed to reset user data. Please verify your password.';
      setResetModalError(errorMsg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 font-mono text-[10px] font-bold rounded-full border border-cyan-500/40 uppercase">
            PROFILE & PREFERENCES
          </span>
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-100 tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-cyan-400" /> Account & Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage agent details, authentication credentials, and real-time email delivery options</p>
      </div>

      {dangerZoneSuccessMsg && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-mono flex items-center justify-between gap-3 shadow-xl shadow-emerald-950/30 animate-pulse">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{dangerZoneSuccessMsg}</span>
          </div>
          <button onClick={() => setDangerZoneSuccessMsg('')} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-[#0d1424]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl space-y-6">
        {message && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-mono flex items-center gap-2.5 shadow-lg shadow-emerald-950/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-mono flex items-center gap-2.5 shadow-lg shadow-rose-950/20">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Information */}
          <div className="space-y-4">
            <h3 className="font-heading font-extrabold text-sm text-slate-200 border-b border-slate-800/80 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" /> Agent Profile Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Full Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#070b14] border border-slate-800 rounded-xl text-slate-100 text-sm font-mono focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Email Address (Read Only)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-[#070b14]/50 border border-slate-800/80 rounded-xl text-slate-500 text-sm font-mono cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Email Alerts Toggle */}
          <div className="space-y-4">
            <h3 className="font-heading font-extrabold text-sm text-slate-200 border-b border-slate-800/80 pb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" /> Alert Delivery Preferences
            </h3>

            <div className="p-5 bg-[#070b14]/80 rounded-2xl border border-slate-800/90 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-heading font-extrabold text-slate-100 block">High-Risk Detection Email Notifications</span>
                <span className="text-xs text-slate-400 block leading-relaxed max-w-xl">
                  Receive instant dispatch emails whenever a scan detects a high-risk phishing or scam verdict.
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
          </div>

          {/* Password Change */}
          <div className="space-y-4">
            <h3 className="font-heading font-extrabold text-sm text-slate-200 border-b border-slate-800/80 pb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" /> Change Security Password
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-[#070b14] border border-slate-800 rounded-xl text-slate-100 text-sm font-mono focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  New Security Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-[#070b14] border border-slate-800 rounded-xl text-slate-100 text-sm font-mono focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-heading font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition duration-200 active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving Profile Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* DANGER ZONE / DATA & PRIVACY SECTION */}
      <div className="bg-[#0e111a] p-6 sm:p-8 rounded-3xl border border-rose-500/40 shadow-2xl relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 blur-3xl pointer-events-none rounded-full"></div>

        <div className="flex items-center gap-2.5 pb-3 border-b border-rose-500/20">
          <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-rose-400 tracking-tight">Danger Zone: Data & Privacy</h3>
            <p className="text-xs text-slate-400 mt-0.5">Permanent actions regarding your personal security audit footprint</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-5 bg-[#070b14]/90 rounded-2xl border border-rose-500/20">
          <div className="space-y-1">
            <h4 className="text-sm font-heading font-extrabold text-slate-100">Reset All My Scan Data & Activity History</h4>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Permanently purges all your scan records, step-by-step action plan checkoffs, threat alert logs, and generated audit reports. Your user account and credentials remain active.
            </p>
          </div>

          <button
            onClick={() => {
              setIsResetModalOpen(true);
              setResetModalError('');
              setResetConfirmWord('');
              setResetAccountPassword('');
            }}
            className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-heading font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 shrink-0 transition active:scale-[0.98]"
          >
            <Trash2 className="w-4 h-4" /> Reset All Data
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#070b14]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#0d1424] p-6 sm:p-8 rounded-3xl border border-rose-500/50 shadow-2xl space-y-6 relative glow-rose">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/40">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 block">IRREVERSIBLE ACTION</span>
                <h3 className="font-heading font-black text-xl text-slate-100">Reset All Security Data?</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-mono bg-[#070b14]/80 p-4 rounded-2xl border border-slate-800">
              <p className="font-bold text-rose-300">This action will immediately and irreversibly delete:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>All past URL, Email, SMS, and QR scan logs</li>
                <li>All action-plan checklist completion progress</li>
                <li>All high-risk threat notifications & alert center messages</li>
                <li>All generated PDF and CSV report files</li>
                <li>Reset personal security score back to baseline (75)</li>
              </ul>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                Your account (<strong className="text-slate-300">{user?.email}</strong>) will stay active and logged in.
              </p>
            </div>

            {/* Download Data Backup Shortcut */}
            <div className="p-4 bg-cyan-950/30 rounded-2xl border border-cyan-500/30 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" /> Download data backup before resetting:
              </span>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleDownloadBackup('csv')}
                  className="flex-1 py-2 px-3 bg-[#070b14] hover:bg-slate-900 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Backup CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadBackup('pdf')}
                  className="flex-1 py-2 px-3 bg-[#070b14] hover:bg-slate-900 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5" /> Backup PDF
                </button>
              </div>
            </div>

            {resetModalError && (
              <div className="p-3.5 bg-rose-950/70 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{resetModalError}</span>
              </div>
            )}

            {/* Confirmation Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
                  1. Type <span className="text-rose-400 font-black">RESET</span> to confirm:
                </label>
                <input
                  type="text"
                  value={resetConfirmWord}
                  onChange={(e) => setResetConfirmWord(e.target.value)}
                  placeholder="RESET"
                  className="w-full px-4 py-3 bg-[#070b14] border border-slate-800 rounded-xl text-slate-100 text-sm font-mono focus:outline-none focus:border-rose-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
                  2. Re-enter your account password:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                  <input
                    type="password"
                    value={resetAccountPassword}
                    onChange={(e) => setResetAccountPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-[#070b14] border border-slate-800 rounded-xl text-slate-100 text-sm font-mono focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-mono font-bold transition border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetConfirmWord.trim() !== 'RESET' || !resetAccountPassword.trim() || resetLoading}
                onClick={handleExecuteResetData}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-heading font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition"
              >
                {resetLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Purging Data...
                  </span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Permanently Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
