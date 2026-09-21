import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { QuizzesService } from './quizzes.service.js';

@ApiTags('Quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post('course/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a quiz for a course' })
  async createQuiz(@Param('courseId') courseId: string, @Body() data: { title: string; description?: string; passingScore?: number }) {
    return this.quizzesService.createQuiz(courseId, data);
  }

  @Post(':quizId/questions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a question to a quiz' })
  async addQuestion(@Param('quizId') quizId: string, @Body() data: { question: string; options: Array<{ text: string; isCorrect: boolean }> }) {
    return this.quizzesService.addQuestion(quizId, data);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get quizzes for a course' })
  async getCourseQuizzes(@Param('courseId') courseId: string) {
    return this.quizzesService.getCourseQuizzes(courseId);
  }

  @Get(':quizId')
  @ApiOperation({ summary: 'Get a quiz (student view)' })
  async getQuiz(@Param('quizId') quizId: string) {
    return this.quizzesService.getQuizForStudent(quizId);
  }

  @Post(':quizId/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit quiz answers' })
  async submitAttempt(
    @CurrentUser('id') userId: string,
    @Param('quizId') quizId: string,
    @Body() data: { answers: Record<string, string> },
  ) {
    return this.quizzesService.submitAttempt(userId, quizId, data.answers);
  }

  @Get(':quizId/attempts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user quiz attempts' })
  async getUserAttempts(@CurrentUser('id') userId: string, @Param('quizId') quizId: string) {
    return this.quizzesService.getUserAttempts(userId, quizId);
  }
}
