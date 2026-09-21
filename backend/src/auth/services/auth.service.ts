import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../users/entities/user.entity.js';
import { Instructor, InstructorDocument } from '../../instructors/entities/instructor.entity.js';
import { Otp, OtpDocument } from '../entities/otp.entity.js';
import { UserRole } from '../../common/constants/enums.js';
import { RegisterDto, LoginDto, ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto } from '../dto/auth.dto.js';
import { MailService } from '../../mail/mail.service.js';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Instructor.name)
    private readonly instructorModel: Model<InstructorDocument>,
    @InjectModel(Otp.name)
    private readonly otpModel: Model<OtpDocument>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.userModel.findOne({ email });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.userModel.create({
      name: dto.name,
      email,
      password: hashedPassword,
      role: UserRole.STUDENT,
    });

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.userModel.findOne({ email }).select('+password');

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken: token,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('No account found with this email address');
    }

    // Invalidate any previous OTPs for forgot_password
    await this.otpModel.deleteMany({ email, purpose: 'forgot_password' });

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.otpModel.create({
      email,
      otp,
      purpose: 'forgot_password',
      expiresAt,
    });

    await this.mailService.sendPasswordResetOtp(email, otp);

    return {
      message: 'A 6-digit verification code has been sent to your email.',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const email = dto.email.toLowerCase().trim();
    const record = await this.otpModel.findOne({
      email,
      otp: dto.otp,
      purpose: 'forgot_password',
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    return {
      message: 'Verification code verified successfully',
      valid: true,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.toLowerCase().trim();

    // Verify OTP
    const record = await this.otpModel.findOne({
      email,
      otp: dto.otp,
      purpose: 'forgot_password',
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Find User
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User account not found');
    }

    // Update password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.userModel.findByIdAndUpdate(user._id, { $set: { password: hashedPassword } });

    // Delete used OTP
    await this.otpModel.deleteMany({ email, purpose: 'forgot_password' });

    return {
      message: 'Password has been reset successfully. Please log in with your new password.',
    };
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId).populate('instructor');

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private generateToken(user: UserDocument | any): string {
    const payload: JwtPayload = {
      sub: user.id || (user._id ? user._id.toString() : ''),
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: UserDocument | any) {
    const plain = user.toObject ? user.toObject() : { ...user };
    delete plain.password;
    delete plain.__v;
    if (plain._id) {
      plain.id = plain._id.toString();
    }
    return plain;
  }
}
