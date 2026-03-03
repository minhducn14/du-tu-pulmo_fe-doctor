export type ReportType = 'doctor' | 'appointment' | 'system';
export type ReportStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';

export interface CreateReportDto {
  doctorId?: string;
  appointmentId?: string;
  reportType?: ReportType;
  content: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  doctorId?: string;
  appointmentId?: string;
  reportType: ReportType;
  content: string;
  status: ReportStatus;
  adminNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}
