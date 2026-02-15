import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Lazy Load Components
const DashboardLayout = lazy(() => import('@/components/layout/DashboardLayout').then(module => ({ default: module.DashboardLayout })));
const OverviewPage = lazy(() => import('@/pages/OverviewPage').then(module => ({ default: module.OverviewPage })));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SchedulePage = lazy(() => import('@/pages/schedule/SchedulePage').then(module => ({ default: module.SchedulePage })));
const TimeSlotsPage = lazy(() => import('@/pages/schedule/TimeSlotsPage').then(module => ({ default: module.TimeSlotsPage })));

// New Pages
const ReceptionPage = lazy(() => import('@/pages/reception/ReceptionPage'));
const QueueManagerPage = lazy(() => import('@/pages/doctor/QueueManagerPage'));
const InClinicExamPage = lazy(() => import('@/pages/doctor/encounters/InClinicExamPage'));
const VideoExamPage = lazy(() => import('@/pages/doctor/encounters/VideoExamPage'));
const TodaySchedulePage = lazy(() => import('@/pages/reception/TodaySchedulePage'));
const VideoWaitingPage = lazy(() => import('@/pages/consultation/VideoWaitingPage'));
const ChatPage = lazy(() => import('@/pages/consultation/ChatPage'));
const VideoHistoryPage = lazy(() => import('@/pages/consultation/VideoHistoryPage'));
const AppointmentListPage = lazy(() => import('@/pages/appointment/AppointmentListPage'));
const MedicalRecordPage = lazy(() => import('@/pages/records/MedicalRecordPage'));
const PatientListPage = lazy(() => import('@/pages/records/PatientListPage'));
const PrescriptionPage = lazy(() => import('@/pages/records/PrescriptionPage'));
const AiXrayPage = lazy(() => import('@/pages/clinical/AiXrayPage'));
const MedicinePage = lazy(() => import('@/pages/treatment/MedicinePage'));
const ProtocolPage = lazy(() => import('@/pages/treatment/ProtocolPage'));
const ReportPage = lazy(() => import('@/pages/reports/ReportPage'));
const BillingPage = lazy(() => import('@/pages/reports/BillingPage'));
const HelpPage = lazy(() => import('@/pages/help/HelpPage'));
const AboutPage = lazy(() => import('@/pages/help/AboutPage'));

// Detail Pages
const PatientDetailPage = lazy(() => import('@/pages/records/PatientDetailPage'));
const AppointmentDetailPage = lazy(() => import('@/pages/appointment/AppointmentDetailPage'));
const MedicalRecordDetailPage = lazy(() => import('@/pages/records/MedicalRecordDetailPage'));
const PrescriptionDetailPage = lazy(() => import('@/pages/records/PrescriptionDetailPage'));

// Auth & Settings
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ProfilePage = lazy(() => import('@/pages/settings/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage'));

// Error Pages
const NotFoundPage = lazy(() => import('@/pages/error/NotFoundPage'));
const ForbiddenPage = lazy(() => import('@/pages/error/ForbiddenPage'));

// Loading Fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-full bg-gray-50">
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm text-gray-500 font-medium">Đang tải...</span>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        visibleToasts={5}
        closeButton
        duration={3000}
      />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/404" element={<NotFoundPage />} />

          {/* Protected Routes */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['DOCTOR', 'RECEPTIONIST']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/doctor/overview" replace />} />

            {/* Dashboard */}
            <Route path="overview" element={<OverviewPage />} />

            {/* Phòng Khám - Reception Only */}
            <Route path="reception" element={
              <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <ReceptionPage />
              </ProtectedRoute>
            } />
            {/* <Route path="queue" element={...} /> removed */}
            <Route path="queue-manager" element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <QueueManagerPage />
              </ProtectedRoute>
            } />
            <Route path="today" element={<TodaySchedulePage />} />

            {/* Tư Vấn Trực Tuyến */}
            <Route path="video-waiting" element={<VideoWaitingPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="video-history" element={<VideoHistoryPage />} />

            {/* Đặt Khám */}
            <Route path="appointments" element={<AppointmentListPage />} />
            <Route path="appointments/:id" element={<AppointmentDetailPage />} />
            <Route path="schedules" element={<SchedulePage />} />
            <Route path="time-slots" element={<TimeSlotsPage />} />

            {/* Hồ Sơ */}
            <Route path="medical-records" element={<MedicalRecordPage />} />
            <Route path="medical-records/:id" element={<MedicalRecordDetailPage />} />
            <Route path="patients" element={<PatientListPage />} />
            <Route path="patients/:id" element={<PatientDetailPage />} />
            <Route path="prescriptions" element={<PrescriptionPage />} />
            <Route path="prescriptions/:id" element={<PrescriptionDetailPage />} />

            {/* Cận Lâm Sàng */}
            <Route path="ai-xray" element={<AiXrayPage />} />

            {/* In-Clinic Encounter - ADDED */}
            <Route path="encounters/:appointmentId/in-clinic" element={<InClinicExamPage />} />
            <Route path="encounters/:appointmentId/video" element={<VideoExamPage />} />

            {/* Thuốc & Điều Trị */}
            <Route path="medicine" element={<MedicinePage />} />
            <Route path="protocols" element={<ProtocolPage />} />

            {/* Báo Cáo */}
            <Route path="reports" element={<ReportPage />} />
            <Route path="billing" element={<BillingPage />} />

            {/* Thông Tin */}
            <Route path="help" element={<HelpPage />} />
            <Route path="about" element={<AboutPage />} />


            {/* Settings */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />

            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>

          {/* Catch all for non-nested routes */}
          <Route path="*" element={<Navigate to="/404" replace />} />

          {/* Redirect root to doctor or login */}
          <Route path="/" element={<Navigate to="/doctor" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
