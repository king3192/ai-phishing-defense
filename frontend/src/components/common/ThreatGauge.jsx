import React from 'react';

export default function ThreatGauge({ score, size = 190 }) {
  const normalizedScore = Math.min(100, Math.max(0, score || 0));
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Semi-circle gauge
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let color = "#10b981"; // Safe Emerald
  let label = "SAFE VERDICT";
  let glowClass = "shadow-[0_0_20px_rgba(16,185,129,0.2)]";

  if (normalizedScore >= 65) {
    color = "#f43f5e"; // Phishing Crimson
    label = "PHISHING DETECTED";
    glowClass = "shadow-[0_0_25px_rgba(244,63,94,0.3)]";
  } else if (normalizedScore >= 30) {
    color = "#f59e0b"; // Suspicious Amber
    label = "SUSPICIOUS";
    glowClass = "shadow-[0_0_20px_rgba(245,158,11,0.25)]";
  }

  return (
    <div className="flex flex-col items-center justify-center relative select-none py-2">
      <svg width={size} height={size / 1.7} viewBox={`0 0 ${size} ${size / 2 + 12}`}>
        {/* Background Track */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="#1a273e"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Animated Score Progress */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s ease" }}
        />
      </svg>
      {/* Center Label & Score */}
      <div className="text-center -mt-10">
        <span className="font-heading font-black text-4xl tracking-tight block" style={{ color }}>
          {normalizedScore}
        </span>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block -mt-1">
          / 100 Risk Score Index
        </span>
        <div className={`mt-2.5 inline-block px-3 py-1 text-[10px] font-mono font-black uppercase tracking-wider rounded-full ${glowClass}`}
             style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}45` }}>
          {label}
        </div>
      </div>
    </div>
  );
}
