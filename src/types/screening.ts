import type { PatientResponse } from "./patient";
import type { DoctorProfile } from "./profile";

export type ScreeningType = "XRAY" | "CT" | "MRI" | "ULTRASOUND" | "OTHER";
export type ScreeningStatus =
  | "UPLOADED"
  | "PENDING_AI"
  | "AI_PROCESSING"
  | "AI_COMPLETED"
  | "AI_FAILED"
  | "PENDING_DOCTOR"
  | "DOCTOR_REVIEWING"
  | "DOCTOR_COMPLETED"
  | "CANCELLED";
export type ScreeningPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type AiDiagnosisStatus = "DETECTED" | "UNCERTAIN" | "ERROR" | "PENDING";
export type AiRiskLevel = "Critical" | "High" | "Warning" | "Normal" | "Benign";
export type DecisionSource = "AI_ONLY" | "DOCTOR_ONLY" | "DOCTOR_REVIEWED_AI";

export interface AiBoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface AiFinding {
  label: string;
  name_vn: string;
  probability: number;
  risk_level: AiRiskLevel;
  confidence_level?: string;
  recommendation?: string;
  bbox?: AiBoundingBox;
}

export interface AiPrimaryDiagnosis {
  label: string;
  name_vn: string;
  risk_level: AiRiskLevel;
  confidence_level?: string;
  recommendation?: string;
  color?: string;
  probability?: number;
}

export interface AiGrayZoneNote {
  label: string;
  name_vn: string;
  probability: number;
  required_threshold: number;
  bbox?: AiBoundingBox;
}

export interface AiAnalysisResponse {
  id: string;
  screeningId: string;
  medicalImageId: string;
  pulmoFileId?: string;
  diagnosisStatus: AiDiagnosisStatus;
  primaryDiagnosis?: AiPrimaryDiagnosis;
  findings?: AiFinding[];
  grayZoneNotes?: AiGrayZoneNote[];
  totalFindings: number;
  originalImageUrl?: string;
  annotatedImageUrl?: string;
  evaluatedImageUrl?: string;
  rawPredictions?: Record<string, unknown>;
  errorMessage?: string;
  analyzedAt: string;
  createdAt: string;
}

export interface MedicalImageResponse {
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

export interface ScreeningConclusionResponse {
  id: string;
  screeningId?: string;
  aiAnalysisId?: string;
  medicalRecordId?: string;
  patientId: string;
  doctorId?: string;
  agreesWithAi?: boolean;
  decisionSource?: DecisionSource;
  doctorOverrideReason?: string;
  doctorNotes?: string;
  conclusion?: string;
  reviewedAt: string;

  createdAt: string;
  updatedAt: string;
  doctor: DoctorProfile
}

export interface ScreeningRequestResponse {
  id: string;
  patientId: string;
  uploadedByDoctorId?: string;
  screeningNumber: string;
  screeningType: ScreeningType;
  status: ScreeningStatus;
  priority: ScreeningPriority;
  requestedAt?: string;
  uploadedAt?: string;
  aiStartedAt?: string;
  aiCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
  images?: MedicalImageResponse[];
  aiAnalyses?: AiAnalysisResponse[];
  conclusions?: ScreeningConclusionResponse[];
  patient?: PatientResponse;
}

export interface UploadAnalyzeResponse {
  screening: ScreeningRequestResponse;
  image: MedicalImageResponse;
  analysis: AiAnalysisResponse;
}

export interface GetScreeningsQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  status?: ScreeningStatus;
  screeningType?: ScreeningType;
  patientId?: string;
}

export interface PaginatedScreenings {
  items: ScreeningRequestResponse[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateConclusionDto {
  agreesWithAi?: boolean;
  decisionSource: DecisionSource;
  doctorOverrideReason?: string;
  doctorNotes?: string;
  conclusion?: string;
}

