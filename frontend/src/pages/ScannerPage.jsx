import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import UrlScanner from '../components/scanner/UrlScanner';
import TextScanner from '../components/scanner/TextScanner';
import QrScanner from '../components/scanner/QrScanner';
import ResultCard from '../components/scanner/ResultCard';
import API from '../services/api';
import { Globe, Mail, MessageSquare, QrCode, Scan, ShieldAlert, Cpu } from 'lucide-react';

export default function ScannerPage() {
  const [activeTab, setActiveTab] = useState('url');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [prefillText, setPrefillText] = useState('');
  const location = useLocation();

  useEffect(() => {
    // If navigated from notification or history with scanId state
    if (location.state?.scanId) {
      fetchExistingScan(location.state.scanId);
    }

    // Handle shared text/link from Android share intent or query params (?shared=, ?text=, ?url=)
    const searchParams = new URLSearchParams(location.search);
    const shared = searchParams.get('shared') || searchParams.get('text') || searchParams.get('url');
    if (shared) {
      const trimmed = shared.trim();
      setPrefillText(trimmed);
      const isUrl = /^https?:\/\//i.test(trimmed) || trimmed.startsWith('www.');
      if (isUrl) {
        setActiveTab('url');
      } else {
        setActiveTab('sms');
      }
    }
  }, [location.state, location.search]);

  const fetchExistingScan = async (scanId) => {
    try {
      setLoading(true);
      const res = await API.get(`/scans/${scanId}`);
      setScanResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanSubmit = async (scanData) => {
    setLoading(true);
    setError('');
    setScanResult(null);

    try {
      const res = await API.post('/scans/', scanData);
      setScanResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Scan execution failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'url', label: 'URL / Link Vector', icon: Globe },
    { id: 'email', label: 'Email Content Vector', icon: Mail },
    { id: 'sms', label: 'SMS / WhatsApp Vector', icon: MessageSquare },
    { id: 'qr', label: 'QR Code Matrix Vector', icon: QrCode },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 font-mono text-[10px] font-bold rounded-full border border-cyan-500/40 uppercase">
            AI DETECTION PIPELINE
          </span>
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-100 tracking-tight flex items-center gap-2.5">
          <Scan className="w-7 h-7 text-cyan-400" /> Multi-Vector Threat Scanner
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Select input vector below to scan URLs, raw emails, text messages, or QR payloads using NLP feature extractors and lexical heuristics.
        </p>
      </div>

      {/* Scanner Input Container */}
      <div className="bg-[#0d1424]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl space-y-6">
        {/* Tab Headers */}
        <div className="flex flex-wrap gap-2.5 border-b border-slate-800/80 pb-5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id);
                setScanResult(null);
                setError('');
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl font-mono text-xs font-bold transition-all duration-200 ${
                activeTab === t.id
                  ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-transparent text-cyan-300 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20'
                  : 'bg-[#070b14]/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700/80'
              }`}
            >
              <t.icon className={`w-4 h-4 ${activeTab === t.id ? 'text-cyan-400' : 'text-slate-500'}`} />
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-mono flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Body */}
        {activeTab === 'url' && <UrlScanner onScan={handleScanSubmit} loading={loading} initialValue={prefillText} />}
        {activeTab === 'email' && <TextScanner scanType="email" onScan={handleScanSubmit} loading={loading} initialValue={prefillText} />}
        {activeTab === 'sms' && <TextScanner scanType="sms" onScan={handleScanSubmit} loading={loading} initialValue={prefillText} />}
        {activeTab === 'qr' && <QrScanner onScan={handleScanSubmit} loading={loading} />}
      </div>

      {/* Scan Results Output Card */}
      {scanResult && <ResultCard scan={scanResult} />}
    </div>
  );
}
