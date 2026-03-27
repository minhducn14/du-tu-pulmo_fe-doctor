import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Plus, Copy, Trash2, ChevronDown, Save, AlertCircle } from 'lucide-react';
import { AppointmentType, ScheduleType } from '@/lib/constants';
import type { DoctorSchedule, CreateScheduleDto, UpdateScheduleDto } from '@/types/schedule';
import { useDeleteRegularSchedule } from '@/hooks/use-schedules';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';

interface RegularScheduleModalProps {
    open: boolean;
    onClose: () => void;
    schedules: DoctorSchedule[];
    onSave: (
        schedulesToCreate: CreateScheduleDto[],
        schedulesToDelete: string[],
        schedulesToUpdate: UpdateScheduleDto[]
    ) => Promise<void>;
}

interface TimeSlotData {
    id?: string; // ID của lịch đã tồn tại
    tempId: string; // ID tạm cho lịch mới, dùng làm key
    startTime: string;
    endTime: string;
    slotCapacity: number;
    slotDuration: number;
    minimumBookingDays: number;
    maxAdvanceBookingDays: number;
    consultationFee: number;
    discountPercent: number;
    isNew: boolean; // Flag đánh dấu slot mới tạo
    isDeleted: boolean; // Flag đánh dấu slot đã bị xóa
}

