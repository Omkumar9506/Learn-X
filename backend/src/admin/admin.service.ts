import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/entities/user.entity.js';
import { Instructor, InstructorDocument } from '../instructors/entities/instructor.entity.js';
import { Course, CourseDocument } from '../courses/entities/course.entity.js';
import { Category, CategoryDocument } from '../categories/entities/category.entity.js';
import { Enrollment, EnrollmentDocument } from '../enrollments/entities/enrollment.entity.js';
import { Order, OrderDocument } from '../payments/entities/order.entity.js';
import { Review, ReviewDocument } from '../reviews/entities/review.entity.js';
import { OrderStatus, UserRole, CourseStatus } from '../common/constants/enums.js';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Instructor.name) private readonly instructorModel: Model<InstructorDocument>,
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalInstructors,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalReviews,
      revenueResult,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.instructorModel.countDocuments(),
      this.courseModel.countDocuments(),
      this.courseModel.countDocuments({ status: CourseStatus.PUBLISHED }),
      this.enrollmentModel.countDocuments(),
      this.reviewModel.countDocuments(),
      this.orderModel.aggregate([
        { $match: { status: OrderStatus.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalRevenue = revenueResult.length > 0 ? parseFloat(revenueResult[0].total || '0') : 0;

    return {
      totalUsers,
      totalInstructors,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalRevenue,
      totalReviews,
    };
  }

  async getUsers(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.userModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getOrders(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.orderModel
        .find()
        .populate('user')
        .populate('course')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getCourses(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.courseModel
        .find()
        .populate({ path: 'instructor', populate: { path: 'user' } })
        .populate('category')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.courseModel.countDocuments(),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getReviews(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.reviewModel
        .find()
        .populate('user')
        .populate('course')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments(),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateCourseStatus(courseId: string, status: any) {
    return this.courseModel
      .findByIdAndUpdate(courseId, { $set: { status } }, { new: true })
      .populate({ path: 'instructor', populate: { path: 'user' } })
      .populate('category')
      .exec();
  }

  async updateUserRole(userId: string, role: any) {
    return this.userModel.findByIdAndUpdate(userId, { $set: { role } }, { new: true }).exec();
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    return this.userModel.findByIdAndUpdate(userId, { $set: { isActive } }, { new: true }).exec();
  }

  async getInstructors(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.instructorModel
        .find()
        .populate('user')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.instructorModel.countDocuments(),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateInstructorApproval(instructorId: string, isApproved: boolean) {
    const instructor = await this.instructorModel
      .findByIdAndUpdate(instructorId, { $set: { isApproved } }, { new: true })
      .populate('user')
      .exec();

    if (instructor && isApproved && instructor.userId) {
      await this.userModel.findByIdAndUpdate(instructor.userId, { $set: { role: UserRole.INSTRUCTOR } });
    }

    return instructor;
  }
}
