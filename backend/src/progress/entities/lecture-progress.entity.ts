import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type LectureProgressDocument = HydratedDocument<LectureProgress>;

@Schema({
  timestamps: true,
  collection: 'lecture_progress',
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
export class LectureProgress {
  id?: string;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ type: Number, default: 0 })
  watchedDuration: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId | string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lecture', required: true, index: true })
  lectureId: Types.ObjectId | string;

  createdAt?: Date;
  updatedAt?: Date;

  user?: any;
  lecture?: any;
}

export const LectureProgressSchema = SchemaFactory.createForClass(LectureProgress);
LectureProgressSchema.index({ userId: 1, lectureId: 1 }, { unique: true });

LectureProgressSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

LectureProgressSchema.virtual('lecture', {
  ref: 'Lecture',
  localField: 'lectureId',
  foreignField: '_id',
  justOne: true,
});
