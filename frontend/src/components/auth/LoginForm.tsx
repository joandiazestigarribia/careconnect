import { AlertCircle, ArrowRight, Check, Heart, Lock, Mail, X, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ValidationErrors {
  email?: string;
  password?: string;
}

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, clearError, isLoading, isAuthenticated, logoutReason } = useAuth();
  
  const sessionExpired = (location.state as any)?.sessionExpired || logoutReason === 'session_expired';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showSessionExpired, setShowSessionExpired] = useState(sessionExpired);

  useEffect(() => {
    if (authError) {
      setLoginError(authError);
    }
  }, [authError]);

  useEffect(() => {
    clearError();
    if (sessionExpired) {
      setShowSessionExpired(true);
      window.history.replaceState({}, document.title);
    }
  }, []);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'El correo electrónico es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Ingresa un correo electrónico válido';
        return undefined;
      case 'password':
        if (!value) return 'La contraseña es obligatoria';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setValidationErrors(prev => ({ ...prev, [name]: error }));
    }
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setValidationErrors(prev => ({ ...prev, [name]: error }));
  };

  const dismissError = () => {
    setLoginError(null);
    clearError();
  };
  
  const dismissSessionExpired = () => {
    setShowSessionExpired(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: ValidationErrors = {};
    errors.email = validateField('email', formData.email);
    errors.password = validateField('password', formData.password);
    
    setTouched({ email: true, password: true });
    setValidationErrors(errors);
    
    if (errors.email || errors.password) {
      return;
    }
    
    setLoginError(null);
    clearError();
    
    try {
      await login(formData);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
    }
  };

  const getFieldStatus = (fieldName: keyof typeof formData) => {
    if (!touched[fieldName]) return 'neutral';
    return validationErrors[fieldName] ? 'error' : 'success';
  };

  const shouldShowError = loginError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-bg-main via-bg-main to-primary/5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-primary to-primary-light rounded-3xl mb-4 shadow-xl shadow-primary/30 transition-transform duration-300 hover:scale-105">
            <Heart className="w-8 h-8 text-surface" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            ¡Bienvenido!
          </h1>
          <p className="text-text-secondary">
            Inicia sesión para continuar con CareConnect
          </p>
        </div>

        <div className="bg-surface rounded-3xl shadow-2xl shadow-primary/10 border border-border p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {showSessionExpired && (
              <div className="relative flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm text-amber-700 pr-6">
                  <p className="font-semibold text-amber-800">Sesión expirada</p>
                  <p className="text-amber-600 text-xs py-1.5 rounded">
                    Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={dismissSessionExpired}
                  className="absolute top-2 right-2 p-1.5 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-xl transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {shouldShowError && (
              <div className="relative flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm text-red-700 pr-6">
                  <p className="font-semibold text-red-800">Error al iniciar sesión</p>
                  <p className="text-red-600 text-xs py-1.5 rounded">
                    Verifica tu correo y/o contraseña e intenta nuevamente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={dismissError}
                  className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
                Correo electrónico
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors duration-300" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className={`input pl-10 rounded-xl disabled:opacity-50 border-border transition-all duration-300 hover:border-primary/30 focus:border-primary focus:shadow-lg focus:shadow-primary/10 ${
                    getFieldStatus('email') === 'error' 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : getFieldStatus('email') === 'success'
                      ? 'border-success focus:border-success focus:ring-success/20'
                      : ''
                  }`}
                  placeholder="tu@email.com"
                />
                {getFieldStatus('email') === 'success' && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
                )}
              </div>
              {validationErrors.email && touched.email && (
                <p className="mt-1.5 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-2">
                Contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors duration-300" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className={`input pl-10 rounded-xl disabled:opacity-50 border-border transition-all duration-300 hover:border-primary/30 focus:border-primary focus:shadow-lg focus:shadow-primary/10 ${
                    getFieldStatus('password') === 'error' 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : getFieldStatus('password') === 'success'
                      ? 'border-success focus:border-success focus:ring-success/20'
                      : ''
                  }`}
                  placeholder="••••••••"
                />
                {getFieldStatus('password') === 'success' && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
                )}
              </div>
              {validationErrors.password && touched.password && (
                <p className="mt-1.5 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3 rounded-xl disabled:opacity-70 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface text-text-secondary font-medium">¿No tienes cuenta?</span>
            </div>
          </div>

          <Link
            to="/register"
            className="btn btn-secondary w-full rounded-xl border-2 border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-0.5"
          >
            Crear una cuenta
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-text-secondary mb-3 font-semibold uppercase tracking-wider">Cuentas de prueba</p>
          <div className="inline-flex flex-col gap-2 text-xs bg-linear-to-br from-surface to-bg-main px-5 py-4 rounded-2xl border border-border shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-linear-to-br from-primary to-primary-light"></div>
              <span className="text-text-muted font-medium">familia1@test.com</span>
              <span className="text-text-secondary">/</span>
              <span className="text-primary font-semibold">Password123!</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-linear-to-br from-accent to-primary"></div>
              <span className="text-text-muted font-medium">cuidador1@test.com</span>
              <span className="text-text-secondary">/</span>
              <span className="text-primary font-semibold">Password123!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
