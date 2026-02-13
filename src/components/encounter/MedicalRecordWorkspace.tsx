// src/components/encounter/MedicalRecordWorkspace.tsx
import React, { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, ArrowRight, CheckCircle2, Loader2, AlertCircle, Lock, PanelLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HeaderUserMenu } from '@/components/layout/HeaderUserMenu';
import { getUser, logout } from '@/lib/auth';
import { format } from 'date-fns';
import type { Appointment } from '@/types/appointment';
import { type CreatePrescriptionDto, type CreateVitalSignDto, type MedicalRecord, type Prescription, type VitalSign, } from '@/types/medical';
import AIXraySection from '../medical/AIXraySection';
import { useDashboardLayout } from '@/components/layout/DashboardLayout';
import { PrescriptionEditor, type PrescriptionEditorHandle } from '@/components/medical/PrescriptionEditor';
import { medicalService } from '@/services/medical.service';
import { toast } from 'sonner';

interface MedicalRecordWorkspaceProps {
    // Data
    appointment: Appointment | null;
    medicalRecord: MedicalRecord | null;
    vitalSigns: VitalSign | null;
    prescriptions: Prescription[];
    editableVitals: Partial<CreateVitalSignDto>;
    vitalSignsChanged: boolean;
    followUpRequired: boolean;
    nextAppointmentDate: string;

    // States
    canEdit: boolean;
    isLocked: boolean;
    saving: boolean;
    autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
    autoSaveTime?: Date | null;

    // Actions
    onUpdateRecord: (field: keyof MedicalRecord, value: unknown) => void;
    onUpdateVitals: (field: keyof CreateVitalSignDto, value: unknown) => void;
    onSaveVitalSigns: () => Promise<void>;
    onSaveDraft: () => Promise<void>;
    onComplete: () => void;
    onSetFollowUpRequired: (value: boolean) => void;
    onSetNextAppointmentDate: (value: string) => void;
    onPrescriptionsChange?: (items: Prescription[]) => void;

    headerRightSlot?: React.ReactNode;
    topBannerSlot?: React.ReactNode;
    sidePanelSlot?: React.ReactNode;
    compact?: boolean;
}

function Section({
    title,
    children,
    right,
}: {
    title: string;
    children: React.ReactNode;
    right?: React.ReactNode;
}) {
    return (
        <Card className="rounded-xl border border-slate-200 shadow-sm">
            <CardContent className="p-0">
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
                    <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                        {title}
                    </div>
                    {right}
                </div>
                <div className="p-4 bg-white">{children}</div>
            </CardContent>
        </Card>
    );
}

function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <div className="text-sm text-slate-500">
                {label} {required && <span className="text-red-500">*</span>}
            </div>
            {children}
        </div>
    );
}

