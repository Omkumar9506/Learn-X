import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './entities/review.entity.js';
import { Enrollment, EnrollmentDocument } from '../enrollments/entities/enrollment.entity.js';
import { Course, CourseDocument } from '../courses/entities/course.entity.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  async create(userId: string, courseId: string, data: { rating: number; comment?: string }) {
    const enrollment = await this.enrollmentModel.findOne({ userId, courseId });
    if (!enrollment) throw new ForbiddenException('You must be enrolled to review this course');

    const existing = await this.reviewModel.findOne({ userId, courseId });
    if (existing) throw new ConflictException('You have already reviewed this course');

    const review = await this.reviewModel.create({ ...data, userId, courseId });

    await this.updateCourseRating(courseId);

    return review;
  }

  async getCourseReviews(courseId: string, page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.reviewModel
        .find({ courseId })
        .populate('user')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments({ courseId }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private async updateCourseRating(courseId: string) {
    const objectId = Types.ObjectId.isValid(courseId) ? new Types.ObjectId(courseId) : courseId;
    const stats = await this.reviewModel.aggregate([
      { $match: { $or: [{ courseId: objectId }, { courseId: courseId.toString() }] } },
      {
        $group: {
          _id: null,
          avg: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    const averageRating = stats.length > 0 ? parseFloat(stats[0].avg.toFixed(2)) : 0;
    const reviewCount = stats.length > 0 ? stats[0].count : 0;

    await this.courseModel.findByIdAndUpdate(courseId, {
      $set: { averageRating, reviewCount },
    });
  }
}
