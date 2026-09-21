import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/constants/enums.js';
import { CoursesService } from './courses.service.js';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List published courses with filtering' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('level') level?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.coursesService.findAll({ page, limit, category, level, search, sort, minPrice, maxPrice });
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured courses' })
  async getFeatured(@Query('limit') limit?: number) {
    return this.coursesService.getFeatured(limit);
  }

  @Get('instructor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get instructor courses' })
  async findByInstructor(
    @CurrentUser() user: { id: string; instructorId?: string },
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // We need the instructor ID, not user ID
    return this.coursesService.findByInstructor(user.id, page, limit);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get course by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a course' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() data: Partial<{ title: string; shortDescription: string; description: string; price: number; level: string; language: string; categoryId: string; requirements: string[]; learningOutcomes: string[] }>,
  ) {
    return this.coursesService.create(userId, data as any);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() data: any,
  ) {
    return this.coursesService.update(id, userId, data);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a course' })
  async publish(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.coursesService.publish(id, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a course' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.coursesService.remove(id, userId);
  }
}
