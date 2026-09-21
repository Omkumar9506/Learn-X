import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CertificatesService } from './certificates.service.js';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate certificate for a completed course' })
  async generate(@CurrentUser('id') userId: string, @Body() data: { courseId: string }) {
    return this.certificatesService.generate(userId, data.courseId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user certificates' })
  async getUserCertificates(@CurrentUser('id') userId: string) {
    return this.certificatesService.getUserCertificates(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'View a certificate' })
  async getCertificate(@Param('id') id: string) {
    return this.certificatesService.getCertificate(id);
  }
}
