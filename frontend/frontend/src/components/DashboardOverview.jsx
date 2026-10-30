import React from 'react';
import { 
  ShoppingCart, 
  Layers, 
  Users, 
  ShieldAlert, 
  History, 
  RefreshCw, 
  Camera, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Package, 
  Clock, 
  UserCheck, 
  CreditCard,
  QrCode,
  Lock,
  Building2,
  ArrowUpRight,
  Zap,
  Activity
} from 'lucide-react';
import { ROLES } from '../constants/roles';
import { CREDIT_LOCK_THRESHOLD } from '../constants/categories';
import { getCompletedTransactions, getPendingApprovals, getStoredCustomers, getStoredProducts } from '../services/posService';

export const DashboardOverview = ({
  currentUser,
  onNavigateTab,
  onOpenScanner,
  onOpenCustomerModal,
  onOpenAuthModal
}) => {
  const products = getStoredProducts();
  const customers = getStoredCustomers();
  const transactions = getCompletedTransactions();
  const pendingApprovals = getPendingApprovals().filter(a => a.status === 'PENDING');

  const isManager = currentUser?.role === 'STORE_MANAGER';
  const roleConfig = ROLES[currentUser?.role] || ROLES.COUNTER_STAFF;

  const totalSalesRevenue = transactions.reduce((acc, t) => acc + (t.totals.grandTotal || 0), 0);
  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockItems = products.filter(p => p.stock <= 5);
  const totalOutstandingCredit = customers.reduce((acc, c) => acc + (c.currentOutstanding || 0), 0);

  return (
    <div className="dashboard-overview w-full space-y-6">
      {/* 1. Staff Profile Welcome Hero Banner */}
      <div className="dashboard-welcome glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white shadow-xl flex-shrink-0 text-xl font-bold font-mono ${
              isManager 
                ? 'bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500 text-slate-950'
                : 'bg-gradient-to-br from-brand-600 via-sky-500 to-indigo-600'
            }`}>
              {isManager ? <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 text-slate-950" /> : <ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8" />}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome, {currentUser?.fullName}
                </h1>
                <span className={`text-xs px-3 py-1 rounded-full border font-mono font-bold ${roleConfig.badgeColor}`}>
                  {roleConfig.label}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                <span>Employee ID: <strong className="text-sky-400 font-bold">{currentUser?.employeeId}</strong></span>
                <span>•</span>
                <span>Station: <strong className="text-slate-200 font-semibold">GK-POS-04 (Kumily Main)</strong></span>
                <span>•</span>
                <span>Role: <strong className={isManager ? 'text-amber-400 font-bold' : 'text-sky-400 font-bold'}>{roleConfig.label}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Pills */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('pos')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all cursor-pointer transform active:scale-98"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Launch POS Counter</span>
            </button>

            <button
              onClick={onOpenAuthModal}
              className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              Switch Role
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metric KPI Cards */}
      <div className="dashboard-metrics grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Metric 1: POS Revenue */}
        <div 
          onClick={() => onNavigateTab('history')}
          className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Total POS Sales</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            ₹{Math.round(totalSalesRevenue).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="text-slate-200 font-bold">{transactions.length} orders</span> processed
          </div>
        </div>

        {/* Metric 2: Stock Units */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-sky-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Parts In-Stock</span>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-400">
            {totalStockUnits.toLocaleString()} <span className="text-sm font-normal text-slate-400">Units</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="text-slate-200 font-bold">{products.length} SKU codes</span>
            {lowStockItems.length > 0 && (
              <span className="text-amber-400 font-bold">({lowStockItems.length} low stock)</span>
            )}
          </div>
        </div>

        {/* Metric 3: Customer Outstanding */}
        <div 
          onClick={() => onNavigateTab('customers')}
          className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Outstanding Credit</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            ₹{totalOutstandingCredit.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Across <span className="text-slate-200 font-bold">{customers.length} garage accounts</span>
          </div>
        </div>

        {/* Metric 4: Manager Approvals */}
        <div 
          onClick={() => onNavigateTab('approvals')}
          className={`glass-panel p-5 rounded-3xl border transition-all cursor-pointer group ${
            pendingApprovals.length > 0
              ? 'border-amber-500/50 bg-amber-500/5'
              : 'border-white/10 hover:border-purple-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Credit Approvals</span>
            <div className={`p-2.5 rounded-xl ${pendingApprovals.length > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-bounce' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${pendingApprovals.length > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
            {pendingApprovals.length} <span className="text-sm font-normal text-slate-400">Pending</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {pendingApprovals.length > 0 
              ? '⚠️ High-value orders requiring review' 
              : 'All credit sales authorized'}
          </div>
        </div>
      </div>

      {/* 3. Quick Launcher Hub */}
      <div className="dashboard-shortcuts grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <button
          onClick={() => onNavigateTab('pos')}
          className="p-4 rounded-2xl glass-panel-subtle border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 text-left transition-all group cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mb-2.5 group-hover:scale-110 transition-transform">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-white">POS Counter</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Create new sale</div>
        </button>

        <button
          onClick={onOpenScanner}
          className="p-4 rounded-2xl glass-panel-subtle border border-white/10 hover:border-sky-500/40 hover:bg-sky-500/5 text-left transition-all group cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 w-fit mb-2.5 group-hover:scale-110 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-white">Scan Webcam</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Camera barcode F2</div>
        </button>

        <button
          onClick={() => onNavigateTab('inventory')}
          className="p-4 rounded-2xl glass-panel-subtle border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 text-left transition-all group cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit mb-2.5 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-white">Stock Catalog</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">120+ authentic parts</div>
        </button>

        <button
          onClick={onOpenCustomerModal}
          className="p-4 rounded-2xl glass-panel-subtle border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5 text-left transition-all group cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit mb-2.5 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-white">Add Customer</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Register garage</div>
        </button>

        <button
          onClick={() => onNavigateTab('approvals')}
          className="p-4 rounded-2xl glass-panel-subtle border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 text-left transition-all group cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit mb-2.5 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-white">Approvals</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Manager console</div>
        </button>

        <button
          onClick={() => onNavigateTab('sync')}
          className="p-4 rounded-2xl glass-panel-subtle border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-left transition-all group cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit mb-2.5 group-hover:scale-110 transition-transform">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-white">Billing API</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Live REST sync</div>
        </button>
      </div>

      {/* 4. Split Section: Recent POS Sales & Low Stock Inventory Monitor */}
      <div className="dashboard-activity-grid grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7/12: Recent Sales Records */}
        <div className="dashboard-sales-panel lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <History className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-white">Recent POS Sales Counter Transactions</span>
            </div>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs text-sky-400 hover:text-sky-300 font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs font-mono">
              No sales completed yet. Open POS Counter to process transactions.
            </div>
          ) : (
            <div className="space-y-2.5">
              {transactions.slice(0, 4).map((txn) => (
                <div 
                  key={txn.id}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3 text-xs font-mono hover:border-white/10 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sky-400">{txn.invoiceNumber}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-white font-bold text-xs mt-0.5">{txn.customer.name}</div>
                    <div className="text-[10px] text-slate-400">{txn.items.length} items • Vehicle: {txn.customer.vehicleNo}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-400">
                      ₹{txn.totals.grandTotal.toLocaleString()}
                    </div>
                    <span className={`inline-block text-[10px] px-2 py-0.2 rounded-full font-bold mt-1 ${
                      txn.paymentMode === 'CREDIT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {txn.paymentMode}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5/12: Inventory Stock Watch */}
        <div className="dashboard-stock-panel lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-white">Stock Level Monitor</span>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {lowStockItems.slice(0, 4).map((p) => (
              <div 
                key={p.code}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white truncate text-xs">{p.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">SKU: {p.code} • {p.brand}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-slate-200">₹{p.rate.toLocaleString()}</div>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 mt-0.5">
                    {p.stock} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
