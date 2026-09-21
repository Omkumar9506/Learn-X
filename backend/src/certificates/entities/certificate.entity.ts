import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type CertificateDocument = HydratedDocument<Certificate>;

@Schema({
  timestamps: { createdAt: 'issuedAt', updatedAt: 'updatedAt' },
  collection: 'certificates',
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
export class Certificate {
  id?: string;

  @Prop({ required: true, unique: true, maxlength: 100 })
  certificateNumber: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId | string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId | string;

  issuedAt?: Date;
  updatedAt?: Date;

  user?: any;
  course?: any;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);
CertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

CertificateSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

CertificateSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true,
});
