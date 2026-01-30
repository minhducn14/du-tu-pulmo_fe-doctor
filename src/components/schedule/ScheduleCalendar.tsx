import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
// import { Badge } from '@/components/ui/badge';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AppointmentType, ScheduleType } from '@/lib/constants';
import type { DoctorSchedule } from '@/types/schedule';

interface ScheduleCalendarProps {
    schedules: DoctorSchedule[];
    type: ScheduleType;
    onEdit?: (schedule: DoctorSchedule) => void;
    onDelete?: (schedule: DoctorSchedule) => void;
}

export function ScheduleCalendar({ schedules, type, onEdit }: ScheduleCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }); // Monday start
        const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    const getSchedulesForDay = (day: Date) => {
        return schedules.filter(s => {
            if (s.scheduleType === ScheduleType.FLEXIBLE || s.scheduleType === ScheduleType.TIME_OFF) {
                // Determine start and end dates
                let start: Date;
                let end: Date;

                if (s.specificDate) {
                    start = new Date(s.specificDate);
                    end = new Date(s.specificDate);
                } else if (s.effectiveFrom) {
                    start = new Date(s.effectiveFrom);
                    end = s.effectiveUntil ? new Date(s.effectiveUntil) : start;
                } else {
                    return false;
                }

                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);

                const checkDay = new Date(day);
                checkDay.setHours(0, 0, 0, 0);

                if (s.scheduleType === ScheduleType.TIME_OFF) {
                    return checkDay >= start && checkDay <= end;
                }

                return isSameDay(checkDay, start);
            }
            return false;
        });
    };

    const getAppointmentTypeColor = (type: AppointmentType) => {
        switch (type) {
            case AppointmentType.IN_CLINIC: return 'bg-blue-100 text-blue-700 border-blue-200';
            case AppointmentType.VIDEO: return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getAppointmentTypeLabel = (type: AppointmentType) => {
        switch (type) {
            case AppointmentType.IN_CLINIC: return 'Lịch khám';
            case AppointmentType.VIDEO: return 'Tư vấn trực tuyến';
            default: return 'Khác';
        }
    };

    return (
        <div className="bg-white rounded-lg border shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-semibold min-w-[150px] text-center capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: vi })}
                    </span>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={goToToday} className="ml-2">
                        Hôm nay
                    </Button>
                </div>

                {/* Legend */}
                {type === ScheduleType.FLEXIBLE && (
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span>Lịch khám</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span>Lịch tư vấn trực tuyến</span>
                        </div>
                    </div>
                )}
                {type === ScheduleType.TIME_OFF && (
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></span>
                            <span>Lịch nghỉ</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 text-center border-b bg-gray-50">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                    <div key={day} className="py-2 text-sm font-medium text-gray-500">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 auto-rows-fr">
                {days.map((day) => {
                    const daySchedules = getSchedulesForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isTodayDate = isToday(day);

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "min-h-[120px] p-2 border-r border-b relative group transition-colors hover:bg-gray-50/50",
                                !isCurrentMonth && "bg-gray-50/30 text-gray-400",
                                isTodayDate && "bg-blue-50/30"
                            )}
                            role="button"
                            onClick={() => {
                                // Only trigger create if clicking empty space? 
                                // For now, maybe clicking a schedule edits it, clicking empty does nothing or opens create form?
                                // The requirement didn't specify interaction, but user likely wants to click schedule to edit.
                            }}
                        >
                            <span className={cn(
                                "text-sm font-medium flex items-center justify-center w-7 h-7 rounded-full mb-1 mx-auto",
                                isTodayDate ? "bg-blue-600 text-white" : "text-gray-700"
                            )}>
                                {format(day, 'd')}
                            </span>

                            <div className="space-y-1 mt-1">
                                {daySchedules.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit?.(schedule);
                                        }}
                                        className={cn(
                                            "text-xs p-1.5 rounded-md border cursor-pointer hover:opacity-80 transition-opacity text-left truncate flex flex-col gap-0.5",
                                            schedule.scheduleType === ScheduleType.TIME_OFF
                                                ? "bg-red-50 text-red-700 border-red-200"
                                                : getAppointmentTypeColor(schedule.appointmentType)
                                        )}
                                    >
                                        <div className="font-semibold truncate">
                                            {schedule.scheduleType === ScheduleType.TIME_OFF
                                                ? (schedule.description || 'Lịch nghỉ')
                                                : getAppointmentTypeLabel(schedule.appointmentType)
                                            }
                                        </div>
                                        <div className="flex items-center gap-1 opacity-90">
                                            <Clock className="w-3 h-3" />
                                            <span>{schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
