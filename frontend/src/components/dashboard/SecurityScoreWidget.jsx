import React from 'react';
import { Award, ShieldCheck, Zap, ShieldAlert } from 'lucide-react';

export default function SecurityScoreWidget({ score }) {
  const currentScore = score || 75;

  let badgeLabel = "Cyber Guardian";
  let color = "text-cyan-400";
  let border = "border-cyan-500/30";
  let bg = "bg-cyan-500/10";

  if (currentScore >= 90) {
    badgeLabel = "Cyber Fortress Elite";
    color = "text-emerald-400";
    border = "border-emerald-500/30";
    bg = "bg-emerald-500/10";
  } else if (currentScore < 60) {
    badgeLabel = "Vulnerable Status";
    color = "text-amber-400";
    border = "border-amber-500/30";
    bg = "bg-amber-500/10";
  }

  return (
    <div className="bg-[#0d1424]/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/90 shadow-xl flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-cyan-400" /> Security Score Index
          </span>
          <h3 className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-slate-100 mt-2">
            {currentScore} <span className="text-xs font-mono text-slate-500 font-normal">/ 100 PTS</span>
          </h3>
        </div>
        <div className={`p-3.5 rounded-2xl border ${border} ${bg} shrink-0`}>
          <ShieldCheck className={`w-7 h-7 ${color}`} />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Awareness Rank Tier:</span>
          <span className={`font-mono font-bold uppercase tracking-wider ${color}`}>{badgeLabel}</span>
        </div>

        <div className="w-full bg-[#070b14] rounded-full h-2.5 overflow-hidden border border-slate-800/80">
          <div
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full transition-all duration-700 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
            style={{ width: `${currentScore}%` }}
          ></div>
        </div>

        <p className="text-[11px] text-slate-400 flex items-start gap-1.5 mt-2 leading-relaxed">
          <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" /> Complete action checklists & review security tips to boost your score index.
        </p>
      </div>
    </div>
  );
}
