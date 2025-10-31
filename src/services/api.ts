import axios from 'axios';
import { Project, DonationReceipt } from '../types';
import { Config } from '../lib/config';

// 從集中配置讀取 API 基礎 URL
const API_BASE_URL = Config.API_BASE_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 重要：允許發送 cookies
});

// 設定 401 攔截器
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Session 過期或未登入，清除 localStorage 並導向登入頁
      console.warn('401 Unauthorized - redirecting to login');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const projectService = {
  getAllProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },

  getProject: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  getDonationHistory: async (address: string): Promise<DonationReceipt[]> => {
    const response = await api.get(`/donors/${address}`);
    return response.data;
  },
};

export default api;
