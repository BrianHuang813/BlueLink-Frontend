import { QueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: Error | AxiosError) => {
        const status = (error as AxiosError)?.response?.status;
        if (status === 401 || status === 403 || status === 422) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
    mutations: {
      retry: 0,
    },
  },
});
