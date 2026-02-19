import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { searchApi, type SearchResult, type FamilySearchResult } from '../services/searchApi';
import api from '../services/api';
import SearchFilters, { 
  getSavedFilters, 
  type SearchFiltersState 
} from '../components/search/SearchFilters';
import FamilySearchFilters from '../components/search/filters/FamilySearchFilters';
import {
  getSavedFamilyFilters,
  type FamilySearchFiltersState,
} from '../components/search/SearchFilters';
import CaregiverSearchResults from '../components/search/results/CaregiverSearchResults';
import FamilySearchResults from '../components/search/results/FamilySearchResults';
import { Heart, Users, ArrowLeft } from 'lucide-react';

const ADDRESS_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Av. 9 de Julio 1155, Resistencia, Chaco, Argentina': { lat: -27.460111, lng: -58.976170 },
  'French 800, Resistencia, Chaco, Argentina': { lat: -27.448127, lng: -58.976088 },
  'Av. Alvear 1500, Resistencia, Chaco, Argentina': { lat: -27.445546, lng: -59.006910 },
  'Corrientes 400, Resistencia, Chaco, Argentina': { lat: -27.445751, lng: -58.987236 },
  'Yrigoyen 1300, Resistencia, Chaco, Argentina': { lat: -27.45804, lng: -58.97476 },
};

const SearchPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isCaregiver = user?.role === 'CAREGIVER';
  const isFamily = user?.role === 'FAMILY';

  const [caregiverResults, setCaregiverResults] = useState<SearchResult[]>([]);
  const [isLoadingCaregivers, setIsLoadingCaregivers] = useState(false);
  const [caregiverError, setCaregiverError] = useState<string | null>(null);
  const [caregiverSearchCenter, setCaregiverSearchCenter] = useState({ lat: -27.4511, lng: -58.9865 });
  const [caregiverSearchRadius, setCaregiverSearchRadius] = useState(5);
  const [hasSearchedCaregivers, setHasSearchedCaregivers] = useState(false);
  const [initialCaregiverFilters, setInitialCaregiverFilters] = useState<SearchFiltersState | null>(null);
  const [isLoadingSavedCaregiverSearch, setIsLoadingSavedCaregiverSearch] = useState(false);
  const hasPerformedInitialCaregiverSearch = useRef(false);

  const [familyResults, setFamilyResults] = useState<FamilySearchResult[]>([]);
  const [isLoadingFamilies, setIsLoadingFamilies] = useState(false);
  const [familyError, setFamilyError] = useState<string | null>(null);
  const [familySearchCenter, setFamilySearchCenter] = useState({ lat: -27.4511, lng: -58.9865 });
  const [familySearchRadius, setFamilySearchRadius] = useState(5);
  const [hasSearchedFamilies, setHasSearchedFamilies] = useState(false);
  const [initialFamilyFilters, setInitialFamilyFilters] = useState<FamilySearchFiltersState | null>(null);
  const [isLoadingSavedFamilySearch, setIsLoadingSavedFamilySearch] = useState(false);
  const hasPerformedInitialFamilySearch = useRef(false);

  useEffect(() => {
    if (isFamily && !hasPerformedInitialCaregiverSearch.current) {
      const savedFilters = getSavedFilters();
      if (savedFilters) {
        hasPerformedInitialCaregiverSearch.current = true;
        setInitialCaregiverFilters(savedFilters);
        setIsLoadingSavedCaregiverSearch(true);
        performCaregiverSearch(savedFilters);
      }
    } else if (isCaregiver && !hasPerformedInitialFamilySearch.current) {
      const savedFilters = getSavedFamilyFilters();
      if (savedFilters) {
        hasPerformedInitialFamilySearch.current = true;
        setInitialFamilyFilters(savedFilters);
        setIsLoadingSavedFamilySearch(true);
        performFamilySearch(savedFilters);
      }
    }
  }, [user]);

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

  const performCaregiverSearch = useCallback(async (filters: {
    address: string;
    radius_km: number;
    max_hourly_rate?: number;
    preferred_languages: string[];
  }) => {
    setIsLoadingCaregivers(true);
    setCaregiverError(null);

    try {
      const coords = await geocodeAddress(filters.address);
      
      if (typeof coords.lat !== 'number' || typeof coords.lng !== 'number' ||
          isNaN(coords.lat) || isNaN(coords.lng)) {
        throw new Error('No se pudieron obtener coordenadas válidas para la dirección');
      }
      
      setCaregiverSearchCenter(coords);
      setCaregiverSearchRadius(filters.radius_km);

      const searchResults = await searchApi.searchCaregivers({
        latitude: coords.lat,
        longitude: coords.lng,
        radius_km: filters.radius_km,
        max_hourly_rate: filters.max_hourly_rate,
        preferred_languages: filters.preferred_languages,
      });

      setCaregiverResults(searchResults);
      setHasSearchedCaregivers(true);
    } catch (err: any) {
      setCaregiverError(err.response?.data?.error?.message || err.message || 'Error en la búsqueda');
    } finally {
      setIsLoadingCaregivers(false);
      setIsLoadingSavedCaregiverSearch(false);
    }
  }, []);

  const handleCaregiverSearch = (filters: {
    address: string;
    radius_km: number;
    max_hourly_rate?: number;
    preferred_languages: string[];
  }) => {
    performCaregiverSearch(filters);
  };

  const performFamilySearch = useCallback(async (filters: {
    address: string;
    radius_km: number;
    preferred_languages: string[];
    max_children_count?: number;
  }) => {
    setIsLoadingFamilies(true);
    setFamilyError(null);

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
      setFamilyError(err.response?.data?.error?.message || err.message || 'Error en la búsqueda');
    } finally {
      setIsLoadingFamilies(false);
      setIsLoadingSavedFamilySearch(false);
    }
  }, []);

  const handleFamilySearch = (filters: {
    address: string;
    radius_km: number;
    preferred_languages: string[];
    max_children_count?: number;
  }) => {
    performFamilySearch(filters);
  };

  if (isFamily) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </button>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-linear-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                Buscar Cuidadores
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
              onSearch={handleCaregiverSearch} 
              isLoading={isLoadingCaregivers} 
              initialFilters={initialCaregiverFilters}
            />
          </div>

          <div className="lg:col-span-2">
            <CaregiverSearchResults
              results={caregiverResults}
              isLoading={isLoadingCaregivers}
              isLoadingSaved={isLoadingSavedCaregiverSearch}
              hasSearched={hasSearchedCaregivers}
              searchCenter={caregiverSearchCenter}
              searchRadius={caregiverSearchRadius}
              error={caregiverError}
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
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al panel
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-linear-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                Buscar Familias
              </h1>
            </div>
          </div>
        </div>
        <p className="text-text-secondary text-lg max-w-2xl mt-4">
          Encuentra familias cercanas que necesiten tus servicios de cuidado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar con filtros */}
        <div className="lg:col-span-1">
          <FamilySearchFilters 
            onSearch={handleFamilySearch}
            isLoading={isLoadingFamilies}
            initialFilters={initialFamilyFilters}
          />
        </div>

        {/* Resultados */}
        <div className="lg:col-span-2">
          <FamilySearchResults
            results={familyResults}
            isLoading={isLoadingFamilies}
            isLoadingSaved={isLoadingSavedFamilySearch}
            hasSearched={hasSearchedFamilies}
            searchCenter={familySearchCenter}
            searchRadius={familySearchRadius}
            error={familyError}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
