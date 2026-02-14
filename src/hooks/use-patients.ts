import { useQuery } from '@tanstack/react-query';
import { patientService } from '@/services/patient.service';
import type { PaginatedPatient, PatientProfile, PatientQuery } from '@/types/patient';

export const PATIENT_KEYS = {
    all: ['patients'] as const,
    list: (query?: PatientQuery) => [...PATIENT_KEYS.all, 'list', query] as const,
    profile: (id: string) => [...PATIENT_KEYS.all, 'profile', id] as const,
};

export function usePatients(query?: PatientQuery, enabled = true) {
    return useQuery<PaginatedPatient>({
        queryKey: PATIENT_KEYS.list(query),
        queryFn: () => patientService.getAll(query),
        enabled,
        staleTime: 10000,
    });
}

export function usePatientProfile(id: string | undefined) {
    return useQuery<PatientProfile>({
        queryKey: PATIENT_KEYS.profile(id!),
        queryFn: () => patientService.getProfile(id!),
        enabled: !!id,
        staleTime: 30000,
    });
}
