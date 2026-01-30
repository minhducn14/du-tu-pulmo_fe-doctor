import { AppointmentType } from '@/lib/constants';

export interface TimeSlot {
  id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isAvailable: boolean;
  appointmentType: AppointmentType;
  consultationFee: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeSlotDto {
    startTime: string;
    endTime: string;
    capacity: number;
    appointmentType: AppointmentType;
    consultationFee: number;
    date: string;
}

export interface UpdateTimeSlotDto extends Partial<CreateTimeSlotDto> {}

export interface TimeSlotFilterDto {
    startDate?: string;
    endDate?: string;
    isAvailable?: boolean;
}
