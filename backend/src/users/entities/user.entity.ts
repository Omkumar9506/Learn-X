import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../../common/constants/enums.js';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  collection: 'users',
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
export class User {
  id?: string;

  @Prop({ required: true, maxlength: 100 })
  name: string;

  @Prop({ required: true, unique: true, maxlength: 255 })
  email: string;

  @Prop({ select: false })
  password?: string;

  @Prop({ maxlength: 500 })
  avatar?: string;

  @Prop({ maxlength: 500 })
  bio?: string;

  @Prop({ type: String, enum: Object.values(UserRole), default: UserRole.STUDENT })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;

  instructor?: any;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('instructor', {
  ref: 'Instructor',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});
