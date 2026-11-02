import React, { useRef, useEffect } from 'react';
import { Delete, Copy, Check } from 'lucide-react';
import { AngleMode, CalculatorMode } from '../types';

interface CalculatorDisplayProps {
  expression: string;
  currentInput: string;
  liveResult?: string;
  angleMode: AngleMode;
  mode: CalculatorMode;
  onBackspace: () => void;
  onToggleAngleMode: () => void;
  onClear: () => void;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  expression,
  currentInput,
  liveResult,
  angleMode,
  mode,
  onBackspace,
  onToggleAngleMode,
}) => {
  const [copied, setCopied] = React.useState(false);
  const displayEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to right when typing long formulas
  useEffect(() => {
    if (displayEndRef.current) {
      displayEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
    }
  }, [expression, currentInput]);

  const handleCopy = () => {
    const textToCopy = currentInput || expression || '0';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const displayText = currentInput || '0';

  return (
    <div className="w-full px-5 py-3 sm:py-4 flex flex-col justify-end bg-gradient-to-b from-[#060b18] to-[#0c162e] light:from-slate-50 light:to-slate-100 border-b border-cyan-900/30 light:border-slate-200 min-h-[140px] sm:min-h-[160px] select-text">
      {/* Top status bar: DEG/RAD toggle & actions */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {mode === 'scientific' && (
            <button
              onClick={onToggleAngleMode}
              type="button"
              className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold tracking-wider bg-cyan-950/60 light:bg-blue-100 text-cyan-400 light:text-blue-700 border border-cyan-700/40 light:border-blue-300 hover:bg-cyan-900/60 transition"
              title="Click to toggle between Degrees and Radians"
            >
              {angleMode}
            </button>
          )}

          {expression && (
            <span className="text-xs sm:text-sm font-mono text-slate-400 light:text-slate-600 truncate max-w-[220px]">
              {expression}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            type="button"
            className="p-1.5 rounded-xl text-slate-400 hover:text-cyan-300 light:hover:text-blue-600 hover:bg-slate-800/50 light:hover:bg-slate-200 transition text-xs"
            title="Copy current value"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={onBackspace}
            type="button"
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 light:hover:bg-slate-200 transition"
            title="Delete last character (Backspace)"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Number / Expression Display (Google Calculator styling) */}
      <div className="overflow-x-auto no-scrollbar text-right py-1">
        <div className="inline-block min-w-full">
          <span className="text-4xl sm:text-5xl font-mono font-medium tracking-tight text-white light:text-slate-900 drop-shadow-sm transition-all whitespace-nowrap">
            {displayText}
          </span>
          <span ref={displayEndRef} />
        </div>
      </div>

      {/* Live Result Preview (Google Calculator style) */}
      <div className="h-6 flex items-center justify-end">
        {liveResult && liveResult !== displayText && (
          <span className="text-sm sm:text-base font-mono font-medium text-cyan-400/90 light:text-blue-600 animate-fade-in">
            = {liveResult}
          </span>
        )}
      </div>
    </div>
  );
};
