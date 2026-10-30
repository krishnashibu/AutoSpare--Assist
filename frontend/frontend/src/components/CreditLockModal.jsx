import React from 'react';
import { 
  Lock, 
  ShieldAlert, 
  AlertTriangle, 
  UserCheck, 
  X, 
  ArrowRight, 
  Clock, 
  BellRing,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { CREDIT_LOCK_THRESHOLD } from '../constants/categories';

export const CreditLockModal = ({
  isOpen,
  onClose,
  lockedRequest,
  onSwitchToManager,
  addToast
}) => {
  if (!isOpen || !lockedRequest) return null;

  const { customer, totals, id, evaluation } = lockedRequest;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border-2 border-amber-500/50 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon & Title */}
        <div className="text-center pb-5 mb-5 border-b border-slate-800">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border-2 border-amber-500/40 shadow-xl shadow-amber-950/60 mb-3 animate-pulse">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <div className="inline-block text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold mb-1">
            Credit Control Security Lock
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Transaction Locked
          </h2>
          <p className="text-xs text-amber-300 font-mono mt-1">
            Approval Request ID: <span className="text-white font-bold">{id}</span>
          </p>
        </div>

        {/* Breach Summary Details */}
        <div className="space-y-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white font-bold mb-0.5">Threshold Policy Violation</strong>
              Credit purchase of <strong className="text-amber-300">₹{totals.grandTotal.toLocaleString()}</strong> exceeds the ₹15,000 auto-approval ceiling.
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Customer Account:</span>
              <span className="text-white font-bold">{customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Vehicle Number:</span>
              <span className="text-sky-400">{customer.vehicleNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Outstanding:</span>
              <span className="text-slate-200">₹{customer.currentOutstanding.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">This Purchase:</span>
              <span className="text-amber-400 font-bold">₹{totals.grandTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800">
              <span className="text-slate-300">Target Outstanding Balance:</span>
              <span className="text-rose-400 font-extrabold text-sm">
                ₹{(customer.currentOutstanding + totals.grandTotal).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono">
            <BellRing className="w-4 h-4 text-sky-400 animate-bounce" />
            <span>Notification dispatched to Store Manager Suresh Patel.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onSwitchToManager();
              onClose();
            }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Open Manager Review & Authorization Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-2xl border border-slate-800 transition-colors"
          >
            Keep on Hold & Return to POS Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
