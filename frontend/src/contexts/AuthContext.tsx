import React, { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { authApi, setLoggingIn, type User, type LoginCredentials, type RegisterData } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: (reason?: string) => void;
  refreshUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  logoutReason?: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoutReason, setLogoutReason] = useState<string | null>(null);
  const logoutReasonRef = useRef<string | null>(null);

  const authInitializedRef = useRef(false);
  
  const handleGlobalLogout = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<{ reason: string }>;
    const reason = customEvent.detail?.reason || 'session_expired';
    
    setUser(null);
    setLogoutReason(reason);
    logoutReasonRef.current = reason;
    
  }, []);

  useEffect(() => {
    if (authInitializedRef.current) return;
    authInitializedRef.current = true;
    
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch (err) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      }
      
      setIsLoading(false);
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
      
      localStorage.setItem('access_token', response.access_token);
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
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (reason?: string) => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    if (reason) {
      setLogoutReason(reason);
    }
  };

  const clearError = () => setError(null);

  const refreshUser = async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
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

export default AuthContext;
