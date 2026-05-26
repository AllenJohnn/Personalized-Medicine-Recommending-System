import { useEffect, useMemo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { setupLenis } from './animations/lenis';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import useAuth from './hooks/useAuth';
import AdminPage from './pages/AdminPage';
import BookmarksPage from './pages/BookmarksPage';
import ConditionsPage from './pages/ConditionsPage';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import MedicineDetailPage from './pages/MedicineDetailPage';
import ResultsPage from './pages/ResultsPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';

function RequireAuth({ children }) {
  const { accessToken } = useAuth();
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RequireAdmin({ children }) {
  const { accessToken, user } = useAuth();
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppShell() {
  const location = useLocation();

  useEffect(() => {
    const lenis = setupLenis();
    return () => {
      lenis?.destroy?.();
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden text-[15px] text-sand">
      <Navbar />
      <main className="relative pt-24">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/search"
            element={
              <RequireAuth>
                <SearchPage />
              </RequireAuth>
            }
          />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/medicine/:name" element={<MedicineDetailPage />} />
          <Route path="/conditions" element={<ConditionsPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <RequireAuth>
                <BookmarksPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toast visible={false} message="" />
    </div>
  );
}

export default function App() {
  return <AppShell />;
}
