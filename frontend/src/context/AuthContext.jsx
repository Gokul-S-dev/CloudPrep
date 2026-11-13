import { createContext, useContext, useState, useCallback } from 'react';
import {
  getStoredSession,
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  verifyEmail as authVerifyEmail,
  resendVerificationCode as authResendCode,
  forgotPassword as authForgotPassword,
  resetPassword as authResetPassword,
  updateStoredUser
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getStoredSession());

  const user = session?.user || null;
  const isAuthenticated = Boolean(session?.user && session?.accessToken);
  const role = user?.role || null;

  const login = useCallback(async (email, password, rememberMe = false) => {
    const newSession = await authLogin(email, password, rememberMe);
    setSession(newSession);
    return newSession;
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setSession(null);
  }, []);

  const register = useCallback(async (payload) => {
    return authRegister(payload);
  }, []);

  const verifyEmail = useCallback(async (email, code) => {
    return authVerifyEmail(email, code);
  }, []);

  const resendVerificationCode = useCallback(async (email) => {
    return authResendCode(email);
  }, []);

  const forgotPassword = useCallback(async (email) => {
    return authForgotPassword(email);
  }, []);

  const resetPassword = useCallback(async (email, code, newPassword) => {
    return authResetPassword(email, code, newPassword);
  }, []);

  const updateUserProfile = useCallback((updates) => {
    const updatedUser = updateStoredUser(updates);
    if (updatedUser) {
      setSession((prev) => (prev ? { ...prev, user: updatedUser } : prev));
    }
    return updatedUser;
  }, []);

  const value = {
    user,
    role,
    isAuthenticated,
    isDemoMode: session?.authMode === 'demo',
    login,
    logout,
    register,
    verifyEmail,
    resendVerificationCode,
    forgotPassword,
    resetPassword,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
