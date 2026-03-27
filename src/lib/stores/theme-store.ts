import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  highContrast: boolean;
  setTheme: (theme: Theme) => void;
  toggleHighContrast: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      highContrast: false,

      setTheme: (theme) => set({ theme }),

      toggleHighContrast: () =>
        set((state) => {
          const next = !state.highContrast;
          if (typeof document !== 'undefined') {
            if (next) {
              document.documentElement.classList.add('high-contrast');
            } else {
              document.documentElement.classList.remove('high-contrast');
            }
          }
          return { highContrast: next };
        }),
    }),
    {
      name: 'yousell-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.highContrast && typeof document !== 'undefined') {
          document.documentElement.classList.add('high-contrast');
        }
      },
    },
  ),
);
