import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Instructor, InstructorDocument } from './entities/instructor.entity.js';
import { User, UserDocument } from '../users/entities/user.entity.js';
import { Course, CourseDocument } from '../courses/entities/course.entity.js';
import { UserRole } from '../common/constants/enums.js';

@Injectable()
export class InstructorsService {
  constructor(
    @InjectModel(Instructor.name)
    private readonly instructorModel: Model<InstructorDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  async onboard(userId: string, data: Partial<Instructor>) {
    const existing = await this.instructorModel.findOne({ userId });
    if (existing) {
      throw new ConflictException('You are already registered as an instructor');
    }

    const instructor = await this.instructorModel.create({
      ...data,
      userId,
      isApproved: true,
    });

    await this.userModel.findByIdAndUpdate(userId, { $set: { role: UserRole.INSTRUCTOR } });

    return instructor;
  }

  async findByUserId(userId: string) {
    const instructor = await this.instructorModel.findOne({ userId }).populate('user');
    if (!instructor) throw new NotFoundException('Instructor profile not found');
    return instructor;
  }

  async update(userId: string, data: Partial<Instructor>) {
    const instructor = await this.instructorModel
      .findOneAndUpdate({ userId }, { $set: data }, { new: true })
      .populate('user');
    if (!instructor) throw new NotFoundException('Instructor profile not found');
    return instructor;
  }

  async findAll(page = 1, limit = 10) {
    const [instructors, total] = await Promise.all([
      this.instructorModel
        .find()
        .populate('user')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.instructorModel.countDocuments(),
    ]);

    return {
      data: instructors,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getFeatured(limit = 4) {
    return this.instructorModel
      .find({ isApproved: true })
      .populate('user')
      .populate('courses')
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
  }

  async getDashboardStats(userId: string) {
    const instructor = await this.findByUserId(userId);
    const totalCourses = await this.courseModel.countDocuments({ instructorId: instructor._id });

    return {
      instructor,
      totalCourses,
    };
  }
}
