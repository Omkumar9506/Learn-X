import { apiClient } from '../lib/api-client';

export const progressService = {
  async markLectureComplete(courseId: string, lectureId: string): Promise<{ completed: boolean }> {
    try {
      await apiClient.post(`/progress/lecture/${lectureId}/complete`, { courseId });
    } catch {
      // Local fallback
    }

    if (typeof window !== 'undefined') {
      const key = `learnx_completed_lectures_${courseId}`;
      const saved = localStorage.getItem(key);
      const list: string[] = saved ? JSON.parse(saved) : [];
      if (!list.includes(lectureId)) {
        list.push(lectureId);
        localStorage.setItem(key, JSON.stringify(list));
      }
    }

    return { completed: true };
  },

  async unmarkLectureComplete(courseId: string, lectureId: string): Promise<void> {
    if (typeof window !== 'undefined') {
      const key = `learnx_completed_lectures_${courseId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const list: string[] = JSON.parse(saved);
        const filtered = list.filter((id) => id !== lectureId);
        localStorage.setItem(key, JSON.stringify(filtered));
      }
    }
  },

  getCompletedLectures(courseId: string): string[] {
    if (typeof window !== 'undefined') {
      const key = `learnx_completed_lectures_${courseId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return [];
  },
};
