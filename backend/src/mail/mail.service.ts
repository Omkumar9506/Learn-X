import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true';
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    this.fromAddress = this.configService.get<string>('SMTP_FROM', '"LearnX" <no-reply@learnx.dev>');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure,
        auth: { user, pass },
      });
      this.logger.log(`SMTP Mail Transporter initialized with host: ${host}:${port}`);
    } else {
      this.logger.warn(
        'SMTP credentials not fully configured in .env. Emails will be logged to console in Development mode.',
      );
    }
  }

  async sendPasswordResetOtp(email: string, otp: string): Promise<boolean> {
    const subject = 'Your LearnX Password Reset OTP Code';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LearnX - Password Reset</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 520px; margin: 30px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 32px 24px; text-align: center; }
          .logo { font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin: 0; }
          .logo span { color: #a5b4fc; }
          .body { padding: 32px 28px; }
          .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
          .text { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .otp-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; margin: 0; }
          .expiry { font-size: 13px; color: #64748b; margin-top: 10px; margin-bottom: 0; }
          .footer { padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">Learn<span>X</span></h1>
          </div>
          <div class="body">
            <h2 class="title">Reset Your Password</h2>
            <p class="text">We received a request to reset your password. Use the verification code below to verify your identity and set a new password:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <p class="expiry">Expires in <strong>10 minutes</strong></p>
            </div>
            <p class="text">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} LearnX Learning Management System. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    // Console banner for instant testing/debugging
    console.log('\n========================================================');
    console.log('📬  [LearnX EMAIL SERVICE - OTP NOTIFICATION]');
    console.log(`➡️  To:       ${email}`);
    console.log(`🔑  OTP Code: ${otp}`);
    console.log('⏱️   Validity: 10 minutes');
    console.log('========================================================\n');

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromAddress,
          to: email,
          subject,
          html: htmlContent,
        });
        this.logger.log(`Password reset OTP email sent successfully to ${email}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to send email via SMTP to ${email}:`, error);
        return false;
      }
    }

    return true;
  }
}
