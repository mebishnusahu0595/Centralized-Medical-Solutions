import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Role } from '../types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) => set({ 
        user, 
        accessToken, 
        isAuthenticated: true 
      }),

      setAccessToken: (accessToken) => set({ accessToken }),

      logout: () => set({ 
        user: null, 
        accessToken: null, 
        isAuthenticated: false 
      }),

      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
    }),
    {
      name: 'cms-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
