import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  timestamps: true,
  collection: 'categories',
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
export class Category {
  id?: string;

  @Prop({ required: true, unique: true, maxlength: 100 })
  name: string;

  @Prop({ required: true, unique: true, maxlength: 150 })
  slug: string;

  @Prop({ maxlength: 500 })
  description?: string;

  @Prop({ maxlength: 500 })
  icon?: string;

  @Prop({ default: true })
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;

  courses?: any[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'categoryId',
});
