export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  account: Account;
}

import { Role } from '@/constants/roles';

export interface User {
  id: string;
  fullName?: string;
  avatarUrl?: string;
  status?: string;
  doctorId?: string;
  patientId?: string;
  roles?: Role[];
  department?: string;
}

export interface Account {
  id: string;
  email: string;
  roles: string[];
  isVerified: boolean;
  user: User;
  createdAt: string;
  updatedAt: string;
}
