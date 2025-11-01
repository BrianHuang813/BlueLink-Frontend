import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserProfile } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('buyer' | 'issuer' | 'admin')[];
}

/**
 * Protected Route Component
 * Checks if user is logged in and has the required role
 * Redirects to login page if not authenticated
 * Redirects to home page if user doesn't have required role
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const userJson = localStorage.getItem('user');
  
  if (!userJson) {
    // No user data in localStorage, redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const user: UserProfile = JSON.parse(userJson);
    if (!user.wallet_address) {
      // Invalid user data
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }

    // Check role if allowedRoles is specified
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // User doesn't have required role, show error message
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-red-800 mb-2">
                沒有訪問權限
              </h2>
              <p className="text-red-700 mb-4">
                您的帳戶角色不允許訪問此頁面
              </p>
              <p className="text-sm text-red-600 mb-4">
                當前角色: <span className="font-semibold">{user.role === 'buyer' ? '購買者' : user.role === 'issuer' ? '發行者' : '管理員'}</span>
              </p>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                返回上一頁
              </button>
            </div>
          </div>
        );
      }
    }
  } catch (error) {
    // Corrupted user data
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // User is authenticated and has required role
  return <>{children}</>;
};

export default ProtectedRoute;
