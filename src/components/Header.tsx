import React from 'react';
import { History, Settings, Sparkles, Download, Smartphone, Mail } from 'lucide-react';
import { CalculatorMode } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  mode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenApkModal: () => void;
  onOpenGmail: () => void;
  isGmailConnected?: boolean;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  onOpenHistory,
  onOpenSettings,
  onOpenApkModal,
  onOpenGmail,
  isGmailConnected,
  savedCount,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  return (
    <header className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-cyan-900/30 bg-[#060B18]/80 dark:bg-[#060B18]/90 light:bg-slate-100/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-blue-700 via-cyan-500 to-blue-400 p-[1.5px] shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
            <span className="text-cyan-400 font-black text-xs tracking-tighter">fx</span>
          </div>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-sm sm:text-base tracking-tight bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              ScanCalc <span className="text-cyan-400">AI</span>
            </h1>
          </div>
          <p className="text-[9px] sm:text-[10px] text-slate-400 -mt-0.5 font-medium tracking-wide">
            Android Smart Math
          </p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center bg-slate-900/90 light:bg-slate-200 p-1 rounded-xl border border-slate-800/80 light:border-slate-300 shadow-inner">
        <button
          onClick={() => onModeChange('standard')}
          type="button"
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            mode === 'standard'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
          }`}
        >
          Basic
        </button>
        <button
          onClick={() => onModeChange('scientific')}
          type="button"
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            mode === 'scientific'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
          }`}
        >
          Scientific
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {/* Gmail Action Button */}
        <button
          onClick={onOpenGmail}
          type="button"
          title={isGmailConnected ? 'Gmail Connected - Open Workspace' : 'Connect Gmail to send math reports'}
          className="relative p-2 rounded-xl text-rose-300 hover:text-white hover:bg-rose-500/20 light:text-rose-600 transition"
        >
          <Mail className="w-4 h-4" />
          {isGmailConnected && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </button>

        {/* Android APK Download Button */}
        <button
          onClick={onOpenApkModal}
          type="button"
          title="Get Android APK (GitHub Actions & Releases)"
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">APK</span>
        </button>

        {/* PWA Install Button if available */}
        {isInstallable && !isInstalled && (
          <button
            onClick={install}
            type="button"
            title="Install ScanCalc App"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PWA</span>
          </button>
        )}

        {/* History & Saved questions */}
        <button
          onClick={onOpenHistory}
          type="button"
          title="Calculation History & Saved Questions"
          aria-label="History"
          className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 light:text-slate-700 light:hover:bg-slate-200 transition"
        >
          <History className="w-4 h-4" />
          {savedCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-3.5 h-3.5 text-[9px] font-bold rounded-full bg-cyan-500 text-slate-950">
              {savedCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          type="button"
          title="App Settings"
          aria-label="Settings"
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 light:text-slate-700 light:hover:bg-slate-200 transition"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
