'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  profileUpdateSchema,
  ProfileUpdateFormData,
  changePasswordSchema,
  ChangePasswordFormData,
} from '../../../schemas/auth.schema';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import {
  User as UserIcon,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Camera,
} from 'lucide-react';

export default function ProfilePage() {
  const {
    user,
    isAuthenticated,
    updateProfile,
    isUpdatingProfile,
    changePassword,
    isChangingPassword,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
    },
  });

  // Keep form in sync when user data loads
  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        bio: user.bio || '',
      });
    }
  }, [user, resetProfile]);

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onProfileSubmit = async (data: ProfileUpdateFormData) => {
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);
    try {
      await updateProfile(data);
      setProfileSuccessMsg('Profile updated successfully!');
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    } catch {
      setProfileErrorMsg('Failed to update profile. Please try again.');
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setPasswordSuccessMsg(null);
    setPasswordErrorMsg(null);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordSuccessMsg('Password changed successfully!');
      resetPassword();
      setTimeout(() => setPasswordSuccessMsg(null), 4000);
    } catch {
      setPasswordErrorMsg('Failed to change password. Please check your current password.');
    }
  };

  if (!isAuthenticated && !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center bg-white">
        <h2 className="text-xl font-bold text-slate-900">Please log in to view your profile settings.</h2>
        <a href="/login" className="mt-4 inline-block">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Log In</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your personal details, profile picture, and security preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Sidebar Navigation */}
          <div className="md:col-span-4 space-y-4">
            <Card className="p-6 text-center bg-white border border-slate-200 shadow-sm rounded-xl">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xl overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow transition-colors"
                  title="Change avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="font-semibold text-base text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>

              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Shield className="w-3 h-3" />
                  {user?.role}
                </span>
              </div>
            </Card>

            {/* Navigation Tabs */}
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium rounded-lg text-left transition ${
                  activeTab === 'profile'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Personal Info
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium rounded-lg text-left transition ${
                  activeTab === 'password'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Lock className="w-4 h-4" />
                Password & Security
              </button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="md:col-span-8">
            {activeTab === 'profile' && (
              <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your public display name and biography.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5 pt-2">
                  {profileSuccessMsg && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="text-xs font-medium text-emerald-700">
                        {profileSuccessMsg}
                      </p>
                    </div>
                  )}

                  {profileErrorMsg && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <p className="text-xs font-medium text-rose-700">
                        {profileErrorMsg}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
                    <Input
                      label="Full Name"
                      error={profileErrors.name?.message}
                      {...registerProfile('name')}
                    />

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                        Biography / Headline
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tell the LearnX community a little about your background, expertise, or learning goals..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
                        {...registerProfile('bio')}
                      />
                      {profileErrors.bio && (
                        <p className="text-xs text-rose-600 mt-1">{profileErrors.bio.message}</p>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        isLoading={isUpdatingProfile}
                        className="px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'password' && (
              <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Ensure your account is using a long, random password to stay secure.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5 pt-2">
                  {passwordSuccessMsg && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="text-xs font-medium text-emerald-700">
                        {passwordSuccessMsg}
                      </p>
                    </div>
                  )}

                  {passwordErrorMsg && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <p className="text-xs font-medium text-rose-700">
                        {passwordErrorMsg}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      placeholder="••••••••"
                      error={passwordErrors.currentPassword?.message}
                      {...registerPassword('currentPassword')}
                    />

                    <Input
                      label="New Password"
                      type="password"
                      placeholder="At least 6 characters"
                      error={passwordErrors.newPassword?.message}
                      {...registerPassword('newPassword')}
                    />

                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="Re-enter new password"
                      error={passwordErrors.confirmNewPassword?.message}
                      {...registerPassword('confirmNewPassword')}
                    />

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        isLoading={isChangingPassword}
                        className="px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                      >
                        Update Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
