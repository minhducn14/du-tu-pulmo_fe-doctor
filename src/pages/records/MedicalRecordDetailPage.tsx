import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Download, Printer, Save, Calendar, FileCheck, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { medicalService } from '@/services/medical.service';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { UpdateMedicalRecordDto } from '@/types/medical';

export default function MedicalRecordDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState('medical-record');
    const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

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
        isRecordClosed: boolean;
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
        isRecordClosed: false,
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
        }
    }, [record]);

    const updateMutation = useMutation({
        mutationFn: (data: UpdateMedicalRecordDto) => {
            return medicalService.updateMedicalRecord(record!.id, data);
        },
        onSuccess: () => {
            toast.success('Lưu bệnh án thành công');
            queryClient.invalidateQueries({ queryKey: ['medical-record', id] });
        },
        onError: (error) => {
            console.error(error);
            toast.error('Lỗi khi lưu bệnh án');
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
        onError: (error) => {
            console.error(error);
            toast.error('Lỗi khi ký số');
        },
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!record) return;

        const updateDto: UpdateMedicalRecordDto = {
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

        updateMutation.mutate(updateDto);
    };

    const handleSign = () => {
        if (!record) return;
        if (confirm('Bạn có chắc chắn muốn ký số bệnh án này? Hành động này không thể hoàn tác.')) {
            signMutation.mutate();
        }
    };

    const handlePrint = async () => {
        if (!id) return;
        try {
            const { url } = await medicalService.downloadPdf(id);
            window.open(url, '_blank');
        } catch (error) {
            toast.error('Không thể tạo file in');
        }
    };

    const tabs = [
        { id: 'medical-record', label: 'Bệnh án' },
        { id: 'prescription', label: 'Phiếu điều trị' },
        { id: 'nursing-care', label: 'Phiếu chăm sóc' },
        { id: 'discharge-summary', label: 'Tổng kết bệnh án' }
    ];

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }

    if (error || !record) {
        return <div className="p-8 text-center">Không tìm thấy bệnh án. <Button variant="link" onClick={() => navigate(-1)}>Quay lại</Button></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <PageHeader
                title={patientInfo?.fullName}
                subtitle={
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{patientInfo?.gender}</span>
                        <span>•</span>
                        <span>{patientInfo?.dateOfBirth}</span>
                        <span>•</span>
                        <span>{patientInfo?.recordNumber}</span>
                    </div>
                }
                rightSlot={
                    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border shadow-sm">
                        <FileCheck className={`w-4 h-4 ${record.signedStatus === 'SIGNED' ? 'text-green-500' : 'text-amber-500'}`} />
                        <span className={`text-sm font-medium ${record.signedStatus === 'SIGNED' ? 'text-green-600' : 'text-amber-600'}`}>
                            {patientInfo?.signedStatus}
                        </span>
                    </div>
                }
                className="bg-white border-b border-gray-200 px-6 py-4"
            />

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="flex gap-1 px-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                    {/* Left Column - Form */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>

                        {/* TAB: BỆNH ÁN */}
                        {activeTab === 'medical-record' && (
                            <div className="space-y-6">
                                {/* Thông tin hành chính */}
                                <section>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                                            <textarea
                                                value={formData.presentIllness || ''}
                                                onChange={(e) => handleInputChange('presentIllness', e.target.value)}
                                                rows={3}
                                                placeholder="Nhập quá trình bệnh lý..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Chỉ số sinh hiệu (Read-only/Display from record.vitalSigns) */}
                                <section>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                        Hỏi bệnh
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Dị ứng
                                            </label>
                                            <textarea
                                                value={Array.isArray(formData.allergies) ? formData.allergies.join('\n') : (formData.allergies || '')}
                                                onChange={(e) => handleInputChange('allergies', e.target.value.split('\n'))}
                                                rows={3}
                                                placeholder="Nhập dị ứng (mỗi dòng một loại)..."
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
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                        Chẩn đoán & Kế hoạch điều trị
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Chẩn đoán
                                            </label>
                                            <textarea
                                                value={formData.diagnosis || ''}
                                                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                                                rows={3}
                                                placeholder="Nhập chẩn đoán..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phác đồ điều trị
                                            </label>
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
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Đến ngày
                                                </label>
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
                            </div>
                        )}

                        {/* TAB: PHIẾU ĐIỀU TRỊ */}
                        {activeTab === 'prescription' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách toa thuốc</h3>

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

                        {/* TAB: TỔNG KẾT BỆNH ÁN */}
                        {activeTab === 'discharge-summary' && (
                            <div className="space-y-6">
                                <section>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                        Tóm tắt điều trị
                                    </h3>
                                    <div className="space-y-4">
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
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                        Chẩn đoán ra viện
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Bệnh chính
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.primaryDiagnosis || ''}
                                                onChange={(e) => handleInputChange('primaryDiagnosis', e.target.value)}
                                                placeholder="Nhập chẩn đoán bệnh chính..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Bệnh kèm theo
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.secondaryDiagnosis || ''}
                                                onChange={(e) => handleInputChange('secondaryDiagnosis', e.target.value)}
                                                placeholder="Tìm kiếm và thêm bệnh kèm theo..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Chẩn đoán tổng kết
                                            </label>
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
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                        Toàn bộ hồ sơ
                                    </h3>
                                    <div className="space-y-4">
                                        <textarea
                                            value={formData.fullRecordSummary || ''}
                                            onChange={(e) => handleInputChange('fullRecordSummary', e.target.value)}
                                            rows={4}
                                            placeholder="Nhập thông tin..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        />

                                        <div className="flex items-center gap-8 pt-2">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <span className="text-sm font-medium text-gray-700">Đóng bệnh án</span>
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isRecordClosed}
                                                        onChange={(e) => handleInputChange('isRecordClosed', e.target.checked)}
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
                                </section>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Preview */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        {activeTab === 'prescription' && selectedPrescription ? (
                            <div className="space-y-6">
                                {/* Prescription Preview */}
                                <div className="border-b pb-4">
                                    <h2 className="text-2xl font-bold text-center text-gray-900">ĐƠN THUỐC</h2>
                                    <p className="text-center text-sm text-gray-600 mt-1">Prescription</p>
                                </div>

                                {/* Doctor Info */}
                                <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        BS
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{record.doctor.fullName}</div>
                                        <div className="text-sm text-gray-600">SĐT: --</div>
                                    </div>
                                </div>

                                {/* Patient Info */}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">Họ tên:</span>
                                        <span className="ml-2 font-medium">{patientInfo?.fullName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Năm sinh:</span>
                                        <span className="ml-2 font-medium">{new Date(record.patient.dateOfBirth).getFullYear()}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Giới tính:</span>
                                        <span className="ml-2 font-medium">{patientInfo?.gender}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Điện thoại:</span>
                                        <span className="ml-2 font-medium">--</span>
                                    </div>
                                </div>

                                {/* Vital Signs Summary */}
                                <div className="grid grid-cols-3 gap-2 text-sm bg-gray-50 p-3 rounded">
                                    <div>
                                        <span className="text-gray-600">Mạch:</span>
                                        <span className="ml-1 font-medium">{record.vitalSigns.heartRate || '--'} bpm</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">HA:</span>
                                        <span className="ml-1 font-medium">{record.vitalSigns.bloodPressure || '--'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">T°:</span>
                                        <span className="ml-1 font-medium">{record.vitalSigns.temperature || '--'}°C</span>
                                    </div>
                                </div>

                                {/* Medicine Table */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Đơn thuốc:</h3>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b-2 border-gray-300">
                                                <th className="text-left py-2 font-semibold">STT</th>
                                                <th className="text-left py-2 font-semibold">Tên thuốc</th>
                                                <th className="text-center py-2 font-semibold">SL</th>
                                                <th className="text-center py-2 font-semibold">ĐVT</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedPrescription.items.map((item: any, index: number) => (
                                                <React.Fragment key={index}>
                                                    <tr className="border-b border-gray-200">
                                                        <td className="py-3">{index + 1}</td>
                                                        <td className="py-3 font-medium">{item.medicineName}</td>
                                                        <td className="py-3 text-center">{item.quantity}</td>
                                                        <td className="py-3 text-center">{item.unit}</td>
                                                    </tr>
                                                    <tr>
                                                        <td></td>
                                                        <td colSpan={3} className="pb-3 text-gray-600 italic text-xs">
                                                            {item.dosage} - {item.frequency} - {item.duration}
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Notes */}
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-semibold">Lời dặn:</span> {selectedPrescription.notes || 'Không có ghi chú'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center">
                                <div>
                                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-gray-600 font-medium">Chưa có bản xem trước</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {activeTab === 'prescription'
                                            ? 'Chọn một đơn thuốc để xem chi tiết'
                                            : 'Bản xem trước sẽ xuất hiện ngay sau khi lưu và ký thành công'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-6 flex items-center justify-end gap-3">
                    <button onClick={handlePrint} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                        <Download className="w-4 h-4" />
                        Tải bệnh án
                    </button>
                    <button onClick={handlePrint} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                        <Printer className="w-4 h-4" />
                        In bệnh án
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {updateMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Lưu bệnh án
                    </button>
                </div>
            </div>
        </div>
    );
}
