import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './entities/course.entity.js';
import { Instructor, InstructorSchema } from '../instructors/entities/instructor.entity.js';
import { Category, CategorySchema } from '../categories/entities/category.entity.js';
import { Section, SectionSchema } from '../course-content/entities/section.entity.js';
import { Lecture, LectureSchema } from '../course-content/entities/lecture.entity.js';
import { User, UserSchema } from '../users/entities/user.entity.js';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Section.name, schema: SectionSchema },
      { name: Lecture.name, schema: LectureSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
