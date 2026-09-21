import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseProgress, CourseProgressDocument } from './entities/course-progress.entity.js';
import { LectureProgress, LectureProgressDocument } from './entities/lecture-progress.entity.js';
import { Lecture, LectureDocument } from '../course-content/entities/lecture.entity.js';
import { Section, SectionDocument } from '../course-content/entities/section.entity.js';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(CourseProgress.name)
    private readonly courseProgressModel: Model<CourseProgressDocument>,
    @InjectModel(LectureProgress.name)
    private readonly lectureProgressModel: Model<LectureProgressDocument>,
    @InjectModel(Lecture.name)
    private readonly lectureModel: Model<LectureDocument>,
    @InjectModel(Section.name)
    private readonly sectionModel: Model<SectionDocument>,
  ) {}

  async markLectureComplete(userId: string, lectureId: string, courseId: string) {
    let lectureProgress = await this.lectureProgressModel.findOne({
      userId,
      lectureId,
    });

    if (lectureProgress) {
      lectureProgress.isCompleted = true;
      await lectureProgress.save();
    } else {
      lectureProgress = await this.lectureProgressModel.create({
        userId,
        lectureId,
        isCompleted: true,
      });
    }

    await this.updateCourseProgress(userId, courseId);

    return lectureProgress;
  }

  async getCourseProgress(userId: string, courseId: string) {
    const progress = await this.courseProgressModel.findOne({
      userId,
      courseId,
    });

    if (!progress) {
      return {
        userId,
        courseId,
        percentage: 0,
        completedLectures: 0,
        totalLectures: 0,
        isCompleted: false,
      };
    }

    return progress;
  }

  async getLectureProgress(userId: string, courseId: string) {
    const sections = await this.sectionModel
      .find({ courseId })
      .populate('lectures')
      .exec();

    const lectureIds: string[] = sections.flatMap((s: any) =>
      (s.lectures || []).map((l: any) => (l.id || l._id.toString())),
    );

    const progressRecords = await this.lectureProgressModel.find({
      userId,
      lectureId: { $in: lectureIds },
    });

    const progressMap: Record<string, boolean> = {};
    for (const p of progressRecords) {
      const lid = (p.lectureId as any)?.toString();
      progressMap[lid] = p.isCompleted;
    }

    return progressMap;
  }

  private async updateCourseProgress(userId: string, courseId: string) {
    const sections = await this.sectionModel
      .find({ courseId })
      .populate('lectures')
      .exec();

    const allLectures = sections.flatMap((s: any) => s.lectures || []);
    const totalLectures = allLectures.length;
    const lectureIds = allLectures.map((l: any) => (l.id || l._id.toString()));

    const completedCount = await this.lectureProgressModel.countDocuments({
      userId,
      lectureId: { $in: lectureIds },
      isCompleted: true,
    });

    const percentage = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

    let progress = await this.courseProgressModel.findOne({
      userId,
      courseId,
    });

    if (progress) {
      progress.completedLectures = completedCount;
      progress.totalLectures = totalLectures;
      progress.percentage = percentage;
      progress.isCompleted = percentage === 100;
      await progress.save();
    } else {
      progress = await this.courseProgressModel.create({
        userId,
        courseId,
        completedLectures: completedCount,
        totalLectures,
        percentage,
        isCompleted: percentage === 100,
      });
    }

    return progress;
  }
}
