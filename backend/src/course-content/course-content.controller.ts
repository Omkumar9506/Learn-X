import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CourseContentService } from './course-content.service.js';

@ApiTags('Course Content')
@Controller('courses/:courseId/content')
export class CourseContentController {
  constructor(private readonly courseContentService: CourseContentService) {}

  @Get()
  @ApiOperation({ summary: 'Get course sections and lectures' })
  async getCourseContent(@Param('courseId') courseId: string) {
    return this.courseContentService.getCourseContent(courseId);
  }

  @Post('sections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createSection(@Param('courseId') courseId: string, @Body() data: { title: string }) {
    return this.courseContentService.createSection(courseId, data);
  }

  @Patch('sections/:sectionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateSection(@Param('sectionId') sectionId: string, @Body() data: { title?: string }) {
    return this.courseContentService.updateSection(sectionId, data);
  }

  @Delete('sections/:sectionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteSection(@Param('sectionId') sectionId: string) {
    return this.courseContentService.deleteSection(sectionId);
  }

  @Post('sections/:sectionId/lectures')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createLecture(@Param('sectionId') sectionId: string, @Body() data: any) {
    return this.courseContentService.createLecture(sectionId, data);
  }

  @Patch('lectures/:lectureId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateLecture(@Param('lectureId') lectureId: string, @Body() data: any) {
    return this.courseContentService.updateLecture(lectureId, data);
  }

  @Delete('lectures/:lectureId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteLecture(@Param('lectureId') lectureId: string) {
    return this.courseContentService.deleteLecture(lectureId);
  }

  @Patch('sections/reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async reorderSections(@Param('courseId') courseId: string, @Body() data: { sectionIds: string[] }) {
    return this.courseContentService.reorderSections(courseId, data.sectionIds);
  }

  @Patch('sections/:sectionId/lectures/reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async reorderLectures(@Param('sectionId') sectionId: string, @Body() data: { lectureIds: string[] }) {
    return this.courseContentService.reorderLectures(sectionId, data.lectureIds);
  }
}
