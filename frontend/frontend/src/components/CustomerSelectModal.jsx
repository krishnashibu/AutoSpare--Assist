import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Search, 
  Building2, 
  Phone, 
  Car, 
  CreditCard, 
  Check, 
  User, 
  Plus, 
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { getStoredCustomers, registerNewCustomer } from '../services/posService';

export const CustomerSelectModal = ({ 
  isOpen, 
  onClose, 
  selectedCustomer, 
  onSelectCustomer, 
  addToast 
}) => {
  const [activeTab, setActiveTab] = useState('SEARCH'); // 'SEARCH' | 'NEW'
  const [searchQuery, setSearchQuery] = useState('');
  const [newCustForm, setNewCustForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    vehicleNo: '',
    vehicleModel: '',
    customerType: 'GARAGE',
    creditLimit: 25000,
    address: ''
  });

  if (!isOpen) return null;

  const customers = getStoredCustomers();
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.vehicleNo.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCustForm.name.trim()) {
      addToast({ type: 'error', title: 'Name Required', message: 'Please enter customer or garage name.' });
      return;
    }
    if (!newCustForm.phone.trim()) {
      addToast({ type: 'error', title: 'Phone Required', message: 'Please provide a valid contact number.' });
      return;
    }

    const created = registerNewCustomer(newCustForm);
    onSelectCustomer(created);
    addToast({
      type: 'success',
      title: 'Customer Registered',
      message: `${created.name} (${created.id}) registered and associated with current transaction.`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Customer & Garage Registration
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Associate transaction with customer account & credit history
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('SEARCH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'SEARCH' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Search Existing
              </button>
              <button
                onClick={() => setActiveTab('NEW')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'NEW' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                + Register New
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'SEARCH' ? (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Garage Name, Phone (+91...), Vehicle No (KL-06...), or Customer ID..."
                  className="w-full glass-input text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none placeholder:text-slate-500 font-mono"
                  autoFocus
                />
              </div>

              {/* Customer List */}
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No registered customer matched "{searchQuery}". Click "+ Register New" to add on the spot.
                  </div>
                ) : (
                  filteredCustomers.map((cust) => {
                    const isSelected = selectedCustomer?.id === cust.id;
                    return (
                      <div
                        key={cust.id}
                        onClick={() => {
                          onSelectCustomer(cust);
                          addToast({
                            type: 'info',
                            title: 'Customer Attached',
                            message: `Selected ${cust.name} for current billing session.`
                          });
                          onClose();
                        }}
                        className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/15 ring-1 ring-emerald-500/40'
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{cust.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                              {cust.customerType}
                            </span>
                            <span className="text-[10px] font-mono text-sky-400">ID: {cust.id}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                            <span className="flex items-center gap-1 text-slate-300">
                              <Phone className="w-3.5 h-3.5 text-slate-500" /> {cust.phone}
                            </span>
                            <span className="flex items-center gap-1 text-amber-300">
                              <Car className="w-3.5 h-3.5" /> {cust.vehicleNo}
                            </span>
                            <span>{cust.vehicleModel}</span>
                          </div>
                        </div>

                        {/* Credit Status Card */}
                        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                          <div className="text-xs font-mono text-slate-400">
                            Outstanding: <strong className="text-amber-400">₹{cust.currentOutstanding.toLocaleString()}</strong>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Limit: ₹{cust.creditLimit.toLocaleString()}
                          </div>
                          <button
                            type="button"
                            className={`mt-1 text-xs px-3 py-1 rounded-lg font-semibold transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select Customer'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Register New Customer Form */
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                    Garage / Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustForm.name}
                    onChange={(e) => setNewCustForm({ ...newCustForm, name: e.target.value })}
                    placeholder="e.g. Maruthi Auto Works"
                    className="w-full glass-input text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newCustForm.phone}
                    onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                    placeholder="+91 98450 12345"
                    className="w-full glass-input text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none placeholder:text-slate-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                    Vehicle Reg Number
                  </label>
                  <input
                    type="text"
                    value={newCustForm.vehicleNo}
                    onChange={(e) => setNewCustForm({ ...newCustForm, vehicleNo: e.target.value })}
                    placeholder="e.g. KL-06-E-4521"
                    className="w-full glass-input text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none placeholder:text-slate-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                    Vehicle Make / Model
                  </label>
                  <input
                    type="text"
                    value={newCustForm.vehicleModel}
                    onChange={(e) => setNewCustForm({ ...newCustForm, vehicleModel: e.target.value })}
                    placeholder="e.g. Piaggio Ape Diesel 400"
                    className="w-full glass-input text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                    Customer Category
                  </label>
                  <select
                    value={newCustForm.customerType}
                    onChange={(e) => setNewCustForm({ ...newCustForm, customerType: e.target.value })}
                    className="w-full glass-input text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none bg-slate-900"
                  >
                    <option value="GARAGE">GARAGE / WORKSHOP</option>
                    <option value="FLEET_OWNER">FLEET OWNER (AUTO/CAB)</option>
                    <option value="RETAIL">RETAIL MOTORIST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                    Assigned Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    value={newCustForm.creditLimit}
                    onChange={(e) => setNewCustForm({ ...newCustForm, creditLimit: e.target.value })}
                    placeholder="25000"
                    className="w-full glass-input text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none placeholder:text-slate-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Garage / Workshop Location
                </label>
                <input
                  type="text"
                  value={newCustForm.address}
                  onChange={(e) => setNewCustForm({ ...newCustForm, address: e.target.value })}
                  placeholder="e.g. 1st Mile Kumily, Idukki"
                  className="w-full glass-input text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Customer & Select for Sale</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
