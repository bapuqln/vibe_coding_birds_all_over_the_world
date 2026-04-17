import type { StateCreator } from "zustand";
import type { JourneyProgress, TimeState } from "../../types";
import type { AppStore } from "../types";
import { createInitialTimeState } from "../../core/TimeController";
import {
  JOURNEY_PROGRESS_KEY,
  VISITED_STOPS_KEY,
  loadFromStorage,
  saveToStorage,
} from "../persistence";

export interface MigrationSlice {
  migrationModeActive: boolean;
  showAllRoutes: boolean;
  migrationSpeed: number;
  timeState: TimeState;
  migrationInfoPathIndex: number | null;
  activeJourneyId: string | null;
  journeyProgress: JourneyProgress[];
  visitedStops: string[];
  journeyPanelOpen: boolean;

  setMigrationModeActive: (active: boolean) => void;
  setShowAllRoutes: (show: boolean) => void;
  setMigrationSpeed: (speed: number) => void;
  setTimeState: (state: TimeState) => void;
  playTimeline: () => void;
  pauseTimeline: () => void;
  setTimeMonth: (month: number) => void;
  setTimeSpeed: (speed: number) => void;
  scrubTimeline: (progress: number) => void;
  setMigrationInfoPathIndex: (index: number | null) => void;
  setActiveJourney: (id: string | null) => void;
  visitStop: (journeyId: string, stopId: string) => void;
  completeJourney: (journeyId: string) => void;
  setJourneyPanelOpen: (open: boolean) => void;
}

export const createMigrationSlice: StateCreator<
  AppStore,
  [],
  [],
  MigrationSlice
> = (set, get) => ({
  migrationModeActive: false,
  showAllRoutes: false,
  migrationSpeed: 1,
  timeState: createInitialTimeState(),
  migrationInfoPathIndex: null,
  activeJourneyId: null,
  journeyProgress: loadFromStorage<JourneyProgress[]>(JOURNEY_PROGRESS_KEY, []),
  visitedStops: loadFromStorage<string[]>(VISITED_STOPS_KEY, []),
  journeyPanelOpen: false,

  setMigrationModeActive: (migrationModeActive) =>
    set({ migrationModeActive }),
  setShowAllRoutes: (showAllRoutes) => set({ showAllRoutes }),
  setMigrationSpeed: (migrationSpeed) => set({ migrationSpeed }),
  setTimeState: (timeState) => set({ timeState }),
  playTimeline: () =>
    set((s) => ({ timeState: { ...s.timeState, isPlaying: true } })),
  pauseTimeline: () =>
    set((s) => ({ timeState: { ...s.timeState, isPlaying: false } })),
  setTimeMonth: (month) =>
    set((s) => ({ timeState: { ...s.timeState, month, progress: 0 } })),
  setTimeSpeed: (speed) =>
    set((s) => ({ timeState: { ...s.timeState, speed } })),
  scrubTimeline: (progress) =>
    set((s) => ({ timeState: { ...s.timeState, progress } })),
  setMigrationInfoPathIndex: (migrationInfoPathIndex) =>
    set({ migrationInfoPathIndex }),

  setActiveJourney: (activeJourneyId) => set({ activeJourneyId }),

  visitStop: (journeyId, stopId) => {
    const state = get();
    const visitedStops = state.visitedStops.includes(stopId)
      ? state.visitedStops
      : [...state.visitedStops, stopId];
    saveToStorage(VISITED_STOPS_KEY, visitedStops);

    const existing = state.journeyProgress.find(
      (p) => p.journeyId === journeyId,
    );
    let journeyProgress: JourneyProgress[];
    if (existing) {
      journeyProgress = state.journeyProgress.map((p) =>
        p.journeyId === journeyId
          ? {
              ...p,
              visitedStopIds: p.visitedStopIds.includes(stopId)
                ? p.visitedStopIds
                : [...p.visitedStopIds, stopId],
            }
          : p,
      );
    } else {
      journeyProgress = [
        ...state.journeyProgress,
        {
          journeyId,
          visitedStopIds: [stopId],
          discoveredBirdIds: [],
          completed: false,
        },
      ];
    }
    saveToStorage(JOURNEY_PROGRESS_KEY, journeyProgress);
    set({ visitedStops, journeyProgress });
  },

  completeJourney: (journeyId) => {
    const state = get();
    const journeyProgress = state.journeyProgress.map((p) =>
      p.journeyId === journeyId
        ? { ...p, completed: true, completedAt: Date.now() }
        : p,
    );
    saveToStorage(JOURNEY_PROGRESS_KEY, journeyProgress);
    set({ journeyProgress });
  },

  setJourneyPanelOpen: (journeyPanelOpen) => set({ journeyPanelOpen }),
});
