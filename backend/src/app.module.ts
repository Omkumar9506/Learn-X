import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// Feature Modules
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { InstructorsModule } from './instructors/instructors.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { CoursesModule } from './courses/courses.module.js';
import { CourseContentModule } from './course-content/course-content.module.js';
import { EnrollmentsModule } from './enrollments/enrollments.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { QuizzesModule } from './quizzes/quizzes.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { ProgressModule } from './progress/progress.module.js';
import { WishlistModule } from './wishlist/wishlist.module.js';
import { CertificatesModule } from './certificates/certificates.module.js';
import { CloudinaryModule } from './cloudinary/cloudinary.module.js';
import { AdminModule } from './admin/admin.module.js';
import { MailModule } from './mail/mail.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/learnx');
        return { uri };
      },
    }),
    AuthModule,
    UsersModule,
    InstructorsModule,
    CategoriesModule,
    CoursesModule,
    CourseContentModule,
    EnrollmentsModule,
    ReviewsModule,
    QuizzesModule,
    PaymentsModule,
    ProgressModule,
    WishlistModule,
    CertificatesModule,
    CloudinaryModule,
    AdminModule,
    MailModule,
  ],
})
export class AppModule {}
