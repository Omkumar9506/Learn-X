import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/entities/user.entity.js';
import { Instructor, InstructorSchema } from '../instructors/entities/instructor.entity.js';
import { Course, CourseSchema } from '../courses/entities/course.entity.js';
import { Category, CategorySchema } from '../categories/entities/category.entity.js';
import { Enrollment, EnrollmentSchema } from '../enrollments/entities/enrollment.entity.js';
import { Order, OrderSchema } from '../payments/entities/order.entity.js';
import { Review, ReviewSchema } from '../reviews/entities/review.entity.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
