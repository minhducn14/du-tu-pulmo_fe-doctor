import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import reportService from '@/services/report.service';
import type { CreateReportDto } from '@/types/report';

export const REPORT_KEYS = {
  mine: ['reports', 'mine'] as const,
};

export function useMyReports() {
  return useQuery({
    queryKey: REPORT_KEYS.mine,
    queryFn: () => reportService.getMyReports(),
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateReportDto) => reportService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPORT_KEYS.mine });
    },
  });
}
