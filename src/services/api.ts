import axios from 'axios';
import { Bond, BondToken, User, UserProfile } from '../types';

// Fallback to localhost if env var is not set
const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

// Auth Service
export const authService = {
  generateChallenge: async (walletAddress: string): Promise<{ nonce: string; message: string }> => {
    const response = await api.post('/auth/challenge', { wallet_address: walletAddress });
    return response.data.data;
  },

  verifySignature: async (walletAddress: string, signature: string, nonce: string): Promise<any> => {
    const response = await api.post('/auth/verify', {
      wallet_address: walletAddress,
      signature,
      nonce,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  logoutAll: async (): Promise<void> => {
    await api.post('/auth/logout-all');
  },
};

// Bond Service
export const bondService = {
  getAllBonds: async (): Promise<Bond[]> => {
    const response = await api.get('/bonds');
    return response.data.data || response.data;
  },

  getBond: async (id: string): Promise<Bond> => {
    const response = await api.get(`/bonds/${id}`);
    return response.data.data || response.data;
  },
};

// Bond Token Service
export const bondTokenService = {
  getBondToken: async (id: string): Promise<BondToken> => {
    const response = await api.get(`/bond-tokens/${id}`);
    return response.data.data || response.data;
  },

  getBondTokenByOnChainId: async (onChainId: string): Promise<BondToken> => {
    const response = await api.get(`/bond-tokens/on-chain/${onChainId}`);
    return response.data.data || response.data;
  },

  getBondTokensByOwner: async (owner: string, limit = 50, offset = 0): Promise<BondToken[]> => {
    const response = await api.get('/bond-tokens/owner', {
      params: { owner, limit, offset },
    });
    return response.data.data || response.data;
  },

  getBondTokensByProject: async (projectId: string, limit = 50, offset = 0): Promise<BondToken[]> => {
    const response = await api.get('/bond-tokens/project', {
      params: { project_id: projectId, limit, offset },
    });
    return response.data.data || response.data;
  },
};

// User Profile Service
export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/profile');
    return response.data.data || response.data;
  },

  getFullProfile: async (): Promise<User> => {
    const response = await api.get('/profile/full');
    return response.data.data || response.data;
  },

  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put('/profile', updates);
    return response.data.data || response.data;
  },
};

// Legacy aliases for backward compatibility
export const projectService = bondService;
export const donationService = bondTokenService;

export default api;
