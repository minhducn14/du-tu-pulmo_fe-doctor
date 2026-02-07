import { useState } from 'react';
import { useSearchAppointments } from '@/hooks/use-appointments';
import { useEncounterActions } from '@/hooks/use-encounter-actions';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppointmentStatus } from '@/types/appointment';
import { format } from 'date-fns';
import { SearchIcon, CheckCircleIcon, UserIcon } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const ReceptionPage = () => {
    const [search, setSearch] = useState('');
    const [checkInLoading, setCheckInLoading] = useState<string | null>(null);
    const { checkInAsync } = useEncounterActions();

    const { data: appointmentData, isLoading: loading, refetch } = useSearchAppointments({
        search,
    });

    const appointments = appointmentData?.data || [];

    const handleCheckIn = async (id: string) => {
        setCheckInLoading(id);
        try {
            await checkInAsync(id);
        } catch (error) {
            console.error(error);
        } finally {
            setCheckInLoading(null);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        refetch();
    };

    const getStatusBadge = (status: AppointmentStatus) => {
        switch (status) {
            case AppointmentStatus.CONFIRMED:
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Đã xác nhận</Badge>;
            case AppointmentStatus.CHECKED_IN:
                return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">Đã Check-in</Badge>;
            case AppointmentStatus.IN_PROGRESS:
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Đang khám</Badge>;
            case AppointmentStatus.COMPLETED:
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Hoàn thành</Badge>;
            case AppointmentStatus.CANCELLED:
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Đã hủy</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Tiếp nhận bệnh nhân"
                subtitle="Check-in và tiếp nhận bệnh nhân mới"
            />

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <form onSubmit={handleSearch} className="flex gap-4 items-end">
                    <div className="w-full max-w-md space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tên bệnh nhân, mã số, SĐT..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button type="submit" disabled={loading}>
                        <SearchIcon className="mr-2 h-4 w-4" />
                        Tìm kiếm
                    </Button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Bệnh nhân</TableHead>
                            <TableHead>Bác sĩ</TableHead>
                            <TableHead>Thời gian</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {appointments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    Không tìm thấy lịch hẹn nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            appointments.map((apt) => (
                                <TableRow key={apt.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{apt.patient?.user?.fullName}</span>
                                            <span className="text-xs text-gray-500">{apt?.chiefComplaint}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <UserIcon className="h-3 w-3" />
                                            {apt.doctor?.fullName}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span className="font-medium text-gray-900">
                                                {format(new Date(apt.scheduledAt), 'dd/MM/yyyy')}
                                            </span>
                                            {apt.timeSlot && (
                                                <span className="text-gray-500 text-xs">
                                                    {apt.timeSlot.startTime} - {apt.timeSlot.endTime}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                                    <TableCell className="text-right">
                                        {apt.status === AppointmentStatus.CONFIRMED && (
                                            <Button
                                                size="sm"
                                                className="bg-purple-600 hover:bg-purple-700"
                                                onClick={() => handleCheckIn(apt.id)}
                                                disabled={checkInLoading === apt.id}
                                            >
                                                {checkInLoading === apt.id ? (
                                                    'Đang xử lý...'
                                                ) : (
                                                    <>
                                                        <CheckCircleIcon className="mr-1 h-3 w-3" />
                                                        Check-in
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ReceptionPage;
