import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { QueueCard } from '@/components/queue/QueueCard';
import { useGetMyQueue, useGetDoctorStats, useGetMyAppointmentsAsDoctor } from '@/hooks/use-appointments';
import { useEncounterActions } from '@/hooks/use-encounter-actions';
import type { Appointment } from '@/types/appointment';
import { AppointmentStatus } from '@/types/appointment';
import {
    Users,
    Clock,
    Stethoscope,
    CheckCircle2,
    Search,
    RefreshCw,
    WifiOff,
} from 'lucide-react';

export default function QueueManagerPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const { startExamAsync } = useEncounterActions();

    const { data: queueData, isLoading, isFetching, refetch } = useGetMyQueue();
    const { data: stats } = useGetDoctorStats();

    const today = new Date();
    const startDate = format(today, 'yyyy-MM-dd');
    const endDate = format(today, 'yyyy-MM-dd');

    const { data: completedData } = useGetMyAppointmentsAsDoctor({
        page: 1,
        limit: 20,
        status: AppointmentStatus.COMPLETED,
        startDate,
        endDate
    });
    const completedToday = completedData?.data || [];

    const getEncounterRoute = (id: string, type?: string) =>
        type === 'VIDEO'
            ? `/doctor/encounters/${id}/video`
            : `/doctor/encounters/${id}/in-clinic`;

    const handleStartExam = async (id: string, appointmentType?: string) => {
        try {
            if (appointmentType === 'VIDEO') {
                navigate(getEncounterRoute(id, 'VIDEO'));
            } else {
                await startExamAsync({ id, type: appointmentType });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleComplete = (id: string, type?: string) => {
        navigate(getEncounterRoute(id, type));
    };

    const handleViewDetails = (id: string) => {
        navigate(`/doctor/appointments/${id}`);
    };

    const handleOpenRecord = (id: string, type?: string) => {
        navigate(getEncounterRoute(id, type));
    };

    const getPatientName = (a: Appointment) => a.patient?.user?.fullName || '';

    const filterItems = (items: Appointment[] = []) => {
        if (!searchQuery) return items;
        const q = searchQuery.toLowerCase();
        return items.filter((item) => {
            const name = getPatientName(item).toLowerCase();
            const reason = (item.chiefComplaint || '').toLowerCase();
            const queueNum = item.queueNumber?.toString() || '';
            const code = item.patient?.profileCode?.toLowerCase() || '';
            return name.includes(q) || reason.includes(q) || queueNum.includes(q) || code.includes(q);
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-96 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    // Logic Alignment
    const confirmedItems = queueData?.upcomingToday || [];
    const checkedInItems = queueData?.waitingQueue || [];
    const waitingItems = [...checkedInItems, ...confirmedItems];

    const inProgressItems = queueData?.inProgress || [];

    // Stats Logic
    const totalPatients = stats?.totalAppointments ?? stats?.totalPatients ?? queueData?.totalInQueue ?? 0;
    const waitingCount = (queueData?.waitingQueue?.length || 0) + (queueData?.upcomingToday?.length || 0);
    const inProgressCount = queueData?.inProgress?.length || 0;
    const completedCount = completedToday.length || stats?.completedCount || 0;

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col space-y-4 p-4">
            <PageHeader
                title="Quản Lý Hàng Đợi"
                subtitle={
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Phòng khám</span>
                        <Badge variant="secondary" className="text-xs">
                            <WifiOff className="h-3 w-3 mr-1" />
                            Polling (30s)
                        </Badge>
                    </div>
                }
                rightSlot={
                    <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm tên, mã hồ sơ, queue..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            disabled={isFetching}
                        >
                            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                }
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Tổng bệnh nhân</p>
                            <p className="text-2xl font-bold">{totalPatients}</p>
                            {stats?.todayCount !== undefined && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Hôm nay: {stats.todayCount}
                                </p>
                            )}
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Đang chờ</p>
                            <p className="text-2xl font-bold">{waitingCount}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Đã check-in + Đã xác nhận
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Đang khám</p>
                            <p className="text-2xl font-bold">{inProgressCount}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {inProgressItems[0] ? `${getPatientName(inProgressItems[0])} đang khám` : 'Trống'}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Đã khám</p>
                            <p className="text-2xl font-bold">{completedCount}</p>
                            {stats?.completedCount !== undefined && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Đã khám: {stats.completedCount}
                                </p>
                            )}
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Kanban Columns */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 pb-4">
                {/* Waiting Column */}
                <Card className="flex flex-col bg-gray-50/50 border-gray-200 h-full overflow-hidden">
                    <CardHeader className="py-3 px-4 border-b bg-white shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-medium">
                                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                                Đang chờ
                            </div>
                            <Badge variant="secondary" className="bg-gray-100">
                                {filterItems(waitingItems).length}
                            </Badge>
                        </div>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-3">
                        <div className="pb-4">
                            {filterItems(waitingItems).map(item => (
                                <QueueCard
                                    key={item.id}
                                    item={item}
                                    onStartExam={(id) => handleStartExam(id, item.appointmentType)}
                                    onJoinVideo={(id) => handleStartExam(id, 'VIDEO')}
                                    onViewDetails={handleViewDetails}
                                    onOpenRecord={handleOpenRecord}
                                />
                            ))}
                            {filterItems(waitingItems).length === 0 && (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    Không có bệnh nhân chờ
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </Card>

                {/* In Progress Column */}
                <Card className="flex flex-col bg-blue-50/30 border-blue-100 h-full overflow-hidden">
                    <CardHeader className="py-3 px-4 border-b bg-white shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-medium text-blue-700">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                Đang khám
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                {filterItems(inProgressItems).length}
                            </Badge>
                        </div>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-3">
                        <div className="pb-4">
                            {filterItems(inProgressItems).map(item => (
                                <QueueCard
                                    key={item.id}
                                    item={item}
                                    onComplete={handleComplete}
                                    onOpenRecord={handleOpenRecord}
                                    onViewDetails={handleViewDetails}
                                />
                            ))}
                            {filterItems(inProgressItems).length === 0 && (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    Chưa có bệnh nhân đang khám
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Completed Column */}
                <Card className="flex flex-col bg-gray-50/50 border-gray-200 h-full overflow-hidden">
                    <CardHeader className="py-3 px-4 border-b bg-white shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-medium text-gray-600">
                                <span className="h-2 w-2 rounded-full bg-gray-400" />
                                Đã khám
                            </div>
                            <Badge variant="outline">
                                {filterItems(completedToday).length}
                            </Badge>
                        </div>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-3">
                        <div className="pb-4">
                            {filterItems(completedToday).map((item) => (
                                <QueueCard
                                    key={item.id}
                                    item={item}
                                    onViewDetails={handleViewDetails}
                                    onOpenRecord={handleOpenRecord}
                                />
                            ))}
                            {filterItems(completedToday).length === 0 && (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    Chưa có bệnh nhân hoàn thành hôm nay
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </Card>
            </div>
        </div>
    );
}
