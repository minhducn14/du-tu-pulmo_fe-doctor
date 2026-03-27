import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleService } from "@/services/schedule.service";
import type {
  CreateScheduleDto,
  UpdateScheduleDto,
  CreateFlexibleScheduleDto,
  CreateTimeOffDto,
  GenerateSlotsDto,
} from "@/types/schedule";
import { TIME_SLOT_KEYS } from './use-time-slots';

// Keys for React Query cache management
export const SCHEDULE_KEYS = {
  all: ["schedules"] as const,
  list: (doctorId: string) => [...SCHEDULE_KEYS.all, "list", doctorId] as const,
  regular: (doctorId: string) =>
    [...SCHEDULE_KEYS.list(doctorId), "regular"] as const,
  flexible: (doctorId: string) =>
    [...SCHEDULE_KEYS.list(doctorId), "flexible"] as const,
  timeOff: (doctorId: string) =>
    [...SCHEDULE_KEYS.list(doctorId), "timeOff"] as const,
};

/**
 * Hook to fetch all schedules for a doctor.
 * @param doctorId - The ID of the doctor
 */
export function useGetSchedules(doctorId: string) {
  return useQuery({
    queryKey: SCHEDULE_KEYS.list(doctorId),
    queryFn: () => scheduleService.getSchedules(doctorId),
    enabled: !!doctorId,
    refetchOnWindowFocus: true, // Auto refetch when window gets focus
    refetchInterval: 60000, // Auto polling every 1 minute
  });
}

/**
 * Hook to fetch ONLY regular schedules for a doctor.
 * @param doctorId - The ID of the doctor
 */
export function useGetRegularSchedules(doctorId: string) {
  return useQuery({
    queryKey: SCHEDULE_KEYS.regular(doctorId),
    queryFn: () => scheduleService.getRegularSchedules(doctorId),
    enabled: !!doctorId,
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
  });
}

/**
 * Hook to fetch ONLY flexible schedules for a doctor.
 * @param doctorId - The ID of the doctor
 */
export function useGetFlexibleSchedules(doctorId: string) {
  return useQuery({
    queryKey: SCHEDULE_KEYS.flexible(doctorId),
    queryFn: () => scheduleService.getFlexibleSchedules(doctorId),
    enabled: !!doctorId,
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
  });
}

/**
 * Hook to fetch ONLY time-off schedules for a doctor.
 * @param doctorId - The ID of the doctor
 */
export function useGetTimeOffSchedules(doctorId: string) {
  return useQuery({
    queryKey: SCHEDULE_KEYS.timeOff(doctorId),
    queryFn: () => scheduleService.getTimeOffSchedules(doctorId),
    enabled: !!doctorId,
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
  });
}

/**
 * Hook to create a new Regular Schedule via API.
 * Invalidates schedule list query on success.
 */
export function useCreateRegularSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      data,
    }: {
      doctorId: string;
      data: CreateScheduleDto;
    }) => scheduleService.createRegularSchedule(doctorId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_KEYS.list(variables.doctorId),
      });
    },
  });
}

/**
 * Hook to BULK create Regular Schedules via API.
 * Useful for saving multiple schedule configurations at once.
 * Invalidates schedule list query on success.
 */
export function useBulkCreateRegularSchedules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      schedules,
    }: {
      doctorId: string;
      schedules: CreateScheduleDto[];
    }) => scheduleService.bulkCreateRegularSchedules(doctorId, schedules),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_KEYS.list(variables.doctorId),
      });
    },
  });
}

/**
 * Hook to BULK update Regular Schedules via API.
 * Invalidates schedule list query on success.
 */
export function useBulkUpdateRegularSchedules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      schedules,
    }: {
      doctorId: string;
      schedules: UpdateScheduleDto[];
    }) => scheduleService.bulkUpdateRegularSchedules(doctorId, schedules),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_KEYS.list(variables.doctorId),
      });
    },
  });
}

/**
 * Hook to create a Flexible Schedule via API.
 * Invalidates schedule list query on success.
 */
export function useCreateFlexibleSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      data,
    }: {
      doctorId: string;
      data: CreateFlexibleScheduleDto;
    }) => scheduleService.createFlexibleSchedule(doctorId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_KEYS.list(variables.doctorId),
      });
    },
  });
}

/**
 * Hook to create a Time Off entry via API.
 * Invalidates schedule list query on success.
 */
export function useCreateTimeOff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      data,
    }: {
      doctorId: string;
      data: CreateTimeOffDto;
    }) => scheduleService.createTimeOff(doctorId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_KEYS.list(variables.doctorId),
      });
    },
  });
}

/**
 * Hook to update an existing Regular Schedule via API.
 * Invalidates schedule list query on success.
 */
export function useUpdateRegularSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      id,
      data,
    }: {
      doctorId: string;
      id: string;
      data: UpdateScheduleDto;
    }) => scheduleService.updateRegularSchedule(doctorId, id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_KEYS.list(variables.doctorId),
      });
    },
  });
}

/**
 * Hook to update an existing Flexible Schedule via API.
 * Invalidates schedule list query on success.
 */
export function useUpdateFlexibleSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      id,
      data,
    }: {
      doctorId: string;
      id: string;
      data: Partial<CreateFlexibleScheduleDto>;
    }) => scheduleService.updateFlexibleSchedule(doctorId, id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_KEYS.list(variables.doctorId),
      });
    },
  });
}

/**
 * Hook to update an existing Time Off schedule via API.
 * Invalidates schedule list query on success.
 */
export function useUpdateTimeOff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      id,
      data,
    }: {
      doctorId: string;
      id: string;
      data: Partial<CreateTimeOffDto>;
    }) => scheduleService.updateTimeOff(doctorId, id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_KEYS.list(variables.doctorId),
      });
    },
  });
}

/**
 * Hook to delete a Regular Schedule via API.
 * Invalidates schedule list query on success.
 */
export function useDeleteRegularSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ doctorId, id }: { doctorId: string; id: string }) =>
      scheduleService.deleteRegularSchedule(doctorId, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_KEYS.list(variables.doctorId),
      });
    },
  });
}

/**
 * Hook to delete a Flexible Schedule via API.
 * Invalidates schedule list query on success.
 */
export function useDeleteFlexibleSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ doctorId, id }: { doctorId: string; id: string }) =>
      scheduleService.deleteFlexibleSchedule(doctorId, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_KEYS.list(variables.doctorId),
      });
    },
  });
}

/**
 * Hook to delete a Time Off schedule via API.
 * Invalidates schedule list query on success.
 */
export function useDeleteTimeOff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ doctorId, id }: { doctorId: string; id: string }) =>
      scheduleService.deleteTimeOff(doctorId, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_KEYS.list(variables.doctorId),
      });
    },
  });
}

/**
 * Hook to trigger Generation of Slots for a doctor based on schedules.
 */
export function useGenerateSlots() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      data,
    }: {
      doctorId: string;
      data: GenerateSlotsDto;
    }) => scheduleService.generateSlotsForDoctor(doctorId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: TIME_SLOT_KEYS.list(variables.doctorId) });
    },
  });
}
