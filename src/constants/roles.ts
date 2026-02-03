export const Role = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
  SYSTEM: 'SYSTEM',
  RECEPTIONIST: 'RECEPTIONIST',
} as const;

export type Role = typeof Role[keyof typeof Role];
