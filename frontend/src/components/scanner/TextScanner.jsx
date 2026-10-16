import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowRight, AlertCircle, FileText, Cpu, Mail } from 'lucide-react';

export default function TextScanner({ scanType, onScan, loading, initialValue = '' }) {
  const [text, setText] = useState(initialValue);
  const [interaction, setInteraction] = useState('none');

  useEffect(() => {
    if (initialValue) setText(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onScan({ scan_type: scanType, content: text.trim(), interaction_level: interaction });
  };

  const placeholder = scanType === 'email'
    ? "Paste email headers & message body (e.g. 'Dear customer, your account 4829 has been suspended. Verify immediately at http://sbi-secure-update.net/login')..."
    : "Paste SMS or WhatsApp message text (e.g. 'You received Rs 25,000 cashback! Claim your reward by entering UPI PIN here: http://phonepe-cashback-claim.xyz')...";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
          {scanType === 'email' ? <Mail className="w-4 h-4 text-cyan-400" /> : <MessageSquare className="w-4 h-4 text-cyan-400" />}
          {scanType === 'email' ? 'Raw Email Header & Body Content' : 'SMS / WhatsApp Message Text'}
        </label>
        <div className="relative">
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            required
            className="w-full p-4 bg-[#070b14] border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-mono transition duration-200 resize-none leading-relaxed"
          />
        </div>
      </div>

      <div className="bg-[#070b14]/70 p-4 rounded-2xl border border-slate-800/90 space-y-2.5">
        <label className="block text-xs font-semibold text-slate-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-cyan-400" /> Interaction Status:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: 'none', label: "Haven't interacted" },
            { id: 'clicked', label: "Clicked link / Replied" },
            { id: 'entered_info', label: "Shared OTP / Credentials" },
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
        disabled={loading || !text.trim()}
        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-heading font-extrabold text-sm rounded-2xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
      >
        {loading ? (
          <span className="flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-cyan-200 animate-spin" />
            Executing NLP Feature Extractor...
          </span>
        ) : (
          <>
            Scan {scanType.toUpperCase()} Message Payload <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
