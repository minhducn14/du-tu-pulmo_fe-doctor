import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ArrowLeft,
    User,
    Phone,
    Calendar,
    Droplets,
    ShieldCheck,
    FileText,
    Pill,
    Activity,
    Stethoscope,
} from 'lucide-react';
import { usePatientProfile } from '@/hooks/use-patients';
import { medicalService } from '@/services/medical.service';
import { patientService } from '@/services/patient.service';
import type { MedicalRecord } from '@/types/medical';
import type { PaginatedAppointment } from '@/types/appointment';

function formatDate(dateStr?: string | Date) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const TABS = [
    { key: 'overview', label: 'Tổng quan', icon: User },
    { key: 'records', label: 'Bệnh án', icon: FileText },
    { key: 'appointments', label: 'Lịch hẹn', icon: Calendar },
] as const;

type TabKey = typeof TABS[number]['key'];

export const PatientDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabKey>('overview');

    const { data: profile, isLoading } = usePatientProfile(id);

    const { data: records, isLoading: recordsLoading } = useQuery<MedicalRecord[]>({
        queryKey: ['patients', id, 'records'],
        queryFn: () => medicalService.getPatientRecords(id!),
        enabled: !!id && activeTab === 'records',
    });

    const { data: appointments, isLoading: appointmentsLoading } = useQuery<PaginatedAppointment>({
        queryKey: ['patients', id, 'appointments'],
        queryFn: () => patientService.getAppointments(id!, { limit: 20 }),
        enabled: !!id && activeTab === 'appointments',
    });

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-4 md:grid-cols-3">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <User className="h-12 w-12 mb-3 opacity-40" />
                <p>Không tìm thấy bệnh nhân</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/doctor/patients')}>
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    const patient = profile.patient;
    const summary = profile.summary;

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/doctor/patients')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <span>{patient.user?.fullName ?? 'Bệnh nhân'}</span>
                        {patient.profileCode && (
                            <Badge variant="outline" className="font-mono text-xs">{patient.profileCode}</Badge>
                        )}
                    </div>
                }
                subtitle={`Hồ sơ bệnh nhân · ${patient.user?.gender === 'MALE' ? 'Nam' : patient.user?.gender === 'FEMALE' ? 'Nữ' : ''}`}
            />

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.key
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Patient Info */}
                    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm md:col-span-2 lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-base">Thông tin cá nhân</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <InfoItem icon={User} label="Họ tên" value={patient.user?.fullName} />
                            <InfoItem icon={Calendar} label="Ngày sinh" value={formatDate(patient.user?.dateOfBirth)} />
                            <InfoItem icon={Phone} label="Điện thoại" value={patient.user?.phone} />
                            <InfoItem icon={Droplets} label="Nhóm máu" value={patient.bloodType} />
                        </CardContent>
                    </Card>

                    {/* Summary Stats */}
                    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Thống kê hồ sơ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <StatItem icon={FileText} label="Bệnh án" value={summary.totalMedicalRecords} color="text-blue-600" />
                            <StatItem icon={Activity} label="Chỉ số sinh hiệu" value={summary.totalVitalSigns} color="text-green-600" />
                            <StatItem icon={Pill} label="Đơn thuốc" value={summary.totalPrescriptions} color="text-purple-600" />
                        </CardContent>
                    </Card>

                    {/* Emergency & Insurance */}
                    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Bảo hiểm & Liên hệ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {patient.insuranceProvider ? (
                                <>
                                    <InfoItem icon={ShieldCheck} label="Bảo hiểm" value={patient.insuranceProvider} />
                                    <InfoItem icon={ShieldCheck} label="Số BH" value={patient.insuranceNumber} />
                                    <InfoItem icon={Calendar} label="Hết hạn" value={formatDate(patient.insuranceExpiry)} />
                                </>
                            ) : (
                                <p className="text-sm text-gray-400">Chưa có thông tin bảo hiểm</p>
                            )}
                            {patient.emergencyContactName && (
                                <>
                                    <div className="border-t pt-3 mt-3" />
                                    <InfoItem icon={Phone} label="Liên hệ khẩn" value={`${patient.emergencyContactName} (${patient.emergencyContactRelationship ?? ''})`} />
                                    <InfoItem icon={Phone} label="SĐT" value={patient.emergencyContactPhone} />
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'records' && (
                <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Lịch sử bệnh án</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recordsLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                            </div>
                        ) : !records?.length ? (
                            <div className="text-center py-12 text-gray-400">
                                <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                <p>Chưa có bệnh án nào</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {records.map((record) => (
                                    <div
                                        key={record.id}
                                        className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/doctor/medical-records/${record.id}`)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">{record.chiefComplaint || 'Không có lý do khám'}</p>
                                                <p className="text-xs text-gray-400 mt-1">{formatDate(record.createdAt)}</p>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className={record.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                                            >
                                                {record.status === 'COMPLETED' ? 'Hoàn thành' : record.status}
                                            </Badge>
                                        </div>
                                        {record.assessment && (
                                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{record.assessment}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === 'appointments' && (
                <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Lịch sử khám</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {appointmentsLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                            </div>
                        ) : !appointments?.items?.length ? (
                            <div className="text-center py-12 text-gray-400">
                                <Stethoscope className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                <p>Chưa có lịch hẹn nào</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {appointments.items.map((appt) => (
                                    <div
                                        key={appt.id}
                                        className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/doctor/appointments/${appt.id}`)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm text-blue-600">{appt.appointmentNumber}</span>
                                                <span className="text-sm text-gray-500">{formatDate(appt.scheduledAt)}</span>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    appt.status === 'COMPLETED' ? 'bg-green-100 text-green-700'
                                                        : appt.status === 'CANCELLED' ? 'bg-red-100 text-red-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                }
                                            >
                                                {appt.status === 'COMPLETED' ? 'Hoàn thành'
                                                    : appt.status === 'CANCELLED' ? 'Đã hủy'
                                                        : appt.status}
                                            </Badge>
                                        </div>
                                        {appt.chiefComplaint && (
                                            <p className="text-xs text-gray-500 mt-2">{appt.chiefComplaint}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
    return (
        <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-gray-400 shrink-0" />
            <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
            </div>
        </div>
    );
}

function StatItem({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-sm text-gray-600">{label}</span>
            </div>
            <span className={`text-lg font-bold ${color}`}>{value}</span>
        </div>
    );
}

export default PatientDetailPage;
