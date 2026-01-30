import { useQuery, useQueries } from '@tanstack/react-query';
import { timeSlotService } from '@/services/time-slot.service';
import { format } from 'date-fns';

// Keys for React Query cache management
export const TIME_SLOT_KEYS = {
    all: ['timeSlots'] as const,
    list: (doctorId: string) => [...TIME_SLOT_KEYS.all, 'list', doctorId] as const,
    available: (doctorId: string, date: string) => [...TIME_SLOT_KEYS.list(doctorId), 'available', date] as const,
};

/**
 * Hook to fetch ALL time slots for a doctor.
 * @param doctorId - The ID of the doctor
 */
export function useGetAllSlots(doctorId: string) {
    return useQuery({
        queryKey: TIME_SLOT_KEYS.list(doctorId),
        queryFn: () => timeSlotService.getAllSlots(doctorId),
        enabled: !!doctorId,
    });
}

/**
 * Hook to fetch ONLY AVAILABLE time slots for a specific date.
 * @param doctorId - The ID of the doctor
 * @param date - The date to fetch slots for (format: YYYY-MM-DD)
 */
export function useGetAvailableSlots(doctorId: string, date: string) {
    return useQuery({
        queryKey: TIME_SLOT_KEYS.available(doctorId, date),
        queryFn: () => timeSlotService.getAvailableSlots(doctorId, date),
        enabled: !!doctorId && !!date,
    });
}

/**
 * Hook to fetch available time slots for a list of dates (e.g. a week).
 * Uses useQueries for parallel fetching.
 * @param doctorId - The ID of the doctor
 * @param dates - Array of Date objects or date strings
 */
export function useGetWeeklySlots(doctorId: string, dates: Date[]) {
    return useQueries({
        queries: dates.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            return {
                queryKey: TIME_SLOT_KEYS.available(doctorId, dateStr),
                queryFn: () => timeSlotService.getAvailableSlots(doctorId, dateStr),
                enabled: !!doctorId,
            };
        }),
    });
}