interface DayData {
    dayOfWeek: number;
    enabled: boolean;
    slots: TimeSlotData[];
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

// Helper: Tạo dữ liệu cho một slot mới mặc định
const createEmptySlot = (): TimeSlotData => ({
    tempId: `temp-${Date.now()}-${Math.random()}`,
    startTime: '09:00',
    endTime: '10:00',
    slotCapacity: 1,
    slotDuration: 30,
    minimumBookingDays: 0,
    maxAdvanceBookingDays: 30,
    consultationFee: 0,
    discountPercent: 0,
    isNew: true,
    isDeleted: false,
});

// Helper: Kiểm tra chồng lấn thời gian
const getOverlappingSlotIds = (slots: TimeSlotData[]): Set<string> => {
    const activeSlots = slots.filter(s => !s.isDeleted);
    const overlappingIds = new Set<string>();

    for (let i = 0; i < activeSlots.length; i++) {
        for (let j = i + 1; j < activeSlots.length; j++) {
            const s1 = activeSlots[i];
            const s2 = activeSlots[j];
            if (s1.startTime < s2.endTime && s1.endTime > s2.startTime) {
                overlappingIds.add(s1.tempId);
                overlappingIds.add(s2.tempId);
            }
        }
    }
    return overlappingIds;
};

/**
 * Modal quản lý Lịch Làm Việc Cốt Định (Regular Schedule).
 * Cho phép thiết lập lịch theo từng ngày trong tuần, copy cấu hình từ ngày này sang ngày khác.
 */
export function RegularScheduleModal({ open, onClose, schedules, onSave }: RegularScheduleModalProps) {
    const { user } = useAppStore();
    const doctorId = user?.doctorId || '';
    const deleteRegular = useDeleteRegularSchedule();

    // Loại lịch làm việc đang chọn (Khám tại phòng / Tư vấn trực tuyến)
    const [appointmentType, setAppointmentType] = useState<AppointmentType>(AppointmentType.IN_CLINIC);

    // Dữ liệu local quản lý trạng thái các ngày và slots trong modal
    const [daysData, setDaysData] = useState<DayData[]>([]);

    const [saving, setSaving] = useState(false);

    // State cho Popover Copy
    const [copyPopoverOpen, setCopyPopoverOpen] = useState<number | null>(null);
    const [copyTargets, setCopyTargets] = useState<number[]>([]);

    // --- Validation computations ---
    const overlapsByDay = new Map<number, Set<string>>();
    let hasAnyOverlap = false;
    let hasInvalidTime = false;

    daysData.forEach(day => {
        if (day.enabled) {
            const overlaps = getOverlappingSlotIds(day.slots);
            if (overlaps.size > 0) {
                overlapsByDay.set(day.dayOfWeek, overlaps);
                hasAnyOverlap = true;
            }
            day.slots.filter(s => !s.isDeleted).forEach(s => {
                if (s.startTime >= s.endTime) {
                    hasInvalidTime = true;
                }
            });
        }
    });

    const isFormValid = !hasAnyOverlap && !hasInvalidTime && !saving;

    // Effect: Khởi tạo dữ liệu daysData từ props schedules khi modal mở
    useEffect(() => {
        if (!open) return;

        // Lọc schedules theo loại lịch đang chọn (Regular + AppointmentType)
        const filteredSchedules = schedules.filter(
            s => s.scheduleType === ScheduleType.REGULAR && s.appointmentType === appointmentType
        );

        // Map schedules vào cấu trúc DayData để hiển thị
        const newDaysData: DayData[] = DAYS_OF_WEEK.map(day => {
            const daySchedules = filteredSchedules.filter(s => s.dayOfWeek === day.value);
            return {
                dayOfWeek: day.value,
                enabled: daySchedules.length > 0 && daySchedules.some(s => s.isAvailable),
                slots: daySchedules.map(s => ({
                    id: s.id,
                    tempId: s.id,
                    startTime: s.startTime.slice(0, 5),
                    endTime: s.endTime.slice(0, 5),
                    slotCapacity: s.slotCapacity,
                    slotDuration: s.slotDuration,
                    minimumBookingDays: s.minimumBookingDays ?? Math.floor(((s as any).minimumBookingTime || 0) / (24 * 60)),
                    maxAdvanceBookingDays: s.maxAdvanceBookingDays ?? 30,
                    consultationFee: s.consultationFee ? Number(s.consultationFee) : 0,
                    discountPercent: s.discountPercent || 0,
                    isNew: false,
                    isDeleted: false,
                })),
            };
        });

        setDaysData(newDaysData);
        // Chỉ khởi tạo (sync) data khi Modal VỪA MỞ, không sync lại khi schedules reference thay đổi (do React Query re-fetch liên tục)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, appointmentType]);

    // Handler: Bật/Tắt lịch cho một ngày
    const toggleDay = (dayOfWeek: number, enabled: boolean) => {
        setDaysData(prev => prev.map(d => {
            if (d.dayOfWeek === dayOfWeek) {
                return {
                    ...d,
                    enabled,
                    // Nếu bật lên mà chưa có slot nào thì tự thêm 1 slot mặc định
                    slots: enabled && d.slots.filter(s => !s.isDeleted).length === 0 ? [createEmptySlot()] : d.slots,
                };
            }
            return d;
        }));
    };

    // Handler: Thêm slot mới cho một ngày
    const addSlot = (dayOfWeek: number) => {
        setDaysData(prev => prev.map(d => {
            if (d.dayOfWeek === dayOfWeek) {
                return { ...d, slots: [...d.slots, createEmptySlot()] };
            }
            return d;
        }));
    };

    // Handler: Cập nhật thông tin của một slot
    const updateSlot = (dayOfWeek: number, tempId: string, updates: Partial<TimeSlotData>) => {
        console.log(dayOfWeek, tempId, updates);
        setDaysData(prev => prev.map(d => {
            if (d.dayOfWeek === dayOfWeek) {
                return {
                    ...d,
                    slots: d.slots.map(s => s.tempId === tempId ? { ...s, ...updates } : s),
                };
            }
            return d;
        }));
    };

    // Handler: Xóa một slot
    const deleteSlot = async (dayOfWeek: number, tempId: string) => {
        const dayToModify = daysData.find(d => d.dayOfWeek === dayOfWeek);
        if (dayToModify) {
            const slotToDelete = dayToModify.slots.find(s => s.tempId === tempId);
            if (slotToDelete && slotToDelete.id && !slotToDelete.isNew) {
                if (!confirm('Bạn có chắc chắn muốn xóa lịch này không? Hành động này sẽ xóa ngay lập tức khỏi hệ thống!')) return;
                try {
                    await deleteRegular.mutateAsync({ doctorId, id: slotToDelete.id });
                    toast.success('Xóa khung giờ thành công!');
                } catch (error) {
                    toast.error('Có lỗi xảy ra khi xóa khung giờ.');
                    return; // Stop local UI update if API fails
                }
            }
        }

        setDaysData(prev => prev.map(d => {
            if (d.dayOfWeek === dayOfWeek) {
                return {
                    ...d,
                    slots: d.slots.map(s => {
                        if (s.tempId === tempId) {
                            return null;
                        }
                        return s;
                    }).filter(Boolean) as TimeSlotData[],
                };
            }
            return d;
        }));
    };

    // Handler: Copy cấu hình từ một ngày sang các ngày khác
    const copyToOtherDays = (sourceDayOfWeek: number) => {
        const sourceDay = daysData.find(d => d.dayOfWeek === sourceDayOfWeek);
        if (!sourceDay) return;

        setDaysData(prev => prev.map(d => {
            if (copyTargets.includes(d.dayOfWeek)) {
                // Tạo bản sao các slots từ ngày nguồn, đánh dấu là mới
                const copiedSlots = sourceDay.slots
                    .filter(s => !s.isDeleted)
                    .map(s => ({
                        ...s,
                        id: undefined,
                        tempId: `temp-${Date.now()}-${Math.random()}`,
                        isNew: true,
                    }));
                return {
                    ...d,
                    enabled: true,
                    // Giữ lại các slots cũ (đánh dấu xóa) + thêm slots mới copy
                    slots: [...d.slots.map(s => ({ ...s, isDeleted: true })), ...copiedSlots],
                };
            }
            return d;
        }));

        setCopyPopoverOpen(null);
        setCopyTargets([]);
    };

    // Handler: Lưu thay đổi (Gọi prop onSave từ parent)
    const handleSave = async () => {
        setSaving(true);
        try {
            const schedulesToCreate: CreateScheduleDto[] = [];
            const schedulesToDelete: string[] = [];
            const schedulesToUpdate: UpdateScheduleDto[] = [];

            daysData.forEach(day => {
                if (!day.enabled) {
                    // Nếu ngày bị tắt -> Cập nhật isAvailable = false thay vì xóa
                    day.slots.forEach(s => {
                        if (s.id) {
                            schedulesToUpdate.push({
                                id: s.id,
                                dayOfWeek: day.dayOfWeek,
                                startTime: s.startTime,
                                endTime: s.endTime,
                                slotCapacity: s.slotCapacity,
                                slotDuration: s.slotDuration,
                                appointmentType,
                                minimumBookingDays: s.minimumBookingDays,
                                maxAdvanceBookingDays: s.maxAdvanceBookingDays,
                                consultationFee: s.consultationFee || undefined,
                                discountPercent: s.discountPercent || undefined,
                                isAvailable: false
                            });
                        }
                    });
                } else {
                    day.slots.forEach(slot => {
                        if (slot.isNew && !slot.isDeleted) {
                            // Slot mới -> Thêm vào danh sách tạo
                            schedulesToCreate.push({
                                dayOfWeek: day.dayOfWeek,
                                startTime: slot.startTime,
                                endTime: slot.endTime,
                                slotCapacity: slot.slotCapacity,
                                slotDuration: slot.slotDuration,
                                appointmentType,
                                minimumBookingDays: slot.minimumBookingDays,
                                maxAdvanceBookingDays: slot.maxAdvanceBookingDays,
                                consultationFee: slot.consultationFee || undefined,
                                discountPercent: slot.discountPercent || undefined,
                                isAvailable: true
                            });
                        } else if (slot.id && !slot.isDeleted) {
                            // Slot cũ -> Thêm vào danh sách update
                            schedulesToUpdate.push({
                                id: slot.id!,
                                dayOfWeek: day.dayOfWeek,
                                startTime: slot.startTime,
                                endTime: slot.endTime,
                                slotCapacity: slot.slotCapacity,
                                slotDuration: slot.slotDuration,
                                appointmentType,
                                minimumBookingDays: slot.minimumBookingDays,
                                maxAdvanceBookingDays: slot.maxAdvanceBookingDays,
                                consultationFee: slot.consultationFee || undefined,
                                discountPercent: slot.discountPercent || undefined,
                                isAvailable: true
                            });
                        }
                    });
                }
            });

            await onSave(schedulesToCreate, schedulesToDelete, schedulesToUpdate);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const getDayLabel = (dayOfWeek: number) => {
        return DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || '';
    };

    const getTypeColor = () => {
        return appointmentType === AppointmentType.IN_CLINIC
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-green-600 hover:bg-green-700';
    };

    const getTypeBorderColor = () => {
        return appointmentType === AppointmentType.IN_CLINIC
            ? 'border-blue-200'
            : 'border-green-200';
    };

    const getTypeSwitchColor = () => {
        return appointmentType === AppointmentType.IN_CLINIC
            ? 'data-[state=checked]:bg-blue-600'
            : 'data-[state=checked]:bg-green-600';
    };

    const getSlotCardStyle = (isSaved: boolean, isOverlapping: boolean = false, isInvalidTime: boolean = false) => {
        if (isOverlapping || isInvalidTime) return "bg-red-50 border-red-400 border-[1.5px]";
        if (!isSaved) return "bg-gray-50 border-gray-200 border-dashed";

        return appointmentType === AppointmentType.IN_CLINIC
            ? "bg-blue-100/80 border-blue-200"
            : "bg-green-100/80 border-green-200";
    };

    const getBadgeStyle = (isSaved: boolean) => {
        if (!isSaved) return "bg-yellow-100 text-yellow-800 border-yellow-200"; // Mới: Màu vàng

        return appointmentType === AppointmentType.IN_CLINIC
            ? "bg-blue-150 text-blue-800 border-blue-200"
            : "bg-green-150 text-green-800 border-green-200";
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Thiết lập khung thời gian để khách hàng đặt lịch khám</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Khung thời gian được lặp lại cố định theo các thứ trong tuần.
                    </p>
                </DialogHeader>

                {/* --- Header Controls: Loại lịch + Nút Save --- */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Label>Loại lịch làm việc:</Label>
                        <Select
                            value={appointmentType}
                            onValueChange={(v) => setAppointmentType(v as AppointmentType)}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={AppointmentType.IN_CLINIC}>Lịch khám</SelectItem>
                                <SelectItem value={AppointmentType.VIDEO}>Tư vấn trực tuyến</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleSave} disabled={!isFormValid} className={getTypeColor()}>
                        <Save className="mr-2 h-4 w-4" />
                        Áp dụng
                    </Button>
                </div>

                <div className="space-y-4">
                    {daysData.map(day => (
                        <div key={day.dayOfWeek} className={cn("border rounded-lg p-4", getTypeBorderColor())}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={day.enabled}
                                        onCheckedChange={(checked) => toggleDay(day.dayOfWeek, checked)}
                                        //màu dựa theo loại type
                                        className={cn(getTypeSwitchColor())}
                                    />
                                    <div>
                                        <div className="font-medium">{getDayLabel(day.dayOfWeek)}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {day.slots.filter(s => !s.isDeleted).length} khung giờ
                                        </div>
                                        {overlapsByDay.has(day.dayOfWeek) && (
                                            <div className="flex items-center text-red-500 text-sm mt-1 font-medium">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                Có khung giờ chồng lấn
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {day.enabled && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addSlot(day.dayOfWeek)}
                                        >
                                            <Plus className="mr-1 h-4 w-4" />
                                            Thêm khung giờ
                                        </Button>

                                        {/* --- Popover Copy --- */}
                                        <Popover
                                            open={copyPopoverOpen === day.dayOfWeek}
                                            onOpenChange={(open) => {
                                                setCopyPopoverOpen(open ? day.dayOfWeek : null);
                                                if (!open) setCopyTargets([]);
                                            }}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Copy className="mr-1 h-4 w-4" />
                                                    Sao chép
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64">
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="all-days"
                                                            checked={copyTargets.length === DAYS_OF_WEEK.length - 1}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setCopyTargets(DAYS_OF_WEEK.filter(d => d.value !== day.dayOfWeek).map(d => d.value));
                                                                } else {
                                                                    setCopyTargets([]);
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor="all-days" className="text-sm font-medium">
                                                            Chọn tất cả các ngày khác
                                                        </label>
                                                    </div>
                                                    <div className="border-t pt-2 space-y-2">
                                                        {DAYS_OF_WEEK.filter(d => d.value !== day.dayOfWeek).map(d => (
                                                            <div key={d.value} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`day-${d.value}`}
                                                                    checked={copyTargets.includes(d.value)}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                            setCopyTargets(prev => [...prev, d.value]);
                                                                        } else {
                                                                            setCopyTargets(prev => prev.filter(v => v !== d.value));
                                                                        }
                                                                    }}
                                                                />
                                                                <label htmlFor={`day-${d.value}`} className="text-sm">
                                                                    {d.label}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-between pt-2 border-t">
                                                        <span className="text-sm text-muted-foreground">
                                                            Đã chọn: {copyTargets.length} Ngày
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setCopyPopoverOpen(null);
                                                                    setCopyTargets([]);
                                                                }}
                                                            >
                                                                Hủy
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => copyToOtherDays(day.dayOfWeek)}
                                                                disabled={copyTargets.length === 0}
                                                                className={getTypeColor()}
                                                            >
                                                                Áp dụng
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            </div>

                            {/* --- Slots List --- */}
                            {day.enabled && (
                                <div className="space-y-3">
                                    {day.slots.filter(s => !s.isDeleted).map((slot) => {
                                        const isOverlapping = overlapsByDay.get(day.dayOfWeek)?.has(slot.tempId) || false;
                                        const isInvalidTime = slot.startTime >= slot.endTime;
                                        return (
                                        <div key={slot.tempId} className={cn("border rounded-lg p-4 transition-colors", getSlotCardStyle(!!slot.id, isOverlapping, isInvalidTime))}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span className={cn("px-2 py-1 rounded text-xs font-medium border", getBadgeStyle(!!slot.id))}>
                                                        {slot.id ? 'Đã lưu' : 'Mới'}
                                                    </span>
                                                    <span>1h • {slot.slotCapacity} lượt</span>
                                                    {isInvalidTime && (
                                                        <span className="text-red-500 text-xs font-semibold flex items-center ml-2">
                                                            <AlertCircle className="w-4 h-4 mr-1" />
                                                            Giờ kết thúc phải sau giờ bắt đầu
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => deleteSlot(day.dayOfWeek, slot.tempId)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* --- Slot Input Fields --- */}
                                            <div className="grid grid-cols-4 gap-4 mb-3">
                                                <div>
                                                    <Label className="text-red-500">Giờ bắt đầu *</Label>
                                                    <Input
                                                        type="time"
                                                        value={slot.startTime}
                                                        onChange={(e) => updateSlot(day.dayOfWeek, slot.tempId, { startTime: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-red-500">Giờ kết thúc *</Label>
                                                    <Input
                                                        type="time"
                                                        value={slot.endTime}
                                                        onChange={(e) => updateSlot(day.dayOfWeek, slot.tempId, { endTime: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-red-500">Số lượt khám/slot *</Label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={slot.slotCapacity}
                                                        onChange={(e) => updateSlot(day.dayOfWeek, slot.tempId, { slotCapacity: Number(e.target.value) })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-red-500">Thời gian 1 slot (phút) *</Label>
                                                    <Input
                                                        type="number"
                                                        min={5}
                                                        value={slot.slotDuration}
                                                        onChange={(e) => updateSlot(day.dayOfWeek, slot.tempId, { slotDuration: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>

                                            {/* --- Advanced Settings Collapsible --- */}
                                            <Collapsible>
                                                <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                                                    <ChevronDown className="h-4 w-4" />
                                                    Cài đặt nâng cao
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="pt-3">
                                                    <div className="grid grid-cols-4 gap-4">
                                                        <div>
                                                            <Label>Số ngày đặt trước</Label>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                placeholder="Ngày"
                                                                value={slot.minimumBookingDays === 0 ? 0 : (slot.minimumBookingDays || '')}
                                                                onChange={(e) => updateSlot(day.dayOfWeek, slot.tempId, { minimumBookingDays: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Đặt xa nhất (ngày)</Label>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                value={slot.maxAdvanceBookingDays}
                                                                onChange={(e) => updateSlot(day.dayOfWeek, slot.tempId, { maxAdvanceBookingDays: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Phí khám</Label>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                placeholder="Phí khám"
                                                                value={slot.consultationFee === 0 ? 0 : (slot.consultationFee || '')}
                                                                onChange={(e) => updateSlot(day.dayOfWeek, slot.tempId, { consultationFee: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Giảm giá (%)</Label>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                max={100}
                                                                placeholder="% Giảm giá"
                                                                value={slot.discountPercent === 0 ? 0 : (slot.discountPercent || '')}
                                                                onChange={(e) => updateSlot(day.dayOfWeek, slot.tempId, { discountPercent: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                    </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
