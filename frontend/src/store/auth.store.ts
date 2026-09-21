import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user: User, token: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('learnx_token', token);
        }
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      updateUser: (updatedFields: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        }));
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('learnx_token');
          localStorage.removeItem('learnx_user');
        }
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'learnx_auth_storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
