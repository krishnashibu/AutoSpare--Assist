export const ROLES = {
  COUNTER_STAFF: {
    id: 'COUNTER_STAFF',
    label: 'Counter Staff',
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    iconName: 'ScanBarcode',
    description: 'Product barcode scanning, customer registration, Cash & UPI transaction entry',
    responsibilities: [
      'Scan spare-part barcodes via webcam optical scanner',
      'Register & lookup garage and customer accounts',
      'Calculate totals & record Cash, UPI BharatQR payments',
      'Process credit transactions within ₹15,000 policy limit'
    ]
  },
  STORE_MANAGER: {
    id: 'STORE_MANAGER',
    label: 'Store Manager',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    iconName: 'ShieldCheck',
    description: 'High-value credit approvals (> ₹15,000), transaction override, store supervision',
    responsibilities: [
      'Approve / Reject credit purchases exceeding ₹15,000 threshold',
      'Receive instant lock notifications on high-value credit sales',
      'Oversee counter transactions and billing system sync',
      'Staff activity supervision & transaction audit'
    ]
  }
};

export const SYSTEM_SPECS = {
  appName: 'Autospare Assist',
  organization: 'GK Auto Spares',
  version: 'v2.4',
  creditLockThreshold: 15000,
  roles: ['Counter Staff', 'Store Manager']
};
