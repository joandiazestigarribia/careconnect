import React, { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { authApi, setLoggingIn, type User, type LoginCredentials, type RegisterData } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: (reason?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  logoutReason?: string | null;
  clearLogoutReason: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoutReason, setLogoutReason] = useState<string | null>(() => {
    return sessionStorage.getItem('logoutReason');
  });

  const authInitializedRef = useRef(false);
  
  const handleGlobalLogout = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<{ reason: string }>;
    const reason = customEvent.detail?.reason || 'session_expired';
    
    setUser(null);
    sessionStorage.setItem('logoutReason', reason);
    setLogoutReason(reason);
  }, []);

  useEffect(() => {
    if (authInitializedRef.current) return;
    authInitializedRef.current = true;
    
    const initAuth = async () => {
      try {
        const userData = await authApi.getMe();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
    
    window.addEventListener('auth:logout', handleGlobalLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleGlobalLogout);
    };
  }, [handleGlobalLogout]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      setIsLoading(true);
      setLoggingIn(true);
      
      const response = await authApi.login(credentials);
      
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Credenciales incorrectas');
      throw err;
    } finally {
      setIsLoading(false);
      setLoggingIn(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authApi.register(data);
      
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (reason?: string) => {
    try {
      await authApi.logout(); 
    } catch (err) {
    }
    
    localStorage.removeItem('user');
    setUser(null);
    if (reason) {
      sessionStorage.setItem('logoutReason', reason);
      setLogoutReason(reason);
    }
  };

  const clearLogoutReason = () => {
    sessionStorage.removeItem('logoutReason');
    setLogoutReason(null);
  };

  const clearError = () => setError(null);

  const refreshUser = async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        error,
        clearError,
        logoutReason,
        clearLogoutReason,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
