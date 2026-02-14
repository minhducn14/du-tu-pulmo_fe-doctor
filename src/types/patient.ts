export interface PatientUser {
    id: string;
    fullName: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    avatarUrl?: string;
    email?: string;
    status?: string;
}

export interface PatientResponse {
    id: string;
    userId: string;
    profileCode?: string;
    bloodType?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    insuranceProvider?: string;
    insuranceNumber?: string;
    insuranceExpiry?: string;
    createdAt: string;
    updatedAt: string;
    user?: PatientUser;
}

export interface PaginationMeta {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedPatient {
    items: PatientResponse[];
    meta: PaginationMeta;
}

export interface PatientProfile {
    patient: PatientResponse;
    summary: {
        totalMedicalRecords: number;
        totalVitalSigns: number;
        totalPrescriptions: number;
        latestVitalSign: any;
    };
}

export interface PatientQuery {
    page?: number;
    limit?: number;
    search?: string;
    bloodType?: string;
}
