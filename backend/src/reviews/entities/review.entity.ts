import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({
  timestamps: true,
  collection: 'reviews',
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
export class Review {
  id?: string;

  @Prop({ required: true, type: Number, min: 1, max: 5 })
  rating: number;

  @Prop()
  comment?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId | string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId | string;

  createdAt?: Date;
  updatedAt?: Date;

  user?: any;
  course?: any;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

ReviewSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

ReviewSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true,
});
