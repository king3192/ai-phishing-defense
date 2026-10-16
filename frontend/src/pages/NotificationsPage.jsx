import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, AlertTriangle, CheckCircle2, ExternalLink, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-rose-950/80 text-rose-300 font-mono text-[10px] font-bold rounded-full border border-rose-500/40 uppercase">
              REAL-TIME ALERT CENTER
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-100 tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-cyan-400" /> Security Intelligence Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">High-priority security alerts pushed from the AI threat classification engine</p>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-5 py-2.5 bg-[#0d1424] hover:bg-slate-900 border border-slate-700/80 text-cyan-400 rounded-2xl text-xs font-mono font-bold transition shrink-0 hover:border-cyan-500/40 shadow-md"
        >
          Mark All as Read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-[#0d1424]/90 backdrop-blur-xl p-12 text-center rounded-3xl border border-slate-800/90 shadow-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-lg text-slate-200">No Security Notifications</h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">You are currently clear of active threat alerts.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markAsRead(n.id);
                if (n.scan_id) {
                  navigate('/scanner', { state: { scanId: n.scan_id } });
                }
              }}
              className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start justify-between gap-4 ${
                n.is_read
                  ? 'bg-[#0d1424]/60 border-slate-800/80 text-slate-400 hover:bg-[#0d1424]'
                  : 'bg-rose-950/30 border-rose-500/40 text-slate-100 shadow-lg shadow-rose-950/20 hover:border-rose-500/70'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${n.is_read ? 'bg-slate-900 border border-slate-800 text-slate-500' : 'bg-rose-950/80 text-rose-400 border border-rose-500/40'}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                      n.verdict === 'Phishing' ? 'text-rose-400' : n.verdict === 'Suspicious' ? 'text-amber-400' : 'text-cyan-400'
                    }`}>
                      {n.verdict || 'HIGH RISK'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">{n.message}</p>
                </div>
              </div>

              {n.scan_id && (
                <span className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 shrink-0 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-500/30">
                  Inspect Scan <ExternalLink className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
