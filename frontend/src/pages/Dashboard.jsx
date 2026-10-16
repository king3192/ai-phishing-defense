import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import StatsOverview from '../components/dashboard/StatsOverview';
import ThreatCharts from '../components/dashboard/ThreatCharts';
import RecentThreatsFeed from '../components/dashboard/RecentThreatsFeed';
import SecurityScoreWidget from '../components/dashboard/SecurityScoreWidget';
import { Scan, ShieldAlert, Sparkles, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/dashboard/');
        setMetrics(res.data);
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 bg-[#0d1424] px-6 py-4 rounded-2xl border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs shadow-xl glow-cyan">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          Syncing Security Command Metrics...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Hero Banner */}
      <div className="bg-[#0d1424]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 text-cyan-300 text-[10px] font-mono font-bold rounded-full border border-cyan-500/40 tracking-wider uppercase">
              <Activity className="w-3 h-3 text-cyan-400 animate-pulse" /> SECURITY COMMAND CENTER
            </span>
            <span className="px-2.5 py-1 bg-slate-900 text-slate-400 text-[10px] font-mono font-extrabold rounded-full border border-slate-800">
              ACTIVE DEFENSE
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-100 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{user?.name || 'Agent'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real-time AI threat monitoring is active. Run a scan on incoming URLs, emails, SMS text, or QR codes to evaluate phishing signals and trigger action plans.
          </p>
        </div>

        <button
          onClick={() => navigate('/scanner')}
          className="relative z-10 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-heading font-extrabold text-sm rounded-2xl shadow-lg shadow-cyan-500/25 flex items-center gap-3 transition duration-200 shrink-0 group active:scale-[0.98]"
        >
          <Scan className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span>Run New AI Threat Scan</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Top 4 Metrics Overview Cards */}
      <StatsOverview metrics={metrics} />

      {/* Grid: Trend Charts + Security Awareness Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ThreatCharts trends={metrics?.trends} />
        </div>
        <div className="lg:col-span-1">
          <SecurityScoreWidget score={metrics?.personal_security_score} />
        </div>
      </div>

      {/* Real-Time Threats Feed Section */}
      <RecentThreatsFeed threats={metrics?.recent_threats} />
    </div>
  );
}
