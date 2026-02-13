// src/pages/doctor/encounters/InClinicExamPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useDashboardLayout } from '@/components/layout/DashboardLayout';
import { MedicalRecordWorkspace } from '@/components/encounter/MedicalRecordWorkspace';
import { CompletionChecklistModal } from '@/components/encounter/CompletionChecklistModal';
import { useEncounterLegacy } from '@/hooks/use-encounter-legacy';
import { appointmentService } from '@/services/appointment.service';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InClinicExamPage() {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const { setTitle } = useDashboardLayout();

    const encounter = useEncounterLegacy(appointmentId!);
    const [completionModalOpen, setCompletionModalOpen] = useState(false);
    const [starting, setStarting] = useState(false);

    const startedOnceRef = useRef(false);

    useEffect(() => {
        setTitle('Khám bệnh');
    }, [setTitle]);

    useEffect(() => {
        if (encounter.appointment && encounter.appointment.appointmentType === 'VIDEO') {
            navigate(`/doctor/encounters/${appointmentId}/video`, { replace: true });
        }
    }, [encounter.appointment?.appointmentType, appointmentId, navigate]);

    useEffect(() => {
        if (!encounter.appointment || startedOnceRef.current) return;

        const status = encounter.appointment.status;

        if (status === 'CHECKED_IN' || status === 'CONFIRMED') {
            startedOnceRef.current = true;
            setStarting(true);

            appointmentService.startExamination(appointmentId!)
                .then(() => {
                    toast.success('Đã bắt đầu khám bệnh');
                    return encounter.refetch();
                })
                .then(() => {
                    setStarting(false);
                })
                .catch((error) => {
                    toast.error('Không thể bắt đầu khám');
                    console.error(error);
                    startedOnceRef.current = false;
                    setStarting(false);
                });
        }
    }, [encounter.appointment?.status, appointmentId, encounter.refetch]);

    const handleComplete = async () => {
        try {
            await encounter.completeExamination();
            toast.success('Đã hoàn thành khám bệnh');
            navigate('/doctor/queue-manager');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err?.response?.data?.message || 'Không thể hoàn thành khám bệnh');
        } finally {
            setCompletionModalOpen(false);
        }
    };

    if (encounter.loading || starting) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-500">Đang tải hồ sơ khám...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] flex flex-col">
            <MedicalRecordWorkspace
                appointment={encounter.appointment}
                medicalRecord={encounter.medicalRecord}
                vitalSigns={encounter.vitalSigns}
                prescriptions={encounter.prescriptions}
                editableVitals={encounter.editableVitals}
                vitalSignsChanged={encounter.vitalSignsChanged}
                followUpRequired={encounter.followUpRequired}
                nextAppointmentDate={encounter.nextAppointmentDate}
                canEdit={encounter.canEdit}
                isLocked={encounter.isLocked}
                saving={encounter.saving}
                autoSaveStatus={encounter.autoSaveStatus}
                autoSaveTime={encounter.autoSaveTime}
                onUpdateRecord={encounter.updateRecord}
                onUpdateVitals={(field, value) => {
                    encounter.setEditableVitals(prev => ({ ...prev, [field]: value }));
                    encounter.setVitalSignsChanged(true);
                }}
                onSaveVitalSigns={async () => {
                    await encounter.saveVitalSigns();
                    toast.success('Đã lưu chỉ số sinh hiệu');
                }}
                onSaveDraft={async () => {
                    await encounter.saveDraft();
                    toast.success('Đã lưu tạm');
                }}
                onComplete={() => setCompletionModalOpen(true)}
                onSetFollowUpRequired={encounter.setFollowUpRequired}
                onSetNextAppointmentDate={encounter.setNextAppointmentDate}
                onPrescriptionsChange={encounter.setPrescriptions}
                headerRightSlot={
                    <Button variant="outline" onClick={() => navigate('/doctor/queue-manager')}>
                        Quay lại hàng chờ
                    </Button>
                }
            />

            <CompletionChecklistModal
                open={completionModalOpen}
                onOpenChange={setCompletionModalOpen}
                medicalRecord={encounter.medicalRecord}
                vitalSigns={encounter.vitalSigns}
                prescriptions={encounter.prescriptions}
                onConfirm={handleComplete}
                loading={encounter.saving}
            />
        </div>
    );
}
