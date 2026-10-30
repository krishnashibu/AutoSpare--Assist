import { useState, useEffect } from 'react';
import { AutomotiveBrandMark } from './components/AutomotiveBrandMark';
import './LoginPage.css';
import './DashboardTheme.css';
import './PosBillingTheme.css';
import './SparePartsTheme.css';
import './CustomerCreditTheme.css';
import './OperationsSuiteTheme.css';
import './AuthenticatedShell.css';

import { Navbar } from './components/Navbar';
import { LoginForm } from './components/LoginForm';
import { DashboardOverview } from './components/DashboardOverview';
import { PosBillingView } from './components/PosBillingView';
import { ProductCatalogView } from './components/ProductCatalogView';
import { CustomerDirectoryView } from './components/CustomerDirectoryView';
import { ManagerApprovalCenter } from './components/ManagerApprovalCenter';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { BillingSyncView } from './components/BillingSyncView';

import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { CustomerSelectModal } from './components/CustomerSelectModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CreditLockModal } from './components/CreditLockModal';
import { InvoiceModal } from './components/InvoiceModal';
import { StaffAuthModal } from './components/StaffAuthModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { Toast } from './components/Toast';

import { 
  getStoredProducts, 
  getStoredCustomers, 
  getPendingApprovals, 
  completeSaleTransaction,
  submitCreditLockRequest,
  calculateCartTotals
} from './services/posService';
import { getCurrentSession, clearSession, saveSession, getStoredUsers } from './services/authService';

