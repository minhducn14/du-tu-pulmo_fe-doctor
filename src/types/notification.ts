export type NotificationStatus = "PENDING" | "ACTIVE" | "INACTIVE";
export type NotificationType = "GENERAL" | "PAYMENT" | "SYSTEM" | "APPOINTMENT";

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  status: NotificationStatus;
  createdAt?: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationActionResponse {
  success: boolean;
  message: string;
}
