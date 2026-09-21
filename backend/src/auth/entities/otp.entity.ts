import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({
  timestamps: true,
  collection: 'otps',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      ret.id = ret._id ? ret._id.toString() : ret.id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Otp {
  id?: string;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ default: 'forgot_password', index: true })
  purpose: string;

  @Prop({ required: true })
  expiresAt: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// TTL index to automatically delete expired OTPs from MongoDB
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ email: 1, purpose: 1 });
