import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('learnx_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string | string[]; error?: string; statusCode?: number }>) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Don't auto-redirect if already on auth pages
      const isAuthPage = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/signup');
      if (!isAuthPage) {
        localStorage.removeItem('learnx_token');
        localStorage.removeItem('learnx_user');
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.message) {
      if (Array.isArray(data.message)) {
        return data.message.join(', ');
      }
      return data.message;
    }
    return error.message || 'An unexpected error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
