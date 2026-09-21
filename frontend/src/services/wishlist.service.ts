import { apiClient } from '../lib/api-client';
import { Course } from '../types';
import { normalizeCourse } from './course.service';

export const wishlistService = {
  async getWishlist(): Promise<Course[]> {
    try {
      const response = await apiClient.get<any[]>('/wishlist');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data
          .map((item) => (item.course ? normalizeCourse(item.course) : normalizeCourse(item)))
          .filter((c) => Boolean(c && c.id));
      }
    } catch {
      // Fallback
    }

    return [];
  },

  async addToWishlist(courseId: string): Promise<void> {
    try {
      await apiClient.post(`/wishlist/${courseId}`);
    } catch {
      // ignore
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('learnx_wishlist');
      const list: string[] = saved ? JSON.parse(saved) : [];
      if (!list.includes(courseId)) {
        list.push(courseId);
        localStorage.setItem('learnx_wishlist', JSON.stringify(list));
      }
    }
  },

  async removeFromWishlist(courseId: string): Promise<void> {
    try {
      await apiClient.delete(`/wishlist/${courseId}`);
    } catch {
      // ignore
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('learnx_wishlist');
      if (saved) {
        const list: string[] = JSON.parse(saved);
        const filtered = list.filter((id) => id !== courseId);
        localStorage.setItem('learnx_wishlist', JSON.stringify(filtered));
      }
    }
  },

  isInWishlist(courseId: string): boolean {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('learnx_wishlist');
      if (saved) {
        try {
          const list: string[] = JSON.parse(saved);
          return list.includes(courseId);
        } catch {
          // ignore
        }
      }
    }
    return false;
  },
};

