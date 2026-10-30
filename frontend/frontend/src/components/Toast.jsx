import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const Toast = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let Icon = Info;
        let colorClasses = 'border-sky-500/40 bg-slate-900/95 text-sky-300 shadow-xl shadow-sky-950/40';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          colorClasses = 'border-emerald-500/40 bg-slate-900/95 text-emerald-300 shadow-xl shadow-emerald-950/40';
        } else if (toast.type === 'error') {
          Icon = XCircle;
          colorClasses = 'border-rose-500/40 bg-slate-900/95 text-rose-300 shadow-xl shadow-rose-950/40';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          colorClasses = 'border-amber-500/40 bg-slate-900/95 text-amber-300 shadow-xl shadow-amber-950/40';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${colorClasses}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              {toast.title && <div className="font-bold text-white mb-0.5">{toast.title}</div>}
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
