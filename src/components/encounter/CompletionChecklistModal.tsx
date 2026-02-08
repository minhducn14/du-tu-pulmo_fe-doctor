/**
 * CompletionChecklistModal Component
 * Modal for validating required fields before completing examination
 */
import { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import type { MedicalRecord, VitalSign, Prescription } from '@/types/medical';

interface ChecklistItem {
    id: string;
    label: string;
    required: boolean;
    completed: boolean;
    value?: string | number | null;
}

interface CompletionChecklistModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    medicalRecord: MedicalRecord | null;
    vitalSigns: VitalSign | null;
    prescriptions: Prescription[];
    onConfirm: () => Promise<void>;
    loading?: boolean;
}

export function CompletionChecklistModal({
    open,
    onOpenChange,
    medicalRecord,
    vitalSigns,
    prescriptions,
    onConfirm,
    loading = false,
}: CompletionChecklistModalProps) {
    const [acknowledged, setAcknowledged] = useState(false);
    const [confirming, setConfirming] = useState(false);

    // Build checklist items
    const checklistItems: ChecklistItem[] = [
        {
            id: 'chiefComplaint',
            label: 'Lý do khám',
            required: true,
            completed: !!medicalRecord?.chiefComplaint,
            value: medicalRecord?.chiefComplaint,
        },
        {
            id: 'vitalSigns',
            label: 'Chỉ số sinh hiệu',
            required: false,
            completed: !!(vitalSigns?.height && vitalSigns?.weight),
            value: vitalSigns ? `${vitalSigns.height}cm / ${vitalSigns.weight}kg` : null,
        },
        {
            id: 'assessment',
            label: 'Đánh giá / Chẩn đoán',
            required: true,
            completed: !!medicalRecord?.assessment,
            value: medicalRecord?.assessment,
        },
        {
            id: 'plan',
            label: 'Kế hoạch điều trị',
            required: true,
            completed: !!medicalRecord?.treatmentPlan,
            value: medicalRecord?.treatmentPlan,
        },
        {
            id: 'prescription',
            label: 'Đơn thuốc',
            required: false,
            completed: prescriptions.length > 0,
            value: prescriptions.length > 0 ? `${prescriptions.length} đơn` : null,
        },
        {
            id: 'followUp',
            label: 'Hướng dẫn tái khám',
            required: false,
            completed: !!medicalRecord?.followUpInstructions,
            value: medicalRecord?.followUpInstructions,
        },
    ];

    const requiredItems = checklistItems.filter((item) => item.required);
    const optionalItems = checklistItems.filter((item) => !item.required);
    const allRequiredCompleted = requiredItems.every((item) => item.completed);
    const completedCount = checklistItems.filter((item) => item.completed).length;

    // Reset acknowledged state when modal opens
    useEffect(() => {
        if (open) {
            setAcknowledged(false);
        }
    }, [open]);

    const handleConfirm = async () => {
        if (!allRequiredCompleted || !acknowledged) return;

        setConfirming(true);
        try {
            await onConfirm();
            onOpenChange(false);
        } finally {
            setConfirming(false);
        }
    };

    const renderChecklistItem = (item: ChecklistItem) => (
        <div key={item.id} className="flex items-start gap-3 py-2">
            <div className="mt-0.5">
                {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : item.required ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className={`font-medium ${!item.completed && item.required ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.label}
                    </span>
                    {item.required && (
                        <Badge variant="outline" className="text-xs">
                            Bắt buộc
                        </Badge>
                    )}
                </div>
                {item.value && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">
                        {typeof item.value === 'string' ? item.value.slice(0, 50) + (item.value.length > 50 ? '...' : '') : item.value}
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        Xác nhận hoàn tất khám bệnh
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-4 text-left">
                            {/* Progress indicator */}
                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                <span className="text-sm font-medium">Tiến độ hoàn thành</span>
                                <Badge className={allRequiredCompleted ? 'bg-green-500' : 'bg-yellow-500'}>
                                    {completedCount}/{checklistItems.length} mục
                                </Badge>
                            </div>

                            {/* Required items */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                    Bắt buộc
                                </p>
                                {requiredItems.map(renderChecklistItem)}
                            </div>

                            <Separator />

                            {/* Optional items */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                    Tùy chọn
                                </p>
                                {optionalItems.map(renderChecklistItem)}
                            </div>

                            {/* Warning if required items incomplete */}
                            {!allRequiredCompleted && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg text-red-800">
                                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-sm">Chưa hoàn thành các mục bắt buộc</p>
                                        <p className="text-xs mt-1">
                                            Vui lòng điền đầy đủ thông tin trước khi hoàn tất.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Acknowledgement checkbox */}
                            {allRequiredCompleted && (
                                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                    <Checkbox
                                        id="acknowledge"
                                        checked={acknowledged}
                                        onCheckedChange={(checked) => setAcknowledged(checked === true)}
                                        className="mt-0.5"
                                    />
                                    <Label htmlFor="acknowledge" className="text-sm text-blue-900 cursor-pointer">
                                        Tôi xác nhận đã kiểm tra đầy đủ thông tin và kết thúc buổi khám.
                                        Sau khi hoàn tất, bệnh án sẽ được khóa và không thể chỉnh sửa.
                                    </Label>
                                </div>
                            )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={confirming}>
                        Quay lại
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={!allRequiredCompleted || !acknowledged || confirming || loading}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {confirming || loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Hoàn tất khám
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
