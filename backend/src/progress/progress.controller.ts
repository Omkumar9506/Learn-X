import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ProgressService } from './progress.service.js';

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('lecture/:lectureId/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a lecture as complete' })
  async markLectureComplete(
    @CurrentUser('id') userId: string,
    @Param('lectureId') lectureId: string,
    @Body() data: { courseId: string },
  ) {
    return this.progressService.markLectureComplete(userId, lectureId, data.courseId);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course progress' })
  async getCourseProgress(@CurrentUser('id') userId: string, @Param('courseId') courseId: string) {
    return this.progressService.getCourseProgress(userId, courseId);
  }

  @Get('course/:courseId/lectures')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lecture-level progress' })
  async getLectureProgress(@CurrentUser('id') userId: string, @Param('courseId') courseId: string) {
    return this.progressService.getLectureProgress(userId, courseId);
  }
}
