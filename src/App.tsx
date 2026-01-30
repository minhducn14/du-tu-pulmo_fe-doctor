import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OverviewPage } from '@/pages/OverviewPage';
import LoginPage from '@/pages/auth/LoginPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
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
          <Route path="*" element={<div>Not found</div>} />
        </Route>

        {/* Redirect root to doctor or login */}
        <Route path="/" element={<Navigate to="/doctor" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
