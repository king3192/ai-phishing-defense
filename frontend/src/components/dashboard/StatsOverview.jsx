import React from 'react';
import { Scan, ShieldCheck, ShieldAlert, AlertTriangle, TrendingUp, Zap } from 'lucide-react';

export default function StatsOverview({ metrics }) {
  if (!metrics) return null;

  const stats = [
    {
      title: 'Total Scans Logged',
      value: metrics.total_scans,
      icon: Scan,
      color: 'text-cyan-400',
      border: 'border-cyan-500/30 hover:border-cyan-500/60',
      bg: 'bg-[#0d1424]/90',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.1)]',
      subtitle: 'Analyzed via NLP & Vision'
    },
    {
      title: 'Safe Communications',
      value: metrics.safe_count,
      icon: ShieldCheck,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      bg: 'bg-[#0d1424]/90',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
      subtitle: 'Verified clean payloads'
    },
    {
      title: 'Phishing & Fraud Threats',
      value: metrics.phishing_count + metrics.suspicious_count,
      icon: ShieldAlert,
      color: 'text-rose-400',
      border: 'border-rose-500/30 hover:border-rose-500/60',
      bg: 'bg-[#0d1424]/90',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.1)]',
      subtitle: `${metrics.phishing_count} High Risk / ${metrics.suspicious_count} Medium`
    },
    {
      title: 'Personal Risk Level',
      value: metrics.personal_risk_level,
      icon: AlertTriangle,
      color: metrics.personal_risk_level === 'High' ? 'text-rose-400' : metrics.personal_risk_level === 'Medium' ? 'text-amber-400' : 'text-emerald-400',
      border: metrics.personal_risk_level === 'High' ? 'border-rose-500/40' : metrics.personal_risk_level === 'Medium' ? 'border-amber-500/40' : 'border-emerald-500/40',
      bg: 'bg-[#0d1424]/90',
      glow: metrics.personal_risk_level === 'High' ? 'shadow-[0_0_20px_rgba(244,63,94,0.15)]' : 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      subtitle: `Top Scam: ${metrics.top_scam_type || 'None'}`
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item, idx) => (
        <div 
          key={idx} 
          className={`p-5 rounded-2xl border ${item.border} ${item.bg} ${item.glow} backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 flex items-start justify-between relative overflow-hidden group`}
        >
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              {item.title}
            </span>
            <span className={`font-heading font-black text-3xl tracking-tight block ${item.color}`}>
              {item.value}
            </span>
            <span className="text-[11px] font-mono text-slate-500 block mt-2">
              {item.subtitle}
            </span>
          </div>

          <div className={`p-3 rounded-xl bg-slate-900/90 border border-slate-800 shrink-0 group-hover:scale-110 transition-transform`}>
            <item.icon className={`w-5 h-5 ${item.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
