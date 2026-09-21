import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { CourseStatus, CourseLevel } from '../../common/constants/enums.js';

export type CourseDocument = HydratedDocument<Course>;

@Schema({
  timestamps: true,
  collection: 'courses',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      ret.id = ret._id ? ret._id.toString() : ret.id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      ret.id = ret._id ? ret._id.toString() : ret.id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Course {
  id?: string;

  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, unique: true, maxlength: 250, index: true })
  slug: string;

  @Prop({ maxlength: 300 })
  shortDescription?: string;

  @Prop()
  description?: string;

  @Prop({ maxlength: 500 })
  thumbnail?: string;

  @Prop({ maxlength: 250 })
  thumbnailPublicId?: string;

  @Prop({ type: Number, default: 0 })
  price: number;

  @Prop({ type: String, enum: Object.values(CourseLevel), default: CourseLevel.ALL_LEVELS })
  level: CourseLevel;

  @Prop({ default: 'English', maxlength: 50 })
  language: string;

  @Prop({ type: String, enum: Object.values(CourseStatus), default: CourseStatus.DRAFT, index: true })
  status: CourseStatus;

  @Prop({ type: [String], default: [] })
  requirements?: string[];

  @Prop({ type: [String], default: [] })
  learningOutcomes?: string[];

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ type: Number, default: 0 })
  averageRating: number;

  @Prop({ type: Number, default: 0 })
  reviewCount: number;

  @Prop({ type: Number, default: 0 })
  enrollmentCount: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Instructor', required: true, index: true })
  instructorId: Types.ObjectId | string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', index: true })
  categoryId?: Types.ObjectId | string;

  createdAt?: Date;
  updatedAt?: Date;

  instructor?: any;
  category?: any;
  sections?: any[];
  enrollments?: any[];
  reviews?: any[];
  quizzes?: any[];
  wishlistItems?: any[];
  orders?: any[];
  courseProgress?: any[];
  certificates?: any[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.virtual('instructor', {
  ref: 'Instructor',
  localField: 'instructorId',
  foreignField: '_id',
  justOne: true,
});

CourseSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

CourseSchema.virtual('sections', {
  ref: 'Section',
  localField: '_id',
  foreignField: 'courseId',
});
