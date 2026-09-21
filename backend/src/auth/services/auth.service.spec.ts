import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service.js';
import { UserRole } from '../../common/constants/enums.js';
import { ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserModel: any;
  let mockInstructorModel: any;
  let mockOtpModel: any;
  let mockJwtService: any;
  let mockMailService: any;

  beforeEach(() => {
    mockUserModel = {
      findOne: vi.fn(),
      create: vi.fn((dto) => Promise.resolve({ id: 'u-123', ...dto })),
      findById: vi.fn(),
      findByIdAndUpdate: vi.fn().mockResolvedValue({}),
    };

    mockInstructorModel = {
      findOne: vi.fn(),
    };

    mockOtpModel = {
      findOne: vi.fn(),
      create: vi.fn((dto) => Promise.resolve({ id: 'otp-123', ...dto })),
      deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    };

    mockJwtService = {
      sign: vi.fn(() => 'mock_jwt_token_xyz'),
    };

    mockMailService = {
      sendPasswordResetOtp: vi.fn().mockResolvedValue(true),
    };

    authService = new AuthService(
      mockUserModel,
      mockInstructorModel,
      mockOtpModel,
      mockJwtService,
      mockMailService,
    );
  });

  describe('register', () => {
    it('should register a new student and return a signed JWT token', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await authService.register({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!',
      });

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'jane@example.com' });
      expect(mockUserModel.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('mock_jwt_token_xyz');
      expect(result.user.email).toBe('jane@example.com');
      expect(result.user.name).toBe('Jane Doe');
      expect((result.user as any).password).toBeUndefined();
    });

    it('should throw ConflictException if email is already registered', async () => {
      mockUserModel.findOne.mockResolvedValue({ id: 'existing-id', email: 'jane@example.com' });

      await expect(
        authService.register({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      mockUserModel.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          id: 'u-123',
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: hashedPassword,
          role: UserRole.STUDENT,
          isActive: true,
        }),
      });

      const result = await authService.login({
        email: 'jane@example.com',
        password: 'Password123!',
      });

      expect(result.accessToken).toBe('mock_jwt_token_xyz');
      expect(result.user.email).toBe('jane@example.com');
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      mockUserModel.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      });

      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword!', 10);
      mockUserModel.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          id: 'u-123',
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: hashedPassword,
          role: UserRole.STUDENT,
          isActive: true,
        }),
      });

      await expect(
        authService.login({
          email: 'jane@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should generate OTP and send email if account exists', async () => {
      mockUserModel.findOne.mockResolvedValue({ id: 'u-123', email: 'jane@example.com' });

      const res = await authService.forgotPassword({ email: 'jane@example.com' });

      expect(mockOtpModel.deleteMany).toHaveBeenCalled();
      expect(mockOtpModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'jane@example.com',
          purpose: 'forgot_password',
        }),
      );
      expect(mockMailService.sendPasswordResetOtp).toHaveBeenCalledWith(
        'jane@example.com',
        expect.stringMatching(/^\d{6}$/),
      );
      expect(res.message).toContain('6-digit verification code');
    });

    it('should throw NotFoundException if account does not exist', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        authService.forgotPassword({ email: 'nonexistent@example.com' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully if valid and not expired', async () => {
      mockOtpModel.findOne.mockResolvedValue({ email: 'jane@example.com', otp: '123456' });

      const res = await authService.verifyOtp({ email: 'jane@example.com', otp: '123456' });
      expect(res.valid).toBe(true);
    });

    it('should throw BadRequestException if OTP is invalid or expired', async () => {
      mockOtpModel.findOne.mockResolvedValue(null);

      await expect(
        authService.verifyOtp({ email: 'jane@example.com', otp: '999999' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid OTP', async () => {
      mockOtpModel.findOne.mockResolvedValue({ email: 'jane@example.com', otp: '123456' });
      mockUserModel.findOne.mockResolvedValue({ _id: 'u-123', email: 'jane@example.com' });

      const res = await authService.resetPassword({
        email: 'jane@example.com',
        otp: '123456',
        newPassword: 'NewSecurePassword123!',
      });

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(mockOtpModel.deleteMany).toHaveBeenCalled();
      expect(res.message).toContain('Password has been reset successfully');
    });
  });
});
