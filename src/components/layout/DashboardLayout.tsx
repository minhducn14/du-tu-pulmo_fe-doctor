import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAppStore } from '@/store/useAppStore';
import { useFcmToken } from '@/hooks/use-fcm-token';
import { SocketHandler } from '@/components/chat/SocketHandler';

export function DashboardLayout() {
    const { sidebarCollapsed, user } = useAppStore();
    useFcmToken(!!user);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <SocketHandler />
            <Sidebar collapsed={sidebarCollapsed} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <main className="flex-1 flex flex-col relative overflow-y-auto">
                    <div className="container mx-auto p-6 max-w-7xl flex-1 flex flex-col min-h-0">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export function useDashboardLayout() {
    const { sidebarCollapsed, toggleSidebar } = useAppStore();
    const setTitle = (title: string) => {
        document.title = title ? `${title} - Doctor Portal` : 'Doctor Portal';
    };

    return {
        sidebarCollapsed,
        toggleSidebar,
        setTitle
    };
}