import React, { useState } from 'react';
import {
  X,
  Trash2,
  Clock,
  Bookmark,
  ExternalLink,
  Search,
  Check,
  Copy,
  Sparkles,
  Mail,
} from 'lucide-react';
import { CalculationHistoryItem, ScannedMathResult } from '../types';
import { playKeyClick, triggerHaptic } from '../utils/soundHaptics';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationHistoryItem[];
  savedQuestions: ScannedMathResult[];
  onSelectHistoryItem: (item: CalculationHistoryItem) => void;
  onSelectSavedQuestion: (item: ScannedMathResult) => void;
  onClearHistory: () => void;
  onDeleteSavedQuestion: (id: string) => void;
  onClearSavedQuestions: () => void;
  onEmailHistory?: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  savedQuestions,
  onSelectHistoryItem,
  onSelectSavedQuestion,
  onClearHistory,
  onDeleteSavedQuestion,
  onClearSavedQuestions,
  onEmailHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'calc' | 'saved'>('calc');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    playKeyClick('num');
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredHistory = history.filter(
    (item) =>
      item.expression.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.result.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSaved = savedQuestions.filter(
    (item) =>
      item.cleanEquation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.result.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-md h-full bg-[#080E20] border-l border-cyan-900/30 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-cyan-900/30 bg-[#060b18]/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              History & Bookmarks
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-cyan-900/20 bg-slate-900/40 p-2 gap-2">
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'calc'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Calculations ({history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'saved'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Questions ({savedQuestions.length})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="p-3 border-b border-cyan-900/20">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'calc' ? 'calculations' : 'saved math'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#060b18] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'calc' ? (
            filteredHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <Clock className="w-10 h-10 stroke-1 text-slate-600" />
                <p className="text-sm font-medium">No calculation history yet</p>
                <p className="text-xs">Any calculations made will appear here.</p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectHistoryItem(item)}
                  className="group relative p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="uppercase tracking-wider font-mono">{item.mode}</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="font-mono text-sm text-slate-300 truncate">
                    {item.expression}
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-lg font-bold text-cyan-400">
                      = {item.result}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(item.id, item.result);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                      title="Copy result"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )
          ) : filteredSaved.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <Bookmark className="w-10 h-10 stroke-1 text-slate-600" />
              <p className="text-sm font-medium">No saved math questions</p>
              <p className="text-xs">
                Scan questions using the camera and tap the bookmark icon to save them.
              </p>
            </div>
          ) : (
            filteredSaved.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectSavedQuestion(item)}
                className="group p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800/40 text-[10px] font-semibold">
                    {item.topic}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSavedQuestion(item.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400 transition"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="font-mono text-sm text-white font-medium break-words">
                  {item.cleanEquation}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="font-mono text-xs font-bold text-cyan-300">
                    Ans: {item.result}
                  </span>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(item.searchQuery || item.cleanEquation)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[10px] text-blue-400 hover:underline"
                  >
                    <span>Google Search</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-cyan-900/30 bg-[#060b18]/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {activeTab === 'calc' && history.length > 0 && (
              <>
                <button
                  onClick={onClearHistory}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>

                {onEmailHistory && (
                  <button
                    onClick={onEmailHistory}
                    className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-white transition"
                    title="Email calculation history via Gmail"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Log</span>
                  </button>
                )}
              </>
            )}

            {activeTab === 'saved' && savedQuestions.length > 0 && (
              <button
                onClick={onClearSavedQuestions}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Saved</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
