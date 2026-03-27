import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
  plan: string;
  fullName: string;
  avatarUrl: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user, isLoading: false }),
  clearUser: () => set({ user: null }),
  setLoading: (isLoading) => set({ isLoading }),
}));
