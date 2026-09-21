import { apiClient } from '../lib/api-client';
import { Section, Lecture } from '../types';

export const courseContentService = {
  async getCourseContent(courseId: string): Promise<Section[]> {
    try {
      const response = await apiClient.get<Section[]>(`/courses/${courseId}/content`);
      if (response.data && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    // Check localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`learnx_content_${courseId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }


    // Default template sections
    return [
      {
        id: `sec_${Date.now()}_1`,
        courseId,
        title: 'Section 1: Course Overview & Architecture Setup',
        order: 1,
        lectures: [
          {
            id: `lec_${Date.now()}_1`,
            sectionId: `sec_${Date.now()}_1`,
            title: 'Welcome to the Masterclass & Environment Setup',
            duration: 720,
            order: 1,
            isPreview: true,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            resources: [{ name: 'Starter Repo & Docker Setup.zip', url: '#' }],
          },
          {
            id: `lec_${Date.now()}_2`,
            sectionId: `sec_${Date.now()}_1`,
            title: 'Architectural Blueprint & High-Level System Design',
            duration: 1140,
            order: 2,
            isPreview: false,
          },
        ],
      },
    ];
  },

  async saveCourseContentToStorage(courseId: string, sections: Section[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`learnx_content_${courseId}`, JSON.stringify(sections));
    }
  },

  async createSection(courseId: string, title: string): Promise<Section> {
    try {
      const response = await apiClient.post<Section>(`/courses/${courseId}/content/sections`, {
        title,
      });
      return response.data;
    } catch {
      return {
        id: `sec_${Date.now()}`,
        courseId,
        title,
        order: 99,
        lectures: [],
      };
    }
  },

  async updateSection(courseId: string, sectionId: string, title: string): Promise<void> {
    try {
      await apiClient.patch(`/courses/${courseId}/content/sections/${sectionId}`, { title });
    } catch {
      // Handled in frontend state
    }
  },

  async deleteSection(courseId: string, sectionId: string): Promise<void> {
    try {
      await apiClient.delete(`/courses/${courseId}/content/sections/${sectionId}`);
    } catch {
      // Handled in frontend state
    }
  },

  async createLecture(
    courseId: string,
    sectionId: string,
    data: Partial<Lecture>,
  ): Promise<Lecture> {
    try {
      const response = await apiClient.post<Lecture>(
        `/courses/${courseId}/content/sections/${sectionId}/lectures`,
        data,
      );
      return response.data;
    } catch {
      return {
        id: `lec_${Date.now()}`,
        sectionId,
        title: data.title || 'Untitled Lecture',
        description: data.description,
        videoUrl: data.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: data.duration || 600,
        order: 99,
        isPreview: !!data.isPreview,
        resources: data.resources || [],
      };
    }
  },

  async updateLecture(
    courseId: string,
    lectureId: string,
    data: Partial<Lecture>,
  ): Promise<void> {
    try {
      await apiClient.patch(`/courses/${courseId}/content/lectures/${lectureId}`, data);
    } catch {
      // Handled in frontend state
    }
  },

  async deleteLecture(courseId: string, lectureId: string): Promise<void> {
    try {
      await apiClient.delete(`/courses/${courseId}/content/lectures/${lectureId}`);
    } catch {
      // Handled in frontend state
    }
  },

  async reorderSections(courseId: string, sectionIds: string[]): Promise<void> {
    try {
      await apiClient.patch(`/courses/${courseId}/content/sections/reorder`, { sectionIds });
    } catch {
      // Handled in frontend state
    }
  },

  async reorderLectures(courseId: string, sectionId: string, lectureIds: string[]): Promise<void> {
    try {
      await apiClient.patch(`/courses/${courseId}/content/sections/${sectionId}/lectures/reorder`, {
        lectureIds,
      });
    } catch {
      // Handled in frontend state
    }
  },
};
