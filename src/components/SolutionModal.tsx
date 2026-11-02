import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Search,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  Sparkles,
  Edit2,
  RefreshCw,
  WifiOff,
  Calculator,
  Mail,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScannedMathResult } from '../types';
import { evaluateExpression } from '../utils/mathEvaluator';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { playKeyClick, triggerHaptic } from '../utils/soundHaptics';

interface SolutionModalProps {
  solution: ScannedMathResult | null;
  onClose: () => void;
  onSaveQuestion: (solution: ScannedMathResult) => void;
  isSaved: boolean;
  onInsertToCalculator: (value: string) => void;
  onShareGmail?: (solution: ScannedMathResult) => void;
}

export const SolutionModal: React.FC<SolutionModalProps> = ({
  solution,
  onClose,
  onSaveQuestion,
  isSaved,
  onInsertToCalculator,
  onShareGmail,
}) => {
  const isOnline = useOnlineStatus();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEquation, setEditedEquation] = useState('');
  const [currentResult, setCurrentResult] = useState<ScannedMathResult | null>(null);

  // Sync state with solution
  React.useEffect(() => {
    if (solution) {
      setCurrentResult(solution);
      setEditedEquation(solution.cleanEquation || solution.scannedEquation);
      // Trigger subtle confetti celebratory burst on successful solution
      if (solution.result && solution.result !== 'Syntax Error') {
        try {
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.3 },
            colors: ['#00F0FF', '#3B82F6', '#6366F1'],
          });
        } catch {}
      }
    }
  }, [solution]);

  if (!solution || !currentResult) return null;

  const handleCopy = (text: string) => {
    playKeyClick('num');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReCalculate = () => {
    playKeyClick('action');
    triggerHaptic(15);
    const evalRes = evaluateExpression(editedEquation);
    const updated: ScannedMathResult = {
      ...currentResult,
      cleanEquation: editedEquation,
      searchQuery: editedEquation,
      result: evalRes.success ? String(evalRes.result) : (evalRes.error || 'Syntax Error'),
      explanation: evalRes.success
        ? `Recalculated locally with edited equation: ${editedEquation}.`
        : `Could not evaluate mathematically: ${evalRes.error}. Try searching on Google Search below.`,
    };
    setCurrentResult(updated);
    setIsEditing(false);
  };

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    currentResult.searchQuery || currentResult.cleanEquation || currentResult.scannedEquation
  )}`;

  const handleOpenGoogleSearch = () => {
    playKeyClick('op');
    triggerHaptic(10);
    // Open Google Search safely
    window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0a1126] border border-cyan-800/40 rounded-3xl shadow-2xl shadow-cyan-950/50 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-900/30 bg-[#060b18]/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Solution & Analysis
              </h3>
              <p className="text-[10px] text-cyan-400 font-medium">
                {currentResult.topic}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onShareGmail && (
              <button
                onClick={() => onShareGmail(currentResult)}
                className="p-2 rounded-xl text-rose-300 hover:text-white hover:bg-rose-500/20 transition"
                title="Send Solution via Gmail"
              >
                <Mail className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onSaveQuestion(currentResult)}
              className={`p-2 rounded-xl transition ${
                isSaved
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={isSaved ? 'Question Saved' : 'Save Question'}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-rose-500/20 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Scanned Image Preview Thumbnail (if captured) */}
          {currentResult.imageUrl && (
            <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-slate-800 bg-black/60 shadow-inner group">
              <img
                src={currentResult.imageUrl}
                alt="Scanned math equation"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-medium text-slate-300 border border-white/10">
                Captured Image
              </div>
            </div>
          )}

          {/* Recognized Question Box with Edit Option */}
          <div className="bg-[#0e172e] rounded-2xl p-4 border border-cyan-900/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Recognized Question
              </span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Equation'}</span>
              </button>
            </div>

            {isEditing ? (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={editedEquation}
                  onChange={(e) => setEditedEquation(e.target.value)}
                  className="w-full bg-[#060b18] border border-cyan-500/50 rounded-xl px-3 py-2 text-white font-mono text-base focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={handleReCalculate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-evaluate
                </button>
              </div>
            ) : (
              <div className="font-mono text-lg text-white font-semibold break-words">
                {currentResult.cleanEquation || currentResult.scannedEquation}
              </div>
            )}
          </div>

          {/* Primary Answer Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-[#0B1E3D] to-indigo-950 rounded-2xl p-4 border border-blue-500/40 shadow-lg shadow-blue-900/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Final Answer
              </span>
              <button
                onClick={() => handleCopy(currentResult.result)}
                className="flex items-center gap-1 text-[11px] font-medium text-cyan-200 hover:text-white transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight break-words my-1">
              {currentResult.result}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              {currentResult.explanation}
            </p>
          </div>

          {/* Step-by-Step Breakdown Accordion */}
          {currentResult.steps && currentResult.steps.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Step-by-Step Solution
              </h4>

              <div className="space-y-2">
                {currentResult.steps.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold text-[10px] border border-blue-500/30">
                        {st.stepNumber || idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">
                        {st.title}
                      </span>
                    </div>

                    {st.formula && (
                      <div className="bg-[#060b18] px-2.5 py-1.5 rounded-lg font-mono text-cyan-300 border border-cyan-950 text-[11px] overflow-x-auto">
                        {st.formula}
                      </div>
                    )}

                    <p className="text-slate-400 leading-normal">
                      {st.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real Google Search Action Card */}
          <div className="bg-gradient-to-r from-slate-900 to-[#0e172e] rounded-2xl p-4 border border-cyan-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Google Colors G icon */}
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow">
                  <span className="font-bold text-sm tracking-tighter" style={{ color: '#4285F4' }}>
                    G
                  </span>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Google Search Results</h5>
                  <p className="text-[10px] text-slate-400">
                    Open actual Google search results for this question
                  </p>
                </div>
              </div>

              {!isOnline && (
                <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                  <WifiOff className="w-3 h-3" />
                  Offline
                </span>
              )}
            </div>

            {/* Query Preview */}
            <div className="bg-[#060b18] px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="truncate mr-2">
                "{currentResult.searchQuery || currentResult.cleanEquation}"
              </span>
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>

            {/* Google Search Button */}
            {isOnline ? (
              <a
                href={googleSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  playKeyClick('op');
                  triggerHaptic(10);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition active:scale-98"
              >
                <span>Search This Question on Google</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <div className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 text-amber-300 text-xs text-center border border-amber-500/20">
                Internet required to open Google Search. Connect to Wi-Fi/data.
              </div>
            )}
          </div>

          {/* Email Solution via Gmail Button */}
          {onShareGmail && (
            <button
              type="button"
              onClick={() => onShareGmail(currentResult)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-900/40 via-red-900/30 to-rose-950/40 hover:from-rose-900/60 hover:to-rose-950/60 text-rose-200 border border-rose-500/30 text-xs font-semibold shadow-md transition active:scale-98"
            >
              <Mail className="w-4 h-4 text-rose-400" />
              <span>Email Solution Report via Gmail</span>
            </button>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 border-t border-cyan-900/30 bg-[#060b18]/90 flex items-center gap-2">
          <button
            onClick={() => onInsertToCalculator(currentResult.result)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span>Insert in Calculator</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
