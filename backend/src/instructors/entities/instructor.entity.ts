import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type InstructorDocument = HydratedDocument<Instructor>;

@Schema({
  timestamps: true,
  collection: 'instructors',
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
export class Instructor {
  id?: string;

  @Prop({ required: true, maxlength: 200 })
  headline: string;

  @Prop({ required: true })
  bio: string;

  @Prop({ type: [String], default: [] })
  expertise: string[];

  @Prop({ maxlength: 500 })
  avatar?: string;

  @Prop({ maxlength: 100 })
  experience?: string;

  @Prop({ maxlength: 500 })
  website?: string;

  @Prop({ maxlength: 500 })
  linkedin?: string;

  @Prop({ maxlength: 500 })
  github?: string;

  @Prop({ maxlength: 500 })
  twitter?: string;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId | string;

  createdAt?: Date;
  updatedAt?: Date;

  user?: any;
  courses?: any[];
}

export const InstructorSchema = SchemaFactory.createForClass(Instructor);

InstructorSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

InstructorSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'instructorId',
});
