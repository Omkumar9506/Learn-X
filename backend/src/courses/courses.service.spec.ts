import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CoursesService } from './courses.service.js';
import { CourseStatus } from '../common/constants/enums.js';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('CoursesService', () => {
  let coursesService: CoursesService;
  let mockCourseModel: any;
  let mockInstructorModel: any;
  let mockCategoryModel: any;

  beforeEach(() => {
    mockCourseModel = {
      findOne: vi.fn(),
      create: vi.fn((data) => Promise.resolve({ id: 'c-123', ...data })),
      findById: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
    };

    mockInstructorModel = {
      findOne: vi.fn(),
    };

    mockCategoryModel = {
      findOne: vi.fn(),
    };

    coursesService = new CoursesService(mockCourseModel, mockInstructorModel, mockCategoryModel);
  });

  describe('create', () => {
    it('should create a draft course with generated slug and instructor relation', async () => {
      mockInstructorRepoResponse({ id: 'inst-456', userId: 'user-789' });

      const courseData = {
        title: 'High Performance PostgreSQL Mastery',
        price: 79.99,
      };

      const result = await coursesService.create('user-789', courseData);

      expect(mockInstructorModel.findOne).toHaveBeenCalled();
      expect(mockCourseModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'High Performance PostgreSQL Mastery',
          slug: expect.stringMatching(/^high-performance-postgresql-mastery/),
          instructorId: 'inst-456',
          status: CourseStatus.DRAFT,
        }),
      );
      expect(result.id).toBe('c-123');
    });

    it('should throw ForbiddenException if creator is not an onboarded instructor', async () => {
      mockInstructorModel.findOne.mockResolvedValue(null);

      await expect(
        coursesService.create('non-instructor-user', { title: 'Some Course' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findBySlug', () => {
    it('should return course by slug if found', async () => {
      const mockFound = {
        id: 'c-123',
        title: 'Next.js 15 & NestJS',
        slug: 'nextjs-15-nestjs',
        status: CourseStatus.PUBLISHED,
      };

      const populateChain = {
        populate: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(mockFound),
      };
      mockCourseModel.findOne.mockReturnValue(populateChain);

      const result = await coursesService.findBySlug('nextjs-15-nestjs');
      expect(result).toEqual(mockFound);
      expect(mockCourseModel.findOne).toHaveBeenCalledWith({ slug: 'nextjs-15-nestjs' });
    });

    it('should throw NotFoundException if slug does not exist', async () => {
      const populateChain = {
        populate: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(null),
      };
      mockCourseModel.findOne.mockReturnValue(populateChain);

      await expect(coursesService.findBySlug('non-existent-slug')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  function mockInstructorRepoResponse(val: any) {
    mockInstructorModel.findOne.mockResolvedValue(val);
  }
});
