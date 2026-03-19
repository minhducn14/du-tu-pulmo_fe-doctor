import api from './api';
import type {
  NotificationActionResponse,
  NotificationListResponse,
  UnreadCountResponse,
} from '@/types/notification';

export const notificationService = {
  getNotifications: async (page = 1, limit = 20): Promise<NotificationListResponse> => {
    const response = await api.get<NotificationListResponse>('/notifications', {
      params: { page, limit },
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data?.count ?? 0;
  },

  markAllAsRead: async (): Promise<NotificationActionResponse> => {
    const response = await api.patch<NotificationActionResponse>(
      '/notifications/read-all',
    );
    return response.data;
  },

  markAsRead: async (id: string): Promise<NotificationActionResponse> => {
    const response = await api.patch<NotificationActionResponse>(
      `/notifications/${id}/read`,
    );
    return response.data;
  },
};

export default notificationService;
