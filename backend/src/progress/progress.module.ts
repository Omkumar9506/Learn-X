import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseProgress, CourseProgressSchema } from './entities/course-progress.entity.js';
import { LectureProgress, LectureProgressSchema } from './entities/lecture-progress.entity.js';
import { Enrollment, EnrollmentSchema } from '../enrollments/entities/enrollment.entity.js';
import { Section, SectionSchema } from '../course-content/entities/section.entity.js';
import { Lecture, LectureSchema } from '../course-content/entities/lecture.entity.js';
import { ProgressController } from './progress.controller.js';
import { ProgressService } from './progress.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseProgress.name, schema: CourseProgressSchema },
      { name: LectureProgress.name, schema: LectureProgressSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Section.name, schema: SectionSchema },
      { name: Lecture.name, schema: LectureSchema },
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
