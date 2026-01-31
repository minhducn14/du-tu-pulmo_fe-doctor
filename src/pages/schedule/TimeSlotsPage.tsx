import { useAppStore } from '@/store/useAppStore';
import { WeeklySlotCalendar } from '@/components/schedule/WeeklySlotCalendar';

/**
 * Trang Quản Lý Khung Giờ Khám (Time Slots)
 * - Hiển thị calendar view các slots đã được sinh ra.
 * - Cho phép bác sĩ xem trạng thái booking của từng slot.
 */
export const TimeSlotsPage = () => {
    const { user } = useAppStore();
    const doctorId = user?.id || '';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Khung Giờ Khám</h2>
                    <p className="text-muted-foreground">
                        Xem và quản lý các khung giờ khám chi tiết theo tuần.
                    </p>
                </div>
            </div>

            {/* Calendar View */}
            <div className="bg-white rounded-lg shadow-sm border p-1">
                <WeeklySlotCalendar doctorId={doctorId} />
            </div>
        </div>
    );
};
