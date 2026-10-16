import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, Cpu, Activity } from 'lucide-react';

export default function ExplainabilityPanel({ signals, verdict }) {
  if (!signals || signals.length === 0) return null;

  const isSafe = verdict === 'Safe';

  return (
    <div className="bg-[#070b14]/80 p-5 rounded-2xl border border-slate-800/90 space-y-3">
      <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <Cpu className="w-4 h-4 text-cyan-400" /> AI Threat Intelligence — Explainability Signals
      </h4>
      <div className="space-y-2">
        {signals.map((sig, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs font-mono text-slate-300 leading-relaxed bg-[#0d1424]/60 p-2.5 rounded-xl border border-slate-800/60">
            {isSafe ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <span>{sig}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
