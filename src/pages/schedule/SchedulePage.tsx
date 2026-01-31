import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RegularScheduleGrid } from '@/components/schedule/RegularScheduleGrid';
import { RegularScheduleModal } from '@/components/schedule/RegularScheduleModal';
import { useGetSchedules, useCreateRegularSchedule, useDeleteRegularSchedule } from '@/hooks/use-schedules';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import type { CreateScheduleDto } from '@/types/schedule'; // Import DTO types if needed explicitly

/**
 * Trang Quản Lý Lịch Làm Việc (Regular Schedule)
 * - Hiển thị lịch làm việc cố định hiện tại.
 * - Cho phép mở modal để chỉnh sửa (Thêm/Sửa/Xóa).
 */
export const SchedulePage = () => {
    // 1. Get Doctor Info from Store (Giả sử store đã lưu user info sau khi login)
    const { user } = useAppStore();
    const doctorId = user?.id || ''; // Fallback nếu chưa có ID (thường sẽ được bảo vệ bởi route guard)

    // 2. Fetch Data using Hooks
    const { data: schedules = [], isLoading, isError } = useGetSchedules(doctorId);

    // 3. Page State
    const [isModalOpen, setModalOpen] = useState(false);

    // 4. Mutations
    const createScheduleMutation = useCreateRegularSchedule();
    const deleteScheduleMutation = useDeleteRegularSchedule();

    // 5. Handlers
    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    /**
     * Xử lý lưu thay đổi từ Modal (Create & Delete)
     * Vì API backend hiện tại có endpoint create bulk? 
     * - `createRegularSchedule`: tạo 1 cái.
     * - `bulkCreateRegularSchedules`: tạo nhiều cái (đã có hook `useBulkCreateRegularSchedules` trong use-schedules.ts? Kiểm tra lại)
     * 
     * Kiểm tra `RegularScheduleModal` prop `onSave`:
     * `onSave: (schedulesToCreate: CreateScheduleDto[], schedulesToDelete: string[]) => Promise<void>;`
     * 
     * Logic:
     * - Loop create
     * - Loop delete
     * - Hoặc dùng Promise.all
     */

    // NOTE: Cần check xem hook useBulkCreateRegularSchedules có tồn tại không. 
    // Trong use-schedules.ts đã có `useBulkCreateRegularSchedules`.
    // Tuy nhiên, để đơn giản và an toàn, ta có thể loop hoặc dùng bulk nếu API hỗ trợ.
    // Kiểm tra lại use-schedules.ts đã implement `useBulkCreateRegularSchedules` chưa.
    // Nếu chưa, dùng loop `createRegularSchedule`.

    // Giả định dùng loop cho đơn giản nếu chưa chắc về bulk, HOẶC import hook bulk nếu có.
    // Dựa vào context trước, `useBulkCreateRegularSchedules` ĐÃ được implement trong `use-schedules.ts`.

    // IMPORT THÊM HOOK BULK
    // (Cần update import ở trên nếu dùng)

    const handleSaveSchedules = async (schedulesToCreate: CreateScheduleDto[], schedulesToDelete: string[]) => {
        try {
            const promises: Promise<any>[] = [];

            // 1. Delete Requests
            schedulesToDelete.forEach(id => {
                promises.push(deleteScheduleMutation.mutateAsync({ doctorId, id }));
            });

            // 2. Create Requests
            // Nếu API hỗ trợ bulk, dùng bulk sẽ tốt hơn. Nếu không, loop create.
            // Dùng loop create cho chắc chắn với endpoint `/regular` standard, hoặc check lại service.
            // Trong service có `bulkCreateRegularSchedules`, nhưng hook `useBulkCreateRegularSchedules` có vẻ ĐÃ CÓ.
            // Để code gọn, ta loop create ở đây hoặc dùng bulk hook. 
            // Hãy dùng loop create vì logic clean hơn trong việc handle từng lỗi nhỏ nếu cần (tuy nhiên bulk nhanh hơn).

            schedulesToCreate.forEach(dto => {
                promises.push(createScheduleMutation.mutateAsync({ doctorId, data: dto }));
            });

            await Promise.all(promises);

            toast.success('Cập nhật lịch làm việc thành công!');
            setModalOpen(false);
        } catch (error) {
            console.error('Failed to save schedules:', error);
            toast.error('Có lỗi xảy ra khi lưu lịch làm việc.');
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu lịch làm việc...</div>;
    }

    if (isError) {
        return <div className="p-8 text-center text-red-500">Không thể tải dữ liệu. Vui lòng thử lại sau.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Lịch Làm Việc</h2>
                    <p className="text-muted-foreground">
                        Quản lý lịch làm việc cố định hàng tuần của bạn.
                    </p>
                </div>
                {/* Nút thêm mới nhanh hoặc mở modal */}
                <Button onClick={handleOpenModal} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Thiết lập lịch
                </Button>
            </div>

            {/* Grid hiển thị lịch */}
            <RegularScheduleGrid
                schedules={schedules}
                onEdit={handleOpenModal}
            />

            {/* Modal chỉnh sửa */}
            <RegularScheduleModal
                open={isModalOpen}
                onClose={handleCloseModal}
                schedules={schedules}
                onSave={handleSaveSchedules}
            />
        </div>
    );
};
