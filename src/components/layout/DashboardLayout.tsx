import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAppStore } from '@/store/useAppStore';

export function DashboardLayout() {
    const { sidebarCollapsed } = useAppStore();

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar collapsed={sidebarCollapsed} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto p-6 max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export function useDashboardLayout() {
    const { sidebarCollapsed, toggleSidebar } = useAppStore();
    // Placeholder for setTitle if not in store yet, or extend store
    const setTitle = (title: string) => {
        document.title = title ? `${title} - Doctor Portal` : 'Doctor Portal';
    };

    return {
        sidebarCollapsed,
        toggleSidebar,
        setTitle
    };
}
