import React from 'react';
import {
  X,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Vibrate,
  Sliders,
  RotateCcw,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { AppSettings, AngleMode } from '../types';
import { playKeyClick, triggerHaptic } from '../utils/soundHaptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetAllData: () => void;
  onOpenApkModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetAllData,
  onOpenApkModal,
}) => {
  if (!isOpen) return null;

  const handleThemeChange = (theme: 'dark' | 'light') => {
    playKeyClick('num');
    triggerHaptic(10);
    onUpdateSettings({ theme });
  };

  const handleAngleChange = (angleMode: AngleMode) => {
    playKeyClick('num');
    triggerHaptic(10);
    onUpdateSettings({ angleMode });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-md bg-[#0a1126] border border-cyan-800/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-cyan-900/30 bg-[#060b18]/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Settings & Preferences
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Theme Option (Dark / Light) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Display Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border transition ${
                  settings.theme === 'dark'
                    ? 'bg-blue-600/30 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold">Dark (OLED Blue)</span>
              </button>

              <button
                onClick={() => handleThemeChange('light')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border transition ${
                  settings.theme === 'light'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold">Light Mode</span>
              </button>
            </div>
          </div>

          {/* Angle Mode Default */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Angle Measurement Unit
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAngleChange('DEG')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition ${
                  settings.angleMode === 'DEG'
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-sm'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Degrees (DEG)
              </button>
              <button
                onClick={() => handleAngleChange('RAD')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition ${
                  settings.angleMode === 'RAD'
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-sm'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Radians (RAD)
              </button>
            </div>
          </div>

          {/* Feedback & Interaction (Sound & Haptics) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Tactile Feedback
            </label>
            <div className="space-y-2">
              {/* Sound Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  {settings.sound ? (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-white">Keypad Sound Effects</div>
                    <div className="text-[10px] text-slate-400">Audio clicks on button tap</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.sound}
                  onChange={(e) => onUpdateSettings({ sound: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              {/* Haptics Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Vibrate className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Haptic Vibration</div>
                    <div className="text-[10px] text-slate-400">Tactile vibration on mobile taps</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.haptics}
                  onChange={(e) => onUpdateSettings({ haptics: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Decimal Precision */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Decimal Precision
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 2, 4, 6].map((p) => (
                <button
                  key={p}
                  onClick={() => onUpdateSettings({ precision: p })}
                  className={`py-2 rounded-xl text-xs font-mono font-medium border transition ${
                    settings.precision === p
                      ? 'bg-blue-600 border-blue-400 text-white shadow'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p === 0 ? 'Auto' : `${p} dec`}
                </button>
              ))}
            </div>
          </div>

          {/* Android APK GitHub Release Info */}
          <div className="pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenApkModal?.();
              }}
              type="button"
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/40 text-left hover:border-blue-400 transition"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-600/30 text-cyan-300">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-white">Android Debug APK</div>
                  <div className="text-[10px] text-cyan-300">GitHub Actions automated builds & releases</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-blue-400 underline">View</span>
            </button>
          </div>

          {/* Data Reset */}
          <div className="pt-1">
            <button
              onClick={() => {
                if (window.confirm('Reset all calculation history, bookmarks and settings to defaults?')) {
                  onResetAllData();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All App Data</span>
            </button>
          </div>

          {/* App Info */}
          <div className="p-3 rounded-2xl bg-[#060b18] border border-cyan-950 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ScanCalc AI v2.0 • Android App & PWA</span>
            </div>
            <p>
              Features on-device OCR with Tesseract.js, Gemini AI math reasoning, and real Google Search.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-900/30 bg-[#060b18]/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md transition"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
