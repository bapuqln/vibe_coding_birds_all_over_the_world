import type { StateCreator } from "zustand";
import type { TourState } from "../../types";
import type { AppStore } from "../types";

export interface TourSlice {
  tourState: TourState;
  tourStep: number;
  startTour: () => void;
  pauseTour: () => void;
  resumeTour: () => void;
  nextTourStep: () => void;
  endTour: () => void;
}

export const createTourSlice: StateCreator<AppStore, [], [], TourSlice> = (
  set,
) => ({
  tourState: "idle",
  tourStep: 0,

  startTour: () => set({ tourState: "intro", tourStep: 0 }),
  pauseTour: () => set({ tourState: "paused" }),
  resumeTour: () => set({ tourState: "touring" }),
  nextTourStep: () =>
    set((state) => ({ tourStep: state.tourStep + 1, tourState: "touring" })),
  endTour: () => set({ tourState: "idle", tourStep: 0 }),
});
