import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RegularScheduleGrid } from '@/components/schedule/RegularScheduleGrid';
import { RegularScheduleModal } from '@/components/schedule/RegularScheduleModal';
import { ScheduleCalendar } from '@/components/schedule/ScheduleCalendar'
import { ScheduleForm } from '@/components/schedule/ScheduleForm';
import { WeeklySlotCalendar } from '@/components/schedule/WeeklySlotCalendar';
import {
    useGetRegularSchedules,
    useGetFlexibleSchedules,
    useGetTimeOffSchedules,

    useBulkCreateRegularSchedules,
    useCreateFlexibleSchedule,
    useCreateTimeOff,
    useDeleteRegularSchedule,
    useDeleteFlexibleSchedule,
    useDeleteTimeOff,
    useUpdateFlexibleSchedule,
    useUpdateTimeOff,
    useBulkUpdateRegularSchedules
} from '@/hooks/use-schedules';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { ScheduleType } from '@/lib/constants';
import type { CreateScheduleDto, DoctorSchedule, UpdateScheduleDto } from '@/types/schedule';

/**
 * Trang Quản Lý Lịch Làm Việc (Full Features)
 * - Tab 1: Lịch cố định (Regular)
 * - Tab 2: Lịch theo tuần (Weekly Slots)
 * - Tab 3: Lịch nghỉ (Time Off)
 * - Tab 4: Lịch linh hoạt (Flexible)
 */
