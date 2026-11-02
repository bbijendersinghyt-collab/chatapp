import React from 'react';
import {
  X,
  Smartphone,
  Download,
  Github,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Play,
} from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GITHUB_REPO = 'bbijendersinghyt-collab/day-born--apk';
const REPO_URL = `https://github.com/${GITHUB_REPO}`;
const RELEASES_URL = `${REPO_URL}/releases`;
const ACTIONS_URL = `${REPO_URL}/actions`;
const DIRECT_APK_URL = `${RELEASES_URL}/latest/download/ScanCalcAI-debug.apk`;

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-md bg-[#0a1126] border border-cyan-800/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-cyan-900/30 bg-[#060b18]/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Smartphone className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Download Android APK
              </h3>
              <p className="text-[10px] text-cyan-400 font-mono">
                {GITHUB_REPO}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Main Download Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/70 via-[#0D1B36] to-indigo-950/70 border border-blue-500/30 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-white" />
                <span className="font-bold text-white text-sm">ScanCalc AI Debug APK</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                GitHub Release
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              The automated GitHub Actions workflow compiles the Android APK and attaches the installable package directly to GitHub Releases.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              {/* Direct APK Download Button */}
              <a
                href={DIRECT_APK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-95 transition-all text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 border border-white/20"
              >
                <Download className="w-4 h-4" />
                <span>Direct Download ScanCalcAI-debug.apk</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              {/* View GitHub Releases Link */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={RELEASES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium flex items-center justify-center gap-1.5 text-[11px] transition"
                >
                  <Github className="w-3.5 h-3.5 text-cyan-400" />
                  <span>All Releases</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>

                <a
                  href={ACTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium flex items-center justify-center gap-1.5 text-[11px] transition"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Actions Runs</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Push & Build Instructions */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Push Code to Trigger Automatic Build
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              To trigger the GitHub Actions build on <code className="text-cyan-300 font-mono">{GITHUB_REPO}</code>, run:
            </p>
            <div className="bg-black/80 p-2.5 rounded-xl font-mono text-[10px] text-cyan-300 space-y-1 border border-slate-800 select-all overflow-x-auto">
              <div>git add .</div>
              <div>git commit -m "feat: ScanCalc AI with Android APK GitHub workflow"</div>
              <div>git push -u origin main</div>
            </div>
          </div>

          {/* Step-by-Step Installation Guide */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              How to Install on Your Android Phone
            </h4>

            <div className="space-y-1.5">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <div>
                  <p className="font-semibold text-white">Download APK</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    Download <code className="text-cyan-300">ScanCalcAI-debug.apk</code> from GitHub Releases.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <div>
                  <p className="font-semibold text-white">Enable Unknown Sources</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    In Android Settings, toggle on <strong>Allow from this source</strong> for Chrome/Browser.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <div>
                  <p className="font-semibold text-white">Install & Open</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    Tap Install. Open ScanCalc AI for offline calculation and camera math scanning!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-900/30 bg-[#060b18]/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
