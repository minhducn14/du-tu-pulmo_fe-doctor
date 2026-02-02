export const AppointmentStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  RESCHEDULED: 'RESCHEDULED',
  PENDING_PAYMENT: 'PENDING_PAYMENT',
} as const;
export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export const AppointmentType = {
  IN_CLINIC: 'IN_CLINIC',
  VIDEO: 'VIDEO',
} as const;
export type AppointmentType = typeof AppointmentType[keyof typeof AppointmentType];

export const Gender = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
    OTHER: 'OTHER'
} as const;
export type Gender = typeof Gender[keyof typeof Gender];


export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  specialty?: string;
  avatarUrl?: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export interface Appointment {
  id: string;
  appointmentDate: string;
  status: AppointmentStatus;
  appointmentType: AppointmentType;
  patient: Patient;
  doctor: Doctor;
  timeSlot?: TimeSlot;
  reason?: string;
  notes?: string;
  feeAmount: number;
  paidAmount: number;
  meetingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentQuery {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedAppointment {
    data: Appointment[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
        limit: number;
    }
}
