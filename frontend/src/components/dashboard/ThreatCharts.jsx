import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function ThreatCharts({ trends }) {
  if (!trends || trends.length === 0) return null;

  return (
    <div className="bg-[#0d1424]/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/90 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-extrabold text-base text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" /> Threat Scan Activity Trends
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">7-Day volume breakdown of Safe vs Phishing detections</p>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPhishing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.45}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.45}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a273e" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" />
            <YAxis stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" allowDecimals={false} />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#070b14', 
                borderColor: '#1a273e', 
                borderRadius: '0.75rem', 
                fontSize: '12px',
                fontFamily: 'JetBrains Mono',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
              }}
              itemStyle={{ color: '#f1f5f9' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '10px' }} />
            <Area type="monotone" dataKey="phishing" name="Phishing Detections" stroke="#f43f5e" fillOpacity={1} fill="url(#colorPhishing)" strokeWidth={2.5} />
            <Area type="monotone" dataKey="safe" name="Safe Scans" stroke="#10b981" fillOpacity={1} fill="url(#colorSafe)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
