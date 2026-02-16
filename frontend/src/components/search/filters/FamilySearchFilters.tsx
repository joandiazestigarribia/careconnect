import { useState } from 'react';
import { MapPin, Users, Heart, Search, ChevronDown, X } from 'lucide-react';
import { saveFamilyFilters, clearSavedFamilyFilters, type FamilySearchFiltersState } from '../SearchFilters';

const COMMON_ADDRESSES = [
  { label: 'Av. 9 de Julio 1155, Resistencia, Chaco', value: 'Av. 9 de Julio 1155, Resistencia, Chaco, Argentina' },
  { label: 'French 800, Resistencia, Chaco', value: 'French 800, Resistencia, Chaco, Argentina' },
  { label: 'Av. Alvear 1500, Resistencia, Chaco', value: 'Av. Alvear 1500, Resistencia, Chaco, Argentina' },
  { label: 'Corrientes 400, Resistencia, Chaco', value: 'Corrientes 400, Resistencia, Chaco, Argentina' },
  { label: 'Yrigoyen 1300, Resistencia, Chaco', value: 'Yrigoyen 1300, Resistencia, Chaco, Argentina' },
];

const AVAILABLE_LANGUAGES = [
  { value: 'Español', label: 'Español' },
  { value: 'Inglés', label: 'Inglés' },
];

const DEFAULT_FILTERS: FamilySearchFiltersState = {
  address: COMMON_ADDRESSES[0].value,
  radius_km: 5,
  preferred_languages: ['Español'],
  use_custom_address: false,
};

interface Props {
  onSearch: (filters: {
    address: string;
    radius_km: number;
    preferred_languages: string[];
    max_children_count?: number;
  }) => void;
  isLoading: boolean;
  initialFilters?: FamilySearchFiltersState | null;
}

const FamilySearchFilters = ({ onSearch, isLoading, initialFilters }: Props) => {
  const [address, setAddress] = useState(initialFilters?.address ?? DEFAULT_FILTERS.address);
  const [radius, setRadius] = useState(initialFilters?.radius_km ?? DEFAULT_FILTERS.radius_km);
  const [maxChildren, setMaxChildren] = useState<number | ''>(initialFilters?.max_children_count ?? '');
  const [languages, setLanguages] = useState<string[]>(initialFilters?.preferred_languages ?? DEFAULT_FILTERS.preferred_languages);
  const [useCustomAddress, setUseCustomAddress] = useState(initialFilters?.use_custom_address ?? DEFAULT_FILTERS.use_custom_address);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: FamilySearchFiltersState = {
      address,
      radius_km: radius,
      preferred_languages: languages,
      max_children_count: maxChildren || undefined,
      use_custom_address: useCustomAddress,
    };
    saveFamilyFilters(filters);
    onSearch({
      address,
      radius_km: radius,
      preferred_languages: languages,
      max_children_count: maxChildren || undefined,
    });
  };

  const handleClear = () => {
    setAddress(DEFAULT_FILTERS.address);
    setRadius(DEFAULT_FILTERS.radius_km);
    setMaxChildren('');
    setLanguages(DEFAULT_FILTERS.preferred_languages);
    setUseCustomAddress(DEFAULT_FILTERS.use_custom_address);
    clearSavedFamilyFilters();
  };

  const toggleLanguage = (langValue: string) => {
    setLanguages(prev => {
      if (prev.includes(langValue)) {
        if (prev.length === 1) return prev;
        return prev.filter(l => l !== langValue);
      }
      return [...prev, langValue];
    });
  };

  const isDefaultState = 
    address === DEFAULT_FILTERS.address &&
    radius === DEFAULT_FILTERS.radius_km &&
    maxChildren === '' &&
    languages.length === DEFAULT_FILTERS.preferred_languages.length &&
    languages.every(l => DEFAULT_FILTERS.preferred_languages.includes(l)) &&
    useCustomAddress === DEFAULT_FILTERS.use_custom_address;

  return (
    <div className="bg-surface rounded-3xl shadow-xl shadow-primary/10 border-2 border-border overflow-hidden">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-linear-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Filtros de Búsqueda</h2>
            <p className="text-sm text-text-secondary">Encuentra familias cercanas</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-5 mt-5">
        {/* Ubicación */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-text-primary mb-2">
            <div className="w-5 h-5 bg-linear-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            Tu Ubicación
          </label>
          
          {!useCustomAddress ? (
            <div className="relative">
              <select
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-bg-main border-2 border-border rounded-2xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 appearance-none cursor-pointer hover:border-primary/30"
              >
                {COMMON_ADDRESSES.map((addr) => (
                  <option key={addr.value} value={addr.value}>
                    {addr.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
            </div>
          ) : (
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 bg-bg-main border-2 border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:border-primary/30"
              placeholder="Calle, número, ciudad, provincia, Argentina"
            />
          )}
          
          <button
            type="button"
            onClick={() => setUseCustomAddress(!useCustomAddress)}
            className="mt-2 text-sm text-primary hover:text-primary-dark font-bold flex items-center gap-1 transition-colors duration-300"
          >
            {useCustomAddress ? '← Usar dirección predefinida' : '✎ Escribir dirección personalizada'}
          </button>
        </div>

        {/* Radio de búsqueda */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-text-primary mb-3">
            <div className="w-5 h-5 bg-linear-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            Radio de búsqueda
          </label>
          <div className="bg-bg-main rounded-2xl p-4 border-2 border-border hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">Distancia máxima</span>
              <span className="text-lg font-bold text-primary">{radius} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full h-2 bg-linear-to-r from-border to-border rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-text-muted mt-2">
              <span>1 km</span>
              <span>10 km</span>
              <span>20 km</span>
            </div>
          </div>
        </div>

        {/* Máximo de hijos */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-text-primary mb-2">
            <div className="w-5 h-5 bg-linear-to-br from-accent to-primary rounded-full flex items-center justify-center">
              <Users className="w-3 h-3 text-white" />
            </div>
            Máximo de hijos
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={maxChildren}
            onChange={(e) => setMaxChildren(e.target.value ? parseInt(e.target.value) : '')}
            placeholder="Sin límite"
            className="w-full px-4 py-3 bg-bg-main border-2 border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:border-primary/30"
          />
        </div>

        {/* Idiomas */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-text-primary mb-3">
            <div className="w-5 h-5 bg-linear-to-br from-success to-primary rounded-full flex items-center justify-center">
              <Heart className="w-3 h-3 text-white" />
            </div>
            Idiomas que hablas
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                type="button"
                onClick={() => toggleLanguage(lang.value)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  languages.includes(lang.value)
                    ? 'bg-linear-to-r from-primary to-primary-light text-surface shadow-lg shadow-primary/20'
                    : 'bg-bg-main text-text-secondary border-2 border-border hover:border-primary/30'
                }`}
              >
                {languages.includes(lang.value) && (
                  <span className="mr-1.5">✓</span>
                )}
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-4 bg-linear-to-r from-primary to-primary-light text-surface font-bold rounded-2xl hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Buscar
              </>
            )}
          </button>
          
          {!isDefaultState && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-4 px-4 bg-bg-main text-text-secondary font-bold rounded-2xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-2 border-border focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              title="Limpiar filtros"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FamilySearchFilters;
