import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Heart, Mail, Lock, Phone, AlertCircle, ArrowRight, Users, Stethoscope, Check, X, Eye, EyeOff } from 'lucide-react';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'Al menos una letra mayúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Al menos una letra minúscula', test: (p) => /[a-z]/.test(p) },
  { label: 'Al menos un número', test: (p) => /\d/.test(p) },
  { label: 'Al menos un carácter especial (@$!%*?&)', test: (p) => /[@$!%*?&]/.test(p) },
  { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
];

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, error: authError, clearError, isLoading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'FAMILY' as 'FAMILY' | 'CAREGIVER',
    phone: '',
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'El correo electrónico es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Ingresa un correo electrónico válido';
        return undefined;
      case 'password':
        if (!value) return 'La contraseña es obligatoria';
        return undefined;
      case 'confirmPassword':
        if (!value) return 'Debes confirmar la contraseña';
        if (value !== formData.password) return 'Las contraseñas no coinciden';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setValidationErrors(prev => ({ ...prev, [name]: error }));
      
      if (name === 'password' && touched.confirmPassword) {
        const confirmError = formData.confirmPassword !== value 
          ? 'Las contraseñas no coinciden' 
          : undefined;
        setValidationErrors(prev => ({ ...prev, confirmPassword: confirmError }));
      }
    }
    
    if (authError) clearError();
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setValidationErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: ValidationErrors = {};
    errors.email = validateField('email', formData.email);
    errors.password = validateField('password', formData.password);
    errors.confirmPassword = validateField('confirmPassword', formData.confirmPassword);
    
    setTouched({ email: true, password: true, confirmPassword: true });
    setValidationErrors(errors);
    
    if (errors.email || errors.password || errors.confirmPassword) {
      return;
    }
    
    const allRequirementsMet = passwordRequirements.every(req => req.test(formData.password));
    if (!allRequirementsMet) {
      setValidationErrors(prev => ({ 
        ...prev, 
        password: 'La contraseña no cumple con todos los requisitos' 
      }));
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (err) {
    }
  };

  const getFieldStatus = (fieldName: keyof typeof formData) => {
    if (!touched[fieldName as keyof typeof touched]) return 'neutral';
    return validationErrors[fieldName as keyof ValidationErrors] ? 'error' : 'success';
  };

  const getPasswordStrength = () => {
    const met = passwordRequirements.filter(req => req.test(formData.password)).length;
    return { met, total: passwordRequirements.length };
  };

  const passwordStrength = getPasswordStrength();
  const strengthPercentage = (passwordStrength.met / passwordStrength.total) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-main via-bg-main to-primary/5 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-3xl mb-4 shadow-xl shadow-primary/30 transition-transform duration-300 hover:scale-105">
            <Heart className="w-8 h-8 text-surface" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Crear una cuenta
          </h1>
          <p className="text-text-secondary">
            Únete a CareConnect y encuentra el cuidado perfecto
          </p>
        </div>

        <div className="bg-surface rounded-3xl shadow-2xl shadow-primary/10 border border-border p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {authError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-semibold">Error en el registro</p>
                  <p>{authError}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-3">
                ¿Qué tipo de cuenta necesitas?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'FAMILY' }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 ${
                    formData.role === 'FAMILY'
                      ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20'
                      : 'border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 bg-bg-main'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    formData.role === 'FAMILY' 
                      ? 'bg-gradient-to-br from-primary to-primary-light' 
                      : 'bg-bg-main border border-border'
                  }`}>
                    <Users className={`w-5 h-5 ${formData.role === 'FAMILY' ? 'text-surface' : 'text-text-muted'}`} />
                  </div>
                  <span className={`text-sm font-bold ${formData.role === 'FAMILY' ? 'text-primary' : 'text-text-secondary'}`}>
                    Familia
                  </span>
                  <span className="text-xs text-text-muted">Busco cuidador</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'CAREGIVER' }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 ${
                    formData.role === 'CAREGIVER'
                      ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20'
                      : 'border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 bg-bg-main'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    formData.role === 'CAREGIVER' 
                      ? 'bg-gradient-to-br from-primary to-primary-light' 
                      : 'bg-bg-main border border-border'
                  }`}>
                    <Stethoscope className={`w-5 h-5 ${formData.role === 'CAREGIVER' ? 'text-surface' : 'text-text-muted'}`} />
                  </div>
                  <span className={`text-sm font-bold ${formData.role === 'CAREGIVER' ? 'text-primary' : 'text-text-secondary'}`}>
                    Cuidador
                  </span>
                  <span className="text-xs text-text-muted">Ofrezco servicios</span>
                </button>
              </div>
            </div>

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
                  className={`input pl-10 rounded-xl border-border transition-all duration-300 hover:border-primary/30 focus:border-primary focus:shadow-lg focus:shadow-primary/10 ${
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
                {getFieldStatus('email') === 'error' && (
                  <X className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
              </div>
              {validationErrors.email && touched.email && (
                <p className="mt-1.5 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-text-primary mb-2">
                Teléfono <span className="text-text-muted font-normal">(opcional)</span>
              </label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors duration-300" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input pl-10 rounded-xl border-border transition-all duration-300 hover:border-primary/30 focus:border-primary focus:shadow-lg focus:shadow-primary/10"
                  placeholder="+54 9 11 2345 6789"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-2">
                  Contraseña
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors duration-300" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`input pl-10 pr-10 rounded-xl border-border transition-all duration-300 hover:border-primary/30 focus:border-primary focus:shadow-lg focus:shadow-primary/10 ${
                      getFieldStatus('password') === 'error' 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : getFieldStatus('password') === 'success'
                        ? 'border-success focus:border-success focus:ring-success/20'
                        : ''
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {validationErrors.password && touched.password && (
                  <p className="mt-1.5 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text-primary mb-2">
                  Confirmar
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors duration-300" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`input pl-10 pr-10 rounded-xl border-border transition-all duration-300 hover:border-primary/30 focus:border-primary focus:shadow-lg focus:shadow-primary/10 ${
                      getFieldStatus('confirmPassword') === 'error' 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : getFieldStatus('confirmPassword') === 'success'
                        ? 'border-success focus:border-success focus:ring-success/20'
                        : ''
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-secondary">Fuerza de la contraseña</span>
                  <span className={`text-sm font-bold ${
                    strengthPercentage === 100 ? 'text-success' : 
                    strengthPercentage >= 60 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {strengthPercentage === 100 ? 'Excelente' : 
                     strengthPercentage >= 60 ? 'Buena' : 'Débil'}
                  </span>
                </div>
                <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      strengthPercentage === 100 ? 'bg-gradient-to-r from-success to-success/70' : 
                      strengthPercentage >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                    }`}
                    style={{ width: `${strengthPercentage}%` }}
                  />
                </div>
                
                <div className="space-y-1.5 mt-3">
                  {passwordRequirements.map((req, index) => {
                    const isMet = req.test(formData.password);
                    return (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {isMet ? (
                          <div className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-success shrink-0" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-text-muted/30 shrink-0" />
                        )}
                        <span className={isMet ? 'text-text-secondary' : 'text-text-muted'}>
                          {req.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3 rounded-xl mt-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Crear Cuenta
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
              <span className="px-4 bg-surface text-text-secondary font-medium">¿Ya tienes cuenta?</span>
            </div>
          </div>

          <Link
            to="/login"
            className="btn btn-secondary w-full rounded-xl border-2 border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-0.5"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
