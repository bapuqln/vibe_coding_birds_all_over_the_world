import type { StateCreator } from "zustand";
import type { SpawnedBird } from "../../types";
import type { AppStore } from "../types";

export interface SpecialModesSlice {
  classroomModeActive: boolean;
  presentationMode: boolean;
  activeLessonId: string | null;
  lessonStepIndex: number;
  sandboxModeActive: boolean;
  spawnedBirds: SpawnedBird[];
  sandboxTimeHour: number;
  arViewerBirdId: string | null;
  arSessionActive: boolean;

  setClassroomModeActive: (active: boolean) => void;
  setPresentationMode: (active: boolean) => void;
  setActiveLessonId: (id: string | null) => void;
  setLessonStepIndex: (index: number) => void;
  nextLessonStep: () => void;
  setSandboxModeActive: (active: boolean) => void;
  addSpawnedBird: (bird: SpawnedBird) => void;
  removeSpawnedBird: (id: string) => void;
  clearSpawnedBirds: () => void;
  setSandboxTimeHour: (hour: number) => void;
  setARViewerBird: (birdId: string | null) => void;
  setArSessionActive: (active: boolean) => void;
}

export const createSpecialModesSlice: StateCreator<
  AppStore,
  [],
  [],
  SpecialModesSlice
> = (set) => ({
  classroomModeActive: false,
  presentationMode: false,
  activeLessonId: null,
  lessonStepIndex: 0,
  sandboxModeActive: false,
  spawnedBirds: [],
  sandboxTimeHour: 12,
  arViewerBirdId: null,
  arSessionActive: false,

  setClassroomModeActive: (classroomModeActive) =>
    set({ classroomModeActive }),
  setPresentationMode: (presentationMode) => set({ presentationMode }),
  setActiveLessonId: (activeLessonId) =>
    set({ activeLessonId, lessonStepIndex: 0 }),
  setLessonStepIndex: (lessonStepIndex) => set({ lessonStepIndex }),
  nextLessonStep: () =>
    set((state) => ({ lessonStepIndex: state.lessonStepIndex + 1 })),

  setSandboxModeActive: (sandboxModeActive) => set({ sandboxModeActive }),
  addSpawnedBird: (bird) =>
    set((state) => ({
      spawnedBirds:
        state.spawnedBirds.length < 50
          ? [...state.spawnedBirds, bird]
          : state.spawnedBirds,
    })),
  removeSpawnedBird: (id) =>
    set((state) => ({
      spawnedBirds: state.spawnedBirds.filter((b) => b.id !== id),
    })),
  clearSpawnedBirds: () => set({ spawnedBirds: [] }),
  setSandboxTimeHour: (sandboxTimeHour) => set({ sandboxTimeHour }),

  setARViewerBird: (arViewerBirdId) => set({ arViewerBirdId }),
  setArSessionActive: (arSessionActive) => set({ arSessionActive }),
});
