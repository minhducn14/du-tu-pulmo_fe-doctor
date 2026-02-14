export type DashboardPeriod = 'today' | '7days' | '30days';

export interface RevenueStats {
  total: number;
  visitCount: number;
  prescriptions: number;
  labTests: number;
}

export interface AppointmentTypeStats {
  inClinic: number;
  video: number;
}

export interface PatientStats {
  total: number;
  new: number;
  returning: number;
}

export interface DailyBreakdown {
  date: string;
  visits: number;
  newPatients: number;
  returningPatients: number;
}

export interface PeriodComparison {
  previousPeriod: {
    revenue: number;
    visitCount: number;
    inClinic: number;
    video: number;
    totalPatients: number;
  };
  percentChange: {
    revenue: number;
    visitCount: number;
    inClinic: number;
    video: number;
    totalPatients: number;
  };
}

export interface DashboardStats {
  period: {
    start: string;
    end: string;
    type: DashboardPeriod;
  };
  revenue: RevenueStats;
  appointments: AppointmentTypeStats;
  patients: PatientStats;
  dailyBreakdown: DailyBreakdown[];
  comparison: PeriodComparison;
}
