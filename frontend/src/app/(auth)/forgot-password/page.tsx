'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { authService } from '../../../services/auth.service';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  // Step 1: email input, Step 2: otp + new password, Step 3: success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      setInfoMessage(res.message || 'Verification code sent to your email.');
      setStep(2);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Unable to send verification code. Please verify your email.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError(null);
    setInfoMessage(null);
    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      setInfoMessage(res.message || 'A new code has been sent to your email.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setStep(3);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Failed to reset password. Please verify your OTP.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side Info Card */}
        <div className="lg:col-span-5 hidden lg:flex flex-col justify-between p-8 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-900 h-[480px]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">LearnX</span>
            </div>

            <div className="mt-8 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                Account Security & Recovery
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                Secure verification via email code.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Protecting your account and learning records is our top priority. We verify your identity
                using time-sensitive one-time codes.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct delivery to your registered email</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Instant expiration protection after 10 minutes</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Instant password update without email link delays</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="lg:col-span-7 w-full max-w-md mx-auto">
          <Card className="border border-slate-200 shadow-sm bg-white rounded-xl">
            {step === 1 && (
              <>
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    Forgot Password?
                  </CardTitle>
                  <CardDescription>
                    Enter your email to receive a 6-digit recovery code
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  {error && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-rose-700 font-medium">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <Input
                      label="Email address"
                      type="email"
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      leftIcon={<Mail className="w-4 h-4" />}
                      required
                    />

                    <Button
                      type="submit"
                      isLoading={isLoading}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm"
                    >
                      Send Verification Code
                    </Button>
                  </form>

                  <div className="text-center pt-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to sign in
                    </Link>
                  </div>
                </CardContent>
              </>
            )}

            {step === 2 && (
              <>
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2">
                    <Mail className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    Enter Verification Code
                  </CardTitle>
                  <CardDescription>
                    Code sent to <strong className="text-slate-800">{email}</strong>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  {infoMessage && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-700 font-medium">{infoMessage}</p>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-rose-700 font-medium">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center text-2xl tracking-[8px] font-mono font-bold py-2.5 px-4 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-indigo-700 bg-white shadow-sm"
                        required
                      />
                    </div>

                    <Input
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      leftIcon={<Lock className="w-4 h-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      required
                    />

                    <Input
                      label="Confirm New Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      leftIcon={<Lock className="w-4 h-4" />}
                      required
                    />

                    <Button
                      type="submit"
                      isLoading={isLoading}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm"
                    >
                      Reset Password
                    </Button>
                  </form>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Change Email
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:underline disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Resend Code
                    </button>
                  </div>
                </CardContent>
              </>
            )}

            {step === 3 && (
              <>
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    Password Reset!
                  </CardTitle>
                  <CardDescription>
                    Your password has been changed successfully.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-4 text-center">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    You can now sign in with your new credentials and continue your courses.
                  </p>

                  <Link href="/login" className="block">
                    <Button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm">
                      Go to Sign In
                    </Button>
                  </Link>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
