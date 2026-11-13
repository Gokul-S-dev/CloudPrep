/**
 * CloudPrep Authentication Service Layer
 *
 * Architecture:
 * Designed for drop-in integration with Amazon Cognito (AWS Amplify / amazon-cognito-identity-js).
 * When Cognito User Pool environment variables are not configured, operates in
 * Frontend Demo Preview Mode with strictly separated preview accounts.
 *
 * Security guarantees:
 * - Never persists passwords in localStorage or sessionStorage.
 * - Stores only non-sensitive session metadata & simulated JWT token.
 */

const SESSION_KEY = 'cloudprep_auth_session';

// Check if Cognito is configured via Vite env
export const isCognitoConfigured = Boolean(
  import.meta.env.VITE_COGNITO_USER_POOL_ID &&
  import.meta.env.VITE_COGNITO_CLIENT_ID
);

// Frontend-only preview accounts (NEVER use in production)
const DEMO_USERS = [
  {
    id: 'stu-001',
    fullName: 'Aarav Sharma',
    email: 'student@cloudprep.demo',
    role: 'student',
    institution: 'National Institute of Technology',
    course: 'B.Tech Computer Science',
    graduationYear: '2026',
    createdAt: '2026-09-15T08:30:00Z',
    verified: true,
    isDemo: true
  },
  {
    id: 'adm-001',
    fullName: 'CloudPrep Administrator',
    email: 'admin@cloudprep.demo',
    role: 'admin',
    institution: 'CloudPrep Platform Ops',
    course: 'Platform Administration',
    graduationYear: '—',
    createdAt: '2026-08-01T09:00:00Z',
    verified: true,
    isDemo: true
  }
];

// In-memory runtime store for session-registered demo users (never stored in browser storage with passwords)
const runtimeDemoCredentials = new Map([
  ['student@cloudprep.demo', 'CloudPrep@2026'],
  ['admin@cloudprep.demo', 'Admin@2026!']
]);

const runtimeRegisteredProfiles = new Map();
const pendingVerifications = new Map();
const pendingPasswordResets = new Map();

function delay(ms = 450) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStorage(rememberMe) {
  return rememberMe ? window.localStorage : window.sessionStorage;
}

export function getStoredSession() {
  try {
    const raw =
      window.localStorage.getItem(SESSION_KEY) ||
      window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.user || !parsed.accessToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session, rememberMe = false) {
  clearSession();
  const storage = getStorage(rememberMe);
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Update stored user profile metadata (e.g. after editing profile)
 */
export function updateStoredUser(updatedFields) {
  const inLocal = window.localStorage.getItem(SESSION_KEY);
  const inSession = window.sessionStorage.getItem(SESSION_KEY);
  const storage = inLocal ? window.localStorage : inSession ? window.sessionStorage : null;
  if (!storage) return null;

  try {
    const current = JSON.parse(storage.getItem(SESSION_KEY));
    const updatedSession = {
      ...current,
      user: {
        ...current.user,
        ...updatedFields
      }
    };
    storage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    return updatedSession.user;
  } catch {
    return null;
  }
}

/**
 * Login user (Cognito-ready adapter + Demo Preview Mode)
 */
export async function login(email, password, rememberMe = false) {
  await delay(500);

  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) {
    throw new Error('Please enter both email address and password.');
  }

  if (isCognitoConfigured) {
    // Placeholder for Cognito InitiateAuth / Amplify signIn integration
    throw new Error('Cognito SDK integration pending backend pool deployment.');
  }

  // Demo Preview Authentication
  const expectedPassword = runtimeDemoCredentials.get(normalizedEmail);
  if (!expectedPassword || expectedPassword !== password) {
    throw new Error('Invalid email or password. Use the Demo Login credentials provided below.');
  }

  const profile =
    DEMO_USERS.find((u) => u.email === normalizedEmail) ||
    runtimeRegisteredProfiles.get(normalizedEmail);

  if (!profile) {
    throw new Error('Account profile not found.');
  }

  if (!profile.verified) {
    const err = new Error('Please verify your email address before signing in.');
    err.code = 'UserNotConfirmedException';
    err.email = normalizedEmail;
    throw err;
  }

  const session = {
    user: { ...profile },
    accessToken: `demo-jwt-${profile.role}-${Date.now()}`,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    authMode: 'demo'
  };

  saveSession(session, rememberMe);
  return session;
}

/**
 * Register a new student account
 */
export async function register({ fullName, email, password }) {
  await delay(550);

  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!fullName?.trim() || !normalizedEmail || !password) {
    throw new Error('All registration fields are required.');
  }

  if (
    DEMO_USERS.some((u) => u.email === normalizedEmail) ||
    runtimeRegisteredProfiles.has(normalizedEmail)
  ) {
    throw new Error('An account with this email address already exists.');
  }

  if (isCognitoConfigured) {
    throw new Error('Cognito SignUp integration pending backend pool deployment.');
  }

  const newUser = {
    id: `stu-${Date.now()}`,
    fullName: fullName.trim(),
    email: normalizedEmail,
    role: 'student',
    institution: 'Not specified',
    course: 'Cloud Practitioner Candidate',
    graduationYear: '2026',
    createdAt: new Date().toISOString(),
    verified: false,
    isDemo: true
  };

  runtimeDemoCredentials.set(normalizedEmail, password);
  runtimeRegisteredProfiles.set(normalizedEmail, newUser);
  pendingVerifications.set(normalizedEmail, '123456');

  return {
    userSub: newUser.id,
    email: normalizedEmail,
    codeDeliveryDetails: {
      destination: normalizedEmail,
      deliveryMedium: 'EMAIL'
    },
    demoHintCode: '123456'
  };
}

