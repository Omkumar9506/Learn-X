import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from '../users/entities/user.entity.js';
import { Instructor, InstructorSchema } from '../instructors/entities/instructor.entity.js';
import { Otp, OtpSchema } from './entities/otp.entity.js';
import { MailModule } from '../mail/mail.module.js';
import { AuthController } from './controllers/auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: Otp.name, schema: OtpSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'dev-secret',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '7d') as any,
        },
      }),
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule, PassportModule],
})
export class AuthModule {}
