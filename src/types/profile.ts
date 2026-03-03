export interface UserMe {
  id: string;
  fullName?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  doctor?: {
    id: string;
  } | null;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  fullName?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  title?: string;
  position?: string;
  specialty?: string;
}

export interface UpdateUserProfileDto {
  fullName?: string;
  phone?: string;
}

export interface UpdateDoctorProfileDto {
  title?: string;
  position?: string;
  specialty?: string;
  fullName?: string;
  phone?: string;
}

export interface ProfileFormValues {
  fullName: string;
  email: string;
  phone: string;
}
