import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { History, Search, Filter, Download, ExternalLink, ShieldCheck, ShieldAlert, X, FileText } from 'lucide-react';
import ResultCard from '../components/scanner/ResultCard';

export default function HistoryPage() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [scanType, setScanType] = useState('');
  const [verdict, setVerdict] = useState('');
  const [search, setSearch] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (scanType) params.scan_type = scanType;
      if (verdict) params.verdict = verdict;
      if (search) params.search = search;

      const res = await API.get('/scans/', { params });
      setScans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Data Fetching
  useEffect(() => {
    fetchHistory();
  }, [scanType, verdict]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleExportCSV = async () => {
    try {
      const res = await API.get('/reports/export/csv', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phishguard_threat_report_audit.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Export CSV error:", err);
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await API.get('/reports/export/pdf', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phishguard_executive_threat_report_audit.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Export PDF error:", err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 font-mono text-[10px] font-bold rounded-full border border-cyan-500/40 uppercase">
              THREAT AUDIT TRAIL
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-100 tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-cyan-400" /> Historical Threat Audit Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Search, filter, and inspect detailed scan records & action plans</p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#0d1424] hover:bg-slate-900 border border-slate-700/80 text-slate-100 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition hover:border-cyan-500/40 shadow-md"
            title="Download CSV Audit Log"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition hover:border-cyan-400 shadow-md shadow-cyan-950/30"
            title="Download Official PDF Audit Report"
          >
            <FileText className="w-4 h-4 text-cyan-400" /> Export PDF
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0d1424]/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-800/90 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payload content..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#070b14] border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500 transition"
          />
        </form>

        {/* Scan Type Filter */}
        <select
          value={scanType}
          onChange={(e) => setScanType(e.target.value)}
          className="py-2.5 px-3 bg-[#070b14] border border-slate-800 rounded-xl text-slate-300 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="">All Scan Vectors (URL, Email, SMS, QR)</option>
          <option value="url">URL Links</option>
          <option value="email">Emails</option>
          <option value="sms">SMS / WhatsApp</option>
          <option value="qr">QR Codes</option>
        </select>

        {/* Verdict Filter */}
        <select
          value={verdict}
          onChange={(e) => setVerdict(e.target.value)}
          className="py-2.5 px-3 bg-[#070b14] border border-slate-800 rounded-xl text-slate-300 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="">All Verdicts (Phishing, Suspicious, Safe)</option>
          <option value="Phishing">Phishing</option>
          <option value="Suspicious">Suspicious</option>
          <option value="Safe">Safe</option>
        </select>
      </div>

      {/* History Table */}
      <div className="bg-[#0d1424]/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-800/90 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#070b14]/90 border-b border-slate-800/90 text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">
                <th className="p-4">ID</th>
                <th className="p-4">Vector</th>
                <th className="p-4">Input Snippet</th>
                <th className="p-4">Verdict</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Scam Category</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      Fetching historical threat logs...
                    </div>
                  </td>
                </tr>
              ) : scans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-500">
                    No scan records match the selected parameters.
                  </td>
                </tr>
              ) : (
                scans.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-4 text-slate-500 font-bold">#{s.id}</td>
                    <td className="p-4 uppercase font-bold text-slate-300">{s.scan_type}</td>
                    <td className="p-4 text-slate-300 max-w-xs truncate font-mono">{s.input_content}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold uppercase border ${
                        s.verdict === 'Phishing'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : s.verdict === 'Suspicious'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {s.verdict}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-100">{s.threat_score}/100</td>
                    <td className="p-4 text-slate-400">{s.scam_type || 'None'}</td>
                    <td className="p-4 text-slate-500 text-[11px]">
                      {new Date(s.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedScan(s)}
                        className="px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1 ml-auto transition"
                      >
                        Inspect <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 bg-[#070b14]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative my-8">
            <button
              onClick={() => setSelectedScan(null)}
              className="absolute top-4 right-4 p-2.5 bg-slate-900 text-slate-400 hover:text-white rounded-full z-50 border border-slate-800 shadow-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
            <ResultCard scan={selectedScan} />
          </div>
        </div>
      )}
    </div>
  );
}
