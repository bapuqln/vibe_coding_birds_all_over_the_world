import { create } from "zustand";
import type {
  JourneyProgress,
  StoryPlayState,
  TTSStatus,
} from "../types";
import { createInitialTimeState } from "../core/TimeController";
import {
  loadFromStorage,
  saveToStorage,
  STORY_KEY,
  JOURNEY_PROGRESS_KEY,
  VISITED_STOPS_KEY,
  COMPLETED_STORIES_KEY,
} from "./persistence";
import type { AppStore } from "./types";
export type { AppStore, PanelType } from "./types";
import { createCoreSlice } from "./slices/coreSlice";
import { createDiscoverySlice } from "./slices/discoverySlice";
import { createProgressionSlice } from "./slices/progressionSlice";
import { createPhotoSlice } from "./slices/photoSlice";


export const useAppStore = create<AppStore>()((set, get, store) => ({
  ...createCoreSlice(set, get, store),
  ...createDiscoverySlice(set, get, store),
  ...createProgressionSlice(set, get, store),
  ...createPhotoSlice(set, get, store),

  quizState: "idle",
  quizQuestions: [],
  quizCurrentIndex: 0,
  quizScore: 0,
  quizLastCorrect: null,

  showAllRoutes: false,
  soundGuessState: "idle",
  soundGuessRound: 0,
  soundGuessScore: 0,
  soundGuessOptions: [],
  soundGuessCorrectId: null,




  tourState: "idle",
  tourStep: 0,


  migrationModeActive: false,

  storyExplorerOpen: false,
  storyProgress: loadFromStorage<Record<string, string[]>>(STORY_KEY, {}),




  arViewerBirdId: null,






  storyModeActive: false,
  storyPlayState: "idle" as StoryPlayState,
  activeStoryId: null,
  storyStepIndex: 0,
  storyHighlightBirdId: null,
  completedStories: loadFromStorage<string[]>(COMPLETED_STORIES_KEY, []),




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

  soundRecognitionActive: false,
  soundRecognitionResult: null,
  soundRecognitionConfidence: 0,


  activeJourneyId: null,
  journeyProgress: loadFromStorage<JourneyProgress[]>(JOURNEY_PROGRESS_KEY, []),
  visitedStops: loadFromStorage<string[]>(VISITED_STOPS_KEY, []),
  journeyPanelOpen: false,

  timeState: createInitialTimeState(),
  migrationInfoPathIndex: null,



  startQuiz: (questions) =>
    set({
      quizState: "active",
      quizQuestions: questions,
      quizCurrentIndex: 0,
      quizScore: 0,
      quizLastCorrect: null,
    }),
  answerQuiz: (correct) =>
    set((state) => ({
      quizScore: correct ? state.quizScore + 1 : state.quizScore,
      quizLastCorrect: correct,
    })),
  nextQuizQuestion: () =>
    set((state) => {
      const nextIndex = state.quizCurrentIndex + 1;
      if (nextIndex >= state.quizQuestions.length) {
        return { quizState: "result" as const };
      }
      return { quizCurrentIndex: nextIndex, quizLastCorrect: null };
    }),
  endQuiz: () =>
    set({
      quizState: "idle",
      quizQuestions: [],
      quizCurrentIndex: 0,
      quizScore: 0,
      quizLastCorrect: null,
    }),

  setShowAllRoutes: (showAllRoutes) => set({ showAllRoutes }),
  startSoundGuess: () =>
    set({
      soundGuessState: "playing",
      soundGuessRound: 1,
      soundGuessScore: 0,
      soundGuessOptions: [],
      soundGuessCorrectId: null,
    }),
  setSoundGuessOptions: (options, correctId) =>
    set({
      soundGuessState: "guessing",
      soundGuessOptions: options,
      soundGuessCorrectId: correctId,
    }),
  answerSoundGuess: (birdId) =>
    set((state) => ({
      soundGuessScore:
        birdId === state.soundGuessCorrectId
          ? state.soundGuessScore + 1
          : state.soundGuessScore,
    })),
  nextSoundGuessRound: () =>
    set((state) => {
      if (state.soundGuessRound >= 5) {
        return { soundGuessState: "result" as const };
      }
      return {
        soundGuessState: "playing" as const,
        soundGuessRound: state.soundGuessRound + 1,
        soundGuessOptions: [],
        soundGuessCorrectId: null,
      };
    }),
  endSoundGuess: () =>
    set({
      soundGuessState: "idle",
      soundGuessRound: 0,
      soundGuessScore: 0,
      soundGuessOptions: [],
      soundGuessCorrectId: null,
    }),




  startTour: () => set({ tourState: "intro", tourStep: 0 }),
  pauseTour: () => set({ tourState: "paused" }),
  resumeTour: () => set({ tourState: "touring" }),
  nextTourStep: () =>
    set((state) => ({ tourStep: state.tourStep + 1, tourState: "touring" })),
  endTour: () => set({ tourState: "idle", tourStep: 0 }),


  setMigrationModeActive: (migrationModeActive) => set({ migrationModeActive }),

  setStoryExplorerOpen: (storyExplorerOpen) => set({ storyExplorerOpen }),
  markStoryBirdDiscovered: (storyId, birdId) => {
    const state = get();
    const current = state.storyProgress[storyId] || [];
    if (current.includes(birdId)) return;
    const updated = { ...state.storyProgress, [storyId]: [...current, birdId] };
    saveToStorage(STORY_KEY, updated);
    set({ storyProgress: updated });
  },



  setARViewerBird: (arViewerBirdId) => set({ arViewerBirdId }),















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

  setSoundRecognitionActive: (soundRecognitionActive) => set({ soundRecognitionActive }),
  setSoundRecognitionResult: (soundRecognitionResult) => set({ soundRecognitionResult }),
  setSoundRecognitionConfidence: (soundRecognitionConfidence) => set({ soundRecognitionConfidence }),


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
