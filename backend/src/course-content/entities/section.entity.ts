import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type SectionDocument = HydratedDocument<Section>;

@Schema({
  timestamps: true,
  collection: 'sections',
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
export class Section {
  id?: string;

  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId | string;

  course?: any;
  lectures?: any[];
}

export const SectionSchema = SchemaFactory.createForClass(Section);

SectionSchema.virtual('lectures', {
  ref: 'Lecture',
  localField: '_id',
  foreignField: 'sectionId',
});
