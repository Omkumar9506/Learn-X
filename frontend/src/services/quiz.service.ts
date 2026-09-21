import { apiClient } from '../lib/api-client';

export interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  explanation?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface QuizResult {
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  feedback: { questionId: string; isCorrect: boolean; correctOptionId?: string; explanation?: string }[];
}

export const MOCK_QUIZ: Quiz = {
  id: 'quiz-1',
  courseId: 'course-1',
  title: 'Milestone Assessment: Next.js 15 & NestJS Architecture',
  description: 'Test your understanding of Server Components, NestJS dependency injection, and TypeORM relations.',
  passingScore: 70,
  questions: [
    {
      id: 'q1',
      question: 'Which of the following is true regarding Next.js 15 React Server Components (RSC)?',
      options: [
        { id: 'opt1_1', text: 'Server Components include client-side event handlers like onClick' },
        { id: 'opt1_2', text: 'Server Components execute only on the server and send zero JavaScript to the client bundle' },
        { id: 'opt1_3', text: 'Server Components require useState and useEffect hooks' },
        { id: 'opt1_4', text: 'Server Components cannot fetch data asynchronously' },
      ],
      explanation: 'Server Components execute exclusively on the server, streaming pre-rendered HTML/RSC payloads without inflating the client bundle size.',
    },
    {
      id: 'q2',
      question: 'In NestJS, what decorator is used to inject a TypeORM repository into a service?',
      options: [
        { id: 'opt2_1', text: '@InjectRepository(Entity)' },
        { id: 'opt2_2', text: '@InjectEntity(Entity)' },
        { id: 'opt2_3', text: '@Repository(Entity)' },
        { id: 'opt2_4', text: '@Injectable(Entity)' },
      ],
      explanation: '@InjectRepository(Entity) from @nestjs/typeorm binds the TypeORM Repository token for the given entity.',
    },
    {
      id: 'q3',
      question: 'When should you use database indexes on PostgreSQL foreign key columns?',
      options: [
        { id: 'opt3_1', text: 'Never, because PostgreSQL indexes are automatic on all columns' },
        { id: 'opt3_2', text: 'Only on string columns with more than 10,000 characters' },
        { id: 'opt3_3', text: 'Always, to optimize JOIN queries, foreign key lookups, and avoid sequential table scans' },
        { id: 'opt3_4', text: 'Only on SQLite databases' },
      ],
      explanation: 'PostgreSQL does not automatically create indexes on foreign keys; indexing foreign keys prevents full table scans during JOIN operations.',
    },
    {
      id: 'q4',
      question: 'What is the primary difference between Authentication and Authorization?',
      options: [
        { id: 'opt4_1', text: 'They are identical and used interchangeably' },
        { id: 'opt4_2', text: 'Authentication verifies identity (who you are); Authorization verifies permissions (what you are allowed to do)' },
        { id: 'opt4_3', text: 'Authentication requires PostgreSQL, while Authorization requires Redis' },
        { id: 'opt4_4', text: 'Authorization happens before Authentication' },
      ],
      explanation: 'Authentication establishes identity (e.g. through JWT or passwords); Authorization evaluates roles and permissions.',
    },
  ],
};

export const quizService = {
  async getQuiz(quizId: string): Promise<Quiz> {
    try {
      const response = await apiClient.get<Quiz>(`/quizzes/${quizId}`);
      if (response.data) return response.data;
    } catch {
      // Fallback
    }
    return MOCK_QUIZ;
  },

  async submitQuiz(quizId: string, answers: Record<string, string>): Promise<QuizResult> {
    try {
      const response = await apiClient.post<QuizResult>(`/quizzes/${quizId}/submit`, { answers });
      return response.data;
    } catch {
      // Client-side evaluation fallback
      const correctAnswersMap: Record<string, string> = {
        q1: 'opt1_2',
        q2: 'opt2_1',
        q3: 'opt3_3',
        q4: 'opt4_2',
      };

      let correctCount = 0;
      const feedback = Object.entries(answers).map(([qId, selectedOpt]) => {
        const isCorrect = correctAnswersMap[qId] === selectedOpt;
        if (isCorrect) correctCount++;
        return {
          questionId: qId,
          isCorrect,
          correctOptionId: correctAnswersMap[qId],
          explanation: MOCK_QUIZ.questions.find((q) => q.id === qId)?.explanation,
        };
      });

      const totalQuestions = MOCK_QUIZ.questions.length;
      const score = Math.round((correctCount / totalQuestions) * 100);

      return {
        score,
        passed: score >= MOCK_QUIZ.passingScore,
        totalQuestions,
        correctAnswers: correctCount,
        feedback,
      };
    }
  },
};
