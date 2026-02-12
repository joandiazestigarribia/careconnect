import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { caregiverProfileApi, type CaregiverProfile } from '../services/profileApi';
import Toast from '../components/common/Toast';
import { User, FileText, DollarSign, Users, MapPin, Globe, Sparkles, Plus, X, AlertCircle, Loader2, Check, ArrowLeft, Star } from 'lucide-react';

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
        <div className="text-center py-16 bg-gradient-to-br from-surface to-bg-main rounded-3xl border border-border shadow-lg">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">
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
        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6 group"
      >
        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:shadow-md transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Volver al panel
      </button>

      {/* Header con icono en gradiente */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
            <User className="w-7 h-7 text-white" />
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
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl mb-6 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Trust Score Badge mejorado con gradiente */}
      {profile && (
        <div className="mb-6 p-5 bg-gradient-to-br from-success/10 to-success/5 rounded-2xl border border-success/20 shadow-lg shadow-success/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-success to-success-light rounded-xl flex items-center justify-center shadow-lg shadow-success/30">
                <Star className="w-7 h-7 text-white fill-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-medium">Trust Score</p>
                <p className="text-3xl font-black text-success-dark">{profile.trust_score || 0}/5.0</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary font-medium mb-1">Estado</p>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-success to-success-light text-white rounded-full text-sm font-bold shadow-lg shadow-success/30">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Activo
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-surface to-bg-main rounded-3xl shadow-xl shadow-primary/5 border border-border p-6 sm:p-8 space-y-8">
        {/* Sección de Información Personal con bordes más pronunciados */}
        <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
          <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <User className="w-5 h-5 text-white" />
            </div>
            Información Personal
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Nombre</label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Apellido</label>
              <input
                type="text"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                placeholder="Tu apellido"
              />
            </div>
          </div>
        </div>

        {/* Biografía */}
        <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
          <label className="block text-sm font-bold text-text-primary mb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-light rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Biografía
          </label>
          <textarea
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Cuéntanos sobre ti, tu experiencia y por qué te apasiona cuidar niños..."
            className="w-full px-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-inner"
          />
        </div>

        {/* Tarifa */}
        <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
          <label className="block text-sm font-bold text-text-primary mb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-warning to-warning-light rounded-xl flex items-center justify-center shadow-lg shadow-warning/20">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            Tarifa por Hora ($)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold text-lg">$</span>
            <input
              type="number"
              name="hourly_rate"
              min="1"
              step="1"
              required
              value={formData.hourly_rate}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner text-lg font-bold"
              placeholder="0"
            />
          </div>
        </div>

        {/* Rango de Edades */}
        <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
          <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-success to-success-light rounded-xl flex items-center justify-center shadow-lg shadow-success/20">
              <Users className="w-5 h-5 text-white" />
            </div>
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
                className="w-full px-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
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
                className="w-full px-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
          <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            Ubicación y Disponibilidad
          </h2>
          
          <div className="mb-5">
            <label className="block text-sm font-bold text-text-primary mb-2">
              Dirección
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
              placeholder="Ej: Av. Corrientes 1234, CABA, Buenos Aires"
            />
            <p className="mt-2 text-xs text-text-secondary">
              Esta dirección se usará para mostrar tu perfil en búsquedas por geolocalización
            </p>
          </div>

          <label className="block text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            Radio de Disponibilidad (km)
          </label>
          <div className="bg-bg-main rounded-2xl p-5 border border-border shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary font-medium">Distancia máxima</span>
              <span className="text-xl font-black text-primary">{formData.availability_radius_km} km</span>
            </div>
            <input
              type="range"
              name="availability_radius_km"
              min="1"
              max="100"
              value={formData.availability_radius_km}
              onChange={handleChange}
              className="w-full h-3 bg-border rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-text-muted mt-3 font-medium">
              <span>1 km</span>
              <span>50 km</span>
              <span>100 km</span>
            </div>
          </div>
        </div>

        {/* Idiomas */}
        <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
          <label className="block text-sm font-bold text-text-primary mb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <Globe className="w-5 h-5 text-white" />
            </div>
            Idiomas que Hablas <span className="text-text-muted font-normal">(Selecciona al menos uno)</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {AVAILABLE_LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                type="button"
                onClick={() => toggleLanguage(lang.value)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm ${
                  formData.languages_spoken.includes(lang.value)
                    ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/30'
                    : 'bg-bg-main text-text-secondary border border-border hover:border-primary/30 hover:shadow-md'
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
            <p className="mt-3 text-sm text-red-600 font-medium">
              Debes seleccionar al menos un idioma
            </p>
          )}
        </div>

        {/* Habilidades */}
        <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
          <label className="block text-sm font-bold text-text-primary mb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-warning to-accent rounded-xl flex items-center justify-center shadow-lg shadow-warning/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Habilidades
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Ej: Primeros auxilios, Cocina, Tareas"
              className="flex-1 px-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-5 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-bold shadow-md"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-success/15 to-success/10 text-success-dark rounded-full text-sm font-bold border border-success/20"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="hover:bg-success/30 rounded-full p-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Botones con sombras y hover effects */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 py-4 px-6 bg-bg-main text-text-primary font-bold rounded-2xl border border-border hover:bg-surface hover:border-primary/30 hover:shadow-lg transition-all duration-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || formData.languages_spoken.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
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
