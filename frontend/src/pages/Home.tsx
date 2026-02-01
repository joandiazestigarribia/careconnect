import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { searchApi, type SearchResult } from '../services/searchApi';
import api from '../services/api';
import SearchFilters from '../components/search/SearchFilters';
import CaregiverCard from '../components/search/CaregiverCard';
import SearchMap from '../components/search/SearchMap';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchCenter, setSearchCenter] = useState({ lat: -27.4511, lng: -58.9865 });
  const [searchRadius, setSearchRadius] = useState(5);
  const [hasSearched, setHasSearched] = useState(false);

  if (!user?.profile_completed) {
    navigate('/complete-profile');
    return null;
  }

  const handleSearch = async (filters: {
    address: string;
    radius_km: number;
    max_hourly_rate?: number;
    preferred_languages: string[];
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const coords = await geocodeAddress(filters.address);
      
      if (typeof coords.lat !== 'number' || typeof coords.lng !== 'number' ||
          isNaN(coords.lat) || isNaN(coords.lng)) {
        throw new Error('No se pudieron obtener coordenadas válidas para la dirección');
      }
      
      setSearchCenter(coords);
      setSearchRadius(filters.radius_km);

      const searchResults = await searchApi.searchCaregivers({
        latitude: coords.lat,
        longitude: coords.lng,
        radius_km: filters.radius_km,
        max_hourly_rate: filters.max_hourly_rate,
        preferred_languages: filters.preferred_languages,
      });

      setResults(searchResults);
      setHasSearched(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const ADDRESS_COORDINATES: Record<string, { lat: number; lng: number }> = {
    'Av. 9 de Julio 1155, Resistencia, Chaco, Argentina': { lat: -27.460111, lng: -58.976170 },
    'French 800, Resistencia, Chaco, Argentina': { lat: -27.448127, lng: -58.976088 },
    'Av. Alvear 1500, Resistencia, Chaco, Argentina': { lat: -27.445546, lng: -59.006910 },
    'Corrientes 400, Resistencia, Chaco, Argentina': { lat: -27.445751, lng: -58.987236 },
    'Yrigoyen 1300, Resistencia, Chaco, Argentina': { lat: -27.45804, lng: -58.97476 },
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
    if (ADDRESS_COORDINATES[address]) {
      return ADDRESS_COORDINATES[address];
    }
    
    for (const [key, coords] of Object.entries(ADDRESS_COORDINATES)) {
      if (key.toLowerCase().includes(address.toLowerCase()) || 
          address.toLowerCase().includes(key.toLowerCase().replace(', argentina', ''))) {
        return coords;
      }
    }

    try {
      const response = await api.get(`/geocode?address=${encodeURIComponent(address)}`);
      
      if (response.data.success && response.data.data) {
        const { latitude, longitude } = response.data.data;
        if (typeof latitude === 'number' && typeof longitude === 'number' &&
            !isNaN(latitude) && !isNaN(longitude)) {
          return {
            lat: latitude,
            lng: longitude,
          };
        }
      }

      return { lat: -27.4511, lng: -58.9865 };
    } catch (error) {
      return { lat: -27.4511, lng: -58.9865 };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {user.role === 'FAMILY' ? 'Encuentra tu Cuidador Ideal' : 'Tus Servicios'}
        </h1>
        <p className="mt-2 text-gray-600">
          {user.role === 'FAMILY'
            ? 'Busca cuidadores cercanos a tu ubicación'
            : 'Gestiona tu disponibilidad y servicios'}
        </p>
      </div>

      {user.role === 'FAMILY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <SearchFilters onSearch={handleSearch} isLoading={isLoading} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {hasSearched && !isLoading && (
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {results.length} cuidadores encontrados
                </h2>
              </div>
            )}

            <div className="h-[475px] mb-6">
              <SearchMap
                results={results}
                centerLat={searchCenter.lat}
                centerLng={searchCenter.lng}
                radiusKm={searchRadius}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((result) => (
                <CaregiverCard key={result.caregiver.user_id} result={result} />
              ))}
            </div>

            {hasSearched && results.length === 0 && !isLoading && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No se encontraron cuidadores en tu área</p>
                <p className="text-sm mt-2">Intenta ampliar el radio de búsqueda</p>
              </div>
            )}
          </div>
        </div>
      )}

      {user.role === 'CAREGIVER' && (
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Panel de Cuidador</h2>
          <p className="text-gray-600">
            Próximamente: gestión de disponibilidad, calendario y solicitudes.
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
