import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { OrderStatus } from '../../common/constants/enums.js';

export type OrderDocument = HydratedDocument<Order>;

@Schema({
  timestamps: true,
  collection: 'orders',
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
export class Order {
  id?: string;

  @Prop({ maxlength: 255, index: true })
  razorpayOrderId?: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ default: 'INR', maxlength: 10 })
  currency: string;

  @Prop({ type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId | string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId | string;

  createdAt?: Date;
  updatedAt?: Date;

  user?: any;
  course?: any;
  payment?: any;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

OrderSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true,
});

OrderSchema.virtual('payment', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'orderId',
  justOne: true,
});
