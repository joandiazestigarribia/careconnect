import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { caregiverProfileApi, type CaregiverProfile } from '../services/profileApi';
import Toast from '../components/common/Toast';
import { User, FileText, DollarSign, Users, MapPin, Globe, Sparkles, Plus, X, AlertCircle, Loader2, Check, ArrowLeft } from 'lucide-react';

const AVAILABLE_LANGUAGES = [
  { value: 'Español', label: 'Español' },
  { value: 'Inglés', label: 'Inglés' },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CaregiverProfile | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    address: '',
    hourly_rate: 0,
    min_children_age: 0,
    max_children_age: 18,
    availability_radius_km: 5,
    languages_spoken: [] as string[],
    skills: [] as string[],
  });
  const [newSkill, setNewSkill] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user?.role === 'CAREGIVER') {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await caregiverProfileApi.getMe();

      setProfile(data);
      setFormData({
        first_name: data.first_name,
        last_name: data.last_name,
        bio: data.bio || '',
        address: data.address || '',
        hourly_rate: Math.round(Number(data.hourly_rate)) || 0,
        min_children_age: Number(data.min_children_age) || 0,
        max_children_age: Number(data.max_children_age) || 18,
        availability_radius_km: Number(data.availability_radius_km) || 5,
        languages_spoken: data.languages_spoken || [],
        skills: data.skills || [],
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hourly_rate'
        ? parseInt(value) || 0
        : ['min_children_age', 'max_children_age', 'availability_radius_km'].includes(name)
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
    
    if (formData.hourly_rate < 1) {
      setError('La tarifa por hora debe ser al menos 1');
      return;
    }
    
    if (formData.min_children_age > formData.max_children_age) {
      setError('La edad mínima no puede ser mayor que la edad máxima');
      return;
    }
    
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        bio: formData.bio?.trim() || '',
        address: formData.address.trim(),
        hourly_rate: Math.max(0.01, Number(formData.hourly_rate)),
        min_children_age: Math.max(0, Number(formData.min_children_age)),
        max_children_age: Math.min(18, Math.max(0, Number(formData.max_children_age))),
        availability_radius_km: Math.min(100, Math.max(1, Number(formData.availability_radius_km))),
        languages_spoken: formData.languages_spoken,
        skills: formData.skills,
      };

      
      await caregiverProfileApi.update(payload);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <div className="w-20 h-20 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Cargando perfil...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {showSuccess && (
        <Toast message="Perfil actualizado correctamente" type="success" />
      )}

      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al panel
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <User className="w-6 h-6 text-surface" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Mi Perfil
            </h1>
          </div>
        </div>
        <p className="text-text-secondary text-lg">
          Actualiza tu información y mantén tu perfil al día para que las familias te encuentren.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {profile && (
        <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Trust Score</p>
              <p className="text-2xl font-bold text-primary">{profile.trust_score || 0}/5.0</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary">Estado</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success/15 text-success-dark rounded-full text-sm font-medium">
                <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
                Activo
              </span>
            </div>
          </div>
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
              min="1"
              step="1"
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
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Ubicación y Disponibilidad
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Dirección
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-bg-main border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Ej: Av. Corrientes 1234, CABA, Buenos Aires"
            />
            <p className="mt-1.5 text-xs text-text-secondary">
              Esta dirección se usará para mostrar tu perfil en búsquedas por geolocalización
            </p>
          </div>

          <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
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

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 py-4 px-4 bg-bg-main text-text-primary font-medium rounded-xl hover:bg-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || formData.languages_spoken.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-4 bg-primary text-surface font-medium rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
