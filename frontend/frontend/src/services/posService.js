import { INITIAL_PRODUCTS } from '../data/productsData';
import { INITIAL_CUSTOMERS } from '../data/customersData';
import { CREDIT_LOCK_THRESHOLD } from '../constants/categories';

const STORAGE_KEYS = {
  PRODUCTS: 'gk_products_v2',
  CUSTOMERS: 'gk_customers_v2',
  TRANSACTIONS: 'gk_transactions_v2',
  APPROVALS: 'gk_locked_approvals_v2',
  SYNC_LOGS: 'gk_billing_sync_logs_v2'
};

// 1. PRODUCTS STORE
export const getStoredProducts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_PRODUCTS;
  }
};

export const saveProducts = (products) => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const findProductByBarcode = (query) => {
  const products = getStoredProducts();
  const clean = query.trim().toLowerCase();
  return products.find(
    (p) =>
      p.code.toLowerCase() === clean ||
      p.barcode.toLowerCase() === clean ||
      p.name.toLowerCase().includes(clean)
  );
};

// 2. CUSTOMERS STORE
export const getStoredCustomers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CUSTOMERS;
  }
};

export const saveCustomers = (customers) => {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
};

export const registerNewCustomer = (customerData) => {
  const customers = getStoredCustomers();
  const newCust = {
    id: 'CUST-' + Math.floor(1000 + Math.random() * 9000),
    name: customerData.name.trim(),
    contactPerson: customerData.contactPerson || customerData.name,
    phone: customerData.phone.trim(),
    email: customerData.email || 'customer@gkautospares.in',
    vehicleNo: (customerData.vehicleNo || 'KL-06-XX-0000').toUpperCase(),
    vehicleModel: customerData.vehicleModel || 'Standard Vehicle',
    customerType: customerData.customerType || 'RETAIL',
    creditLimit: Number(customerData.creditLimit) || 15000,
    currentOutstanding: 0,
    address: customerData.address || 'Kumily, Idukki District',
    registeredAt: new Date().toISOString()
  };

  customers.unshift(newCust);
  saveCustomers(customers);
  return newCust;
};

// 3. CART TOTALS CALCULATOR
export const calculateCartTotals = (cartItems, discountPercent = 0) => {
  let subtotal = 0;
  let taxAmount = 0;

  cartItems.forEach((item) => {
    const itemNet = item.rate * item.quantity;
    subtotal += itemNet;
    const itemTax = itemNet * ((item.taxPercent || 18.0) / 100);
    taxAmount += itemTax;
  });

  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableSubtotal = subtotal - discountAmount;
  const finalTax = (taxableSubtotal * 18.0) / 100;
  const grandTotal = Math.round((taxableSubtotal + finalTax) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountPercent,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxableSubtotal: Math.round(taxableSubtotal * 100) / 100,
    taxAmount: Math.round(finalTax * 100) / 100,
    grandTotal,
    itemCount: cartItems.reduce((acc, curr) => acc + curr.quantity, 0)
  };
};

// 4. CREDIT LIMIT & LOCK MECHANISM EVALUATOR
export const evaluateCreditTransaction = (customer, grandTotal) => {
  const currentOutstanding = customer ? customer.currentOutstanding || 0 : 0;
  const creditLimit = customer ? customer.creditLimit || CREDIT_LOCK_THRESHOLD : CREDIT_LOCK_THRESHOLD;
  const exceedsThreshold = grandTotal > CREDIT_LOCK_THRESHOLD;
  const exceedsCustomerLimit = (currentOutstanding + grandTotal) > creditLimit;

  return {
    requiresManagerApproval: exceedsThreshold || exceedsCustomerLimit,
    threshold: CREDIT_LOCK_THRESHOLD,
    grandTotal,
    currentOutstanding,
    projectedOutstanding: currentOutstanding + grandTotal,
    creditLimit,
    reason: exceedsThreshold
      ? `Credit purchase amount (₹${grandTotal.toLocaleString()}) exceeds mandatory threshold of ₹${CREDIT_LOCK_THRESHOLD.toLocaleString()}.`
      : exceedsCustomerLimit
      ? `Projected credit balance (₹${(currentOutstanding + grandTotal).toLocaleString()}) exceeds customer limit of ₹${creditLimit.toLocaleString()}.`
      : null
  };
};

