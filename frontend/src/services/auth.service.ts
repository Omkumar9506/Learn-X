import { apiClient } from '../lib/api-client';
import { AuthResponse, User } from '../types';
import { LoginFormData, RegisterFormData, ProfileUpdateFormData } from '../schemas/auth.schema';

export const authService = {
  async register(data: Omit<RegisterFormData, 'confirmPassword'>): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/users/profile');
    return response.data;
  },

  async updateProfile(data: ProfileUpdateFormData): Promise<User> {
    const response = await apiClient.patch<User>('/users/profile', data);
    return response.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>('/users/change-password', data);
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  async verifyOtp(email: string, otp: string): Promise<{ message: string; valid: boolean }> {
    const response = await apiClient.post<{ message: string; valid: boolean }>('/auth/verify-otp', { email, otp });
    return response.data;
  },

  async resetPassword(data: { email: string; otp: string; newPassword: string }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },
};
