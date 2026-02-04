import { vi } from 'vitest';

export const mockLogin = vi.fn();
export const mockRegister = vi.fn();
export const mockLogout = vi.fn();
export const mockClearError = vi.fn();

export const mockUseAuth = (overrides = {}) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: mockLogin,
  register: mockRegister,
  logout: mockLogout,
  clearError: mockClearError,
  ...overrides,
});

export const mockAuthenticatedUser = {
  id: '1',
  email: 'test@example.com',
  role: 'family',
  profile_completed: false,
};
