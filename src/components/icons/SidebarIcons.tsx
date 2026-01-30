import React from 'react';

interface IconProps {
    className?: string;
}

// Dashboard/Overview Icon - Blue
export const DashboardIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" fill="#3B82F6" stroke="#2563EB" />
        <rect x="14" y="3" width="7" height="7" rx="1" fill="#60A5FA" stroke="#3B82F6" />
        <rect x="3" y="14" width="7" height="7" rx="1" fill="#60A5FA" stroke="#3B82F6" />
        <rect x="14" y="14" width="7" height="7" rx="1" fill="#93C5FD" stroke="#60A5FA" />
    </svg>
);

// Reception/Check-in Icon - Green
export const ReceptionIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="#10B981" />
        <circle cx="9" cy="7" r="4" fill="#D1FAE5" stroke="#10B981" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="#10B981" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#10B981" />
        <path d="M19 8l2 2-2 2" stroke="#059669" strokeWidth="2.5" />
    </svg>
);

// Queue Icon - Orange
export const QueueIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#F97316" />
        <circle cx="9" cy="7" r="4" fill="#FED7AA" stroke="#F97316" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#FB923C" />
        <circle cx="16" cy="4" r="3" fill="#FFEDD5" stroke="#FB923C" />
    </svg>
);

// Stethoscope/Examination Icon - Teal
export const StethoscopeIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" stroke="#14B8A6" />
        <path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4" stroke="#14B8A6" />
        <circle cx="20" cy="10" r="2" fill="#5EEAD4" stroke="#14B8A6" />
    </svg>
);

// Calendar Today Icon - Indigo
export const CalendarTodayIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="#E0E7FF" stroke="#6366F1" />
        <line x1="16" y1="2" x2="16" y2="6" stroke="#6366F1" />
        <line x1="8" y1="2" x2="8" y2="6" stroke="#6366F1" />
        <line x1="3" y1="10" x2="21" y2="10" stroke="#6366F1" />
        <circle cx="12" cy="15" r="2" fill="#6366F1" />
    </svg>
);

// Video Call Icon - Purple
export const VideoCallIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="5" width="15" height="14" rx="2" fill="#EDE9FE" stroke="#8B5CF6" />
        <polygon points="23 7 16 12 23 17 23 7" fill="#A78BFA" stroke="#8B5CF6" />
    </svg>
);

// Chat/Message Icon - Pink
export const ChatIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="#FCE7F3" stroke="#EC4899" />
        <line x1="8" y1="9" x2="16" y2="9" stroke="#EC4899" />
        <line x1="8" y1="13" x2="14" y2="13" stroke="#F472B6" />
    </svg>
);

// History Icon - Slate
export const HistoryIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v5h5" stroke="#64748B" />
        <circle cx="12" cy="12" r="9" fill="#F1F5F9" stroke="#64748B" />
        <path d="M12 7v5l4 2" stroke="#475569" />
    </svg>
);

// Calendar/Appointment Icon - Blue
export const CalendarIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="#DBEAFE" stroke="#3B82F6" />
        <line x1="16" y1="2" x2="16" y2="6" stroke="#3B82F6" />
        <line x1="8" y1="2" x2="8" y2="6" stroke="#3B82F6" />
        <line x1="3" y1="10" x2="21" y2="10" stroke="#3B82F6" />
    </svg>
);

// Schedule/Work Schedule Icon - Cyan
export const ScheduleIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="#CFFAFE" stroke="#06B6D4" />
        <line x1="16" y1="2" x2="16" y2="6" stroke="#06B6D4" />
        <line x1="8" y1="2" x2="8" y2="6" stroke="#06B6D4" />
        <line x1="3" y1="10" x2="21" y2="10" stroke="#06B6D4" />
        <circle cx="8" cy="14" r="1" fill="#06B6D4" />
        <circle cx="12" cy="14" r="1" fill="#06B6D4" />
        <circle cx="16" cy="14" r="1" fill="#06B6D4" />
        <circle cx="8" cy="18" r="1" fill="#22D3EE" />
        <circle cx="12" cy="18" r="1" fill="#22D3EE" />
    </svg>
);

