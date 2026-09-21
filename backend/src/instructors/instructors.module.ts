import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Instructor, InstructorSchema } from './entities/instructor.entity.js';
import { User, UserSchema } from '../users/entities/user.entity.js';
import { Course, CourseSchema } from '../courses/entities/course.entity.js';
import { InstructorsController } from './instructors.controller.js';
import { InstructorsService } from './instructors.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Instructor.name, schema: InstructorSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [InstructorsController],
  providers: [InstructorsService],
  exports: [InstructorsService],
})
export class InstructorsModule {}
