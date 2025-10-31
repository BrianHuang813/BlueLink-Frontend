/**
 * BlueLink Backend API Service
 * All requests use cookie-based authentication (HttpOnly session cookie)
 */

import { Bond, AuthChallenge, UserProfile, ApiResponse } from '../types';

// 從環境變量讀取 API 基礎 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK === 'true';

// 開發環境顯示配置
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseUrl: API_BASE_URL,
    useMock: USE_MOCK_DATA,
    env: import.meta.env.MODE,
  });
}

/**
 * Generic API request wrapper
 * Automatically handles credentials and redirects on 401
 */
async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // Include cookies in request
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Auto redirect to login on unauthorized
  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data: ApiResponse<T> = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || data.error || 'API request failed');
  }

  return data.data as T;
}

// ==================== Public Endpoints ====================

/**
 * Health check
 */
export async function checkHealth(): Promise<{ status: string }> {
  return apiRequest('/health');
}

// ==================== Authentication ====================

/**
 * Get authentication challenge (nonce + message)
 */
export async function getAuthChallenge(
  walletAddress: string
): Promise<AuthChallenge> {
  return apiRequest('/auth/challenge', {
    method: 'POST',
    body: JSON.stringify({ wallet_address: walletAddress }),
  });
}

/**
 * Verify wallet signature and create session
 * @param role - Optional user role for first-time registration (buyer or issuer)
 */
export async function verifySignature(
  walletAddress: string,
  signature: string,
  nonce: string,
  role?: 'buyer' | 'issuer'
): Promise<{ session_id: string }> {
  const body: {
    wallet_address: string;
    signature: string;
    nonce: string;
    role?: string;
  } = {
    wallet_address: walletAddress,
    signature,
    nonce,
  };
  
  // 只在提供 role 時才加入請求體
  if (role) {
    body.role = role;
  }
  
  return apiRequest('/auth/verify', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Logout current session
 */
export async function logout(): Promise<void> {
  return apiRequest('/auth/logout', { method: 'POST' });
}

// ==================== User Profile ====================

/**
 * Get current user profile (requires authentication)
 */
export async function getUserProfile(): Promise<UserProfile> {
  return apiRequest('/profile');
}

// ==================== Bond Operations ====================

/**
 * Get all bonds from backend index
 */
export async function getAllBonds(): Promise<Bond[]> {
  return apiRequest('/bonds');
}

/**
 * Get specific bond by ID
 */
export async function getBondById(bondId: number): Promise<Bond> {
  return apiRequest(`/bonds/${bondId}`);
}

/**
 * Get bonds created by specific issuer
 */
export async function getBondsByIssuer(issuerAddress: string): Promise<Bond[]> {
  return apiRequest(`/bonds/issuer/${issuerAddress}`);
}

// ==================== Session Management ====================

export interface Session {
  id: string;
  wallet_address: string;
  created_at: string;
  expires_at: string;
  last_used: string;
}

/**
 * List all active sessions for current user
 */
export async function listSessions(): Promise<Session[]> {
  return apiRequest('/sessions');
}

/**
 * Revoke a specific session
 */
export async function revokeSession(sessionId: string): Promise<void> {
  return apiRequest(`/sessions/${sessionId}`, { method: 'DELETE' });
}

export default {
  checkHealth,
  getAuthChallenge,
  verifySignature,
  logout,
  getUserProfile,
  getAllBonds,
  getBondById,
  getBondsByIssuer,
  listSessions,
  revokeSession,
};
