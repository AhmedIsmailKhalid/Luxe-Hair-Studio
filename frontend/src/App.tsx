import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PublicLayout } from '@/components/common/PublicLayout';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { LoginPage } from '@/pages/admin/LoginPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { BookingsPage } from '@/pages/admin/BookingsPage';
import { ServicesPage } from '@/pages/admin/ServicesPage';
import { StaffPage } from '@/pages/admin/StaffPage';
import { HomePage } from '@/pages/public/HomePage';
import { ServicesPage as PublicServicesPage } from '@/pages/public/ServicesPage';
import { TeamPage } from '@/pages/public/TeamPage';
import { BookingPage } from '@/pages/public/BookingPage';
import { AboutPage } from '@/pages/public/AboutPage';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ScrollToTop } from '@/components/common/ScrollToTop';

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <>
    <ScrollToTop />
    <Routes>
      {/* Public routes */}
      <Route element={
        <ErrorBoundary>
          <PublicLayout />
        </ErrorBoundary>
      }>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<PublicServicesPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      {/* Admin login — public */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Admin routes — protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={
          <ErrorBoundary>
            <AdminLayout />
          </ErrorBoundary>
        }>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/bookings" element={<BookingsPage />} />
          <Route path="/admin/services" element={<ServicesPage />} />
          <Route path="/admin/staff" element={<StaffPage />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App;