export function App() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentSession());
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'pos' | 'inventory' | 'customers' | 'approvals' | 'history' | 'sync'
  const [products, setProducts] = useState(getStoredProducts());
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  // New state to hold backend health status
  const [backendStatus, setBackendStatus] = useState('');

  // Check backend health on mount using the proxy (/ping)
  useEffect(() => {
    fetch('/ping')
      .then((r) => r.text())
      .then((txt) => setBackendStatus(txt))
      .catch(() => setBackendStatus('unreachable'));
  }, []);


  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCreditLockModalOpen, setIsCreditLockModalOpen] = useState(false);
  const [lockedRequestData, setLockedRequestData] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [activeInvoiceTxn, setActiveInvoiceTxn] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Pending Manager Approvals count
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(
    () => getPendingApprovals().filter(a => a.status === 'PENDING').length
  );

  const refreshPendingCount = () => {
    const pending = getPendingApprovals().filter(a => a.status === 'PENDING').length;
    setPendingApprovalsCount(pending);
  };

  const addToast = ({ type = 'info', title, message }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard shortcut listener (F2 for scanner)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setIsScannerOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cart Management
  const handleAddToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.code === product.code);
      if (existing) {
        return prev.map((item) =>
          item.code === product.code
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const handleUpdateCartQty = (code, qty) => {
    if (qty <= 0) {
      handleRemoveFromCart(code);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.code === code ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveFromCart = (code) => {
    setCart((prev) => prev.filter((item) => item.code !== code));
  };

  const handleClearCart = () => {
    setCart([]);
    addToast({
      type: 'info',
      title: 'Cart Cleared',
      message: 'Active counter cart has been reset.'
    });
  };

  // Login handler
  const handleLoginSuccess = (userSession) => {
    setCurrentUser(userSession);
    setActiveTab('dashboard');
    addToast({
      type: 'success',
      title: 'Terminal Authenticated',
      message: `Welcome to Autospare Assist POS, ${userSession.fullName}!`
    });
  };

  // Logout handler
  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setCart([]);
    setSelectedCustomer(null);
    addToast({
      type: 'info',
      title: 'Shift Ended / Signed Out',
      message: 'Staff terminal session closed securely.'
    });
  };

  // Checkout Completion Handlers
  const handleCompleteSale = ({ paymentMode, paymentDetails }) => {
    const totals = calculateCartTotals(cart);
    const txn = completeSaleTransaction({
      customer: selectedCustomer,
      cart,
      totals,
      paymentMode,
      paymentDetails,
      staffUser: currentUser
    });

    setCart([]);
    setProducts(getStoredProducts());
    setIsCheckoutOpen(false);

    setActiveInvoiceTxn(txn);
    setIsInvoiceOpen(true);

    addToast({
      type: 'success',
      title: 'Sale Completed',
      message: `Invoice ${txn.invoiceNumber} recorded via ${paymentMode}.`
    });
  };

  // Credit Lock Trigger (> ₹15,000)
  const handleTriggerCreditLock = ({ cart, totals, customer, staffUser, evaluation }) => {
    const lockReq = submitCreditLockRequest({
      cart,
      totals,
      customer,
      staffUser,
      evaluation
    });

    setLockedRequestData(lockReq);
    setIsCreditLockModalOpen(true);
    refreshPendingCount();

    addToast({
      type: 'warning',
      title: 'Credit Lock Engaged (> ₹15,000)',
      message: `Transaction locked (Request ${lockReq.id}). Store Manager alerted.`
    });
  };

  // When Manager approves in ManagerApprovalCenter
  const handleTransactionCompletedFromApproval = (completedTxn) => {
    refreshPendingCount();
    setProducts(getStoredProducts());
    setActiveInvoiceTxn(completedTxn);
    setIsInvoiceOpen(true);
  };

  const handleSwitchToManagerDirectly = () => {
    const users = getStoredUsers();
    const manager = users.find(u => u.role === 'STORE_MANAGER');
    if (manager) {
      saveSession(manager);
      setCurrentUser(manager);
      setActiveTab('approvals');
      addToast({
        type: 'info',
        title: 'Switched to Store Manager',
        message: 'Logged in as Suresh Patel. Reviewing credit approvals.'
      });
    }
  };

  const cartTotals = calculateCartTotals(cart);

  return (
    <div className={currentUser ? (activeTab === 'dashboard' ? 'dashboard-home-shell' : activeTab === 'pos' ? 'pos-billing-shell' : activeTab === 'inventory' ? 'inventory-stock-shell' : activeTab === 'customers' ? 'customer-credit-shell' : activeTab === 'approvals' || activeTab === 'history' || activeTab === 'sync' ? 'operations-suite-shell' : 'min-h-screen bg-slate-950 text-slate-100 flex flex-col automotive-grid relative selection:bg-brand-500 selection:text-white') : 'login-app-shell'}>
      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {!currentUser ? (
        <main className="login-screen">
          <section className="login-panel" aria-labelledby="login-title">
            <div className="mobile-brand">
              <div className="brand-mark small" aria-hidden="true">
                <AutomotiveBrandMark className="login-brand-icon" />
              </div>
              <span>GK AUTOMOBILES</span>
            </div>

            <div className="login-card">
              <header className="login-heading">
                <div className="terminal-label">STAFF TERMINAL · GK-POS-04</div>
                <h2 id="login-title">Welcome back</h2>
                <p>Sign in to start your terminal session.</p>
              </header>

              <LoginForm
                onLoginSuccess={handleLoginSuccess}
                onForgotPassword={() => setIsForgotModalOpen(true)}
                addToast={addToast}
              />

              <p className="help-copy">Need access? Contact your store administrator.</p>
            </div>
          </section>

          <section className="brand-panel" aria-labelledby="brand-story-title">
            <div className="brand-mark" aria-hidden="true">
              <AutomotiveBrandMark className="login-brand-icon" />
            </div>
            <div className="brand-name">GK AUTOMOBILES</div>

            <div className="hero-copy">
              <div className="eyebrow">STAFF OPERATIONS PORTAL</div>
              <h1 id="brand-story-title">Built for the people who keep business moving.</h1>
              <p>A focused, secure workspace for your counter team and store managers.</p>
            </div>

            <div className="service-strip" aria-label="Portal services">
              <div><strong>24/7</strong><span>Secure access</span></div>
              <div><strong>POS</strong><span>Terminal ready</span></div>
              <div><strong>LIVE</strong><span>Inventory sync</span></div>
            </div>

            <div className="brand-footer">
              <span className="status-dot" aria-hidden="true" />
              <span>Systems operational</span>
            </div>
          </section>
        </main>
      ) : (
        /* ========================================================================= */
        /* 2. AUTHENTICATED STAFF DASHBOARD & OPERATIONS                             */
        /* ========================================================================= */
        <div className="authenticated-app-layout">
          {/* Top Navbar */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            cartCount={cart.length}
            pendingApprovalsCount={pendingApprovalsCount}
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenScanner={() => setIsScannerOpen(true)}
            onLogout={handleLogout}
          />

          <div className="authenticated-main-column">
          {/* Main Workspace */}
          <main className="dashboard-main flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Tab 1: Executive Dashboard Overview */}
            {activeTab === 'dashboard' && (
              <DashboardOverview
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenScanner={() => setIsScannerOpen(true)}
                onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />
            )}

            {/* Tab 2: POS Terminal & Counter Billing */}
            {activeTab === 'pos' && (
              <PosBillingView
                products={products}
                cart={cart}
                onAddToCart={handleAddToCart}
                onUpdateCartQty={handleUpdateCartQty}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
                selectedCustomer={selectedCustomer}
                onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
                onOpenScannerModal={() => setIsScannerOpen(true)}
                onOpenCheckoutModal={() => setIsCheckoutOpen(true)}
                addToast={addToast}
              />
            )}

            {/* Tab 3: Full Inventory Stock Catalog */}
            {activeTab === 'inventory' && (
              <ProductCatalogView
                products={products}
                onAddToCart={handleAddToCart}
                onOpenScanner={() => setIsScannerOpen(true)}
                addToast={addToast}
              />
            )}

            {/* Tab 4: Customer Directory & Credit Accounts */}
            {activeTab === 'customers' && (
              <CustomerDirectoryView
                onSelectCustomerForBilling={(cust) => {
                  setSelectedCustomer(cust);
                  setActiveTab('pos');
                  addToast({
                    type: 'success',
                    title: 'Customer Attached',
                    message: `Loaded ${cust.name} for POS billing.`
                  });
                }}
                onOpenAddCustomerModal={() => setIsCustomerModalOpen(true)}
              />
            )}

            {/* Tab 5: Manager Credit Approval Center */}
            {activeTab === 'approvals' && (
              <ManagerApprovalCenter
                currentUser={currentUser}
                onTransactionCompleted={handleTransactionCompletedFromApproval}
                addToast={addToast}
                onSwitchToManagerLogin={handleSwitchToManagerDirectly}
              />
            )}

            {/* Tab 6: Sales Records & Invoices */}
            {activeTab === 'history' && (
              <TransactionHistoryView
                onOpenInvoiceModal={(txn) => {
                  setActiveInvoiceTxn(txn);
                  setIsInvoiceOpen(true);
                }}
              />
            )}

            {/* Tab 7: Existing Billing System API Sync */}
            {activeTab === 'sync' && (
              <BillingSyncView addToast={addToast} />
            )}
          </main>

          {/* Footer */}
          <footer className="dashboard-footer border-t border-white/10 bg-slate-950/95 py-3.5 text-center text-xs text-slate-500 font-mono">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>G.K AUTOMOBILES • 1st Mile Kumily. Opp. Amaravathi Co-operative Bank, Idukki</span>
              <div className="flex items-center gap-3 text-slate-400">
                <span>Terminal: GK-POS-04</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">₹15,000 Credit Lock Active</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">REST API: Online</span>
              </div>
            </div>
          </footer>
          </div>
        </div>
      )}

      {/* All Interactive Modals */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAddToCart={handleAddToCart}
        addToast={addToast}
      />

      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={(cust) => setSelectedCustomer(cust)}
        addToast={addToast}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        totals={cartTotals}
        selectedCustomer={selectedCustomer}
        currentUser={currentUser}
        onCompleteSale={handleCompleteSale}
        onTriggerCreditLock={handleTriggerCreditLock}
        addToast={addToast}
      />

      <CreditLockModal
        isOpen={isCreditLockModalOpen}
        onClose={() => setIsCreditLockModalOpen(false)}
        lockedRequest={lockedRequestData}
        onSwitchToManager={handleSwitchToManagerDirectly}
        addToast={addToast}
      />

      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        transaction={activeInvoiceTxn}
        addToast={addToast}
      />

      <StaffAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onStaffChange={(user) => setCurrentUser(user)}
        addToast={addToast}
      />

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        addToast={addToast}
      />
    </div>
  );
}

export default App;
