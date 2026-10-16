import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldAlert, 
  Scan, 
  LayoutDashboard, 
  History, 
  Bell, 
  Lightbulb, 
  User, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Threat Scanner', path: '/scanner', icon: Scan },
    { name: 'Scan History', path: '/history', icon: History },
    { name: 'Alerts', path: '/notifications', icon: Bell },
    { name: 'Security Tips', path: '/tips', icon: Lightbulb },
    { name: 'Profile & Settings', path: '/profile', icon: User },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Portal', path: '/admin', icon: ShieldCheck });
  }

  return (
    <aside className="w-64 bg-[#090e1a]/90 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between hidden md:flex shrink-0 min-h-screen relative z-20">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/25 text-white ring-1 ring-white/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-heading font-black text-lg text-slate-100 tracking-tight leading-none">PhishGuard</h1>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-400/90 tracking-widest uppercase block mt-1">AI Defense Engine v2.4</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-4 pt-6 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
          Navigation Control
        </div>
        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent text-cyan-300 border border-cyan-500/35 shadow-[0_0_20px_rgba(6,182,212,0.12)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 hover:border-slate-700/50 border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                <span>{item.name}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-3 bg-[#0d1424] rounded-xl border border-slate-800 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-900/80 to-slate-900 flex items-center justify-center font-heading font-black text-cyan-300 border border-cyan-500/30 text-sm shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-100 truncate">{user?.name || 'Agent User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold rounded uppercase ${
                  user?.role === 'admin' 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25'
                }`}>
                  {user?.role || 'user'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition border border-transparent hover:border-rose-500/30"
            title="Log Out Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
