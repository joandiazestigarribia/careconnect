import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { searchApi, type SearchResult, type FamilySearchResult } from '../services/searchApi';
import api from '../services/api';
import SearchFilters, { 
  getSavedFilters, 
  getSavedFamilyFilters, 
  saveFamilyFilters,
  clearSavedFamilyFilters,
  type SearchFiltersState,
  type FamilySearchFiltersState 
} from '../components/search/SearchFilters';
import CaregiverCard from '../components/search/CaregiverCard';
import FamilyCard from '../components/search/FamilyCard';
import SearchMap from '../components/search/SearchMap';
import { Heart, Search, MapPin, AlertCircle, Loader2, Sparkles, ChevronDown, ChevronUp, MessageSquare, Users, X } from 'lucide-react';
import AvailabilityCalendar from '../components/caregiver/AvailabilityCalendar';
import ConversationList from '../components/messages/ConversationList';
import Chat from '../components/messages/Chat';
import type { Conversation } from '../services/messagesApi';


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

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchCenter, setSearchCenter] = useState({ lat: -27.4511, lng: -58.9865 });
  const [searchRadius, setSearchRadius] = useState(5);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [showFamilySearch, setShowFamilySearch] = useState(false);
  const [familyResults, setFamilyResults] = useState<FamilySearchResult[]>([]);
  const [isLoadingFamilies, setIsLoadingFamilies] = useState(false);
  const [familySearchError, setFamilySearchError] = useState<string | null>(null);
  const [familySearchCenter, setFamilySearchCenter] = useState({ lat: -27.4511, lng: -58.9865 });
  const [familySearchRadius, setFamilySearchRadius] = useState(5);
  const [hasSearchedFamilies, setHasSearchedFamilies] = useState(false);
  
  const [familyAddress, setFamilyAddress] = useState(COMMON_ADDRESSES[0].value);
  const [familyRadius, setFamilyRadius] = useState(5);
  const [maxChildren, setMaxChildren] = useState<number | ''>('');
  const [familyLanguages, setFamilyLanguages] = useState<string[]>(['Español']);
  const [familyUseCustomAddress, setFamilyUseCustomAddress] = useState(false);
  const hasPerformedInitialFamilySearch = useRef(false);
  
  const [showAvailability, setShowAvailability] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
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
    if (!showFamilySearch) return;
    if (hasPerformedInitialFamilySearch.current) return;
    
    const savedFamilyFilters = getSavedFamilyFilters();
    if (savedFamilyFilters) {
      hasPerformedInitialFamilySearch.current = true;
      setFamilyAddress(savedFamilyFilters.address);
      setFamilyRadius(savedFamilyFilters.radius_km);
      setMaxChildren(savedFamilyFilters.max_children_count ?? '');
      setFamilyLanguages(savedFamilyFilters.preferred_languages);
      setFamilyUseCustomAddress(savedFamilyFilters.use_custom_address);
      setIsLoadingFamilies(true);
      performFamilySearch(savedFamilyFilters);
    }
  }, [showFamilySearch]);

  useEffect(() => {
    if (!user?.profile_completed) {
      navigate('/complete-profile');
    }
  }, [user?.profile_completed, navigate]);

  if (!user) {
    return null;
  }

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

  const handleSearch = async (filters: {
    address: string;
    radius_km: number;
    max_hourly_rate?: number;
    preferred_languages: string[];
  }) => {
    await performSearch(filters);
  };

  const performFamilySearch = useCallback(async (filters: {
    address: string;
    radius_km: number;
    preferred_languages: string[];
    max_children_count?: number;
  }) => {
    setIsLoadingFamilies(true);
    setFamilySearchError(null);

    try {
      const coords = await geocodeAddress(filters.address);
      
      if (typeof coords.lat !== 'number' || typeof coords.lng !== 'number' ||
          isNaN(coords.lat) || isNaN(coords.lng)) {
        throw new Error('No se pudieron obtener coordenadas válidas para la dirección');
      }
      
      setFamilySearchCenter(coords);
      setFamilySearchRadius(filters.radius_km);

      const searchResults = await searchApi.searchFamilies({
        latitude: coords.lat,
        longitude: coords.lng,
        radius_km: filters.radius_km,
        preferred_languages: filters.preferred_languages,
        max_children_count: filters.max_children_count,
      });

      setFamilyResults(searchResults);
      setHasSearchedFamilies(true);
    } catch (err: any) {
      setFamilySearchError(err.response?.data?.error?.message || err.message || 'Error en la búsqueda');
    } finally {
      setIsLoadingFamilies(false);
    }
  }, []);

  const handleFamilySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const filters: FamilySearchFiltersState = {
      address: familyAddress,
      radius_km: familyRadius,
      preferred_languages: familyLanguages,
      max_children_count: maxChildren || undefined,
      use_custom_address: familyUseCustomAddress,
    };
    
    saveFamilyFilters(filters);
    
    await performFamilySearch(filters);
  };

  const toggleFamilyLanguage = (langValue: string) => {
    setFamilyLanguages(prev => {
      if (prev.includes(langValue)) {
        if (prev.length === 1) return prev;
        return prev.filter(l => l !== langValue);
      }
      return [...prev, langValue];
    });
  };

  const resetFamilySearch = () => {
    setShowFamilySearch(false);
    setHasSearchedFamilies(false);
    setFamilyResults([]);
    setFamilySearchError(null);
    hasPerformedInitialFamilySearch.current = false;
  };

  const handleClearFamilyFilters = () => {
    setFamilyAddress(COMMON_ADDRESSES[0].value);
    setFamilyRadius(5);
    setMaxChildren('');
    setFamilyLanguages(['Español']);
    setFamilyUseCustomAddress(false);
    clearSavedFamilyFilters();
    hasPerformedInitialFamilySearch.current = false;
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
            <SearchFilters 
              onSearch={handleSearch} 
              isLoading={isLoading} 
              initialFilters={initialFilters}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">Ha ocurrido un error</p>
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
              </div>
            )}

            <div className="h-[570px] rounded-3xl overflow-hidden shadow-xl shadow-primary/10 border border-border">
              <SearchMap
                results={results}
                centerLat={searchCenter.lat}
                centerLng={searchCenter.lng}
                radiusKm={searchRadius}
              />
            </div>
            <p className="text-xs text-text-muted text-center mt-2">
              Las ubicaciones mostradas son aproximadas para proteger la privacidad
            </p>

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

            {!hasSearched && !isLoading && !isLoadingSavedSearch && (
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

            {(isLoading || isLoadingSavedSearch) && (
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
        <div className="max-w-7xl mx-auto">
          {/* Panel de Cuidador con opción de buscar familias */}
          {!showFamilySearch ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-surface to-bg-main rounded-3xl shadow-xl shadow-primary/10 border border-border p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-success to-success-light rounded-2xl flex items-center justify-center shadow-xl shadow-success/20">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary">Panel de Cuidador</h2>
                    <p className="text-text-secondary">Gestiona tu perfil y conecta con familias</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

                  {/* NUEVO: Buscar Familias */}
                  <div 
                    onClick={() => navigate('/caregiver-dashboard')}
                    className="p-6 bg-surface rounded-2xl border-2 border-primary/30 hover:border-primary hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer group bg-gradient-to-br from-primary/5 to-transparent"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-text-primary mb-1">Buscar Familias</h3>
                    <p className="text-sm text-text-secondary">Encuentra familias que necesitan cuidadores</p>
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
          ) : (
            /* Interfaz de búsqueda de familias */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar con filtros */}
              <div className="lg:col-span-1">
                <div className="bg-surface rounded-3xl shadow-xl shadow-primary/10 border-2 border-border overflow-hidden">
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-linear-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-text-primary">Buscar Familias</h2>
                        <p className="text-sm text-text-secondary">Encuentra familias cercanas</p>
                      </div>
                    </div>
                    <button
                      onClick={resetFamilySearch}
                      className="w-8 h-8 bg-bg-main rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Cerrar búsqueda"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleFamilySearch} className="px-5 pb-5 space-y-5">
                    {/* Ubicación */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-text-primary mb-2">
                        <div className="w-5 h-5 bg-linear-to-br from-primary to-accent rounded-full flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-white" />
                        </div>
                        Tu Ubicación
                      </label>
                      
                      {!familyUseCustomAddress ? (
                        <div className="relative">
                          <select
                            value={familyAddress}
                            onChange={(e) => setFamilyAddress(e.target.value)}
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
                          value={familyAddress}
                          onChange={(e) => setFamilyAddress(e.target.value)}
                          className="w-full px-4 py-3 bg-bg-main border-2 border-border rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:border-primary/30"
                          placeholder="Calle, número, ciudad, provincia, Argentina"
                        />
                      )}
                      
                      <button
                        type="button"
                        onClick={() => setFamilyUseCustomAddress(!familyUseCustomAddress)}
                        className="mt-2 text-sm text-primary hover:text-primary-dark font-bold flex items-center gap-1 transition-colors duration-300"
                      >
                        {familyUseCustomAddress ? '← Usar dirección predefinida' : '✎ Escribir dirección personalizada'}
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
                          <span className="text-lg font-bold text-primary">{familyRadius} km</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={familyRadius}
                          onChange={(e) => setFamilyRadius(parseInt(e.target.value))}
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
                            onClick={() => toggleFamilyLanguage(lang.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                              familyLanguages.includes(lang.value)
                                ? 'bg-linear-to-r from-primary to-primary-light text-surface shadow-lg shadow-primary/20'
                                : 'bg-bg-main text-text-secondary border-2 border-border hover:border-primary/30'
                            }`}
                          >
                            {familyLanguages.includes(lang.value) && (
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
                        disabled={isLoadingFamilies}
                        className="flex-1 flex items-center justify-center gap-2 py-4 px-4 bg-linear-to-r from-primary to-primary-light text-surface font-bold rounded-2xl hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-primary/20"
                      >
                        {isLoadingFamilies ? (
                          <>
                            <div className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                            Buscando...
                          </>
                        ) : (
                          <>
                            <Search className="w-5 h-5" />
                            Buscar Familias
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleClearFamilyFilters}
                        disabled={isLoadingFamilies}
                        className="flex items-center justify-center gap-2 py-4 px-4 bg-bg-main text-text-secondary font-bold rounded-2xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-2 border-border focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        title="Limpiar filtros"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-2 space-y-6">
                {familySearchError && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl shadow-sm">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{familySearchError}</p>
                  </div>
                )}

                {hasSearchedFamilies && !isLoadingFamilies && (
                  <div className="flex items-center justify-between bg-gradient-to-r from-surface to-bg-main p-5 rounded-2xl border border-border shadow-lg shadow-primary/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-text-primary">
                          {familyResults.length} familias encontradas
                        </h2>
                        <p className="text-sm text-text-secondary">
                          Dentro de un radio de {familySearchRadius} km
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mapa para familias */}
                <div className="h-[400px] rounded-3xl overflow-hidden shadow-xl shadow-primary/10 border border-border">
                  <SearchMap
                    familyResults={familyResults}
                    centerLat={familySearchCenter.lat}
                    centerLng={familySearchCenter.lng}
                    radiusKm={familySearchRadius}
                    type="families"
                  />
                </div>
                <p className="text-xs text-text-muted text-center mt-2">
                  Las ubicaciones mostradas son aproximadas para proteger la privacidad
                </p>

                {familyResults.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {familyResults.map((result, index) => (
                      <div 
                        key={result.family.user_id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <FamilyCard result={result} />
                      </div>
                    ))}
                  </div>
                )}

                {hasSearchedFamilies && familyResults.length === 0 && !isLoadingFamilies && (
                  <div className="text-center py-16 bg-gradient-to-br from-surface to-bg-main rounded-3xl border border-border shadow-lg">
                    <div className="w-24 h-24 bg-gradient-to-br from-text-muted/20 to-text-muted/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <Users className="w-12 h-12 text-text-muted" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                      No se encontraron familias
                    </h3>
                    <p className="text-text-secondary max-w-sm mx-auto">
                      Intenta ampliar el radio de búsqueda o ajustar los filtros para encontrar más opciones.
                    </p>
                  </div>
                )}

                {!hasSearchedFamilies && !isLoadingFamilies && (
                  <div className="text-center py-16 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl border border-primary/10 shadow-lg shadow-primary/5">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                      <MapPin className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                      ¿Buscando familias para cuidar?
                    </h3>
                    <p className="text-text-secondary max-w-sm mx-auto">
                      Configura tu ubicación y preferencias para encontrar familias que necesiten tus servicios.
                    </p>
                  </div>
                )}

                {isLoadingFamilies && (
                  <div className="text-center py-16 bg-gradient-to-br from-surface to-bg-main rounded-3xl border border-border shadow-lg">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                      Buscando familias...
                    </h3>
                    <p className="text-text-secondary">
                      Estamos analizando las mejores opciones para ti.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
