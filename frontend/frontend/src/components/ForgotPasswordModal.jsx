import React, { useState } from 'react';
import { KeyRound, Mail, X, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { requestPasswordReset } from '../services/authService';

export const ForgotPasswordModal = ({ isOpen, onClose, addToast }) => {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setResultMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your Employee ID or registered email.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordReset(identifier);
      setResultMessage(res.message);
      addToast({
        type: 'success',
        title: 'Reset Authorization Sent',
        message: 'Security token and supervisor authorization alert generated.'
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to locate staff account.');
      addToast({
        type: 'error',
        title: 'Account Lookup Failed',
        message: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Staff Password Recovery
            </h3>
            <p className="text-xs text-slate-400">
              GK Auto Spares Security Authorization
            </p>
          </div>
        </div>

        {resultMessage ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-semibold mb-1">Reset Request Dispatched</strong>
                {resultMessage}
              </div>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <div>Default Testing Passwords:</div>
              <div className="font-mono text-sky-400">• Counter Staff: <span className="text-white">Password@123</span></div>
              <div className="font-mono text-amber-400">• Store Manager: <span className="text-white">Manager@2026</span></div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your official Employee ID or email address. The system will issue a supervisor clearance token to reset your terminal credentials.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Staff ID or Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="e.g. GK-STF-101 or rajesh.k@gkautospares.in"
                  className="w-full glass-input text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none placeholder:text-slate-500 font-mono"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Searching...' : 'Send Request'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
