import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Course, CourseDocument } from './entities/course.entity.js';
import { Instructor, InstructorDocument } from '../instructors/entities/instructor.entity.js';
import { Category, CategoryDocument } from '../categories/entities/category.entity.js';
import { CourseStatus } from '../common/constants/enums.js';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Instructor.name)
    private readonly instructorModel: Model<InstructorDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  private async resolveInstructorId(userIdOrInstructorId: string): Promise<string> {
    const conditions: any[] = [{ userId: userIdOrInstructorId }];
    if (isValidObjectId(userIdOrInstructorId)) {
      conditions.push({ _id: userIdOrInstructorId });
    }

    const instructor = await this.instructorModel.findOne({ $or: conditions });
    if (!instructor) {
      throw new ForbiddenException('You must be an onboarded instructor to perform this action');
    }
    return (instructor.id || instructor._id).toString();
  }

  async create(userIdOrInstructorId: string, data: Partial<Course>) {
    const instructorId = await this.resolveInstructorId(userIdOrInstructorId);
    const slug = this.generateSlug(data.title || '');
    return this.courseModel.create({
      ...data,
      slug,
      instructorId,
      status: CourseStatus.DRAFT,
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    category?: string;
    level?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const { page = 1, limit = 12, category, level, search, sort = 'newest', minPrice, maxPrice } = query;

    const filter: any = { status: CourseStatus.PUBLISHED };

    if (category) {
      const catDoc = await this.categoryModel.findOne({ slug: category });
      if (catDoc) {
        filter.categoryId = catDoc._id;
      } else {
        return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
      }
    }

    if (level) {
      filter.level = level;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    let sortObj: any = { createdAt: -1 };
    switch (sort) {
      case 'price-low':
        sortObj = { price: 1 };
        break;
      case 'price-high':
        sortObj = { price: -1 };
        break;
      case 'rating':
        sortObj = { averageRating: -1 };
        break;
      case 'popular':
        sortObj = { enrollmentCount: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const [data, total] = await Promise.all([
      this.courseModel
        .find(filter)
        .populate({ path: 'instructor', populate: { path: 'user' } })
        .populate('category')
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.courseModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBySlug(slugOrId: string) {
    const query = isValidObjectId(slugOrId)
      ? { $or: [{ slug: slugOrId }, { _id: slugOrId }] }
      : { slug: slugOrId };

    const course = await this.courseModel
      .findOne(query)
      .populate({ path: 'instructor', populate: { path: 'user' } })
      .populate('category')
      .populate({ path: 'sections', populate: { path: 'lectures' } })
      .exec();

    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async findById(id: string) {
    const course = await this.courseModel
      .findById(id)
      .populate({ path: 'instructor', populate: { path: 'user' } })
      .populate('category')
      .populate({ path: 'sections', populate: { path: 'lectures' } })
      .exec();

    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(id: string, userIdOrInstructorId: string, data: Partial<Course>) {
    const instructorId = await this.resolveInstructorId(userIdOrInstructorId);
    const course = await this.findById(id);
    const courseInstructorId = (course.instructorId as any)?._id?.toString() || course.instructorId?.toString();
    if (courseInstructorId !== instructorId) {
      throw new ForbiddenException('You can only edit your own courses');
    }

    return this.courseModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async remove(id: string, userIdOrInstructorId: string) {
    const instructorId = await this.resolveInstructorId(userIdOrInstructorId);
    const course = await this.findById(id);
    const courseInstructorId = (course.instructorId as any)?._id?.toString() || course.instructorId?.toString();
    if (courseInstructorId !== instructorId) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    await this.courseModel.findByIdAndDelete(id);
    return { message: 'Course deleted successfully' };
  }

  async findByInstructor(userIdOrInstructorId: string, page = 1, limit = 10) {
    const instructorId = await this.resolveInstructorId(userIdOrInstructorId);

    const [data, total] = await Promise.all([
      this.courseModel
        .find({ instructorId })
        .populate('category')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.courseModel.countDocuments({ instructorId }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getFeatured(limit = 8) {
    return this.courseModel
      .find({ status: CourseStatus.PUBLISHED, isFeatured: true })
      .populate({ path: 'instructor', populate: { path: 'user' } })
      .populate('category')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async publish(id: string, userIdOrInstructorId: string) {
    const instructorId = await this.resolveInstructorId(userIdOrInstructorId);
    const course = await this.findById(id);
    const courseInstructorId = (course.instructorId as any)?._id?.toString() || course.instructorId?.toString();
    if (courseInstructorId !== instructorId) {
      throw new ForbiddenException('You can only publish your own courses');
    }

    return this.courseModel.findByIdAndUpdate(
      id,
      { $set: { status: CourseStatus.PUBLISHED } },
      { new: true },
    );
  }

  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const suffix = Date.now().toString(36).slice(-4);
    return `${base}-${suffix}`;
  }
}