export const MedicalRecordWorkspace = React.memo(function MedicalRecordWorkspace({
    appointment,
    medicalRecord,
    vitalSigns,
    prescriptions: _prescriptions,
    editableVitals,
    vitalSignsChanged,
    followUpRequired,
    nextAppointmentDate,
    canEdit,
    isLocked,
    saving,
    autoSaveStatus,
    autoSaveTime,
    onUpdateRecord,
    onUpdateVitals,
    onSaveVitalSigns,
    onSaveDraft,
    onComplete,
    onSetFollowUpRequired,
    onSetNextAppointmentDate,
    headerRightSlot,
    topBannerSlot,
    sidePanelSlot,
    compact,
}: MedicalRecordWorkspaceProps) {
    const queryClient = useQueryClient();
    const { toggleSidebar } = useDashboardLayout();
    const navigate = useNavigate();
    const user = getUser();
    const [activeTab, setActiveTab] = useState<string>('info');
    const [savingVitals, setSavingVitals] = useState(false);

    // Use props directly
    const prescriptions = _prescriptions || [];

    const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);

    const prescriptionEditorRef = useRef<PrescriptionEditorHandle | null>(null);

    const contentRef = useRef<HTMLDivElement>(null);
    const appointmentId = appointment?.id;

    const infoRef = useRef<HTMLDivElement>(null);
    const clinicalRef = useRef<HTMLDivElement>(null);
    const paraclinicalRef = useRef<HTMLDivElement>(null);
    const diagnosisRef = useRef<HTMLDivElement>(null);
    const prescriptionRef = useRef<HTMLDivElement>(null);
    const followupRef = useRef<HTMLDivElement>(null);
    const notesRef = useRef<HTMLDivElement>(null);

    // Stable ref object
    const sectionRefs = React.useMemo(() => ({
        info: infoRef,
        clinical: clinicalRef,
        paraclinical: paraclinicalRef,
        diagnosis: diagnosisRef,
        prescription: prescriptionRef,
        followup: followupRef,
        notes: notesRef,
    }), []);
    const handleTabClick = (tabValue: string) => {
        setActiveTab(tabValue);
        const ref = sectionRefs[tabValue as keyof typeof sectionRefs];
        if (ref?.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleSaveVitals = async () => {
        setSavingVitals(true);
        try {
            await onSaveVitalSigns();
        } finally {
            setSavingVitals(false);
        }
    };

    // Mutations
    const savePrescriptionMutation = useMutation({
        mutationFn: async (payload: { id?: string, dto: CreatePrescriptionDto }) => {
            if (payload.id) {
                return await medicalService.updatePrescription(appointmentId!, payload.id, payload.dto);
            } else {
                return await medicalService.createPrescription(appointmentId!, payload.dto);
            }
        },
        onSuccess: () => {
            toast.success(editingPrescription ? 'Đã cập nhật toa thuốc' : 'Đã lưu toa thuốc');
            setEditingPrescription(null);
            queryClient.invalidateQueries({ queryKey: ['encounter', appointmentId] });
            prescriptionEditorRef.current?.resetDirty();
        },
        onError: (error: any) => {
            console.error('Save prescription error:', error);
            toast.error(error?.response?.data?.message || 'Lỗi khi lưu toa thuốc');
        }
    });

    const deletePrescriptionMutation = useMutation({
        mutationFn: async (id: string) => {
            return await medicalService.cancelPrescription(appointmentId!, id);
        },
        onSuccess: () => {
            toast.success('Đã xóa toa thuốc');
            queryClient.invalidateQueries({ queryKey: ['encounter', appointmentId] });
        },
        onError: (error: any) => {
            console.error('Delete prescription error:', error);
            toast.error(error?.response?.data?.message || 'Lỗi khi xóa toa thuốc');
        }
    });

    const handleSavePrescription = async (dto: CreatePrescriptionDto) => {
        if (!appointmentId) return;
        if (editingPrescription && editingPrescription.status !== 'ACTIVE') {
            toast.error('Chỉ được chỉnh sửa toa thuốc ở trạng thái ACTIVE.');
            return;
        }
        await savePrescriptionMutation.mutateAsync({
            id: editingPrescription?.id,
            dto
        });
    };

    const handleDeletePrescription = async (prescriptionId: string) => {
        if (!appointmentId) return;
        if (!window.confirm('Bạn có chắc chắn muốn xóa toa thuốc này?')) return;
        await deletePrescriptionMutation.mutateAsync(prescriptionId);
    };

    const savingPrescription = savePrescriptionMutation.isPending;

    const toNum = (v: unknown) => {
        const n = typeof v === 'number' ? v : Number(v);
        return Number.isFinite(n) ? n : null;
    };

    const h = toNum(editableVitals.height);
    const w = toNum(editableVitals.weight);

    const calculatedBmi =
        h && w && h > 0
            ? (w / ((h / 100) ** 2)).toFixed(2)
            : (vitalSigns?.bmi != null ? Number(vitalSigns.bmi).toFixed(2) : '');

    const hasVitalsInput = () => {
        const values = [
            editableVitals.height,
            editableVitals.weight,
            editableVitals.temperature,
            editableVitals.bloodPressure,
            editableVitals.heartRate,
            editableVitals.respiratoryRate,
            editableVitals.spo2,
        ];
        return values.some((v) => v !== undefined && v !== null && v !== '');
    };

    const ensureSavedBeforeProceed = async () => {
        try {
            if (hasVitalsInput()) {
                if (!vitalSigns || vitalSignsChanged) {
                    await onSaveVitalSigns();
                }
            }

            const editor = prescriptionEditorRef.current;
            if (editor && editor.hasAnyItem() && editor.hasUnsavedChanges()) {
                if (editingPrescription && editingPrescription.status !== 'ACTIVE') {
                    toast.error('Chỉ được chỉnh sửa toa thuốc ở trạng thái ACTIVE.');
                    return false;
                }
                const dto = editor.buildDto();
                if (!dto) return false;
                await handleSavePrescription(dto);
                editor.resetDirty();
            }

            return true;
        } catch (error) {
            console.error('Auto-save before proceed error:', error);
            toast.error('Kh?ng th? t? ??ng l?u d? li?u tr??c khi ti?p t?c.');
            return false;
        }
    };

    const handleSaveDraftClick = async () => {
        const ok = await ensureSavedBeforeProceed();
        if (!ok) return;
        await onSaveDraft();
    };

    const handleCompleteClick = async () => {
        const ok = await ensureSavedBeforeProceed();
        if (!ok) return;
        onComplete();
    };

    const getPrescriptionStatusMeta = (status?: string) => {
        switch (status) {
            case 'ACTIVE':
                return { label: 'Đang hoạt động', className: 'bg-green-500 text-white' };
            case 'FILLED':
                return { label: 'Đã cấp phát', className: 'bg-blue-500 text-white' };
            case 'PARTIALLY_FILLED':
                return { label: 'Cấp phát một phần', className: 'bg-amber-500 text-white' };
            case 'EXPIRED':
                return { label: 'Hết hạn', className: 'bg-slate-500 text-white' };
            case 'CANCELLED':
                return { label: 'Đã hủy', className: 'bg-red-500 text-white' };
            default:
                return { label: status || 'Không rõ', className: 'bg-slate-400 text-white' };
        }
    };

    return (
        <div className="h-full flex flex-col min-h-0">
            {/* ===== Top Bar ===== */}
            <div className="bg-white border-b sticky top-0 z-20">
                {/* Banner slot */}
                {topBannerSlot}

                <div className="px-3 md:px-6 py-2 md:py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                            <PanelLeft className="h-5 w-5" />
                            <span className="sr-only">Đóng/mở thanh bên</span>
                        </Button>
                        <div className="text-sm font-semibold text-slate-900">
                            {appointment?.patient?.profileCode} - {appointment?.patient?.user?.fullName}
                        </div>

                        {!isLocked ? (
                            <Badge className="bg-green-500 text-white">
                                <span className="animate-pulse mr-1">◉</span> Đang khám
                            </Badge>
                        ) : (
                            <Badge className="bg-gray-500 text-white">
                                <Lock className="h-3 w-3 mr-1" /> Đã khóa
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Auto-save status */}
                        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                            {autoSaveStatus === 'saving' && (
                                <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Đang lưu...</span>
                                </>
                            )}
                            {autoSaveStatus === 'saved' && autoSaveTime && (
                                <>
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    <span>Tự động lưu {format(autoSaveTime, 'HH:mm')}</span>
                                </>
                            )}
                            {autoSaveStatus === 'error' && (
                                <>
                                    <AlertCircle className="h-3 w-3 text-red-500" />
                                    <span>Lỗi tự động lưu</span>
                                </>
                            )}
                        </div>

                        {/* Header right slot */}
                        {headerRightSlot}
                        <HeaderUserMenu
                            user={{
                                name: user?.fullName || 'Bác sĩ',
                                avatarUrl: user?.avatarUrl,
                                deptLabel: (user as unknown as { department?: string })?.department,
                            }}
                            notificationCount={3}
                            onProfile={() => navigate('/doctor/profile')}
                            onSettings={() => navigate('/doctor/settings')}
                            onLogout={() => {
                                logout();
                                navigate('/login');
                            }}
                            onNotifications={() => navigate('/doctor/notifications')}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-3 md:px-6 pb-2 md:pb-3 overflow-x-auto">
                    <Tabs value={activeTab}>
                        <TabsList className="w-full justify-start whitespace-nowrap">
                            <TabsTrigger value="info" onClick={() => handleTabClick('info')}>
                                Thông tin
                            </TabsTrigger>
                            <TabsTrigger value="clinical" onClick={() => handleTabClick('clinical')}>
                                Lâm sàng
                            </TabsTrigger>
                            <TabsTrigger value="paraclinical" onClick={() => handleTabClick('paraclinical')}>
                                Cận lâm sàng
                            </TabsTrigger>
                            <TabsTrigger value="diagnosis" onClick={() => handleTabClick('diagnosis')}>
                                Chẩn đoán
                            </TabsTrigger>
                            <TabsTrigger value="prescription" onClick={() => handleTabClick('prescription')}>
                                Toa thuốc
                            </TabsTrigger>
                            <TabsTrigger value="followup" onClick={() => handleTabClick('followup')}>
                                Tái khám
                            </TabsTrigger>
                            <TabsTrigger value="notes" onClick={() => handleTabClick('notes')}>
                                Ghi chú
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* ===== Content ===== */}
            <div className="flex-1 flex min-h-0">
                {/* Main content */}
                <div ref={contentRef} className="flex-1 overflow-auto bg-slate-50">
                    <div className="px-3 md:px-6 py-3 md:py-4 space-y-6">
                        {/* SECTION: THÔNG TIN */}
                        <div ref={sectionRefs.info} className="space-y-4 scroll-mt-[120px]">
                            <Section title="THÔNG TIN">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-sm">
                                    {/* Patient info display */}
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <span className="text-slate-500">Họ và tên</span>
                                            <span className="font-medium">{appointment?.patient?.user?.fullName || '--'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-slate-500">Ngày sinh</span>
                                            <span className="font-medium">
                                                {appointment?.patient?.user?.dateOfBirth
                                                    ? format(new Date(appointment.patient.user.dateOfBirth), 'dd/MM/yyyy')
                                                    : '--'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <span className="text-slate-500">Giới tính</span>
                                            <span className="font-medium">{appointment?.patient?.user?.gender || '--'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-slate-500">Điện thoại</span>
                                            <span className="font-medium">{appointment?.patient?.user?.phone || '--'}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <span className="text-slate-500">Người thân</span>
                                            <span className="font-medium">{(appointment?.patient as unknown as Record<string, unknown>)?.emergencyContactName as string || '--'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-4">
                                    <Field label="Lý do khám" required>
                                        <Textarea
                                            value={medicalRecord?.chiefComplaint || ''}
                                            placeholder="Nhập lý do khám..."
                                            onChange={(e) => onUpdateRecord('chiefComplaint', e.target.value)}
                                            disabled={!canEdit || (editingPrescription != null && editingPrescription.status !== 'ACTIVE')}
                                            className="min-h-[80px]"
                                        />
                                    </Field>
                                </div>
                            </Section>

                            <Section
                                title="CHỈ SỐ SINH HIỆU"
                                right={
                                    vitalSignsChanged && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSaveVitals}
                                            disabled={!canEdit || savingVitals}
                                        >
                                            {savingVitals ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                            ) : (
                                                <Save className="h-4 w-4 mr-1" />
                                            )}
                                            Lưu
                                        </Button>
                                    )
                                }
                            >
                                <div className={compact ? "grid grid-cols-2 sm:grid-cols-4 gap-3" : "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3"}>
                                    <Field label="Chiều cao*">
                                        <Input
                                            type="number"
                                            value={editableVitals.height ?? ''}
                                            onChange={(e) => onUpdateVitals('height', e.target.value ? Number(e.target.value) : undefined)}
                                            disabled={!canEdit}
                                            placeholder="cm"
                                        />
                                    </Field>

                                    <Field label="Cân nặng*">
                                        <Input
                                            type="number"
                                            value={editableVitals.weight ?? ''}
                                            onChange={(e) => onUpdateVitals('weight', e.target.value ? Number(e.target.value) : undefined)}
                                            disabled={!canEdit}
                                            placeholder="kg"
                                        />
                                    </Field>

                                    <Field label="Nhiệt độ">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={editableVitals.temperature ?? ''}
                                            onChange={(e) => onUpdateVitals('temperature', e.target.value ? Number(e.target.value) : undefined)}
                                            disabled={!canEdit}
                                            placeholder="°C"
                                        />
                                    </Field>

                                    <Field label="Huyết áp">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={(editableVitals.bloodPressure || '').split('/')[0] || ''}
                                                onChange={(e) => {
                                                    const sys = e.target.value;
                                                    const diaParts = (editableVitals.bloodPressure || '').split('/');
                                                    const dia = diaParts.length > 1 ? diaParts[1] : '';
                                                    const newVal = (!sys && !dia) ? undefined : `${sys}/${dia}`;
                                                    onUpdateVitals('bloodPressure', newVal);
                                                }}
                                                disabled={!canEdit}
                                                placeholder="mmHg"
                                                className="text-center"
                                            />
                                            <span className="text-slate-400">/</span>
                                            <Input
                                                value={(editableVitals.bloodPressure || '').split('/').length > 1 ? (editableVitals.bloodPressure || '').split('/')[1] : ''}
                                                onChange={(e) => {
                                                    const dia = e.target.value;
                                                    const sys = (editableVitals.bloodPressure || '').split('/')[0] || '';
                                                    const newVal = (!sys && !dia) ? undefined : `${sys}/${dia}`;
                                                    onUpdateVitals('bloodPressure', newVal);
                                                }}
                                                disabled={!canEdit}
                                                placeholder="mmHg"
                                                className="text-center"
                                            />
                                        </div>
                                    </Field>

                                    <Field label="Mạch">
                                        <Input
                                            type="number"
                                            value={editableVitals.heartRate ?? ''}
                                            onChange={(e) => onUpdateVitals('heartRate', e.target.value ? Number(e.target.value) : undefined)}
                                            disabled={!canEdit}
                                            placeholder="lần/phút"
                                        />
                                    </Field>

                                    <Field label="Nhịp thở">
                                        <Input
                                            type="number"
                                            value={editableVitals.respiratoryRate ?? ''}
                                            onChange={(e) => onUpdateVitals('respiratoryRate', e.target.value ? Number(e.target.value) : undefined)}
                                            disabled={!canEdit}
                                            placeholder="lần/phút"
                                        />
                                    </Field>

                                    <Field label="SpO2">
                                        <Input
                                            type="number"
                                            value={editableVitals.spo2 ?? ''}
                                            onChange={(e) => onUpdateVitals('spo2', e.target.value ? Number(e.target.value) : undefined)}
                                            disabled={!canEdit}
                                            placeholder="%"
                                        />
                                    </Field>

                                    <Field label="BMI">
                                        <Input value={calculatedBmi} disabled placeholder="0.0" />
                                    </Field>
                                </div>
                            </Section>
                        </div>

                        {/* SECTION: LÂM SÀNG */}
                        <div ref={sectionRefs.clinical} className="space-y-4 scroll-mt-[120px]">
                            <Section title="HỎI BỆNH">
                                <Field label="Quá trình bệnh lý">
                                    <Textarea
                                        value={medicalRecord?.presentIllness || ''}
                                        placeholder="Mô tả diễn tiến bệnh..."
                                        onChange={(e) => onUpdateRecord('presentIllness', e.target.value)}
                                        disabled={!canEdit}
                                        className="min-h-[120px]"
                                    />
                                </Field>
                            </Section>

                            <Section title="LÂM SÀNG">
                                <Field label="Triệu chứng">
                                    <Textarea
                                        value={medicalRecord?.physicalExamNotes || ''}
                                        placeholder="Mô tả triệu chứng..."
                                        onChange={(e) => onUpdateRecord('physicalExamNotes', e.target.value)}
                                        disabled={!canEdit}
                                        className="min-h-[160px]"
                                    />
                                </Field>
                            </Section>

                            <Section title="TIỀN SỬ / THUỐC ĐANG DÙNG">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="Tiền sử bệnh">
                                        <Textarea
                                            value={medicalRecord?.medicalHistory || ''}
                                            onChange={(e) => onUpdateRecord('medicalHistory', e.target.value)}
                                            disabled={!canEdit}
                                            className="min-h-[80px]"
                                        />
                                    </Field>

                                    <Field label="Tiền sử phẫu thuật">
                                        <Textarea
                                            value={medicalRecord?.surgicalHistory || ''}
                                            onChange={(e) => onUpdateRecord('surgicalHistory', e.target.value)}
                                            disabled={!canEdit}
                                            className="min-h-[80px]"
                                        />
                                    </Field>

                                    <Field label="Tiền sử gia đình">
                                        <Textarea
                                            value={medicalRecord?.familyHistory || ''}
                                            onChange={(e) => onUpdateRecord('familyHistory', e.target.value)}
                                            disabled={!canEdit}
                                            className="min-h-[80px]"
                                        />
                                    </Field>

                                    <Field label="Dị ứng (mỗi dòng 1 loại)">
                                        <Textarea
                                            value={
                                                Array.isArray(medicalRecord?.allergies)
                                                    ? medicalRecord.allergies.join('\n')
                                                    : (medicalRecord?.allergies || '')
                                            }
                                            placeholder="VD: Hải sản..."
                                            onChange={(e) => onUpdateRecord('allergies', e.target.value.split('\n'))}
                                            disabled={!canEdit}
                                            className="min-h-[80px]"
                                        />
                                    </Field>

                                    <Field label="Bệnh mãn tính (mỗi dòng 1 bệnh)">
                                        <Textarea
                                            value={
                                                Array.isArray(medicalRecord?.chronicDiseases)
                                                    ? medicalRecord.chronicDiseases.join('\n')
                                                    : (medicalRecord?.chronicDiseases || '')
                                            }
                                            placeholder="VD: Cao huyết áp..."
                                            onChange={(e) => onUpdateRecord('chronicDiseases', e.target.value.split('\n'))}
                                            disabled={!canEdit}
                                            className="min-h-[80px]"
                                        />
                                    </Field>

                                    <Field label="Thuốc đang dùng (mỗi dòng 1 thuốc)">
                                        <Textarea
                                            value={
                                                Array.isArray(medicalRecord?.currentMedications)
                                                    ? medicalRecord.currentMedications.join('\n')
                                                    : (medicalRecord?.currentMedications || '')
                                            }
                                            placeholder="VD: Paracetamol 500mg..."
                                            onChange={(e) => onUpdateRecord('currentMedications', e.target.value.split('\n'))}
                                            disabled={!canEdit}
                                            className="min-h-[80px]"
                                        />
                                    </Field>
                                </div>
                            </Section>

                            <Section title="THÔNG TIN XÃ HỘI">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="Hút thuốc">
                                        <div className="flex gap-4 items-center">
                                            <Select
                                                value={medicalRecord?.smokingStatus ? 'YES' : 'NO'}
                                                onValueChange={(v) => onUpdateRecord('smokingStatus', v === 'YES')}
                                                disabled={!canEdit}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="NO">Không</SelectItem>
                                                    <SelectItem value="YES">Có</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {medicalRecord?.smokingStatus && (
                                                <div className="flex items-center gap-2 flex-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="Số năm"
                                                        value={medicalRecord?.smokingYears || ''}
                                                        onChange={(e) => onUpdateRecord('smokingYears', Number(e.target.value))}
                                                        disabled={!canEdit}
                                                        className="w-24"
                                                    />
                                                    <span className="text-sm text-slate-500">năm</span>
                                                </div>
                                            )}
                                        </div>
                                    </Field>

                                    <Field label="Uống rượu bia">
                                        <Select
                                            value={medicalRecord?.alcoholConsumption ? 'YES' : 'NO'}
                                            onValueChange={(v) => onUpdateRecord('alcoholConsumption', v === 'YES')}
                                            disabled={!canEdit}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NO">Không</SelectItem>
                                                <SelectItem value="YES">Có</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    <div className="md:col-span-2">
                                        <Field label="Nghề nghiệp / Yếu tố nguy cơ">
                                            <Input
                                                value={medicalRecord?.occupation || ''}
                                                onChange={(e) => onUpdateRecord('occupation', e.target.value)}
                                                disabled={!canEdit}
                                                placeholder="VD: Công nhân mỏ than..."
                                            />
                                        </Field>
                                    </div>
                                </div>
                            </Section>
                        </div>

                        {/* SECTION:PHÂN TÍCH X-QUANG AI */}
                        <div ref={sectionRefs.paraclinical} className="space-y-4 scroll-mt-[120px]">
                            <Section title="PHÂN TÍCH X-QUANG AI">
                                {appointment?.patient?.id && (
                                    <AIXraySection
                                        patientId={appointment.patient.id}
                                        medicalRecordId={medicalRecord?.id}
                                        disabled={!canEdit}
                                        onAnalysisComplete={(result) => {
                                            console.log('AI Analysis complete:', result);
                                        }}
                                    />
                                )}
                            </Section>
                        </div>

                        {/* SECTION: CHẨN ĐOÁN */}
                        <div ref={sectionRefs.diagnosis} className="space-y-4 scroll-mt-[120px]">
                            <Section title="CHẨN ĐOÁN">
                                <Field label="Chẩn đoán">
                                    <Textarea
                                        value={medicalRecord?.assessment || ''}
                                        placeholder="Chẩn đoán..."
                                        onChange={(e) => onUpdateRecord('assessment', e.target.value)}
                                        disabled={!canEdit}
                                        className="min-h-[120px]"
                                    />
                                </Field>

                                <div className="mt-4">
                                    <Field label="Kế hoạch điều trị">
                                        <Textarea
                                            value={medicalRecord?.treatmentPlan || ''}
                                            placeholder="Kế hoạch điều trị..."
                                            onChange={(e) => onUpdateRecord('treatmentPlan', e.target.value)}
                                            disabled={!canEdit}
                                            className="min-h-[140px]"
                                        />
                                    </Field>
                                </div>
                            </Section>
                        </div>

                        {/* SECTION: TOA THUỐC */}
                        <div ref={sectionRefs.prescription} className="space-y-4 scroll-mt-[120px]">
                            <Section title="TOA THUỐC">
                                {prescriptions.length > 0 && (
                                    <div className="space-y-3 mb-6">
                                        {prescriptions.map((p, idx) => (
                                            <Card key={p.id || idx} className="rounded-xl border-blue-100 bg-blue-50/50">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-bold text-blue-700">Toa thuốc #{idx + 1}</div>
                                                            <Badge variant="outline" className="bg-white">
                                                                {p.createdAt ? format(new Date(p.createdAt), 'dd/MM/yyyy HH:mm') : '--'}
                                                            </Badge>
                                                        </div>
                                                        {(() => {
                                                            const statusMeta = getPrescriptionStatusMeta(p.status);
                                                            return (
                                                                <Badge className={statusMeta.className}>
                                                                    {statusMeta.label}
                                                                </Badge>
                                                            );
                                                        })()}

                                                    </div>

                                                    {canEdit && p.status === 'ACTIVE' && (
                                                        <div className="flex justify-end gap-2 mb-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                onClick={() => setEditingPrescription(p)}
                                                            >
                                                                ✏️ Sửa
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleDeletePrescription(p.id)}
                                                            >
                                                                🗑️ Xóa
                                                            </Button>
                                                        </div>
                                                    )}

                                                    <div className="space-y-2 bg-white rounded-md p-3 border border-blue-100">
                                                        {p.items?.length ? (
                                                            p.items.map((it, i2) => (
                                                                <div key={i2} className="flex items-center justify-between border-b border-dashed border-gray-100 py-2 last:border-0">
                                                                    <div className="flex-1">
                                                                        <div className="font-medium text-slate-900">{it.medicineName || '--'}</div>
                                                                        <div className="text-sm text-slate-500 flex gap-2">
                                                                            <span className="bg-slate-100 px-1.5 rounded text-xs text-slate-600">{it.dosage || '--'}</span>
                                                                            <span className="text-xs text-slate-400">•</span>
                                                                            <span className="italic">{it.frequency || '--'}</span>
                                                                        </div>
                                                                        {it.instructions && <div className="text-xs text-blue-600 mt-0.5">HD: {it.instructions}</div>}
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="font-bold text-slate-700">{it.quantity} {it.unit}</div>
                                                                        <div className="text-xs text-slate-400">{it.duration || '--'}</div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-sm text-slate-500">Không có thuốc</div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                {canEdit ? (
                                    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                                        <PrescriptionEditor
                                            ref={prescriptionEditorRef}
                                            key={editingPrescription?.id || 'new'}
                                            appointmentId={appointmentId || ''}
                                            onSave={handleSavePrescription}
                                            loading={savingPrescription}
                                            initialDiagnosis={medicalRecord?.assessment || medicalRecord?.diagnosisNotes || ''}
                                            disabled={!canEdit}
                                            initialData={editingPrescription || undefined}
                                            onCancel={() => setEditingPrescription(null)}
                                        />
                                    </div>
                                ) : (
                                    prescriptions.length === 0 && (
                                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                                            Không có toa thuốc nào và lượt khám đã kết thúc.
                                        </div>
                                    )
                                )}
                            </Section>
                        </div>

                        {/* SECTION: TÁI KHÁM */}
                        <div ref={sectionRefs.followup} className="space-y-4 scroll-mt-[120px]">
                            <Section title="HẸN KHÁM">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Field label="Có cần tái khám?">
                                            <div className="flex items-center gap-2 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={followUpRequired}
                                                    onChange={(e) => onSetFollowUpRequired(e.target.checked)}
                                                    disabled={!canEdit}
                                                    className="h-4 w-4 accent-blue-600"
                                                />
                                                <span className="text-sm text-slate-600">Có</span>
                                            </div>
                                        </Field>
                                    </div>

                                    <div>
                                        <Field label="Ngày tái khám">
                                            <Input
                                                type="date"
                                                value={nextAppointmentDate}
                                                onChange={(e) => onSetNextAppointmentDate(e.target.value)}
                                                disabled={!canEdit || !followUpRequired}
                                            />
                                        </Field>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <Field label="Hướng dẫn tái khám">
                                        <Textarea
                                            value={medicalRecord?.followUpInstructions || ''}
                                            placeholder="VD: Tái khám sau 7 ngày..."
                                            onChange={(e) => onUpdateRecord('followUpInstructions', e.target.value)}
                                            disabled={!canEdit}
                                            className="min-h-[100px]"
                                        />
                                    </Field>
                                </div>
                            </Section>
                        </div>

                        {/* SECTION: GHI CHÚ */}
                        <div ref={sectionRefs.notes} className="space-y-4 scroll-mt-[120px]">
                            <Section title="GHI CHÚ">
                                <Field label="Ghi chú diễn biến">
                                    <Textarea
                                        value={medicalRecord?.progressNotes || ''}
                                        placeholder="Nhập ghi chú theo dõi..."
                                        onChange={(e) => onUpdateRecord('progressNotes', e.target.value)}
                                        disabled={!canEdit}
                                        className="min-h-[140px]"
                                    />
                                </Field>
                            </Section>
                        </div>
                    </div>
                </div>

                {/* ===== Side Panel Slot (hidden on mobile) ===== */}
                {sidePanelSlot && (
                    <div className="hidden lg:block lg:w-[400px] border-l bg-white overflow-hidden">
                        {sidePanelSlot}
                    </div>
                )}
            </div>

            {/* ===== Footer ===== */}
            <div className="bg-white border-t sticky bottom-0 z-20">
                <div className="px-3 md:px-6 py-2 md:py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
                    {!isLocked && canEdit && (
                        <>
                            <Button variant="outline" onClick={handleSaveDraftClick} disabled={saving}>
                                <Save className="h-4 w-4 mr-2" />
                                Lưu tạm
                            </Button>
                            <Button
                                onClick={handleCompleteClick}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Hoàn thành
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
})
