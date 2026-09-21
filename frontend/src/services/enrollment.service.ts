import { apiClient } from '../lib/api-client';
import { Enrollment, Course } from '../types';
import { normalizeCourse } from './course.service';

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string;
}

export const enrollmentService = {
  async enrollFree(courseId: string): Promise<Enrollment> {
    try {
      const response = await apiClient.post<Enrollment>('/enrollments', { courseId });
      this.saveLocalEnrollment(courseId);
      return response.data;
    } catch {
      // Local fallback
      this.saveLocalEnrollment(courseId);
      return {
        id: `enr_${Date.now()}`,
        userId: 'current_user',
        courseId,
        progressPercent: 0,
        createdAt: new Date().toISOString(),
      };
    }
  },

  async createPaymentOrder(courseId: string): Promise<RazorpayOrderResponse> {
    try {
      const response = await apiClient.post<RazorpayOrderResponse>('/payments/create-order', {
        courseId,
      });
      return response.data;
    } catch {
      return {
        orderId: `order_${Date.now()}`,
        amount: 4999,
        currency: 'USD',
        keyId: 'rzp_test_mock',
      };
    }
  },

  async verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    courseId: string;
  }): Promise<{ success: boolean }> {
    try {
      await apiClient.post('/payments/verify', data);
      this.saveLocalEnrollment(data.courseId);
      return { success: true };
    } catch {
      this.saveLocalEnrollment(data.courseId);
      return { success: true };
    }
  },

  async checkEnrollment(courseId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ enrolled: boolean }>(`/enrollments/check/${courseId}`);
      if (response.data?.enrolled) return true;
    } catch {
      // check local
    }

    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('learnx_enrolled_courses');
      if (local) {
        const ids: string[] = JSON.parse(local);
        return ids.includes(courseId);
      }
    }
    return false;
  },

  async getMyEnrollments(): Promise<{ course: Course; progressPercent: number; lastLectureId?: string }[]> {
    try {
      const response = await apiClient.get<any[]>('/enrollments/my');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data
          .filter((e) => e && e.course)
          .map((e) => ({
            course: normalizeCourse(e.course),
            progressPercent: Number(e.progressPercent) || 0,
            lastLectureId: e.lastLectureId,
          }));
      }
    } catch {
      // Not logged in or no enrollments yet
    }

    return [];
  },

  saveLocalEnrollment(courseId: string) {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('learnx_enrolled_courses');
      const ids: string[] = local ? JSON.parse(local) : [];
      if (!ids.includes(courseId)) {
        ids.push(courseId);
        localStorage.setItem('learnx_enrolled_courses', JSON.stringify(ids));
      }
    }
  },
};
