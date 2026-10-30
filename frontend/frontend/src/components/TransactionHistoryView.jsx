import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Printer, 
  Receipt, 
  Banknote, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowUpRight,
  User
} from 'lucide-react';
import { getCompletedTransactions } from '../services/posService';

export const TransactionHistoryView = ({ onOpenInvoiceModal }) => {
  const [search, setSearch] = useState('');
  const transactions = getCompletedTransactions();

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase().trim();
    return (
      !q ||
      t.invoiceNumber.toLowerCase().includes(q) ||
      t.customer.name.toLowerCase().includes(q) ||
      (t.customer.vehicleNo && t.customer.vehicleNo.toLowerCase().includes(q))
    );
  });

  const totalSalesRevenue = transactions.reduce((acc, t) => acc + (t.totals.grandTotal || 0), 0);

  return (
    <div className="operations-view history-view w-full space-y-6">
      {/* Header */}
      <div className="history-header glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="history-eyebrow text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold mb-1">
            G.K Automobiles • Audit Logs
          </div>
          <h2 className="history-title text-xl sm:text-2xl font-bold text-white tracking-tight">
            Sales & Invoicing History
          </h2>
          <p className="history-description text-xs text-slate-400 mt-1">
            Archive of all POS counter sales with itemized tax invoices and payment modes.
          </p>
        </div>

        <div className="history-stats flex items-center gap-3 font-mono">
          <div className="history-stat px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-right">
            <div className="history-stat-label text-[10px] text-slate-400 uppercase">Total Transactions</div>
            <div className="history-stat-count text-sm font-extrabold text-white">{transactions.length} Invoices</div>
          </div>
          <div className="history-stat px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-right">
            <div className="history-stat-label text-[10px] text-slate-400 uppercase">Gross Revenue</div>
            <div className="history-stat-revenue text-sm font-extrabold text-emerald-400">₹{Math.round(totalSalesRevenue).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="history-search-panel glass-panel p-4 rounded-3xl border border-slate-800">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions by invoice number (GK-INV-...), customer name, or vehicle number..."
            className="history-search-input w-full glass-input text-slate-100 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none placeholder:text-slate-500 font-mono"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="history-table-panel glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        {filtered.length === 0 ? (
          <div className="history-empty p-12 text-center text-slate-500 text-xs font-mono">
            No completed sales found. Complete transactions at the POS counter to populate this history log.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="history-table w-full text-left text-xs font-mono">
              <thead className="history-table-head bg-slate-900/90 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Customer & Vehicle</th>
                  <th className="py-3.5 px-4">Spares Sold</th>
                  <th className="py-3.5 px-4">Payment Mode</th>
                  <th className="py-3.5 px-4 text-right">Grand Total (₹)</th>
                  <th className="py-3.5 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="history-table-body divide-y divide-slate-800/60">
                {filtered.map((txn) => (
                  <tr key={txn.id} className="history-row hover:bg-slate-900/50 transition-colors">
                    <td className="history-invoice py-3.5 px-4 font-bold text-sky-400">{txn.invoiceNumber}</td>
                    <td className="history-date py-3.5 px-4 text-slate-400">
                      {new Date(txn.createdAt).toLocaleDateString()} {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="history-customer font-bold text-white">{txn.customer.name}</div>
                      <div className="history-vehicle text-[10px] text-sky-300 font-mono">{txn.customer.vehicleNo}</div>
                    </td>
                    <td className="history-items py-3.5 px-4 text-slate-300">
                      {txn.items.length} items ({txn.items.map(i => i.name.split(' ')[0]).join(', ')})
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        txn.paymentMode === 'CREDIT'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : txn.paymentMode === 'UPI'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {txn.paymentMode === 'CREDIT' ? 'Credit Account' : txn.paymentMode === 'UPI' ? 'UPI QR' : 'Cash'}
                      </span>
                    </td>
                    <td className="history-total py-3.5 px-4 text-right font-bold text-emerald-400 text-sm">
                      ₹{txn.totals.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onOpenInvoiceModal(txn)}
                        className="history-receipt-button px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
