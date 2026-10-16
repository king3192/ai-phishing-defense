import React, { useState } from 'react';
import { CheckSquare, Square, ShieldCheck, ListChecks, Sparkles } from 'lucide-react';
import API from '../../services/api';
import confetti from 'canvas-confetti';

export default function ActionChecklist({ steps: initialSteps }) {
  const [steps, setSteps] = useState(initialSteps || []);

  const handleToggle = async (stepId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      setSteps(prev => prev.map(s => s.id === stepId ? { ...s, is_checked: newStatus } : s));
      
      await API.post('/scans/action-step/toggle', {
        step_id: stepId,
        is_checked: newStatus
      });

      // Trigger celebratory confetti if all completed!
      const updated = steps.map(s => s.id === stepId ? { ...s, is_checked: newStatus } : s);
      if (updated.every(s => s.is_checked)) {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error("Failed to toggle action step:", err);
    }
  };

  if (!steps || steps.length === 0) return null;

  const completedCount = steps.filter(s => s.is_checked).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-[#070b14]/90 p-6 rounded-2xl border border-cyan-500/40 space-y-5 shadow-xl glow-cyan">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-heading font-extrabold text-sm text-slate-100 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-cyan-400" /> "What Should I Do?" — Incident Action Plan
          </h4>
          <p className="text-xs text-slate-400 mt-1">Check off steps as you complete them to mitigate your security & financial risk.</p>
        </div>
        <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-3.5 py-1.5 rounded-full border border-cyan-500/40 shadow-sm shrink-0">
          {progressPct}% Completed ({completedCount}/{steps.length})
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#0d1424] rounded-full h-2.5 overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
          style={{ width: `${progressPct}%` }}
        ></div>
      </div>

      {/* Step List */}
      <div className="space-y-3 pt-1">
        {steps.map((step, idx) => (
          <div
            key={step.id || idx}
            onClick={() => handleToggle(step.id, step.is_checked)}
            className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 select-none ${
              step.is_checked
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200 shadow-sm'
                : 'bg-[#0d1424]/80 border-slate-800 text-slate-200 hover:border-cyan-500/50 hover:bg-[#0d1424]'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {step.is_checked ? (
                <CheckSquare className="w-5 h-5 text-emerald-400" />
              ) : (
                <Square className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div className="flex-1 text-xs font-medium leading-relaxed">
              <span className="font-mono font-bold text-cyan-400 mr-2 uppercase">Step {idx + 1}:</span>
              <span className={step.is_checked ? 'line-through text-slate-400' : ''}>{step.step_text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
