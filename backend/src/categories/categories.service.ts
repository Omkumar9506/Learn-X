import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './entities/category.entity.js';
import { Course, CourseDocument } from '../courses/entities/course.entity.js';
import { CourseStatus } from '../common/constants/enums.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  async create(data: { name: string; slug: string; description?: string; icon?: string }) {
    const existing = await this.categoryModel.findOne({ slug: data.slug });
    if (existing) throw new ConflictException('Category with this slug already exists');

    return this.categoryModel.create(data);
  }

  async findAll() {
    return this.categoryModel.find({ isActive: true }).sort({ name: 1 }).exec();
  }

  async findById(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.categoryModel.findOne({ slug });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, data: Partial<Category>) {
    const category = await this.categoryModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async remove(id: string) {
    const category = await this.categoryModel.findByIdAndDelete(id);
    if (!category) throw new NotFoundException('Category not found');
    return { message: 'Category deleted successfully' };
  }

  async getWithCourseCount() {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .populate({
        path: 'courses',
        match: { status: CourseStatus.PUBLISHED },
        select: '_id status',
      })
      .sort({ name: 1 })
      .exec();

    return categories.map((cat: any) => {
      const plain = cat.toJSON ? cat.toJSON() : cat;
      return {
        id: plain.id || plain._id.toString(),
        name: plain.name,
        slug: plain.slug,
        description: plain.description,
        icon: plain.icon,
        isActive: plain.isActive,
        courseCount: Array.isArray(plain.courses) ? plain.courses.length : 0,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt,
      };
    });
  }
}
