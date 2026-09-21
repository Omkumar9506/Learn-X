import { apiClient } from '../lib/api-client';
import { Course, User } from '../types';

export interface AdminDashboardStats {
  totalUsers: number;
  totalInstructors: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  totalReviews: number;
}

export interface AdminOrder {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    thumbnailUrl?: string;
  };
}

export const MOCK_ADMIN_STATS: AdminDashboardStats = {
  totalUsers: 0,
  totalInstructors: 0,
  totalCourses: 0,
  publishedCourses: 0,
  totalEnrollments: 0,
  totalRevenue: 0,
  totalReviews: 0,
};

export const MOCK_ADMIN_USERS: User[] = [];
export const MOCK_ADMIN_ORDERS: AdminOrder[] = [];

export const adminService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const response = await apiClient.get<AdminDashboardStats>('/admin/dashboard');
      if (response.data) return response.data;
    } catch {
      // Fallback to zeroed stats
    }
    return MOCK_ADMIN_STATS;
  },

  async getUsers(page = 1, limit = 10): Promise<{ data: User[]; total: number }> {
    try {
      const response = await apiClient.get<any>(`/admin/users?page=${page}&limit=${limit}`);
      if (response.data && response.data.data) {
        return { data: response.data.data, total: response.data.meta?.total || response.data.data.length };
      }
    } catch {
      // Fallback
    }
    return { data: [], total: 0 };
  },

  async getCourses(page = 1, limit = 10): Promise<{ data: Course[]; total: number }> {
    try {
      const response = await apiClient.get<any>(`/admin/courses?page=${page}&limit=${limit}`);
      if (response.data && response.data.data) {
        return { data: response.data.data, total: response.data.meta?.total || response.data.data.length };
      }
    } catch {
      // Fallback
    }
    return { data: [], total: 0 };
  },

  async getOrders(page = 1, limit = 10): Promise<{ data: AdminOrder[]; total: number }> {
    try {
      const response = await apiClient.get<any>(`/admin/orders?page=${page}&limit=${limit}`);
      if (response.data && response.data.data) {
        return { data: response.data.data, total: response.data.meta?.total || response.data.data.length };
      }
    } catch {
      // Fallback
    }
    return { data: [], total: 0 };
  },

  async updateCourseStatus(courseId: string, status: string): Promise<Course> {
    const response = await apiClient.patch<Course>(`/admin/courses/${courseId}/status`, { status });
    return response.data;
  },

  async updateUserRole(userId: string, role: string): Promise<User> {
    const response = await apiClient.patch<User>(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<User> {
    const response = await apiClient.patch<User>(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  async getInstructors(page = 1, limit = 50): Promise<{ data: AdminInstructor[]; total: number }> {
    try {
      const response = await apiClient.get<any>(`/admin/instructors?page=${page}&limit=${limit}`);
      if (response.data && response.data.data) {
        return { data: response.data.data, total: response.data.meta?.total || response.data.data.length };
      }
    } catch {
      // Fallback
    }
    return { data: [], total: 0 };
  },

  async updateInstructorApproval(instructorId: string, isApproved: boolean): Promise<AdminInstructor> {
    const response = await apiClient.patch<AdminInstructor>(`/admin/instructors/${instructorId}/approve`, {
      isApproved,
    });
    return response.data;
  },
};

export interface AdminInstructor {
  id: string;
  userId: string;
  headline?: string;
  bio?: string;
  expertise?: string[];
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  isApproved: boolean;
  createdAt: string;
  user: User;
}