export const SchedulePage = () => {
    // 1. Get Doctor Info
    const { user } = useAppStore();
    const doctorId = user?.doctorId || '';

    // 2. Data Fetching (Separate queries for better cache mgmt)
    const { data: regularSchedules = [], isLoading: loadingRegular } = useGetRegularSchedules(doctorId);
    const { data: flexibleSchedules = [], isLoading: loadingFlexible } = useGetFlexibleSchedules(doctorId);
    const { data: timeOffSchedules = [], isLoading: loadingTimeOff } = useGetTimeOffSchedules(doctorId);

    // 3. UI State
    const [activeTab, setActiveTab] = useState('regular');

    // -- Modals State --
    const [regularModalOpen, setRegularModalOpen] = useState(false);

    const [genericFormOpen, setGenericFormOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<DoctorSchedule | null>(null);
    const [currentScheduleType, setCurrentScheduleType] = useState<ScheduleType>(ScheduleType.FLEXIBLE);

    // 4. Mutations
    const bulkCreateRegular = useBulkCreateRegularSchedules();
    const bulkUpdateRegular = useBulkUpdateRegularSchedules();
    const deleteRegular = useDeleteRegularSchedule();

    const createFlexible = useCreateFlexibleSchedule();
    const updateFlexible = useUpdateFlexibleSchedule();
    const deleteFlexible = useDeleteFlexibleSchedule();

    const createTimeOff = useCreateTimeOff();
    const updateTimeOff = useUpdateTimeOff();
    const deleteTimeOff = useDeleteTimeOff();

    // 5. Handlers

    // -- Regular Schedule Handlers --
    const handleRegularSave = async (
        schedulesToCreate: CreateScheduleDto[],
        schedulesToDelete: string[],
        schedulesToUpdate: UpdateScheduleDto[]
    ) => {
        try {
            const promises: Promise<any>[] = [];

            // 1. Delete
            if (schedulesToDelete.length > 0) {
                schedulesToDelete.forEach(id => promises.push(deleteRegular.mutateAsync({ doctorId, id })));
            }

            // 2. Create (Bulk)
            if (schedulesToCreate.length > 0) {
                promises.push(bulkCreateRegular.mutateAsync({ doctorId, schedules: schedulesToCreate }));
            }

            // 3. Update (Bulk)
            if (schedulesToUpdate.length > 0) {
                promises.push(bulkUpdateRegular.mutateAsync({ doctorId, schedules: schedulesToUpdate }));
            }

            await Promise.all(promises);
            toast.success('Cập nhật lịch cố định thành công!');
            setRegularModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi lưu lịch cố định.');
        }
    };

    // -- Flexible / TimeOff Handlers --
    const handleOpenCreate = (type: ScheduleType) => {
        setCurrentScheduleType(type);
        setSelectedSchedule(null);
        setGenericFormOpen(true);
    };

    const handleEditSchedule = (schedule: DoctorSchedule) => {
        setCurrentScheduleType(schedule.scheduleType);
        setSelectedSchedule(schedule);
        setGenericFormOpen(true);
    };

    const handleDeleteSchedule = async (schedule: DoctorSchedule) => {
        if (!confirm('Bạn có chắc chắn muốn xóa lịch này không?')) return;

        try {
            if (schedule.scheduleType === ScheduleType.FLEXIBLE) {
                await deleteFlexible.mutateAsync({ doctorId, id: schedule.id });
            } else if (schedule.scheduleType === ScheduleType.TIME_OFF) {
                await deleteTimeOff.mutateAsync({ doctorId, id: schedule.id });
            }
            toast.success('Xóa lịch thành công');
        } catch (error) {
            toast.error('Không thể xóa lịch.');
        }
    };

    const handleFormSubmit = async (data: CreateScheduleDto) => {
        try {
            if (selectedSchedule) {
                // UPDATE
                if (currentScheduleType === ScheduleType.FLEXIBLE) {
                    await updateFlexible.mutateAsync({
                        doctorId,
                        id: selectedSchedule.id,
                        data: {
                            // specificDate: data.effectiveFrom || '',
                            startTime: data.startTime,
                            endTime: data.endTime,
                            slotDuration: data.slotDuration,
                            slotCapacity: data.slotCapacity,
                            appointmentType: data.appointmentType,
                            consultationFee: data.consultationFee,
                            maxAdvanceBookingDays: data.maxAdvanceBookingDays,
                            discountPercent: data.discountPercent,
                        }
                    });
                } else if (currentScheduleType === ScheduleType.TIME_OFF) {
                    await updateTimeOff.mutateAsync({
                        doctorId,
                        id: selectedSchedule.id,
                        data: {
                            // specificDate: data.effectiveFrom || '',
                            startTime: data.startTime,
                            endTime: data.endTime,
                            note: data.note
                        }
                    });
                }
                toast.success('Cập nhật thành công');
            } else {
                // CREATE
                if (currentScheduleType === ScheduleType.FLEXIBLE) {
                    await createFlexible.mutateAsync({
                        doctorId,
                        data: {
                            specificDate: data.effectiveFrom || '',
                            startTime: data.startTime,
                            endTime: data.endTime,
                            slotDuration: data.slotDuration || 30,
                            slotCapacity: data.slotCapacity || 1,
                            appointmentType: data.appointmentType,
                            consultationFee: data.consultationFee,
                            maxAdvanceBookingDays: data.maxAdvanceBookingDays,
                            discountPercent: data.discountPercent,
                        }
                    });
                } else if (currentScheduleType === ScheduleType.TIME_OFF) {
                    await createTimeOff.mutateAsync({
                        doctorId,
                        data: {
                            specificDate: data.effectiveFrom || '',
                            startTime: data.startTime,
                            endTime: data.endTime,
                            note: data.note
                        }
                    });
                }
                toast.success('Tạo mới thành công');
            }
            setGenericFormOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra.');
        }
    };

    // Loading State
    if (loadingRegular || loadingFlexible || loadingTimeOff) {
        return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Quản Lý Lịch Làm Việc"
                subtitle="Thiết lập lịch làm việc cố định, lịch linh hoạt và quản lý thời gian nghỉ."
            />

            <Tabs defaultValue="regular" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="regular">Lịch cố định</TabsTrigger>
                    <TabsTrigger value="slots">Lịch làm việc theo tuần</TabsTrigger>
                    <TabsTrigger value="flexible">Lịch làm việc linh hoạt</TabsTrigger>
                    <TabsTrigger value="timeoff">Lịch nghỉ</TabsTrigger>
                </TabsList>

                {/* TAB 1: REGULAR */}
                <TabsContent value="regular" className="space-y-4">
                    <div className="flex justify-end">
                        {/* Chỉ hiện nút Thiết lập khi chưa có lịch */}
                        {regularSchedules.length === 0 && (
                            <Button onClick={() => setRegularModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" />
                                Thiết lập lịch cố định
                            </Button>
                        )}
                    </div>
                    <RegularScheduleGrid
                        schedules={regularSchedules}
                        onEdit={() => setRegularModalOpen(true)}
                    />
                </TabsContent>

                {/* TAB 2: SLOTS (View Only mainly) */}
                <TabsContent value="slots" className="space-y-4">
                    <WeeklySlotCalendar doctorId={doctorId} />
                </TabsContent>

                {/* TAB 3: FLEXIBLE */}
                <TabsContent value="flexible" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => handleOpenCreate(ScheduleType.FLEXIBLE)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo Lịch Linh Hoạt
                        </Button>
                    </div>
                    <ScheduleCalendar
                        schedules={flexibleSchedules}
                        type={ScheduleType.FLEXIBLE}
                        onEdit={handleEditSchedule}
                        onDelete={handleDeleteSchedule}
                    />
                </TabsContent>

                {/* TAB 4: TIME OFF */}
                <TabsContent value="timeoff" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => handleOpenCreate(ScheduleType.TIME_OFF)} variant="destructive">
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo Lịch Nghỉ
                        </Button>
                    </div>
                    <ScheduleCalendar
                        schedules={timeOffSchedules}
                        type={ScheduleType.TIME_OFF}
                        onEdit={handleEditSchedule}
                        onDelete={handleDeleteSchedule}
                    />
                </TabsContent>
            </Tabs>

            {/* --- Modals --- */}

            {/* 1. Regular Modal */}
            <RegularScheduleModal
                open={regularModalOpen}
                onClose={() => setRegularModalOpen(false)}
                schedules={regularSchedules}
                onSave={handleRegularSave}
            />

            {/* 2. Generic Modal for Flexible/TimeOff */}
            <ScheduleForm
                open={genericFormOpen}
                onClose={() => setGenericFormOpen(false)}
                onSubmit={handleFormSubmit}
                schedule={selectedSchedule}
                scheduleType={currentScheduleType}
            />
        </div>
    );
};

