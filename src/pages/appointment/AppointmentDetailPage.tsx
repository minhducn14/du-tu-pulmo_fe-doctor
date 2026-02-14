import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Building2,
    Video,
    User,
    Phone,
    Stethoscope,
    CreditCard,
    FileText,
} from 'lucide-react';
import { appointmentService } from '@/services/appointment.service';
import type { Appointment } from '@/types/appointment';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Chờ xác nhận', color: 'bg-orange-100 text-orange-700' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
    CHECKED_IN: { label: 'Đã check-in', color: 'bg-green-100 text-green-700' },
    IN_PROGRESS: { label: 'Đang khám', color: 'bg-yellow-100 text-yellow-700' },
    COMPLETED: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
    NO_SHOW: { label: 'Vắng mặt', color: 'bg-gray-100 text-gray-700' },
};

function formatDateTime(dateStr?: string) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatVND(amount?: string) {
    if (!amount) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-2">
            <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
                <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm text-gray-900 font-medium">{value ?? '—'}</p>
            </div>
        </div>
    );
}

export const AppointmentDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: appt, isLoading } = useQuery<Appointment>({
        queryKey: ['appointment', id],
        queryFn: () => appointmentService.getDetail(id!),
        enabled: !!id,
    });

    const status = STATUS_MAP[appt?.status ?? ''];
    const canStartExam = appt?.status === 'CHECKED_IN' || appt?.status === 'CONFIRMED';

    const handleStartExam = () => {
        if (!appt) return;
        const route = appt.appointmentType === 'VIDEO'
            ? `/doctor/encounters/${appt.id}/video`
            : `/doctor/encounters/${appt.id}/in-clinic`;
        navigate(route);
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    if (!appt) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <FileText className="h-12 w-12 mb-3 opacity-40" />
                <p>Không tìm thấy lịch hẹn này</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/doctor/appointments')}>
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/doctor/appointments')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <span>Lịch hẹn #{appt.appointmentNumber}</span>
                        {status && (
                            <Badge className={status.color}>{status.label}</Badge>
                        )}
                    </div>
                }
                subtitle={`Tạo lúc ${formatDateTime(appt.createdAt)}`}
                rightSlot={
                    canStartExam ? (
                        <Button onClick={handleStartExam} className="bg-blue-600 hover:bg-blue-700">
                            <Stethoscope className="h-4 w-4 mr-2" />
                            Bắt đầu khám
                        </Button>
                    ) : undefined
                }
            />

            <div className="grid gap-4 md:grid-cols-2">
                {/* Patient Info */}
                <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4" /> Thông tin bệnh nhân
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <InfoRow icon={User} label="Họ tên" value={appt.patient?.user?.fullName} />
                        <InfoRow icon={Phone} label="Điện thoại" value={appt.patient?.user?.phone} />
                        <InfoRow
                            icon={Calendar}
                            label="Ngày sinh"
                            value={appt.patient?.user?.dateOfBirth
                                ? new Date(appt.patient.user.dateOfBirth).toLocaleDateString('vi-VN')
                                : '—'
                            }
                        />
                        {appt.chiefComplaint && (
                            <InfoRow icon={FileText} label="Lý do khám" value={appt.chiefComplaint} />
                        )}
                    </CardContent>
                </Card>

                {/* Scheduling Info */}
                <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Thông tin lịch hẹn
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <InfoRow icon={Calendar} label="Ngày khám" value={formatDateTime(appt.scheduledAt)} />
                        <InfoRow
                            icon={appt.appointmentType === 'VIDEO' ? Video : Building2}
                            label="Loại khám"
                            value={appt.appointmentType === 'VIDEO' ? 'Khám video' : 'Khám trực tiếp'}
                        />
                        {appt.queueNumber && (
                            <InfoRow icon={Clock} label="Số thứ tự" value={`#${appt.queueNumber}`} />
                        )}
                        {appt.checkInTime && (
                            <InfoRow icon={Clock} label="Check-in lúc" value={formatDateTime(appt.checkInTime)} />
                        )}
                        {appt.startedAt && (
                            <InfoRow icon={Clock} label="Bắt đầu khám" value={formatDateTime(appt.startedAt)} />
                        )}
                        {appt.endedAt && (
                            <InfoRow icon={Clock} label="Kết thúc" value={formatDateTime(appt.endedAt)} />
                        )}
                    </CardContent>
                </Card>

                {/* Payment Info */}
                <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <CreditCard className="h-4 w-4" /> Thanh toán
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <InfoRow icon={CreditCard} label="Phí khám" value={formatVND(appt.feeAmount)} />
                        <InfoRow icon={CreditCard} label="Đã thanh toán" value={formatVND(appt.paidAmount)} />
                        {appt.refunded && (
                            <InfoRow icon={CreditCard} label="Hoàn tiền" value={formatVND(appt.refundAmount)} />
                        )}
                    </CardContent>
                </Card>

                {/* Clinical Notes */}
                {(appt.doctorNotes || appt.clinicalNotes || appt.patientNotes) && (
                    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Ghi chú
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {appt.patientNotes && (
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Ghi chú bệnh nhân</p>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{appt.patientNotes}</p>
                                </div>
                            )}
                            {appt.doctorNotes && (
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Ghi chú bác sĩ</p>
                                    <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">{appt.doctorNotes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AppointmentDetailPage;
