import axios, { type AxiosInstance, type AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

let isLoggingIn = false;
let isRedirecting = false;

export const setLoggingIn = (value: boolean) => {
  isLoggingIn = value;
};

declare global {
  interface WindowEventMap {
    'auth:logout': CustomEvent<{ reason: string }>;
  }
}

export const triggerLogout = (reason: string = 'session_expired') => {
  if (isRedirecting) return;
  isRedirecting = true;

  localStorage.removeItem('user');
  sessionStorage.setItem('logoutReason', reason);

  window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason } }));

  setTimeout(() => {
    isRedirecting = false;
  }, 1000);
};

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register') ||
      error.config?.url?.includes('/auth/me');

    if (error.response?.status === 401 && !isLoggingIn && !isAuthEndpoint && !isRedirecting) {
      triggerLogout('session_expired');
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: 'FAMILY' | 'CAREGIVER';
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'FAMILY' | 'CAREGIVER' | 'ADMIN';
  profile_completed: boolean;
}

export interface AuthResponse {
  user: User;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },
};

export default api;
