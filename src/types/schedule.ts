import { AppointmentType, ScheduleType } from '@/lib/constants';

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  scheduleType: ScheduleType;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  slotCapacity: number;
  appointmentType: AppointmentType;
  minimumBookingTime: number;
  minimumBookingDays?: number;
  maxAdvanceBookingDays?: number;
  consultationFee?: string | null;
  effectiveConsultationFee?: string | null;
  description?: string | null;
  isAvailable: boolean;
  effectiveFrom?: string | null;
  effectiveUntil?: string | null;
  specificDate: string | null;
  discountPercent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleDto {
  dayOfWeek: number;
  note?: string;
  startTime: string;
  endTime: string;
  slotDuration?: number;
  slotCapacity?: number;
  appointmentType: AppointmentType;
  minimumBookingDays?: number;
  maxAdvanceBookingDays?: number;
  consultationFee?: number;
  description?: string;
  isAvailable?: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
  discountPercent?: number;  
}

export type UpdateScheduleDto = Partial<CreateScheduleDto> & { id: string };

export interface CreateFlexibleScheduleDto {
  specificDate: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  slotCapacity: number;
  appointmentType: AppointmentType;
  consultationFee?: number;
  maxAdvanceBookingDays?: number;
  discountPercent?: number;
}

export interface CreateTimeOffDto {
  specificDate: string;
  startTime: string;
  endTime: string;
  note?: string;
}

export interface GenerateSlotsDto {
  startDate: string;
  endDate: string;
}
