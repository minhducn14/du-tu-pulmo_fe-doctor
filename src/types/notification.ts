export type NotificationStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';
export type NotificationType =
  | 'GENERAL'
  | 'PAYMENT'
  | 'CONTRACT'
  | 'PENALTY'
  | 'SYSTEM'
  | 'APPOINTMENT';

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
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}
