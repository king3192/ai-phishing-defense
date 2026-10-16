import React, { useState, useEffect } from 'react';
import { Loader2, Zap } from 'lucide-react';

export default function ServerWakeBanner() {
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    const handleWake = (e) => {
      setWaking(Boolean(e.detail?.waking));
    };

    window.addEventListener('phishguard-server-wake', handleWake);
    return () => window.removeEventListener('phishguard-server-wake', handleWake);
  }, []);

  if (!waking) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-amber-500/20 border-b border-amber-500/40 text-amber-200 px-4 py-2.5 text-xs font-mono flex items-center justify-center gap-3 backdrop-blur-md sticky top-0 z-50 animate-pulse">
      <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
      <span>
        <strong>Waking up the cloud server...</strong> Free-tier servers sleep after inactivity. Please wait ~30–50 seconds while your request retries automatically.
      </span>
    </div>
  );
}
