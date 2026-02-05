import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';
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

describe('LoginForm', () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();
  const mockRefreshUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginForm = (authState = {}) => {
    vi.mocked(authHooks.useAuth).mockReturnValue({
      login: mockLogin,
      clearError: mockClearError,
      refreshUser: mockRefreshUser,
      error: null,
      isLoading: false,
      isAuthenticated: false,
      user: null,
      register: vi.fn(),
      logout: vi.fn(),
      ...authState,
    });

    return render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );
  };

  it('renders login form correctly', () => {
    renderLoginForm();

    expect(screen.getByText('¡Bienvenido!')).toBeTruthy();
    expect(screen.getByLabelText('Correo electrónico')).toBeTruthy();
    expect(screen.getByLabelText('Contraseña')).toBeTruthy();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeTruthy();
  });

  it('updates form fields on user input', () => {
    renderLoginForm();

    const emailInput = screen.getByLabelText('Correo electrónico') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Contraseña') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('Password123!');
  });

  it('calls login function on form submit', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderLoginForm();

    const emailInput = screen.getByLabelText('Correo electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      });
    });
  });

  it('displays error message when login fails', () => {
    const errorMessage = 'Invalid credentials';
    renderLoginForm({ error: errorMessage });

    expect(screen.getByText(errorMessage)).toBeTruthy();
  });

  it('clears error when user starts typing', () => {
    renderLoginForm({ error: 'Some error' });

    const emailInput = screen.getByLabelText('Correo electrónico');
    fireEvent.change(emailInput, { target: { value: 'a' } });

    expect(mockClearError).toHaveBeenCalled();
  });

  it('disables submit button when loading', () => {
    renderLoginForm({ isLoading: true });

    const submitButton = screen.getByRole('button', { name: '' }) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it('navigates to home when already authenticated', () => {
    renderLoginForm({ isAuthenticated: true });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('has link to register page', () => {
    renderLoginForm();

    const registerLink = screen.getByRole('link', { name: /crear una cuenta/i }) as HTMLAnchorElement;
    expect(registerLink.getAttribute('href')).toBe('/register');
  });
});
