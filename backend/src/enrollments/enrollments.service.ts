import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enrollment, EnrollmentDocument } from './entities/enrollment.entity.js';
import { Course, CourseDocument } from '../courses/entities/course.entity.js';
import { EnrollmentStatus } from '../common/constants/enums.js';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  async enroll(userId: string, courseId: string) {
    const existing = await this.enrollmentModel.findOne({ userId, courseId });
    if (existing) throw new ConflictException('Already enrolled in this course');

    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    if (Number(course.price) > 0) {
      throw new ForbiddenException('This is a paid course. Please complete payment first.');
    }

    const enrollment = await this.enrollmentModel.create({
      userId,
      courseId,
      status: EnrollmentStatus.ACTIVE,
    });

    await this.courseModel.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

    return enrollment;
  }

  async createPaidEnrollment(userId: string, courseId: string) {
    const existing = await this.enrollmentModel.findOne({ userId, courseId });
    if (existing) return existing;

    const enrollment = await this.enrollmentModel.create({
      userId,
      courseId,
      status: EnrollmentStatus.ACTIVE,
    });

    await this.courseModel.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

    return enrollment;
  }

  async getUserEnrollments(userId: string) {
    return this.enrollmentModel
      .find({ userId })
      .populate({
        path: 'course',
        populate: [
          { path: 'instructor', populate: { path: 'user' } },
          { path: 'category' },
        ],
      })
      .sort({ enrolledAt: -1 })
      .exec();
  }

  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.enrollmentModel.findOne({
      userId,
      courseId,
      status: EnrollmentStatus.ACTIVE,
    });
    return !!enrollment;
  }

  async getEnrollmentCount(courseId: string): Promise<number> {
    return this.enrollmentModel.countDocuments({ courseId });
  }
}
