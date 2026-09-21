import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type QuizQuestionDocument = HydratedDocument<QuizQuestion>;

@Schema({
  timestamps: true,
  collection: 'quiz_questions',
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
export class QuizQuestion {
  id?: string;

  @Prop({ required: true })
  question: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Quiz', required: true, index: true })
  quizId: Types.ObjectId | string;

  quiz?: any;
  options?: any[];
}

export const QuizQuestionSchema = SchemaFactory.createForClass(QuizQuestion);

QuizQuestionSchema.virtual('options', {
  ref: 'QuizOption',
  localField: '_id',
  foreignField: 'questionId',
});
