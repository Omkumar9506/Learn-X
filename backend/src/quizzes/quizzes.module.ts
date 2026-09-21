import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from './entities/quiz.entity.js';
import { QuizQuestion, QuizQuestionSchema } from './entities/quiz-question.entity.js';
import { QuizOption, QuizOptionSchema } from './entities/quiz-option.entity.js';
import { QuizAttempt, QuizAttemptSchema } from './entities/quiz-attempt.entity.js';
import { Enrollment, EnrollmentSchema } from '../enrollments/entities/enrollment.entity.js';
import { QuizzesController } from './quizzes.controller.js';
import { QuizzesService } from './quizzes.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizQuestion.name, schema: QuizQuestionSchema },
      { name: QuizOption.name, schema: QuizOptionSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