// Clock/Time Slot Icon - Amber
export const TimeSlotIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" fill="#FEF3C7" stroke="#F59E0B" />
        <polyline points="12 6 12 12 16 14" stroke="#D97706" strokeWidth="2.5" />
    </svg>
);

// Medical Record Icon - Emerald
export const MedicalRecordIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#D1FAE5" stroke="#10B981" />
        <polyline points="14 2 14 8 20 8" fill="#A7F3D0" stroke="#10B981" />
        <line x1="12" y1="11" x2="12" y2="17" stroke="#059669" strokeWidth="2.5" />
        <line x1="9" y1="14" x2="15" y2="14" stroke="#059669" strokeWidth="2.5" />
    </svg>
);

// Patient Icon - Sky
export const PatientIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#0EA5E9" />
        <circle cx="12" cy="7" r="4" fill="#BAE6FD" stroke="#0EA5E9" />
    </svg>
);

// Prescription/Pill Icon - Rose
export const PrescriptionIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" fill="#FECDD3" stroke="#F43F5E" />
        <path d="m8.5 8.5 7 7" stroke="#BE123C" strokeWidth="2" />
    </svg>
);

// X-Ray/Imaging Icon - Violet
export const XRayIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#DDD6FE" stroke="#8B5CF6" />
        <ellipse cx="12" cy="10" rx="4" ry="5" fill="#C4B5FD" stroke="#7C3AED" />
        <path d="M12 15v4" stroke="#7C3AED" strokeWidth="2" />
        <path d="M8 17h8" stroke="#7C3AED" strokeWidth="2" />
    </svg>
);

// AI Brain Icon (for AI X-Ray) - Purple Gradient
export const AIBrainIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs>
            <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
        </defs>
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" fill="#F3E8FF" stroke="url(#brainGradient)" strokeWidth="2" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" fill="#EDE9FE" stroke="url(#brainGradient)" strokeWidth="2" />
        <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" stroke="#7C3AED" strokeWidth="2" />
        <circle cx="9" cy="9" r="1" fill="#A855F7" />
        <circle cx="15" cy="9" r="1" fill="#A855F7" />
    </svg>
);

// Lung Icon (for Pulmonary) - Blue Medical
export const LungIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <defs>
            <linearGradient id="lungGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
        </defs>
        <path d="M6.081 20C2.5 20 2 16.5 2 14c0-3.5 2-8 4-10" fill="#DBEAFE" stroke="url(#lungGradient)" />
        <path d="M17.92 20c3.58 0 4.08-3.5 4.08-6 0-3.5-2-8-4-10" fill="#DBEAFE" stroke="url(#lungGradient)" />
        <path d="M12 4v8" stroke="#1D4ED8" strokeWidth="2.5" />
        <path d="M12 12c-2 0-4 1-6 6" stroke="#3B82F6" />
        <path d="M12 12c2 0 4 1 6 6" stroke="#3B82F6" />
    </svg>
);

// Lab Test/Test Tube Icon - Lime
export const LabTestIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2v6.5L19 15a5 5 0 1 1-7.79 6.14L4.5 8.5V2" fill="#ECFCCB" stroke="#84CC16" />
        <path d="M4.5 2h10" stroke="#84CC16" />
        <path d="M4.5 8.5h10" stroke="#65A30D" />
        <circle cx="12" cy="16" r="2" fill="#84CC16" />
    </svg>
);

// Screening/Clipboard Check Icon - Green
export const ScreeningIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#DCFCE7" stroke="#22C55E" />
        <path d="m9 12 2 2 4-4" stroke="#16A34A" strokeWidth="2.5" />
    </svg>
);

// Medicine Cabinet Icon - Red
export const MedicineCabinetIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="#FEE2E2" stroke="#EF4444" />
        <path d="M6 8v8" stroke="#EF4444" />
        <path d="M12 8v8" stroke="#EF4444" />
        <path d="M18 8v8" stroke="#EF4444" />
        <line x1="2" y1="12" x2="22" y2="12" stroke="#DC2626" strokeWidth="2" />
    </svg>
);

