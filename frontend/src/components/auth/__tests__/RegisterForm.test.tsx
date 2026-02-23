import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from '../RegisterForm';
import * as authHooks from '../../../hooks/useAuth';

vi.mock('../../../hooks/useAuth');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RegisterForm', () => {
  const mockRegister = vi.fn();
  const mockClearError = vi.fn();
  const mockRefreshUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegisterForm = (authState = {}) => {
    vi.mocked(authHooks.useAuth).mockReturnValue({
      register: mockRegister,
      clearError: mockClearError,
      refreshUser: mockRefreshUser,
      clearLogoutReason: vi.fn(),
      error: null,
      isLoading: false,
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      logoutReason: null,
      ...authState,
    });

    return render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>
    );
  };

  it('renders register form correctly', () => {
    renderRegisterForm();

    expect(screen.getByText('Crear una cuenta')).toBeTruthy();
    expect(screen.getByLabelText('Correo electrónico')).toBeTruthy();
    expect(screen.getByText('Familia')).toBeTruthy();
    expect(screen.getByText('Cuidador')).toBeTruthy();
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeTruthy();
  });

  it('does not call register when passwords do not match', async () => {
    renderRegisterForm();

    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmPasswordInput = screen.getByLabelText('Confirmar');
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    fireEvent.click(submitButton);

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('does not call register when password is too short', async () => {
    renderRegisterForm();

    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmPasswordInput = screen.getByLabelText('Confirmar');
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register function with correct data', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    renderRegisterForm();

    const emailInput = screen.getByLabelText('Correo electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmPasswordInput = screen.getByLabelText('Confirmar');
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'FAMILY',
        phone: '',
      });
    });
  });

  it('allows selecting CAREGIVER role', () => {
    renderRegisterForm();

    const caregiverButton = screen.getByText('Cuidador');
    fireEvent.click(caregiverButton);

    expect(caregiverButton).toBeTruthy();
  });

  it('displays error message from auth context', () => {
    const errorMessage = 'Email already registered';
    renderRegisterForm({ error: errorMessage });

    expect(screen.getByText(errorMessage)).toBeTruthy();
  });

  it('disables submit button when loading', () => {
    renderRegisterForm({ isLoading: true });

    const submitButton = screen.getByRole('button', { name: '' }) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it('navigates to home when already authenticated', () => {
    renderRegisterForm({ isAuthenticated: true });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('has link to login page', () => {
    renderRegisterForm();

    const loginLink = screen.getByRole('link', { name: /iniciar sesión/i }) as HTMLAnchorElement;
    expect(loginLink.getAttribute('href')).toBe('/login');
  });
});
