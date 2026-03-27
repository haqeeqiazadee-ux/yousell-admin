import { create } from 'zustand';

export interface EngineStatus {
  name: string;
  status: 'idle' | 'running' | 'paused' | 'error';
  healthy: boolean;
  lastRun: string | null;
  nextRun: string | null;
  score: number;
}

interface EngineState {
  engines: Record<string, EngineStatus>;
  lastUpdated: Date | null;
  updateEngine: (id: string, engine: EngineStatus) => void;
  updateAll: (engines: Record<string, EngineStatus>) => void;
  getEngine: (id: string) => EngineStatus | undefined;
}

export const useEngineStore = create<EngineState>()((set, get) => ({
  engines: {},
  lastUpdated: null,

  updateEngine: (id, engine) =>
    set((state) => ({
      engines: { ...state.engines, [id]: engine },
      lastUpdated: new Date(),
    })),

  updateAll: (engines) =>
    set({
      engines,
      lastUpdated: new Date(),
    }),

  getEngine: (id) => get().engines[id],
}));
