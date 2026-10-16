import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Lightbulb, Bookmark, ShieldCheck, Tag, BookOpen } from 'lucide-react';

export default function SecurityTipsPage() {
  const [tips, setTips] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState({});

  const categories = ['All', 'Banking', 'UPI', 'OTP', 'Job', 'Delivery', 'KYC', 'Investment', 'Password'];

  useEffect(() => {
    const fetchTips = async () => {
      setLoading(true);
      try {
        const res = await API.get('/tips/', {
          params: selectedCategory !== 'All' ? { category: selectedCategory } : {}
        });
        setTips(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, [selectedCategory]);

  const toggleBookmark = (id) => {
    setBookmarked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 bg-amber-950/80 text-amber-300 font-mono text-[10px] font-bold rounded-full border border-amber-500/40 uppercase">
            AWARENESS KNOWLEDGEBASE
          </span>
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-100 tracking-tight flex items-center gap-2.5">
          <Lightbulb className="w-7 h-7 text-amber-400" /> Cybersecurity Awareness & Defense Knowledgebase
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Explore verified tips to recognize and neutralize social engineering vectors</p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-bold transition-all duration-200 ${
              selectedCategory === cat
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
                : 'bg-[#0d1424]/80 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-slate-500 font-mono text-xs">
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              Loading cybersecurity intelligence tips...
            </div>
          </div>
        ) : (
          tips.map((t) => (
            <div 
              key={t.id} 
              className="bg-[#0d1424]/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/90 shadow-xl flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all duration-200 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 text-amber-300 font-mono text-[10px] font-extrabold uppercase rounded-xl border border-amber-500/30">
                    <Tag className="w-3 h-3 text-amber-400" /> {t.category}
                  </span>
                  <button
                    onClick={() => toggleBookmark(t.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 transition"
                    title="Bookmark tip"
                  >
                    <Bookmark className={`w-4 h-4 ${bookmarked[t.id] ? 'text-amber-400 fill-amber-400' : ''}`} />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium pt-1">
                  {t.tip_text}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" /> Verified Security Standard
                </span>
                <span className="text-slate-500">Ref #{t.id}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
