import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type QuizOptionDocument = HydratedDocument<QuizOption>;

@Schema({
  timestamps: true,
  collection: 'quiz_options',
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
export class QuizOption {
  id?: string;

  @Prop({ required: true })
  text: string;

  @Prop({ default: false, select: false })
  isCorrect: boolean;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'QuizQuestion', required: true, index: true })
  questionId: Types.ObjectId | string;

  question?: any;
}

export const QuizOptionSchema = SchemaFactory.createForClass(QuizOption);
