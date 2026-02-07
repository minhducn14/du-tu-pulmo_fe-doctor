import { useState } from 'react';
import { useGetAvailableSlots } from '@/hooks/use-time-slots';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { vi } from 'date-fns/locale';
import { TimeSlotCard } from '@/components/timeslot/TimeSlotCard';
import { TimeSlotForm } from '@/components/timeslot/TimeSlotForm';
import { timeSlotService } from '@/services/time-slot.service';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import type { TimeSlot, CreateTimeSlotDto } from '@/types/timeslot';
import { format } from 'date-fns';

export const TimeSlotsPage = () => {
    const { user } = useAppStore();
    const doctorId = user?.doctorId || '';

    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [formOpen, setFormOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

    // TanStack Query Hook
    const { data: timeSlots = [], isLoading: loading, refetch } = useGetAvailableSlots(doctorId, selectedDate);

    const handleCreate = () => {
        setSelectedSlot(null);
        setFormOpen(true);
    };

    const handleEdit = (slot: TimeSlot) => {
        setSelectedSlot(slot);
        setFormOpen(true);
    };

    const handleDelete = async (slot: TimeSlot) => {
        if (slot.bookedCount > 0) {
            toast.error('Không thể xóa slot đã có lịch hẹn');
            return;
        }

        if (!confirm('Bạn có chắc muốn xóa time slot này?')) return;

        try {
            await timeSlotService.deleteTimeSlot(doctorId, slot.id);
            toast.success('Xóa time slot thành công');
            refetch();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            toast.error(errorMessage || 'Không thể xóa time slot');
        }
    };

    const handleToggleAvailability = async (slot: TimeSlot) => {
        try {
            await timeSlotService.toggleSlotAvailability(doctorId, slot.id, {
                isAvailable: !slot.isAvailable,
            });
            toast.success(`${slot.isAvailable ? 'Tắt' : 'Bật'} khả dụng thành công`);
            refetch();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            toast.error(errorMessage || 'Không thể thay đổi trạng thái');
        }
    };

    const handleSubmit = async (data: CreateTimeSlotDto) => {
        try {
            if (selectedSlot) {
                await timeSlotService.updateTimeSlot(doctorId, selectedSlot.id, data);
                toast.success('Cập nhật time slot thành công');
            } else {
                await timeSlotService.createTimeSlot(doctorId, data);
                toast.success('Tạo time slot thành công');
            }
            setFormOpen(false);
            refetch();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            toast.error(errorMessage || 'Có lỗi xảy ra');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Quản Lý Time Slots"
                subtitle="Quản lý chi tiết các khung giờ khám trong ngày."
                rightSlot={
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo Time Slot
                    </Button>
                }
            />

            <div className="flex items-end gap-4">
                <div className="flex-1 max-w-xs space-y-2">
                    <Label htmlFor="date">Chọn ngày</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                )}
                            >

                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(new Date(selectedDate), "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate ? new Date(selectedDate) : undefined}
                                onSelect={(date) => setSelectedDate(date ? format(date, 'yyyy-MM-dd') : '')}
                                initialFocus
                                locale={vi}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {timeSlots.map((slot) => (
                    <TimeSlotCard
                        key={slot.id}
                        slot={slot}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleAvailability={handleToggleAvailability}
                    />
                ))}
            </div>

            {timeSlots.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                    Không có time slot nào cho ngày {format(new Date(selectedDate), 'dd/MM/yyyy')}
                </p>
            )}

            <TimeSlotForm
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSubmit={handleSubmit}
                slot={selectedSlot}
            />
        </div>
    );
};
