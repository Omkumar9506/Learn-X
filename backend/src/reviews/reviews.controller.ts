import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ReviewsService } from './reviews.service.js';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() data: { courseId: string; rating: number; comment?: string },
  ) {
    return this.reviewsService.create(userId, data.courseId, data);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get course reviews' })
  async getCourseReviews(
    @Param('courseId') courseId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewsService.getCourseReviews(courseId, page, limit);
  }
}
