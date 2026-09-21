'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../../../schemas/auth.schema';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn, loginError } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch {
      // handled by useAuth error state
    }
  };

  const fillAdminAccount = () => {
    setValue('email', 'admin@learnx.dev');
    setValue('password', 'Password123!');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand Value Proposition */}
        <div className="lg:col-span-6 hidden lg:flex flex-col justify-between p-8 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-900 h-[520px]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">LearnX</span>
            </div>

            <div className="mt-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Engineering Education Platform
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                Unlock your potential with industry-standard courses.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Join over 250,000 learners mastering software engineering, artificial intelligence,
                and high-impact technical architecture.
              </p>
            </div>
          </div>

          {/* Social Proof / Features */}
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Lifetime access to full course materials and future updates</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verifiable digital completion certificates</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Interactive coding quizzes and real-time assessments</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <Card className="border border-slate-200 shadow-sm bg-white rounded-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Welcome back
              </CardTitle>
              <CardDescription>
                Sign in to continue your learning journey
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-2">
              {loginError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 font-medium">
                    {loginError}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  placeholder="••••••••"
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

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Remember me
                  </label>
                  <Link
                    href="/forgot-password"
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  isLoading={isLoggingIn}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm"
                >
                  Sign In
                </Button>
              </form>

              {/* Quick Admin Demo Helper */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-700">Administrator Account</p>
                  <p className="text-[11px] text-slate-500">admin@learnx.dev</p>
                </div>
                <button
                  type="button"
                  onClick={fillAdminAccount}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs shadow-sm"
                >
                  Fill Admin
                </button>
              </div>

              <div className="text-center text-xs text-slate-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Create account
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
