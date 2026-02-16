import { useState, useEffect } from 'react';
import { MapPin, DollarSign, Globe, Search, ChevronDown, X } from 'lucide-react';

export interface SearchFiltersState {
  address: string;
  radius_km: number;
  max_hourly_rate?: number;
  preferred_languages: string[];
  use_custom_address: boolean;
}

interface Props {
  onSearch: (filters: {
    address: string;
    radius_km: number;
    max_hourly_rate?: number;
    preferred_languages: string[];
  }) => void;
  isLoading: boolean;
  initialFilters?: SearchFiltersState | null;
}

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

const DEFAULT_FILTERS: SearchFiltersState = {
  address: COMMON_ADDRESSES[0].value,
  radius_km: 5,
  max_hourly_rate: undefined,
  preferred_languages: ['Español'],
  use_custom_address: false,
};

const STORAGE_KEY = 'careconnect_search_filters';

export const getSavedFilters = (): SearchFiltersState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
  }
  return null;
};

export const saveFilters = (filters: SearchFiltersState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
  }
};

export const clearSavedFilters = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
  }
};

const SearchFilters = ({ onSearch, isLoading, initialFilters }: Props) => {
  const [address, setAddress] = useState(DEFAULT_FILTERS.address);
  const [radius, setRadius] = useState(DEFAULT_FILTERS.radius_km);
  const [maxRate, setMaxRate] = useState<number | ''>(DEFAULT_FILTERS.max_hourly_rate ?? '');
  const [languages, setLanguages] = useState<string[]>(DEFAULT_FILTERS.preferred_languages);
  const [useCustomAddress, setUseCustomAddress] = useState(DEFAULT_FILTERS.use_custom_address);
  const [isExpanded, setIsExpanded] = useState(true);


  useEffect(() => {
    const filtersToLoad = initialFilters || getSavedFilters();
    if (filtersToLoad) {
      setAddress(filtersToLoad.address);
      setRadius(filtersToLoad.radius_km);
      setMaxRate(filtersToLoad.max_hourly_rate ?? '');
      setLanguages(filtersToLoad.preferred_languages);
      setUseCustomAddress(filtersToLoad.use_custom_address);

    }
  }, [initialFilters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: SearchFiltersState = {
      address,
      radius_km: radius,
      max_hourly_rate: maxRate || undefined,
      preferred_languages: languages,
      use_custom_address: useCustomAddress,
    };
    saveFilters(filters);
    onSearch({
      address,
      radius_km: radius,
      max_hourly_rate: maxRate || undefined,
      preferred_languages: languages,
    });
  };

  const handleClearFilters = () => {
    setAddress(DEFAULT_FILTERS.address);
    setRadius(DEFAULT_FILTERS.radius_km);
    setMaxRate(DEFAULT_FILTERS.max_hourly_rate ?? '');
    setLanguages(DEFAULT_FILTERS.preferred_languages);
    setUseCustomAddress(DEFAULT_FILTERS.use_custom_address);
    clearSavedFilters();
    onSearch({
      address: DEFAULT_FILTERS.address,
      radius_km: DEFAULT_FILTERS.radius_km,
      max_hourly_rate: DEFAULT_FILTERS.max_hourly_rate,
      preferred_languages: DEFAULT_FILTERS.preferred_languages,
    });
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
    maxRate === (DEFAULT_FILTERS.max_hourly_rate ?? '') &&
    languages.length === DEFAULT_FILTERS.preferred_languages.length &&
    languages.every(l => DEFAULT_FILTERS.preferred_languages.includes(l)) &&
    useCustomAddress === DEFAULT_FILTERS.use_custom_address;

  return (
    <div className="bg-surface rounded-3xl shadow-xl shadow-primary/10 border-2 border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300">
      <div 
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-bg-main transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-linear-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Buscar Cuidadores</h2>
            <p className="text-sm text-text-secondary">Encuentra el cuidador ideal</p>
          </div>
        </div>
        <div className="w-8 h-8 bg-bg-main rounded-full flex items-center justify-center">
          <ChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-5">
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

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-text-primary mb-2">
              <div className="w-5 h-5 bg-linear-to-br from-accent to-primary rounded-full flex items-center justify-center">
                <DollarSign className="w-3 h-3 text-white" />
              </div>
              Tarifa máxima por hora
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
              <input
                type="number"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="Sin límite"
                className="w-full pl-8 pr-4 py-3 bg-bg-main border-2 border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:border-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-text-primary mb-3">
              <div className="w-5 h-5 bg-linear-to-br from-success to-primary rounded-full flex items-center justify-center">
                <Globe className="w-3 h-3 text-white" />
              </div>
              Idiomas preferidos
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
            <p className="mt-2 text-xs text-text-muted">
              Selecciona los idiomas que prefieres para el cuidador
            </p>
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
                  Buscar Cuidadores
                </>
              )}
            </button>
            
            {!isDefaultState && (
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-4 px-4 bg-bg-main text-text-secondary font-bold rounded-2xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-2 border-border focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                title="Limpiar filtros"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default SearchFilters;
