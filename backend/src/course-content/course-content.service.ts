import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Section, SectionDocument } from './entities/section.entity.js';
import { Lecture, LectureDocument } from './entities/lecture.entity.js';

@Injectable()
export class CourseContentService {
  constructor(
    @InjectModel(Section.name)
    private readonly sectionModel: Model<SectionDocument>,
    @InjectModel(Lecture.name)
    private readonly lectureModel: Model<LectureDocument>,
  ) {}

  async createSection(courseId: string, data: { title: string }) {
    const lastSection = await this.sectionModel.findOne({ courseId }).sort({ order: -1 }).exec();
    const order = (lastSection?.order || 0) + 1;

    return this.sectionModel.create({
      ...data,
      courseId,
      order,
    });
  }

  async updateSection(id: string, data: Partial<Section>) {
    const section = await this.sectionModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  async deleteSection(id: string) {
    const section = await this.sectionModel.findByIdAndDelete(id);
    if (!section) throw new NotFoundException('Section not found');
    await this.lectureModel.deleteMany({ sectionId: id });
    return { message: 'Section deleted' };
  }

  async createLecture(sectionId: string, data: Partial<Lecture>) {
    const lastLecture = await this.lectureModel.findOne({ sectionId }).sort({ order: -1 }).exec();
    const order = (lastLecture?.order || 0) + 1;

    return this.lectureModel.create({
      ...data,
      sectionId,
      order,
    });
  }

  async updateLecture(id: string, data: Partial<Lecture>) {
    const lecture = await this.lectureModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!lecture) throw new NotFoundException('Lecture not found');
    return lecture;
  }

  async deleteLecture(id: string) {
    const lecture = await this.lectureModel.findByIdAndDelete(id);
    if (!lecture) throw new NotFoundException('Lecture not found');
    return { message: 'Lecture deleted' };
  }

  async getCourseContent(courseId: string) {
    return this.sectionModel
      .find({ courseId })
      .sort({ order: 1 })
      .populate({
        path: 'lectures',
        options: { sort: { order: 1 } },
      })
      .exec();
  }

  async reorderSections(courseId: string, sectionIds: string[]) {
    const updates = sectionIds.map((id, index) =>
      this.sectionModel.findByIdAndUpdate(id, { $set: { order: index + 1 } }),
    );
    await Promise.all(updates);
    return this.getCourseContent(courseId);
  }

  async reorderLectures(sectionId: string, lectureIds: string[]) {
    const updates = lectureIds.map((id, index) =>
      this.lectureModel.findByIdAndUpdate(id, { $set: { order: index + 1 } }),
    );
    await Promise.all(updates);
    return { message: 'Lectures reordered' };
  }
}
