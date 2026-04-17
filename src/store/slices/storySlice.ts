import type { StateCreator } from "zustand";
import type { StoryPlayState } from "../../types";
import type { AppStore } from "../types";
import {
  COMPLETED_STORIES_KEY,
  STORY_KEY,
  loadFromStorage,
  saveToStorage,
} from "../persistence";

export interface StorySlice {
  storyExplorerOpen: boolean;
  storyProgress: Record<string, string[]>;
  storyModeActive: boolean;
  storyPlayState: StoryPlayState;
  activeStoryId: string | null;
  storyStepIndex: number;
  storyHighlightBirdId: string | null;
  completedStories: string[];

  setStoryExplorerOpen: (open: boolean) => void;
  markStoryBirdDiscovered: (storyId: string, birdId: string) => void;
  setStoryModeActive: (active: boolean) => void;
  startStoryAdventure: (storyId: string) => void;
  nextStoryStep: () => void;
  pauseStoryAdventure: () => void;
  resumeStoryAdventure: () => void;
  exitStoryAdventure: () => void;
  completeStoryAdventure: () => void;
}

export const createStorySlice: StateCreator<AppStore, [], [], StorySlice> = (
  set,
  get,
) => ({
  storyExplorerOpen: false,
  storyProgress: loadFromStorage<Record<string, string[]>>(STORY_KEY, {}),
  storyModeActive: false,
  storyPlayState: "idle" as StoryPlayState,
  activeStoryId: null,
  storyStepIndex: 0,
  storyHighlightBirdId: null,
  completedStories: loadFromStorage<string[]>(COMPLETED_STORIES_KEY, []),

  setStoryExplorerOpen: (storyExplorerOpen) => set({ storyExplorerOpen }),

  markStoryBirdDiscovered: (storyId, birdId) => {
    const state = get();
    const current = state.storyProgress[storyId] || [];
    if (current.includes(birdId)) return;
    const updated = {
      ...state.storyProgress,
      [storyId]: [...current, birdId],
    };
    saveToStorage(STORY_KEY, updated);
    set({ storyProgress: updated });
  },

  setStoryModeActive: (storyModeActive) => set({ storyModeActive }),

  startStoryAdventure: (storyId) =>
    set({
      storyModeActive: true,
      storyPlayState: "playing",
      activeStoryId: storyId,
      storyStepIndex: 0,
      storyHighlightBirdId: null,
    }),

  nextStoryStep: () =>
    set((state) => ({
      storyStepIndex: state.storyStepIndex + 1,
      storyHighlightBirdId: null,
    })),

  pauseStoryAdventure: () => set({ storyPlayState: "paused" }),
  resumeStoryAdventure: () => set({ storyPlayState: "playing" }),

  exitStoryAdventure: () =>
    set({
      storyModeActive: false,
      storyPlayState: "idle",
      activeStoryId: null,
      storyStepIndex: 0,
      storyHighlightBirdId: null,
    }),

  completeStoryAdventure: () => {
    const state = get();
    if (!state.activeStoryId) return;
    const updated = state.completedStories.includes(state.activeStoryId)
      ? state.completedStories
      : [...state.completedStories, state.activeStoryId];
    saveToStorage(COMPLETED_STORIES_KEY, updated);
    set({
      storyPlayState: "complete",
      completedStories: updated,
    });
  },
});
