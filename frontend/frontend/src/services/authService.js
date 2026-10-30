const STORAGE_KEYS = {
  USERS: 'gk_staff_users_v2',
  SESSION: 'gk_staff_current_session',
  REMEMBERED: 'gk_remembered_staff_id'
};

// Default staff accounts for GK Auto Spares (Counter Staff & Store Manager)
const DEFAULT_STAFF_USERS = [
  {
    id: 'usr_01',
    employeeId: 'GK-STF-101',
    fullName: 'Rajesh Kumar',
    email: 'rajesh.k@gkautospares.in',
    department: 'Spares Counter A',
    role: 'COUNTER_STAFF',
    password: 'Password@123'
  },
  {
    id: 'usr_02',
    employeeId: 'GK-MGR-001',
    fullName: 'Suresh Patel',
    email: 'suresh.patel@gkautospares.in',
    department: 'Store Management Desk',
    role: 'STORE_MANAGER',
    password: 'Manager@2026'
  }
];

export const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_STAFF_USERS));
      return DEFAULT_STAFF_USERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_STAFF_USERS;
  }
};

export const getRememberedStaffId = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.REMEMBERED) || '';
  } catch (e) {
    return '';
  }
};

export const setRememberedStaffId = (staffId) => {
  if (staffId) {
    localStorage.setItem(STORAGE_KEYS.REMEMBERED, staffId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED);
  }
};

export const getCurrentSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const saveSession = (user) => {
  const sessionData = {
    ...user,
    sessionToken: 'GK_TOK_' + Math.random().toString(36).substring(2) + Date.now(),
    loginTime: new Date().toISOString(),
    terminalId: 'GK-POS-04'
  };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
  return sessionData;
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
};

export const loginStaff = async ({ identifier, password, role, rememberMe }) => {
  await new Promise((res) => setTimeout(res, 400));

  const users = getStoredUsers();
  const cleanId = identifier.trim().toLowerCase();

  const user = users.find(
    (u) =>
      (u.employeeId.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) &&
      u.password === password
  );

  if (!user) {
    throw new Error('Invalid Employee ID / Email or Password.');
  }

  if (role && user.role !== role) {
    const roleName = role === 'COUNTER_STAFF' ? 'Counter Staff' : 'Store Manager';
    const userRoleName = user.role === 'COUNTER_STAFF' ? 'Counter Staff' : 'Store Manager';
    throw new Error(`This account is assigned to "${userRoleName}", not "${roleName}". Please switch role.`);
  }

  if (rememberMe) {
    setRememberedStaffId(user.employeeId);
  } else {
    setRememberedStaffId('');
  }

  const session = saveSession(user);
  return session;
};

export const requestPasswordReset = async (identifier) => {
  await new Promise((res) => setTimeout(res, 350));
  const users = getStoredUsers();
  const clean = identifier.trim().toLowerCase();
  const user = users.find(
    (u) => u.employeeId.toLowerCase() === clean || u.email.toLowerCase() === clean
  );

  if (!user) {
    throw new Error(`No staff member found for "${identifier}".`);
  }

  return {
    success: true,
    user,
    message: `Password reset request registered for ${user.fullName} (${user.employeeId}). Temporary login PIN dispatched to ${user.email}.`
  };
};

export const resetToDefaultData = () => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_STAFF_USERS));
  return DEFAULT_STAFF_USERS;
};
