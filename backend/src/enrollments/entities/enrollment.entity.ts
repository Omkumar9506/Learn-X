import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { EnrollmentStatus } from '../../common/constants/enums.js';

export type EnrollmentDocument = HydratedDocument<Enrollment>;

@Schema({
  timestamps: { createdAt: 'enrolledAt', updatedAt: 'updatedAt' },
  collection: 'enrollments',
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
export class Enrollment {
  id?: string;

  @Prop({ type: String, enum: Object.values(EnrollmentStatus), default: EnrollmentStatus.ACTIVE })
  status: EnrollmentStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId | string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId | string;

  enrolledAt?: Date;
  updatedAt?: Date;

  user?: any;
  course?: any;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

EnrollmentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

EnrollmentSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true,
});
