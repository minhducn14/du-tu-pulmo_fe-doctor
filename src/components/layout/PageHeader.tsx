import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PanelLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '@/lib/auth';
import { HeaderUserMenu } from '@/components/layout/HeaderUserMenu';
import { useAppStore } from '@/store/useAppStore';

interface PageHeaderProps {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    rightSlot?: React.ReactNode;
    notificationCount?: number;
    onProfile?: () => void;
    onSettings?: () => void;
    onLogout?: () => void;
    className?: string;
}

export function PageHeader({
    title,
    subtitle,
    rightSlot,
    notificationCount = 3,
    onProfile,
    onSettings,
    onLogout,
    className,
}: PageHeaderProps) {
    const { toggleSidebar } = useAppStore();
    const navigate = useNavigate();
    const user = getUser();

    const handleProfile = onProfile ?? (() => navigate('/doctor/profile'));
    const handleSettings = onSettings ?? (() => navigate('/doctor/settings'));
    const handleNotifications = () => navigate('/doctor/notifications');
    const handleLogout = onLogout ?? (() => {
        logout();
        navigate('/login');
    });

    const displayName = user?.fullName || 'Bác sĩ';

    return (
        <div className={cn('flex items-center justify-between gap-4', className)}>
            <div className="flex items-center gap-2 min-w-0">
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Đóng/mở thanh bên</span>
                </Button>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">{title}</div>
                    {subtitle ? <div className="text-sm text-gray-500">{subtitle}</div> : null}
                </div>
            </div>
            <div className="flex items-center gap-3">
                {rightSlot ? <div className="flex items-center gap-3">{rightSlot}</div> : null}
                <HeaderUserMenu
                    user={{
                        name: displayName,
                        avatarUrl: user?.avatarUrl,
                        roleLabel: user?.roles?.[0] || 'Bác sĩ',
                    }}
                    notificationCount={notificationCount}
                    onProfile={handleProfile}
                    onSettings={handleSettings}
                    onLogout={handleLogout}
                    onNotifications={handleNotifications}
                />
            </div>
        </div>
    );
}
