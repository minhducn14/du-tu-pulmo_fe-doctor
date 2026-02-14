import api from './api';
import type {
    PatientResponse,
    PaginatedPatient,
    PatientProfile,
    PatientQuery,
} from '@/types/patient';
import type { PaginatedAppointment } from '@/types/appointment';

const BASE_URL = '/patients';

export const patientService = {
    getAll: async (query?: PatientQuery): Promise<PaginatedPatient> => {
        const response = await api.get<PaginatedPatient>(BASE_URL, { params: query });
        return response.data;
    },

    getById: async (id: string): Promise<PatientResponse> => {
        const response = await api.get<PatientResponse>(`${BASE_URL}/${id}`);
        return response.data;
    },

    getProfile: async (id: string): Promise<PatientProfile> => {
        const response = await api.get<PatientProfile>(`${BASE_URL}/${id}/profile`);
        return response.data;
    },

    getAppointments: async (
        id: string,
        query?: { page?: number; limit?: number; status?: string },
    ): Promise<PaginatedAppointment> => {
        const response = await api.get<PaginatedAppointment>(
            `${BASE_URL}/${id}/appointments`,
            { params: query },
        );
        return response.data;
    },
};

export default patientService;
