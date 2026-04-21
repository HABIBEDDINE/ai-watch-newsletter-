import { Routes, Route, Navigate } from "react-router-dom";
import { ArticleProvider } from "./context/ArticleContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import HomePage from "./pages/HomePage";
import Explore from "./pages/Explore";
import DataPreview from "./pages/DataPreview";
import Reports from "./pages/Reports";
import Newsletter from "./pages/Newsletter";
import ArticleDetail from "./pages/ArticleDetail";
import Trends from "./pages/Trends";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ProfilePage from "./pages/ProfilePage";
import SavedPage from "./pages/SavedPage";
import DxcNewsletterPage from "./pages/DxcNewsletterPage";
import DxcNewsletterDetail from "./pages/DxcNewsletterDetail";
import NewsletterDashboardC from "./pages/NewsletterDashboardC";
// Kept for reference but no longer routed:
// import NewsletterDashboardA from "./pages/NewsletterDashboardA";
// import NewsletterDashboardB from "./pages/NewsletterDashboardB";
// import NewsletterShowcase from "./pages/NewsletterShowcase";

export default function AIWatchDXC() {
  return (
    <ThemeProvider>
    <AuthProvider>
    <ArticleProvider>
    <Routes>
      {/* ── Public routes (no layout) ── */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* ── Dashboard routes (with sidebar + navbar) ── */}
      <Route path="/feed" element={<DashboardLayout><Explore /></DashboardLayout>} />
      <Route path="/article/:id" element={<DashboardLayout><ArticleDetail /></DashboardLayout>} />
      <Route path="/trends" element={<ProtectedRoute><DashboardLayout><Trends /></DashboardLayout></ProtectedRoute>} />

      {/* DXC Newsletter — consolidated to /newsletter-dashboard-c */}
      <Route path="/newsletter-dashboard-c" element={<ProtectedRoute><DashboardLayout><NewsletterDashboardC /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dxc-newsletter" element={<ProtectedRoute><DashboardLayout><DxcNewsletterPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dxc-newsletter/:id" element={<ProtectedRoute><DashboardLayout><DxcNewsletterDetail /></DashboardLayout></ProtectedRoute>} />

      {/* Redirects for old newsletter routes */}
      <Route path="/newsletter-showcase" element={<Navigate to="/newsletter-dashboard-c" replace />} />
      <Route path="/newsletter-dashboard-a" element={<Navigate to="/newsletter-dashboard-c" replace />} />
      <Route path="/newsletter-dashboard-b" element={<Navigate to="/newsletter-dashboard-c" replace />} />

      <Route path="/newsletter" element={<ProtectedRoute><DashboardLayout><Newsletter /></DashboardLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><DashboardLayout><Reports /></DashboardLayout></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><DashboardLayout><SavedPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><DashboardLayout><ProfilePage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/data" element={<ProtectedRoute><DashboardLayout><DataPreview /></DashboardLayout></ProtectedRoute>} />
    </Routes>
    </ArticleProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}
