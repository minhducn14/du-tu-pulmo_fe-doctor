import { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TimeSlot } from '@/types/timeslot';
import { AppointmentType } from '@/lib/constants';
import { useGetWeeklySlots } from '@/hooks/use-time-slots';

interface WeeklySlotCalendarProps {
    doctorId: string;
}

const DAYS_OF_WEEK = [
    { value: 1, label: 'Thứ 2' },
    { value: 2, label: 'Thứ 3' },
    { value: 3, label: 'Thứ 4' },
    { value: 4, label: 'Thứ 5' },
    { value: 5, label: 'Thứ 6' },
    { value: 6, label: 'Thứ 7' },
    { value: 0, label: 'Chủ nhật' },
];

/**
 * Component hiển thị lịch làm việc (TimeSlots) theo tuần.
 * Sử dụng TanStack Query để lấy dữ liệu song song cho từng ngày trong tuần.
 */
export function WeeklySlotCalendar({ doctorId }: WeeklySlotCalendarProps) {
    // State quản lý ngày bắt đầu của tuần hiện tại
    const [currentWeekStart, setCurrentWeekStart] = useState(() =>
        startOfWeek(new Date(), { weekStartsOn: 1 })
    );

    // State quản lý ngày đang được mở rộng (chi tiết)
    const [expandedDay, setExpandedDay] = useState<number | null>(null);

    // Tính toán danh sách các ngày trong tuần hiện tại (7 ngày)
    const weekDates = useMemo(() => {
        return DAYS_OF_WEEK.map((_, index) => addDays(currentWeekStart, index));
    }, [currentWeekStart]);

    // Lấy dữ liệu slots cho cả tuần bằng custom hook (sử dụng useQueries)
    // Hook này sẽ fetch song song API cho từng ngày
    const slotQueries = useGetWeeklySlots(doctorId, weekDates);

    // Tổng hợp tất cả slots từ các queries thành một mảng duy nhất
    const slots = useMemo(() => {
        return slotQueries.reduce((acc, query) => {
            if (query.data) {
                acc.push(...query.data);
            }
            return acc;
        }, [] as TimeSlot[]);
    }, [slotQueries]);

    // Kiểm tra xem có query nào đang loading không
    const loading = slotQueries.some(q => q.isLoading);

    /**
     * Nhóm slots theo ngày để hiển thị trên Calendar
     */
    const slotsByDay = useMemo(() => {
        const grouped: Record<string, TimeSlot[]> = {};

        // Khởi tạo object rỗng cho mỗi ngày trong tuần
        weekDates.forEach(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            grouped[dateStr] = [];
        });

        // Phân loại slots vào các ngày tương ứng
        slots.forEach(slot => {
            const slotDate = format(new Date(slot.startTime), 'yyyy-MM-dd');
            if (grouped[slotDate]) {
                grouped[slotDate].push(slot);
            }
        });

        // Sắp xếp slots trong mỗi ngày theo thời gian bắt đầu
        Object.keys(grouped).forEach(date => {
            grouped[date].sort((a, b) =>
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            );
        });

        return grouped;
    }, [slots, weekDates]);

    /**
     * Phân nhóm slots theo buổi (Sáng, Chiều, Tối)
     */
    const groupSlotsByPeriod = (daySlots: TimeSlot[]) => {
        const morning: TimeSlot[] = [];
        const afternoon: TimeSlot[] = [];
        const evening: TimeSlot[] = [];

        daySlots.forEach(slot => {
            const hour = new Date(slot.startTime).getHours();
            if (hour < 12) morning.push(slot);
            else if (hour < 17) afternoon.push(slot);
            else evening.push(slot);
        });

        return { morning, afternoon, evening };
    };

    // Chuyển sang tuần trước
    const handlePrevWeek = () => {
        setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    };

    // Chuyển sang tuần sau
    const handleNextWeek = () => {
        setCurrentWeekStart(addWeeks(currentWeekStart, 1));
    };

    // Helper: Lấy màu sắc dựa trên loại lịch hẹn
    const getAppointmentTypeColor = (type?: string) => {
        switch (type) {
            case AppointmentType.IN_CLINIC:
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case AppointmentType.VIDEO:
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    // Helper: Format thời gian hiển thị (HH:mm - HH:mm)
    const formatSlotTime = (slot: TimeSlot) => {
        const start = format(new Date(slot.startTime), 'HH:mm');
        const end = format(new Date(slot.endTime), 'HH:mm');
        return `${start} - ${end}`;
    };

    // Text hiển thị khoảng thời gian của tuần
    const weekRangeText = `${format(currentWeekStart, 'dd/MM')} - ${format(addDays(currentWeekStart, 6), 'dd/MM/yyyy')}`;

    return (
        <div className="bg-white rounded-lg border shadow-sm">
            {/* Header: Điều hướng tuần và chú thích */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handlePrevWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">{weekRangeText}</span>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleNextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Legend: Chú thích màu sắc */}
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-blue-500"></span>
                        <span>Khám tại phòng khám</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-green-500"></span>
                        <span>Tư vấn trực tuyến</span>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
            )}

            {/* Week Grid: Hiển thị 7 ngày */}
            {!loading && (
                <div className="grid grid-cols-7 divide-x">
                    {weekDates.map((date, index) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const daySlots = slotsByDay[dateStr] || [];
                        const isToday = isSameDay(date, new Date());
                        const isExpanded = expandedDay === index;
                        const periods = groupSlotsByPeriod(daySlots);

                        return (
                            <div key={dateStr} className="min-h-[400px]">
                                {/* Day Header: Tên thứ, ngày và badge số lượng slot */}
                                <div className={cn(
                                    "p-3 text-center border-b cursor-pointer transition-colors",
                                    isToday
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-50 hover:bg-gray-100",
                                    index === 6 && !isToday && "bg-blue-50"
                                )}
                                    onClick={() => setExpandedDay(isExpanded ? null : index)}
                                >
                                    <div className="font-medium">{DAYS_OF_WEEK[index].label}</div>
                                    <div className={cn(
                                        "text-sm",
                                        isToday ? "text-blue-100" : "text-gray-500"
                                    )}>
                                        {format(date, 'dd/MM')}
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            "mt-1",
                                            isToday ? "bg-blue-500 text-white" : "",
                                            daySlots.length === 0 && "opacity-50"
                                        )}
                                    >
                                        {daySlots.length} slot
                                    </Badge>
                                </div>

                                {/* Slots Content: Danh sách các slots */}
                                <div className="p-2 space-y-2 max-h-[350px] overflow-y-auto">
                                    {daySlots.length === 0 ? (
                                        <div className="text-center text-gray-400 text-xs py-4">
                                            Không có slot
                                        </div>
                                    ) : (
                                        <>
                                            {/* Buổi Sáng */}
                                            {periods.morning.length > 0 && (
                                                <div className="space-y-1">
                                                    <div className="text-xs text-amber-600 font-medium px-1">
                                                        Sáng ({periods.morning.length})
                                                    </div>
                                                    {periods.morning.map(slot => (
                                                        <div
                                                            key={slot.id}
                                                            className={cn(
                                                                "p-2 rounded text-xs border",
                                                                getAppointmentTypeColor(slot.appointmentType)
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                <span>{formatSlotTime(slot)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-1 opacity-75">
                                                                <Users className="w-3 h-3" />
                                                                <span>{slot.bookedCount}/{slot.capacity}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Buổi Chiều */}
                                            {periods.afternoon.length > 0 && (
                                                <div className="space-y-1">
                                                    <div className="text-xs text-orange-600 font-medium px-1">
                                                        Chiều ({periods.afternoon.length})
                                                    </div>
                                                    {periods.afternoon.map(slot => (
                                                        <div
                                                            key={slot.id}
                                                            className={cn(
                                                                "p-2 rounded text-xs border",
                                                                getAppointmentTypeColor(slot.appointmentType)
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                <span>{formatSlotTime(slot)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-1 opacity-75">
                                                                <Users className="w-3 h-3" />
                                                                <span>{slot.bookedCount}/{slot.capacity}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Buổi Tối */}
                                            {periods.evening.length > 0 && (
                                                <div className="space-y-1">
                                                    <div className="text-xs text-indigo-600 font-medium px-1">
                                                        Tối ({periods.evening.length})
                                                    </div>
                                                    {periods.evening.map(slot => (
                                                        <div
                                                            key={slot.id}
                                                            className={cn(
                                                                "p-2 rounded text-xs border",
                                                                getAppointmentTypeColor(slot.appointmentType)
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                <span>{formatSlotTime(slot)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-1 opacity-75">
                                                                <Users className="w-3 h-3" />
                                                                <span>{slot.bookedCount}/{slot.capacity}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
