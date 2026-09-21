import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type QuizDocument = HydratedDocument<Quiz>;

@Schema({
  timestamps: true,
  collection: 'quizzes',
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
export class Quiz {
  id?: string;

  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: Number, default: 0 })
  passingScore: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId | string;

  createdAt?: Date;
  updatedAt?: Date;

  course?: any;
  questions?: any[];
  attempts?: any[];
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

QuizSchema.virtual('questions', {
  ref: 'QuizQuestion',
  localField: '_id',
  foreignField: 'quizId',
});

QuizSchema.virtual('attempts', {
  ref: 'QuizAttempt',
  localField: '_id',
  foreignField: 'quizId',
});
