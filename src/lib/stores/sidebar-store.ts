import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isOpen: boolean;
  activeGroup: string | null;
  isCollapsed: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setActiveGroup: (group: string | null) => void;
  toggleCollapse: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      activeGroup: null,
      isCollapsed: false,

      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setActiveGroup: (group) => set({ activeGroup: group }),
      toggleCollapse: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),
    }),
    {
      name: 'yousell-sidebar',
    },
  ),
);
