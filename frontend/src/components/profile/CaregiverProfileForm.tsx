import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { caregiverProfileApi } from '../../services/profileApi';
import Toast from '../common/Toast';
import { User, FileText, DollarSign, Users, MapPin, Globe, Sparkles, Plus, X, AlertCircle, Loader2, Check } from 'lucide-react';

const AVAILABLE_LANGUAGES = [
  { value: 'Español', label: 'Español' },
  { value: 'Inglés', label: 'Inglés' },
];

const CaregiverProfileForm = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    hourly_rate: 0,
    min_children_age: 0,
    max_children_age: 18,
    availability_radius_km: 5,
    languages_spoken: [] as string[],
    skills: [] as string[],
  });
  const [newSkill, setNewSkill] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['hourly_rate', 'min_children_age', 'max_children_age', 'availability_radius_km'].includes(name)
        ? parseInt(value) || 0
        : value,
    }));
  };

  const toggleLanguage = (langValue: string) => {
    setFormData(prev => {
      if (prev.languages_spoken.includes(langValue)) {
        if (prev.languages_spoken.length === 1) return prev;
        return { 
          ...prev, 
          languages_spoken: prev.languages_spoken.filter(l => l !== langValue) 
        };
      }
      return { 
        ...prev, 
        languages_spoken: [...prev.languages_spoken, langValue] 
      };
    });
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.languages_spoken.length === 0) {
      setError('Debes seleccionar al menos un idioma');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await caregiverProfileApi.create(formData);
      await refreshUser();
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al crear perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      {showSuccess && (
        <Toast message="Perfil guardado correctamente" type="success" />
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Información Personal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Nombre</label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-bg-main border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Apellido</label>
              <input
                type="text"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-bg-main border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Tu apellido"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Biografía
          </label>
          <textarea
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Cuéntanos sobre ti, tu experiencia y por qué te apasiona cuidar niños..."
            className="w-full px-4 py-3 bg-bg-main border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Tarifa por Hora ($)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-medium">$</span>
            <input
              type="number"
              name="hourly_rate"
              min="0"
              required
              value={formData.hourly_rate}
              onChange={handleChange}
              className="w-full pl-8 pr-4 py-3 bg-bg-main border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Rango de Edades que Atiendes
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Edad Mínima</label>
              <input
                type="number"
                name="min_children_age"
                min="0"
                max="18"
                value={formData.min_children_age}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-bg-main border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Edad Máxima</label>
              <input
                type="number"
                name="max_children_age"
                min="0"
                max="18"
                value={formData.max_children_age}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-bg-main border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Radio de Disponibilidad (km)
          </label>
          <div className="bg-bg-main rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">Distancia máxima</span>
              <span className="text-lg font-bold text-primary">{formData.availability_radius_km} km</span>
            </div>
            <input
              type="range"
              name="availability_radius_km"
              min="1"
              max="100"
              value={formData.availability_radius_km}
              onChange={handleChange}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-text-muted mt-2">
              <span>1 km</span>
              <span>50 km</span>
              <span>100 km</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Idiomas que Hablas <span className="text-text-muted font-normal">(Selecciona al menos uno)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                type="button"
                onClick={() => toggleLanguage(lang.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  formData.languages_spoken.includes(lang.value)
                    ? 'bg-primary text-surface'
                    : 'bg-bg-main text-text-secondary border border-border hover:border-primary'
                }`}
              >
                {formData.languages_spoken.includes(lang.value) && (
                  <span className="mr-1.5">✓</span>
                )}
                {lang.label}
              </button>
            ))}
          </div>
          {formData.languages_spoken.length === 0 && (
            <p className="mt-2 text-sm text-red-600">
              Debes seleccionar al menos un idioma
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Habilidades
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Ej: Primeros auxilios, Cocina, Tareas"
              className="flex-1 px-4 py-3 bg-bg-main border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-3 bg-bg-main border border-border text-primary rounded-xl hover:bg-primary hover:text-surface hover:border-primary transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/15 text-success-dark rounded-full text-sm font-medium"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="hover:bg-success/30 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || formData.languages_spoken.length === 0}
          className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-primary text-surface font-medium rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Guardar Perfil
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CaregiverProfileForm;
