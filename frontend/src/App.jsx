import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import { RoleBasedRoute, PublicOnlyRoute } from './routes/RoleBasedRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';

// Student Portal pages
import StudentDashboard from './pages/student/StudentDashboard';
import ExploreTests from './pages/student/ExploreTests';
import ExamHistory from './pages/student/ExamHistory';
import Performance from './pages/student/Performance';
import Profile from './pages/student/Profile';
import StudentSettings from './pages/student/StudentSettings';

// Admin Portal pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MockTestManagement from './pages/admin/MockTestManagement';
import QuestionManagement from './pages/admin/QuestionManagement';
import CertificationsManagement from './pages/admin/CertificationsManagement';
import StudentManagement from './pages/admin/StudentManagement';
import ExamAttempts from './pages/admin/ExamAttempts';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';

// Preserved Exam Interface Runner
import ExamRunner from './pages/ExamRunner';

import './App.css';

function RootRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Navigate
      to={role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
      replace
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root smart redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public-only authentication routes */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Protected Student Portal routes */}
          <Route element={<RoleBasedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/tests" element={<ExploreTests />} />
            <Route path="/student/history" element={<ExamHistory />} />
            <Route path="/student/performance" element={<Performance />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/student/settings" element={<StudentSettings />} />
          </Route>

          {/* Protected Admin Portal routes */}
          <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/mock-tests" element={<MockTestManagement />} />
            <Route path="/admin/questions" element={<QuestionManagement />} />
            <Route path="/admin/certifications" element={<CertificationsManagement />} />
            <Route path="/admin/students" element={<StudentManagement />} />
            <Route path="/admin/attempts" element={<ExamAttempts />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          {/* Protected Full-Screen Pearson VUE Exam Runner */}
          <Route element={<ProtectedRoute />}>
            <Route path="/exam" element={<ExamRunner />} />
            <Route path="/exam/:testId" element={<ExamRunner />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
