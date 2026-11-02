import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  FileText,
  Inbox,
  LogOut,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Calculator,
  Bookmark,
} from 'lucide-react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import {
  sendGmailMessage,
  createGmailDraft,
  listRecentGmailMessages,
  GmailMessageSummary,
  SendEmailPayload,
} from '../services/gmail';
import { ConfirmEmailModal } from './ConfirmEmailModal';
import { CalculationHistoryItem, ScannedMathResult } from '../types';

interface GmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipient?: string;
  initialSubject?: string;
  initialBody?: string;
  currentInput?: string;
  lastEquation?: string;
  history?: CalculationHistoryItem[];
  savedQuestions?: ScannedMathResult[];
}

export const GmailModal: React.FC<GmailModalProps> = ({
  isOpen,
  onClose,
  initialRecipient = '',
  initialSubject = '',
  initialBody = '',
  currentInput = '',
  lastEquation = '',
  history = [],
  savedQuestions = [],
}) => {
  const { user, accessToken, isAuthenticated, loading: authLoading, error: authError, login, logout } = useGoogleAuth();

  const [activeTab, setActiveTab] = useState<'compose' | 'inbox'>('compose');
  const [to, setTo] = useState(initialRecipient);
  const [subject, setSubject] = useState(initialSubject || 'ScanCalc AI: Math Solution & Notes');
  const [body, setBody] = useState(initialBody);

  // Inbox state
  const [inboxMessages, setInboxMessages] = useState<GmailMessageSummary[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageSummary | null>(null);

  // Status feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmation dialog
  const [pendingConfirm, setPendingConfirm] = useState<{
    payload: SendEmailPayload;
    actionType: 'send' | 'draft';
  } | null>(null);

  // Update fields when initial props change
  useEffect(() => {
    if (initialRecipient) setTo(initialRecipient);
    if (initialSubject) setSubject(initialSubject);
    if (initialBody) setBody(initialBody);
  }, [initialRecipient, initialSubject, initialBody]);

  // Load inbox messages if authenticated and on inbox tab
  useEffect(() => {
    if (isAuthenticated && accessToken && activeTab === 'inbox' && inboxMessages.length === 0) {
      loadInbox();
    }
  }, [isAuthenticated, accessToken, activeTab]);

  const loadInbox = async () => {
    if (!accessToken) return;
    setLoadingInbox(true);
    setActionError(null);
    try {
      const messages = await listRecentGmailMessages(accessToken, 10);
      setInboxMessages(messages);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to fetch Gmail inbox messages.');
    } finally {
      setLoadingInbox(false);
    }
  };

  if (!isOpen) return null;

  const handleInsertCurrentCalc = () => {
    const text = `Current Calculation:\n${lastEquation ? `${lastEquation} = ` : ''}${currentInput}\n`;
    setBody((prev) => (prev ? `${prev}\n\n${text}` : text));
  };

  const handleInsertHistory = () => {
    if (!history.length) return;
    const historyText = history
      .slice(0, 5)
      .map((h) => `${h.expression} = ${h.result}`)
      .join('\n');
    const text = `Recent Calculations:\n${historyText}\n`;
    setBody((prev) => (prev ? `${prev}\n\n${text}` : text));
  };

  const handleInsertSavedMath = () => {
    if (!savedQuestions.length) return;
    const latest = savedQuestions[0];
    const text = `Saved Problem: ${latest.cleanEquation || latest.scannedEquation}\nAnswer: ${latest.result}\nExplanation: ${latest.explanation}\n`;
    setBody((prev) => (prev ? `${prev}\n\n${text}` : text));
  };

  const handleRequestSend = (actionType: 'send' | 'draft') => {
    setActionError(null);
    setActionSuccess(null);

    if (!to && actionType === 'send') {
      setActionError('Please specify a recipient email address.');
      return;
    }

    if (!body.trim()) {
      setActionError('Email body cannot be empty.');
      return;
    }

    setPendingConfirm({
      payload: {
        to: to.trim(),
        subject: subject.trim() || 'ScanCalc AI Math Note',
        body: body.trim(),
        isHtml: body.includes('</div>') || body.includes('<br>'),
      },
      actionType,
    });
  };

  const handleExecuteConfirmedAction = async () => {
    if (!pendingConfirm || !accessToken) return;

    setIsSubmitting(true);
    setActionError(null);
    try {
      if (pendingConfirm.actionType === 'send') {
        await sendGmailMessage(pendingConfirm.payload, accessToken);
        setActionSuccess(`Email successfully sent to ${pendingConfirm.payload.to}!`);
        // Reset compose form
        setBody('');
        setTo('');
      } else {
        await createGmailDraft(pendingConfirm.payload, accessToken);
        setActionSuccess('Email saved as draft in your Gmail account!');
      }
      setPendingConfirm(null);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to complete Gmail action.');
      setPendingConfirm(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 select-none overflow-y-auto">
        <div className="relative w-full max-w-xl bg-[#080e22] border border-cyan-800/40 rounded-3xl shadow-2xl shadow-cyan-950/60 flex flex-col max-h-[92vh] overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-900/30 bg-[#050916]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-[1.5px] flex items-center justify-center shadow-lg shadow-red-500/20">
                <div className="w-full h-full bg-[#0a1128] rounded-[10px] flex items-center justify-center">
                  <Mail className="w-4 h-4 text-rose-400" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>Gmail Integration</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    Google Workspace
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Email solutions, calculations, and math problem reports
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

          {/* User Auth Banner */}
          <div className="px-5 py-3 border-b border-cyan-900/20 bg-[#070c1e] flex flex-wrap items-center justify-between gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-cyan-500/50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>{user.displayName || 'Google User'}</span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Connected
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Sign in with Google to send math reports and access Gmail.</span>
              </div>
            )}

            <div>
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  disabled={authLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/50 hover:text-rose-300 text-slate-300 border border-slate-700/80 text-xs font-medium transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                /* Standard Google Sign-In button adhering to Google brand guidelines */
                <button
                  onClick={login}
                  disabled={authLoading}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{authLoading ? 'Signing in...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-cyan-900/20 bg-slate-900/50 p-2 gap-2">
            <button
              onClick={() => setActiveTab('compose')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'compose'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compose / Send Math</span>
            </button>

            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'inbox'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Recent Inbox Messages</span>
            </button>
          </div>

          {/* Feedback alerts */}
          {actionSuccess && (
            <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {actionError && (
            <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{actionError}</span>
            </div>
          )}

          {authError && (
            <div className="mx-5 mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{authError}</span>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === 'compose' ? (
              <div className="space-y-3.5">
                {/* Quick Math Insert Shortcuts */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    Insert Math:
                  </span>
                  <button
                    onClick={handleInsertCurrentCalc}
                    type="button"
                    className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 flex items-center gap-1 transition"
                  >
                    <Calculator className="w-3 h-3 text-cyan-400" />
                    <span>Current Calc ({currentInput})</span>
                  </button>
                  {savedQuestions.length > 0 && (
                    <button
                      onClick={handleInsertSavedMath}
                      type="button"
                      className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 flex items-center gap-1 transition"
                    >
                      <Bookmark className="w-3 h-3 text-amber-400" />
                      <span>Saved Math</span>
                    </button>
                  )}
                  {history.length > 0 && (
                    <button
                      onClick={handleInsertHistory}
                      type="button"
                      className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 flex items-center gap-1 transition"
                    >
                      <FileText className="w-3 h-3 text-blue-400" />
                      <span>Recent History ({history.length})</span>
                    </button>
                  )}
                </div>

                {/* Recipient Field */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Recipient Email (To):
                  </label>
                  <input
                    type="email"
                    placeholder="student@example.com or colleague@example.com"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full bg-[#060b18] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Subject:
                  </label>
                  <input
                    type="text"
                    placeholder="ScanCalc AI: Math Solution & Steps"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#060b18] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Body Field */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Email Content / Solution Details:
                  </label>
                  <textarea
                    rows={7}
                    placeholder="Type notes, explanations, or use 'Insert Math' buttons above to generate a complete report..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full bg-[#060b18] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 font-mono leading-relaxed focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleRequestSend('draft')}
                    disabled={!isAuthenticated}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700/80 transition disabled:opacity-40"
                    title={!isAuthenticated ? 'Sign in with Google first' : 'Save draft to Gmail'}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Save to Drafts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRequestSend('send')}
                    disabled={!isAuthenticated}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition disabled:opacity-40 active:scale-98"
                    title={!isAuthenticated ? 'Sign in with Google first' : 'Send email'}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send via Gmail</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Inbox Tab */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Primary Inbox Messages
                  </span>
                  <button
                    onClick={loadInbox}
                    disabled={loadingInbox || !isAuthenticated}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 disabled:opacity-40 transition"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingInbox ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {!isAuthenticated ? (
                  <div className="text-center py-10 text-slate-500 space-y-2">
                    <Mail className="w-10 h-10 mx-auto text-slate-600 stroke-1" />
                    <p className="text-xs font-medium">Sign in with Google to read your messages</p>
                    <button
                      onClick={login}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
                    >
                      Connect Gmail
                    </button>
                  </div>
                ) : loadingInbox ? (
                  <div className="text-center py-10 text-slate-400 text-xs flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Loading messages from Gmail...</span>
                  </div>
                ) : inboxMessages.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No recent primary messages found in your inbox.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {inboxMessages.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}
                        className={`p-3 rounded-2xl border transition cursor-pointer text-xs ${
                          selectedMessage?.id === msg.id
                            ? 'bg-blue-950/40 border-cyan-500/50'
                            : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-slate-200 truncate mr-2">
                            {msg.from || 'Unknown Sender'}
                          </span>
                          <span className="text-slate-500 text-[10px] shrink-0 font-mono">
                            {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <div className="font-medium text-slate-300 truncate">
                          {msg.subject || '(No Subject)'}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                          {msg.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory explicit confirmation modal before sending email or saving draft */}
      <ConfirmEmailModal
        isOpen={Boolean(pendingConfirm)}
        onClose={() => setPendingConfirm(null)}
        onConfirm={handleExecuteConfirmedAction}
        payload={pendingConfirm?.payload || null}
        actionType={pendingConfirm?.actionType}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
