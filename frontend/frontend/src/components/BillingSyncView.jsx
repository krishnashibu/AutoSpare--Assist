import React, { useState } from 'react';
import { 
  RefreshCw, 
  Database, 
  Server, 
  CheckCircle2, 
  Terminal, 
  ArrowRight, 
  Layers, 
  Activity,
  Sparkles
} from 'lucide-react';
import { getBillingSyncLogs, getCompletedTransactions, logBillingSync } from '../services/posService';

export const BillingSyncView = ({ addToast }) => {
  const [syncLogs, setSyncLogs] = useState(getBillingSyncLogs());
  const [isSyncing, setIsSyncing] = useState(false);
  const transactions = getCompletedTransactions();

  const handleManualSync = async () => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 600));

    // Generate dummy sync event for recent records
    const simulatedLog = {
      id: 'SYNC-' + Date.now(),
      timestamp: new Date().toISOString(),
      invoiceNumber: 'BATCH-SYNC-' + Math.floor(100 + Math.random() * 900),
      action: 'FULL_STOCK_AND_SALES_RECONCILIATION',
      status: '200_OK_SUCCESS',
      payloadItemsCount: transactions.length,
      amount: transactions.reduce((a, t) => a + t.totals.grandTotal, 0),
      paymentMode: 'MULTI_BATCH',
      remoteGateway: 'http://billing-engine.gkautospares.local:8080/api/v1/sync'
    };

    const updated = [simulatedLog, ...syncLogs];
    setSyncLogs(updated);
    setIsSyncing(false);

    addToast({
      type: 'success',
      title: 'Bi-directional Sync Completed',
      message: `Synchronized ${transactions.length} sales records with GK Auto Spares billing software.`
    });
  };

  return (
    <div className="operations-view billing-sync-view w-full space-y-6">
      {/* Header */}
      <div className="sync-header glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="sync-eyebrow text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold mb-1">
            Integration Gateway & Accounting Bridge
          </div>
          <h2 className="sync-title text-xl sm:text-2xl font-bold text-white tracking-tight">
            Existing Billing System Connector
          </h2>
          <p className="sync-description text-xs text-slate-400 mt-1">
            REST API bi-directional synchronization bridge connecting Autospare Assist with legacy billing accounting.
          </p>
        </div>

        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="sync-manual-button px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-950/60 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing with Billing...' : 'Trigger Manual Sync Now'}</span>
        </button>
      </div>

      {/* Gateway Status Cards */}
      <div className="sync-status-grid grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="sync-status-card glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[10px] uppercase">Gateway Status</div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>CONNECTED & ACTIVE</span>
          </div>
          <div className="text-[10px] text-slate-500">Latency: 14ms (Local Network)</div>
        </div>

        <div className="sync-status-card glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[10px] uppercase">Remote Endpoint</div>
          <div className="text-sky-300 font-bold text-xs truncate">
            http://billing-engine.gkautospares.local:8080
          </div>
          <div className="text-[10px] text-slate-500">Protocol: JSON REST over HTTPS</div>
        </div>

        <div className="sync-status-card glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[10px] uppercase">Data Consistency</div>
          <div className="text-purple-400 font-bold text-sm">
            100% In-Sync (0 Conflicts)
          </div>
          <div className="text-[10px] text-slate-500">Auto-Sync on each sale completion</div>
        </div>
      </div>

      {/* Live Stream Console */}
      <div className="sync-log-panel glass-panel rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono text-xs">
          <span className="text-slate-300 font-bold flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            Billing API Event Stream Logs
          </span>
          <span className="text-slate-500 text-[10px]">Real-time Transaction Exchange</span>
        </div>

        <div className="sync-log-list bg-slate-950 p-4 rounded-2xl border border-slate-900 font-mono text-xs space-y-2 max-h-96 overflow-y-auto">
          <div className="text-emerald-400">
            [GATEWAY ONLINE] Autospare Assist POS Terminal POS-04 authenticated with GK Billing Engine.
          </div>

          {syncLogs.length === 0 ? (
            <div className="text-slate-600 italic py-2">
              Waiting for transaction activity to stream payloads...
            </div>
          ) : (
            syncLogs.map((log) => (
              <div key={log.id} className="sync-log-entry text-slate-300 p-2.5 rounded-xl bg-slate-900/60 border border-slate-900 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-purple-400 font-bold">[{log.status}] {log.action}</span>
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Target: <span className="text-slate-300">{log.remoteGateway}</span> • Invoice: <span className="text-sky-300">{log.invoiceNumber}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
