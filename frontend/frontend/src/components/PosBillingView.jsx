import React, { useState } from 'react';
import { 
  Search, 
  Camera, 
  ShoppingCart, 
  User, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  CreditCard, 
  Layers, 
  Car, 
  Phone, 
  ShieldCheck, 
  Tag, 
  Check, 
  Sparkles,
  Percent,
  RotateCcw
} from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import { calculateCartTotals } from '../services/posService';

export const PosBillingView = ({
  products,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onRemoveFromCart,
  onClearCart,
  selectedCustomer,
  onOpenCustomerModal,
  onOpenScannerModal,
  onOpenCheckoutModal,
  addToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      p.code.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.vehicleCompat && p.vehicleCompat.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const totals = calculateCartTotals(cart, discountPercent);

  const handleBarcodeQuickAdd = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const match = products.find(
        (p) =>
          p.code.toLowerCase() === searchQuery.toLowerCase().trim() ||
          p.barcode.toLowerCase() === searchQuery.toLowerCase().trim()
      );
      if (match) {
        onAddToCart(match);
        addToast({
          type: 'success',
          title: 'Part Added by Code',
          message: `${match.name} (₹${match.rate.toLocaleString()}) added to cart.`
        });
        setSearchQuery('');
      } else {
        addToast({
          type: 'error',
          title: 'Unknown Code',
          message: `No exact product match for "${searchQuery}".`
        });
      }
    }
  };

  return (
    <div className="pos-billing-view w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 7/12 Columns: Products Catalog & Webcam Search */}
      <div className="lg:col-span-7 space-y-4">
        {/* Search & Webcam Trigger Bar */}
        <div className="pos-search-panel glass-panel p-4 rounded-3xl border border-white/10 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleBarcodeQuickAdd}
              placeholder="Search part name, SKU code, brand, or vehicle (Press Enter to quick-add)..."
              className="pos-search-input w-full glass-input text-white rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm focus:outline-none placeholder:text-slate-500 font-mono"
            />
          </div>

          <button
            type="button"
            onClick={onOpenScannerModal}
            className="pos-scan-button w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-brand-600 via-sky-500 to-brand-500 hover:from-brand-500 hover:to-sky-400 text-white font-bold text-xs rounded-2xl shadow-lg shadow-brand-950/50 flex items-center justify-center gap-2 whitespace-nowrap transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Webcam (F2)</span>
          </button>
        </div>

        {/* Category Horizontal Filter Chips */}
        <div className="pos-categories flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`pos-category px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-950/50'
                    : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="pos-products-grid grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[640px] overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="pos-empty-state col-span-2 glass-panel p-12 rounded-3xl border border-white/10 text-center text-slate-500 text-xs font-mono">
              No automobile spare parts matched "{searchQuery}" in category "{selectedCategory}".
            </div>
          ) : (
            filteredProducts.map((prod) => (
              <div
                key={prod.code}
                className="pos-product-card glass-panel p-4.5 rounded-2xl border border-white/10 hover:border-sky-500/40 hover:shadow-xl hover:shadow-sky-950/20 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="pos-product-sku text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-sky-400 border border-white/10">
                      SKU: {prod.code}
                    </span>
                    <span className="pos-product-brand text-[10px] font-mono text-slate-400 uppercase font-semibold">
                      {prod.brand}
                    </span>
                  </div>

                  <h3 className="pos-product-name font-bold text-white text-xs sm:text-sm leading-snug group-hover:text-sky-300 transition-colors line-clamp-2">
                    {prod.name}
                  </h3>

                  {prod.vehicleCompat && (
                    <div className="pos-product-fit text-[11px] text-slate-400 font-mono mt-1.5 line-clamp-1">
                      Fits: {prod.vehicleCompat}
                    </div>
                  )}
                </div>

                <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="pos-product-price text-base font-black text-emerald-400 font-mono">
                      ₹{prod.rate.toLocaleString()}
                    </div>
                    <div className="pos-product-stock text-[10px] text-slate-400 font-mono">
                      In-Stock: <span className={prod.stock <= 5 ? 'text-amber-400 font-bold' : 'text-slate-300 font-semibold'}>{prod.stock} {prod.unit}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(prod);
                      addToast({
                        type: 'success',
                        title: 'Part Added',
                        message: `${prod.name} added to cart.`
                      });
                    }}
                    className="pos-add-button px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-brand-600 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/10 hover:border-brand-600 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right 5/12 Columns: Active POS Cart & Billing Checkout */}
      <div className="pos-cart-column lg:col-span-5 space-y-4 sticky top-24">
        <div className="pos-cart-panel glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          {/* Customer Attachment Card */}
          <div className="pos-customer-card flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="pos-customer-icon w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="pos-customer-name text-xs font-bold text-white truncate">
                  {selectedCustomer ? selectedCustomer.name : 'Walk-in Cash Customer'}
                </div>
                <div className="pos-customer-detail text-[10px] text-slate-400 font-mono truncate flex items-center gap-1.5">
                  {selectedCustomer ? (
                    <>
                      <span className="text-sky-400 font-semibold">{selectedCustomer.vehicleNo}</span>
                      <span>•</span>
                      <span>Balance: <strong className="text-amber-400">₹{selectedCustomer.currentOutstanding.toLocaleString()}</strong></span>
                    </>
                  ) : (
                    'Standard Counter Sale'
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenCustomerModal}
              className="pos-customer-select text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-sky-400 border border-white/10 transition-colors whitespace-nowrap cursor-pointer"
            >
              {selectedCustomer ? 'Change' : '+ Select'}
            </button>
          </div>

          {/* Cart Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-white text-sm">Active Cart ({totals.itemCount} items)</span>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 font-mono cursor-pointer font-bold"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="pos-cart-items space-y-2 max-h-64 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="pos-cart-empty text-center py-10 text-slate-500 text-xs font-mono">
                Cart is currently empty.
                <div className="text-[11px] text-slate-400 mt-1">Scan webcam or select parts from catalog.</div>
              </div>
            ) : (
              cart.map((item) => {
                const itemTotal = item.rate * item.quantity;
                return (
                  <div
                    key={item.code}
                    className="pos-cart-item p-3 rounded-2xl bg-slate-900/70 border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        ₹{item.rate.toLocaleString()} × {item.quantity} = <strong className="text-emerald-400 font-bold">₹{itemTotal.toLocaleString()}</strong>
                      </div>
                    </div>

                    {/* Stepper Controls */}
                    <div className="pos-quantity-stepper flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => onUpdateCartQty(item.code, item.quantity - 1)}
                        className="p-1 hover:text-white text-slate-400 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-xs px-1 text-white">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateCartQty(item.code, item.quantity + 1)}
                        className="p-1 hover:text-white text-slate-400 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveFromCart(item.code)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Discount & Tax Breakdown */}
          {cart.length > 0 && (
            <div className="pos-cart-totals p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 text-xs font-mono">
              {/* Discount Selector */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-slate-400 flex items-center gap-1 font-semibold">
                  <Percent className="w-3.5 h-3.5 text-amber-400" /> Discount:
                </span>
                <div className="flex gap-1">
                  {[0, 2, 5, 10].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setDiscountPercent(d)}
                      className={`pos-discount-option px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        discountPercent === d
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-950/40'
                          : 'bg-slate-950 border border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {d}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-slate-400 font-medium">
                <span>Subtotal (Net):</span>
                <span className="text-white font-bold">₹{totals.subtotal.toLocaleString()}</span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-amber-400 font-bold">
                  <span>Discount ({totals.discountPercent}%):</span>
                  <span>-₹{totals.discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400 font-medium">
                <span>GST Tax (CGST+SGST 18%):</span>
                <span className="text-white font-bold">₹{totals.taxAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-white/10 text-sm">
                <span className="font-bold text-white">Grand Total:</span>
                <span className="font-black text-emerald-400 text-xl">
                  ₹{totals.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Proceed to Payment Button */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={onOpenCheckoutModal}
            className="pos-checkout-button w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all duration-200 transform active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Proceed to Checkout & Billing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
