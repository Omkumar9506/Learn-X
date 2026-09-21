'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { LoginFormData, RegisterFormData, ProfileUpdateFormData } from '../schemas/auth.schema';
import { getErrorMessage } from '../lib/api-client';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated, isLoading, setAuth, logout, updateUser } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      queryClient.setQueryData(['currentUser'], data.user);
      router.push('/');
      router.refresh();
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) =>
      authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      queryClient.setQueryData(['currentUser'], data.user);
      router.push('/');
      router.refresh();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileUpdateFormData) => authService.updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.setQueryData(['currentUser'], updatedUser);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
  });

  // Query to revalidate / synchronize current user from server if token exists
  const userQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      if (!token) return null;
      try {
        const freshUser = await authService.getMe();
        updateUser(freshUser);
        return freshUser;
      } catch {
        logout();
        return null;
      }
    },
    enabled: !!token && !user,
    staleTime: 5 * 60 * 1000,
  });

  const handleLogout = () => {
    logout();
    queryClient.clear();
    router.push('/login');
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || userQuery.isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error ? getErrorMessage(loginMutation.error) : null,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error ? getErrorMessage(registerMutation.error) : null,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error ? getErrorMessage(updateProfileMutation.error) : null,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error ? getErrorMessage(changePasswordMutation.error) : null,
    updateUser,
    logout: handleLogout,
  };
}
