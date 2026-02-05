import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { familyProfileApi } from '../../services/profileApi';
import Toast from '../common/Toast';
import { Users, MapPin, Heart, Globe, Plus, Minus, X, AlertCircle, Loader2, Check, Baby } from 'lucide-react';

const AVAILABLE_LANGUAGES = [
  { value: 'Español', label: 'Español' },
  { value: 'Inglés', label: 'Inglés' },
];

const FamilyProfileForm = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    family_name: '',
    address: '',
    children_count: 1,
    children_ages: [] as number[],
    special_needs: [] as string[],
    languages_preferred: [] as string[],
  });
  const [newNeed, setNewNeed] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'children_count' ? parseInt(value) : value }));
  };

  const handleChildrenAgesChange = (index: number, value: string) => {
    const newAges = [...formData.children_ages];
    newAges[index] = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, children_ages: newAges }));
  };

  const addChild = () => {
    setFormData(prev => ({
      ...prev,
      children_count: prev.children_count + 1,
      children_ages: [...prev.children_ages, 0],
    }));
  };

  const removeChild = () => {
    if (formData.children_count > 1) {
      setFormData(prev => ({
        ...prev,
        children_count: prev.children_count - 1,
        children_ages: prev.children_ages.slice(0, -1),
      }));
    }
  };

  const addNeed = () => {
    if (newNeed.trim()) {
      setFormData(prev => ({ ...prev, special_needs: [...prev.special_needs, newNeed.trim()] }));
      setNewNeed('');
    }
  };

  const removeNeed = (index: number) => {
    setFormData(prev => ({ ...prev, special_needs: prev.special_needs.filter((_, i) => i !== index) }));
  };

  const toggleLanguage = (langValue: string) => {
    setFormData(prev => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.languages_preferred.length === 0) {
      setError('Debes seleccionar al menos un idioma preferido');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await familyProfileApi.create(formData);
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
          <label className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Nombre de la Familia
          </label>
          <input
            type="text"
            name="family_name"
            required
            value={formData.family_name}
            onChange={handleChange}
            placeholder="Ej: Familia García"
            className="w-full px-4 py-3 bg-bg-main border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Dirección
          </label>
          <input
            type="text"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
            placeholder="Calle, número, ciudad, provincia"
            className="w-full px-4 py-3 bg-bg-main border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <p className="mt-1.5 text-xs text-text-muted">
            Esta dirección se usará para buscar cuidadores cercanos
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
            <Baby className="w-4 h-4 text-primary" />
            Cantidad de Niños
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={removeChild}
              disabled={formData.children_count <= 1}
              className="w-12 h-12 flex items-center justify-center bg-bg-main border border-border text-primary rounded-xl hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-2xl font-bold text-text-primary w-12 text-center">
              {formData.children_count}
            </span>
            <button
              type="button"
              onClick={addChild}
              className="w-12 h-12 flex items-center justify-center bg-bg-main border border-border text-primary rounded-xl hover:bg-border transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {formData.children_count > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Edades de los Niños
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {Array.from({ length: formData.children_count }).map((_, index) => (
                <div key={index} className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-medium">
                    #{index + 1}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="18"
                    placeholder="Edad"
                    value={formData.children_ages[index] || ''}
                    onChange={(e) => handleChildrenAgesChange(index, e.target.value)}
                    className="w-full pl-8 pr-3 py-3 bg-bg-main border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            Necesidades Especiales
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newNeed}
              onChange={(e) => setNewNeed(e.target.value)}
              placeholder="Ej: Alergias, medicación, etc."
              className="flex-1 px-4 py-3 bg-bg-main border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNeed())}
            />
            <button
              type="button"
              onClick={addNeed}
              className="px-4 py-3 bg-bg-main border border-border text-primary rounded-xl hover:bg-primary hover:text-surface hover:border-primary transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.special_needs.map((need, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent-dark rounded-full text-sm font-medium"
              >
                {need}
                <button
                  type="button"
                  onClick={() => removeNeed(index)}
                  className="hover:bg-accent/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Idiomas Preferidos <span className="text-text-muted font-normal">(Selecciona al menos uno)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                type="button"
                onClick={() => toggleLanguage(lang.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  formData.languages_preferred.includes(lang.value)
                    ? 'bg-primary text-surface'
                    : 'bg-bg-main text-text-secondary border border-border hover:border-primary'
                }`}
              >
                {formData.languages_preferred.includes(lang.value) && (
                  <span className="mr-1.5">✓</span>
                )}
                {lang.label}
              </button>
            ))}
          </div>
          {formData.languages_preferred.length === 0 && (
            <p className="mt-2 text-sm text-red-600">
              Debes seleccionar al menos un idioma
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || formData.languages_preferred.length === 0}
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

export default FamilyProfileForm;
