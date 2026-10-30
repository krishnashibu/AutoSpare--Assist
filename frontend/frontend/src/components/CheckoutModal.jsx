import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Banknote, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle,
  Receipt,
  RotateCw,
  Lock
} from 'lucide-react';
import { evaluateCreditTransaction } from '../services/posService';
import { CREDIT_LOCK_THRESHOLD } from '../constants/categories';
import upiPaymentQr from '../assets/upi-payment-qr.jpeg';

export const CheckoutModal = ({
  isOpen,
  onClose,
  cart,
  totals,
  selectedCustomer,
  currentUser,
  onCompleteSale,
  onTriggerCreditLock,
  addToast
}) => {
  const [paymentMode, setPaymentMode] = useState('CASH'); // 'CASH' | 'UPI' | 'CREDIT'
  const [cashTendered, setCashTendered] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiConfirmed, setUpiConfirmed] = useState(false);
  const [upiTransactionRef, setUpiTransactionRef] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCashTendered(totals.grandTotal.toString());
      setPaymentMode('CASH');
      setUpiConfirmed(false);
      setUpiTransactionRef('');
    }
  }, [isOpen, totals.grandTotal]);

  if (!isOpen) return null;

  const changeDue = Number(cashTendered) >= totals.grandTotal 
    ? Math.round((Number(cashTendered) - totals.grandTotal) * 100) / 100 
    : 0;

  const creditEval = evaluateCreditTransaction(selectedCustomer, totals.grandTotal);

  const handleProceedPayment = async () => {
    // 1. CASH MODE
    if (paymentMode === 'CASH') {
      if (Number(cashTendered) < totals.grandTotal) {
        addToast({
          type: 'error',
          title: 'Insufficient Cash',
          message: `Amount tendered (₹${Number(cashTendered)}) is less than total (₹${totals.grandTotal}).`
        });
        return;
      }
      setIsProcessing(true);
      await new Promise(r => setTimeout(r, 400));
      onCompleteSale({
        paymentMode: 'CASH',
        paymentDetails: {
          cashTendered: Number(cashTendered),
          changeReturned: changeDue
        }
      });
      setIsProcessing(false);
      return;
    }

    // Static UPI QR payments require the cashier to verify receipt in the merchant app.
    if (paymentMode === 'UPI') {
      if (!upiConfirmed) {
        addToast({
          type: 'error',
          title: 'Payment Not Confirmed',
          message: 'Verify that the payment has arrived in the merchant UPI app before completing this sale.'
        });
        return;
      }

      onCompleteSale({
        paymentMode: 'UPI',
        paymentDetails: {
          payeeName: 'Dhiya Ravi T',
          upiId: 'dhiyaravi2004@okaxis',
          transactionRef: upiTransactionRef.trim() || null,
          authMode: 'STATIC_UPI_QR',
          confirmationMethod: 'STAFF_VERIFIED',
          confirmedBy: currentUser?.fullName || 'Staff Operator',
          confirmedAt: new Date().toISOString()
        }
      });
      return;
    }
    // 3. CREDIT ACCOUNT MODE
    if (paymentMode === 'CREDIT') {
      if (!selectedCustomer) {
        addToast({
          type: 'error',
          title: 'Customer Required',
          message: 'Please associate a registered customer before proceeding with credit sale.'
        });
        return;
      }

      // Check if purchase exceeds ₹15,000 threshold or credit limit
      if (creditEval.requiresManagerApproval) {
        onTriggerCreditLock({
          cart,
          totals,
          customer: selectedCustomer,
          staffUser: currentUser,
          evaluation: creditEval
        });
        onClose();
        return;
      }

      // Within limit credit sale (≤ ₹15,000)
      setIsProcessing(true);
      await new Promise(r => setTimeout(r, 400));
      onCompleteSale({
        paymentMode: 'CREDIT',
        paymentDetails: {
          creditTerms: '30_DAYS_NET',
          authorizedLimit: selectedCustomer.creditLimit
        }
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-xl p-6 sm:p-7 rounded-3xl border border-white/10 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-slate-800 pb-4 mb-5">
          <div className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold mb-1">
            Payment & Billing Checkout
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center justify-between">
            <span>Collect Payment</span>
            <span className="text-emerald-400 font-mono text-2xl font-black">
              ₹{totals.grandTotal.toLocaleString()}
            </span>
          </h2>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Customer: <strong className="text-slate-200">{selectedCustomer?.name || 'Counter Walk-in'}</strong></span>
            <span>•</span>
            <span>{totals.itemCount} Items</span>
          </div>
        </div>

        {/* Payment Mode Selector */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {/* Cash */}
          <button
            type="button"
            onClick={() => { setPaymentMode('CASH'); setUpiConfirmed(false); setUpiTransactionRef(''); }}
            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              paymentMode === 'CASH'
                ? 'border-emerald-500 bg-emerald-500/15 ring-1 ring-emerald-500/50 shadow-glow-emerald'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            <Banknote className={`w-5 h-5 ${paymentMode === 'CASH' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className={`text-xs font-bold ${paymentMode === 'CASH' ? 'text-white' : 'text-slate-300'}`}>
              Cash Pay
            </span>
          </button>

          {/* UPI QR */}
          <button
            type="button"
            onClick={() => { setPaymentMode('UPI'); setUpiConfirmed(false); setUpiTransactionRef(''); }}
            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              paymentMode === 'UPI'
                ? 'border-purple-500 bg-purple-500/15 ring-1 ring-purple-500/50 shadow-glow-sky'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            <QrCode className={`w-5 h-5 ${paymentMode === 'UPI' ? 'text-purple-400' : 'text-slate-400'}`} />
            <span className={`text-xs font-bold ${paymentMode === 'UPI' ? 'text-white' : 'text-slate-300'}`}>
              Instant UPI QR
            </span>
          </button>

          {/* Credit Account */}
          <button
            type="button"
            onClick={() => { setPaymentMode('CREDIT'); setUpiConfirmed(false); setUpiTransactionRef(''); }}
            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              paymentMode === 'CREDIT'
                ? 'border-amber-500 bg-amber-500/15 ring-1 ring-amber-500/50 shadow-glow-amber'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            <ShieldAlert className={`w-5 h-5 ${paymentMode === 'CREDIT' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className={`text-xs font-bold ${paymentMode === 'CREDIT' ? 'text-white' : 'text-slate-300'}`}>
              Credit Account
            </span>
          </button>
        </div>

        {/* Dynamic Mode Details */}
        <div className="mb-6">
          {paymentMode === 'CASH' && (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Bill Grand Total:</span>
                <span className="text-white font-bold text-sm">₹{totals.grandTotal.toLocaleString()}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Cash Received (₹)
                </label>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="w-full glass-input text-emerald-300 text-lg font-bold font-mono rounded-xl px-4 py-2.5 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Change Due to Customer:</span>
                <span className="text-sky-400 font-extrabold text-base">₹{changeDue.toLocaleString()}</span>
              </div>
            </div>
          )}

          {paymentMode === 'UPI' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div
                  className="relative flex-shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-white/20 shadow-xl"
                  style={{ width: '224px', height: '224px' }}
                >
                  <img
                    src={upiPaymentQr}
                    alt="UPI QR code for Dhiya Ravi T, dhiyaravi2004@okaxis"
                    className="absolute"
                    style={{
                      width: '305px',
                      maxWidth: 'none',
                      height: 'auto',
                      left: '50%',
                      top: '-80px',
                      transform: 'translateX(-50%)'
                    }}
                  />
                </div>

                <div className="space-y-3 text-center sm:text-left">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Static UPI QR</div>
                    <div className="text-sm font-bold text-white mt-1">Dhiya Ravi T</div>
                    <div className="text-xs font-mono text-purple-300 break-all">dhiyaravi2004@okaxis</div>
                  </div>

                  <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Amount to collect</div>
                    <div className="text-xl font-black text-emerald-300 mt-1">₹{totals.grandTotal.toLocaleString()}</div>
                    <p className="text-[11px] leading-relaxed text-slate-400 mt-1">
                      Scan with any UPI app and enter the exact bill amount.
                    </p>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={upiConfirmed}
                  onChange={(event) => setUpiConfirmed(event.target.checked)}
                  className="mt-0.5 accent-emerald-500"
                />
                <span>I verified the payment is received in the merchant UPI app.</span>
              </label>

              <div>
                <label htmlFor="upi-transaction-reference" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  UPI transaction reference <span className="normal-case text-slate-500">(optional)</span>
                </label>
                <input
                  id="upi-transaction-reference"
                  type="text"
                  value={upiTransactionRef}
                  onChange={(event) => setUpiTransactionRef(event.target.value)}
                  placeholder="Enter the UTR / transaction ID"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {paymentMode === 'CREDIT' && (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800">
                <span className="text-slate-400">Credit Limit Threshold:</span>
                <span className="text-amber-400 font-bold">₹{CREDIT_LOCK_THRESHOLD.toLocaleString()}</span>
              </div>

              {selectedCustomer ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Current Outstanding:</span>
                    <span className="text-slate-200">₹{selectedCustomer.currentOutstanding.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">This Purchase:</span>
                    <span className="text-white font-bold">₹{totals.grandTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-mono pt-1 border-t border-slate-800">
                    <span className="text-slate-300 font-semibold">Projected Total Balance:</span>
                    <span className={`font-bold ${creditEval.requiresManagerApproval ? 'text-amber-400' : 'text-emerald-400'}`}>
                      ₹{(selectedCustomer.currentOutstanding + totals.grandTotal).toLocaleString()}
                    </span>
                  </div>

                  {creditEval.requiresManagerApproval ? (
                    <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-200">
                        <Lock className="w-3.5 h-3.5" /> Credit Lock Trigger
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Amount exceeds ₹15,000 threshold. Proceeding will automatically lock this transaction and alert Store Manager Suresh Patel for authorization.
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Credit within ₹15,000 limit. Approval granted.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-3 text-amber-400 text-xs">
                  ⚠️ No customer selected. Please select a registered garage or retail account.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleProceedPayment}
          disabled={isProcessing || (paymentMode === 'UPI' && !upiConfirmed)}
          className={`w-full py-4 px-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            paymentMode === 'CREDIT' && creditEval.requiresManagerApproval
              ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-black shadow-glow-amber'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-glow-emerald'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Processing Transaction...</span>
            </>
          ) : paymentMode === 'CREDIT' && creditEval.requiresManagerApproval ? (
            <>
              <Lock className="w-4 h-4" />
              <span>Trigger Credit Lock & Forward to Manager</span>
            </>
          ) : (
            <>
              <Receipt className="w-4 h-4" />
              <span>{paymentMode === 'UPI' ? 'Record UPI Payment & Complete Sale' : 'Complete Sale & Print Tax Invoice'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
