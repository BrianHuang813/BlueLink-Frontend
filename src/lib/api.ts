/**
 * BlueLink Backend API Service
 * All requests use cookie-based authentication (HttpOnly session cookie)
 */

import { Bond, AuthChallenge, UserProfile, ApiResponse } from '../types';
import { Config } from './config';

// 從集中配置讀取 API 基礎 URL
const API_BASE_URL = Config.API_BASE_URL || 'http://localhost:8080/api/v1';
const USE_MOCK_DATA = Config.USE_MOCK;

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
  try {
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

    // Check if response is not ok (4xx or 5xx)
    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`;
      
      // Try to parse error response as JSON
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          // If not JSON, try to get text
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
      }
      
      throw new Error(errorMessage);
    }

    // Parse successful response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Expected JSON response from server');
    }

    const data = await response.json();
    
    // Check if response follows ApiResponse<T> format
    if (typeof data === 'object' && 'success' in data) {
      const apiResponse = data as ApiResponse<T>;
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || apiResponse.error || 'API request failed');
      }
      return apiResponse.data as T;
    }
    
    // Otherwise, assume the response is the data itself
    return data as T;
  } catch (error) {
    // Handle network errors or other fetch failures
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到伺服器，請檢查網路連接');
    }
    throw error;
  }
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
