import React from 'react';
import { Mail, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { SendEmailPayload } from '../services/gmail';

interface ConfirmEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  payload: SendEmailPayload | null;
  actionType?: 'send' | 'draft';
  isSubmitting?: boolean;
}

export const ConfirmEmailModal: React.FC<ConfirmEmailModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  payload,
  actionType = 'send',
  isSubmitting = false,
}) => {
  if (!isOpen || !payload) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0c142b] border border-cyan-800/50 rounded-2xl shadow-2xl p-5 space-y-4 text-white animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-cyan-900/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Mail className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold tracking-wide">
                Confirm {actionType === 'send' ? 'Sending Email' : 'Saving Draft'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Action requires your explicit authorization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 bg-[#060b18] p-3.5 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Recipient (To):</span>
            <div className="font-mono text-cyan-300 font-semibold break-all mt-0.5">
              {payload.to}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Subject:</span>
            <div className="text-slate-200 font-medium break-all mt-0.5">
              {payload.subject}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Message Preview:</span>
            <div className="text-slate-400 max-h-28 overflow-y-auto mt-1 p-2 bg-[#091122] rounded border border-slate-800/80 font-mono text-[11px] whitespace-pre-wrap">
              {payload.isHtml ? payload.body.replace(/<[^>]*>/g, '') : payload.body}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            This will directly {actionType === 'send' ? 'dispatch an email from' : 'create a draft in'} your authorized Google Gmail account.
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Sending...</span>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm & Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
