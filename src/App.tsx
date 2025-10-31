import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CreateProjectPage from './pages/CreateProjectPage';
import DashboardPage from './pages/DashboardPage';
import BondMarketplacePage from './pages/BondMarketplacePage';
import InvestorPortfolioPage from './pages/InvestorPortfolioPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/ToastProvider';
import { getUserProfile } from './lib/api';

import '@mysten/dapp-kit/dist/index.css';

/**
 * Session verification component
 * Validates session on app startup
 */
function SessionValidator() {
  const navigate = useNavigate();

  useEffect(() => {
    const validateSession = async () => {
      const userJson = localStorage.getItem('user');
      
      if (!userJson) {
        // No user data, skip validation
        return;
      }

      try {
        // Verify session is still valid by calling a protected endpoint
        await getUserProfile();
        console.log('Session is valid');
      } catch (error) {
        console.warn('Session validation failed, clearing user data');
        // Session invalid or expired, clear localStorage
        localStorage.removeItem('user');
        navigate('/login');
      }
    };

    validateSession();
  }, [navigate]);

  return null;
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <SessionValidator />
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
              <Route path="/bonds" element={
                <ProtectedRoute>
                  <BondMarketplacePage />
                </ProtectedRoute>
              } />
              <Route path="/portfolio" element={
                <ProtectedRoute>
                  <InvestorPortfolioPage />
                </ProtectedRoute>
              } />
              <Route path="/project/:id" element={
                <ProtectedRoute>
                  <ProjectDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/create" element={
                <ProtectedRoute>
                  <CreateProjectPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
