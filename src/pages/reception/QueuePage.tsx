import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { appointmentService } from '@/services/appointment.service';
import type { Appointment } from '@/types/appointment';
import { AppointmentStatus } from '@/types/appointment';
import { ClockIcon, UserIcon, RefreshCwIcon } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const QueuePage = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchQueue = async () => {
        setLoading(true);
        try {
            // Fetch appointments with status CHECKED_IN
            const result = await appointmentService.getAppointments({
                status: AppointmentStatus.CHECKED_IN,
                startDate: new Date().toISOString().split('T')[0], // Today
                endDate: new Date().toISOString().split('T')[0],
            });
            setAppointments(result.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Hàng đợi bệnh nhân"
                subtitle="Danh sách bệnh nhân đã check-in và đang chờ khám"
            // extra={
            //     <Button variant="outline" size="sm" onClick={fetchQueue} disabled={loading}>
            //         <RefreshCwIcon className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            //         Làm mới
            //     </Button>
            // }
            />

            <div className="flex justify-end px-6">
                <Button variant="outline" size="sm" onClick={fetchQueue} disabled={loading}>
                    <RefreshCwIcon className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Bệnh nhân</TableHead>
                            <TableHead>Bác sĩ</TableHead>
                            <TableHead>Giờ hẹn</TableHead>
                            <TableHead>Thời gian chờ</TableHead>
                            <TableHead>Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {appointments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    Không có bệnh nhân nào trong hàng đợi
                                </TableCell>
                            </TableRow>
                        ) : (
                            appointments.map((apt, index) => (
                                <TableRow key={apt.id}>
                                    <TableCell className="font-medium">#{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{apt.patient.fullName}</span>
                                            <span className="text-xs text-gray-500">{apt.reason}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <UserIcon className="h-3 w-3" />
                                            {apt.doctor.fullName}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm font-medium">
                                            <ClockIcon className="h-3 w-3 text-gray-400" />
                                            {apt.timeSlot ? `${apt.timeSlot.startTime} - ${apt.timeSlot.endTime}` : 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {/* Ideally calculate wait time from check-in timestamp if available */}
                                        <span className="text-gray-500 text-sm">-- phút</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                                            Đang chờ khám
                                        </Badge>
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

export default QueuePage;
