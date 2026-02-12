import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { searchApi, type SearchResult } from '../services/searchApi';
import api from '../services/api';
import SearchFilters from '../components/search/SearchFilters';
import CaregiverCard from '../components/search/CaregiverCard';
import SearchMap from '../components/search/SearchMap';
import { Heart, Search, MapPin, AlertCircle, Loader2, Sparkles, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import AvailabilityCalendar from '../components/caregiver/AvailabilityCalendar';
import ConversationList from '../components/messages/ConversationList';
import Chat from '../components/messages/Chat';
import type { Conversation } from '../services/messagesApi';

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
  const [showMessages, setShowMessages] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  
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
      {/* Header mejorado con iconos en gradientes */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
            {user.role === 'FAMILY' ? (
              <Heart className="w-7 h-7 text-white" />
            ) : (
              <Sparkles className="w-7 h-7 text-white" />
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
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {hasSearched && !isLoading && (
              <div className="flex items-center justify-between bg-gradient-to-r from-surface to-bg-main p-5 rounded-2xl border border-border shadow-lg shadow-primary/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">
                      {results.length} cuidadores encontrados
                    </h2>
                    <p className="text-sm text-text-secondary">
                      Dentro de un radio de {searchRadius} km
                    </p>
                  </div>
                </div>
                {results.length > 0 && (
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-success/15 rounded-full shadow-sm">
                    <MapPin className="w-4 h-4 text-success-dark" />
                    <span className="text-sm font-medium text-success-dark">
                      {searchCenter.lat.toFixed(4)}, {searchCenter.lng.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="h-[400px] rounded-3xl overflow-hidden shadow-xl shadow-primary/10 border border-border">
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
              <div className="text-center py-16 bg-gradient-to-br from-surface to-bg-main rounded-3xl border border-border shadow-lg">
                <div className="w-24 h-24 bg-gradient-to-br from-text-muted/20 to-text-muted/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Search className="w-12 h-12 text-text-muted" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  No se encontraron cuidadores
                </h3>
                <p className="text-text-secondary max-w-sm mx-auto">
                  Intenta ampliar el radio de búsqueda o ajustar los filtros para encontrar más opciones.
                </p>
              </div>
            )}

            {!hasSearched && !isLoading && (
              <div className="text-center py-16 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl border border-primary/10 shadow-lg shadow-primary/5">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                  <MapPin className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  ¿Listo para encontrar tu cuidador?
                </h3>
                <p className="text-text-secondary max-w-sm mx-auto">
                  Configura tu ubicación y preferencias en el panel de búsqueda para comenzar.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-16 bg-gradient-to-br from-surface to-bg-main rounded-3xl border border-border shadow-lg">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
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
          <div className="bg-gradient-to-br from-surface to-bg-main rounded-3xl shadow-xl shadow-primary/10 border border-border p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-success to-success-light rounded-2xl flex items-center justify-center shadow-xl shadow-success/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Panel de Cuidador</h2>
                <p className="text-text-secondary">Gestiona tu perfil y disponibilidad</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div 
                onClick={() => navigate('/profile')}
                className="p-6 bg-surface rounded-2xl border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-text-primary mb-1">Mi Perfil</h3>
                <p className="text-sm text-text-secondary">Actualiza tu información y habilidades</p>
              </div>
              
              <div 
                onClick={() => setShowAvailability(!showAvailability)}
                className="p-6 bg-surface rounded-2xl border border-border hover:border-accent/30 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-light rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  {showAvailability ? (
                    <ChevronUp className="w-5 h-5 text-text-muted" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-text-muted" />
                  )}
                </div>
                <h3 className="font-bold text-text-primary mb-1">Disponibilidad</h3>
                <p className="text-sm text-text-secondary">Configura tu horario semanal</p>
              </div>
              
              <div 
                onClick={() => {
                  setShowMessages(!showMessages);
                  setSelectedConversation(null);
                }}
                className="p-6 bg-surface rounded-2xl border border-border hover:border-success/30 hover:shadow-xl hover:shadow-success/10 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-success to-success-light rounded-xl flex items-center justify-center shadow-lg shadow-success/20 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  {showMessages ? (
                    <ChevronUp className="w-5 h-5 text-text-muted" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-text-muted" />
                  )}
                </div>
                <h3 className="font-bold text-text-primary mb-1">Mensajes</h3>
                <p className="text-sm text-text-secondary">Chatea con familias</p>
              </div>
            </div>

            {/* Availability Calendar */}
            {showAvailability && (
              <div className="mt-8 bg-surface rounded-3xl border border-border p-6 shadow-lg">
                <h3 className="text-xl font-bold text-text-primary mb-4">
                  Mi Disponibilidad Semanal
                </h3>
                <AvailabilityCalendar />
              </div>
            )}

            {/* Messages */}
            {showMessages && (
              <div className="mt-8 bg-surface rounded-3xl border border-border p-6 shadow-lg">
                <h3 className="text-xl font-bold text-text-primary mb-4">
                  Mis Mensajes
                </h3>
                {selectedConversation ? (
                  <Chat
                    conversationId={selectedConversation.id}
                    onBack={() => setSelectedConversation(null)}
                  />
                ) : (
                  <ConversationList
                    onSelectConversation={(conv: Conversation) => setSelectedConversation(conv)}
                    selectedId={undefined}
                  />
                )}
              </div>
            )}
            
            <div className="mt-8 p-5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 shadow-sm">
              <p className="text-sm text-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-bold">Próximamente:</span>
                Gestión de pagos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
