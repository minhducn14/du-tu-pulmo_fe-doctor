export type ScreeningType = 'XRAY' | 'CT' | 'MRI' | 'ULTRASOUND' | 'OTHER';

export type ScreeningStatus =
  | 'REQUESTED'
  | 'UPLOADED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type ScreeningPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type AiDiagnosisStatus = 'DETECTED' | 'UNCERTAIN' | 'ERROR' | 'PENDING';

export type AiRiskLevel = 'Critical' | 'High' | 'Warning' | 'Normal' | 'Benign';

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
  confidence_level: string;
  recommendation: string;
  bbox?: AiBoundingBox;
}

export interface AiPrimaryDiagnosis {
  label: string;
  name_vn: string;
  risk_level: AiRiskLevel;
  confidence_level?: string;
  recommendation: string;
  color: string;
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
  modelName: string;
  modelVersion: string;
  modelType?: string;
  pulmoFileId?: string;
  diagnosisStatus: AiDiagnosisStatus;
  primaryDiagnosis?: AiPrimaryDiagnosis;
  findings?: AiFinding[];
  grayZoneNotes?: AiGrayZoneNote[];
  totalFindings: number;
  originalImageUrl?: string;
  annotatedImageUrl?: string;
  evaluatedImageUrl?: string;
  predictedCondition?: string;
  confidenceScore?: number;
  alternativePredictions?: { condition: string; score: number }[];
  heatmapUrl?: string;
  gradcamUrl?: string;
  detectionBoxes?: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    confidence: number;
  }[];
  segmentationMaskUrl?: string;
  processingTimeMs?: number;
  gpuUsed?: string;
  memoryUsedMb?: number;
  imageQualityPassed: boolean;
  qualityIssues?: string[];
  rawPredictions?: Record<string, unknown>;
  featureImportance?: Record<string, number>;
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

export interface ScreeningRequestResponse {
  id: string;
  patientId: string;
  uploadedByDoctorId?: string;
  screeningNumber: string;
  screeningType: ScreeningType;
  status: ScreeningStatus;
  priority: ScreeningPriority;
  assignedDoctorId?: string;
  reassignCount: number;
  reassignHistory?: { doctorId: string; reason: string; at: string }[];
  requestedAt?: string;
  uploadedAt?: string;
  aiStartedAt?: string;
  aiCompletedAt?: string;
  doctorAssignedAt?: string;
  doctorCompletedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  source?: string;
  deviceInfo?: Record<string, unknown>;
  aiModelVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadAnalyzeResponse {
  screening: ScreeningRequestResponse;
  image: MedicalImageResponse;
  analysis: AiAnalysisResponse;
}
