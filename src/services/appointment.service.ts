import api from './api';
import type { ApiResponse } from '@/types/apiresponse';
import type { Appointment, AppointmentQuery, AppointmentStatus, PaginatedAppointment } from '@/types/appointment';

const BASE_URL = '/appointments';

export const appointmentService = {
    // Search / List (For Reception & Doctor)
    getAppointments: async (params?: AppointmentQuery) => {
        const response = await api.get<ApiResponse<PaginatedAppointment>>(`${BASE_URL}/my/doctor`, { params });
        return response.data.data;
    },

    // Reception: Search all (requires updated backend) or specific endpoint
    // Fallback: use getAppointments if RECEPTIONIST role is handled by backend to return all
    searchAppointments: async (params?: AppointmentQuery) => {
         // Since we updated findAll to allow RECEPTIONIST, we can use root endpoint if user is RECEPTIONIST
         // But front-end doesn't know context here easily without passing ID.
         // Let's assume we use the root endpoint which we enabled for RECEPTIONIST.
        const response = await api.get<ApiResponse<PaginatedAppointment>>(`${BASE_URL}`, { params });
        return response.data.data;
    },

    getDetail: async (id: string) => {
        const response = await api.get<ApiResponse<Appointment>>(`${BASE_URL}/${id}`);
        return response.data.data;
    },

    checkIn: async (id: string) => {
        const response = await api.post<ApiResponse<Appointment>>(`${BASE_URL}/${id}/check-in`);
        return response.data.data;
    },

    updateStatus: async (id: string, status: AppointmentStatus) => {
        const response = await api.put<ApiResponse<Appointment>>(`${BASE_URL}/${id}/status`, { status });
        return response.data.data;
    },

    getMyQueue: async () => {
        // Placeholder for dashboard stats
        return {
            totalInQueue: 0,
            inProgress: [],
        };
    },
};

