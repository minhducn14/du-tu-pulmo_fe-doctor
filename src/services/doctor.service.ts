import api from './api';
import type { DoctorProfile, UpdateDoctorProfileDto } from '@/types/profile';

const BASE_URL = '/doctors';

export const doctorService = {
  getById: async (doctorId: string): Promise<DoctorProfile> => {
    const response = await api.get<DoctorProfile>(`${BASE_URL}/${doctorId}`);
    console.log(response.data);
    return response.data;
  },

  update: async (
    doctorId: string,
    dto: UpdateDoctorProfileDto,
  ): Promise<DoctorProfile> => {
    const response = await api.patch<DoctorProfile>(`${BASE_URL}/${doctorId}`, dto);
    return response.data;
  },

  getPublicDoctors: async (params?: any): Promise<{ items: DoctorProfile[]; meta: any }> => {
    const response = await api.get<{ items: DoctorProfile[]; meta: any }>('/public/doctors', { params });
    return response.data;
  },
};

export default doctorService;
