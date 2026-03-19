import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Bell, ChevronDown, Settings, User, ArrowUpRight } from 'lucide-react';

export type HeaderUser = {
    name: string;
    avatarUrl?: string;
    roleLabel?: string;
    deptLabel?: string;
};

interface HeaderUserMenuProps {
    user: HeaderUser;
    notificationCount: number;
    onProfile: () => void;
    onSettings: () => void;
    onLogout: () => void;
    onNotifications?: () => void;
    className?: string;
}

const formatBadge = (value: number) => (value > 9 ? '9+' : String(value));

export function NotificationIcon({
    count,
    onClick,
}: {
    count: number;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            className="relative h-9 w-9 rounded-full hover:bg-gray-100 text-gray-600"
            aria-label="Thông báo"
            onClick={onClick}
        >
            <Bell className="h-5 w-5" />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm z-10 animate-in zoom-in duration-300">
                    {formatBadge(count)}
                </span>
            )}
        </button>
    );
}

export function HeaderUserMenu({
    user,
    notificationCount,
    onProfile,
    onSettings,
    onLogout,
    onNotifications,
    className,
}: HeaderUserMenuProps) {
    const isMobile = useIsMobile();

    const chip = (
        <button
            type="button"
            className={cn(
                'h-9 px-2.5 rounded-full border border-gray-200 bg-white flex items-center gap-2 hover:bg-gray-50',
                className
            )}
        >
            <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    {user.name.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline truncate max-w-[160px] text-sm font-medium text-gray-800">
                {user.name}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
    );

    if (isMobile) {
        return (
            <div className="flex items-center gap-2">
                <NotificationIcon count={notificationCount} onClick={onNotifications} />
                <Sheet>
                    <SheetTrigger asChild>{chip}</SheetTrigger>
                    <SheetContent side="bottom" className="pb-6">
                        <div className="space-y-2">
                            <SheetClose asChild>
                                <button
                                    type="button"
                                    className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                                    onClick={onProfile}
                                >
                                    <User className="h-4 w-4" />
                                    Hồ sơ cá nhân
                                </button>
                            </SheetClose>
                            <SheetClose asChild>
                                <button
                                    type="button"
                                    className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                                    onClick={onSettings}
                                >
                                    <Settings className="h-4 w-4" />
                                    Cài đặt
                                </button>
                            </SheetClose>
                            <div className="h-px bg-gray-200" />
                            <SheetClose asChild>
                                <button
                                    type="button"
                                    className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                    onClick={onLogout}
                                >
                                    <ArrowUpRight className="h-4 w-4" />
                                    Đăng xuất
                                </button>
                            </SheetClose>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <NotificationIcon count={notificationCount} onClick={onNotifications} />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>{chip}</DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[180px]">
                    <DropdownMenuItem onClick={onProfile}>
                        <User className="mr-2 h-4 w-4" />
                        Hồ sơ cá nhân
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onSettings}>
                        <Settings className="mr-2 h-4 w-4" />
                        Cài đặt
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Đăng xuất
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
