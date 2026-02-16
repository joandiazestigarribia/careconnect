import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { searchApi, type FamilySearchResult } from '../services/searchApi';
import api from '../services/api';
import { 
  getSavedFamilyFilters, 
  saveFamilyFilters,
  type FamilySearchFiltersState 
} from '../components/search/SearchFilters';
import FamilySearchFilters from '../components/search/filters/FamilySearchFilters';
import FamilySearchResults from '../components/search/results/FamilySearchResults';
import CaregiverPanel from '../components/search/common/CaregiverPanel';
import { Users, LayoutDashboard } from 'lucide-react';

const ADDRESS_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Av. 9 de Julio 1155, Resistencia, Chaco, Argentina': { lat: -27.460111, lng: -58.976170 },
  'French 800, Resistencia, Chaco, Argentina': { lat: -27.448127, lng: -58.976088 },
  'Av. Alvear 1500, Resistencia, Chaco, Argentina': { lat: -27.445546, lng: -59.006910 },
  'Corrientes 400, Resistencia, Chaco, Argentina': { lat: -27.445751, lng: -58.987236 },
  'Yrigoyen 1300, Resistencia, Chaco, Argentina': { lat: -27.45804, lng: -58.97476 },
};

const CaregiverDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [familyResults, setFamilyResults] = useState<FamilySearchResult[]>([]);
  const [isLoadingFamilies, setIsLoadingFamilies] = useState(false);
  const [familySearchError, setFamilySearchError] = useState<string | null>(null);
  const [familySearchCenter, setFamilySearchCenter] = useState({ lat: -27.4511, lng: -58.9865 });
  const [familySearchRadius, setFamilySearchRadius] = useState(5);
  const [hasSearchedFamilies, setHasSearchedFamilies] = useState(false);
  
  const [initialFilters, setInitialFilters] = useState<FamilySearchFiltersState | null>(null);
  const [isLoadingSavedSearch, setIsLoadingSavedSearch] = useState(false);
  
  const hasPerformedInitialSearch = useRef(false);

  useEffect(() => {
    if (hasPerformedInitialSearch.current) return;
    
    const savedFilters = getSavedFamilyFilters();
    if (savedFilters) {
      hasPerformedInitialSearch.current = true;
      setInitialFilters(savedFilters);
      setIsLoadingSavedSearch(true);
      performSearch(savedFilters);
    }
  }, []);

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
      setIsLoadingSavedSearch(false);
    }
  }, []);

  const handleSearch = (filters: {
    address: string;
    radius_km: number;
    preferred_languages: string[];
    max_children_count?: number;
  }) => {
    const filtersToSave: FamilySearchFiltersState = {
      ...filters,
      use_custom_address: false,
    };
    saveFamilyFilters(filtersToSave);
    performSearch(filters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                Buscar Familias
              </h1>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-bg-main text-text-secondary font-semibold rounded-2xl border-2 border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300"
          >
            <LayoutDashboard className="w-5 h-5" />
            Volver al Dashboard
          </button>
        </div>
        <p className="text-text-secondary text-lg max-w-2xl mt-4">
          Encuentra familias cercanas que necesiten tus servicios de cuidado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar con filtros y panel */}
        <div className="lg:col-span-1 space-y-6">
          <FamilySearchFilters 
            onSearch={handleSearch}
            isLoading={isLoadingFamilies}
            initialFilters={initialFilters}
          />
          <CaregiverPanel showBackButton={false} />
        </div>

        {/* Resultados */}
        <div className="lg:col-span-2">
          <FamilySearchResults
            results={familyResults}
            isLoading={isLoadingFamilies}
            isLoadingSaved={isLoadingSavedSearch}
            hasSearched={hasSearchedFamilies}
            searchCenter={familySearchCenter}
            searchRadius={familySearchRadius}
            error={familySearchError}
          />
        </div>
      </div>
    </div>
  );
};

export default CaregiverDashboard;
