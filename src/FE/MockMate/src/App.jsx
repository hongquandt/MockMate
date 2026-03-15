import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import VerifyOtpPage from './pages/VerifyOtpPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import UserProfilePage from './pages/UserProfilePage'
import DashboardPage from './pages/DashboardPage'
import InterviewPage from './pages/InterviewPage'
import HistoryPage from './pages/HistoryPage'
import CvHistoryPage from './pages/CvHistoryPage'
import VipUpgradePage from './pages/VipUpgradePage'
import InterviewSetupPage from './pages/InterviewSetupPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminJobsPage from './pages/admin/AdminJobsPage'
import AdminRevenuePage from './pages/admin/AdminRevenuePage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'

// Company Pages
import CompanyDashboardPage from './pages/company/CompanyDashboardPage'
import CompanyJobsPage from './pages/company/CompanyJobsPage'
import CompanyCandidatesPage from './pages/company/CompanyCandidatesPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/interview-setup" element={<InterviewSetupPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/cv-history" element={<CvHistoryPage />} />
        <Route path="/cv-history/:id" element={<CvHistoryPage />} />
        <Route path="/vip-upgrade" element={<VipUpgradePage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/jobs" element={<AdminJobsPage />} />
        <Route path="/admin/revenue" element={<AdminRevenuePage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />

        {/* Company Routes */}
        <Route path="/company" element={<CompanyDashboardPage />} />
        <Route path="/company/dashboard" element={<CompanyDashboardPage />} />
        <Route path="/company/jobs" element={<CompanyJobsPage />} />
        <Route path="/company/candidates" element={<CompanyCandidatesPage />} />
      </Routes>
    </Router>
  )
}

export default App
