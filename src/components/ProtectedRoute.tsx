import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected Route Component
 * Checks if user is logged in by verifying localStorage
 * Redirects to login page if not authenticated
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const userJson = localStorage.getItem('user');
  
  if (!userJson) {
    // No user data in localStorage, redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userJson);
    if (!user.wallet_address) {
      // Invalid user data
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    // Corrupted user data
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // User is authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
