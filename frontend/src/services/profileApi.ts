import api from './api';

export interface FamilyProfile {
  user_id: string;
  family_name: string;
  address: string;
  location: string | null;
  children_count: number;
  children_ages: number[];
  special_needs: string[];
  languages_preferred: string[];
}

export interface CaregiverProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  bio: string;
  location: string | null;
  hourly_rate: number;
  languages_spoken: string[];
  min_children_age: number;
  max_children_age: number;
  skills: string[];
  availability_radius_km: number;
  trust_score: number;
}

export interface CreateFamilyProfileDto {
  family_name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  children_count: number;
  children_ages: number[];
  special_needs: string[];
  languages_preferred: string[];
}

export interface CreateCaregiverProfileDto {
  first_name: string;
  last_name: string;
  bio?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  hourly_rate: number;
  languages_spoken: string[];
  min_children_age: number;
  max_children_age: number;
  skills: string[];
  availability_radius_km: number;
}

export const familyProfileApi = {
  create: async (data: CreateFamilyProfileDto): Promise<FamilyProfile> => {
    const response = await api.post('/family-profiles', data);
    return response.data.data;
  },

  getMe: async (): Promise<FamilyProfile> => {
    const response = await api.get('/family-profiles/me');
    return response.data.data;
  },

  update: async (data: Partial<CreateFamilyProfileDto>): Promise<FamilyProfile> => {
    const response = await api.patch('/family-profiles/me', data);
    return response.data.data;
  },
};

export const caregiverProfileApi = {
  create: async (data: CreateCaregiverProfileDto): Promise<CaregiverProfile> => {
    const response = await api.post('/caregiver-profiles', data);
    return response.data.data;
  },

  getMe: async (): Promise<CaregiverProfile> => {
    const response = await api.get('/caregiver-profiles/me');
    return response.data.data;
  },

  update: async (data: Partial<CreateCaregiverProfileDto>): Promise<CaregiverProfile> => {
    const response = await api.patch('/caregiver-profiles/me', data);
    return response.data.data;
  },

  getAll: async (): Promise<CaregiverProfile[]> => {
    const response = await api.get('/caregiver-profiles');
    return response.data.data;
  },

  getById: async (id: string): Promise<CaregiverProfile> => {
    const response = await api.get(`/caregiver-profiles/${id}`);
    return response.data.data;
  },
};
