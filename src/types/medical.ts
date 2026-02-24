import type { Appointment, Doctor, Patient } from "@/types/appointment";
import type { PatientResponse } from "./patient";

// ============================================================================
// ENUMS - Match BE enums exactly
// ============================================================================

export const SignedStatusEnum = {
  NOT_SIGNED: 'NOT_SIGNED',
  SIGNED: 'SIGNED',
} as const;
export type SignedStatusEnum = typeof SignedStatusEnum[keyof typeof SignedStatusEnum];

export const PrescriptionStatusEnum = {
  ACTIVE: 'ACTIVE',
  FILLED: 'FILLED',
  PARTIALLY_FILLED: 'PARTIALLY_FILLED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;
export type PrescriptionStatusEnum = typeof PrescriptionStatusEnum[keyof typeof PrescriptionStatusEnum];

export const ScreeningStatusEnum = {
  UPLOADED: 'UPLOADED',
  PENDING_AI: 'PENDING_AI',
  AI_PROCESSING: 'AI_PROCESSING',
  AI_COMPLETED: 'AI_COMPLETED',
  AI_FAILED: 'AI_FAILED',
  PENDING_DOCTOR: 'PENDING_DOCTOR',
  DOCTOR_REVIEWING: 'DOCTOR_REVIEWING',
  DOCTOR_COMPLETED: 'DOCTOR_COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type ScreeningStatusEnum = typeof ScreeningStatusEnum[keyof typeof ScreeningStatusEnum];

export const ScreeningPriorityEnum = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
  CRITICAL: 'CRITICAL',
} as const;
export type ScreeningPriorityEnum = typeof ScreeningPriorityEnum[keyof typeof ScreeningPriorityEnum];

export const ScreeningTypeEnum = {
  XRAY: 'XRAY',
  CT: 'CT',
  MRI: 'MRI',
  ULTRASOUND: 'ULTRASOUND',
  OTHER: 'OTHER',
} as const;
export type ScreeningTypeEnum = typeof ScreeningTypeEnum[keyof typeof ScreeningTypeEnum];

export const DiagnosisStatusEnum = {
  PENDING: 'PENDING',
  NORMAL: 'NORMAL',
  ABNORMAL: 'ABNORMAL',
  UNCERTAIN: 'UNCERTAIN',
} as const;
export type DiagnosisStatusEnum = typeof DiagnosisStatusEnum[keyof typeof DiagnosisStatusEnum];

export const DecisionSourceEnum = {
  AI_ONLY: 'AI_ONLY',
  DOCTOR_ONLY: 'DOCTOR_ONLY',
  DOCTOR_REVIEWED_AI: 'DOCTOR_REVIEWED_AI',
  DOCTOR_OVERRIDE_AI: 'DOCTOR_OVERRIDE_AI',
} as const;
export type DecisionSourceEnum = typeof DecisionSourceEnum[keyof typeof DecisionSourceEnum];

// ============================================================================
// MEDICAL RECORD TYPES - Matched with BE entity + MedicalRecordDetailResponseDto
// ============================================================================

/**
 * Medical Record Response from BE
 * Maps to MedicalRecordResponseDto / MedicalRecordDetailResponseDto in BE
 */
export interface MedicalRecord {
  id: string;
  recordNumber: string;
  patientId: string;
  patient?: Patient;
  doctorId: string | null;
  doctor?: Doctor;
  appointmentId: string;
  appointment?: Appointment;
  
  // ===== SIGNING FIELDS =====
  signedStatus: SignedStatusEnum;
  signedAt?: Date | null;
  digitalSignature?: string | null;
  pdfUrl?: string | null;
  
  // ===== ADMINISTRATIVE FIELDS =====
  recordType: string;                      
  specialty?: string | null;
  patientCategory?: string | null;         
  insuranceNumber?: string | null;
  insuranceExpiry?: Date | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactAddress?: string | null;
  referralDiagnosis?: string | null;
  
  // ===== MEDICAL FIELDS =====
  chiefComplaint?: string | null;          
  presentIllness?: string | null;          
  medicalHistory?: string | null;          
  surgicalHistory?: string | null;         
  familyHistory?: string | null;           
  allergies?: string[] | null;
  chronicDiseases?: string[] | null;
  currentMedications?: string[] | null;
  
  // Lifestyle
  smokingStatus: boolean;
  smokingYears?: number | null;
  alcoholConsumption: boolean;
  occupation?: string | null;
  
  // Examination & Diagnosis
  physicalExamNotes?: string | null;       
  assessment?: string | null;              
  diagnosis?: string | null;          
  treatmentPlan?: string | null;           
  
  // ===== EXTENDED MEDICAL FIELDS =====
  systemsReview?: string | null;           
  initialDiagnosis?: string | null;        
  treatmentGiven?: string | null;          
  dischargeDiagnosis?: string | null;      
  treatmentStartDate?: Date | null;
  treatmentEndDate?: Date | null;
  
  // ===== SUMMARY FIELDS =====
  progressNotes?: string | null;           
  primaryDiagnosis?: string | null;        
  secondaryDiagnosis?: string | null;      
  dischargeCondition?: string | null;      
  followUpInstructions?: string | null;    
  fullRecordSummary?: string | null;    
  
  // Imaging records (JSONB)
  imagingRecords?: {
    xray?: string;
    ctScan?: string;
    ultrasound?: string;
    labTests?: string;
    fullRecord?: string;
  } | null;
  
  // Related record (for linking)
  relatedRecordId?: string | null;
  
  // Relations (loaded from BE)
  vitalSigns?: VitalSign[];
  prescriptions?: Prescription[];
  
  // Status
  status: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ===== EXAMINATION VIEW DTO =====

export interface MedicalRecordExamination {
  id: string;
  recordNumber: string;
  patient: {
    id: string;
    fullName: string;
    dateOfBirth: string | Date; 
    gender: string;
    phone: string;
    address: string;
  };
  allergies?: string[];
  chronicDiseases?: string[];
  currentMedications?: string[];
  smokingStatus?: boolean;
  smokingYears?: number;
  alcoholConsumption?: boolean;
  occupation?: string;
  surgicalHistory?: string;
  familyHistory?: string;
  latestVitalSign?: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    spo2?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    recordedAt: string | Date;
  };
  chiefComplaint?: string;
  presentIllness?: string;
  physicalExamNotes?: string;
  assessment?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  recentRecords?: Array<{
    id: string;
    recordNumber: string;
    visitDate: string | Date;
    diagnosis: string;
    doctor: string;
  }>;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface MedicalImageResponseDto {
  id: string;
  screeningId: string;
  medicalRecordId?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  dpi?: number;
}

/**
 * AI Analysis Response DTO
 */
export interface AIAnalysisResponseDto {
  id: string;
  screeningId: string;
  medicalImageId: string;
  pulmoFileId: string;
  diagnosisStatus: DiagnosisStatusEnum;
  primaryDiagnosis?: Record<string, any>;
  findings?: Array<Record<string, any>>;
  grayZoneNotes?: Array<Record<string, any>>;
  totalFindings?: number;
  originalImageUrl?: string;
  annotatedImageUrl?: string;
  evaluatedImageUrl?: string;
  rawPredictions?: Record<string, any>;
  errorMessage?: string;
  analyzedAt?: string;
  createdAt: string;
}

/**
 * Screening Conclusion Response DTO
 */
export interface ScreeningConclusionResponseDto {
  id: string;
  screeningId: string;
  aiAnalysisId?: string;
  medicalRecordId?: string;
  patientId: string;
  doctorId: string;
  agreesWithAi: boolean;
  decisionSource: DecisionSourceEnum;
  doctorOverrideReason?: string;
  reviewedAt?: string;
  treatmentEndDate?: string;
  pdfUrl?: string; 
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMedicalRecordDto {
  recordType?: string;
  chiefComplaint?: string;
  presentIllness?: string;
  medicalHistory?: string;
  surgicalHistory?: string;
  familyHistory?: string;
  physicalExamNotes?: string;
  systemsReview?: string;
  assessment?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  treatmentGiven?: string;
  dischargeDiagnosis?: string;
  treatmentStartDate?: string;
  treatmentEndDate?: string;
  progressNotes?: string;
  primaryDiagnosis?: string;
  secondaryDiagnosis?: string;
  dischargeCondition?: string;
  followUpInstructions?: string;
  fullRecordSummary?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  currentMedications?: string[];
  smokingStatus?: boolean;
  smokingYears?: number;
  alcoholConsumption?: boolean;
}

export interface ScreeningRequestResponseDto {
  id: string;
  patientId: string;
  uploadedByDoctorId?: string;
  screeningNumber: string;
  screeningType?: ScreeningTypeEnum;
  status: ScreeningStatusEnum;
  priority: ScreeningPriorityEnum;
  requestedAt?: string;
  uploadedAt?: string;
  aiStartedAt?: string;
  aiCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  patient?: PatientResponse;
  uploadedByDoctor?: Doctor;
  images?: MedicalImageResponseDto[];
  aiAnalyses?: AIAnalysisResponseDto[];
  conclusions?: ScreeningConclusionResponseDto[];
}


export interface MedicalRecordDetailResponse {
  id: string;
  recordNumber: string;
  patient: {
    id: string;
    fullName: string;
    gender: string;
    dateOfBirth: string;
  };
  doctor: {
    id: string;
    fullName: string;
  };
  appointment: {
    id: string;
    appointmentNumber: string;
    status: string;
    scheduledAt: string;
  };
  
  // Signing
  signedStatus: SignedStatusEnum;
  signedAt?: string;
  digitalSignature?: string;
  
  // Diagnosis
  diagnosis?: string;
  recordType: string;
  
  // Chief Complaint & History
  chiefComplaint?: string;
  presentIllness?: string;
  medicalHistory?: string;
  familyHistory?: string;
  surgicalHistory?: string;
  
  // Vital Signs
  vitalSigns: {
    temperature?: number;
    respiratoryRate?: number;
    weight?: number;
    bloodPressure?: string;
    heartRate?: number;
    height?: number;
    bmi?: number;
    spo2?: number;
    spO2?: number;
  };
  
  // Physical Exam
  physicalExamNotes?: string;
  systemsReview?: string;
  
  // Treatment
  treatmentGiven?: string;
  treatmentPlan?: string;
  treatmentStartDate?: string;
  treatmentEndDate?: string;
  
  // Discharge
  dischargeDiagnosis?: string;
  dischargeCondition?: string;
  
  // Prescriptions
  prescriptions: string[] | Array<{
    id: string;
    prescriptionNumber: string;
    items: Array<{
      medicineName: string;
      quantity: number;
      unit: string;
      dosage: string;
      frequency: string;
      durationDays: number;
      instructions?: string;
      startDate?: string;
      endDate?: string;
    }>;
    notes?: string;
    pdfUrl?: string;
    instructions?: string;
    createdAt: string;
  }>;
  
  // Progress & Assessment
  progressNotes?: string;
  primaryDiagnosis?: string;
  secondaryDiagnosis?: string;
  assessment?: string;
  followUpInstructions?: string;
  
  // Patient Lifestyle (can be string or array)
  allergies?: string | string[];
  chronicDiseases?: string | string[];
  currentMedications?: string | string[];
  smokingStatus?: boolean;
  smokingYears?: number;
  alcoholConsumption?: boolean;
  
  // Status & Timestamps
  status: string;
  createdAt: string;
  updatedAt: string;
  
  // PDF
  pdfUrl?: string;

  fullRecordSummary?: string;
  
  // Screening Requests (full structure)
  screeningRequests?: ScreeningRequestResponseDto[];
}


/**
 * Update Medical Record DTO
 * Matches BE UpdateMedicalRecordDto exactly
 */
export interface UpdateMedicalRecordDtoForEncounter {
  chiefComplaint?: string;
  physicalExamNotes?: string;
  assessment?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  presentIllness?: string;
  medicalHistory?: string;
  surgicalHistory?: string;
  familyHistory?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  currentMedications?: string[];
  smokingStatus?: boolean;
  smokingYears?: number;
  alcoholConsumption?: boolean;
  occupation?: string;
  followUpInstructions?: string;
  progressNotes?: string;
  followUpRequired?: boolean;
  nextAppointmentDate?: string;
}

// ============================================================================
// VITAL SIGNS - Match BE entity (uses string bloodPressure format)
// ============================================================================

export interface VitalSign {
  id: string;
  patientId: string;
  medicalRecordId?: string;
  
  // Measurements
  height?: number;                    // cm
  weight?: number;                    // kg
  bmi?: number;                       // Auto-calculated by BE
  temperature?: number;               // °C
  bloodPressure?: string;             // ✅ Fixed: String format "120/80" per BE
  heartRate?: number;                 // bpm
  respiratoryRate?: number;           // breaths/min
  spo2?: number;                      // % (entity uses spo2)  
  // Metadata
  notes?: string;
  createdAt: string;
}

/**
 * CreateVitalSignDto - Matches BE exactly
 * Uses string bloodPressure and spo2 field name
 */
export interface CreateVitalSignDto {
  temperature?: number;               
  bloodPressure?: string;            
  heartRate?: number;                
  respiratoryRate?: number;          
  spo2?: number;          
  height?: number;                   
  weight?: number;                   
}

// ============================================================================
// UTILITY: Blood Pressure Helpers
// ============================================================================

/**
 * Parse blood pressure string to systolic/diastolic
 * @param bp - Blood pressure string in format "120/80"
 * @returns Object with systolic and diastolic or null if invalid
 */
export function parseBloodPressure(bp?: string): { systolic: number; diastolic: number } | null {
  if (!bp) return null;
  const parts = bp.split('/');
  if (parts.length !== 2) return null;
  const systolic = parseInt(parts[0], 10);
  const diastolic = parseInt(parts[1], 10);
  if (isNaN(systolic) || isNaN(diastolic)) return null;
  return { systolic, diastolic };
}

/**
 * Format systolic/diastolic to blood pressure string
 * @param systolic - Systolic pressure (mmHg)
 * @param diastolic - Diastolic pressure (mmHg)
 * @returns Blood pressure string in format "120/80"
 */
export function formatBloodPressure(systolic?: number, diastolic?: number): string | undefined {
  if (systolic === undefined || diastolic === undefined) return undefined;
  return `${systolic}/${diastolic}`;
}

// ============================================================================
// PRESCRIPTIONS - Match BE Prescription entity
// ============================================================================

export interface Prescription {
  id: string;
  patientId: string;
  doctorId?: string;
  medicalRecordId?: string;
  appointmentId?: string;
  prescriptionNumber: string;
  diagnosis?: string;
  notes?: string;
  status?: string;
  pdfUrl?: string;
  items: PrescriptionItem[];
  createdAt: string;
  medicalRecord?: {
    id: string;
    patientId: string;
    doctorId: string;
    appointmentId: string;
    medicalRecordNumber: string;
    diagnosis: string;
    notes: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  patient?: {
    id: string;
    user: {
      fullName: string;
    }
  };
  doctor?: {
    id: string;
    fullName: string;
  };
}

/**
 * PrescriptionItem - Match BE entity exactly
 * NOTE: BE uses string fields: dosage, frequency, duration (not numeric morning/noon/etc)
 */
export interface PrescriptionItem {
  id: string;
  medicineId?: string;
  medicineName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity?: number;
  instructions?: string;
  unit: string;
}

/**
 * CreatePrescriptionItemDto - For creating prescription items
 * Matches BE CreatePrescriptionItemDto
 */
export interface CreatePrescriptionItemDto {
  medicineId?: string;
  medicineName: string;               // Required
  dosage: string;                     // Required, e.g., "500mg"
  frequency: string;                  // Required, e.g., "3 lần/ngày"
  duration: string;                   // Required, e.g., "7 ngày" (BE DTO uses string)
  unit?: string;
  quantity?: number;                  // Min: 1
  instructions?: string;              // MaxLength: 500
}

/**
 * CreatePrescriptionDto - For creating prescriptions
 * Matches BE CreatePrescriptionDto
 */
export interface CreatePrescriptionDto {
  diagnosis?: string;                 // MaxLength: 1000
  notes?: string;                     // MaxLength: 1000
  items: CreatePrescriptionItemDto[];
}

// ============================================================================
// MEDICINE (Drug Database) - Match BE Medicine entity
// ============================================================================

export type GoodsType = string;
export type ProductCategory = string;
export type MedicineGroup = string;
export type RouteOfAdministration = string;
export type UnitOfMeasure = string;

export interface Medicine {
  id: string;
  code: string;
  name: string;
  genericName?: string;
  packing?: string;
  strength?: string;
  unit?: UnitOfMeasure;
  category?: ProductCategory;
  description?: string;
  price?: number;
  manufacturer?: string;
  isActive: boolean;
  
  goodsType?: GoodsType;
  activeIngredient?: string;
  content?: string;
  countryOfOrigin?: string;
  guide?: string;
  registrationNumber?: string;
  group?: MedicineGroup;
  route?: RouteOfAdministration;

  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicineDto {
  name: string;
  registrationNumber?: string;
  activeIngredient?: string;
  content?: string;
  goodsType: GoodsType;
  category?: ProductCategory;
  group?: MedicineGroup;
  route?: RouteOfAdministration;
  unit: UnitOfMeasure;
  packing?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  guide?: string;
  description?: string;
  status: boolean;
}

export interface UpdateMedicineDto extends Partial<CreateMedicineDto> {
  status?: boolean;
}

export interface FilterMedicineDto {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  goodsType?: GoodsType[];
  category?: ProductCategory[];
  group?: MedicineGroup[];
  isActive?: boolean;
}

export interface PaginatedMedicines {
  items: Medicine[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ============================================================================
// AI ANALYSIS - Match Flask API response structure
// ============================================================================

/**
 * Risk levels from AI analysis (priority order)
 */
export const AIRiskLevel = {
  CRITICAL: 'CRITICAL',    // 🔴 Pneumothorax - CẤP CỨU
  HIGH: 'HIGH',            // 🟠 Nodule/Mass, Pleural effusion, etc.
  WARNING: 'WARNING',      // 🟡 ILD, Pulmonary fibrosis, Cardiomegaly, etc.
  BENIGN: 'BENIGN',        // 🟢 Calcification, Other lesion
  NORMAL: 'NORMAL',        // ✅ No abnormalities detected
} as const;
export type AIRiskLevel = typeof AIRiskLevel[keyof typeof AIRiskLevel];

export const AIDiagnosisStatus = {
  NORMAL: 'NORMAL',
  ABNORMAL: 'ABNORMAL',
  UNCERTAIN: 'UNCERTAIN',
} as const;
export type AIDiagnosisStatus = typeof AIDiagnosisStatus[keyof typeof AIDiagnosisStatus];

/**
 * Individual finding from AI detection
 * Matches Flask API detection format
 */
export interface AIFinding {
  label: string;                      // e.g., "Pneumothorax", "Nodule"
  classId: number;                    // Class ID from YOLO model
  confidence: number;                 // 0-1 range (NOTE: multiply by 100 for percentage)
  bbox: {                             // ✅ Changed: x1/y1/x2/y2 format per Flask API
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  riskLevel?: AIRiskLevel;
}

/**
 * AI Analysis Response from Flask API (/api/v1/predict)
 * Matches Flask API response structure exactly
 */
export interface AIAnalysisResponse {
  success: boolean;
  fileId: string;
  data: {
    diagnosisStatus: AIDiagnosisStatus;
    riskLevel: AIRiskLevel;
    findings: AIFinding[];
    recommendations: string[];
    summary?: string;
  };
  images: {
    original: string;                 // Cloudinary URL
    annotated: string | null;         // YOLO detection visualization
    evaluated: string | null;         // Risk-colored visualization
  };
  performance?: {
    preprocessMs: number;
    inferenceMs: number;
    totalProcessMs: number;
  };
}

/**
 * Legacy AIAnalysisResult format (for backward compatibility)
 * Used in specializedExamData - consider deprecating
 */
export interface AIAnalysisResult {
  imageUrl?: string;
  confidence?: number;                // 0-100 percentage
  findings?: string;                  // Concatenated findings as string
  boundingBox?: {                     // Legacy x/y/width/height format
    x: number;
    y: number;
    width: number;
    height: number;
  };
  recommendation?: string;
  analyzedAt?: string;
  // New fields
  riskLevel?: AIRiskLevel;
  diagnosisStatus?: AIDiagnosisStatus;
  rawFindings?: AIFinding[];          // Keep original findings array
  annotatedImageUrl?: string;
  evaluatedImageUrl?: string;
}

// ============================================================================
// UTILITY: AI Response Converters
// ============================================================================

/**
 * Convert Flask API bbox (x1/y1/x2/y2) to legacy format (x/y/width/height)
 */
export function convertBBoxToLegacy(bbox: AIFinding['bbox']): { x: number; y: number; width: number; height: number } {
  return {
    x: bbox.x1,
    y: bbox.y1,
    width: bbox.x2 - bbox.x1,
    height: bbox.y2 - bbox.y1,
  };
}

/**
 * Convert full AIAnalysisResponse to legacy AIAnalysisResult format
 */
export function convertToLegacyAIResult(response: AIAnalysisResponse): AIAnalysisResult {
  const primaryFinding = response.data.findings[0];
  const findingsText = response.data.findings
    .map(f => `${f.label} (${Math.round(f.confidence * 100)}%)`)
    .join(', ');
  
  return {
    imageUrl: response.images.original,
    confidence: primaryFinding ? Math.round(primaryFinding.confidence * 100) : undefined,
    findings: findingsText || undefined,
    boundingBox: primaryFinding ? convertBBoxToLegacy(primaryFinding.bbox) : undefined,
    recommendation: response.data.recommendations.join('. '),
    analyzedAt: new Date().toISOString(),
    riskLevel: response.data.riskLevel,
    diagnosisStatus: response.data.diagnosisStatus,
    rawFindings: response.data.findings,
    annotatedImageUrl: response.images.annotated || undefined,
    evaluatedImageUrl: response.images.evaluated || undefined,
  };
}

// ============================================================================
// SPECIALIZED EXAM DATA (FE-only, consider removing if not stored in BE)
// ============================================================================

export interface SpecializedExamData {
  // Template (e.g., "Hô hấp", "Tim mạch")
  template?: string;
  
  // Respiratory Exam - Chest Observation
  chestObservation?: 'normal' | 'barrel_chest' | 'poor_mobility' | 'scoliosis';
  
  // Respiratory Exam - Breath Sounds
  breathSounds?: 'soft' | 'diminished' | 'absent';
  
  // Respiratory Exam - Lung Sounds
  leftLungSounds?: ('crackles' | 'wheeze' | 'rhonchi')[];
  rightLungSounds?: ('crackles' | 'wheeze' | 'rhonchi')[];
  
  // Additional Notes
  additionalNotes?: string;
  
  // Spirometry Data (if available)
  spirometry?: SpirometryData;
  
  // AI Analysis Result (if X-ray uploaded)
  aiAnalysis?: AIAnalysisResult;
}

export interface SpirometryData {
  fev1?: number;              // Forced Expiratory Volume in 1 second (L)
  fev1Predicted?: number;     // Predicted FEV1 (%)
  fvc?: number;               // Forced Vital Capacity (L)
  fvcPredicted?: number;      // Predicted FVC (%)
  fev1FvcRatio?: number;      // FEV1/FVC ratio (%)
  interpretation?: string;    // e.g., "Normal", "Obstructive", "Restrictive"
}

// ============================================================================
// PATIENT MEDICAL HISTORY
// ============================================================================

export interface PatientMedicalHistory {
  patientId: string;
  records: MedicalRecord[];
  vitalSignsTrend: VitalSign[];
  prescriptions: Prescription[];
}


// ============================================================================
// SIGNING DTO
// ============================================================================
export interface SignMedicalRecordDto {
  recordIds?: string[];
  signature?: string;
  notes?: string;
}
