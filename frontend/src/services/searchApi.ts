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

export const searchApi = {
  searchCaregivers: async (filters: SearchFilters): Promise<SearchResult[]> => {
    const response = await api.post('/search/caregivers', filters);
    return response.data.data;
  },
};
