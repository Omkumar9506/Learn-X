import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john@example.com', description: 'User account email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP received via email' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit number' })
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit number' })
  otp: string;

  @ApiProperty({ example: 'NewSecretPass123!', description: 'New account password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  newPassword: string;
}
