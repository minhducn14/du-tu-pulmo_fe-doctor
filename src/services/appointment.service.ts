import api from './api';
import type { ApiResponse } from '@/types/apiresponse';
import type {
    Appointment, AppointmentQuery, AppointmentStatus, PaginatedAppointment, DoctorQueueDto, CheckInByNumberDto,
    CreateAppointmentDto, CancelAppointmentDto, RescheduleAppointmentDto, CompleteExaminationDto,
    VideoCallJoinResponse, VideoCallStatus, AppointmentStatistics, UserCallStatus
} from '@/types/appointment';
import type { CreatePrescriptionDto, UpdateMedicalRecordDtoForEncounter, MedicalRecord } from '@/types/medical';
import type { DashboardStats, DashboardPeriod } from '@/types/dashboard';
const BASE_URL = '/appointments';

export const appointmentService = {
    getAll: async (params?: AppointmentQuery) => {
        const response = await api.get<ApiResponse<PaginatedAppointment>>(`${BASE_URL}`, { params });
        return response.data as unknown as PaginatedAppointment;
    },

    getAppointments: async (params?: AppointmentQuery) => {
        const response = await api.get<ApiResponse<PaginatedAppointment>>(`${BASE_URL}/my/doctor`, { params });
        return response.data as unknown as PaginatedAppointment;
    },

    searchAppointments: async (params?: AppointmentQuery) => {
        const response = await api.get<ApiResponse<PaginatedAppointment>>(`${BASE_URL}`, { params });
        return response.data as unknown as PaginatedAppointment;
    },

    getDetail: async (id: string) => {
        const response = await api.get<ApiResponse<Appointment>>(`${BASE_URL}/${id}`);
        return response.data as unknown as Appointment;
    },

    checkIn: async (id: string) => {
        const response = await api.post<ApiResponse<Appointment>>(`${BASE_URL}/${id}/check-in`);
        return response.data as unknown as Appointment;
    },

    updateStatus: async (id: string, status: AppointmentStatus) => {
        const response = await api.put<ApiResponse<Appointment>>(`${BASE_URL}/${id}/status`, { status });
        return response.data as unknown as Appointment;
    },

    getMyQueue: async () => {
        const response = await api.get<ApiResponse<DoctorQueueDto>>(`${BASE_URL}/my/doctor/queue`);
        return response.data as unknown as DoctorQueueDto;
    },

    getDoctorQueue: async (doctorId: string) => {
        const response = await api.get<ApiResponse<DoctorQueueDto>>(`${BASE_URL}/doctor/${doctorId}/queue`);
        return response.data as unknown as DoctorQueueDto;
    },

    checkInByNumber: async (data: CheckInByNumberDto) => {
        const response = await api.post<ApiResponse<Appointment>>(`${BASE_URL}/check-in-by-number`, data);
        return response.data as unknown as Appointment;
    },

    checkInVideo: async (id: string) => {
        const response = await api.post<ApiResponse<Appointment>>(`${BASE_URL}/${id}/check-in/video`);
        return response.data as unknown as Appointment;
    },

    getCheckedInPatients: async () => {
        const response = await api.get<ApiResponse<Appointment[]>>(`${BASE_URL}/my/doctor/checked-in`);
        return response.data as unknown as Appointment[];
    },

    getMyStatistics: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const response = await api.get<ApiResponse<AppointmentStatistics>>(`${BASE_URL}/my/doctor/statistics?${params.toString()}`);
        return response.data as unknown as AppointmentStatistics;
    },

    getMyPatientStatistics: async () => {
        const response = await api.get<ApiResponse<AppointmentStatistics>>(`${BASE_URL}/my/patient/statistics`);
        return response.data as unknown as AppointmentStatistics;
    },

    create: async (dto: CreateAppointmentDto) => {
        const response = await api.post<ApiResponse<Appointment>>(`${BASE_URL}`, dto);
        return response.data as unknown as Appointment;
    },

    // ============================================
    // Examination Flow
    // ============================================
    startExamination: async (id: string) => {
        const response = await api.post<ApiResponse<Appointment>>(`${BASE_URL}/${id}/start-examination`);
        return response.data as unknown as Appointment;
    },

    completeExamination: async (id: string, dto: CompleteExaminationDto) => {
        const response = await api.post<ApiResponse<Appointment>>(`${BASE_URL}/${id}/complete-examination`, dto);
        return response.data as unknown as Appointment;
    },

    updateMedicalRecord: async (id: string, dto: UpdateMedicalRecordDtoForEncounter) => {
        const response = await api.put<ApiResponse<MedicalRecord>>(`${BASE_URL}/${id}/medical-record`, dto);
        return response.data as unknown as MedicalRecord;
    },

    updateClinicalInfo: async (id: string, data: any) => {
        const response = await api.patch<ApiResponse<Appointment>>(`${BASE_URL}/${id}/clinical`, data);
        return response.data as unknown as Appointment;
    },

    // ============================================
    // Full CRUD & Status Management
    // ============================================
    cancel: async (id: string, dto: CancelAppointmentDto) => {
        const response = await api.put<ApiResponse<Appointment>>(`${BASE_URL}/${id}/cancel`, dto);
        return response.data as unknown as Appointment;
    },

    reschedule: async (id: string, dto: RescheduleAppointmentDto) => {
        const response = await api.put<ApiResponse<Appointment>>(`${BASE_URL}/${id}/reschedule`, dto);
        return response.data as unknown as Appointment;
    },

    confirmPayment: async (id: string, data: { paymentId: string; paidAmount?: string }) => {
        const response = await api.post<ApiResponse<Appointment>>(`${BASE_URL}/${id}/payment/confirm`, data);
        return response.data as unknown as Appointment;
    },

    getMyAppointmentsAsDoctor: async (params?: AppointmentQuery) => {
        const response = await api.get<ApiResponse<PaginatedAppointment>>(`${BASE_URL}/my/doctor`, { params });
        return response.data as unknown as PaginatedAppointment;
    },

    getMyAppointmentsAsPatient: async (params?: AppointmentQuery) => {
        const response = await api.get<ApiResponse<PaginatedAppointment>>(`${BASE_URL}/my/patient`, { params });
        return response.data as unknown as PaginatedAppointment;
    },

    // ============================================
    // Video Call
    // ============================================
    getVideoStatus: async (id: string) => {
        const response = await api.get<ApiResponse<VideoCallStatus>>(`${BASE_URL}/${id}/video/status`);
        return response.data as unknown as VideoCallStatus;
    },

    joinVideo: async (id: string) => {
        const response = await api.post<ApiResponse<VideoCallJoinResponse>>(`${BASE_URL}/${id}/video/join`);
        return response.data as unknown as VideoCallJoinResponse;
    },

    leaveVideo: async (id: string) => {
        await api.post(`${BASE_URL}/${id}/video/leave`);
    },

    getMyCallStatus: async () => {
        const response = await api.get<ApiResponse<UserCallStatus>>(`${BASE_URL}/me/call-status`);
        return response.data as unknown as UserCallStatus;
    },

    // ============================================
    // Calendar
    // ============================================
    getCalendar: async (doctorId: string, startDate: string, endDate: string) => {
        const response = await api.get<ApiResponse<Appointment[]>>(`${BASE_URL}/doctor/${doctorId}/calendar`, {
            params: { startDate, endDate }
        });
        return response.data as unknown as Appointment[];
    },

    getMyCalendar: async (startDate: string, endDate: string) => {
        const response = await api.get<ApiResponse<Appointment[]>>(`${BASE_URL}/my/doctor/calendar`, {
            params: { startDate, endDate }
        });
        return response.data as unknown as Appointment[];
    },

    // ============================================
    // Prescription
    // ============================================
    createPrescription: async (id: string, dto: CreatePrescriptionDto) => {
        const response = await api.post<ApiResponse<any>>(`${BASE_URL}/${id}/prescriptions`, dto);
        return response.data;
    },

    // ============================================
    // Dashboard Stats
    // ============================================
    getMyDashboard: async (period: DashboardPeriod = 'today') => {
        const response = await api.get<ApiResponse<DashboardStats>>(`${BASE_URL}/my/doctor/dashboard`, {
            params: { period },
        });
        return response.data as unknown as DashboardStats;
    },
};

