import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Lazy load pages for optimization
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TambahLaporanPage = lazy(() => import('./pages/TambahLaporanPage'));
const DetailLaporanPage = lazy(() => import('./pages/DetailLaporanPage'));
const ManageUsersPage = lazy(() => import('./pages/ManageUsersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const HelpDirectoryPage = lazy(() => import('./pages/HelpDirectoryPage'));

const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-muted)',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <div className="spinner" style={{
      width: '40px',
      height: '40px',
      border: '4px solid var(--border)',
      borderTop: '4px solid var(--primary)',
      borderRadius: '50%'
    }} />
    <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>Memuat Halaman...</span>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/dashboard" element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
            <Route path="/laporan/baru" element={<PrivateRoute roles={['user']}><Layout><TambahLaporanPage /></Layout></PrivateRoute>} />
            <Route path="/laporan/:id" element={<PrivateRoute><Layout><DetailLaporanPage /></Layout></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute roles={['super_admin']}><Layout><ManageUsersPage /></Layout></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />
            <Route path="/bantuan" element={<PrivateRoute><Layout><HelpDirectoryPage /></Layout></PrivateRoute>} />
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
export default App;
