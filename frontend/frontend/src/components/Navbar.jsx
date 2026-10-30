import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Layers,
  Users,
  ShieldAlert,
  History,
  RefreshCw,
  LogOut,
  Clock,
  Camera
} from 'lucide-react';
import { ROLES } from '../constants/roles';
import { AutomotiveBrandMark } from './AutomotiveBrandMark';

export const Navbar = ({
  activeTab,
  setActiveTab,
  cartCount,
  pendingApprovalsCount,
  currentUser,
  onOpenAuthModal,
  onOpenScanner,
  onLogout
}) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: true }));
  const roleConfig = ROLES[currentUser?.role] || ROLES.COUNTER_STAFF;
  const isManager = currentUser?.role === 'STORE_MANAGER';
  const initials = currentUser?.fullName?.split(' ').map((name) => name[0]).join('') || 'ST';

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'POS Billing', icon: ShoppingCart, badge: cartCount > 0 ? cartCount : null, badgeTone: 'positive' },
    { id: 'inventory', label: 'Spare Parts Stock', icon: Layers },
    { id: 'customers', label: 'Customers & Credit', icon: Users },
    { id: 'approvals', label: 'Credit Approvals', icon: ShieldAlert, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null, badgeTone: 'warning' },
    { id: 'history', label: 'Sales Records', icon: History },
    { id: 'sync', label: 'Billing API', icon: RefreshCw }
  ];

  return (
    <aside className="dashboard-navbar authenticated-sidebar" aria-label="Workspace navigation">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <AutomotiveBrandMark />
        </div>
        <div className="sidebar-brand-copy">
          <span className="sidebar-brand-title">GK AUTOMOBILES</span>
          <span className="sidebar-brand-subtitle">AUTOSPARE ASSIST</span>
        </div>
      </div>

      <div className="sidebar-location">
        <span className="sidebar-location-dot" />
        <span>Kumily Main</span>
        <span className="sidebar-terminal-badge">POS TERMINAL</span>
      </div>

      <nav className="dashboard-nav-list" aria-label="Primary navigation">
        <span className="sidebar-section-label">WORKSPACE</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={'sidebar-tab' + (isActive ? ' is-active' : '')}
              aria-current={isActive ? 'page' : undefined}
              title={item.label}
            >
              <Icon className="sidebar-tab-icon" aria-hidden="true" />
              <span className="sidebar-tab-label">{item.label}</span>
              {item.badge !== null && item.badge !== undefined && (
                <span className={'sidebar-tab-badge ' + (item.badgeTone || '')}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-utility">
        <button type="button" onClick={onOpenScanner} className="sidebar-scan-button" title="Scan a part with webcam (F2)">
          <Camera aria-hidden="true" />
          <span>Scan with webcam</span>
          <kbd>F2</kbd>
        </button>

        <div className="sidebar-runtime" aria-label="Terminal status">
          <div className="sidebar-runtime-time"><Clock aria-hidden="true" /><span>{time}</span></div>
          <div className="sidebar-runtime-status"><span className="sidebar-live-dot" />REST API online</div>
        </div>

        <div className="sidebar-actions">
          <button
            type="button"
            onClick={onOpenAuthModal}
            className={'sidebar-user-button' + (isManager ? ' is-manager' : '')}
            title={'Switch operator: ' + (currentUser?.fullName || 'Staff Operator')}
          >
            <span className="sidebar-user-avatar">{initials}</span>
            <span className="sidebar-user-copy">
              <span className="sidebar-user-name">{currentUser?.fullName || 'Staff Operator'}</span>
              <span className="sidebar-user-role">{roleConfig.label} · Switch</span>
            </span>
          </button>
          <button type="button" onClick={onLogout} className="dashboard-logout sidebar-logout" title="Sign out">
            <LogOut aria-hidden="true" />
            <span className="sidebar-logout-label">Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};