import api from "./api";
import type {
  NotificationActionResponse,
  NotificationListResponse,
  NotificationQuery,
  UnreadCountResponse,
} from "@/types/notification";

export const notificationService = {
  getNotifications: async (query?: NotificationQuery): Promise<NotificationListResponse> => {
    const response = await api.get<NotificationListResponse>("/notifications", {
      params: query,
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<UnreadCountResponse>("/notifications/unread-count");
    return response.data?.count ?? 0;
  },

  markAllAsRead: async (): Promise<NotificationActionResponse> => {
    const response = await api.patch<NotificationActionResponse>("/notifications/read-all");
    return response.data;
  },

  markAsRead: async (id: string): Promise<NotificationActionResponse> => {
    const response = await api.patch<NotificationActionResponse>(`/notifications/${id}/read`);
    return response.data;
  },

  testPushNotification: async (title: string, content: string): Promise<void> => {
    await api.post("/notifications/test-push", { title, content });
  },
};

export default notificationService;
