import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { logout } from '../lib/api';
import { UserProfile } from '../types';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentAccount = useCurrentAccount();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check login status on mount and when account changes
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('user');
      }
    } else {
      setUser(null);
    }
  }, [currentAccount]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call backend logout API to clear session
      await logout();
      console.log('Session cleared on backend');
    } catch (error) {
      console.error('Logout API failed:', error);
      // Continue with client-side logout even if API fails
    } finally {
      // Clear localStorage
      localStorage.removeItem('user');
      setUser(null);
      setIsLoggingOut(false);
      
      // Redirect to login page
      navigate('/login');
    }
  };

  const isLoginPage = location.pathname === '/login';

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold">
              BlueLink
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link 
                to="/" 
                className="hover:text-blue-200 transition-colors"
              >
                首頁
              </Link>
              
              {user && (
                <>
                  {/* 購買者看到債券市場 */}
                  {(user.role === 'buyer' || user.role === 'admin') && (
                    <Link 
                      to="/bonds" 
                      className="hover:text-blue-200 transition-colors"
                    >
                      債券市場
                    </Link>
                  )}
                  
                  {/* 發行者看到創建項目 */}
                  {(user.role === 'issuer' || user.role === 'admin') && (
                    <Link 
                      to="/create" 
                      className="hover:text-blue-200 transition-colors"
                    >
                      創建債券
                    </Link>
                  )}
                  
                  <Link 
                    to="/dashboard" 
                    className="hover:text-blue-200 transition-colors"
                  >
                    我的儀表板
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {!isLoginPage && <ConnectButton />}
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="hidden md:block text-sm">
                  <span className="opacity-75">已登入：</span>
                  <span className="font-mono ml-1">
                    {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 
                           disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors
                           font-semibold text-sm"
                >
                  {isLoggingOut ? '登出中...' : '登出'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
