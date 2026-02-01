import React, { useState } from 'react';

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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-lg font-semibold">Buscar Cuidadores</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tu Dirección</label>
        
        {!useCustomAddress ? (
          <select
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            {COMMON_ADDRESSES.map((addr) => (
              <option key={addr.value} value={addr.value}>
                {addr.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Calle, número, ciudad, provincia, Argentina"
          />
        )}
        
        <button
          type="button"
          onClick={() => setUseCustomAddress(!useCustomAddress)}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          {useCustomAddress ? '← Usar dirección predefinida' : '✎ Escribir dirección personalizada'}
        </button>
        
        <p className="mt-1 text-xs text-gray-500">
          Incluye ciudad y provincia para mejor precisión
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Radio de búsqueda
        </label>
        <div className="flex items-center gap-4 mt-1">
          <input
            type="range"
            min="1"
            max="20"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-lg font-semibold text-blue-600 min-w-[60px] text-right">
            {radius} km
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1 km</span>
          <span>10 km</span>
          <span>20 km</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tarifa máxima por hora ($)
        </label>
        <input
          type="number"
          value={maxRate}
          onChange={(e) => setMaxRate(e.target.value ? parseInt(e.target.value) : '')}
          placeholder="Sin límite"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Idiomas preferidos</label>
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            placeholder="Agregar idioma"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
          />
          <button
            type="button"
            onClick={addLanguage}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {languages.map((lang) => (
            <span
              key={lang}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {lang}
              <button type="button" onClick={() => removeLanguage(lang)} className="text-blue-600">
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  );
};

export default SearchFilters;
