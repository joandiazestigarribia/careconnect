import api from './api';

export interface FamilyProfile {
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
  created_at: string;
  updated_at: string;
}

export const familyApi = {
  getById: async (id: string): Promise<FamilyProfile> => {
    const response = await api.get(`/family-profiles/public/${id}`);
    return response.data.data;
  },
};
