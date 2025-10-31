import axios, { AxiosError } from 'axios';
import { Config } from '../lib/config';

export const http = axios.create({
  baseURL: Config.API_BASE_URL,
  withCredentials: true,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

http.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error?.response?.status;
    if (status === 401) {
      window.dispatchEvent(new CustomEvent('bluelink:unauthorized'));
    }
    return Promise.reject(error);
  },
);
