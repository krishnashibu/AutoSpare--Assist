import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Wrench, 
  Download, 
  Building2, 
  Phone, 
  Car, 
  ShieldCheck,
  Receipt
} from 'lucide-react';

export const InvoiceModal = ({ isOpen, onClose, transaction, addToast }) => {
  const printRef = useRef(null);

  if (!isOpen || !transaction) return null;

  const {
    invoiceNumber,
    createdAt,
    customer,
    items,
    totals,
    paymentMode,
    paymentDetails,
    staffUser,
    terminalId,
    approvalId
  } = transaction;

  const handlePrint = () => {
    window.print();
    if (addToast) {
      addToast({
        type: 'info',
        title: 'Invoice Sent to POS Printer',
        message: `Thermal receipt generated for ${invoiceNumber}.`
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-2xl my-8 relative">
        {/* Printable Card Area */}
        <div 
          ref={printRef}
          className="bg-white text-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow">
                <Wrench className="w-6 h-6 transform -rotate-45" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  G.K AUTOMOBILES
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  1st Mile, Kumily. Opp. Amaravathi Co-operative Bank, Idukki
                </p>
                <p className="text-[11px] font-mono text-slate-500">
                  GSTIN: 32AABCG1234F1Z8 • Phone: +91 94470 12345
                </p>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white px-2.5 py-0.5 rounded">
                TAX INVOICE
              </span>
              <div className="text-sm font-extrabold text-slate-900 mt-1">{invoiceNumber}</div>
              <div className="text-xs text-slate-500">
                {new Date(createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
          </div>

          {/* Customer & Terminal Meta */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-mono mb-5">
            <div>
              <div className="text-slate-500 uppercase text-[10px] font-bold">Billed To:</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{customer?.name}</div>
              <div className="text-slate-600 text-[11px]">{customer?.phone} • {customer?.address}</div>
              {customer?.vehicleNo && (
                <div className="text-slate-700 font-semibold mt-1">
                  Vehicle: <span className="text-brand-700">{customer.vehicleNo}</span> ({customer.vehicleModel})
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-slate-500 uppercase text-[10px] font-bold">POS Details:</div>
              <div className="text-slate-700 font-semibold">Terminal: {terminalId || 'GK-POS-04'}</div>
              <div className="text-slate-700">Counter Operator: {staffUser?.fullName}</div>
              <div className="mt-1">
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Mode: {paymentMode} {paymentMode === 'CREDIT' ? '(Credit A/C)' : paymentMode === 'UPI' ? '(UPI QR)' : '(Cash)'}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto mb-5">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-600 text-[11px] uppercase">
                  <th className="py-2 text-left">#</th>
                  <th className="py-2 text-left">Part Name & Barcode</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Rate (₹)</th>
                  <th className="py-2 text-right">Tax (18%)</th>
                  <th className="py-2 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => {
                  const lineNet = item.rate * item.quantity;
                  const lineTax = lineNet * 0.18;
                  const lineTotal = lineNet + lineTax;
                  return (
                    <tr key={idx} className="py-2 text-slate-800">
                      <td className="py-2.5 text-slate-400">{idx + 1}</td>
                      <td className="py-2.5">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-500">Barcode: {item.code} • Brand: {item.brand}</div>
                      </td>
                      <td className="py-2.5 text-center font-bold">{item.quantity}</td>
                      <td className="py-2.5 text-right">{item.rate.toLocaleString()}</td>
                      <td className="py-2.5 text-right text-slate-600">{Math.round(lineTax).toLocaleString()}</td>
                      <td className="py-2.5 text-right font-bold">{Math.round(lineTotal).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="border-t-2 border-slate-900 pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="text-[11px] font-mono text-slate-500 max-w-xs">
              {paymentDetails?.upiId && (
                <div>UPI paid to: <strong className="text-slate-800">{paymentDetails.payeeName} · {paymentDetails.upiId}</strong></div>
              )}
              {paymentDetails?.transactionRef && (
                <div>Txn Ref: <strong className="text-slate-800">{paymentDetails.transactionRef}</strong></div>
              )}
              {paymentDetails?.confirmationMethod === 'STAFF_VERIFIED' && (
                <div>UPI receipt verified by: <strong className="text-slate-800">{paymentDetails.confirmedBy}</strong></div>
              )}
              {approvalId && (
                <div className="text-amber-800 font-semibold mt-0.5">
                  ✓ Store Manager Approval Code: {approvalId}
                </div>
              )}
              <div className="mt-1 text-[10px]">
                * Genuine spare parts warranty as per manufacturer standard.
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-1 font-mono text-xs text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Net):</span>
                <span>₹{totals.subtotal.toLocaleString()}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({totals.discountPercent}%):</span>
                  <span>-₹{totals.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>GST Tax (CGST+SGST 18%):</span>
                <span>₹{totals.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-base pt-2 border-t border-slate-400">
                <span>Grand Total:</span>
                <span>₹{totals.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 pt-6 border-t border-slate-300 text-center font-mono text-xs text-slate-600">
            <div>
              <div className="h-8"></div>
              <div className="border-t border-dashed border-slate-400 pt-1">
                Customer Signature
              </div>
            </div>
            <div>
              <div className="h-8 flex items-center justify-center text-[10px] text-emerald-700 font-bold">
                ✓ AUTHENTICATED BY G.K AUTOMOBILES
              </div>
              <div className="border-t border-dashed border-slate-400 pt-1">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Floating Toolbar */}
        <div className="mt-4 flex items-center justify-between gap-3 px-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Invoice
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-950/60 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Tax Invoice (Ctrl+P)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
