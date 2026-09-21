import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

interface UploadFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class CloudinaryService {
  private isConfigured = false;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isConfigured = true;
    }
  }

  async uploadImage(file: UploadFile, folder = 'learnx'): Promise<{ url: string; publicId: string }> {
    if (!this.isConfigured) {
      // Return a placeholder in dev mode
      return {
        url: `https://via.placeholder.com/400x300?text=${encodeURIComponent(file.originalname)}`,
        publicId: `dev_${Date.now()}`,
      };
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ width: 1280, height: 720, crop: 'limit' }],
        },
        (error, result) => {
          if (error) reject(new BadRequestException('Image upload failed'));
          else resolve({ url: result!.secure_url, publicId: result!.public_id });
        },
      ).end(file.buffer);
    });
  }

  async uploadVideo(file: UploadFile, folder = 'learnx/videos'): Promise<{ url: string; publicId: string; duration: number }> {
    if (!this.isConfigured) {
      return {
        url: `https://via.placeholder.com/640x360?text=Video`,
        publicId: `dev_video_${Date.now()}`,
        duration: 0,
      };
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'video',
          eager: [{ format: 'mp4' }],
        },
        (error, result) => {
          if (error) reject(new BadRequestException('Video upload failed'));
          else resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
            duration: Math.round(result!.duration || 0),
          });
        },
      ).end(file.buffer);
    });
  }

  async delete(publicId: string, resourceType: 'image' | 'video' = 'image') {
    if (!this.isConfigured) return;
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  }
}
