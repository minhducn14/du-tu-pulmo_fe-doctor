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
      <Toaster position="top-center" richColors />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route path="/doctor" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/doctor/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="schedules" element={<SchedulePage />} />
            <Route path="time-slots" element={<TimeSlotsPage />} />
            <Route path="*" element={<div>Not found</div>} />
          </Route>

          {/* Redirect root to doctor or login */}
          <Route path="/" element={<Navigate to="/doctor" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
