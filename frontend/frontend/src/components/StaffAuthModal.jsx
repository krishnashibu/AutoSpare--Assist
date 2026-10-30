import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  ScanBarcode, 
  User, 
  Lock, 
  Zap, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ROLES } from '../constants/roles';
import { loginStaff } from '../services/authService';

export const StaffAuthModal = ({ isOpen, onClose, currentUser, onStaffChange, addToast }) => {
  const [selectedRole, setSelectedRole] = useState(currentUser?.role || 'COUNTER_STAFF');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleQuickSwitch = async (roleKey, id, pwd) => {
    setIsLoading(true);
    setError('');
    try {
      const session = await loginStaff({
        identifier: id,
        password: pwd,
        role: roleKey,
        rememberMe: true
      });
      onStaffChange(session);
      addToast({
        type: 'success',
        title: 'Staff Switched Successfully',
        message: `Active terminal operator changed to ${session.fullName} (${ROLES[roleKey].label}).`
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please provide Employee ID and password.');
      return;
    }

    setIsLoading(true);
    try {
      const session = await loginStaff({
        identifier,
        password,
        role: selectedRole,
        rememberMe: true
      });
      onStaffChange(session);
      addToast({
        type: 'success',
        title: 'Authenticated',
        message: `Welcome, ${session.fullName}!`
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold mb-1">
            Terminal Staff Authentication
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Switch Staff Operator or Role
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Select an account to operate the POS counter or review credit locks.
          </p>
        </div>

        {/* 1-Click Fast Switch Buttons */}
        <div className="mb-6 space-y-2.5">
          <div className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Fast 1-Click Profile Switch
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Counter Staff */}
            <button
              onClick={() => handleQuickSwitch('COUNTER_STAFF', 'GK-STF-101', 'Password@123')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                currentUser?.role === 'COUNTER_STAFF'
                  ? 'border-sky-500 bg-sky-500/15 ring-1 ring-sky-500/50'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <ScanBarcode className="w-4 h-4" /> Counter Staff
                </span>
                {currentUser?.role === 'COUNTER_STAFF' && (
                  <span className="text-[10px] bg-sky-500 text-white px-2 py-0.5 rounded-full font-mono">
                    Active
                  </span>
                )}
              </div>
              <div className="font-semibold text-sm text-slate-200">Rajesh Kumar</div>
              <div className="text-[10px] text-slate-400 font-mono">ID: GK-STF-101 (Billing & Scanner)</div>
            </button>

            {/* Store Manager */}
            <button
              onClick={() => handleQuickSwitch('STORE_MANAGER', 'GK-MGR-001', 'Manager@2026')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                currentUser?.role === 'STORE_MANAGER'
                  ? 'border-amber-500 bg-amber-500/15 ring-1 ring-amber-500/50'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Store Manager
                </span>
                {currentUser?.role === 'STORE_MANAGER' && (
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full font-mono">
                    Active
                  </span>
                )}
              </div>
              <div className="font-semibold text-sm text-slate-200">Suresh Patel</div>
              <div className="text-[10px] text-slate-400 font-mono">ID: GK-MGR-001 (Credit Approver)</div>
            </button>
          </div>
        </div>

        {/* Custom Staff Login Form */}
        <form onSubmit={handleCustomLogin} className="space-y-3 pt-3 border-t border-slate-800">
          <div className="text-xs font-mono text-slate-300 font-semibold">
            Or Sign In with Specific ID:
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Employee ID / Email"
                className="w-full glass-input text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none placeholder:text-slate-500 font-mono"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full glass-input text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Sign In'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
