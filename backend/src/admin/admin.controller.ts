import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/constants/enums.js';
import { AdminService } from './admin.service.js';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List users' })
  async getUsers(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getUsers(page, limit);
  }

  @Get('courses')
  @ApiOperation({ summary: 'List all courses' })
  async getCourses(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getCourses(page, limit);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List all orders' })
  async getOrders(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getOrders(page, limit);
  }

  @Get('reviews')
  @ApiOperation({ summary: 'List all reviews' })
  async getReviews(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getReviews(page, limit);
  }

  @Patch('courses/:id/status')
  @ApiOperation({ summary: 'Update course status (approve/publish/draft/archive)' })
  async updateCourseStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateCourseStatus(id, status);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user active status' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.updateUserStatus(id, isActive);
  }

  @Get('instructors')
  @ApiOperation({ summary: 'List instructors for approval' })
  async getInstructors(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getInstructors(page, limit);
  }

  @Patch('instructors/:id/approve')
  @ApiOperation({ summary: 'Approve or revoke instructor status' })
  async updateInstructorApproval(
    @Param('id') id: string,
    @Body('isApproved') isApproved: boolean,
  ) {
    return this.adminService.updateInstructorApproval(id, isApproved);
  }
}
