import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Download, Printer, Save, Calendar, FileCheck, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { medicalService } from '@/services/medical.service';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { toast } from 'sonner';
import {
    MedicalRecordStatusEnum,
    type UpdateMedicalRecordDto,
} from '@/types/medical';
import type { AiAnalysisResponse } from '@/types/screening';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SafeRichText } from '@/components/common/SafeRichText';
import AiAnalysisResult from '@/components/screening/AiAnalysisResult';

export default function MedicalRecordDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState('medical-record');
    const [selectedPrescription, setSelectedPrescription] = useState<{ id?: string; pdfUrl?: string } | null>(null);
    const [selectedScreeningId, setSelectedScreeningId] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);
    const [presentIllnessViewMode] = useState<'preview' | 'source'>('preview');

    const { data: record, isLoading, error } = useQuery({
        queryKey: ['medical-record', id],
        queryFn: () => medicalService.getDetail(id!),
        enabled: !!id,
    });

    const patientInfo = record ? {
        fullName: record.patient.fullName,
        gender: record.patient.gender === 'MALE' ? 'Nam' : 'Nữ',
        dateOfBirth: new Date(record.patient.dateOfBirth).toLocaleDateString('vi-VN'),
        recordNumber: record.recordNumber,
        appointmentCode: record.appointment.appointmentNumber,
        signedStatus: record.signedStatus === 'SIGNED' ? 'Đã ký' : 'Chưa ký',
    } : null;

    const isRecordClosed = record?.status === MedicalRecordStatusEnum.COMPLETED;

    // Form State
    const [formData, setFormData] = useState<UpdateMedicalRecordDto & {
        recordType: string;
        treatmentGiven: string;
        dischargeDiagnosis: string;
        treatmentStartDate: string;
        treatmentEndDate: string;
        primaryDiagnosis: string;
        secondaryDiagnosis: string;
        dischargeCondition: string;
        fullRecordSummary: string;
        isDigitallySigned: boolean;
        systemsReview: string;
    }>({
        chiefComplaint: record?.chiefComplaint || "",
        presentIllness: record?.presentIllness || "",
        medicalHistory: record?.medicalHistory || "",
        surgicalHistory: record?.surgicalHistory || "",
        familyHistory: record?.familyHistory || "",
        allergies: Array.isArray(record?.allergies) ? record.allergies : [],
        chronicDiseases: Array.isArray(record?.chronicDiseases) ? record.chronicDiseases : [],
        currentMedications: Array.isArray(record?.currentMedications) ? record.currentMedications : [],
        smokingStatus: record?.smokingStatus || false,
        smokingYears: record?.smokingYears || 0,
        alcoholConsumption: record?.alcoholConsumption || false,
        physicalExamNotes: record?.physicalExamNotes || "",
        assessment: record?.assessment || "",
        diagnosis: record?.diagnosis || "",
        treatmentPlan: record?.treatmentPlan || "",
        followUpInstructions: record?.followUpInstructions || "",
        progressNotes: record?.progressNotes || "",
        recordType: record?.recordType || "Bệnh án Ngoại trú chung",
        systemsReview: record?.systemsReview || "",
        treatmentGiven: record?.treatmentGiven || "",
        dischargeDiagnosis: record?.dischargeDiagnosis || "",
        treatmentStartDate: record?.treatmentStartDate || "",
        treatmentEndDate: record?.treatmentEndDate || "",
        primaryDiagnosis: record?.primaryDiagnosis || "",
        secondaryDiagnosis: record?.secondaryDiagnosis || "",
        dischargeCondition: record?.dischargeCondition || "",
        fullRecordSummary: record?.fullRecordSummary || "",
        isDigitallySigned: false,
    });

    useEffect(() => {
        if (record) {
            setFormData(prev => ({
                ...prev,

                // ===== THÔNG TIN HÀNH CHÍNH =====
                recordType: record.recordType || "Bệnh án Ngoại trú chung",

                // ===== THÔNG TIN ĐẾN KHÁM =====
                chiefComplaint: record.chiefComplaint || "",
                presentIllness: record.presentIllness || "",

                // ===== HỎI BỆNH =====
                medicalHistory: record.medicalHistory || "",
                surgicalHistory: record.surgicalHistory || "",
                familyHistory: record.familyHistory || "",

                // Xử lý array fields
                allergies: Array.isArray(record.allergies)
                    ? record.allergies
                    : (typeof record.allergies === 'string' ? [record.allergies] : []),
                chronicDiseases: Array.isArray(record.chronicDiseases)
                    ? record.chronicDiseases
                    : (typeof record.chronicDiseases === 'string' ? [record.chronicDiseases] : []),
                currentMedications: Array.isArray(record.currentMedications)
                    ? record.currentMedications
                    : (typeof record.currentMedications === 'string' ? [record.currentMedications] : []),

                // ===== LỐI SỐNG =====
                smokingStatus: record.smokingStatus || false,
                smokingYears: record.smokingYears || 0,
                alcoholConsumption: record.alcoholConsumption || false,

                // ===== KHÁM BỆNH =====
                physicalExamNotes: record.physicalExamNotes || "",
                systemsReview: record.systemsReview || "",
                assessment: record.assessment || "",

                // ===== CHẨN ĐOÁN & KẾ HOẠCH =====
                diagnosis: record.diagnosis || "",
                treatmentPlan: record.treatmentPlan || "",
                treatmentGiven: record.treatmentGiven || "",
                dischargeDiagnosis: record.dischargeDiagnosis || "",

                // Xử lý date fields
                treatmentStartDate: record.treatmentStartDate
                    ? new Date(record.treatmentStartDate).toISOString().split('T')[0]
                    : "",
                treatmentEndDate: record.treatmentEndDate
                    ? new Date(record.treatmentEndDate).toISOString().split('T')[0]
                    : "",

                // ===== THEO DÕI & TỔNG KẾT =====
                progressNotes: record.progressNotes || "",
                followUpInstructions: record.followUpInstructions || "",

                // ===== CHẨN ĐOÁN RA VIỆN =====
                primaryDiagnosis: record.primaryDiagnosis || "",
                secondaryDiagnosis: record.secondaryDiagnosis || "",
                dischargeCondition: record.dischargeCondition || "",

                // ===== TRẠNG THÁI =====
                isDigitallySigned: record.signedStatus === 'SIGNED',
            }));
            setIsDirty(false);
        }
    }, [record]);

    const extractErrorMessage = (error: unknown, fallback: string): string => {
        const err = error as { message?: string | string[] };
        if (Array.isArray(err?.message)) return err.message.join(', ');
        if (typeof err?.message === 'string' && err.message.trim()) return err.message;
        return fallback;
    };

    const updateMutation = useMutation({
        mutationFn: (data: UpdateMedicalRecordDto) => {
            return medicalService.updateMedicalRecord(record!.id, data);
        },
        onSuccess: () => {
            toast.success('Lưu bệnh án thành công');
            setIsDirty(false);
            queryClient.invalidateQueries({ queryKey: ['medical-record', id] });
        },
        onError: (err) => {
            console.error(err);
            toast.error(extractErrorMessage(err, 'Lỗi khi lưu bệnh án'));
        },
    });

    const completeRecordMutation = useMutation({
        mutationFn: () => medicalService.completeMedicalRecord(id!),
        onSuccess: () => {
            toast.success('Đã đóng bệnh án');
            queryClient.invalidateQueries({ queryKey: ['medical-record', id] });
        },
        onError: (err) => {
            console.error(err);
            toast.error(extractErrorMessage(err, 'Không thể đóng bệnh án'));
        },
    });

    const reopenRecordMutation = useMutation({
        mutationFn: () => medicalService.reopenMedicalRecord(id!),
        onSuccess: () => {
            toast.success('Đã mở lại bệnh án');
            queryClient.invalidateQueries({ queryKey: ['medical-record', id] });
        },
        onError: (err) => {
            console.error(err);
            const msg = extractErrorMessage(err, '');
            if (msg.includes('REOPEN_WINDOW_EXPIRED') || msg.includes('REOPEN_FORBIDDEN')) {
                toast.error('Đã quá thời hạn mở lại. Vui lòng liên hệ Admin.');
            } else {
                toast.error(msg || 'Không thể mở lại bệnh án');
            }
        },
    });

    // Sign Medical Record Mutation
    const signMutation = useMutation({
        mutationFn: () => {
            return medicalService.signMedicalRecord(id!, { recordIds: [id!] });
        },
        onSuccess: () => {
            toast.success('Ký số thành công');
            queryClient.invalidateQueries({ queryKey: ['medical-record', id] });
        },
        onError: (err) => {
            console.error(err);
            toast.error(extractErrorMessage(err, 'Lỗi khi ký số'));
        },
    });

    const handleInputChange = (field: keyof typeof formData, value: unknown) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const buildUpdateDto = (): UpdateMedicalRecordDto => {
        return {
            recordType: formData.recordType,
            chiefComplaint: formData.chiefComplaint,
            presentIllness: formData.presentIllness,
            medicalHistory: formData.medicalHistory,
            surgicalHistory: formData.surgicalHistory,
            familyHistory: formData.familyHistory,
            allergies: Array.isArray(formData.allergies)
                ? formData.allergies
                : (typeof formData.allergies === 'string' ? [formData.allergies] : []),
            chronicDiseases: formData.chronicDiseases,
            currentMedications: formData.currentMedications,
            smokingStatus: formData.smokingStatus,
            smokingYears: formData.smokingYears,
            alcoholConsumption: formData.alcoholConsumption,
            physicalExamNotes: formData.physicalExamNotes,
            systemsReview: formData.systemsReview,
            assessment: formData.assessment,
            diagnosis: formData.diagnosis,
            treatmentPlan: formData.treatmentPlan,
            treatmentGiven: formData.treatmentGiven,
            ...(formData.treatmentStartDate && { treatmentStartDate: formData.treatmentStartDate }),
            ...(formData.treatmentEndDate && { treatmentEndDate: formData.treatmentEndDate }),
            ...(formData.dischargeDiagnosis && { dischargeDiagnosis: formData.dischargeDiagnosis }),
            fullRecordSummary: formData.fullRecordSummary,
            progressNotes: formData.progressNotes,
            followUpInstructions: formData.followUpInstructions,
            primaryDiagnosis: formData.primaryDiagnosis,
            secondaryDiagnosis: formData.secondaryDiagnosis,
            dischargeCondition: formData.dischargeCondition,
        };
    };

    const handleSave = async (): Promise<boolean> => {
        if (!record || isRecordClosed) return false;
        try {
            await updateMutation.mutateAsync(buildUpdateDto());
            return true;
        } catch {
            return false;
        }
    };

    const handleSign = () => {
        if (!record) return;
        if (confirm('Bạn có chắc chắn muốn ký số bệnh án này? Hành động này không thể hoàn tác.')) {
            signMutation.mutate();
        }
    };

    const handleToggleRecordClosed = async (nextClosed: boolean) => {
        if (!record || !id) return;
        if (nextClosed === isRecordClosed) return;

        if (nextClosed) {
            // Mở dialog xác nhận thay vì lưu/đóng ngay
            setIsConfirmCloseOpen(true);
            return;
        }

        // Mở lại bệnh án thì gọi api ngay
        await reopenRecordMutation.mutateAsync();
    };

    const executeCloseRecord = async () => {
        if (!record || !id) return;
        if (isDirty) {
            const saved = await handleSave();
            if (!saved) return;
        }
        await completeRecordMutation.mutateAsync();
    };

    const handlePrintRecord = async () => {
        if (!id) return;
        try {
            const { pdfUrl } = await medicalService.generateMedicalRecordPdf(id);
            if (!pdfUrl) return toast.error('Không tìm thấy link PDF');

            const response = await fetch(pdfUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = blobUrl;
            document.body.appendChild(iframe);

            iframe.onload = () => {
                setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                        URL.revokeObjectURL(blobUrl);
                    }, 1000);
                }, 500);
            };
        } catch {
            toast.error('Không thể tạo file in bệnh án');
        }
    };

    const handleDownloadRecord = async () => {
        if (!id) return;
        try {
            const { pdfUrl } = await medicalService.generateMedicalRecordPdf(id);
            if (!pdfUrl) return toast.error('Không tìm thấy link PDF');

            const response = await fetch(pdfUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `benh-an-${record?.recordNumber ?? id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        } catch {
            toast.error('Không thể tải bệnh án');
        }
    };

    const handleGeneratePdf = async (prescriptionId: string) => {
        setIsGeneratingPdf(true);
        try {
            const { pdfUrl } = await medicalService.generatePrescriptionPdf(prescriptionId);
            if (pdfUrl) {
                setSelectedPrescription((prev) => prev ? ({ ...prev, pdfUrl }) : { pdfUrl });
                toast.success('Đã tạo bản in PDF thành công');
                queryClient.invalidateQueries({ queryKey: ['medical-record', id] });
            }
        } catch {
            toast.error('Không thể tạo file PDF');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const tabs = [
        { id: 'medical-record', label: 'Bệnh án' },
        { id: 'prescription', label: 'Phiếu điều trị' },
        { id: 'screening', label: 'Tầm soát' },
        { id: 'nursing-care', label: 'Phiếu chăm sóc' },
        { id: 'discharge-summary', label: 'Tổng kết bệnh án' }
    ];

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }

    if (error || !record) {
        return <div className="p-8 text-center">Không tìm thấy bệnh án. <Button variant="link" onClick={() => navigate(-1)}>Quay lại</Button></div>;
    }

    const isTogglePending = completeRecordMutation.isPending || reopenRecordMutation.isPending;
    const isFormDisabled = isRecordClosed || updateMutation.isPending || isTogglePending;

    return (
        <div className="h-full overflow-hidden flex flex-col bg-gray-50">
            {/* Header */}
            <PageHeader
                title="Chi tiết bệnh án điện tử"
                subtitle={
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/doctor/medical-records')}>Danh sách bệnh án</span>
                        <span>›</span>
                        <span className="text-gray-900 font-medium">Chi tiết bệnh án</span>
                    </div>
                }
                className="bg-white border-b border-gray-200 px-6 py-4 shrink-0"
            />

            {/* Main Content */}
            <div className="flex-1 min-h-0 p-2">
                <ResizablePanelGroup direction="horizontal" className="h-full">

                    {/* Left Column */}
                    <ResizablePanel defaultSize={50} minSize={30} className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden flex flex-col">

                        {/* Patient Info */}
                        <div className="px-6 pb-2 pt-4 border-b border-gray-100 flex-shrink-0">
                            <div className="grid grid-cols-3 gap-y-4 gap-x-6">
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Họ và tên</p>
                                    <p className="text-sm font-medium text-gray-900">{patientInfo?.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Giới tính</p>
                                    <p className="text-sm font-medium text-gray-900">{patientInfo?.gender}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Ngày sinh</p>
                                    <p className="text-sm font-medium text-gray-900">{patientInfo?.dateOfBirth}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Mã bệnh án</p>
                                    <p className="text-sm font-medium text-gray-900">{patientInfo?.recordNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Mã phiếu khám</p>
                                    <p className="text-sm font-medium text-gray-900">{patientInfo?.appointmentCode}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Trạng thái bệnh án</p>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isRecordClosed
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-amber-100 text-amber-700'
                                            }`}
                                    >
                                        {isRecordClosed ? 'Đã đóng' : 'Đang xử lý'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Trạng thái ký số</p>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-100 rounded-full">
                                        <FileCheck className={`w-3 h-3 ${record.signedStatus === 'SIGNED' ? 'text-green-500' : 'text-gray-500'}`} />
                                        <span className={`text-xs font-medium ${record.signedStatus === 'SIGNED' ? 'text-green-700' : 'text-gray-600'}`}>
                                            {patientInfo?.signedStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="shrink-0 px-6 py-2 border-b border-gray-100">
                            <div className="flex gap-1 bg-gray-100/80 p-1 rounded-lg w-full overflow-x-auto">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap flex-1 ${activeTab === tab.id
                                            ? 'text-gray-900 bg-white shadow-sm ring-1 ring-gray-900/5'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Form Area Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6">

                            {/* TAB: BỆNH ÁN */}
                            {activeTab === 'medical-record' && (
                                <fieldset disabled={isFormDisabled} className="space-y-6">
                                    {/* Thông tin hành chính */}
                                    <section>
                                        <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                            Thông tin hành chính
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Loại bệnh án
                                                </label>
                                                <select
                                                    value={formData.recordType}
                                                    onChange={(e) => handleInputChange('recordType', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option>Bệnh án Ngoại trú chung</option>
                                                    <option>Bệnh án Nội trú</option>
                                                    <option>Bệnh án Cấp cứu</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Ngày tạo
                                                </label>
                                                <input
                                                    type="date"
                                                    value={record.createdAt ? new Date(record.createdAt).toISOString().split('T')[0] : ''}
                                                    disabled
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Thông tin đến khám */}
                                    <section>
                                        <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                            Thông tin đến khám
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Lý do khám / Lý do vào viện
                                                </label>
                                                <textarea
                                                    value={formData.chiefComplaint || ''}
                                                    onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                                                    rows={3}
                                                    placeholder="Nhập lý do khám..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Bệnh sử hiện tại / Quá trình bệnh lý
                                                </label>
                                                <div className="space-y-2">
                                                    {/* <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant={presentIllnessViewMode === 'preview' ? 'default' : 'outline'}
                                                            onClick={() => setPresentIllnessViewMode('preview')}
                                                        >
                                                            Preview
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant={presentIllnessViewMode === 'source' ? 'default' : 'outline'}
                                                            onClick={() => setPresentIllnessViewMode('source')}
                                                        >
                                                            Source
                                                        </Button>
                                                    </div> */}
                                                    {presentIllnessViewMode === 'preview' ? (
                                                        <div className="min-h-[80px] rounded-md border border-gray-300 bg-gray-50 p-3">
                                                            <SafeRichText
                                                                html={formData.presentIllness || ''}
                                                                className="[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <textarea
                                                            value={formData.presentIllness || ''}
                                                            onChange={(e) => handleInputChange('presentIllness', e.target.value)}
                                                            rows={3}
                                                            placeholder="Nhập quá trình bệnh lý..."
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Chỉ số sinh hiệu */}
                                    <section>
                                        <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                            Chỉ số sinh hiệu (Ghi nhận gần nhất)
                                        </h3>
                                        <div className="grid grid-cols-4 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Chiều cao (cm)</label>
                                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm">{record.vitalSigns.height || '--'}</div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Cân nặng (kg)</label>
                                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm">{record.vitalSigns.weight || '--'}</div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Nhiệt độ (°C)</label>
                                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm">{record.vitalSigns.temperature || '--'}</div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Huyết áp (mmHg)</label>
                                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm">{record.vitalSigns.bloodPressure || '--'}</div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Nhịp tim (bpm)</label>
                                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm">{record.vitalSigns.heartRate || '--'}</div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Nhịp thở (bpm)</label>
                                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm">{record.vitalSigns.respiratoryRate || '--'}</div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">SpO2 (%)</label>
                                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm">{record.vitalSigns.spo2 || record.vitalSigns.spO2 || '--'}</div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Hỏi bệnh */}
                                    <section>
                                        <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                            Hỏi bệnh
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Dị ứng</label>
                                                <textarea
                                                    value={Array.isArray(formData.allergies) ? formData.allergies.join('\n') : (formData.allergies || '')}
                                                    onChange={(e) => handleInputChange('allergies', e.target.value.split('\n'))}
                                                    rows={3}
                                                    placeholder="Nhập dị ứng (mỗi dòng một loại)..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Thuốc hiện tại đang sử dụng</label>
                                                <textarea
                                                    value={Array.isArray(formData.currentMedications) ? formData.currentMedications.join('\n') : (formData.currentMedications || '')}
                                                    onChange={(e) => handleInputChange('currentMedications', e.target.value.split('\n'))}
                                                    rows={3}
                                                    placeholder="Nhập thuốc hiện tại đang sử dụng (mỗi dòng một loại)..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tiền sử bệnh / Tiền sử bản thân
                                                </label>
                                                <textarea
                                                    value={formData.medicalHistory || ''}
                                                    onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                                                    rows={3}
                                                    placeholder="Nhập tiền sử bệnh..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tiền sử phẫu thuật
                                                </label>
                                                <textarea
                                                    value={formData.surgicalHistory || ''}
                                                    onChange={(e) => handleInputChange('surgicalHistory', e.target.value)}
                                                    rows={2}
                                                    placeholder="Nhập tiền sử phẫu thuật..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tiền sử gia đình
                                                </label>
                                                <textarea
                                                    value={formData.familyHistory || ''}
                                                    onChange={(e) => handleInputChange('familyHistory', e.target.value)}
                                                    rows={2}
                                                    placeholder="Nhập tiền sử gia đình..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Lối sống */}
                                    <section>
                                        <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                            Lối sống
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.smokingStatus || false}
                                                        onChange={(e) => handleInputChange('smokingStatus', e.target.checked)}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">Hút thuốc</span>
                                                </label>
                                                {formData.smokingStatus && (
                                                    <input
                                                        type="number"
                                                        value={formData.smokingYears || ''}
                                                        onChange={(e) => handleInputChange('smokingYears', Number(e.target.value))}
                                                        placeholder="Số năm hút"
                                                        className="w-32 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.alcoholConsumption || false}
                                                        onChange={(e) => handleInputChange('alcoholConsumption', e.target.checked)}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">Uống rượu/bia</span>
                                                </label>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Khám bệnh */}
                                    <section>
                                        <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                            Khám bệnh
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Ghi chú khám lâm sàng / Khám toàn thân
                                                </label>
                                                <textarea
                                                    value={formData.physicalExamNotes || ''}
                                                    onChange={(e) => handleInputChange('physicalExamNotes', e.target.value)}
                                                    rows={4}
                                                    placeholder="Nhập ghi chú khám lâm sàng..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Khám theo hệ cơ quan / Các bộ phận
                                                </label>
                                                <textarea
                                                    value={formData.systemsReview || ''}
                                                    onChange={(e) => handleInputChange('systemsReview', e.target.value)}
                                                    rows={4}
                                                    placeholder="Nhập kết quả khám theo hệ cơ quan..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Đánh giá của bác sĩ / Tóm tắt lâm sàng
                                                </label>
                                                <textarea
                                                    value={formData.assessment || ''}
                                                    onChange={(e) => handleInputChange('assessment', e.target.value)}
                                                    rows={3}
                                                    placeholder="Nhập đánh giá..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Chẩn đoán & Kế hoạch */}
                                    <section>
                                        <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                            Chẩn đoán & Kế hoạch điều trị
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Chẩn đoán</label>
                                                <textarea
                                                    value={formData.diagnosis || ''}
                                                    onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                                                    rows={3}
                                                    placeholder="Nhập chẩn đoán..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phác đồ điều trị</label>
                                                <textarea
                                                    value={formData.treatmentPlan || ''}
                                                    onChange={(e) => handleInputChange('treatmentPlan', e.target.value)}
                                                    rows={3}
                                                    placeholder="Nhập phác đồ điều trị..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Đã xử lý (thuốc/chăm sóc)
                                                </label>
                                                <textarea
                                                    value={formData.treatmentGiven || ''}
                                                    onChange={(e) => handleInputChange('treatmentGiven', e.target.value)}
                                                    rows={2}
                                                    placeholder="Nhập xử lý đã thực hiện..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Điều trị ngoại trú từ ngày
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={formData.treatmentStartDate || ''}
                                                        onChange={(e) => handleInputChange('treatmentStartDate', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                                                    <input
                                                        type="date"
                                                        value={formData.treatmentEndDate || ''}
                                                        onChange={(e) => handleInputChange('treatmentEndDate', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </fieldset>
                            )}

                            {/* TAB: PHIẾU ĐIỀU TRỊ */}
                            {activeTab === 'prescription' && (
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-gray-900 mb-4">Danh sách toa thuốc</h3>
                                    {record.prescriptions && Array.isArray(record.prescriptions) && record.prescriptions.length > 0 ? (
                                        record.prescriptions.map((prescription) => (
                                            typeof prescription === 'object' && prescription !== null ? (
                                                <button
                                                    key={prescription.id}
                                                    onClick={() => setSelectedPrescription(prescription)}
                                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedPrescription?.id === prescription.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium text-gray-900">{prescription.prescriptionNumber}</div>
                                                            <div className="text-sm text-gray-500 mt-1">
                                                                <Calendar className="w-4 h-4 inline mr-1" />
                                                                {new Date(prescription.createdAt).toLocaleDateString('vi-VN')} {new Date(prescription.createdAt).toLocaleTimeString('vi-VN')}
                                                            </div>
                                                        </div>
                                                        <FileText className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                </button>
                                            ) : null
                                        ))
                                    ) : (
                                        <div className="p-4 bg-gray-50 rounded text-center text-gray-500">Chưa có đơn thuốc nào</div>
                                    )}
                                </div>
                            )}

                            {/* TAB: PHIẾU CHĂM SÓC */}
                            {activeTab === 'nursing-care' && (
                                <div className="text-center py-12 text-gray-500">
                                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p>Chức năng phiếu chăm sóc đang được phát triển</p>
                                </div>
                            )}

                            {/* TAB: VIEW SCREENING */}
                            {activeTab === 'screening' && (
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-gray-900 mb-4">Danh sách tầm soát</h3>
                                    {record.screeningRequests && record.screeningRequests.length > 0 ? (
                                        record.screeningRequests.map((screening) => (
                                            <button
                                                key={screening.id}
                                                onClick={() => setSelectedScreeningId(screening.id)}
                                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedScreeningId === screening.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            #{screening.screeningNumber} - {screening.screeningType || 'X-Quang'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                            <span>
                                                                <Calendar className="w-4 h-4 inline mr-1" />
                                                                {screening.requestedAt ? new Date(screening.requestedAt).toLocaleDateString('vi-VN') : '--'}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${screening.status === 'AI_COMPLETED' ? 'bg-green-100 text-green-700' :
                                                                screening.status === 'AI_PROCESSING' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {screening.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 bg-gray-50 rounded text-center text-gray-500">Chưa có yêu cầu tầm soát nào</div>
                                    )}
                                </div>
                            )}

                            {/* TAB: TỔNG KẾT BỆNH ÁN */}
                            {activeTab === 'discharge-summary' && (
                                // Toggle "Đóng bệnh án" và "Ký số" được tách ra ngoài fieldset
                                // để bác sĩ luôn tương tác được dù form đang disabled
                                <div className="space-y-6">
                                    <fieldset disabled={isFormDisabled} className="space-y-6">
                                        <section>
                                            <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                                Tóm tắt điều trị
                                            </h3>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Quá trình bệnh lý & diễn biến lâm sàng
                                                </label>
                                                <textarea
                                                    value={formData.progressNotes || ''}
                                                    onChange={(e) => handleInputChange('progressNotes', e.target.value)}
                                                    rows={4}
                                                    placeholder="Nhập thông tin..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                                Chẩn đoán ra viện
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bệnh chính</label>
                                                    <input
                                                        type="text"
                                                        value={formData.primaryDiagnosis || ''}
                                                        onChange={(e) => handleInputChange('primaryDiagnosis', e.target.value)}
                                                        placeholder="Nhập chẩn đoán bệnh chính..."
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bệnh kèm theo</label>
                                                    <input
                                                        type="text"
                                                        value={formData.secondaryDiagnosis || ''}
                                                        onChange={(e) => handleInputChange('secondaryDiagnosis', e.target.value)}
                                                        placeholder="Tìm kiếm và thêm bệnh kèm theo..."
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chẩn đoán tổng kết</label>
                                                    <textarea
                                                        value={formData.dischargeDiagnosis || ''}
                                                        onChange={(e) => handleInputChange('dischargeDiagnosis', e.target.value)}
                                                        rows={3}
                                                        placeholder="Nhập chẩn đoán tổng kết khi ra viện..."
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                                Phương pháp điều trị
                                            </h3>
                                            <textarea
                                                value={formData.treatmentGiven || ''}
                                                onChange={(e) => handleInputChange('treatmentGiven', e.target.value)}
                                                rows={4}
                                                placeholder="Nhập thông tin..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            />
                                        </section>

                                        <section>
                                            <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                                Tình trạng người ra viện
                                            </h3>
                                            <select
                                                value={formData.dischargeCondition || ''}
                                                onChange={(e) => handleInputChange('dischargeCondition', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Chọn tình trạng...</option>
                                                <option value="improved">Khỏi bệnh</option>
                                                <option value="stable">Đỡ, cần tiếp tục điều trị</option>
                                                <option value="unchanged">Không thay đổi</option>
                                                <option value="worsened">Nặng hơn</option>
                                                <option value="deceased">Tử vong</option>
                                            </select>
                                        </section>

                                        <section>
                                            <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                                Hướng dẫn tái khám
                                            </h3>
                                            <textarea
                                                value={formData.followUpInstructions || ''}
                                                onChange={(e) => handleInputChange('followUpInstructions', e.target.value)}
                                                rows={3}
                                                placeholder="Nhập hướng dẫn tái khám..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            />
                                        </section>

                                        <section>
                                            <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                                Toàn bộ hồ sơ
                                            </h3>
                                            <textarea
                                                value={formData.fullRecordSummary || ''}
                                                onChange={(e) => handleInputChange('fullRecordSummary', e.target.value)}
                                                rows={4}
                                                placeholder="Nhập thông tin..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            />
                                        </section>
                                    </fieldset>

                                    {/* Toggle Đóng bệnh án + Ký số — nằm NGOÀI fieldset để luôn clickable */}
                                    <div className="flex items-center gap-8 pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <span className="text-sm font-medium text-gray-700">Đóng bệnh án</span>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={isRecordClosed}
                                                    onChange={(e) => void handleToggleRecordClosed(e.target.checked)}
                                                    disabled={isTogglePending}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </div>
                                        </label>

                                        <Button
                                            variant="ghost"
                                            className="flex items-center gap-3 cursor-pointer hover:bg-transparent p-0"
                                            onClick={handleSign}
                                            disabled={record.signedStatus === 'SIGNED' || signMutation.isPending}
                                        >
                                            <span className="text-sm font-medium text-gray-700">Ký số</span>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={record.signedStatus === 'SIGNED'}
                                                    readOnly
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pinned Action Bar */}
                        <div className="px-6 py-3 border-t border-gray-200 bg-white flex items-center justify-end gap-3 shrink-0">
                            <button
                                onClick={handleDownloadRecord}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Tải bệnh án
                            </button>
                            <button
                                onClick={handlePrintRecord}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                                <Printer className="w-4 h-4" />
                                In bệnh án
                            </button>
                            <button
                                onClick={() => void handleSave()}
                                disabled={isFormDisabled}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updateMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Lưu bệnh án
                            </button>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle className="bg-transparent w-2 mx-1" />

                    {/* Right Column */}
                    <ResizablePanel defaultSize={50} minSize={30} className="!overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200">
                        {activeTab === 'prescription' && selectedPrescription ? (
                            selectedPrescription.pdfUrl ? (
                                <iframe
                                    src={selectedPrescription.pdfUrl}
                                    className="w-full h-full block border-0"
                                    title="Prescription PDF Preview"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                                    <FileText className="w-16 h-16 text-gray-300 mb-4" />
                                    <p className="text-gray-600 font-medium mb-2">Chưa có bản in PDF</p>
                                    <p className="text-sm text-gray-500 mb-6 max-w-sm text-center">
                                        Đơn thuốc này chưa được tạo bản PDF nào.
                                    </p>
                                    <Button onClick={() => selectedPrescription.id && handleGeneratePdf(selectedPrescription.id)} disabled={isGeneratingPdf || !selectedPrescription.id}>
                                        {isGeneratingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
                                        Tạo & Xem PDF
                                    </Button>
                                </div>
                            )
                        ) : activeTab === 'screening' && selectedScreeningId ? (
                            <div className="h-full overflow-y-auto p-6 bg-gray-50 space-y-6">
                                {(() => {
                                    const screening = record.screeningRequests?.find(s => s.id === selectedScreeningId);
                                    if (!screening) return null;

                                    return (
                                        <>
                                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                <h4 className="font-semibold text-gray-900 mb-3">Thông tin tầm soát</h4>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500 block mb-1">Mã tầm soát</span>
                                                        <span className="font-medium">{screening.screeningNumber}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block mb-1">Loại</span>
                                                        <span className="font-medium">{screening.screeningType}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block mb-1">Cấp cứu</span>
                                                        <span className={`font-medium ${screening.priority === 'HIGH' || screening.priority === 'URGENT' ? 'text-red-600' : ''}`}>
                                                            {screening.priority}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block mb-1">Ngày yêu cầu</span>
                                                        <span className="font-medium">{screening.requestedAt ? new Date(screening.requestedAt).toLocaleString('vi-VN') : '--'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {screening.images && screening.images.length > 0 && (
                                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                    <h4 className="font-semibold text-gray-900 mb-3">Hình ảnh</h4>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {screening.images.map((img) => (
                                                            <div key={img.id} className="border rounded bg-black/90 p-2 flex items-center justify-center min-h-[300px]">
                                                                <img
                                                                    src={img.fileUrl}
                                                                    alt={img.fileName}
                                                                    className="max-w-full max-h-[500px] object-contain"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {screening.aiAnalyses && screening.aiAnalyses.length > 0 ? (
                                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                    <h4 className="font-semibold text-gray-900 mb-3">Kết quả AI</h4>
                                                    <div className="space-y-4">
                                                        {screening.aiAnalyses.map((analysis) => (
                                                            <AiAnalysisResult key={analysis.id} analysis={analysis as unknown as AiAnalysisResponse} />
                                                        ))}
                                                    </div>
                                                    <div className="mt-4 flex justify-end">
                                                        <Button variant="outline" onClick={() => navigate(`/doctor/screenings/${screening.id}`)}>
                                                            Kết luận chi tiết
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : screening.status === 'AI_PROCESSING' ? (
                                                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center h-48">
                                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                                                    <p className="text-gray-600 font-medium">AI đang xử lý hình ảnh...</p>
                                                </div>
                                            ) : (
                                                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                                                    <p className="text-gray-500">Chưa có kết quả phân tích AI</p>
                                                    <Button className="mt-4" variant="outline" onClick={() => navigate(`/doctor/screenings/${screening.id}`)}>
                                                        Xử lý
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center">
                                <div>
                                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-gray-600 font-medium">Chưa có bản xem trước</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {activeTab === 'prescription'
                                            ? 'Chọn một đơn thuốc để xem chi tiết'
                                            : activeTab === 'screening'
                                                ? 'Chọn một yêu cầu tầm soát để xem chi tiết'
                                                : 'Bản xem trước sẽ xuất hiện ngay sau khi lưu và ký thành công'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>

            {/* Confirm Close Record Dialog */}
            <AlertDialog open={isConfirmCloseOpen} onOpenChange={setIsConfirmCloseOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận đóng bệnh án</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn đóng bệnh án? Sau khi đóng sẽ không thể chỉnh sửa thêm.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={completeRecordMutation.isPending || updateMutation.isPending}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                executeCloseRecord().then(() => setIsConfirmCloseOpen(false));
                            }}
                            disabled={completeRecordMutation.isPending || updateMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {completeRecordMutation.isPending || updateMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            Đồng ý
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
