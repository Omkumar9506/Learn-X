import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { WishlistService } from './wishlist.service.js';

@ApiTags('Wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add course to wishlist' })
  async add(@CurrentUser('id') userId: string, @Param('courseId') courseId: string) {
    return this.wishlistService.add(userId, courseId);
  }

  @Delete(':courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove course from wishlist' })
  async remove(@CurrentUser('id') userId: string, @Param('courseId') courseId: string) {
    return this.wishlistService.remove(userId, courseId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user wishlist' })
  async getUserWishlist(@CurrentUser('id') userId: string) {
    return this.wishlistService.getUserWishlist(userId);
  }

  @Get('check/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if course is in wishlist' })
  async checkWishlist(@CurrentUser('id') userId: string, @Param('courseId') courseId: string) {
    const inWishlist = await this.wishlistService.isInWishlist(userId, courseId);
    return { inWishlist };
  }
}
