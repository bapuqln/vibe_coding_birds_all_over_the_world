import { create } from "zustand";
import type { AppStore } from "./types";
export type { AppStore, PanelType } from "./types";
import { createCoreSlice } from "./slices/coreSlice";
import { createDiscoverySlice } from "./slices/discoverySlice";
import { createProgressionSlice } from "./slices/progressionSlice";
import { createPhotoSlice } from "./slices/photoSlice";
import { createQuizSlice } from "./slices/quizSlice";
import { createSoundSlice } from "./slices/soundSlice";
import { createTourSlice } from "./slices/tourSlice";
import { createStorySlice } from "./slices/storySlice";
import { createAiGuideSlice } from "./slices/aiGuideSlice";
import { createEcosystemSlice } from "./slices/ecosystemSlice";
import { createMigrationSlice } from "./slices/migrationSlice";


export const useAppStore = create<AppStore>()((set, get, store) => ({
  ...createCoreSlice(set, get, store),
  ...createDiscoverySlice(set, get, store),
  ...createProgressionSlice(set, get, store),
  ...createPhotoSlice(set, get, store),
  ...createQuizSlice(set, get, store),
  ...createSoundSlice(set, get, store),
  ...createTourSlice(set, get, store),
  ...createStorySlice(set, get, store),
  ...createAiGuideSlice(set, get, store),
  ...createEcosystemSlice(set, get, store),
  ...createMigrationSlice(set, get, store),













  arViewerBirdId: null,












  arSessionActive: false,




  classroomModeActive: false,
  presentationMode: false,
  activeLessonId: null,
  lessonStepIndex: 0,

  sandboxModeActive: false,
  spawnedBirds: [],
  sandboxTimeHour: 12,

























  setARViewerBird: (arViewerBirdId) => set({ arViewerBirdId }),



























  setArSessionActive: (arSessionActive) => set({ arSessionActive }),




  setClassroomModeActive: (classroomModeActive) => set({ classroomModeActive }),
  setPresentationMode: (presentationMode) => set({ presentationMode }),
  setActiveLessonId: (activeLessonId) => set({ activeLessonId, lessonStepIndex: 0 }),
  setLessonStepIndex: (lessonStepIndex) => set({ lessonStepIndex }),
  nextLessonStep: () => set((state) => ({ lessonStepIndex: state.lessonStepIndex + 1 })),

  setSandboxModeActive: (sandboxModeActive) => set({ sandboxModeActive }),
  addSpawnedBird: (bird) =>
    set((state) => ({
      spawnedBirds: state.spawnedBirds.length < 50
        ? [...state.spawnedBirds, bird]
        : state.spawnedBirds,
    })),
  removeSpawnedBird: (id) =>
    set((state) => ({
      spawnedBirds: state.spawnedBirds.filter((b) => b.id !== id),
    })),
  clearSpawnedBirds: () => set({ spawnedBirds: [] }),
  setSandboxTimeHour: (sandboxTimeHour) => set({ sandboxTimeHour }),




















}));
