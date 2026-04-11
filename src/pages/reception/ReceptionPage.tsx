import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '@/services/appointment.service';
import { doctorService } from '@/services/doctor.service';
import { useEncounterActions } from '@/hooks/use-encounter-actions';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { QrScannerModal } from '@/components/appointment/QrScannerModal';
import {
    Search,
    Calendar as CalendarIcon,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Video,
    Building2,
    Eye,
    QrCode,
    CheckCircle,
    User,
} from 'lucide-react';
import { format, differenceInMinutes, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { AppointmentStatus, CHECKIN_TIME_THRESHOLDS } from '@/lib/constants';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { DoctorProfile } from '@/types/profile';

const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    });

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

export const ReceptionPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { checkInAsync, checkInByNumberAsync } = useEncounterActions();

    // States for filters
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>('all');
    const [payment, setPayment] = useState<string>('all');
    const [doctorId, setDoctorId] = useState<string>('all');
    const [startDate, setStartDate] = useState<Date | undefined>(new Date()); // Default to today
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());     // Default to today
    
    // Pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    // Other states
    const [checkInLoading, setCheckInLoading] = useState<string | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Fetch doctors for filter
    const { data: doctorsData } = useQuery({
        queryKey: ['doctors', 'public'],
        queryFn: () => doctorService.getPublicDoctors({ limit: 100 }),
    });
    const doctors = doctorsData?.items || [];

    // Fetch appointments
    const { data, isLoading } = useQuery({
        queryKey: [
            'appointments',
            'reception',
            search,
            status,
            payment,
            startDate,
            endDate,
            doctorId,
            page,
            limit,
        ],
        queryFn: () => {
            const params: any = {
                search,
                status: status === 'all' ? undefined : (status as AppointmentStatus),
                startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
                endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
                doctorId: doctorId === 'all' ? undefined : doctorId,
                page,
                limit,
            };
            
            // Payment filter logic in params if supported by API, 
            // otherwise we'd have to filter client-side or use a different endpoint.
            // AppointmentManagementPage used appointmentService.getAll(params) for isStaff
            return appointmentService.getAll(params);
        },
    });

    const appointments = data?.items || [];
    const meta = data?.meta;
    
    /**
     * Kiểm tra điều kiện check-in của lịch hẹn
     */
    const getCheckInValidation = (appt: any) => {
        const now = new Date();
        const scheduledTime = new Date(appt.scheduledAt);
        const timeDiff = differenceInMinutes(scheduledTime, now);
        // const isPaid = Number(appt.paidAmount) >= Number(appt.feeAmount);
        const apptIsToday = isToday(scheduledTime);
        if (appt.status !== 'CONFIRMED') {
            return { canCheckIn: false, reason: '', type: 'error' };
        }

        // if (!isPaid) {
        //     return { canCheckIn: false, reason: 'Bệnh nhân chưa thanh toán đủ phí khám', type: 'error' };
        // }

        if (!apptIsToday) {
            return { canCheckIn: false, reason: 'Chỉ được phép check-in vào đúng ngày hẹn', type: 'error' };
        }

        const thresholds =
            appt.appointmentType === 'VIDEO'
                ? CHECKIN_TIME_THRESHOLDS.VIDEO
                : CHECKIN_TIME_THRESHOLDS.IN_CLINIC;

        if (timeDiff > thresholds.EARLY_MINUTES) {
            return {
                canCheckIn: false,
                reason: `Đến quá sớm. Vui lòng quay lại sau ${timeDiff - thresholds.EARLY_MINUTES} phút nữa.`,
                type: 'error',
            };
        }

        // Trường hợp trễ của khám tại phòng: Vẫn cho check-in nhưng cảnh báo
        if (appt.appointmentType === 'IN_CLINIC' && timeDiff < -thresholds.LATE_MINUTES) {
            return {
                canCheckIn: true,
                reason: 'Bệnh nhân đến trễ (Sẽ tự động xếp vào cuối hàng đợi)',
                type: 'warning',
            };
        }

        // Trường hợp trễ của Video: Chặn hoàn toàn
        if (appt.appointmentType === 'VIDEO' && timeDiff < -thresholds.LATE_MINUTES) {
            return {
                canCheckIn: false,
                reason: 'Đã quá thời gian cho phép check-in tư vấn video',
                type: 'error',
            };
        }

        return { canCheckIn: true, reason: '', type: 'success' };
    };

    const handleCheckIn = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCheckInLoading(id);
        try {
            await checkInAsync(id);
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        } catch (error) {
            console.error(error);
        } finally {
            setCheckInLoading(null);
        }
    };

    const handleQrScan = async (result: string) => {
        try {
            await checkInByNumberAsync(result);
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        } catch (error) {
            // Error handled by hook
        }
    };

    const getStatusBadge = (status: string) => {
        const baseClass =
            'text-[11px] px-2 h-6 whitespace-nowrap inline-flex items-center justify-center rounded-md font-medium hover:bg-transparent transition-none';
        switch (status) {
            case 'PENDING_PAYMENT':
                return (
                    <Badge className={`bg-orange-50 text-orange-700 border-orange-200 ${baseClass}`}>
                        Chờ thanh toán
                    </Badge>
                );
            case 'PENDING':
                return (
                    <Badge className={`bg-yellow-50 text-yellow-700 border-yellow-200 ${baseClass}`}>
                        Chờ xác nhận
                    </Badge>
                );
            case 'CONFIRMED':
                return (
                    <Badge className={`bg-blue-50 text-blue-700 border-blue-200 ${baseClass}`}>
                        Đã xác nhận
                    </Badge>
                );
            case 'CHECKED_IN':
                return (
                    <Badge className={`bg-green-50 text-green-700 border-green-200 ${baseClass}`}>
                        Đã check-in
                    </Badge>
                );
            case 'IN_PROGRESS':
                return (
                    <Badge className={`bg-indigo-50 text-indigo-700 border-indigo-200 ${baseClass}`}>
                        Đang khám
                    </Badge>
                );
            case 'COMPLETED':
                return (
                    <Badge className={`bg-emerald-50 text-emerald-700 border-emerald-200 ${baseClass}`}>
                        Hoàn thành
                    </Badge>
                );
            case 'CANCELLED':
                return (
                    <Badge className={`bg-red-50 text-red-700 border-red-200 ${baseClass}`}>
                        Đã hủy
                    </Badge>
                );
            case 'NO_SHOW':
                return (
                    <Badge className={`bg-slate-50 text-slate-700 border-slate-200 ${baseClass}`}>
                        Vắng mặt
                    </Badge>
                );
            default:
                return <Badge className={`${baseClass}`}>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-700">
            <PageHeader
                title="Tiếp nhận bệnh nhân"
                subtitle="Quản lý danh sách tiếp nhận và check-in bệnh nhân trong ngày"
                rightSlot={
                    <Button
                        onClick={() => setIsScannerOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 shadow-md transition-all active:scale-95"
                    >
                        <QrCode className="mr-2 h-4 w-4" />
                        Quét mã QR
                    </Button>
                }
            />

            <Card className="border-none shadow-sm bg-gray-50/50 slide-in-from-top-2 animate-in duration-500">
                <CardContent className="p-4 flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[240px]">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm tên, số điện thoại, mã lịch hẹn..."
                                className="pl-9 bg-white h-9 text-sm"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <span className="text-[11px] font-medium text-gray-500 ml-1">
                            Từ ngày
                        </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-[130px] h-9 justify-start text-left font-normal bg-white px-3"
                                >
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                    <span className="text-sm">
                                        {startDate ? format(startDate, 'dd/MM/yyyy') : 'Tất cả'}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => {
                                        setStartDate(date);
                                        setPage(1);
                                    }}
                                    initialFocus
                                    locale={vi}
                                />
                                {startDate && (
                                    <div className="p-2 border-t text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-red-500"
                                            onClick={() => {
                                                setStartDate(undefined);
                                                setPage(1);
                                            }}
                                        >
                                            Xóa lọc
                                        </Button>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-1.5">
                        <span className="text-[11px] font-medium text-gray-500 ml-1">
                            Đến ngày
                        </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-[130px] h-9 justify-start text-left font-normal bg-white px-3"
                                >
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                    <span className="text-sm">
                                        {endDate ? format(endDate, 'dd/MM/yyyy') : 'Tất cả'}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(date) => {
                                        setEndDate(date);
                                        setPage(1);
                                    }}
                                    initialFocus
                                    locale={vi}
                                />
                                {endDate && (
                                    <div className="p-2 border-t text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-red-500"
                                            onClick={() => {
                                                setEndDate(undefined);
                                                setPage(1);
                                            }}
                                        >
                                            Xóa lọc
                                        </Button>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-1.5">
                        <span className="text-[11px] font-medium text-gray-500 ml-1">
                            Trạng thái
                        </span>
                        <Select
                            value={status}
                            onValueChange={(v) => {
                                setStatus(v);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[130px] h-9 bg-white text-sm">
                                <SelectValue placeholder="Tất cả" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="CONFIRMED">Chờ khám</SelectItem>
                                <SelectItem value="CHECKED_IN">Đã Check-in</SelectItem>
                                <SelectItem value="IN_PROGRESS">Đang khám</SelectItem>
                                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                <SelectItem value="NO_SHOW">Vắng mặt</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <span className="text-[11px] font-medium text-gray-500 ml-1">
                            Bác sĩ
                        </span>
                        <Select
                            value={doctorId}
                            onValueChange={(v) => {
                                setDoctorId(v);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[160px] h-9 bg-white text-sm">
                                <SelectValue placeholder="Tất cả bác sĩ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả bác sĩ</SelectItem>
                                {doctors.map((doc: DoctorProfile) => (
                                    <SelectItem key={doc.id} value={doc.id}>
                                        BS. {doc.fullName || doc.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="gap-2 h-9 px-3 text-sm"
                            onClick={() => {
                                setSearch('');
                                setStatus('all');
                                setPayment('all');
                                setDoctorId('all');
                                setStartDate(new Date());
                                setEndDate(new Date());
                                setPage(1);
                            }}
                        >
                            <Filter className="h-3.5 w-3.5" />
                            Làm mới
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden slide-in-from-bottom-4 animate-in duration-700 delay-150">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="w-[140px] text-[11px] uppercase font-semibold text-gray-500">Trạng thái</TableHead>
                                <TableHead className="w-[100px] text-[11px] uppercase font-semibold text-gray-500">Mã LH</TableHead>
                                <TableHead className="text-[11px] uppercase font-semibold text-gray-500">Bệnh nhân</TableHead>
                                <TableHead className="text-[11px] uppercase font-semibold text-gray-500">Bác sĩ</TableHead>
                                <TableHead className="text-[11px] uppercase font-semibold text-gray-500">Loại</TableHead>
                                <TableHead className="text-[11px] uppercase font-semibold text-gray-500">Ngày khám</TableHead>
                                <TableHead className="text-[11px] uppercase font-semibold text-gray-500 text-center">Giờ khám</TableHead>
                                <TableHead className="text-[11px] uppercase font-semibold text-gray-500 text-right">Phí khám</TableHead>
                                <TableHead className="w-[130px] text-[11px] uppercase font-semibold text-gray-500">Thanh toán</TableHead>
                                <TableHead className="w-[120px] text-[11px] uppercase font-semibold text-gray-500 text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="h-32 text-center text-gray-500 text-sm">
                                        Đang tải dữ liệu...
                                    </TableCell>
                                </TableRow>
                            ) : appointments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center">
                                                <CalendarIcon className="h-12 w-12 text-gray-200" />
                                            </div>
                                            <p className="text-gray-400 font-medium text-sm">
                                                Không tìm thấy lịch hẹn nào
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                appointments.map((appt: any) => (
                                    <TableRow
                                        key={appt.id}
                                        className="hover:bg-blue-50/30 transition-colors cursor-pointer text-sm"
                                        onClick={() => navigate(`/doctor/appointments/${appt.id}`)}
                                    >
                                        <TableCell className="py-3">
                                            {getStatusBadge(appt.status)}
                                        </TableCell>
                                        <TableCell className="py-3 font-mono text-xs text-blue-600">
                                            {appt.appointmentNumber}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 group-hover:text-blue-600">
                                                    {appt.patient?.user?.fullName}
                                                </span>
                                                <span className="text-[11px] text-gray-500">
                                                    {appt.patient?.user?.phone || '—'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 text-gray-600 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <User className="h-3 w-3" />
                                                <span>BS. {appt.doctor?.fullName || '—'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            {appt.appointmentType === 'VIDEO' ? (
                                                <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                                                    <Video className="h-3 w-3" />
                                                    <span className="text-[10px] font-bold">VIDEO</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                                                    <Building2 className="h-3 w-3" />
                                                    <span className="text-[10px] font-bold">TRỰC TIẾP</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-3 whitespace-nowrap text-gray-600">
                                            {formatDate(appt.scheduledAt)}
                                        </TableCell>
                                        <TableCell className="py-3 font-bold text-blue-600 text-center">
                                            {formatTime(appt.scheduledAt)}
                                        </TableCell>
                                        <TableCell className="py-3 text-right text-orange-600 font-semibold">
                                            {new Intl.NumberFormat('vi-VN').format(Number(appt.feeAmount))}đ
                                        </TableCell>
                                        <TableCell className="py-3 whitespace-nowrap">
                                            {/* {Number(appt.paidAmount) >= Number(appt.feeAmount) ? ( */}
                                            {appt.paymentStatus === 'PAID' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 text-green-700 bg-green-50 rounded-md font-medium text-[11px]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                    Đã thanh toán
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 text-red-600 bg-red-50 rounded-md font-medium text-[11px]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                    Chưa thanh toán
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-3 text-right">
                                            {appt.status === 'CONFIRMED' && (() => {
                                                const { canCheckIn, reason, type } = getCheckInValidation(appt);
                                                return (
                                                    <TooltipProvider delayDuration={300}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="inline-block">
                                                                    <Button
                                                                        size="sm"
                                                                        className={cn(
                                                                            "h-8 gap-1 transition-all",
                                                                            canCheckIn 
                                                                                ? "bg-purple-600 hover:bg-purple-700 text-white" 
                                                                                : "bg-gray-100 text-gray-400 border-gray-200"
                                                                        )}
                                                                        onClick={(e) => handleCheckIn(appt.id, e)}
                                                                        disabled={!canCheckIn || checkInLoading === appt.id}
                                                                    >
                                                                        {checkInLoading === appt.id ? (
                                                                            '...'
                                                                        ) : (
                                                                            <>
                                                                                <CheckCircle className="h-3.5 w-3.5" />
                                                                                Check-in
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                </span>
                                                            </TooltipTrigger>
                                                            {reason && (
                                                                <TooltipContent 
                                                                    side="left" 
                                                                    className={cn(
                                                                        "max-w-[200px] text-[11px] font-medium px-3 py-2 shadow-md animate-in zoom-in-95 border",
                                                                        type === 'error' 
                                                                            ? "bg-red-50 text-red-700 border-red-200" 
                                                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                                                    )}
                                                                >
                                                                    <p className="flex items-center gap-1.5">
                                                                        <span className={cn(
                                                                            "w-1.5 h-1.5 rounded-full shrink-0",
                                                                            type === 'error' ? "bg-red-500" : "bg-amber-500"
                                                                        )} />
                                                                        {reason}
                                                                    </p>
                                                                </TooltipContent>
                                                            )}
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                );
                                            })()}
                                            {appt.status !== 'CONFIRMED' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/doctor/appointments/${appt.id}`);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
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

            {/* Pagination */}
            <div className="flex items-center justify-between px-2 pt-2 pb-6">
                <div className="flex items-center gap-2">
                    <Select
                        value={String(limit)}
                        onValueChange={(v) => {
                            setLimit(Number(v));
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[70px] bg-white h-8 text-[13px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-[13px] text-gray-500">dòng</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[13px] text-gray-600">
                        Trang{' '}
                        <span className="font-semibold text-gray-900">
                            {meta?.currentPage || 1}
                        </span>{' '}
                        / {meta?.totalPages || 1}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-white border-gray-200"
                            onClick={() => setPage(1)}
                            disabled={!meta?.hasPreviousPage}
                        >
                            <ChevronsLeft className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-white border-gray-200"
                            onClick={() => setPage((p) => p - 1)}
                            disabled={!meta?.hasPreviousPage}
                        >
                            <ChevronLeft className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-white border-gray-200"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!meta?.hasNextPage}
                        >
                            <ChevronRight className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-white border-gray-200"
                            onClick={() => setPage(meta?.totalPages || 1)}
                            disabled={!meta?.hasNextPage}
                        >
                            <ChevronsRight className="h-4 w-4 text-gray-600" />
                        </Button>
                    </div>
                </div>
            </div>

            <QrScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onResult={handleQrScan}
            />
        </div>
    );
};

export default ReceptionPage;
