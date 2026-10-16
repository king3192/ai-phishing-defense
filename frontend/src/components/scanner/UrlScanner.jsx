import React, { useState, useEffect } from 'react';
import { Globe, ArrowRight, ShieldAlert, AlertCircle, Link as LinkIcon, Cpu } from 'lucide-react';

export default function UrlScanner({ onScan, loading, initialValue = '' }) {
  const [url, setUrl] = useState(initialValue);
  const [interaction, setInteraction] = useState('none');

  useEffect(() => {
    if (initialValue) setUrl(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onScan({ scan_type: 'url', content: url.trim(), interaction_level: interaction });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
          Target Web Address / Suspicious URL
        </label>
        <div className="relative">
          <Globe className="w-5 h-5 text-slate-500 absolute left-4 top-4" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste web link (e.g. http://sbi-secure-update.net/login)..."
            required
            className="w-full pl-12 pr-4 py-4 bg-[#070b14] border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-sm transition duration-200"
          />
        </div>
      </div>

      <div className="bg-[#070b14]/70 p-4 rounded-2xl border border-slate-800/90 space-y-2.5">
        <label className="block text-xs font-semibold text-slate-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-cyan-400" /> Interaction Status (Used for Action Plan tailoring):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: 'none', label: "I haven't clicked it" },
            { id: 'clicked', label: "I clicked link, entered nothing" },
            { id: 'entered_info', label: "I entered banking / credentials" },
          ].map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setInteraction(item.id)}
              className={`py-2.5 px-3.5 rounded-xl text-xs font-medium border text-left transition duration-200 ${
                interaction === item.id
                  ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-semibold'
                  : 'bg-[#0d1424]/60 border-slate-800 text-slate-400 hover:border-slate-700/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-heading font-extrabold text-sm rounded-2xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
      >
        {loading ? (
          <span className="flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-cyan-200 animate-spin" />
            Analyzing Lexical & Domain WHOIS Signals...
          </span>
        ) : (
          <>
            Analyze URL Threat Level <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
