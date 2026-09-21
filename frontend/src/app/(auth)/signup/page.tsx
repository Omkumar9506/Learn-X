'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '../../../schemas/auth.schema';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, GraduationCap } from 'lucide-react';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: signup, isRegistering, registerError } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await signup(data);
    } catch {
      // Handled by useAuth error state
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Value proposition */}
        <div className="lg:col-span-6 hidden lg:flex flex-col justify-between p-8 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-900 h-[560px]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">LearnX</span>
            </div>

            <div className="mt-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Zero Risk, Lifelong Learning
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                Start learning with the most respected instructors in tech.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Create a free account to browse thousands of comprehensive courses, save your
                favorites, and track your progress across all devices.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full access to free previews on every published course</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Personalized recommendations tailored to your goals</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Eligible to apply for instructor status anytime</span>
            </div>
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <Card className="border border-slate-200 shadow-sm bg-white rounded-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Create your account
              </CardTitle>
              <CardDescription>
                Join LearnX today — it takes less than 30 seconds
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              {registerError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 font-medium">
                    {registerError}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <Input
                  label="Full name"
                  placeholder="Alex Johnson"
                  leftIcon={<UserIcon className="w-4 h-4" />}
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Input
                  label="Email address"
                  type="email"
                  placeholder="alex@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
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
                  error={errors.password?.message}
                  {...register('password')}
                />

                <Input
                  label="Confirm password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                {/* Password strength indicator */}
                {passwordValue.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="font-medium">Length:</span>
                    <span
                      className={
                        passwordValue.length >= 6 ? 'text-emerald-700 font-semibold' : 'text-amber-700'
                      }
                    >
                      {passwordValue.length >= 6 ? '✓ Sufficient' : 'Minimum 6 characters'}
                    </span>
                  </div>
                )}

                <div className="text-[11px] text-slate-500">
                  By clicking Create Account, you agree to our{' '}
                  <Link href="/terms" className="text-indigo-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-indigo-600 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </div>

                <Button
                  type="submit"
                  isLoading={isRegistering}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm"
                >
                  Create Account
                </Button>
              </form>

              <div className="text-center text-xs text-slate-600 pt-1">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
