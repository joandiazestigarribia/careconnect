import api from './api';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Availability {
  id: string;
  caregiver_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAvailabilityDto {
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_recurring?: boolean;
  specific_date?: string;
}

export interface UpdateAvailabilityDto {
  day_of_week?: DayOfWeek;
  start_time?: string;
  end_time?: string;
  is_recurring?: boolean;
  specific_date?: string;
}

export type WeeklySchedule = Record<DayOfWeek, Availability[]>;

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 'monday', label: 'Lunes', short: 'Lun' },
  { value: 'tuesday', label: 'Martes', short: 'Mar' },
  { value: 'wednesday', label: 'Miércoles', short: 'Mié' },
  { value: 'thursday', label: 'Jueves', short: 'Jue' },
  { value: 'friday', label: 'Viernes', short: 'Vie' },
  { value: 'saturday', label: 'Sábado', short: 'Sáb' },
  { value: 'sunday', label: 'Domingo', short: 'Dom' },
];

export const availabilityApi = {
  getMyAvailability: async (): Promise<Availability[]> => {
    const response = await api.get('/availability');
    return response.data.data;
  },

  getMySchedule: async (): Promise<WeeklySchedule> => {
    const response = await api.get('/availability/schedule');
    return response.data.data;
  },

  getByCaregiver: async (caregiverId: string): Promise<Availability[]> => {
    const response = await api.get(`/availability/caregiver/${caregiverId}`);
    return response.data.data;
  },

  create: async (data: CreateAvailabilityDto): Promise<Availability> => {
    const response = await api.post('/availability', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateAvailabilityDto): Promise<Availability> => {
    const response = await api.patch(`/availability/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/availability/${id}`);
  },

  deleteAll: async (): Promise<void> => {
    await api.delete('/availability');
  },
};
