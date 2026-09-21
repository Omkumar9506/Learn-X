import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type QuizAttemptDocument = HydratedDocument<QuizAttempt>;

@Schema({
  timestamps: { createdAt: 'attemptedAt', updatedAt: 'updatedAt' },
  collection: 'quiz_attempts',
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
export class QuizAttempt {
  id?: string;

  @Prop({ type: Number, required: true })
  score: number;

  @Prop({ type: Number, required: true })
  totalQuestions: number;

  @Prop({ type: Number, required: true })
  correctAnswers: number;

  @Prop({ default: false })
  passed: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  answers: Record<string, string>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId | string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Quiz', required: true, index: true })
  quizId: Types.ObjectId | string;

  attemptedAt?: Date;
  updatedAt?: Date;

  user?: any;
  quiz?: any;
}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);

QuizAttemptSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

QuizAttemptSchema.virtual('quiz', {
  ref: 'Quiz',
  localField: 'quizId',
  foreignField: '_id',
  justOne: true,
});
