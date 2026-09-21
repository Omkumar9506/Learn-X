import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/constants/enums.js';
import { CategoriesService } from './categories.service.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all active categories' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('with-count')
  @ApiOperation({ summary: 'Get categories with course counts' })
  async getWithCourseCount() {
    return this.categoriesService.getWithCourseCount();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  async findById(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a category (Admin only)' })
  async create(@Body() data: { name: string; slug: string; description?: string; icon?: string }) {
    return this.categoriesService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category (Admin only)' })
  async update(@Param('id') id: string, @Body() data: Partial<{ name: string; slug: string; description: string; icon: string; isActive: boolean }>) {
    return this.categoriesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category (Admin only)' })
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
