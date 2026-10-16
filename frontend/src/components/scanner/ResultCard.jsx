import React from 'react';
import ThreatGauge from '../common/ThreatGauge';
import ExplainabilityPanel from './ExplainabilityPanel';
import ActionChecklist from './ActionChecklist';
import { ShieldAlert, ShieldCheck, Download, AlertTriangle, ExternalLink, Activity, FileText } from 'lucide-react';

export default function ResultCard({ scan }) {
  if (!scan) return null;

  const isPhishing = scan.verdict === 'Phishing';
  const isSuspicious = scan.verdict === 'Suspicious';

  const handleExportCSV = () => {
    window.open(`/api/v1/reports/export/csv?scan_id=${scan.id}`, '_blank');
  };

  const handleExportPDF = () => {
    window.open(`/api/v1/reports/export/pdf?scan_id=${scan.id}`, '_blank');
  };

  let borderTop = 'border-t-emerald-500 glow-emerald';
  if (isPhishing) borderTop = 'border-t-rose-500 glow-rose';
  else if (isSuspicious) borderTop = 'border-t-amber-500 glow-amber';

  return (
    <div className={`bg-[#0d1424]/95 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-slate-800/90 border-t-4 transition duration-300 space-y-6 shadow-2xl ${borderTop}`}>
      {/* Header Verdict Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className={`p-4 rounded-2xl shrink-0 ${
            isPhishing ? 'bg-rose-950/70 text-rose-400 border border-rose-500/50 shadow-md shadow-rose-950/40' :
            isSuspicious ? 'bg-amber-950/70 text-amber-400 border border-amber-500/50 shadow-md shadow-amber-950/40' :
            'bg-emerald-950/70 text-emerald-400 border border-emerald-500/50 shadow-md shadow-emerald-950/40'
          }`}>
            {isPhishing || isSuspicious ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">AI DETECTED VERDICT</span>
            </div>
            <h3 className="font-heading font-black text-2xl sm:text-3xl tracking-wide uppercase mt-0.5">
              VERDICT: <span className={isPhishing ? 'text-rose-400' : isSuspicious ? 'text-amber-400' : 'text-emerald-400'}>{scan.verdict}</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono truncate max-w-lg mt-1 bg-[#070b14]/60 px-3 py-1 rounded-lg border border-slate-800/80">
              Payload: {scan.input_content}
            </p>
          </div>
        </div>

        {/* Export Report Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-[#070b14] hover:bg-slate-900 border border-slate-700/80 text-slate-200 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition hover:border-cyan-500/50"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition hover:border-cyan-400 shadow-md shadow-cyan-950/20"
          >
            <FileText className="w-4 h-4 text-cyan-400" /> Export PDF
          </button>
        </div>
      </div>

      {/* Main Grid: Gauge + Meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-1 flex justify-center py-2 border-r-0 md:border-r border-slate-800/80 pr-0 md:pr-6">
          <ThreatGauge score={scan.threat_score} size={200} />
        </div>

        <div className="md:col-span-2 space-y-4">
          {scan.scam_type && scan.scam_type !== 'None' && (
            <div className="bg-rose-950/40 p-4 rounded-2xl border border-rose-500/35">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 block mb-1.5">
                Scam Classification Category
              </span>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-500/20 text-rose-200 font-mono font-bold text-xs rounded-xl border border-rose-500/40">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> {scan.scam_type}
              </div>
            </div>
          )}

          <ExplainabilityPanel signals={scan.explainability} verdict={scan.verdict} />
        </div>
      </div>

      {/* Action Plan Engine Checklist */}
      <ActionChecklist steps={scan.action_plan} />
    </div>
  );
}
