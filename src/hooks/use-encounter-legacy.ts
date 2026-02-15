// src/hooks/use-encounter-legacy.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '@/services/appointment.service';
import { medicalService } from '@/services/medical.service';
import { format } from 'date-fns';
import type { CreateVitalSignDto, MedicalRecord, Prescription, UpdateMedicalRecordDtoForEncounter, VitalSign } from '@/types/medical';
import { toast } from 'sonner';

const AUTO_SAVE_DEBOUNCE = 5000;
const AUTO_SAVE_INTERVAL = 120000;

function normalizeStringArray(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map(String).map(s => s.trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input.split(/\r?\n|,/g).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function normalizeBoolean(input: unknown): boolean {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    const v = input.trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'on'].includes(v)) return true;
    if (['false', '0', 'no', 'n', 'off', ''].includes(v)) return false;
  }
  if (typeof input === 'number') return input === 1;
  return false;
}

export function useEncounterLegacy(appointmentId: string) {
  const queryClient = useQueryClient();

  // Local state for form editing (Derived from Query Data)
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [vitalSigns, setVitalSigns] = useState<VitalSign | null>(null);
  const [editableVitals, setEditableVitals] = useState<Partial<CreateVitalSignDto>>({});
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [nextAppointmentDate, setNextAppointmentDate] = useState('');
  
  const [vitalSignsChanged, setVitalSignsChanged] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Auto-save states
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveTime, setAutoSaveTime] = useState<Date | null>(null);
  
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedSnapshotRef = useRef<string>('');

  const { data: encounterData, isLoading, refetch } = useQuery({
    queryKey: ['encounter', appointmentId],
    queryFn: async () => {
      const apptData = await appointmentService.getDetail(appointmentId);

      const recordPromise = apptData.medicalRecordId 
        ? medicalService.getMedicalRecordById(apptData.medicalRecordId)
            .catch((err: any) => {
                 console.error("Failed to fetch exam record", err);
                 if (err?.statusCode === 404 || err?.response?.status === 404) return null;
                 throw err;
            })
        : medicalService.getMedicalRecord(appointmentId).catch((err: any) => {
             if (err?.statusCode === 404 || err?.response?.status === 404) return null;
             throw err;
        });

      const [recordData, prescData, vitalsData] = await Promise.all([
        recordPromise,
        medicalService.getPrescriptions(appointmentId).catch(() => []),
        medicalService.getVitalSigns(appointmentId).catch(() => [])
      ]);

      return { apptData, recordData, prescData, vitalsData };
    },
    enabled: !!appointmentId,
  });

  const appointment = encounterData?.apptData || null;

  useEffect(() => {
    if (!encounterData) return;
    
    const { apptData, recordData, prescData, vitalsData } = encounterData;
    setFollowUpRequired(apptData.followUpRequired ?? false);
    if (apptData.nextAppointmentDate) {
      setNextAppointmentDate(format(new Date(apptData.nextAppointmentDate), 'yyyy-MM-dd'));
    }
    setPrescriptions(prescData || []);
    
    if (recordData) {
        const normalized: MedicalRecord = {
            ...recordData,
            id: recordData.id,
            currentMedications: normalizeStringArray(recordData.currentMedications),
            allergies: normalizeStringArray(recordData.allergies),
            chronicDiseases: normalizeStringArray(recordData.chronicDiseases),
            surgicalHistory: recordData.surgicalHistory,
            familyHistory: recordData.familyHistory,
            smokingStatus: normalizeBoolean((recordData as any).smokingStatus),
            alcoholConsumption: normalizeBoolean((recordData as any).alcoholConsumption),
        } as unknown as MedicalRecord;
        setMedicalRecord(normalized);
    } else {
        setMedicalRecord({
            id: '',
            appointmentId,
            patientId: apptData.patient?.id || apptData.patientId || '',
            doctorId: apptData.doctor?.id ?? apptData.doctorId ?? null,
            recordNumber: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            signedStatus: 'NOT_SIGNED',
            smokingStatus: false,
            alcoholConsumption: false,
            recordType: '',
            status: 'DRAFT',
        } as any as MedicalRecord);
    }

    let latest: VitalSign | null = null;
    
    if ((recordData as any)?.latestVitalSign) {
        const lv = (recordData as any).latestVitalSign;
        latest = {
            ...lv,
            id: 'latest',
            patientId: apptData.patientId || '',
            createdAt: lv.recordedAt ? new Date(lv.recordedAt).toISOString() : new Date().toISOString(),
        } as VitalSign;
    }
    else if ((recordData as any)?.vitalSigns?.length) {
        latest = [...(recordData as any).vitalSigns].sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
    } 
    else if (vitalsData?.length) {
        latest = [...vitalsData].sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
    }

    if (latest) {
        setVitalSigns(latest);
        setEditableVitals({
            height: latest.height,
            weight: latest.weight,
            temperature: latest.temperature,
            bloodPressure: latest.bloodPressure,
            heartRate: latest.heartRate,
            respiratoryRate: latest.respiratoryRate,
            spo2: latest.spo2,
        });
    }

  }, [encounterData, appointmentId]);

  const isLocked = appointment 
    ? ['COMPLETED', 'SIGNED', 'CANCELLED'].includes(appointment.status) 
    : false;
  const canEdit = !isLocked && appointment?.status === 'IN_PROGRESS';
  const getCurrentFormSnapshot = useCallback((): string => {
    if (!medicalRecord) return '';

    const snapshot = {
      chiefComplaint: medicalRecord.chiefComplaint ?? null,
      presentIllness: medicalRecord.presentIllness ?? null,
      physicalExamNotes: medicalRecord.physicalExamNotes ?? null,
      assessment: medicalRecord.assessment ?? null,
      diagnosis: medicalRecord.diagnosis ?? null,
      treatmentPlan: medicalRecord.treatmentPlan ?? null,
      medicalHistory: medicalRecord.medicalHistory ?? null,
      surgicalHistory: medicalRecord.surgicalHistory ?? null,
      familyHistory: medicalRecord.familyHistory ?? null,
      allergies: normalizeStringArray(medicalRecord.allergies),
      chronicDiseases: normalizeStringArray(medicalRecord.chronicDiseases),
      currentMedications: normalizeStringArray(medicalRecord.currentMedications),
      smokingStatus: normalizeBoolean(medicalRecord.smokingStatus),
      smokingYears: medicalRecord.smokingYears ?? null,
      alcoholConsumption: normalizeBoolean(medicalRecord.alcoholConsumption),
      followUpInstructions: medicalRecord.followUpInstructions ?? null,
      progressNotes: medicalRecord.progressNotes ?? null,
      followUpRequired,
      nextAppointmentDate: nextAppointmentDate || null,
    };

    return JSON.stringify(snapshot);
  }, [medicalRecord, followUpRequired, nextAppointmentDate]);

  useEffect(() => {
    if (encounterData && !lastSavedSnapshotRef.current) {
        lastSavedSnapshotRef.current = getCurrentFormSnapshot();
    }
  }, [encounterData, getCurrentFormSnapshot]);

  const buildUpdateDto = useCallback((): UpdateMedicalRecordDtoForEncounter | null => {
    if (!medicalRecord) return null;
    return {
      chiefComplaint: medicalRecord.chiefComplaint ?? undefined,
      presentIllness: medicalRecord.presentIllness ?? undefined,
      physicalExamNotes: medicalRecord.physicalExamNotes ?? undefined,
      assessment: medicalRecord.assessment ?? undefined,
      diagnosis: medicalRecord.diagnosis ?? undefined,
      treatmentPlan: medicalRecord.treatmentPlan ?? undefined,
      medicalHistory: medicalRecord.medicalHistory ?? undefined,
      surgicalHistory: medicalRecord.surgicalHistory ?? undefined,
      familyHistory: medicalRecord.familyHistory ?? undefined,
      allergies: normalizeStringArray(medicalRecord.allergies),
      chronicDiseases: normalizeStringArray(medicalRecord.chronicDiseases),
      currentMedications: normalizeStringArray(medicalRecord.currentMedications),
      smokingStatus: normalizeBoolean(medicalRecord.smokingStatus),
      smokingYears: medicalRecord.smokingYears ?? undefined,
      alcoholConsumption: normalizeBoolean(medicalRecord.alcoholConsumption),
      followUpInstructions: medicalRecord.followUpInstructions ?? undefined,
      progressNotes: medicalRecord.progressNotes ?? undefined,
      followUpRequired,
      nextAppointmentDate: nextAppointmentDate || undefined,
    };
  }, [medicalRecord, followUpRequired, nextAppointmentDate]);

  const updateRecord = useCallback((field: keyof MedicalRecord, value: unknown) => {
    setMedicalRecord(prev => prev ? { ...prev, [field]: value } : null);
    setIsDirty(true);
  }, []);

  const updateFollowUpRequired = useCallback((value: boolean) => {
    setFollowUpRequired(value);
    setIsDirty(true);
  }, []);

  const updateNextAppointmentDate = useCallback((value: string) => {
    setNextAppointmentDate(value);
    setIsDirty(true);
  }, []);
  
  const saveMutation = useMutation({
    mutationFn: async (dto: UpdateMedicalRecordDtoForEncounter) => {
        return await appointmentService.updateMedicalRecord(appointmentId, dto);
    },
    onSuccess: () => {
        lastSavedSnapshotRef.current = getCurrentFormSnapshot();
        setAutoSaveTime(new Date());
        setAutoSaveStatus('saved');
        setIsDirty(false);
        queryClient.invalidateQueries({ queryKey: ['encounter', appointmentId] });
    },
    onError: (error) => {
        console.error('Save error:', error);
        setAutoSaveStatus('error');
    }
  });

  const saveDraft = useCallback(async () => {
    if (!medicalRecord) return;
    try {
        const dto = buildUpdateDto();
        if (!dto) return;
        await saveMutation.mutateAsync(dto);
    } catch (error) {
        throw error;
    }
  }, [medicalRecord, buildUpdateDto, saveMutation]);

  const performAutoSave = useCallback(async () => {
    if (!canEdit || !medicalRecord || !isDirty) return;
    const currentSnapshot = getCurrentFormSnapshot();
    if (currentSnapshot === lastSavedSnapshotRef.current) {
        setIsDirty(false);
        return;
    }

    const dto = buildUpdateDto();
    if (!dto) return;

    setAutoSaveStatus('saving');
    saveMutation.mutate(dto); 
  }, [canEdit, medicalRecord, getCurrentFormSnapshot, buildUpdateDto, saveMutation]);

  useEffect(() => {
    if (!canEdit) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(performAutoSave, AUTO_SAVE_DEBOUNCE);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [medicalRecord, followUpRequired, nextAppointmentDate, performAutoSave, canEdit, appointmentId]);

  useEffect(() => {
    if (!canEdit) return;
    intervalRef.current = setInterval(performAutoSave, AUTO_SAVE_INTERVAL);
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [performAutoSave, canEdit]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const current = getCurrentFormSnapshot();
      if (current !== lastSavedSnapshotRef.current && canEdit && !isLocked) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [canEdit, isLocked, getCurrentFormSnapshot]);

  const completeMutation = useMutation({
    mutationFn: async (payload: { id: string, dto: any }) => {
        return await appointmentService.completeExamination(payload.id, payload.dto);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['encounter', appointmentId] });
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });

  const completeExamination = useCallback(async () => {
    try {
        await saveDraft();
        
        await completeMutation.mutateAsync({
            id: appointmentId,
            dto: {
                followUpRequired,
                nextAppointmentDate: nextAppointmentDate || undefined,
            }
        });
        
        await refetch();
        
    } catch (error) {
        console.error('Complete error:', error);
        throw error;
    }
  }, [saveDraft, completeMutation, appointmentId, followUpRequired, nextAppointmentDate, refetch]);

  const vitalsMutation = useMutation({
    mutationFn: async (dto: CreateVitalSignDto) => {
        return await medicalService.addVitalSign(appointmentId, dto);
    },
    onSuccess: (newVitals) => {
        setVitalSigns(newVitals);
        setVitalSignsChanged(false);
        queryClient.invalidateQueries({ queryKey: ['encounter', appointmentId] });
        toast.success('Đã lưu sinh hiệu');
    },
    onError: (error) => {
        console.error('Vitals error', error);
        toast.error('Lỗi khi lưu sinh hiệu');
    }
  });

  const saveVitalSigns = useCallback(async () => {
      const dto: CreateVitalSignDto = {
        height: editableVitals.height,
        weight: editableVitals.weight,
        temperature: editableVitals.temperature,
        bloodPressure: editableVitals.bloodPressure,
        heartRate: editableVitals.heartRate,
        respiratoryRate: editableVitals.respiratoryRate,
        spo2: editableVitals.spo2,
      };
      await vitalsMutation.mutateAsync(dto);
  }, [editableVitals, vitalsMutation]);

  return {
    loading: isLoading,
    saving: saveMutation.isPending || completeMutation.isPending || autoSaveStatus === 'saving',
    autoSaveStatus,
    autoSaveTime,
    appointment,
    medicalRecord,
    vitalSigns,
    prescriptions,
    editableVitals,
    vitalSignsChanged,
    followUpRequired,
    nextAppointmentDate,
    
    isLocked,
    canEdit,
    
    updateRecord,
    saveDraft,
    completeExamination,
    saveVitalSigns,
    refetch,
    
    setEditableVitals,
    setVitalSignsChanged,
    setFollowUpRequired: updateFollowUpRequired,
    setNextAppointmentDate: updateNextAppointmentDate,
    setPrescriptions,
  };
}
