import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CloudinaryService } from './cloudinary.service.js';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload an image asset (Course thumbnail, avatar)' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async uploadImage(@UploadedFile() file: any, @Body('folder') folder?: string) {
    if (!file) {
      // Allow fallback if sent as JSON payload with demo URL
      return {
        url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        publicId: `dev_img_${Date.now()}`,
      };
    }
    return this.cloudinaryService.uploadImage(file, folder || 'learnx/thumbnails');
  }

  @Post('video')
  @ApiOperation({ summary: 'Upload a video asset (Promo video, lecture)' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async uploadVideo(@UploadedFile() file: any, @Body('folder') folder?: string) {
    if (!file) {
      return {
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        publicId: `dev_vid_${Date.now()}`,
        duration: 120,
      };
    }
    return this.cloudinaryService.uploadVideo(file, folder || 'learnx/videos');
  }
}
