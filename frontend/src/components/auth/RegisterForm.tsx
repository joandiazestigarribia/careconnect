import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Heart, Mail, Lock, Phone, AlertCircle, ArrowRight, Users, Stethoscope } from 'lucide-react';

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, clearError, isLoading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'FAMILY' as 'FAMILY' | 'CAREGIVER',
    phone: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
    if (validationError) setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/');
    } catch (err) {
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg shadow-primary/20">
            <Heart className="w-8 h-8 text-surface" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Crear una cuenta
          </h1>
          <p className="text-text-secondary">
            Únete a CareConnect y encuentra el cuidado perfecto
          </p>
        </div>

        <div className="card p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {(error || validationError) && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error || validationError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                ¿Qué tipo de cuenta necesitas?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'FAMILY' }))}
                  className={`card card-interactive flex flex-col items-center gap-2 p-4 border-2 ${
                    formData.role === 'FAMILY'
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <Users className={`w-6 h-6 ${formData.role === 'FAMILY' ? 'text-primary' : 'text-text-muted'}`} />
                  <span className={`text-sm font-medium ${formData.role === 'FAMILY' ? 'text-primary' : 'text-text-secondary'}`}>
                    Familia
                  </span>
                  <span className="text-xs text-text-muted">Busco cuidador</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'CAREGIVER' }))}
                  className={`card card-interactive flex flex-col items-center gap-2 p-4 border-2 ${
                    formData.role === 'CAREGIVER'
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <Stethoscope className={`w-6 h-6 ${formData.role === 'CAREGIVER' ? 'text-primary' : 'text-text-muted'}`} />
                  <span className={`text-sm font-medium ${formData.role === 'CAREGIVER' ? 'text-primary' : 'text-text-secondary'}`}>
                    Cuidador
                  </span>
                  <span className="text-xs text-text-muted">Ofrezco servicios</span>
                </button>
              </div>
            </div>

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
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10 rounded-xl"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
                Teléfono <span className="text-text-muted font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input pl-10 rounded-xl"
                  placeholder="+54 9 11 2345 6789"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-10 rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
                  Confirmar
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input pl-10 rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3 rounded-xl mt-2"
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
              <span className="px-4 bg-surface text-text-secondary">¿Ya tienes cuenta?</span>
            </div>
          </div>

          <Link
            to="/login"
            className="btn btn-secondary w-full rounded-xl"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
