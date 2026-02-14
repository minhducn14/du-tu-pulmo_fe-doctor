import { useQuery } from '@tanstack/react-query';
import { appointmentService } from '@/services/appointment.service';
import type { DashboardStats, DashboardPeriod } from '@/types/dashboard';

export const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
  stats: (period: DashboardPeriod) => [...DASHBOARD_KEYS.all, 'stats', period] as const,
};

export function useDashboardStats(period: DashboardPeriod) {
  return useQuery<DashboardStats>({
    queryKey: DASHBOARD_KEYS.stats(period),
    queryFn: () => appointmentService.getMyDashboard(period),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
