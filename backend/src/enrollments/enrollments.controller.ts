import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { EnrollmentsService } from './enrollments.service.js';

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enroll in a free course' })
  async enroll(@CurrentUser('id') userId: string, @Body() data: { courseId: string }) {
    return this.enrollmentsService.enroll(userId, data.courseId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my enrollments' })
  async getUserEnrollments(@CurrentUser('id') userId: string) {
    return this.enrollmentsService.getUserEnrollments(userId);
  }

  @Get('check/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check enrollment status' })
  async checkEnrollment(@CurrentUser('id') userId: string, @Param('courseId') courseId: string) {
    const enrolled = await this.enrollmentsService.isEnrolled(userId, courseId);
    return { enrolled };
  }
}
