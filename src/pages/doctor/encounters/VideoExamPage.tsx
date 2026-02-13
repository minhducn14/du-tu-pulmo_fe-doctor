import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useDashboardLayout } from '@/components/layout/DashboardLayout';
import { MedicalRecordWorkspace } from '@/components/encounter/MedicalRecordWorkspace';
import { CompletionChecklistModal } from '@/components/encounter/CompletionChecklistModal';
import { useEncounterLegacy } from '@/hooks/use-encounter-legacy';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { VideoPanel } from '@/components/video/VideoPanel';

export default function VideoExamPage() {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const { setTitle } = useDashboardLayout();

    const encounter = useEncounterLegacy(appointmentId!);
    const [completionModalOpen, setCompletionModalOpen] = useState(false);
    const [waitingForRecord, setWaitingForRecord] = useState(true);

    useEffect(() => {
        setTitle('Khám bệnh');
    }, [setTitle]);

    useEffect(() => {
        if (encounter.appointment && encounter.appointment.appointmentType !== 'VIDEO') {
            navigate(`/doctor/encounters/${appointmentId}/in-clinic`, { replace: true });
        }
    }, [encounter.appointment?.appointmentType, appointmentId, navigate]);

    useEffect(() => {
        if (encounter.medicalRecord) {
            setWaitingForRecord(false);
        }
    }, [encounter.medicalRecord]);

    const handleApiReady = useCallback(() => {
        encounter.refetch();
    }, [encounter.refetch]);

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

    if (encounter.loading) {
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
        <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] flex flex-col lg:flex-row">
            {/* Workspace: loading hoặc MedicalRecordWorkspace */}
            <div className="flex-1 min-h-0 min-w-0 order-2 lg:order-1">
                {waitingForRecord ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">Đang kết nối cuộc gọi video...</p>
                            <p className="text-gray-400 text-sm mt-1">Hồ sơ bệnh án sẽ hiển thị sau khi tham gia cuộc gọi</p>
                        </div>
                    </div>
                ) : (
                    <MedicalRecordWorkspace
                        compact={true}
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
                )}
            </div>

            {/* Video: trên (mobile) | phải (desktop) — cùng vị trí tree tránh duplicate iframe */}
            {appointmentId && (
                <div className="h-[200px] lg:h-auto lg:w-[400px] shrink-0 bg-slate-900 border-b lg:border-b-0 lg:border-l border-slate-700 order-1 lg:order-2">
                    <VideoPanel appointmentId={appointmentId} onApiReady={handleApiReady} />
                </div>
            )}

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
