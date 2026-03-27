import { create } from 'zustand';

interface FilterState {
  filters: Record<string, Record<string, string>>;
  setFilter: (page: string, key: string, value: string) => void;
  clearFilters: (page: string) => void;
  getFilters: (page: string) => Record<string, string>;
}

export const useFilterStore = create<FilterState>()((set, get) => ({
  filters: {},

  setFilter: (page, key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [page]: {
          ...state.filters[page],
          [key]: value,
        },
      },
    })),

  clearFilters: (page) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [page]: {},
      },
    })),

  getFilters: (page) => get().filters[page] ?? {},
}));
