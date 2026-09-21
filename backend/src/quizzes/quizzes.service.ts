import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, QuizDocument } from './entities/quiz.entity.js';
import { QuizQuestion, QuizQuestionDocument } from './entities/quiz-question.entity.js';
import { QuizOption, QuizOptionDocument } from './entities/quiz-option.entity.js';
import { QuizAttempt, QuizAttemptDocument } from './entities/quiz-attempt.entity.js';
import { Enrollment, EnrollmentDocument } from '../enrollments/entities/enrollment.entity.js';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
    @InjectModel(QuizQuestion.name)
    private readonly questionModel: Model<QuizQuestionDocument>,
    @InjectModel(QuizOption.name)
    private readonly optionModel: Model<QuizOptionDocument>,
    @InjectModel(QuizAttempt.name)
    private readonly attemptModel: Model<QuizAttemptDocument>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
  ) {}

  async createQuiz(courseId: string, data: { title: string; description?: string; passingScore?: number }) {
    return this.quizModel.create({ ...data, courseId });
  }

  async addQuestion(quizId: string, data: { question: string; options: Array<{ text: string; isCorrect: boolean }> }) {
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) throw new NotFoundException('Quiz not found');

    const questionDoc = await this.questionModel.create({
      question: data.question,
      quizId,
    });

    const questionId = questionDoc.id || questionDoc._id.toString();

    const options = data.options.map((opt, index) => ({
      text: opt.text,
      isCorrect: opt.isCorrect,
      order: index,
      questionId,
    }));

    await this.optionModel.insertMany(options);

    return questionDoc;
  }

  async getCourseQuizzes(courseId: string) {
    return this.quizModel
      .find({ courseId, isActive: true })
      .populate({
        path: 'questions',
        populate: { path: 'options' },
      })
      .exec();
  }

  async getQuizForStudent(quizId: string) {
    const quiz = await this.quizModel
      .findById(quizId)
      .populate({
        path: 'questions',
        populate: { path: 'options', select: '-isCorrect' },
      })
      .exec();

    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async submitAttempt(userId: string, quizId: string, answers: Record<string, string>) {
    const quiz = await this.quizModel
      .findById(quizId)
      .populate({
        path: 'questions',
        populate: { path: 'options' },
      })
      .exec();

    if (!quiz) throw new NotFoundException('Quiz not found');

    let correctAnswers = 0;
    const questions = (quiz as any).questions || [];
    const totalQuestions = questions.length;

    for (const question of questions) {
      const qId = question.id || question._id.toString();
      const selectedOptionId = answers[qId];
      if (selectedOptionId) {
        const correctOption = await this.optionModel
          .findOne({ questionId: qId, isCorrect: true })
          .select('_id isCorrect')
          .exec();

        const correctId = correctOption ? (correctOption.id || correctOption._id.toString()) : null;
        if (correctId && correctId === selectedOptionId) {
          correctAnswers++;
        }
      }
    }

    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = score >= (quiz.passingScore || 70);

    return this.attemptModel.create({
      userId,
      quizId,
      score,
      totalQuestions,
      correctAnswers,
      passed,
      answers,
    });
  }

  async getUserAttempts(userId: string, quizId: string) {
    return this.attemptModel
      .find({ userId, quizId })
      .sort({ attemptedAt: -1 })
      .exec();
  }
}
