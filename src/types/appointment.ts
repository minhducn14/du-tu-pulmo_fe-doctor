import { 
  AppointmentSource,
  AppointmentStatus, 
  AppointmentSubType, 
  AppointmentType 
} from '@/lib/constants';

export { AppointmentStatus, AppointmentType };

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
} as const;
export type Gender = typeof Gender[keyof typeof Gender];


  
export interface Patient {
  id: string;
  profileCode?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    dateOfBirth: string;
    gender: Gender;
    phone?: string;
    address?: string;
    avatarUrl?: string;
  };
}

export interface Doctor {
  id: string;
  userId: string;
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  status?: string;
  CCCD?: string;
  province?: string;
  ward?: string;
  address?: string;
  practiceStartYear?: number;
  licenseNumber?: string;
  licenseImageUrls?: { url: string; expiry?: string }[];
  title?: string;
  position?: string;
  specialty?: string;
  yearsOfExperience?: number;
  primaryHospitalId?: string;
  primaryHospital?: {
    id: string;
    name: string;
    hospitalCode: string;
    address: string;
    phone: string;
  } | null;
  expertiseDescription?: string;
  bio?: string;
  workExperience?: string;
  education?: string;
  certifications?: { name: string; issuer: string; year: number }[];
  awardsResearch?: string;
  trainingUnits?: { url: string; name: string }[];
  averageRating?: string;
  totalReviews?: number;
  verifiedAt?: string;
  defaultConsultationFee?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
}

export interface Appointment {
  id: string;
  appointmentNumber: string;

  patientId?: string;

  doctorId?: string;
  bookedByUserId?: string;
  hospitalId?: string;
  screeningId?: string;

  timeSlotId?: string;

  scheduledAt: string;
  durationMinutes?: number;
  timezone?: string;

  status: AppointmentStatus;
  appointmentType: AppointmentType;
  subType: AppointmentSubType;
  sourceType: AppointmentSource;

  feeAmount: string;
  paidAmount: string;

  paymentId?: string;

  refunded: boolean;
  refundAmount?: string;
  refundStatus?: string;

  meetingRoomId?: string;
  meetingUrl?: string;
  meetingPassword?: string;
  recordingUrl?: string;
  recordingConsent?: boolean;

  dailyCoToken?: string;
  dailyCoChannel?: string;
  dailyCoUid?: number;

  queueNumber?: number;

  chiefComplaint?: string;
  symptoms?: string[];
  patientNotes?: string;
  doctorNotes?: string;
  clinicalNotes?: string;

  followUpRequired?: boolean;
  nextAppointmentDate?: string;
  hasFollowUp?: boolean;
  followUpAppointmentId?: string;

  reminder24hSent?: boolean;
  reminder1hSent?: boolean;
  reminderSentAt?: string; 
  confirmationSent?: boolean;

  checkInTime?: string;
  startedAt?: string;
  endedAt?: string;

  startTime?: string;
  endTime?: string;

  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;

  patientRating?: number;

  patient?: Patient;
  doctor?: Doctor;
  timeSlot?: TimeSlot;

  medicalRecordId?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateMedicalRecordDtoForEncounter {
  chiefComplaint?: string;
  presentIllness?: string;
  physicalExamNotes?: string;
  assessment?: string;
  diagnosis?: string;
  treatmentPlan?: string;
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

export interface DoctorQueueDto {
  doctor?: Doctor;
  patient?: Patient;
  totalInQueue: number;
  waitingQueue: Appointment[];
  inProgress: Appointment[];
  upcomingToday: Appointment[];
  currentPatient?: Appointment;
  nextPatient?: Appointment;
}

export interface CheckInByNumberDto {
  appointmentNumber: string;
}


export interface AppointmentQuery {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedAppointment {
    items: Appointment[];
    meta: {
        currentPage: number;
        itemsPerPage: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    }
}

// =========================
// Create Appointment DTO
// =========================
export interface CreateAppointmentDto {
  timeSlotId: string;
  patientId: string;
  appointmentType?: AppointmentType | 'IN_CLINIC' | 'VIDEO';
  hospitalId?: string;
  subType?: AppointmentSubType;
  sourceType?: AppointmentSource;
  chiefComplaint?: string;
  symptoms?: string[];
  patientNotes?: string;
}

// =========================
// Update Status DTO
// =========================
export interface UpdateStatusDto {
  status: AppointmentStatus;
}

// =========================
// Cancel Appointment DTO
// =========================
export interface CancelAppointmentDto {
  reason: string;
}

// =========================
// Reschedule Appointment DTO
// =========================
export interface RescheduleAppointmentDto {
  newTimeSlotId: string;
}

// =========================
// Complete Examination DTO
// =========================
export interface CompleteExaminationDto {
  physicalExamNotes?: string;
  assessment?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  followUpRequired?: boolean;
  nextAppointmentDate?: string;
}

// =========================
// Statistics & Video
// =========================
export interface AppointmentStatistics {
    totalAppointments: number;
  completedCount: number;
  cancelledCount: number;
  pendingCount: number;
  confirmedCount: number;
  inProgressCount: number;
  upcomingCount: number;
  todayCount?: number;
  upcomingAppointments: Appointment[];
}

export interface UserCallStatus {
  inCall: boolean;
  currentCall?: {
    appointmentId: string;
    roomName: string;
    joinedAt: string;
  };
}

export interface VideoCallStatus {
  canJoin: boolean;
  appointmentStatus: AppointmentStatus;
  meetingUrl?: string;
  scheduledAt?: string;
  minutesUntilStart?: number;
  isEarly?: boolean;
  isLate?: boolean;
  participantsInCall?: string[];
  message?: string;
}

export interface VideoCallJoinResponse {
  token: string;
  url: string;
  appointment?: {
    data?: Appointment;
  };
}

// =========================
// End of file
// =========================

