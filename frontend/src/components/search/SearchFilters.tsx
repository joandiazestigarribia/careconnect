import React, { useState } from 'react';
import { MapPin, DollarSign, Globe, Search, Plus, X, ChevronDown } from 'lucide-react';

interface Props {
  onSearch: (filters: {
    address: string;
    radius_km: number;
    max_hourly_rate?: number;
    preferred_languages: string[];
  }) => void;
  isLoading: boolean;
}

const COMMON_ADDRESSES = [
  { label: 'Av. 9 de Julio 1155, Resistencia, Chaco', value: 'Av. 9 de Julio 1155, Resistencia, Chaco, Argentina' },
  { label: 'French 800, Resistencia, Chaco', value: 'French 800, Resistencia, Chaco, Argentina' },
  { label: 'Av. Alvear 1500, Resistencia, Chaco', value: 'Av. Alvear 1500, Resistencia, Chaco, Argentina' },
  { label: 'Corrientes 400, Resistencia, Chaco', value: 'Corrientes 400, Resistencia, Chaco, Argentina' },
  { label: 'Yrigoyen 1300, Resistencia, Chaco', value: 'Yrigoyen 1300, Resistencia, Chaco, Argentina' },
];

const SearchFilters: React.FC<Props> = ({ onSearch, isLoading }) => {
  const [address, setAddress] = useState(COMMON_ADDRESSES[0].value);
  const [radius, setRadius] = useState(5);
  const [maxRate, setMaxRate] = useState<number | ''>('');
  const [languages, setLanguages] = useState<string[]>(['Español']);
  const [newLanguage, setNewLanguage] = useState('');
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      address,
      radius_km: radius,
      max_hourly_rate: maxRate || undefined,
      preferred_languages: languages,
    });
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang));
  };

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
      <div 
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-bg-main transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Buscar Cuidadores</h2>
            <p className="text-sm text-text-secondary">Encuentra el cuidador ideal</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              Tu Ubicación
            </label>
            
            {!useCustomAddress ? (
              <div className="relative">
                <select
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-main border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
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
                className="w-full px-4 py-3 bg-bg-main border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Calle, número, ciudad, provincia, Argentina"
              />
            )}
            
            <button
              type="button"
              onClick={() => setUseCustomAddress(!useCustomAddress)}
              className="mt-2 text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
            >
              {useCustomAddress ? '← Usar dirección predefinida' : '✎ Escribir dirección personalizada'}
            </button>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-3">
              <MapPin className="w-4 h-4 text-primary" />
              Radio de búsqueda
            </label>
            <div className="bg-bg-main rounded-xl p-4">
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
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-text-muted mt-2">
                <span>1 km</span>
                <span>10 km</span>
                <span>20 km</span>
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Tarifa máxima por hora
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-medium">$</span>
              <input
                type="number"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="Sin límite"
                className="w-full pl-8 pr-4 py-3 bg-bg-main border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
              <Globe className="w-4 h-4 text-primary" />
              Idiomas preferidos
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Agregar idioma"
                className="flex-1 px-4 py-3 bg-bg-main border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
              />
              <button
                type="button"
                onClick={addLanguage}
                className="px-4 py-3 bg-bg-main border border-border text-primary rounded-xl hover:bg-primary hover:text-surface hover:border-primary transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() => removeLanguage(lang)}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-primary text-surface font-medium rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
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
        </form>
      )}
    </div>
  );
};

export default SearchFilters;
