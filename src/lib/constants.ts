// API Base URL - cấu hình theo môi trường
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// AI API URL - Flask AI service
export const AI_API_URL =
  import.meta.env.VITE_AI_API_URL || "http://localhost:5000";

// Socket URL - for real-time updates
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

// Auth
export const TOKEN_KEY = "auth_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const USER_KEY = "user_info";

// Schedule Types
export const ScheduleType = {
  REGULAR: "REGULAR",
  FLEXIBLE: "FLEXIBLE",
  TIME_OFF: "TIME_OFF",
} as const;
export type ScheduleType = (typeof ScheduleType)[keyof typeof ScheduleType];

// Appointment Types
export const AppointmentType = {
  IN_CLINIC: "IN_CLINIC",
  VIDEO: "VIDEO",
} as const;
export type AppointmentType =
  (typeof AppointmentType)[keyof typeof AppointmentType];

// Appointment Status - MUST match BE AppointmentStatusEnum exactly
export const AppointmentStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CHECKED_IN: "CHECKED_IN",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  RESCHEDULED: "RESCHEDULED",
  NO_SHOW: "NO_SHOW",
} as const;
export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const AppointmentSubType = {
  INSTANT: "INSTANT", // Khám ngay
  SCHEDULED: "SCHEDULED", // Đặt lịch
  RE_EXAM: "RE_EXAM", // Tái khám
} as const;
export type AppointmentSubType =
  (typeof AppointmentSubType)[keyof typeof AppointmentSubType];

export const AppointmentSource = {
  INTERNAL: "INTERNAL", // Nội bộ - Bệnh nhân đến trực tiếp cơ sở y tế
  EXTERNAL: "EXTERNAL", // Bên ngoài - Bệnh nhân đặt lịch qua website/app
} as const;
export type AppointmentSource =
  (typeof AppointmentSource)[keyof typeof AppointmentSource];

// User Roles
export const UserRole = {
  PATIENT: "PATIENT",
  DOCTOR: "DOCTOR",
  ADMIN: "ADMIN",
  RECEPTIONIST: "RECEPTIONIST",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Days of Week
export const DAYS_OF_WEEK = [
  { value: 0, label: "Chủ Nhật" },
  { value: 1, label: "Thứ Hai" },
  { value: 2, label: "Thứ Ba" },
  { value: 3, label: "Thứ Tư" },
  { value: 4, label: "Thứ Năm" },
  { value: 5, label: "Thứ Sáu" },
  { value: 6, label: "Thứ Bảy" },
];

// Schedule Type Labels
export const SCHEDULE_TYPE_LABELS = {
  [ScheduleType.REGULAR]: "Lịch Cố Định",
  [ScheduleType.FLEXIBLE]: "Lịch Linh Hoạt",
  [ScheduleType.TIME_OFF]: "Lịch Nghỉ",
};

// Appointment Type Labels
export const APPOINTMENT_TYPE_LABELS = {
  [AppointmentType.IN_CLINIC]: "Khám Tại Phòng",
  [AppointmentType.VIDEO]: "Tư Vấn Online",
};

// Appointment Status Labels
export const APPOINTMENT_STATUS_LABELS = {
  [AppointmentStatus.PENDING_PAYMENT]: "Chờ thanh toán",
  [AppointmentStatus.PENDING]: "Chờ xác nhận",
  [AppointmentStatus.CONFIRMED]: "Đã xác nhận",
  [AppointmentStatus.CHECKED_IN]: "Đã check-in",
  [AppointmentStatus.IN_PROGRESS]: "Đang khám",
  [AppointmentStatus.COMPLETED]: "Hoàn thành",
  [AppointmentStatus.CANCELLED]: "Đã hủy",
  [AppointmentStatus.RESCHEDULED]: "Đã đổi lịch",
  [AppointmentStatus.NO_SHOW]: "Vắng mặt",
};

// Role-based Permissions
export const PERMISSIONS = {
  CREATE_APPOINTMENT: [UserRole.PATIENT, UserRole.ADMIN],
  CHECK_IN: [UserRole.DOCTOR, UserRole.ADMIN, UserRole.RECEPTIONIST],
  START_EXAM: [UserRole.DOCTOR, UserRole.ADMIN],
  COMPLETE_EXAM: [UserRole.DOCTOR, UserRole.ADMIN],
  VIDEO_CHECK_IN: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN],
  VIDEO_JOIN: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN],
  VIEW_MEDICAL_RECORD: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN],
  EDIT_MEDICAL_RECORD: [UserRole.DOCTOR, UserRole.ADMIN],
  CREATE_VITAL_SIGNS: [UserRole.DOCTOR, UserRole.ADMIN],
  CREATE_PRESCRIPTION: [UserRole.DOCTOR, UserRole.ADMIN],
  MANAGE_MEDICINES: [UserRole.DOCTOR, UserRole.ADMIN],
} as const;

// Permission check helper type
export type PermissionKey = keyof typeof PERMISSIONS;

// ============================================
// Queue Lane Mapping (for Doctor Dashboard)
// ============================================

// Queue lane type for 3-column view
export type QueueLane = "WAITING" | "IN_PROGRESS" | "COMPLETED";

// Statuses shown in WAITING lane
export const WAITING_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.CHECKED_IN,
];

// Statuses shown in IN_PROGRESS lane
export const IN_PROGRESS_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.IN_PROGRESS,
];

// Statuses shown in COMPLETED lane
export const COMPLETED_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.COMPLETED,
];

// Map backend status to UI lane
export const STATUS_TO_LANE: Record<AppointmentStatus, QueueLane | null> = {
  [AppointmentStatus.PENDING_PAYMENT]: null,
  [AppointmentStatus.PENDING]: null,
  [AppointmentStatus.CONFIRMED]: "WAITING",
  [AppointmentStatus.CHECKED_IN]: "WAITING",
  [AppointmentStatus.IN_PROGRESS]: "IN_PROGRESS",
  [AppointmentStatus.COMPLETED]: "COMPLETED",
  [AppointmentStatus.CANCELLED]: null,
  [AppointmentStatus.RESCHEDULED]: null,
  [AppointmentStatus.NO_SHOW]: null,
};

// Status that allows "BẮT ĐẦU KHÁM" for IN_CLINIC appointments
// BE: POST /appointments/:id/start-examination requires CHECKED_IN status
export const CAN_START_EXAM_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.CHECKED_IN,
];

// Status that allows "VÀO VIDEO" for VIDEO appointments
export const CAN_JOIN_VIDEO_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.CHECKED_IN,
];

// Status that shows "MỞ BỆNH ÁN" and "HOÀN TẤT" buttons
export const CAN_MANAGE_EXAM_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.IN_PROGRESS,
];

// Completed status (for lock indicator and readonly mode)
export const IS_COMPLETED_STATUS: AppointmentStatus[] = [
  AppointmentStatus.COMPLETED,
];

// Check-in Time Thresholds (must match backend appointment.constants.ts)
export const CHECKIN_TIME_THRESHOLDS = {
  IN_CLINIC: {
    EARLY_MINUTES: 30,
    LATE_MINUTES: 15,
  },
  VIDEO: {
    EARLY_MINUTES: 60,
    LATE_MINUTES: 30,
  },
} as const;
