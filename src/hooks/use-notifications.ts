import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import notificationService from '@/services/notification.service';

export const NOTIFICATION_KEYS = {
  list: (page: number, limit: number) =>
    ['notifications', 'list', page, limit] as const,
  unread: ['notifications', 'unread-count'] as const,
};

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(page, limit),
    queryFn: () => notificationService.getNotifications(page, limit),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unread,
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
