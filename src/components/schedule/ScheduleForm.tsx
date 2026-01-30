import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DAYS_OF_WEEK, AppointmentType, ScheduleType } from '@/lib/constants';
import type { DoctorSchedule, CreateScheduleDto } from '@/types/schedule';

interface ScheduleFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateScheduleDto) => void;
    schedule?: DoctorSchedule | null;
    scheduleType: ScheduleType;
}

/**
 * Form tạo/cập nhật lịch làm việc.
 * - Hỗ trợ 3 loại lịch: Cố định (Regular), Linh hoạt (Flexible), Nghỉ (TimeOff).
 * - Tự động ẩn/hiện các trường dữ liệu tùy theo loại lịch.
 */
export function ScheduleForm({ open, onClose, onSubmit, schedule, scheduleType }: ScheduleFormProps) {

    // Helper: Cắt chuỗi thời gian HH:mm:ss thành HH:mm cho input type="time"
    const formatTime = (time?: string | null) => {
        if (!time) return '09:00';
        return time.slice(0, 5); // Take only HH:mm
    };

    // Khởi tạo state cho form data
    const [formData, setFormData] = useState<CreateScheduleDto>({
        dayOfWeek: schedule?.dayOfWeek ?? 1,
        startTime: formatTime(schedule?.startTime),
        endTime: formatTime(schedule?.endTime) || '17:00',
        slotDuration: schedule?.slotDuration ?? 30,
        slotCapacity: schedule?.slotCapacity ?? 1,
        appointmentType: schedule?.appointmentType ?? AppointmentType.IN_CLINIC,
        minimumBookingDays: schedule?.minimumBookingDays ?? (Math.floor(((schedule as any)?.minimumBookingTime || 0) / (24 * 60)) || 1), // Default 1 day
        maxAdvanceBookingDays: schedule?.maxAdvanceBookingDays ?? 30,
        consultationFee: schedule?.consultationFee ? Number(schedule.consultationFee) : undefined,
        description: schedule?.description ?? '',
        note: schedule?.description ?? '',
        isAvailable: schedule?.isAvailable ?? true,
        effectiveFrom: schedule?.effectiveFrom ?? '',
        effectiveUntil: schedule?.effectiveUntil ?? '',
        discountPercent: schedule?.discountPercent ?? 0,
    });

    // Local state cho Minimum Booking Time (được tính bằng Ngày)
    const [minBookingDays, setMinBookingDays] = useState<number | undefined>(
        schedule?.minimumBookingDays ?? (Math.floor(((schedule as any)?.minimumBookingTime || 0) / (24 * 60)) || 1)
    );

    // Effect: Sync formData khi props schedule thay đổi (chế độ Edit)
    useEffect(() => {
        if (open) {
            setFormData({
                dayOfWeek: schedule?.dayOfWeek ?? 1,
                startTime: formatTime(schedule?.startTime),
                endTime: formatTime(schedule?.endTime) || '17:00',
                slotDuration: schedule?.slotDuration ?? 30,
                slotCapacity: schedule?.slotCapacity ?? 1,
                appointmentType: schedule?.appointmentType ?? AppointmentType.IN_CLINIC,
                minimumBookingDays: schedule?.minimumBookingDays ?? (Math.floor(((schedule as any)?.minimumBookingTime || 0) / (24 * 60)) || 1),
                maxAdvanceBookingDays: schedule?.maxAdvanceBookingDays ?? 30,
                consultationFee: schedule?.consultationFee ? Number(schedule.consultationFee) : undefined,
                description: schedule?.description ?? '',
                note: schedule?.description ?? '',
                isAvailable: schedule?.isAvailable ?? true,
                effectiveFrom: schedule?.effectiveFrom ?? '',
                effectiveUntil: schedule?.effectiveUntil ?? '',
                discountPercent: schedule?.discountPercent ?? 0,
            });
            setMinBookingDays(schedule?.minimumBookingDays ?? (Math.floor(((schedule as any)?.minimumBookingTime || 0) / (24 * 60)) || 1));
        }
    }, [open, schedule]);

    // Handler: Cập nhật giá trị field
    const handleChange = (field: keyof CreateScheduleDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMinBookingDaysChange = (days: number) => {
        setMinBookingDays(days);
        handleChange('minimumBookingDays', days);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const isFlexible = scheduleType === ScheduleType.FLEXIBLE;
    const isTimeOff = scheduleType === ScheduleType.TIME_OFF;
    const isRegular = scheduleType === ScheduleType.REGULAR;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {schedule ? 'Cập Nhật' : 'Tạo'} {isRegular && 'Lịch Cố Định'}
                        {isFlexible && 'Lịch Linh Hoạt'}
                        {isTimeOff && 'Lịch Nghỉ'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* --- Nhóm: Thời gian & Ngày --- */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* REGULAR: Chọn Thứ trong tuần */}
                        {isRegular && (
                            <div className="space-y-2">
                                <Label htmlFor="dayOfWeek">Ngày trong tuần</Label>
                                <Select
                                    value={formData.dayOfWeek?.toString()}
                                    onValueChange={(value) => handleChange('dayOfWeek', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DAYS_OF_WEEK.map((day) => (
                                            <SelectItem key={day.value} value={day.value.toString()}>
                                                {day.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* FLEXIBLE / TIMEOFF: Chọn Ngày cụ thể */}
                        {(isFlexible || isTimeOff) && (
                            <div className="space-y-2">
                                <Label htmlFor="effectiveFrom">
                                    {isTimeOff ? 'Ngày bắt đầu nghỉ' : 'Ngày khám'} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="effectiveFrom"
                                    type="date"
                                    value={formData.effectiveFrom}
                                    onChange={(e) => handleChange('effectiveFrom', e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {/* TIMEOFF: Ngày kết thúc nghỉ */}
                        {isTimeOff && (
                            <div className="space-y-2">
                                <Label htmlFor="effectiveUntil">Ngày kết thúc nghỉ <span className="text-red-500">*</span></Label>
                                <Input
                                    id="effectiveUntil"
                                    type="date"
                                    value={formData.effectiveUntil}
                                    onChange={(e) => handleChange('effectiveUntil', e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {/* REGULAR / FLEXIBLE: Loại hình khám */}
                        {!isTimeOff && (
                            <div className="space-y-2">
                                <Label htmlFor="appointmentType">Loại lịch làm việc <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.appointmentType}
                                    onValueChange={(value) => handleChange('appointmentType', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={AppointmentType.IN_CLINIC}>Lịch khám tại phòng</SelectItem>
                                        <SelectItem value={AppointmentType.VIDEO}>Lịch tư vấn trực tuyến</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* --- Nhóm: Giờ Bắt đầu / Kết thúc --- */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Giờ bắt đầu <span className="text-red-500">*</span></Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => handleChange('startTime', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">Giờ kết thúc <span className="text-red-500">*</span></Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => handleChange('endTime', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {!isTimeOff && (
                        <>
                            {/* --- Nhóm: Cấu hình Slot --- */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="slotCapacity">Số lượt khám trên một slot <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="slotCapacity"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.slotCapacity}
                                        onChange={(e) => handleChange('slotCapacity', parseInt(e.target.value))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slotDuration">Thời gian 1 slot (phút) <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="slotDuration"
                                        type="number"
                                        min="10"
                                        max="120"
                                        value={formData.slotDuration}
                                        onChange={(e) => handleChange('slotDuration', parseInt(e.target.value))}
                                        placeholder="Phút"
                                        required
                                    />
                                </div>
                            </div>

                            {/* --- Nhóm: Quy tắc đặt lịch (Booking Rules) --- */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="minimumBookingDays">Số ngày phải đặt khám trước</Label>
                                    <Input
                                        id="minimumBookingDays"
                                        type="number"
                                        min="0"
                                        value={minBookingDays}
                                        onChange={(e) => handleMinBookingDaysChange(parseInt(e.target.value))}
                                        placeholder="Ngày"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxAdvanceBookingDays">Số ngày đặt khám xa nhất</Label>
                                    <Input
                                        id="maxAdvanceBookingDays"
                                        type="number"
                                        min="0"
                                        value={formData.maxAdvanceBookingDays}
                                        onChange={(e) => handleChange('maxAdvanceBookingDays', parseInt(e.target.value))}
                                        placeholder="Ngày"
                                    />
                                </div>
                            </div>

                            {/* --- Nhóm: Phí & Giảm giá --- */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="consultationFee">Phí khám</Label>
                                    <Input
                                        id="consultationFee"
                                        type="number"
                                        min="0"
                                        value={formData.consultationFee || ''}
                                        onChange={(e) => handleChange('consultationFee', e.target.value ? parseInt(e.target.value) : undefined)}
                                        placeholder="Phí khám"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discountPercent">Giảm giá (%)</Label>
                                    <Input
                                        id="discountPercent"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.discountPercent || ''}
                                        onChange={(e) => handleChange('discountPercent', e.target.value ? parseInt(e.target.value) : undefined)}
                                        placeholder="% Giảm giá"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* --- Cảnh báo & Ghi chú --- */}
                    {!isTimeOff && (
                        <div className="space-y-2">
                            <div className="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-md text-sm flex gap-2 items-start">
                                <span className="mt-0.5">⚠️</span>
                                <div>
                                    <p className="font-medium">Lưu ý</p>
                                    <p>Lịch khám này chỉ áp dụng cho ngày bạn đã chọn, không lặp lại và không áp dụng cho các ngày khác.</p>
                                    <p className="mt-1">Trong trường hợp có các lịch hẹn khám của bệnh nhân đã được đặt trước trùng với ngày của lịch mới, những lịch này sẽ bị hủy tự động.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isTimeOff && (
                        <div className="space-y-2">
                            <div className="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-md text-sm flex gap-2 items-start">
                                <span className="mt-0.5">⚠️</span>
                                <div>
                                    <p className="font-medium">Lưu ý</p>
                                    <p>Khách hàng sẽ không thể đặt lịch khám hoặc tư vấn vào khung giờ nghỉ. Các lịch đã được bệnh nhân đặt trước đó cũng sẽ bị hủy.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Đóng
                        </Button>
                        <Button type="submit">{schedule ? 'Cập Nhật' : 'Thêm mới'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
