import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock, Edit2 } from 'lucide-react';
import { AppointmentType, ScheduleType } from '@/lib/constants';
import type { DoctorSchedule } from '@/types/schedule';

interface RegularScheduleGridProps {
    schedules: DoctorSchedule[];
    onEdit: () => void;
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

export function RegularScheduleGrid({ schedules, onEdit }: RegularScheduleGridProps) {
    // Group schedules by dayOfWeek
    const schedulesByDay = useMemo(() => {
        const grouped: Record<number, DoctorSchedule[]> = {};
        DAYS_OF_WEEK.forEach(day => {
            grouped[day.value] = [];
        });
        schedules.forEach(schedule => {
            if (schedule.scheduleType === ScheduleType.REGULAR && grouped[schedule.dayOfWeek]) {
                grouped[schedule.dayOfWeek].push(schedule);
            }
        });
        // Sort each day's schedules by startTime
        Object.keys(grouped).forEach(day => {
            grouped[Number(day)].sort((a, b) => a.startTime.localeCompare(b.startTime));
        });
        return grouped;
    }, [schedules]);

    const getAppointmentTypeStyle = (type: AppointmentType) => {
        switch (type) {
            case AppointmentType.IN_CLINIC:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-l-4 border-l-blue-500',
                    text: 'text-blue-700',
                    label: 'Lịch khám',
                };
            case AppointmentType.VIDEO:
                return {
                    bg: 'bg-green-50',
                    border: 'border-l-4 border-l-green-500',
                    text: 'text-green-700',
                    label: 'Tư vấn trực tuyến',
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    border: 'border-l-4 border-l-gray-500',
                    text: 'text-gray-700',
                    label: 'Khác',
                };
        }
    };

    return (
        <div className="bg-white rounded-lg border shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span>Lịch khám</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span>Lịch tư vấn trực tuyến</span>
                    </div>
                </div>
                <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Điều chỉnh
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 divide-x">
                {DAYS_OF_WEEK.map(day => (
                    <div key={day.value} className="min-h-[300px]">
                        {/* Day Header */}
                        <div className={cn(
                            "p-3 text-center font-medium border-b",
                            day.value === 0 ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-700"
                        )}>
                            {day.label}
                        </div>

                        {/* Schedules */}
                        <div className="p-2 space-y-2">
                            {schedulesByDay[day.value]?.map(schedule => {
                                const style = getAppointmentTypeStyle(schedule.appointmentType);
                                return (
                                    <div
                                        key={schedule.id}
                                        className={cn(
                                            "p-2 rounded-md text-sm relative",
                                            !schedule.isAvailable ? "bg-gray-100 border-l-4 border-l-gray-400 text-gray-500 opacity-75" : [style.bg, style.border, style.text]
                                        )}
                                    >
                                        <div className="font-medium flex justify-between items-start gap-1">
                                            <span>{style.label}</span>
                                            {!schedule.isAvailable && (
                                                <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Tắt</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs opacity-80 mt-1">
                                            <Clock className="w-3 h-3" />
                                            <span className={!schedule.isAvailable ? "line-through" : ""}>
                                                {schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {schedulesByDay[day.value]?.length === 0 && (
                                <div className="text-center text-gray-400 text-sm py-4">
                                    Không có lịch
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
