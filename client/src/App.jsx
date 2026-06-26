import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Agentation } from 'agentation';
import useAuth from './hooks/useAuth';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ProfilePage from './pages/ProfilePage';
import ApplicationsPage from './pages/ApplicationsPage';
import InternshipDetailPage from './pages/InternshipDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import OnboardingPage from './pages/OnboardingPage';
import ResumePage from './pages/ResumePage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

// Role-aware dashboard redirect
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

const App = () => {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Guest Auth Shell */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Onboarding - Standalone Protected Route */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Secure Dashboard Shell */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/internships/:id" element={<InternshipDetailPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/" element={<DashboardRedirect />} />
          </Route>

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      {process.env.NODE_ENV === 'development' && <Agentation />}
    </QueryClientProvider>
  );
};

export default App;
