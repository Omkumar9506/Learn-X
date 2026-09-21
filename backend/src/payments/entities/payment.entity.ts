import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { PaymentStatus } from '../../common/constants/enums.js';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({
  timestamps: { createdAt: 'paidAt', updatedAt: 'updatedAt' },
  collection: 'payments',
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
export class Payment {
  id?: string;

  @Prop({ maxlength: 255, index: true })
  razorpayPaymentId: string;

  @Prop({ maxlength: 255 })
  razorpaySignature: string;

  @Prop({ type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ default: 'INR', maxlength: 10 })
  currency: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId: Types.ObjectId | string;

  paidAt?: Date;
  updatedAt?: Date;

  order?: any;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.virtual('order', {
  ref: 'Order',
  localField: 'orderId',
  foreignField: '_id',
  justOne: true,
});
