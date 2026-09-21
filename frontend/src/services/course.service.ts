import { apiClient } from '../lib/api-client';
import { Course, Category, CourseLevel } from '../types';

export interface CourseFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Normalizes backend TypeORM course payload to the frontend Course interface,
 * safeguarding against string decimals, mismatched property names, and null relations.
 */
export function normalizeCourse(raw: any): Course {
  if (!raw) return raw;

  const rawPrice = Number(raw.price) || 0;
  const rawDiscount =
    raw.discountPrice !== undefined && raw.discountPrice !== null
      ? Number(raw.discountPrice)
      : undefined;

  const calcDuration =
    raw.totalDuration ||
    raw.sections?.reduce(
      (acc: number, s: any) =>
        acc + (s.lectures?.reduce((lAcc: number, l: any) => lAcc + (Number(l.duration) || 0), 0) || 0),
      0,
    ) ||
    7200;

  const calcLectureCount =
    raw.lectureCount ||
    raw.sections?.reduce((acc: number, s: any) => acc + (s.lectures?.length || 0), 0) ||
    0;

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    subtitle: raw.subtitle || raw.shortDescription || '',
    description: raw.description || '',
    thumbnailUrl:
      raw.thumbnailUrl ||
      raw.thumbnail ||
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    promoVideoUrl: raw.promoVideoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
    price: rawPrice,
    discountPrice: rawDiscount,
    level: (raw.level as CourseLevel) || 'all_levels',
    status: raw.status || 'published',
    language: raw.language || 'English',
    requirements: Array.isArray(raw.requirements) ? raw.requirements : [],
    learningOutcomes: Array.isArray(raw.learningOutcomes) ? raw.learningOutcomes : [],
    targetAudience: Array.isArray(raw.targetAudience) ? raw.targetAudience : [],
    categoryId: raw.categoryId || raw.category?.id || '',
    category: raw.category
      ? {
          id: raw.category.id,
          name: raw.category.name,
          slug: raw.category.slug,
          description: raw.category.description,
          icon: raw.category.icon,
          courseCount: raw.category.courseCount ?? 0,
        }
      : undefined,
    instructorId: raw.instructorId || raw.instructor?.id || '',
    instructor: raw.instructor
      ? {
          id: raw.instructor.id,
          headline: raw.instructor.headline || '',
          biography: raw.instructor.bio || raw.instructor.biography || '',
          user: {
            id: raw.instructor.user?.id || raw.instructor.userId || '',
            name: raw.instructor.user?.name || 'LearnX Instructor',
            avatar:
              raw.instructor.user?.avatar ||
              raw.instructor.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          },
        }
      : undefined,
    sections: Array.isArray(raw.sections)
      ? raw.sections.map((s: any) => ({
          id: s.id,
          courseId: s.courseId || raw.id,
          title: s.title,
          order: s.order || 1,
          lectures: Array.isArray(s.lectures)
            ? s.lectures.map((l: any) => ({
                id: l.id,
                sectionId: l.sectionId || s.id,
                title: l.title,
                description: l.content || l.description || '',
                videoUrl: l.videoUrl || '',
                duration: Number(l.duration) || 0,
                order: l.order || 1,
                isPreview: Boolean(l.isFreePreview ?? l.isPreview),
                resources: Array.isArray(l.resources) ? l.resources : [],
              }))
            : [],
        }))
      : [],
    averageRating: Number(raw.averageRating) || 0,
    totalRatings: Number(raw.reviewCount ?? raw.totalRatings ?? 0),
    totalEnrollments: Number(raw.enrollmentCount ?? raw.totalEnrollments ?? 0),
    totalDuration: calcDuration,
    lectureCount: calcLectureCount,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

// Deprecated empty arrays kept for backward-compatibility with other modules
export const MOCK_CATEGORIES: Category[] = [];
export const MOCK_COURSES: Course[] = [];

export const courseService = {
  async getCourses(params: CourseFilterParams = {}): Promise<PaginatedResponse<Course>> {
    const queryParams: Record<string, any> = {};

    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.category && params.category !== 'all') queryParams.category = params.category;
    if (params.level && params.level !== 'all') queryParams.level = params.level;
    if (params.search?.trim()) queryParams.search = params.search.trim();
    if (params.sort) queryParams.sort = params.sort;
    if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice;
    if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;

    try {
      const response = await apiClient.get<PaginatedResponse<any>>('/courses', {
        params: queryParams,
      });

      const rawCourses = response.data?.data || [];
      const meta = response.data?.meta || {
        total: rawCourses.length,
        page: 1,
        limit: 12,
        totalPages: 1,
      };

      return {
        data: rawCourses.map(normalizeCourse),
        meta,
      };
    } catch (error) {
      console.error('Failed to load courses from API:', error);
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
        },
      };
    }
  },

  async getCourseBySlug(slug: string): Promise<Course> {
    const response = await apiClient.get<any>(`/courses/${slug}`);
    return normalizeCourse(response.data);
  },

  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<Category[]>('/categories/with-count');
      if (Array.isArray(response.data)) {
        return response.data;
      }
    } catch {
      try {
        const fallbackRes = await apiClient.get<Category[]>('/categories');
        if (Array.isArray(fallbackRes.data)) {
          return fallbackRes.data;
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    return [];
  },

  async getFeaturedCourses(limit: number = 4): Promise<Course[]> {
    try {
      const response = await apiClient.get<any[]>('/courses/featured', {
        params: { limit },
      });
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map(normalizeCourse);
      }
    } catch {
      // If featured endpoint has no items, fallback to newest published
      const res = await this.getCourses({ limit, sort: 'newest' });
      return res.data;
    }
    return [];
  },

  getFeaturedInstructors(): FeaturedInstructor[] {
    return [];
  },
};

export interface FeaturedInstructor {
  name: string;
  headline: string;
  avatar: string;
  students: string;
  rating: number;
  coursesCount: number;
}

