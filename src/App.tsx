import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { GlobalChatbot } from './components/GlobalChatbot';
import { AuthProvider, useAuth } from './context/AuthContext';

const LandingPage = React.lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const ResumePage = React.lazy(() => import('./pages/ResumePage').then(module => ({ default: module.ResumePage })));
const InterviewPage = React.lazy(() => import('./pages/InterviewPage').then(module => ({ default: module.InterviewPage })));
const ResultsPage = React.lazy(() => import('./pages/ResultsPage').then(module => ({ default: module.ResultsPage })));
const AuthPage = React.lazy(() => import('./pages/AuthPage').then(module => ({ default: module.AuthPage })));
const DemoPage = React.lazy(() => import('./pages/DemoPage').then(module => ({ default: module.DemoPage })));
const SkillsPage = React.lazy(() => import('./pages/SkillsPage').then(module => ({ default: module.SkillsPage })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const CareersPage = React.lazy(() => import('./pages/CareersPage').then(module => ({ default: module.CareersPage })));
const ConfidenceSupportPage = React.lazy(() => import('./pages/ConfidenceSupportPage').then(module => ({ default: module.ConfidenceSupportPage })));
const CareerMapPage = React.lazy(() => import('./pages/CareerMapPage').then(module => ({ default: module.CareerMapPage })));
const CalendarPage = React.lazy(() => import('./pages/CalendarPage').then(module => ({ default: module.CalendarPage })));
import { ThemeProvider } from './context/ThemeContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isDemoPage = location.pathname === '/demo';
  const isProfilePage = location.pathname === '/profile';

  const hideSidebar = isLandingPage || isAuthPage || isDemoPage;

  return (
    <div className="flex min-h-screen bg-warm-bg dark:bg-stone-950 text-warm-text dark:text-stone-100">
      {!hideSidebar && <Sidebar />}
      <div className={`flex flex-col flex-1 ${!hideSidebar ? 'ml-64' : ''}`}>
        {!hideSidebar && <Header />}
        <main className="flex-1">
          <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center text-warm-hint">Loading page...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/careermap" element={<ProtectedRoute><CareerMapPage /></ProtectedRoute>} />
            <Route path="/resume" element={<ProtectedRoute><ResumePage /></ProtectedRoute>} />
            <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
            <Route path="/skills" element={<ProtectedRoute><SkillsPage /></ProtectedRoute>} />
            <Route path="/careers" element={<ProtectedRoute><CareersPage /></ProtectedRoute>} />
            <Route path="/confidence" element={<ProtectedRoute><ConfidenceSupportPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          </React.Suspense>
        </main>
      </div>
      <GlobalChatbot />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
