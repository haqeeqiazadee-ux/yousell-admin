import { create } from 'zustand';

export interface AlertConfig {
  scoreChange: boolean;
  viralVideo: boolean;
  adSpike: boolean;
  competitorLaunch: boolean;
  priceChange: boolean;
  preViral: boolean;
  method: 'in-app' | 'email' | 'both';
}

interface WatchlistState {
  items: string[];
  alertConfigs: Record<string, AlertConfig>;
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  setAlertConfig: (id: string, config: AlertConfig) => void;
  isWatched: (id: string) => boolean;
}

const defaultAlertConfig: AlertConfig = {
  scoreChange: true,
  viralVideo: true,
  adSpike: false,
  competitorLaunch: true,
  priceChange: true,
  preViral: false,
  method: 'in-app',
};

export const useWatchlistStore = create<WatchlistState>()((set, get) => ({
  items: [],
  alertConfigs: {},

  addItem: (id) =>
    set((state) => ({
      items: state.items.includes(id) ? state.items : [...state.items, id],
      alertConfigs: {
        ...state.alertConfigs,
        [id]: state.alertConfigs[id] ?? { ...defaultAlertConfig },
      },
    })),

  removeItem: (id) =>
    set((state) => {
      const { [id]: _, ...remainingConfigs } = state.alertConfigs;
      return {
        items: state.items.filter((item) => item !== id),
        alertConfigs: remainingConfigs,
      };
    }),

  setAlertConfig: (id, config) =>
    set((state) => ({
      alertConfigs: {
        ...state.alertConfigs,
        [id]: config,
      },
    })),

  isWatched: (id) => get().items.includes(id),
}));
