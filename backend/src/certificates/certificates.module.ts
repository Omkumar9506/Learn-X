import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Certificate, CertificateSchema } from './entities/certificate.entity.js';
import { CourseProgress, CourseProgressSchema } from '../progress/entities/course-progress.entity.js';
import { CertificatesController } from './certificates.controller.js';
import { CertificatesService } from './certificates.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Certificate.name, schema: CertificateSchema },
      { name: CourseProgress.name, schema: CourseProgressSchema },
    ]),
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
