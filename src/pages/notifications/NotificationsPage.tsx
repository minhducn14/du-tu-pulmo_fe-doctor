import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from '@/hooks/use-notifications';
import { Bell, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import type { NotificationItem } from '@/types/notification';
import { toast } from 'sonner';

const formatRelativeTime = (date?: string) => {
  if (!date) return '';
  const created = new Date(date).getTime();
  const now = Date.now();
  const diffMins = Math.max(1, Math.floor((now - created) / 60000));
  if (diffMins < 60) return `${diffMins} phút trước`;
  const hours = Math.floor(diffMins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

const getIcon = (type: string) => {
  switch (type) {
    case 'APPOINTMENT':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'SYSTEM':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications({ page: 1, limit: 50 });
  const markAll = useMarkAllAsRead();
  const markOne = useMarkAsRead();
  const notifications = data?.items || [];

  const handleReadAll = async () => {
    await markAll.mutateAsync();
    toast.success('Đã đánh dấu tất cả là đã đọc');
  };

  const handleReadOne = async (item: NotificationItem) => {
    if (item.status !== 'UNREAD') return;
    await markOne.mutateAsync(item.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thông báo"
        subtitle="Cập nhật tin tức và hoạt động mới nhất"
      />

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleReadAll}
          disabled={markAll.isPending || notifications.length === 0}
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-gray-500">Đang tải thông báo...</div>
        ) : notifications.map((item) => (
          <Card
            key={item.id}
            className={`transition-colors cursor-pointer ${
              item.status === 'UNREAD'
                ? 'bg-blue-50/50 border-blue-100'
                : 'bg-white'
            }`}
            onClick={() => handleReadOne(item)}
          >
            <CardContent className="p-4 flex gap-4">
              <div className="mt-1">{getIcon(item.type)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p
                    className={`font-medium text-sm ${
                      item.status === 'UNREAD' ? 'text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    {item.title}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{item.content}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {!isLoading && notifications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Không có thông báo nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
