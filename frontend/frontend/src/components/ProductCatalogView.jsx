import React, { useState } from 'react';
import { 
  Search, 
  Layers, 
  Plus, 
  Camera, 
  Tag, 
  AlertTriangle, 
  CheckCircle2,
  Package,
  TrendingUp,
  Download
} from 'lucide-react';
import { CATEGORIES } from '../constants/categories';

export const ProductCatalogView = ({ products, onAddToCart, onOpenScanner, addToast }) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');

  const filtered = products.filter((p) => {
    const matchesCat = selectedCat === 'ALL' || p.category === selectedCat;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.code.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalStockValue = products.reduce((acc, p) => acc + (p.stock * p.rate), 0);

  return (
    <div className="inventory-view w-full space-y-6">
      {/* Header & Stats */}
      <div className="inventory-header glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inventory-eyebrow text-xs font-mono uppercase tracking-wider text-sky-400 font-bold mb-1">
            G.K Automobiles • Stock Registry
          </div>
          <h2 className="inventory-title text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Spare Parts Inventory Catalog
          </h2>
          <p className="inventory-description text-xs text-slate-400 mt-1">
            Comprehensive catalog with barcodes, unit rates, tax codes, and stock levels.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 font-mono">
          <div className="inventory-stat px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-right">
            <div className="inventory-stat-label text-[10px] text-slate-500 uppercase font-semibold">Total Items</div>
            <div className="inventory-total-items text-sm font-extrabold text-white">{products.length} Parts</div>
          </div>
          <div className="inventory-stat px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-right">
            <div className="inventory-stat-label text-[10px] text-slate-500 uppercase font-semibold">Total Stock</div>
            <div className="inventory-total-units text-sm font-extrabold text-sky-400">{totalStockUnits.toLocaleString()} Units</div>
          </div>
          <div className="inventory-stat px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-right">
            <div className="inventory-stat-label text-[10px] text-slate-500 uppercase font-semibold">Stock Valuation</div>
            <div className="inventory-total-value text-sm font-black text-emerald-400">₹{Math.round(totalStockValue).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="inventory-search-panel glass-panel p-4 rounded-3xl border border-white/10 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by part description, SKU code, or brand..."
            className="inventory-search-input w-full glass-input text-white rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm focus:outline-none placeholder:text-slate-500 font-mono"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="inventory-category-select w-full md:w-56 glass-input text-white rounded-2xl px-4 py-3 text-xs focus:outline-none bg-slate-900 font-mono cursor-pointer border border-white/10"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <button
          onClick={onOpenScanner}
          className="inventory-scan-button w-full md:w-auto px-5 py-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-mono font-bold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-lg shadow-sky-950/40"
        >
          <Camera className="w-4 h-4" />
          <span>Scan Webcam</span>
        </button>
      </div>

      {/* Table of Inventory */}
      <div className="inventory-table-panel glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="inventory-table w-full text-left text-xs font-mono">
            <thead className="inventory-table-head bg-slate-900/90 text-slate-400 text-[11px] uppercase border-b border-white/10 font-bold">
              <tr>
                <th className="py-4 px-4 font-bold">SKU / Barcode</th>
                <th className="py-4 px-4 font-bold">Part Description</th>
                <th className="py-4 px-4 font-bold">Category</th>
                <th className="py-4 px-4 font-bold">Brand</th>
                <th className="py-4 px-4 text-right font-bold">Unit Rate (₹)</th>
                <th className="py-4 px-4 text-center font-bold">In Stock</th>
                <th className="py-4 px-4 text-center font-bold">GST %</th>
                <th className="py-4 px-4 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="inventory-table-body divide-y divide-white/5">
              {filtered.map((prod) => (
                <tr key={prod.code} className="inventory-row hover:bg-white/5 transition-colors">
                  <td className="inventory-sku py-3.5 px-4 font-bold text-sky-400">{prod.code}</td>
                  <td className="py-3.5 px-4">
                    <div className="inventory-part-name font-bold text-white text-xs">{prod.name}</div>
                    {prod.vehicleCompat && (
                      <div className="inventory-part-fit text-[10px] text-slate-400 mt-0.5">
                        Fits: {prod.vehicleCompat}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inventory-category-pill text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 font-semibold">
                      {prod.category}
                    </span>
                  </td>
                  <td className="inventory-brand py-3.5 px-4 text-slate-300 font-semibold">{prod.brand}</td>
                  <td className="inventory-price py-3.5 px-4 text-right font-black text-emerald-400 text-sm">
                    ₹{prod.rate.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inventory-stock inline-block text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                      prod.stock <= 3 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : prod.stock <= 8 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {prod.stock} {prod.unit}
                    </span>
                  </td>
                  <td className="inventory-tax py-3.5 px-4 text-center text-slate-400">{prod.taxPercent}%</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        onAddToCart(prod);
                        addToast({
                          type: 'success',
                          title: 'Part Added',
                          message: `${prod.name} added to cart.`
                        });
                      }}
                      className="inventory-add-button px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-all shadow-lg shadow-brand-950/40 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
