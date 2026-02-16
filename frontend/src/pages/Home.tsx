import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { searchApi, type SearchResult } from '../services/searchApi';
import api from '../services/api';
import SearchFilters, { 
  getSavedFilters, 
  type SearchFiltersState 
} from '../components/search/SearchFilters';
import CaregiverSearchResults from '../components/search/results/CaregiverSearchResults';
import CaregiverPanel from '../components/search/common/CaregiverPanel';
import { Heart, Sparkles, Users } from 'lucide-react';

const ADDRESS_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Av. 9 de Julio 1155, Resistencia, Chaco, Argentina': { lat: -27.460111, lng: -58.976170 },
  'French 800, Resistencia, Chaco, Argentina': { lat: -27.448127, lng: -58.976088 },
  'Av. Alvear 1500, Resistencia, Chaco, Argentina': { lat: -27.445546, lng: -59.006910 },
  'Corrientes 400, Resistencia, Chaco, Argentina': { lat: -27.445751, lng: -58.987236 },
  'Yrigoyen 1300, Resistencia, Chaco, Argentina': { lat: -27.45804, lng: -58.97476 },
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchCenter, setSearchCenter] = useState({ lat: -27.4511, lng: -58.9865 });
  const [searchRadius, setSearchRadius] = useState(5);
  const [hasSearched, setHasSearched] = useState(false);
  const [initialFilters, setInitialFilters] = useState<SearchFiltersState | null>(null);
  const [isLoadingSavedSearch, setIsLoadingSavedSearch] = useState(false);
  const hasPerformedInitialSearch = useRef(false);

  useEffect(() => {
    if (hasPerformedInitialSearch.current) return;
    
    const savedFilters = getSavedFilters();
    if (savedFilters) {
      hasPerformedInitialSearch.current = true;
      setInitialFilters(savedFilters);
      setIsLoadingSavedSearch(true);
      performSearch(savedFilters);
    }
  }, []);

  useEffect(() => {
    if (!user?.profile_completed) {
      navigate('/complete-profile');
    }
  }, [user?.profile_completed, navigate]);

  if (!user) {
    return null;
  }

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
          return { lat: latitude, lng: longitude };
        }
      }
      return { lat: -27.4511, lng: -58.9865 };
    } catch {
      return { lat: -27.4511, lng: -58.9865 };
    }
  };

  const performSearch = useCallback(async (filters: {
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
      setIsLoadingSavedSearch(false);
    }
  }, []);

  const handleSearch = (filters: {
    address: string;
    radius_km: number;
    max_hourly_rate?: number;
    preferred_languages: string[];
  }) => {
    performSearch(filters);
  };

  if (user.role === 'FAMILY') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-linear-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                Encuentra tu Cuidador Ideal
              </h1>
            </div>
          </div>
          <p className="text-text-secondary text-lg max-w-2xl">
            Busca cuidadores cercanos a tu ubicación y encuentra el match perfecto para tu familia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <SearchFilters 
              onSearch={handleSearch} 
              isLoading={isLoading} 
              initialFilters={initialFilters}
            />
          </div>

          <div className="lg:col-span-2">
            <CaregiverSearchResults
              results={results}
              isLoading={isLoading}
              isLoadingSaved={isLoadingSavedSearch}
              hasSearched={hasSearched}
              searchCenter={searchCenter}
              searchRadius={searchRadius}
              error={error}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 bg-linear-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Tus Servicios
            </h1>
          </div>
        </div>
        <p className="text-text-secondary text-lg max-w-2xl">
          Gestiona tu disponibilidad, servicios y conecta con familias que necesitan tu ayuda.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-linear-to-br from-surface to-bg-main rounded-3xl shadow-xl shadow-primary/10 border border-border p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-linear-to-br from-success to-success-light rounded-2xl flex items-center justify-center shadow-xl shadow-success/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Panel de Cuidador</h2>
              <p className="text-text-secondary">Gestiona tu perfil y conecta con familias</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <CaregiverPanel />
            
            {/* NUEVO: Buscar Familias */}
            <div 
              onClick={() => navigate('/caregiver-dashboard')}
              className="p-6 bg-surface rounded-2xl border-2 border-primary/30 hover:border-primary hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer group bg-linear-to-br from-primary/5 to-transparent"
            >
              <div className="w-12 h-12 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-text-primary mb-1">Buscar Familias</h3>
              <p className="text-sm text-text-secondary">Encuentra familias que necesitan cuidadores</p>
            </div>
          </div>
          
          <div className="mt-8 p-5 bg-linear-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 shadow-sm">
            <p className="text-sm text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">Próximamente:</span>
              Gestión de pagos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
