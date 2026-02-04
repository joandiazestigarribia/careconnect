import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import * as authHooks from '../../../hooks/useAuth';

vi.mock('../../../hooks/useAuth');

describe('ProtectedRoute', () => {
  const mockRefreshUser = vi.fn();

  const renderProtectedRoute = (authState: any) => {
    vi.mocked(authHooks.useAuth).mockReturnValue({
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
      refreshUser: mockRefreshUser,
      ...authState,
    });

    return render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
  };

  it('shows loading spinner when loading', () => {
    renderProtectedRoute({
      isLoading: true,
      isAuthenticated: false,
      user: null,
      error: null,
    });

    expect(screen.getByText('Cargando...')).toBeTruthy();
  });

  it('redirects to login when not authenticated', () => {
    renderProtectedRoute({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      error: null,
    });

    expect(screen.getByText('Login Page')).toBeTruthy();
  });

  it('renders children when authenticated', () => {
    renderProtectedRoute({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '1', email: 'test@test.com' },
      error: null,
    });

    expect(screen.getByText('Protected Content')).toBeTruthy();
  });
});
