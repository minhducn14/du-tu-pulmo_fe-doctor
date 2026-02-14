import { useQuery } from '@tanstack/react-query';
import medicalService from '@/services/medical.service';

export const useMyRecords = () => {
  return useQuery({
    queryKey: ['medical-records', 'my'],
    queryFn: () => medicalService.getMyRecords(),
  });
};

export const useMyPrescriptions = () => {
  return useQuery({
    queryKey: ['prescriptions', 'my'],
    queryFn: () => medicalService.getMyPrescriptions(),
  });
};

export const usePatientRecords = (patientId: string) => {
  return useQuery({
    queryKey: ['medical-records', 'patient', patientId],
    queryFn: () => medicalService.getPatientRecords(patientId),
    enabled: !!patientId,
  });
};

export const usePatientPrescriptions = (patientId: string) => {
  return useQuery({
    queryKey: ['prescriptions', 'patient', patientId],
    queryFn: () => medicalService.getPatientPrescriptions(patientId),
    enabled: !!patientId,
  });
};
