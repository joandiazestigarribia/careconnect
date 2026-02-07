import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { searchApi, type SearchResult } from '../services/searchApi';
import api from '../services/api';
import SearchFilters from '../components/search/SearchFilters';
import CaregiverCard from '../components/search/CaregiverCard';
import SearchMap from '../components/search/SearchMap';
import { Heart, Search, MapPin, AlertCircle, Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import AvailabilityCalendar from '../components/caregiver/AvailabilityCalendar';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchCenter, setSearchCenter] = useState({ lat: -27.4511, lng: -58.9865 });
  const [searchRadius, setSearchRadius] = useState(5);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  
  useEffect(() => {
    if (!user?.profile_completed) {
      navigate('/complete-profile');
    }
  }, [user?.profile_completed, navigate]);

  if (!user) {
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
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            {user.role === 'FAMILY' ? (
              <Heart className="w-6 h-6 text-surface" />
            ) : (
              <Sparkles className="w-6 h-6 text-surface" />
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              {user.role === 'FAMILY' ? 'Encuentra tu Cuidador Ideal' : 'Tus Servicios'}
            </h1>
          </div>
        </div>
        <p className="text-text-secondary text-lg max-w-2xl">
          {user.role === 'FAMILY'
            ? 'Busca cuidadores cercanos a tu ubicación y encuentra el match perfecto para tu familia.'
            : 'Gestiona tu disponibilidad, servicios y conecta con familias que necesitan tu ayuda.'}
        </p>
      </div>

      {user.role === 'FAMILY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <SearchFilters onSearch={handleSearch} isLoading={isLoading} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {hasSearched && !isLoading && (
              <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      {results.length} cuidadores encontrados
                    </h2>
                    <p className="text-sm text-text-secondary">
                      Dentro de un radio de {searchRadius} km
                    </p>
                  </div>
                </div>
                {results.length > 0 && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-success/15 rounded-full">
                    <MapPin className="w-4 h-4 text-success-dark" />
                    <span className="text-sm font-medium text-success-dark">
                      {searchCenter.lat.toFixed(4)}, {searchCenter.lng.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="h-[400px] rounded-2xl overflow-hidden shadow-sm border border-border">
              <SearchMap
                results={results}
                centerLat={searchCenter.lat}
                centerLng={searchCenter.lng}
                radiusKm={searchRadius}
              />
            </div>

            {results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {results.map((result, index) => (
                  <div 
                    key={result.caregiver.user_id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CaregiverCard result={result} />
                  </div>
                ))}
              </div>
            )}

            {hasSearched && results.length === 0 && !isLoading && (
              <div className="text-center py-16 bg-surface rounded-2xl border border-border">
                <div className="w-20 h-20 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-text-muted" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No se encontraron cuidadores
                </h3>
                <p className="text-text-secondary max-w-sm mx-auto">
                  Intenta ampliar el radio de búsqueda o ajustar los filtros para encontrar más opciones.
                </p>
              </div>
            )}

            {!hasSearched && !isLoading && (
              <div className="text-center py-16 bg-surface rounded-2xl border border-border">
                <div className="w-20 h-20 bg-linear-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  ¿Listo para encontrar tu cuidador?
                </h3>
                <p className="text-text-secondary max-w-sm mx-auto">
                  Configura tu ubicación y preferencias en el panel de búsqueda para comenzar.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-16 bg-surface rounded-2xl border border-border">
                <div className="w-20 h-20 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Buscando cuidadores...
                </h3>
                <p className="text-text-secondary">
                  Estamos analizando las mejores opciones para ti.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {user.role === 'CAREGIVER' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-linear-to-br from-success to-success-light rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-surface" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Panel de Cuidador</h2>
                <p className="text-text-secondary">Gestiona tu perfil y disponibilidad</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                onClick={() => navigate('/profile')}
                className="p-5 bg-bg-main rounded-xl border border-border hover:border-primary/30 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary transition-colors">
                  <Heart className="w-5 h-5 text-primary group-hover:text-surface transition-colors" />
                </div>
                <h3 className="font-medium text-text-primary mb-1">Mi Perfil</h3>
                <p className="text-sm text-text-secondary">Actualiza tu información y habilidades</p>
              </div>
              
              <div 
                onClick={() => setShowAvailability(!showAvailability)}
                className="p-5 bg-bg-main rounded-xl border border-border hover:border-primary/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-accent transition-colors">
                    <MapPin className="w-5 h-5 text-accent group-hover:text-surface transition-colors" />
                  </div>
                  {showAvailability ? (
                    <ChevronUp className="w-5 h-5 text-text-muted" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-text-muted" />
                  )}
                </div>
                <h3 className="font-medium text-text-primary mb-1">Disponibilidad</h3>
                <p className="text-sm text-text-secondary">Configura tu horario semanal</p>
              </div>
              
              <div className="p-5 bg-bg-main rounded-xl border border-border hover:border-primary/30 transition-colors cursor-pointer group">
                <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-success transition-colors">
                  <Search className="w-5 h-5 text-success-dark group-hover:text-surface transition-colors" />
                </div>
                <h3 className="font-medium text-text-primary mb-1">Solicitudes</h3>
                <p className="text-sm text-text-secondary">Revisa las solicitudes de familias</p>
              </div>
            </div>

            {/* Availability Calendar */}
            {showAvailability && (
              <div className="mt-6 bg-surface rounded-2xl border border-border p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Mi Disponibilidad Semanal
                </h3>
                <AvailabilityCalendar />
              </div>
            )}
            
            <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-sm text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Próximamente:</span>
                Sistema de mensajería y gestión de pagos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
