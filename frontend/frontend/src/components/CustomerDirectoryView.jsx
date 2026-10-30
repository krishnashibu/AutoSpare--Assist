import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  Car, 
  CreditCard, 
  Building2, 
  Plus, 
  ShieldCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { getStoredCustomers } from '../services/posService';
import { CREDIT_LOCK_THRESHOLD } from '../constants/categories';

export const CustomerDirectoryView = ({ onSelectCustomerForBilling, onOpenAddCustomerModal }) => {
  const [search, setSearch] = useState('');
  const customers = getStoredCustomers();

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase().trim();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.vehicleNo.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  const totalOutstanding = customers.reduce((acc, c) => acc + (c.currentOutstanding || 0), 0);

  return (
    <div className="customer-credit-view w-full space-y-6">
      {/* Header */}
      <div className="customer-credit-header glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="customer-credit-eyebrow text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1">
            G.K Automobiles • Ledger & Accounts
          </div>
          <h2 className="customer-credit-title text-xl sm:text-2xl font-bold text-white tracking-tight">
            Customer Directory & Credit Balances
          </h2>
          <p className="customer-credit-description text-xs text-slate-400 mt-1">
            Maintain garage accounts, vehicle details, and track credit limits.
          </p>
        </div>

        <div className="customer-credit-stats flex items-center gap-3 font-mono">
          <div className="customer-credit-stat px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-right">
            <div className="customer-credit-stat-label text-[10px] text-slate-400 uppercase">Registered Customers</div>
            <div className="customer-credit-total-count text-sm font-extrabold text-white">{customers.length} Accounts</div>
          </div>
          <div className="customer-credit-stat px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-right">
            <div className="customer-credit-stat-label text-[10px] text-slate-400 uppercase">Total Outstanding Credit</div>
            <div className="customer-credit-total-balance text-sm font-extrabold text-amber-400">₹{totalOutstanding.toLocaleString()}</div>
          </div>
          <button
            onClick={onOpenAddCustomerModal}
            className="customer-add-button px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ New Customer</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="customer-search-panel glass-panel p-4 rounded-3xl border border-slate-800">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer by name, garage, phone, or vehicle number..."
            className="customer-search-input w-full glass-input text-slate-100 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none placeholder:text-slate-500 font-mono"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="customer-credit-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cust) => {
          const isHighCredit = cust.currentOutstanding >= CREDIT_LOCK_THRESHOLD;
          return (
            <div
              key={cust.id}
              className="customer-credit-card glass-panel p-5 rounded-3xl border border-slate-800/90 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="customer-id text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 font-bold">
                    {cust.id}
                  </span>
                  <span className="customer-type text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 font-semibold">
                    {cust.customerType}
                  </span>
                </div>

                <h3 className="customer-name font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                  {cust.name}
                </h3>
                <div className="customer-phone text-xs text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{cust.phone}</span>
                </div>

                <div className="customer-vehicle-panel p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 mt-3 space-y-1.5 text-xs font-mono">
                  <div className="customer-vehicle-row flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1"><Car className="w-3 h-3 text-amber-400" /> Vehicle:</span>
                    <span className="customer-vehicle-number text-sky-300 font-bold">{cust.vehicleNo}</span>
                  </div>
                  <div className="customer-vehicle-meta text-[10px] text-slate-500 truncate">{cust.vehicleModel}</div>
                  <div className="customer-vehicle-meta text-[10px] text-slate-500 truncate">{cust.address}</div>
                </div>
              </div>

              {/* Credit Status Card */}
              <div className="customer-credit-status pt-3 border-t border-slate-800/80 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Outstanding:</span>
                  <span className={`font-extrabold text-sm ${isHighCredit ? 'text-amber-400' : 'text-slate-200'}`}>
                    ₹{cust.currentOutstanding.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>Credit Limit:</span>
                  <span className="text-slate-400">₹{cust.creditLimit.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => onSelectCustomerForBilling(cust)}
                  className="customer-pos-button w-full py-2 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Select for POS Billing</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
