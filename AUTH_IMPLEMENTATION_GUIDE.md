# Authentication Implementation Guide

This guide provides step-by-step instructions for implementing the wallet signature-based authentication system.

## Overview

The authentication system uses Sui wallet signatures to verify user identity without passwords. The flow is:

1. User connects wallet → Frontend gets wallet address
2. Frontend requests challenge (nonce) from backend
3. User signs challenge message with wallet
4. Frontend sends signature to backend for verification
5. Backend validates signature and creates session
6. Session stored in HTTP-only cookie for security

## Step 1: Create AuthContext

Create `src/contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit';
import { authService, userService } from '../services/api';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signMessage } = useSignPersonalMessage();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await userService.getProfile();
        setUser(profile);
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Auto-logout if wallet disconnects
  useEffect(() => {
    if (!currentAccount && user) {
      setUser(null);
    }
  }, [currentAccount, user]);

  const login = async () => {
    if (!currentAccount) {
      throw new Error('No wallet connected');
    }

    setIsLoading(true);
    try {
      // Step 1: Get challenge from backend
      const { nonce, message } = await authService.generateChallenge(
        currentAccount.address
      );

      // Step 2: Sign message with wallet
      const { signature } = await signMessage({
        message: new TextEncoder().encode(message),
      });

      // Step 3: Verify signature with backend
      await authService.verifySignature(
        currentAccount.address,
        signature,
        nonce
      );

      // Step 4: Fetch user profile
      const profile = await userService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await userService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## Step 2: Wrap App with AuthProvider

Update `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { AuthProvider } from './contexts/AuthContext'; // Add this
import '@mysten/dapp-kit/dist/index.css';

const { networkConfig } = createNetworkConfig({
  devnet: { url: 'https://fullnode.devnet.sui.io:443' },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="devnet">
        <WalletProvider>
          <AuthProvider> {/* Add this wrapper */}
            <App />
          </AuthProvider> {/* Add this wrapper */}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
```

## Step 3: Update Header with Auth UI

Update `src/components/Header.tsx`:

```typescript
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const currentAccount = useCurrentAccount();
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } catch (error) {
      alert('登入失敗，請重試');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold">
              🔗 BlueLink
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="hover:text-blue-200 transition-colors">
                首頁
              </Link>
              <Link to="/create" className="hover:text-blue-200 transition-colors">
                發行債券
              </Link>
              <Link to="/dashboard" className="hover:text-blue-200 transition-colors">
                我的儀表板
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Wallet Connection */}
            <ConnectButton />
            
            {/* Authentication Status */}
            {currentAccount && (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      👤 {user?.name || user?.wallet_address.substring(0, 6) + '...'}
                    </span>
                    <button
                      onClick={logout}
                      className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                    >
                      登出
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLogin}
                    disabled={isLoggingIn || isLoading}
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded disabled:opacity-50"
                  >
                    {isLoggingIn ? '登入中...' : '🔐 簽名登入'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

## Step 4: Create Protected Route Component

Create `src/components/ProtectedRoute.tsx`:

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const currentAccount = useCurrentAccount();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className="max-w-2xl mx-auto mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-yellow-800 mb-4">需要連接錢包</h2>
        <p className="text-yellow-700">請先連接您的 Sui 錢包以訪問此頁面。</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto mt-8 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">需要登入</h2>
        <p className="text-blue-700 mb-4">請點擊右上角的「簽名登入」按鈕進行身份驗證。</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

## Step 5: Protect Routes in App

Update `src/App.tsx`:

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute'; // Add this
import HomePage from './pages/HomePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CreateProjectPage from './pages/CreateProjectPage';
import DashboardPage from './pages/DashboardPage';
import '@mysten/dapp-kit/dist/index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/project/:id" element={<ProjectDetailPage />} />
            
            {/* Protected routes */}
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateProjectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
```

## Step 6: Create Profile Page (Optional)

Create `src/pages/ProfilePage.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import { User } from '../types';

const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [fullProfile, setFullProfile] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    institution_name: '',
    timezone: 'Asia/Taipei',
    language: 'zh-TW',
  });

  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        const profile = await userService.getFullProfile();
        setFullProfile(profile);
        setFormData({
          name: profile.name || '',
          institution_name: profile.institution_name || '',
          timezone: profile.timezone || 'Asia/Taipei',
          language: profile.language || 'zh-TW',
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchFullProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.updateProfile(formData);
      await refreshProfile();
      setIsEditing(false);
      alert('個人資料更新成功！');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('更新失敗，請重試');
    }
  };

  if (!fullProfile) {
    return <div>載入中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">個人資料</h1>
        
        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">錢包地址</label>
              <p className="font-mono text-sm">{fullProfile.wallet_address}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">角色</label>
              <p className="font-semibold">
                {fullProfile.role === 'issuer' ? '發行者' : 
                 fullProfile.role === 'buyer' ? '投資者' : '管理員'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">姓名</label>
              <p>{fullProfile.name || '未設置'}</p>
            </div>
            {fullProfile.role === 'issuer' && (
              <div>
                <label className="text-sm text-gray-600">機構名稱</label>
                <p>{fullProfile.institution_name || '未設置'}</p>
              </div>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              編輯資料
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">姓名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            {fullProfile.role === 'issuer' && (
              <div>
                <label className="block text-sm font-medium mb-1">機構名稱</label>
                <input
                  type="text"
                  value={formData.institution_name}
                  onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            )}
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
```

## Testing the Authentication Flow

1. **Start Backend**: Make sure BlueLink-Backend is running on `localhost:8080`
2. **Start Frontend**: Run `npm run dev`
3. **Test Flow**:
   - Click "Connect Wallet" to connect Sui wallet
   - Click "簽名登入" (Sign to Login) button
   - Approve the signature request in wallet
   - You should be logged in and see your profile
   - Try accessing protected routes (Create Bond, Dashboard)
   - Try logging out

## Troubleshooting

### "No wallet connected"
- Install Sui Wallet browser extension
- Make sure wallet is unlocked
- Try refreshing the page

### "Login failed"
- Check Backend is running and accessible
- Check browser console for detailed errors
- Verify API_BASE_URL in services/api.ts
- Make sure Backend database is set up

### CORS errors
- Backend must allow credentials: `Access-Control-Allow-Credentials: true`
- Backend must allow your origin: `Access-Control-Allow-Origin: http://localhost:5173`
- Check Backend CORS middleware configuration

### Session not persisting
- Check that cookies are being set (DevTools → Application → Cookies)
- Verify `withCredentials: true` in axios config
- Make sure Backend sets `HttpOnly` and `SameSite` cookie attributes correctly

## Next Steps

After authentication is working:
1. Add session management page (view all active sessions)
2. Implement "Logout All Devices" functionality
3. Add profile editing
4. Show authentication status in more places
5. Handle session expiration gracefully
6. Add "Remember Me" functionality (if needed)

## Security Notes

- **Never expose private keys**: Only signatures are sent to backend
- **HttpOnly cookies**: Backend should use HttpOnly cookies for session IDs
- **HTTPS in production**: Always use HTTPS in production
- **CSRF protection**: Backend should implement CSRF tokens
- **Rate limiting**: Backend should rate limit auth endpoints
