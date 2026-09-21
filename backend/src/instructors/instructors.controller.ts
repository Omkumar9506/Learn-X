import { Controller, Get, Post, Patch, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { InstructorsService } from './instructors.service.js';

@ApiTags('Instructors')
@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Post('onboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register as an instructor' })
  async onboard(
    @CurrentUser('id') userId: string,
    @Body() data: { headline: string; bio: string; expertise?: string[]; experience?: string; website?: string; linkedin?: string; github?: string; twitter?: string },
  ) {
    return this.instructorsService.onboard(userId, data);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get instructor profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.instructorsService.findByUserId(userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update instructor profile' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() data: Partial<{ headline: string; bio: string; expertise: string[]; experience: string; website: string; linkedin: string; github: string; twitter: string }>) {
    return this.instructorsService.update(userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'List instructors' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.instructorsService.findAll(page, limit);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured instructors' })
  async getFeatured(@Query('limit') limit = 4) {
    return this.instructorsService.getFeatured(limit);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get instructor dashboard stats' })
  async getDashboardStats(@CurrentUser('id') userId: string) {
    return this.instructorsService.getDashboardStats(userId);
  }
}
