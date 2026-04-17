import { create } from "zustand";
import type {
  JourneyProgress,
  TTSStatus,
} from "../types";
import { createInitialTimeState } from "../core/TimeController";
import {
  loadFromStorage,
  saveToStorage,
  JOURNEY_PROGRESS_KEY,
  VISITED_STOPS_KEY,
} from "./persistence";
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


export const useAppStore = create<AppStore>()((set, get, store) => ({
  ...createCoreSlice(set, get, store),
  ...createDiscoverySlice(set, get, store),
  ...createProgressionSlice(set, get, store),
  ...createPhotoSlice(set, get, store),
  ...createQuizSlice(set, get, store),
  ...createSoundSlice(set, get, store),
  ...createTourSlice(set, get, store),
  ...createStorySlice(set, get, store),


  showAllRoutes: false,






  migrationModeActive: false,





  arViewerBirdId: null,










  aiGuideOpen: false,
  aiGuideQuestion: null,
  aiGuideAnswer: null,

  birdExplanation: null,
  birdExplanationLoading: false,
  ttsStatus: "idle" as TTSStatus,

  arSessionActive: false,


  activeBiome: null,
  biomeAudioEnabled: true,

  migrationSpeed: 1,

  classroomModeActive: false,
  presentationMode: false,
  activeLessonId: null,
  lessonStepIndex: 0,

  sandboxModeActive: false,
  spawnedBirds: [],
  sandboxTimeHour: 12,


  currentSeason: "spring",
  ecosystemState: {
    season: "spring",
    temperature: 20,
    wind: 5,
    timeOfDay: "morning",
  },

  activeHabitatFilters: [],




  ecosystemPanelOpen: false,
  ecosystemManualOverride: false,



  activeJourneyId: null,
  journeyProgress: loadFromStorage<JourneyProgress[]>(JOURNEY_PROGRESS_KEY, []),
  visitedStops: loadFromStorage<string[]>(VISITED_STOPS_KEY, []),
  journeyPanelOpen: false,

  timeState: createInitialTimeState(),
  migrationInfoPathIndex: null,




  setShowAllRoutes: (showAllRoutes) => set({ showAllRoutes }),






  setMigrationModeActive: (migrationModeActive) => set({ migrationModeActive }),




  setARViewerBird: (arViewerBirdId) => set({ arViewerBirdId }),

























  setAiGuideOpen: (aiGuideOpen) => set({ aiGuideOpen }),
  setAiGuideQuestion: (aiGuideQuestion) => set({ aiGuideQuestion }),
  setAiGuideAnswer: (aiGuideAnswer) => set({ aiGuideAnswer }),

  requestBirdExplanation: (birdId) => {
    set({ birdExplanationLoading: true, birdExplanation: null });
    import("../features/KnowledgeService").then(({ queryBirdExplanation }) => {
      queryBirdExplanation(birdId).then((result) => {
        set({
          birdExplanation: result,
          birdExplanationLoading: false,
          aiGuideOpen: true,
        });
      }).catch(() => {
        set({ birdExplanationLoading: false });
      });
    });
  },
  clearBirdExplanation: () =>
    set({ birdExplanation: null, birdExplanationLoading: false }),
  speakExplanation: () => {
    const { birdExplanation, language } = get();
    if (!birdExplanation) return;
    import("../features/tts-service").then(({ speak }) => {
      const text = language === "zh" ? birdExplanation.textZh : birdExplanation.text;
      const status = speak(text, language, () => set({ ttsStatus: "idle" }));
      set({ ttsStatus: status });
    });
  },
  stopSpeaking: () => {
    import("../features/tts-service").then(({ stop }) => {
      stop();
      set({ ttsStatus: "idle" });
    });
  },

  setArSessionActive: (arSessionActive) => set({ arSessionActive }),


  setActiveBiome: (activeBiome) => set({ activeBiome }),
  setBiomeAudioEnabled: (biomeAudioEnabled) => set({ biomeAudioEnabled }),

  setMigrationSpeed: (migrationSpeed) => set({ migrationSpeed }),

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




  setCurrentSeason: (season) =>
    set((s) => ({
      currentSeason: season,
      ecosystemState: { ...s.ecosystemState, season },
    })),

  setEcosystemState: (ecosystemState) => set({ ecosystemState }),

  toggleHabitatFilter: (filter) =>
    set((s) => {
      const has = s.activeHabitatFilters.includes(filter);
      return {
        activeHabitatFilters: has
          ? s.activeHabitatFilters.filter((f) => f !== filter)
          : [...s.activeHabitatFilters, filter],
      };
    }),

  clearHabitatFilters: () => set({ activeHabitatFilters: [] }),






  setEcosystemPanelOpen: (ecosystemPanelOpen) => set({ ecosystemPanelOpen }),
  setEcosystemManualOverride: (ecosystemManualOverride) => set({ ecosystemManualOverride }),



  setActiveJourney: (activeJourneyId) => set({ activeJourneyId }),

  visitStop: (journeyId, stopId) => {
    const state = get();
    const visitedStops = state.visitedStops.includes(stopId)
      ? state.visitedStops
      : [...state.visitedStops, stopId];
    saveToStorage(VISITED_STOPS_KEY, visitedStops);

    const existing = state.journeyProgress.find((p) => p.journeyId === journeyId);
    let journeyProgress: JourneyProgress[];
    if (existing) {
      journeyProgress = state.journeyProgress.map((p) =>
        p.journeyId === journeyId
          ? { ...p, visitedStopIds: p.visitedStopIds.includes(stopId) ? p.visitedStopIds : [...p.visitedStopIds, stopId] }
          : p,
      );
    } else {
      journeyProgress = [
        ...state.journeyProgress,
        { journeyId, visitedStopIds: [stopId], discoveredBirdIds: [], completed: false },
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
}));
