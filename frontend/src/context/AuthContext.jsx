import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('phishguard_token');
      if (token) {
        document.cookie = `phishguard_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error("Failed to authenticate session:", err);
          localStorage.removeItem('phishguard_token');
          document.cookie = "phishguard_token=; path=/; max-age=0";
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('phishguard_token', res.data.access_token);
    document.cookie = `phishguard_token=${res.data.access_token}; path=/; max-age=2592000; SameSite=Lax`;
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password, role = 'user') => {
    const res = await API.post('/auth/register', { name, email, password, role });
    localStorage.setItem('phishguard_token', res.data.access_token);
    document.cookie = `phishguard_token=${res.data.access_token}; path=/; max-age=2592000; SameSite=Lax`;
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('phishguard_token');
    document.cookie = "phishguard_token=; path=/; max-age=0";
    if (window.PhishGuardBridge && typeof window.PhishGuardBridge.onUserLogout === 'function') {
      try {
        window.PhishGuardBridge.onUserLogout();
      } catch (e) {
        console.warn("Bridge logout notice error:", e);
      }
    }
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await API.put('/auth/profile', data);
    setUser(res.data);
    return res.data;
  };

  const refreshUser = async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