/**
 * Verify email with 6-digit confirmation code
 */
export async function verifyEmail(email, code) {
  await delay(450);

  const normalizedEmail = (email || '').trim().toLowerCase();
  const profile = runtimeRegisteredProfiles.get(normalizedEmail);

  if (!profile) {
    throw new Error('No pending account found for this email address.');
  }

  const expectedCode = pendingVerifications.get(normalizedEmail) || '123456';
  if (String(code).trim() !== expectedCode) {
    throw new Error('Invalid verification code. (Demo code: 123456)');
  }

  profile.verified = true;
  pendingVerifications.delete(normalizedEmail);
  return { confirmed: true };
}

export async function resendVerificationCode(email) {
  await delay(350);
  const normalizedEmail = (email || '').trim().toLowerCase();
  pendingVerifications.set(normalizedEmail, '123456');
  return { sent: true, demoHintCode: '123456' };
}

/**
 * Initiate forgot password flow
 */
export async function forgotPassword(email) {
  await delay(450);
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error('Please enter your registered email address.');
  }

  pendingPasswordResets.set(normalizedEmail, '654321');
  return {
    sent: true,
    destination: normalizedEmail,
    demoHintCode: '654321'
  };
}

/**
 * Complete password reset with verification code
 */
export async function resetPassword(email, code, newPassword) {
  await delay(500);
  const normalizedEmail = (email || '').trim().toLowerCase();
  const expectedCode = pendingPasswordResets.get(normalizedEmail) || '654321';

  if (String(code).trim() !== expectedCode) {
    throw new Error('Invalid reset verification code. (Demo code: 654321)');
  }

  if (runtimeDemoCredentials.has(normalizedEmail)) {
    runtimeDemoCredentials.set(normalizedEmail, newPassword);
  }
  pendingPasswordResets.delete(normalizedEmail);
  return { success: true };
}

/**
 * Change password for authenticated user
 */
export async function changePassword(email, currentPassword, newPassword) {
  await delay(450);
  const normalizedEmail = (email || '').trim().toLowerCase();
  const existing = runtimeDemoCredentials.get(normalizedEmail);

  if (existing && existing !== currentPassword) {
    throw new Error('Current password is incorrect.');
  }

  runtimeDemoCredentials.set(normalizedEmail, newPassword);
  return { success: true };
}

export async function refreshSession() {
  const session = getStoredSession();
  if (!session) return null;
  return {
    ...session,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000
  };
}

export async function logout() {
  await delay(200);
  clearSession();
  return { signedOut: true };
}

