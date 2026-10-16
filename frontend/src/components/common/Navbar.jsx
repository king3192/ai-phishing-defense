import React from 'react';
import { ShieldCheck, Cpu, Activity, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user } = useAuth();
  const score = user?.security_score ?? 75;

  let scoreColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (score < 60) scoreColor = "text-rose-400 border-rose-500/30 bg-rose-500/10";
  else if (score < 80) scoreColor = "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";

  return (
    <header className="h-16 bg-[#070b14]/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/40 border border-cyan-500/30 rounded-full text-xs font-mono font-semibold text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
          <Cpu className="w-3.5 h-3.5 animate-pulse text-cyan-300" />
          <span>ML Core: Operational v2.4</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time Notification Bell & Unread Count Badge */}
        <NotificationBell />
        
        <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>
        
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl border text-xs font-semibold ${scoreColor}`}>
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Security Score: <strong className="font-heading font-black">{score}</strong>/100</span>
        </div>
      </div>
    </header>
  );
}
