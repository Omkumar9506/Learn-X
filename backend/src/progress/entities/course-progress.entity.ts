import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type CourseProgressDocument = HydratedDocument<CourseProgress>;

@Schema({
  timestamps: true,
  collection: 'course_progress',
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
export class CourseProgress {
  id?: string;

  @Prop({ type: Number, default: 0 })
  percentage: number;

  @Prop({ type: Number, default: 0 })
  completedLectures: number;

  @Prop({ type: Number, default: 0 })
  totalLectures: number;

  @Prop({ type: String })
  lastLectureId?: string;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId | string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId | string;

  createdAt?: Date;
  updatedAt?: Date;

  user?: any;
  course?: any;
}

export const CourseProgressSchema = SchemaFactory.createForClass(CourseProgress);
CourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

CourseProgressSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

CourseProgressSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true,
});
