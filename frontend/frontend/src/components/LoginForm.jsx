import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { ROLES } from '../constants/roles';
import { loginStaff, getRememberedStaffId, getStoredUsers } from '../services/authService';
import { EyeIcon, LockIcon, UserIcon } from './LoginIcons';

export const LoginForm = ({ onLoginSuccess, onForgotPassword, addToast }) => {
  const [selectedRole, setSelectedRole] = useState('COUNTER_STAFF');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const remembered = getRememberedStaffId();
    if (remembered) {
      setIdentifier(remembered);
      setRememberMe(true);
      const users = getStoredUsers();
      const matched = users.find(user => user.employeeId === remembered);
      if (matched) {
        setSelectedRole(matched.role);
      }
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your Employee ID or registered email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your staff access password.');
      return;
    }

    setIsLoading(true);
    try {
      const session = await loginStaff({
        identifier,
        password,
        role: selectedRole,
        rememberMe
      });

      addToast({
        type: 'success',
        title: 'Authentication Successful',
        message: 'Welcome, ' + session.fullName + '! Logged in as ' + ROLES[session.role].label + '.'
      });

      onLoginSuccess(session);
    } catch (error) {
      setErrorMessage(error.message || 'Login failed. Please check your credentials.');
      addToast({
        type: 'error',
        title: 'Authentication Error',
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectRole = (role) => {
    setSelectedRole(role);
    setErrorMessage('');
  };

  const activeRoleConfig = ROLES[selectedRole];

  return (
    <form className="login-form" onSubmit={handleSubmit} aria-label="Staff sign in">
      <fieldset className="login-roles">
        <legend>Choose your role</legend>
        <div className="role-grid">
          <button
            type="button"
            className={selectedRole === 'COUNTER_STAFF' ? 'role-option active' : 'role-option'}
            aria-pressed={selectedRole === 'COUNTER_STAFF'}
            onClick={() => selectRole('COUNTER_STAFF')}
          >
            <span className="role-icon" aria-hidden="true"><UserIcon /></span>
            <span className="role-copy">
              <strong>Counter staff</strong>
              <small>Billing &amp; scanner</small>
            </span>
            <span className="radio" aria-hidden="true" />
          </button>

          <button
            type="button"
            className={selectedRole === 'STORE_MANAGER' ? 'role-option active' : 'role-option'}
            aria-pressed={selectedRole === 'STORE_MANAGER'}
            onClick={() => selectRole('STORE_MANAGER')}
          >
            <span className="role-icon" aria-hidden="true"><LockIcon /></span>
            <span className="role-copy">
              <strong>Store manager</strong>
              <small>Reports &amp; approvals</small>
            </span>
            <span className="radio" aria-hidden="true" />
          </button>
        </div>
      </fieldset>

      <label className="field" htmlFor="staff-identifier">
        <span className="field-label">
          {selectedRole === 'COUNTER_STAFF' ? 'Employee code or email' : 'Manager ID or official email'}
        </span>
        <span className="input-wrap">
          <span className="input-icon" aria-hidden="true"><UserIcon /></span>
          <input
            id="staff-identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            value={identifier}
            onChange={(event) => {
              setIdentifier(event.target.value);
              setErrorMessage('');
            }}
            placeholder={selectedRole === 'COUNTER_STAFF' ? 'e.g. GK-STF-101' : 'e.g. GK-MGR-001'}
          />
        </span>
      </label>

      <div className="field">
        <div className="password-label">
          <label className="field-label" htmlFor="staff-password">Passcode</label>
          <button type="button" className="text-button" onClick={onForgotPassword}>
            Forgot passcode?
          </button>
        </div>
        <span className="input-wrap">
          <span className="input-icon" aria-hidden="true"><LockIcon /></span>
          <input
            id="staff-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrorMessage('');
            }}
            placeholder="Enter your secure passcode"
          />
          <button
            type="button"
            className="eye-button"
            aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
            aria-pressed={showPassword}
            onClick={() => setShowPassword(value => !value)}
          >
            <EyeIcon hidden={showPassword} />
          </button>
        </span>
      </div>

      <div className="remember-row">
        <label className="remember-label">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          <span>Remember this terminal</span>
        </label>
        <span className="secure-note"><LockIcon /> Secure session</span>
      </div>

      {errorMessage && (
        <div className="login-error" role="alert">
          <AlertCircle aria-hidden="true" size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <button type="submit" className="submit-button" disabled={isLoading}>
        <span>{isLoading ? 'Signing in...' : 'Sign in as ' + activeRoleConfig.label}</span>
        {isLoading ? (
          <span className="login-spinner" aria-hidden="true" />
        ) : (
          <span className="submit-arrow" aria-hidden="true">→</span>
        )}
      </button>
    </form>
  );
};
