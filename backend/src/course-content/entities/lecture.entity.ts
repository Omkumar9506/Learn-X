import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type LectureDocument = HydratedDocument<Lecture>;

@Schema({
  timestamps: true,
  collection: 'lectures',
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
export class Lecture {
  id?: string;

  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop()
  content?: string;

  @Prop({ maxlength: 500 })
  videoUrl?: string;

  @Prop({ maxlength: 255 })
  videoPublicId?: string;

  @Prop({ type: Number, default: 0 })
  duration: number;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ default: false })
  isFreePreview: boolean;

  @Prop({ type: [String], default: [] })
  resources?: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Section', required: true, index: true })
  sectionId: Types.ObjectId | string;

  section?: any;
  progress?: any[];
}

export const LectureSchema = SchemaFactory.createForClass(Lecture);
