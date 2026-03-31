import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { authTokenStorage } from '../../../services/apiClient';
import type { AuthResponse, AuthUser } from '../../../types/app';
import { authApi } from '../services/auth.api';

interface AuthCredentials {
  email: string;
  password: string;
}

interface SignupPayload extends AuthCredentials {
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (payload: AuthCredentials) => Promise<AuthResponse>;
  signup: (payload: SignupPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  const refreshSession = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.user);
    } catch {
      authTokenStorage.clear();
      setUser(null);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    void refreshSession();
  }, []);

  const login = async (payload: AuthCredentials) => {
    const response = await authApi.login(payload);
    authTokenStorage.set(response.token);
    setUser(response.user);
    return response;
  };

  const signup = async (payload: SignupPayload) => {
    const response = await authApi.signup(payload);
    authTokenStorage.set(response.token);
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      authTokenStorage.clear();
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({ user, isReady, isAuthenticated: Boolean(user), login, logout, refreshSession, signup }),
    [isReady, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
