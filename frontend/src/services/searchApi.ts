import api from './api';

export interface SearchFilters {
  latitude: number;
  longitude: number;
  radius_km?: number;
  preferred_languages?: string[];
  required_skills?: string[];
  child_age?: number;
  max_hourly_rate?: number;
}

export interface SearchResult {
  caregiver: {
    user_id: string;
    first_name: string;
    last_name: string;
    bio: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
    } | null;
    hourly_rate: number;
    languages_spoken: string[];
    min_children_age: number;
    max_children_age: number;
    skills: string[];
    availability_radius_km: number;
    trust_score: number;
  };
  score: number;
  distance_km: number;
}

export interface SearchFamiliesFilters {
  latitude: number;
  longitude: number;
  radius_km?: number;
  preferred_languages?: string[];
  max_children_count?: number;
}

export interface FamilySearchResult {
  family: {
    user_id: string;
    family_name: string;
    address: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
    } | null;
    children_count: number;
    children_ages: number[];
    special_needs: string[];
    languages_preferred: string[];
  };
  score: number;
  distance_km: number;
}

export const searchApi = {
  searchCaregivers: async (filters: SearchFilters): Promise<SearchResult[]> => {
    const response = await api.post('/search/caregivers', filters);
    return response.data.data;
  },
  
  searchFamilies: async (filters: SearchFamiliesFilters): Promise<FamilySearchResult[]> => {
    const response = await api.post('/search/families', filters);
    return response.data.data;
  },
};
