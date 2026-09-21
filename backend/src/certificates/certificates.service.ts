import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Certificate, CertificateDocument } from './entities/certificate.entity.js';
import { CourseProgress, CourseProgressDocument } from '../progress/entities/course-progress.entity.js';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectModel(Certificate.name)
    private readonly certificateModel: Model<CertificateDocument>,
    @InjectModel(CourseProgress.name)
    private readonly courseProgressModel: Model<CourseProgressDocument>,
  ) {}

  async generate(userId: string, courseId: string) {
    const progress = await this.courseProgressModel.findOne({
      userId,
      courseId,
    });

    if (!progress || !progress.isCompleted) {
      throw new NotFoundException('You must complete the course to receive a certificate');
    }

    const existing = await this.certificateModel.findOne({
      userId,
      courseId,
    });
    if (existing) return existing;

    const certificateNumber = `LX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return this.certificateModel.create({
      userId,
      courseId,
      certificateNumber,
    });
  }

  async getUserCertificates(userId: string) {
    return this.certificateModel
      .find({ userId })
      .populate({
        path: 'course',
        populate: { path: 'instructor', populate: { path: 'user' } },
      })
      .sort({ issuedAt: -1 })
      .exec();
  }

  async getCertificate(idOrCertNumber: string) {
    const query = isValidObjectId(idOrCertNumber)
      ? { $or: [{ _id: idOrCertNumber }, { certificateNumber: idOrCertNumber }] }
      : { certificateNumber: idOrCertNumber };

    const cert = await this.certificateModel
      .findOne(query)
      .populate('user')
      .populate({
        path: 'course',
        populate: { path: 'instructor', populate: { path: 'user' } },
      })
      .exec();

    if (!cert) throw new NotFoundException('Certificate not found');
    return cert;
  }
}
