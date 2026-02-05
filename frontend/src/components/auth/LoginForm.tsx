import { AlertCircle, ArrowRight, Check, Heart, Lock, Mail, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ValidationErrors {
  email?: string;
  password?: string;
}

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, error: authError, clearError, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated]);
  
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

  useEffect(() => {
    if (authError) {
      setLoginError(authError);
    }
  }, [authError]);

  useEffect(() => {
    clearError();
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
      navigate('/', { replace: true });
    } catch (err: any) {
    }
  };

  const getFieldStatus = (fieldName: keyof typeof formData) => {
    if (!touched[fieldName]) return 'neutral';
    return validationErrors[fieldName] ? 'error' : 'success';
  };

  const shouldShowError = loginError || authError;
  const errorMessage = loginError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg shadow-primary/20">
            <Heart className="w-8 h-8 text-surface" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            ¡Bienvenido!
          </h1>
          <p className="text-text-secondary">
            Inicia sesión para continuar con CareConnect
          </p>
        </div>

        <div className="card p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {shouldShowError && (
              <div className="relative flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
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
                  className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className={`input pl-10 rounded-xl disabled:opacity-50 ${
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
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className={`input pl-10 rounded-xl disabled:opacity-50 ${
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
              className="btn btn-primary w-full py-3 rounded-xl disabled:opacity-70"
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
              <span className="px-4 bg-surface text-text-secondary">¿No tienes cuenta?</span>
            </div>
          </div>

          <Link
            to="/register"
            className="btn btn-secondary w-full rounded-xl"
          >
            Crear una cuenta
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-text-secondary mb-2">Cuentas de prueba:</p>
          <div className="inline-flex flex-col gap-1 text-xs text-text-muted bg-surface px-4 py-3 rounded-xl border border-border">
            <span>familia1@test.com / Password123!</span>
            <span>cuidador1@test.com / Password123!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
