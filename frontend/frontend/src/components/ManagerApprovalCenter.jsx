import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2, 
  Car, 
  ShoppingBag, 
  AlertTriangle,
  ArrowRight,
  FileText,
  Lock,
  Unlock,
  Receipt
} from 'lucide-react';
import { 
  getPendingApprovals, 
  processManagerApproval, 
  completeSaleTransaction 
} from '../services/posService';
import { CREDIT_LOCK_THRESHOLD } from '../constants/categories';

export const ManagerApprovalCenter = ({ 
  currentUser, 
  onTransactionCompleted, 
  addToast, 
  onSwitchToManagerLogin 
}) => {
  const [approvals, setApprovals] = useState(getPendingApprovals());
  const [selectedRequest, setSelectedRequest] = useState(approvals[0] || null);
  const [managerNotes, setManagerNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isManager = currentUser?.role === 'STORE_MANAGER';
  const pendingList = approvals.filter((a) => a.status === 'PENDING');
  const historyList = approvals.filter((a) => a.status !== 'PENDING');

  const refreshApprovals = () => {
    const list = getPendingApprovals();
    setApprovals(list);
    if (!selectedRequest && list.length > 0) {
      setSelectedRequest(list[0]);
    }
  };

  const handleDecision = async (decision) => {
    if (!selectedRequest) return;
    if (!isManager) {
      addToast({
        type: 'error',
        title: 'Manager Privileges Required',
        message: 'Only Store Manager (Suresh Patel) can approve or reject locked credit sales.'
      });
      return;
    }

    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 450));

    try {
      const updatedReq = processManagerApproval(
        selectedRequest.id,
        decision,
        currentUser,
        managerNotes
      );

      if (decision === 'APPROVED') {
        // Complete the sale and record transaction
        const completedTxn = completeSaleTransaction({
          customer: selectedRequest.customer,
          cart: selectedRequest.cart,
          totals: selectedRequest.totals,
          paymentMode: 'CREDIT',
          paymentDetails: {
            creditTerms: 'MANAGER_APPROVED_HIGH_VALUE',
            managerApprovalId: updatedReq.id,
            managerSignature: currentUser.fullName,
            notes: managerNotes
          },
          staffUser: selectedRequest.staffUser,
          approvalId: updatedReq.id
        });

        addToast({
          type: 'success',
          title: 'Credit Transaction Approved',
          message: `Invoice ${completedTxn.invoiceNumber} generated for ${selectedRequest.customer.name} (₹${selectedRequest.totals.grandTotal.toLocaleString()}).`
        });

        onTransactionCompleted(completedTxn);
      } else {
        addToast({
          type: 'warning',
          title: 'Credit Transaction Rejected',
          message: `Request ${selectedRequest.id} declined by Store Manager.`
        });
      }

      setManagerNotes('');
      refreshApprovals();
      setSelectedRequest(null);
    } catch (err) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="operations-view approvals-view w-full space-y-6">
      {/* Top Banner */}
      <div className="approval-header glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="approval-icon w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="approval-title text-xl font-bold text-white tracking-tight">
                Credit Approval & Authorization Console
              </h2>
              <span className="approval-threshold text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                Threshold: ₹{CREDIT_LOCK_THRESHOLD.toLocaleString()}
              </span>
            </div>
            <p className="approval-description text-xs text-slate-400">
              High-value credit transaction governance and manager override sign-off for GK Auto Spares.
            </p>
          </div>
        </div>

        {/* Manager Status Chip */}
        {!isManager ? (
          <div className="approval-manager-required p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div className="text-xs">
              <div className="text-rose-200 font-semibold">Manager Sign-off Required</div>
              <div className="text-slate-400 text-[11px]">Logged in as Counter Staff</div>
            </div>
            <button
              onClick={onSwitchToManagerLogin}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors font-mono whitespace-nowrap cursor-pointer"
            >
              Switch to Manager
            </button>
          </div>
        ) : (
          <div className="approval-manager-active p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 font-mono text-xs text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="font-bold text-white">Store Manager: {currentUser.fullName}</div>
              <div className="text-[10px] text-emerald-400">Authorized Signatory (Level 1 Clearance)</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Approval Split View */}
      <div className="approval-layout grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue of Locked Transactions */}
        <div className="approval-queue lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending Requests ({pendingList.length})
            </span>
            <button
              onClick={refreshApprovals}
              className="text-xs text-sky-400 hover:underline font-mono"
            >
              Refresh
            </button>
          </div>

          {pendingList.length === 0 ? (
            <div className="approval-empty glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-white">No Pending Locks</div>
              <p className="approval-description text-xs text-slate-400">
                All credit transactions are within policy limits or have been reviewed.
              </p>
            </div>
          ) : (
            pendingList.map((req) => {
              const isSelected = selectedRequest?.id === req.id;
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/15 ring-1 ring-amber-500/50 shadow-lg shadow-amber-950/40'
                      : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      {req.id}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(req.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="font-bold text-white text-sm">{req.customer.name}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>Vehicle: <strong className="text-sky-400">{req.customer.vehicleNo}</strong></span>
                    <span>•</span>
                    <span>{req.cart.length} Items</span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-amber-400 font-extrabold text-sm">
                      ₹{req.totals.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {/* Past Decisions Log */}
          {historyList.length > 0 && (
            <div className="pt-4">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">
                Recent Decisions ({historyList.length})
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {historyList.map((h) => (
                  <div key={h.id} className="approval-history-item p-3 rounded-xl bg-slate-950 border border-slate-900 text-xs font-mono flex items-center justify-between">
                    <div>
                      <div className="text-slate-300 font-semibold">{h.customer.name}</div>
                      <div className="text-[10px] text-slate-500">₹{h.totals.grandTotal.toLocaleString()} • By {h.decidedBy}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      h.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {h.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Selected Request Review & Decision Panel */}
        <div className="approval-review lg:col-span-7">
          {selectedRequest ? (
            <div className="approval-review-card glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="text-[11px] font-mono text-amber-400 font-semibold">
                    Request ID: {selectedRequest.id}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Credit Purchase Authorization Review
                  </h3>
                </div>
                <div className="text-right font-mono">
                  <div className="text-slate-400 text-xs">Total Bill</div>
                  <div className="text-amber-400 font-extrabold text-xl">
                    ₹{selectedRequest.totals.grandTotal.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Customer Profile Box */}
              <div className="approval-customer-panel p-4 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <div className="text-slate-400">Customer Name:</div>
                  <div className="text-white font-bold text-sm">{selectedRequest.customer.name}</div>
                  <div className="text-slate-400 text-[11px] mt-1">{selectedRequest.customer.address}</div>
                </div>
                <div>
                  <div className="text-slate-400">Vehicle / Fleet:</div>
                  <div className="text-sky-400 font-bold">{selectedRequest.customer.vehicleNo}</div>
                  <div className="text-slate-400 text-[11px] mt-1">{selectedRequest.customer.vehicleModel}</div>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-slate-400">Existing Balance:</div>
                  <div className="text-slate-200">₹{selectedRequest.customer.currentOutstanding.toLocaleString()}</div>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-slate-400">Credit Limit:</div>
                  <div className="text-emerald-400">₹{selectedRequest.customer.creditLimit.toLocaleString()}</div>
                </div>
              </div>

              {/* Itemized Parts in Cart */}
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center justify-between">
                  <span>Spares in Transaction ({selectedRequest.cart.length})</span>
                  <span>GST 18% Applicable</span>
                </div>
                <div className="approval-items-panel bg-slate-950 rounded-2xl border border-slate-800 p-3 max-h-48 overflow-y-auto space-y-2">
                  {selectedRequest.cart.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-0">
                      <div>
                        <span className="font-semibold text-white">{item.name}</span>
                        <div className="text-[10px] text-slate-500 font-mono">SKU: {item.code} • Qty: {item.quantity} {item.unit}</div>
                      </div>
                      <div className="font-mono text-slate-300 font-bold text-right">
                        ₹{(item.rate * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manager Authorization Notes Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                  Store Manager Authorization Notes / Terms
                </label>
                <input
                  type="text"
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  placeholder="e.g. Authorized 30-day payment term based on regular garage contract."
                  className="approval-notes w-full glass-input text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none placeholder:text-slate-500"
                />
              </div>

              {/* Decision Action Buttons */}
              <div className="approval-actions grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDecision('REJECTED')}
                  disabled={isProcessing || !isManager}
                  className="approval-reject py-3 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject & Cancel Credit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision('APPROVED')}
                  disabled={isProcessing || !isManager}
                  className="approval-authorize py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
                >
                  {isProcessing ? (
                    <span>Processing Authorization...</span>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>Authorize & Generate Invoice</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="approval-review-empty glass-panel p-12 rounded-3xl border border-slate-800 text-center text-slate-500 text-xs">
              Select a pending credit lock request on the left to inspect parts and authorize.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
