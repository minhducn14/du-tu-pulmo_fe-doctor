import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { medicalService } from '@/services/medical.service';
import type { CreateVitalSignDto, VitalSign } from '@/types/medical';
import { parseBloodPressure, formatBloodPressure } from '@/types/medical';
import { toast } from 'sonner';

interface VitalSignsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointmentId: string;
    existingData?: VitalSign;
    onSaved?: (vitalSign: VitalSign) => void;
}

export function VitalSignsModal({
    open,
    onOpenChange,
    appointmentId,
    existingData,
    onSaved,
}: VitalSignsModalProps) {
    const [loading, setLoading] = useState(false);

    // Parse existing blood pressure if available
    const existingBP = parseBloodPressure(existingData?.bloodPressure);

    // Local state for systolic/diastolic (UI convenience)
    const [systolic, setSystolic] = useState<number | undefined>(existingBP?.systolic);
    const [diastolic, setDiastolic] = useState<number | undefined>(existingBP?.diastolic);

    const [formData, setFormData] = useState<Omit<CreateVitalSignDto, 'bloodPressure'>>({
        height: existingData?.height,
        weight: existingData?.weight,
        temperature: existingData?.temperature,
        heartRate: existingData?.heartRate,
        respiratoryRate: existingData?.respiratoryRate,
        spo2: existingData?.spo2,
    });

    // Calculate BMI
    const calculateBMI = useCallback(() => {
        if (formData.height && formData.weight && formData.height > 0) {
            const heightInMeters = formData.height / 100;
            return (formData.weight / (heightInMeters * heightInMeters)).toFixed(2);
        }
        return null;
    }, [formData.height, formData.weight]);

    const handleChange = (field: keyof typeof formData, value: string) => {
        const numValue = value === '' ? undefined : parseFloat(value);
        setFormData((prev) => ({
            ...prev,
            [field]: numValue,
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // Build DTO with string bloodPressure format for BE
            const dto: CreateVitalSignDto = {
                ...formData,
                bloodPressure: formatBloodPressure(systolic, diastolic),
            };

            const result = await medicalService.addVitalSign(appointmentId, dto);
            toast.success('Đã lưu chỉ số sinh hiệu');
            onSaved?.(result);
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to save vital signs:', error);
            toast.error('Lưu chỉ số thất bại');
        } finally {
            setLoading(false);
        }
    };

    const bmi = calculateBMI();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Chỉ số sinh hiệu</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    {/* Height */}
                    <div className="space-y-2">
                        <Label htmlFor="height">
                            Chiều cao <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="height"
                                type="number"
                                value={formData.height ?? ''}
                                onChange={(e) => handleChange('height', e.target.value)}
                                placeholder="170"
                                min={50}
                                max={250}
                            />
                            <span className="text-sm text-gray-500">cm</span>
                        </div>
                    </div>

                    {/* Weight */}
                    <div className="space-y-2">
                        <Label htmlFor="weight">
                            Cân nặng <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="weight"
                                type="number"
                                value={formData.weight ?? ''}
                                onChange={(e) => handleChange('weight', e.target.value)}
                                placeholder="65"
                                min={1}
                                max={500}
                            />
                            <span className="text-sm text-gray-500">kg</span>
                        </div>
                    </div>

                    {/* Temperature */}
                    <div className="space-y-2">
                        <Label htmlFor="temperature">Nhiệt độ</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="temperature"
                                type="number"
                                step="0.1"
                                value={formData.temperature ?? ''}
                                onChange={(e) => handleChange('temperature', e.target.value)}
                                placeholder="36.5"
                                min={30}
                                max={45}
                            />
                            <span className="text-sm text-gray-500">°C</span>
                        </div>
                    </div>

                    {/* Blood Pressure - UI shows 2 inputs, but sends as string to BE */}
                    <div className="space-y-2">
                        <Label>Huyết áp</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={systolic ?? ''}
                                onChange={(e) => setSystolic(e.target.value === '' ? undefined : parseInt(e.target.value))}
                                placeholder="sys"
                                className="w-20"
                                min={60}
                                max={250}
                            />
                            <span className="text-gray-400">/</span>
                            <Input
                                type="number"
                                value={diastolic ?? ''}
                                onChange={(e) => setDiastolic(e.target.value === '' ? undefined : parseInt(e.target.value))}
                                placeholder="dia"
                                className="w-20"
                                min={40}
                                max={150}
                            />
                            <span className="text-sm text-gray-500">mmHg</span>
                        </div>
                    </div>

                    {/* Heart Rate */}
                    <div className="space-y-2">
                        <Label htmlFor="heartRate">Mạch</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="heartRate"
                                type="number"
                                value={formData.heartRate ?? ''}
                                onChange={(e) => handleChange('heartRate', e.target.value)}
                                placeholder="72"
                                min={30}
                                max={250}
                            />
                            <span className="text-sm text-gray-500">lần/phút</span>
                        </div>
                    </div>

                    {/* Respiratory Rate */}
                    <div className="space-y-2">
                        <Label htmlFor="respiratoryRate">Nhịp thở</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="respiratoryRate"
                                type="number"
                                value={formData.respiratoryRate ?? ''}
                                onChange={(e) => handleChange('respiratoryRate', e.target.value)}
                                placeholder="16"
                                min={5}
                                max={60}
                            />
                            <span className="text-sm text-gray-500">lần/phút</span>
                        </div>
                    </div>

                    {/* SpO2 - now uses spo2 field name per BE DTO */}
                    <div className="space-y-2">
                        <Label htmlFor="spo2">SpO2</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="spo2"
                                type="number"
                                value={formData.spo2 ?? ''}
                                onChange={(e) => handleChange('spo2', e.target.value)}
                                placeholder="98"
                                min={0}
                                max={100}
                            />
                            <span className="text-sm text-gray-500">%</span>
                        </div>
                    </div>

                    {/* BMI Display */}
                    {bmi && (
                        <div className="col-span-2 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">BMI:</span>
                                <span className="text-lg font-semibold text-blue-700">{bmi}</span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu chỉ số'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default VitalSignsModal;
