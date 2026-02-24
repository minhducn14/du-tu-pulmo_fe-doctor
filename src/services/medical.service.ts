import api from '@/services/api';
import type {
  MedicalRecord,
  Prescription,
  CreatePrescriptionDto,
  PatientMedicalHistory,
  MedicalRecordDetailResponse,
  SignMedicalRecordDto,
  MedicalRecordExamination,
  UpdateMedicalRecordDto,
  VitalSign,
  CreateVitalSignDto,
} from '@/types/medical';
import type { UploadAnalyzeResponse } from '@/types/screening';

const normalizeMedicalRecord = (record: MedicalRecord): MedicalRecord => {
  const presentIllness =
    record.presentIllness ?? (record as any).presentIllnessHistory;
  const medicalHistory =
    record.medicalHistory ?? (record as any).pastMedicalHistory;

  if (presentIllness === record.presentIllness && medicalHistory === record.medicalHistory) {
    return record;
  }

  return {
    ...record,
    presentIllness,
    medicalHistory,
  };
};

const normalizeMedicalRecordList = (records: MedicalRecord[]): MedicalRecord[] =>
  records.map(normalizeMedicalRecord);

/**
 * Medical Service
 * Handles medical records, vital signs, and prescriptions
 */
export const medicalService = {
  // ============================================
  // Medical Record - By Appointment
  // ============================================

  /**
   * Get medical record for an appointment
   * @roles PATIENT (own), DOCTOR (own), ADMIN
   */
  getMedicalRecord: async (appointmentId: string): Promise<MedicalRecord> => {
    const response = await api.get<MedicalRecord>(`/appointments/${appointmentId}/medical-record`);
    return normalizeMedicalRecord(response.data);
  },

  /**
   * Update medical record by ID 
   * @roles DOCTOR (own), ADMIN
   */
  updateMedicalRecord: async (id: string, dto: UpdateMedicalRecordDto): Promise<MedicalRecord> => {
    const response = await api.put<MedicalRecord>(`/medical/records/${id}`, dto);
    return normalizeMedicalRecord(response.data);
  },

  // ============================================
  // Vital Signs - By Appointment
  // ============================================

  /**
   * Get vital signs for an appointment
   */
  getVitalSigns: async (appointmentId: string): Promise<VitalSign[]> => {
    const response = await api.get<VitalSign[]>(`/appointments/${appointmentId}/vital-signs`);
    return response.data;
  },

  /**
   * Add vital sign to an appointment
   * @roles DOCTOR (own), ADMIN
   */
  addVitalSign: async (appointmentId: string, dto: CreateVitalSignDto): Promise<VitalSign> => {
    const response = await api.post<VitalSign>(`/appointments/${appointmentId}/vital-signs`, dto);
    return response.data;
  },

  // ============================================
  // Prescriptions - By Appointment
  // ============================================

  /**
   * Get prescriptions for an appointment
   */
  getPrescriptions: async (appointmentId: string): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>(`/appointments/${appointmentId}/prescriptions`);
    return response.data;
  },

  /**
   * Create prescription for an appointment
   * @roles DOCTOR (own), ADMIN
   */
  createPrescription: async (appointmentId: string, dto: CreatePrescriptionDto): Promise<Prescription> => {
    const response = await api.post<Prescription>(`/appointments/${appointmentId}/prescriptions`, dto);
    return response.data;
  },

  /**
   * Cancel a prescription
   * @roles DOCTOR (own), ADMIN
   */
  cancelPrescription: async (appointmentId: string, prescriptionId: string): Promise<Prescription> => {
    const response = await api.post<Prescription>(`/appointments/${appointmentId}/prescriptions/${prescriptionId}/cancel`);
    return response.data;
  },

  /**
   * Update a prescription
   * @roles DOCTOR (own)
   */
  updatePrescription: async (appointmentId: string, prescriptionId: string, dto: CreatePrescriptionDto): Promise<Prescription> => {
    const response = await api.put<Prescription>(`/appointments/${appointmentId}/prescriptions/${prescriptionId}`, dto);
    return response.data;
  },

  // ============================================
  // Patient Medical History
  // ============================================

  /**
   * Get all medical records for a patient
   * @roles PATIENT (self), DOCTOR (treated), ADMIN
   */
  getPatientRecords: async (patientId: string): Promise<MedicalRecord[]> => {
    const response = await api.get<MedicalRecord[]>(`/medical/records/patient/${patientId}`);
    return normalizeMedicalRecordList(response.data || []);
  },

  /**
   * Get all vital signs for a patient (for trend charts)
   */
  getPatientVitalSigns: async (patientId: string): Promise<VitalSign[]> => {
    const response = await api.get<VitalSign[]>(`/medical/vital-signs/patient/${patientId}`);
    return response.data;
  },

  /**
   * Get medical records created by the current doctor
   */
  getMyRecords: async (): Promise<MedicalRecord[]> => {
    const response = await api.get<MedicalRecord[]>('/medical/records/my');
    return normalizeMedicalRecordList(response.data || []);
  },

  /**
   * Get prescriptions created by the current doctor
   */
  getMyPrescriptions: async (): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>('/medical/prescriptions/my');
    return response.data || [];
  },

  /**
   * Get all prescriptions for a patient
   */
  getPatientPrescriptions: async (patientId: string): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>(`/medical/prescriptions/patient/${patientId}`);
    return response.data;
  },

  /**
   * Get complete medical history for a patient
   */
  getPatientHistory: async (patientId: string): Promise<PatientMedicalHistory> => {
    const [records, vitalSigns, prescriptions] = await Promise.all([
      medicalService.getPatientRecords(patientId),
      medicalService.getPatientVitalSigns(patientId),
      medicalService.getPatientPrescriptions(patientId),
    ]);

    return {
      patientId,
      records,
      vitalSignsTrend: vitalSigns,
      prescriptions,
    };
  },

  // ============================================
  // AI Analysis (Integration with du-tu-pulmo_ai)
  // ============================================

  /**
   * Upload X-ray image for AI analysis
   */
  analyzeXray: async (
    patientId: string,
    file: File,
    screeningId?: string,
    modelVersion?: string,
    medicalRecordId?: string
  ): Promise<UploadAnalyzeResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('patientId', patientId);
    if (screeningId) {
      formData.append('screeningId', screeningId);
    }
    if (modelVersion) {
      formData.append('modelVersion', modelVersion);
    }
    if (medicalRecordId) {
      formData.append('medicalRecordId', medicalRecordId);
    }
    
    const response = await api.post<UploadAnalyzeResponse>(`/screenings/workflow/xray-analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ============================================
  // Medical Record Signing & PDF
  // ============================================

  /**
   * Sign a medical record (digital signature)
   * @roles DOCTOR (own)
   * @condition Record must be COMPLETED status
   */
  signMedicalRecord: async (recordId: string, dto: SignMedicalRecordDto): Promise<MedicalRecordDetailResponse> => {
    const response = await api.post<MedicalRecordDetailResponse>(`/medical/records/${recordId}/sign`, dto);
    return response.data;
  },

  /**
   * Cập nhật API lấy URL PDF bệnh án
   */
  getMedicalRecordPdfUrl: async (recordId: string): Promise<{ pdfUrl: string | null }> => {
    const response = await api.get<{ pdfUrl: string | null }>(`/medical/records/${recordId}/pdf`);
    return response.data;
  },

  /**
   * Tạo file PDF bệnh án mới
   */
  generateMedicalRecordPdf: async (recordId: string): Promise<{ pdfUrl: string }> => {
    const response = await api.post<{ pdfUrl: string }>(`/medical/records/${recordId}/pdf`);
    return response.data;
  },

  /**
   * Lấy URL PDF đơn thuốc
   */
  getPrescriptionPdfUrl: async (prescriptionId: string): Promise<{ pdfUrl: string | null }> => {
    const response = await api.get<{ pdfUrl: string | null }>(`/medical/prescriptions/${prescriptionId}/pdf`);
    return response.data;
  },

  /**
   * Tạo file PDF đơn thuốc mới
   */
  generatePrescriptionPdf: async (prescriptionId: string): Promise<{ pdfUrl: string }> => {
    const response = await api.post<{ pdfUrl: string }>(`/medical/prescriptions/${prescriptionId}/pdf`);
    return response.data;
  },


  // ============================================
  // Medical Record - Read-only Detail (COMPLETED)
  // ============================================

  /**
   * Get medical record detail (read-only)
   * @roles DOCTOR (treated), PATIENT (own), ADMIN
   * @condition record must exist
   */
  getMedicalRecordById: async (recordId: string): Promise<MedicalRecordDetailResponse> => {
    const response = await api.get<MedicalRecordDetailResponse>(
      `/medical/records/${recordId}/detail`
    );
    return response.data;
  },

  /**
   * Get medical record for examination (Doctor View)
   * Uses optimized DTO
   */
  getMedicalRecordForExamination: async (recordId: string): Promise<MedicalRecordExamination> => {
    const response = await api.get<MedicalRecordExamination>(
      `/medical/records/${recordId}/examination`
    );
    return response.data;
  },

  /**
   * Get medical record detail by ID
   * @param id Medical Record ID
   */
    getDetail: async (id: string): Promise<MedicalRecordDetailResponse> => {
    const response = await api.get<MedicalRecordDetailResponse>(`/medical/records/${id}/detail`);
    return response.data;
  },

  /**
   * Get prescription detail by ID
   * @param id Prescription ID
   */
  getPrescriptionDetail: async (id: string): Promise<Prescription> => {
    const response = await api.get<Prescription>(`/medical/prescriptions/${id}`);
    return response.data;
  },
};

export default medicalService;
