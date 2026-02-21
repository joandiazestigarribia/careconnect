import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  caregiverProfileApi, 
  familyProfileApi,
  type CaregiverProfile
} from '../services/profileApi';
import Toast from '../components/common/Toast';
import { 
  User, FileText, DollarSign, Users, MapPin, Globe, Sparkles, Plus, X, 
  AlertCircle, Loader2, Check, ArrowLeft, Star, Heart, Baby 
} from 'lucide-react';

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
  
  const [caregiverProfile, setCaregiverProfile] = useState<CaregiverProfile | null>(null);
  const [caregiverFormData, setCaregiverFormData] = useState({
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
  
  const [familyFormData, setFamilyFormData] = useState({
    family_name: '',
    address: '',
    children_count: 1,
    children_ages: [] as number[],
    special_needs: [] as string[],
    languages_preferred: [] as string[],
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [newSpecialNeed, setNewSpecialNeed] = useState('');
  const [newChildAge, setNewChildAge] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const isCaregiver = user?.role === 'CAREGIVER';
  const isFamily = user?.role === 'FAMILY';

  useEffect(() => {
    if (isCaregiver) {
      loadCaregiverProfile();
    } else if (isFamily) {
      loadFamilyProfile();
    }
  }, [user]);

  const loadCaregiverProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await caregiverProfileApi.getMe();
      setCaregiverProfile(data);
      setCaregiverFormData({
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

  const loadFamilyProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await familyProfileApi.getMe();
      setFamilyFormData({
        family_name: data.family_name || '',
        address: data.address || '',
        children_count: Number(data.children_count) || 1,
        children_ages: data.children_ages || [],
        special_needs: data.special_needs || [],
        languages_preferred: data.languages_preferred || [],
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaregiverChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCaregiverFormData(prev => ({
      ...prev,
      [name]: name === 'hourly_rate'
        ? parseInt(value) || 0
        : ['min_children_age', 'max_children_age', 'availability_radius_km'].includes(name)
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleFamilyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFamilyFormData(prev => ({
      ...prev,
      [name]: name === 'children_count'
        ? parseInt(value) || 1
        : value,
    }));
  };

  const toggleLanguage = (langValue: string, isCaregiverType: boolean) => {
    if (isCaregiverType) {
      setCaregiverFormData(prev => {
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
    } else {
      setFamilyFormData(prev => {
        if (prev.languages_preferred.includes(langValue)) {
          if (prev.languages_preferred.length === 1) return prev;
          return { 
            ...prev, 
            languages_preferred: prev.languages_preferred.filter(l => l !== langValue) 
          };
        }
        return { 
          ...prev, 
          languages_preferred: [...prev.languages_preferred, langValue] 
        };
      });
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setCaregiverFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setCaregiverFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  const addSpecialNeed = () => {
    if (newSpecialNeed.trim()) {
      setFamilyFormData(prev => ({ ...prev, special_needs: [...prev.special_needs, newSpecialNeed.trim()] }));
      setNewSpecialNeed('');
    }
  };

  const removeSpecialNeed = (index: number) => {
    setFamilyFormData(prev => ({ ...prev, special_needs: prev.special_needs.filter((_, i) => i !== index) }));
  };

  const addChildAge = () => {
    const age = parseInt(newChildAge);
    if (!isNaN(age) && age >= 0 && age <= 18) {
      setFamilyFormData(prev => ({ 
        ...prev, 
        children_ages: [...prev.children_ages, age].sort((a, b) => a - b) 
      }));
      setNewChildAge('');
    }
  };

  const removeChildAge = (index: number) => {
    setFamilyFormData(prev => ({ 
      ...prev, 
      children_ages: prev.children_ages.filter((_, i) => i !== index) 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (isCaregiver) {
        if (caregiverFormData.languages_spoken.length === 0) {
          setError('Debes seleccionar al menos un idioma');
          setIsSaving(false);
          return;
        }
        if (caregiverFormData.hourly_rate < 1) {
          setError('La tarifa por hora debe ser al menos 1');
          setIsSaving(false);
          return;
        }
        if (caregiverFormData.min_children_age > caregiverFormData.max_children_age) {
          setError('La edad mínima no puede ser mayor que la edad máxima');
          setIsSaving(false);
          return;
        }
        
        const payload = {
          first_name: caregiverFormData.first_name.trim(),
          last_name: caregiverFormData.last_name.trim(),
          bio: caregiverFormData.bio?.trim() || '',
          address: caregiverFormData.address.trim(),
          hourly_rate: Math.max(0.01, Number(caregiverFormData.hourly_rate)),
          min_children_age: Math.max(0, Number(caregiverFormData.min_children_age)),
          max_children_age: Math.min(18, Math.max(0, Number(caregiverFormData.max_children_age))),
          availability_radius_km: Math.min(100, Math.max(1, Number(caregiverFormData.availability_radius_km))),
          languages_spoken: caregiverFormData.languages_spoken,
          skills: caregiverFormData.skills,
        };
        
        await caregiverProfileApi.update(payload);
      } else {
        if (familyFormData.languages_preferred.length === 0) {
          setError('Debes seleccionar al menos un idioma preferido');
          setIsSaving(false);
          return;
        }
        if (familyFormData.children_count < 1) {
          setError('Debes tener al menos 1 hijo');
          setIsSaving(false);
          return;
        }
        if (familyFormData.children_ages.length !== familyFormData.children_count) {
          setError(`Debes especificar la edad de ${familyFormData.children_count} hijo(s)`);
          setIsSaving(false);
          return;
        }
        
        const payload = {
          family_name: familyFormData.family_name.trim(),
          address: familyFormData.address.trim(),
          children_count: familyFormData.children_count,
          children_ages: familyFormData.children_ages,
          special_needs: familyFormData.special_needs,
          languages_preferred: familyFormData.languages_preferred,
        };
        
        await familyProfileApi.update(payload);
      }
      
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
        <div className="text-center py-16 bg-linear-to-br from-surface to-bg-main rounded-3xl border border-border shadow-lg">
          <div className="w-24 h-24 bg-linear-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">
            Cargando perfil...
          </h3>
        </div>
      </div>
    );
  }

  const getHeaderIcon = () => {
    if (isCaregiver) return <User className="w-7 h-7 text-white" />;
    return <Heart className="w-7 h-7 text-white" />;
  };

  const getHeaderGradient = () => {
    if (isCaregiver) return 'from-primary to-accent';
    return 'from-accent to-primary';
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {showSuccess && (
        <Toast message="Perfil actualizado correctamente" type="success" />
      )}

      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6 group"
      >
        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:shadow-md transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Volver al panel
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className={`w-14 h-14 bg-linear-to-br ${getHeaderGradient()} rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20`}>
            {getHeaderIcon()}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Mi Perfil
            </h1>
          </div>
        </div>
        <p className="text-text-secondary text-lg">
          {isCaregiver 
            ? 'Actualiza tu información y mantén tu perfil al día para que las familias te encuentren.'
            : 'Actualiza la información de tu familia para encontrar el cuidador ideal.'}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl mb-6 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Trust Score Badge - Solo para cuidadores */}
      {isCaregiver && caregiverProfile && (
        <div className="mb-6 p-5 bg-linear-to-br from-success/10 to-success/5 rounded-2xl border border-success/20 shadow-lg shadow-success/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-linear-to-br from-success to-success-light rounded-xl flex items-center justify-center shadow-lg shadow-success/30">
                <Star className="w-7 h-7 text-white fill-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-medium">Trust Score</p>
                <p className="text-3xl font-black text-success-dark">{caregiverProfile.trust_score || 0}/5.0</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary font-medium mb-1">Estado</p>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-success to-success-light text-white rounded-full text-sm font-bold shadow-lg shadow-success/30">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Activo
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-linear-to-br from-surface to-bg-main rounded-3xl shadow-xl shadow-primary/5 border border-border p-6 sm:p-8 space-y-8">
        
        {isCaregiver ? (
          <>
            {/* Información Personal */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
              <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
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
                    value={caregiverFormData.first_name}
                    onChange={handleCaregiverChange}
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
                    value={caregiverFormData.last_name}
                    onChange={handleCaregiverChange}
                    className="w-full px-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>
            </div>

            {/* Biografía */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
              <label className="block text-sm font-bold text-text-primary mb-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-accent to-accent-light rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                Biografía
              </label>
              <textarea
                name="bio"
                rows={4}
                value={caregiverFormData.bio}
                onChange={handleCaregiverChange}
                placeholder="Cuéntanos sobre ti, tu experiencia y por qué te apasiona cuidar niños..."
                className="w-full px-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-inner"
              />
            </div>

            {/* Tarifa */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
              <label className="block text-sm font-bold text-text-primary mb-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-warning to-warning-light rounded-xl flex items-center justify-center shadow-lg shadow-warning/20">
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
                  value={caregiverFormData.hourly_rate}
                  onChange={handleCaregiverChange}
                  className="w-full pl-10 pr-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner text-lg font-bold"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Rango de Edades */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
              <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-success to-success-light rounded-xl flex items-center justify-center shadow-lg shadow-success/20">
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
                    value={caregiverFormData.min_children_age}
                    onChange={handleCaregiverChange}
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
                    value={caregiverFormData.max_children_age}
                    onChange={handleCaregiverChange}
                    className="w-full px-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
              <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
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
                  value={caregiverFormData.address}
                  onChange={handleCaregiverChange}
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
                  <span className="text-xl font-black text-primary">{caregiverFormData.availability_radius_km} km</span>
                </div>
                <input
                  type="range"
                  name="availability_radius_km"
                  min="1"
                  max="100"
                  value={caregiverFormData.availability_radius_km}
                  onChange={handleCaregiverChange}
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
                <div className="w-10 h-10 bg-linear-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                Idiomas que Hablas <span className="text-text-muted font-normal">(Selecciona al menos uno)</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => toggleLanguage(lang.value, true)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm ${
                      caregiverFormData.languages_spoken.includes(lang.value)
                        ? 'bg-linear-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/30'
                        : 'bg-bg-main text-text-secondary border border-border hover:border-primary/30 hover:shadow-md'
                    }`}
                  >
                    {caregiverFormData.languages_spoken.includes(lang.value) && (
                      <span className="mr-1.5">✓</span>
                    )}
                    {lang.label}
                  </button>
                ))}
              </div>
              {caregiverFormData.languages_spoken.length === 0 && (
                <p className="mt-3 text-sm text-red-600 font-medium">
                  Debes seleccionar al menos un idioma
                </p>
              )}
            </div>

            {/* Habilidades */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
              <label className="block text-sm font-bold text-text-primary mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-warning to-accent rounded-xl flex items-center justify-center shadow-lg shadow-warning/20">
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
                  className="px-5 py-3 bg-linear-to-r from-primary to-primary-light text-white rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-bold shadow-md"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {caregiverFormData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-success/15 to-success/10 text-success-dark rounded-full text-sm font-bold border border-success/20"
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
          </>
        ) : (
          <>
            {/* Nombre de la Familia */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
              <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                Información de la Familia
              </h2>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">Nombre de la Familia</label>
                <input
                  type="text"
                  name="family_name"
                  required
                  value={familyFormData.family_name}
                  onChange={handleFamilyChange}
                  className="w-full px-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                  placeholder="Ej: Familia García"
                />
              </div>
            </div>

            {/* Ubicación */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
              <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                Ubicación
              </h2>
              
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={familyFormData.address}
                  onChange={handleFamilyChange}
                  className="w-full px-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                  placeholder="Ej: Av. Corrientes 1234, CABA, Buenos Aires"
                />
                <p className="mt-2 text-xs text-text-secondary">
                  Esta dirección se usará para buscar cuidadores cercanos a tu ubicación
                </p>
              </div>
            </div>

            {/* Información de los Hijos */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
              <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-success to-success-light rounded-xl flex items-center justify-center shadow-lg shadow-success/20">
                  <Baby className="w-5 h-5 text-white" />
                </div>
                Información de los Hijos
              </h2>
              
              {/* Cantidad de hijos */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-text-primary mb-3">
                  Cantidad de Hijos
                </label>
                <input
                  type="number"
                  name="children_count"
                  min="1"
                  max="10"
                  required
                  value={familyFormData.children_count}
                  onChange={handleFamilyChange}
                  className="w-full px-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                />
              </div>

              {/* Edades de los hijos */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-text-primary mb-3">
                  Edades de los Hijos
                </label>
                <div className="flex gap-3 mb-3">
                  <input
                    type="number"
                    min="0"
                    max="18"
                    value={newChildAge}
                    onChange={(e) => setNewChildAge(e.target.value)}
                    placeholder="Edad (0-18)"
                    className="flex-1 px-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChildAge())}
                  />
                  <button
                    type="button"
                    onClick={addChildAge}
                    disabled={familyFormData.children_ages.length >= familyFormData.children_count}
                    className="px-5 py-3 bg-linear-to-r from-primary to-primary-light text-white rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-bold shadow-md disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-text-secondary mb-2">
                  Agrega la edad de cada hijo (máximo: {familyFormData.children_count})
                </p>
                <div className="flex flex-wrap gap-2">
                  {familyFormData.children_ages.map((age, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary/15 to-primary/10 text-primary-dark rounded-full text-sm font-bold border border-primary/20"
                    >
                      {age} años
                      <button
                        type="button"
                        onClick={() => removeChildAge(index)}
                        className="hover:bg-primary/30 rounded-full p-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                {familyFormData.children_ages.length === 0 && (
                  <p className="mt-2 text-sm text-text-muted">
                    No has agregado edades de hijos
                  </p>
                )}
              </div>
            </div>

            {/* Idiomas Preferidos */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
              <label className="block text-sm font-bold text-text-primary mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                Idiomas Preferidos <span className="text-text-muted font-normal">(Selecciona al menos uno)</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => toggleLanguage(lang.value, false)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm ${
                      familyFormData.languages_preferred.includes(lang.value)
                        ? 'bg-linear-to-r from-accent to-accent-light text-white shadow-lg shadow-accent/30'
                        : 'bg-bg-main text-text-secondary border border-border hover:border-accent/30 hover:shadow-md'
                    }`}
                  >
                    {familyFormData.languages_preferred.includes(lang.value) && (
                      <span className="mr-1.5">✓</span>
                    )}
                    {lang.label}
                  </button>
                ))}
              </div>
              {familyFormData.languages_preferred.length === 0 && (
                <p className="mt-3 text-sm text-red-600 font-medium">
                  Debes seleccionar al menos un idioma
                </p>
              )}
            </div>

            {/* Necesidades Especiales */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-sm">
              <label className="block text-sm font-bold text-text-primary mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-warning to-accent rounded-xl flex items-center justify-center shadow-lg shadow-warning/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                Necesidades Especiales (opcional)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newSpecialNeed}
                  onChange={(e) => setNewSpecialNeed(e.target.value)}
                  placeholder="Ej: Alergias, medicación, atención especial..."
                  className="flex-1 px-4 py-3 bg-bg-main border border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialNeed())}
                />
                <button
                  type="button"
                  onClick={addSpecialNeed}
                  className="px-5 py-3 bg-linear-to-r from-primary to-primary-light text-white rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-bold shadow-md"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {familyFormData.special_needs.map((need, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-warning/15 to-warning/10 text-warning-dark rounded-full text-sm font-bold border border-warning/20"
                  >
                    {need}
                    <button
                      type="button"
                      onClick={() => removeSpecialNeed(index)}
                      className="hover:bg-warning/30 rounded-full p-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-4 px-6 bg-bg-main text-text-primary font-bold rounded-2xl border border-border hover:bg-surface hover:border-primary/30 hover:shadow-lg transition-all duration-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-linear-to-r from-primary to-primary-light text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
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
