
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Info, CheckCircle, AlertTriangle } from 'lucide-react';

export default function NotificationsPage() {
    // Mock notifications
    const notifications = [
        {
            id: 1,
            title: 'Hệ thống bảo trì',
            message: 'Hệ thống sẽ bảo trì vào lúc 22:00 ngày 15/02/2026.',
            time: '2 giờ trước',
            type: 'info',
            read: false,
        },
        {
            id: 2,
            title: 'Lịch hẹn mới',
            message: 'Bạn có lịch hẹn mới với bệnh nhân Nguyễn Văn A vào ngày mai.',
            time: '5 giờ trước',
            type: 'success',
            read: true,
        },
        {
            id: 3,
            title: 'Cập nhật chính sách',
            message: 'Chính sách bảo mật đã được cập nhật. Vui lòng xem chi tiết.',
            time: '1 ngày trước',
            type: 'warning',
            read: true,
        },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'info':
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Thông báo"
                subtitle="Cập nhật tin tức và hoạt động mới nhất"
                notificationCount={0} // Clear count when viewing
            />

            <div className="space-y-4">
                {notifications.map((item) => (
                    <Card key={item.id} className={`transition-colors ${!item.read ? 'bg-blue-50/50 border-blue-100' : 'bg-white'}`}>
                        <CardContent className="p-4 flex gap-4">
                            <div className="mt-1">{getIcon(item.type)}</div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className={`font-medium text-sm ${!item.read ? 'text-blue-900' : 'text-gray-900'}`}>
                                        {item.title}
                                    </p>
                                    <span className="text-xs text-gray-500">{item.time}</span>
                                </div>
                                <p className="text-sm text-gray-600">{item.message}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Không có thông báo nào</p>
                    </div>
                )}
            </div>
        </div>
    );
}
