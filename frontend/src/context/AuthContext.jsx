import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth';
import { setAccessToken, setSessionExpiredHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const applySession = useCallback(({ user: u, accessToken }) => {
    setAccessToken(accessToken);
    setUser(u);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  // Restaure la session au chargement via le cookie de refresh
  useEffect(() => {
    setSessionExpiredHandler(clearSession);
    authApi
      .refresh()
      .then(applySession)
      .catch(clearSession)
      .finally(() => setInitializing(false));
  }, [applySession, clearSession]);

  const login = useCallback(async (credentials) => applySession(await authApi.login(credentials)), [applySession]);

  const register = useCallback(async (payload) => applySession(await authApi.register(payload)), [applySession]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, initializing, login, register, logout }),
    [user, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
}
