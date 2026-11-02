import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-500/90 text-slate-950 px-4 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md border border-amber-300/40 animate-pulse">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — Math & Local OCR active; Web Search paused</span>
    </div>
  );
};
