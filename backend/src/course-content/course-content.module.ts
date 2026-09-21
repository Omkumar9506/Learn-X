import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Section, SectionSchema } from './entities/section.entity.js';
import { Lecture, LectureSchema } from './entities/lecture.entity.js';
import { CourseContentController } from './course-content.controller.js';
import { CourseContentService } from './course-content.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Section.name, schema: SectionSchema },
      { name: Lecture.name, schema: LectureSchema },
    ]),
  ],
  controllers: [CourseContentController],
  providers: [CourseContentService],
  exports: [CourseContentService],
})
export class CourseContentModule {}
