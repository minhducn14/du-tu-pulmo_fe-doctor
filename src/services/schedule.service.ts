import api from './api';
import type {
  DoctorSchedule,
  CreateScheduleDto,
  UpdateScheduleDto,
  CreateFlexibleScheduleDto,
  CreateTimeOffDto,
  GenerateSlotsDto,
} from '@/types/schedule';
import type { TimeSlot } from '@/types/timeslot';

const mapSchedule = (schedule: DoctorSchedule): DoctorSchedule => ({
  ...schedule,
  minimumBookingDays:
    typeof schedule.minimumBookingTime === 'number'
      ? Math.floor(schedule.minimumBookingTime / (24 * 60))
      : schedule.minimumBookingDays,
});

export const scheduleService = {
  // Get all schedules
  getSchedules: async (doctorId: string): Promise<DoctorSchedule[]> => {
    const response = await api.get<DoctorSchedule[]>(
      `/doctors/${doctorId}/schedules`
    );
    
    return response.data.map(mapSchedule);
  },

  // Get regular schedules
  getRegularSchedules: async (doctorId: string): Promise<DoctorSchedule[]> => {
    const response = await api.get<DoctorSchedule[]>(
      `/doctors/${doctorId}/schedules/regular`
    );
    return response.data.map(mapSchedule);
  },

  // Get flexible schedules
  getFlexibleSchedules: async (doctorId: string): Promise<DoctorSchedule[]> => {
    const response = await api.get<DoctorSchedule[]>(
      `/doctors/${doctorId}/schedules/flexible`
    );
    return response.data.map(mapSchedule);
  },

  // Get time-off schedules
  getTimeOffSchedules: async (doctorId: string): Promise<DoctorSchedule[]> => {
    const response = await api.get<DoctorSchedule[]>(
      `/doctors/${doctorId}/schedules/time-off`
    );
    return response.data.map(mapSchedule);
  },

  // Create regular schedule
  createRegularSchedule: async (
    doctorId: string,
    data: CreateScheduleDto
  ): Promise<DoctorSchedule> => {
    const response = await api.post<DoctorSchedule>(
      `/doctors/${doctorId}/schedules/regular`,
      data
    );
    return response.data;
  },

  // Bulk create regular schedules
  bulkCreateRegularSchedules: async (
    doctorId: string,
    schedules: CreateScheduleDto[]
  ): Promise<DoctorSchedule[]> => {
    const response = await api.post<DoctorSchedule[]>(
      `/doctors/${doctorId}/schedules/regular/bulk`,
      { schedules }
    );
    return response.data;
  },

  // Bulk update regular schedules
  bulkUpdateRegularSchedules: async (
    doctorId: string,
    schedules: UpdateScheduleDto[]
  ): Promise<DoctorSchedule[]> => {
    const response = await api.patch<{ updatedSchedules: DoctorSchedule[] }>(
      `/doctors/${doctorId}/schedules/regular/bulk`,
      { schedules }
    );
    return response.data.updatedSchedules;
  },

  // Create flexible schedule
  createFlexibleSchedule: async (
    doctorId: string,
    data: CreateFlexibleScheduleDto
  ): Promise<DoctorSchedule> => {
    const response = await api.post<DoctorSchedule>(
      `/doctors/${doctorId}/schedules/flexible`,
      data
    );
    return response.data;
  },

  // Create time-off
  createTimeOff: async (
    doctorId: string,
    data: CreateTimeOffDto
  ): Promise<DoctorSchedule> => {
    const response = await api.post<DoctorSchedule>(
      `/doctors/${doctorId}/schedules/time-off`,
      data
    );
    return response.data;
  },

  // Update regular schedule
  updateRegularSchedule: async (
    doctorId: string,
    id: string,
    data: UpdateScheduleDto
  ): Promise<DoctorSchedule> => {
    const response = await api.patch<DoctorSchedule>(
      `/doctors/${doctorId}/schedules/regular/${id}`,
      data
    );
    return mapSchedule(response.data);
  },

  // Update flexible schedule
  updateFlexibleSchedule: async (
    doctorId: string,
    id: string,
    data: Partial<CreateFlexibleScheduleDto>
  ): Promise<DoctorSchedule> => {
    const response = await api.patch<DoctorSchedule>(
      `/doctors/${doctorId}/schedules/flexible/${id}`,
      data
    );
    return mapSchedule(response.data);
  },

  // Update time-off
  updateTimeOff: async (
    doctorId: string,
    id: string,
    data: Partial<CreateTimeOffDto>
  ): Promise<DoctorSchedule> => {
    const response = await api.patch<DoctorSchedule>(
      `/doctors/${doctorId}/schedules/time-off/${id}`,
      data
    );
    return mapSchedule(response.data);
  },

  // Delete regular schedule
  deleteRegularSchedule: async (doctorId: string, id: string): Promise<void> => {
    await api.delete(`/doctors/${doctorId}/schedules/regular/${id}`);
  },

  // Delete flexible schedule
  deleteFlexibleSchedule: async (doctorId: string, id: string): Promise<void> => {
    await api.delete(`/doctors/${doctorId}/schedules/flexible/${id}`);
  },

  // Delete time-off
  deleteTimeOff: async (doctorId: string, id: string): Promise<void> => {
    await api.delete(`/doctors/${doctorId}/schedules/time-off/${id}`);
  },

  // Generate slots for doctor
  generateSlotsForDoctor: async (
    doctorId: string,
    data: GenerateSlotsDto
  ): Promise<TimeSlot[]> => {
    const response = await api.post<TimeSlot[]>(
      `/doctors/${doctorId}/schedules/generate-slots`,
      data
    );
    return response.data;
  },

  // Generate slots (BE chỉ hỗ trợ theo bác sĩ)
  generateSlotsFromSchedule: async (
    doctorId: string,
    data: GenerateSlotsDto
  ): Promise<TimeSlot[]> => {
    return scheduleService.generateSlotsForDoctor(doctorId, data);
  },
};
