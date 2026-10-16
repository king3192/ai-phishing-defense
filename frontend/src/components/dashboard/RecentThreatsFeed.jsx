import React from 'react';
import { ShieldAlert, ArrowUpRight, AlertTriangle, Globe, MessageSquare, QrCode, Mail, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RecentThreatsFeed({ threats }) {
  const navigate = useNavigate();

  if (!threats || threats.length === 0) {
    return (
      <div className="bg-[#0d1424]/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/90 text-center shadow-xl">
        <ShieldAlert className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
        <h4 className="font-heading font-extrabold text-base text-slate-100">No Recent Threats Flagged</h4>
        <p className="text-xs text-slate-400 mt-1 font-mono">Your recent security scans have come back clean!</p>
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'url': return Globe;
      case 'qr': return QrCode;
      case 'email': return Mail;
      default: return MessageSquare;
    }
  };

  return (
    <div className="bg-[#0d1424]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-extrabold text-base text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> Live Flagged Threats Feed
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">High & medium risk items classified by AI engine</p>
        </div>
        <button
          onClick={() => navigate('/history')}
          className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 transition"
        >
          View Full Audit Log <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {threats.map((item) => {
          const TypeIcon = getIcon(item.scan_type);
          return (
            <div
              key={item.id}
              onClick={() => navigate('/history')}
              className="p-4 bg-[#070b14]/80 hover:bg-slate-900/80 border border-slate-800/90 hover:border-rose-500/50 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-3 bg-rose-950/60 text-rose-400 rounded-xl border border-rose-500/30 shrink-0 group-hover:scale-105 transition-transform">
                  <TypeIcon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-200 uppercase">{item.scan_type}</span>
                    {item.scam_type && item.scam_type !== 'None' && (
                      <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 bg-rose-500/15 text-rose-300 rounded-md border border-rose-500/30">
                        {item.scam_type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono truncate">{item.input_content}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-xs font-heading font-black text-rose-400 block">{item.threat_score}/100</span>
                  <span className="text-[10px] font-mono text-slate-500 block">Risk Score</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
