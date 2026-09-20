import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import CandidateLayout from './components/CandidateLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin / HR Pages
import DashboardPage from './pages/DashboardPage';
import CreateJobPage from './pages/CreateJobPage';
import RankResumesPage from './pages/RankResumesPage';
import ManageJobsPage from './pages/ManageJobsPage';
import CandidateManagementPage from './pages/CandidateManagementPage';
import TrackApplicationsPage from './pages/TrackApplicationsPage';

// Candidate Portal Pages
import WelcomePage from './pages/candidate/WelcomePage';
import AvailableJobsPage from './pages/candidate/AvailableJobsPage';
import ApplyJobsPage from './pages/candidate/ApplyJobsPage';
import CreateProfilePage from './pages/candidate/CreateProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Admin / HR Routes with Persistent Sidebar */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="create-job" element={<CreateJobPage />} />
            <Route path="manage-jobs" element={<ManageJobsPage />} />
            <Route path="manage-candidates" element={<CandidateManagementPage />} />
            <Route path="rank" element={<RankResumesPage />} />
            <Route path="track-applications" element={<TrackApplicationsPage />} />
          </Route>

          {/* Protected Candidate Routes with Persistent Sidebar */}
          <Route 
            path="/candidate" 
            element={
              <ProtectedRoute>
                <CandidateLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="welcome" replace />} />
            <Route path="welcome" element={<WelcomePage />} />
            <Route path="jobs" element={<AvailableJobsPage />} />
            <Route path="apply" element={<ApplyJobsPage />} />
            <Route path="profile" element={<CreateProfilePage />} />
          </Route>

          {/* Backward compatibility redirects */}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/create-job" element={<Navigate to="/admin/create-job" replace />} />
          <Route path="/manage-jobs" element={<Navigate to="/admin/manage-jobs" replace />} />
          <Route path="/manage-candidates" element={<Navigate to="/admin/manage-candidates" replace />} />
          <Route path="/rank" element={<Navigate to="/admin/rank" replace />} />
          <Route path="/track-applications" element={<Navigate to="/admin/track-applications" replace />} />
          <Route path="/candidate-dashboard" element={<Navigate to="/candidate/welcome" replace />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}