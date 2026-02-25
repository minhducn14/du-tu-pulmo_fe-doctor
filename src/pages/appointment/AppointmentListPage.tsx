import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    Building2,
    Video,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Eye,
} from 'lucide-react';
import { useGetMyAppointmentsAsDoctor } from '@/hooks/use-appointments';
import type { AppointmentStatus } from '@/types/appointment';

const STATUS_OPTIONS: { value: string; label: string; color: string }[] = [
    { value: 'ALL', label: 'Tất cả trạng thái', color: '' },
    { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
    { value: 'CHECKED_IN', label: 'Đã check-in', color: 'bg-green-100 text-green-700' },
    { value: 'IN_PROGRESS', label: 'Đang khám', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'COMPLETED', label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
    { value: 'NO_SHOW', label: 'Vắng mặt', color: 'bg-gray-100 text-gray-700' },
];

function getStatusBadge(status: string) {
    const s = STATUS_OPTIONS.find((o) => o.value === status);
    return (
        <Badge variant="secondary" className={s?.color ?? 'bg-gray-100 text-gray-600'}>
            {s?.label ?? status}
        </Badge>
    );
}

function formatDate(dateStr?: string) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(dateStr?: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export const AppointmentListPage = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [search, setSearch] = useState('');

    const queryParams = {
        page,
        limit: 15,
        ...(statusFilter !== 'ALL' && { status: statusFilter as AppointmentStatus }),
        ...(search && { search }),
        sort: 'scheduledAt',
        order: 'DESC' as const,
    };

    const { data, isLoading } = useGetMyAppointmentsAsDoctor(queryParams);
    const totalPages = data?.meta?.totalPages ?? 1;

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <PageHeader
                title="Danh sách lịch hẹn"
                subtitle="Quản lý danh sách lịch hẹn khám bệnh"
            />

            {/* Filters */}
            <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm theo tên bệnh nhân, mã lịch hẹn..."
                                className="pl-10"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={(v) => {
                                setStatusFilter(v);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Mã</TableHead>
                                <TableHead>Bệnh nhân</TableHead>
                                <TableHead>Ngày khám</TableHead>
                                <TableHead>Giờ</TableHead>
                                <TableHead className="w-[80px]">Loại</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 7 }).map((_, j) => (
                                            <TableCell key={j}>
                                                <Skeleton className="h-4 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : !data?.items?.length ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                                        <Calendar className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                        <p>Không có lịch hẹn nào</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.items.map((appt) => (
                                    <TableRow
                                        key={appt.id}
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => navigate(`/doctor/appointments/${appt.id}`)}
                                    >
                                        <TableCell className="font-mono text-sm text-blue-600">
                                            {appt.appointmentNumber}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {appt.patient?.user?.fullName ?? '—'}
                                        </TableCell>
                                        <TableCell>{formatDate(appt.scheduledAt)}</TableCell>
                                        <TableCell className="text-gray-500">{formatTime(appt.scheduledAt)}</TableCell>
                                        <TableCell>
                                            {appt.appointmentType === 'VIDEO' ? (
                                                <Video className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Building2 className="h-4 w-4 text-blue-500" />
                                            )}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(appt.status)}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Trang {page}/{totalPages} · {data?.meta?.totalItems ?? 0} lịch hẹn
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Trước
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Sau <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentListPage;