// 5. MANAGER APPROVALS STORE
export const getPendingApprovals = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPROVALS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveApprovals = (approvals) => {
  localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(approvals));
};

export const submitCreditLockRequest = ({
  cart,
  totals,
  customer,
  staffUser,
  evaluation
}) => {
  const approvals = getPendingApprovals();
  const newRequest = {
    id: 'REQ-LOCK-' + Date.now().toString().slice(-6),
    timestamp: new Date().toISOString(),
    status: 'PENDING', // 'PENDING' | 'APPROVED' | 'REJECTED'
    customer,
    cart,
    totals,
    staffUser: staffUser || { fullName: 'Counter Staff', employeeId: 'GK-STF-101' },
    evaluation,
    terminalId: 'GK-POS-04'
  };

  approvals.unshift(newRequest);
  saveApprovals(approvals);
  return newRequest;
};

export const processManagerApproval = (requestId, decision, managerUser, notes = '') => {
  const approvals = getPendingApprovals();
  const req = approvals.find((a) => a.id === requestId);
  if (!req) throw new Error('Lock request not found.');

  req.status = decision; // 'APPROVED' or 'REJECTED'
  req.decidedAt = new Date().toISOString();
  req.decidedBy = managerUser.fullName;
  req.managerId = managerUser.employeeId;
  req.notes = notes;

  saveApprovals(approvals);
  return req;
};

// 6. COMPLETED TRANSACTIONS STORE
export const getCompletedTransactions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveTransactions = (txns) => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));
};

export const completeSaleTransaction = ({
  customer,
  cart,
  totals,
  paymentMode, // 'CASH' | 'UPI' | 'CREDIT'
  paymentDetails = {},
  staffUser,
  approvalId = null
}) => {
  const transactions = getCompletedTransactions();
  const invoiceNumber = 'GK-INV-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);

  const newTransaction = {
    id: 'TXN-' + Date.now(),
    invoiceNumber,
    createdAt: new Date().toISOString(),
    customer: customer || {
      name: 'Walk-in Cash Customer',
      phone: 'N/A',
      vehicleNo: 'COUNTER SALE',
      customerType: 'RETAIL'
    },
    items: cart,
    totals,
    paymentMode,
    paymentDetails: {
      ...paymentDetails,
      transactionRef: paymentDetails.transactionRef || (paymentMode === 'UPI' ? null : ('REF-' + Math.random().toString(36).substring(2, 10).toUpperCase()))
    },
    staffUser: staffUser || { fullName: 'Rajesh Kumar', employeeId: 'GK-STF-101' },
    approvalId,
    billingSyncStatus: 'SYNCED',
    terminalId: 'GK-POS-04'
  };

  transactions.unshift(newTransaction);
  saveTransactions(transactions);

  // Update Product Stock Levels
  const products = getStoredProducts();
  cart.forEach((cartItem) => {
    const prod = products.find((p) => p.code === cartItem.code);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - cartItem.quantity);
    }
  });
  saveProducts(products);

  // Update Customer Outstanding if Credit was selected
  if (paymentMode === 'CREDIT' && customer && customer.id) {
    const customers = getStoredCustomers();
    const cust = customers.find((c) => c.id === customer.id);
    if (cust) {
      cust.currentOutstanding = (cust.currentOutstanding || 0) + totals.grandTotal;
      saveCustomers(customers);
    }
  }

  // Update Billing System Exchange Log
  logBillingSync(newTransaction);

  return newTransaction;
};

// 7. BILLING SYSTEM API SYNC LOGS
export const getBillingSyncLogs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const logBillingSync = (transaction) => {
  const logs = getBillingSyncLogs();
  const newLog = {
    id: 'SYNC-' + Date.now(),
    timestamp: new Date().toISOString(),
    invoiceNumber: transaction.invoiceNumber,
    action: 'DISPATCH_INVOICE_TO_GK_BILLING',
    status: '200_OK_SUCCESS',
    payloadItemsCount: transaction.items.length,
    amount: transaction.totals.grandTotal,
    paymentMode: transaction.paymentMode,
    remoteGateway: 'http://billing-engine.gkautospares.local:8080/api/v1/invoices'
  };

  logs.unshift(newLog);
  localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(logs.slice(0, 50)));
  return newLog;
};

export const resetAllPosData = () => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
  localStorage.removeItem(STORAGE_KEYS.APPROVALS);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.SYNC_LOGS);
};
