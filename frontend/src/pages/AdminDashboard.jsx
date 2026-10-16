import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { ShieldCheck, Users, Scan, ShieldAlert, Plus, Trash2, Tag, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  // New tip form state
  const [newCat, setNewCat] = useState('Banking');
  const [newText, setNewText] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, tipsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/tips/')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setTips(tipsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTip = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    try {
      await API.post('/admin/tips', { category: newCat, tip_text: newText });
      setNewText('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTip = async (id) => {
    try {
      await API.delete(`/admin/tips/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 bg-[#0d1424] px-6 py-4 rounded-2xl border border-rose-500/30 text-rose-400 font-mono font-bold text-xs shadow-xl glow-rose">
          <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
          Authenticating & Loading Admin Console Metrics...
        </div>
      </div>
    );
  }

  const COLORS = ['#f43f5e', '#f59e0b', '#06b6d4', '#10b981', '#8b5cf6', '#ec4899', '#3b82f6'];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-3 py-1 bg-rose-950/80 text-rose-300 font-mono text-[10px] font-bold uppercase rounded-full border border-rose-500/40">
            ADMINISTRATOR PRIVILEGES ACTIVE
          </span>
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-100 tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-cyan-400" /> Platform-Wide Administration Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Global statistics, multi-tenant scan aggregates, user user accounts, and tip management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0d1424]/90 backdrop-blur-xl p-5 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Total User Accounts</span>
          <span className="font-heading font-black text-3xl text-cyan-400 block mt-1">{stats?.total_users}</span>
        </div>
        <div className="bg-[#0d1424]/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Total Platform Scans</span>
          <span className="font-heading font-black text-3xl text-slate-100 block mt-1">{stats?.total_scans}</span>
        </div>
        <div className="bg-[#0d1424]/90 backdrop-blur-xl p-5 rounded-2xl border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Phishing Threats Flagged</span>
          <span className="font-heading font-black text-3xl text-rose-400 block mt-1">{stats?.phishing_scans}</span>
        </div>
        <div className="bg-[#0d1424]/90 backdrop-blur-xl p-5 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Safe Verified Scans</span>
          <span className="font-heading font-black text-3xl text-emerald-400 block mt-1">{stats?.safe_scans}</span>
        </div>
      </div>

      <div className="bg-[#0d1424]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-xl space-y-4">
        <h3 className="font-heading font-extrabold text-base text-slate-100">Platform-Wide Scam Category Distribution</h3>
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.scam_breakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a273e" />
              <XAxis dataKey="scam_type" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" />
              <YAxis stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#070b14', borderColor: '#1a273e', borderRadius: '0.75rem', fontSize: '12px', fontFamily: 'JetBrains Mono' }} 
              />
              <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                {stats?.scam_breakdown?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0d1424]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-xl space-y-5">
        <h3 className="font-heading font-extrabold text-base text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" /> Platform Registered Users
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#070b14] border-b border-slate-800 text-slate-400 font-extrabold uppercase">
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Security Score</th>
                <th className="p-3.5">Total Scans</th>
                <th className="p-3.5">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40">
                  <td className="p-3.5 text-slate-500 font-bold">#{u.id}</td>
                  <td className="p-3.5 font-bold text-slate-100">{u.name}</td>
                  <td className="p-3.5 text-slate-400">{u.email}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase border ${
                      u.role === 'admin' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-emerald-400">{u.security_score}/100</td>
                  <td className="p-3.5 text-slate-200 font-bold">{u.scan_count}</td>
                  <td className="p-3.5 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#0d1424]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-xl space-y-6">
        <h3 className="font-heading font-extrabold text-base text-slate-100">Security Awareness Tip Management</h3>

        <form onSubmit={handleAddTip} className="flex flex-col sm:flex-row gap-3">
          <select
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            className="py-3 px-4 bg-[#070b14] border border-slate-800 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
          >
            {['Banking', 'UPI', 'OTP', 'Job', 'Delivery', 'KYC', 'Investment', 'Password', 'General'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter new security awareness tip..."
            required
            className="flex-1 py-3 px-4 bg-[#070b14] border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
          />

          <button
            type="submit"
            className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-heading font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Security Tip
          </button>
        </form>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {tips.map((t) => (
            <div key={t.id} className="p-3.5 bg-[#070b14]/70 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 font-bold text-[10px] rounded-md border border-amber-500/30 shrink-0">
                  {t.category}
                </span>
                <span className="text-slate-300">{t.tip_text}</span>
              </div>
              <button
                onClick={() => handleDeleteTip(t.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