// Protocol/Book Icon - Indigo
export const ProtocolIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" fill="#E0E7FF" stroke="#6366F1" />
        <path d="M8 7h6" stroke="#4F46E5" strokeWidth="2" />
        <path d="M8 11h8" stroke="#818CF8" strokeWidth="2" />
    </svg>
);

// News Icon - Orange
export const NewsIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" fill="#FFEDD5" stroke="#F97316" />
        <path d="M10 6h8" stroke="#EA580C" strokeWidth="2" />
        <path d="M10 10h8" stroke="#FB923C" />
        <path d="M10 14h4" stroke="#FDBA74" />
    </svg>
);

// Community Icon - Teal
export const CommunityIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 21a8 8 0 0 0-16 0" stroke="#14B8A6" />
        <circle cx="10" cy="8" r="5" fill="#CCFBF1" stroke="#14B8A6" />
        <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" stroke="#2DD4BF" />
    </svg>
);

// Report/Chart Icon - Blue
export const ReportIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#DBEAFE" stroke="#3B82F6" opacity="0.3" />
        <line x1="6" y1="20" x2="6" y2="16" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
        <line x1="12" y1="20" x2="12" y2="10" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
        <line x1="18" y1="20" x2="18" y2="4" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
    </svg>
);

// Billing/Receipt Icon - Green
export const BillingIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" fill="#DCFCE7" stroke="#22C55E" />
        <path d="M8 7h8" stroke="#16A34A" strokeWidth="2" />
        <path d="M8 11h8" stroke="#4ADE80" />
        <path d="M8 15h5" stroke="#86EFAC" />
    </svg>
);

// Profile Icon - Sky
export const ProfileIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="5" fill="#BAE6FD" stroke="#0EA5E9" />
        <path d="M20 21a8 8 0 1 0-16 0" fill="#E0F2FE" stroke="#0EA5E9" />
    </svg>
);

// Bell/Notification Icon - Amber
export const BellIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill="#FEF3C7" stroke="#F59E0B" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" stroke="#D97706" strokeWidth="2" />
    </svg>
);

// Star/Rating Icon - Yellow
export const StarIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#FEF08A" stroke="#EAB308" />
    </svg>
);

// Settings/Gear Icon - Slate
export const SettingsIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" fill="#F1F5F9" stroke="#64748B" />
        <circle cx="12" cy="12" r="3" fill="#CBD5E1" stroke="#475569" />
    </svg>
);

// Help Icon - Blue
export const HelpIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" fill="#DBEAFE" stroke="#3B82F6" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="#2563EB" strokeWidth="2" />
        <circle cx="12" cy="17" r="1" fill="#2563EB" />
    </svg>
);

// Info Icon - Cyan
export const InfoIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" fill="#CFFAFE" stroke="#06B6D4" />
        <path d="M12 16v-4" stroke="#0891B2" strokeWidth="2.5" />
        <circle cx="12" cy="8" r="1" fill="#0891B2" />
    </svg>
);

// Logout Icon - Red
export const LogoutIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#EF4444" />
        <polyline points="16 17 21 12 16 7" stroke="#EF4444" />
        <line x1="21" y1="12" x2="9" y2="12" stroke="#EF4444" strokeWidth="2.5" />
    </svg>
);

// Chevron Down Icon - Gray
export const ChevronDownIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

// Chevron Right Icon - Gray
export const ChevronRightIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
);

// Folder Icon - Amber
export const FolderIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" fill="#FEF3C7" stroke="#F59E0B" />
    </svg>
);

// Clipboard List Icon - Teal
export const ClipboardListIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" fill="#99F6E4" stroke="#14B8A6" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" fill="#CCFBF1" stroke="#14B8A6" />
        <path d="M12 11h4" stroke="#0D9488" strokeWidth="2" />
        <path d="M12 16h4" stroke="#0D9488" strokeWidth="2" />
        <circle cx="8" cy="11" r="1" fill="#14B8A6" />
        <circle cx="8" cy="16" r="1" fill="#14B8A6" />
    </svg>
);

// Pill Icon - Pink
export const PillIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" fill="#FBCFE8" stroke="#EC4899" />
        <path d="m8.5 8.5 7 7" stroke="#BE185D" strokeWidth="2" />
    </svg>
);
