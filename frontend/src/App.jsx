import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ServerWakeBanner from './components/common/ServerWakeBanner';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ScannerPage from './pages/ScannerPage';
import HistoryPage from './pages/HistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import SecurityTipsPage from './pages/SecurityTipsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="flex items-center gap-3 bg-[#0d1424] px-6 py-4 rounded-2xl border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs shadow-xl glow-cyan">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          Authenticating PhishGuard AI Session...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ServerWakeBanner />
        <Navbar />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#070b14]">
      <ServerWakeBanner />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/scanner" element={<ProtectedLayout><ScannerPage /></ProtectedLayout>} />
        <Route path="/scan" element={<ProtectedLayout><ScannerPage /></ProtectedLayout>} />
        <Route path="/history" element={<ProtectedLayout><HistoryPage /></ProtectedLayout>} />
        <Route path="/notifications" element={<ProtectedLayout><NotificationsPage /></ProtectedLayout>} />
        <Route path="/tips" element={<ProtectedLayout><SecurityTipsPage /></ProtectedLayout>} />
        <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
      
      <Route path="/admin" element={
        <ProtectedLayout>
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        </ProtectedLayout>
      } />

      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </div>
  );
}
