import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, ExternalLink, ShieldAlert } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-700/60"
        title="Security Alerts Drawer"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-mono font-bold text-[9px] flex items-center justify-center rounded-full border-2 border-[#070b14] animate-pulse ring-2 ring-rose-500/30">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0e1726]/95 backdrop-blur-2xl z-50 p-4 rounded-2xl shadow-2xl border border-slate-800/90 glow-cyan">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" /> Security Intelligence Drawer
              </h4>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto my-3 space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">No active security alerts.</p>
                </div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markAsRead(n.id);
                      if (n.scan_id) {
                        navigate('/scanner', { state: { scanId: n.scan_id } });
                      }
                      setOpen(false);
                    }}
                    className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex gap-3 ${
                      n.is_read
                        ? 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-900/60'
                        : 'bg-rose-950/30 border-rose-500/40 text-slate-100 hover:border-rose-500/70 shadow-sm'
                    }`}
                  >
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${n.is_read ? 'text-slate-500' : 'text-rose-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                          n.verdict === 'Phishing' ? 'text-rose-400' : n.verdict === 'Suspicious' ? 'text-amber-400' : 'text-cyan-400'
                        }`}>
                          {n.verdict || 'ALERT'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-medium leading-relaxed truncate">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setOpen(false);
                }}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 w-full py-1.5 rounded-lg hover:bg-slate-800/50 transition"
              >
                View Full Alert Log <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
