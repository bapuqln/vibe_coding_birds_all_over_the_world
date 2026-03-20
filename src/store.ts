import { create } from "zustand";
import type {
  AudioStatus,
  Language,
  QuizQuestion,
  QuizState,
  SoundGuessOption,
  SoundGuessState,
} from "./types";

interface AppStore {
  selectedBirdId: string | null;
  language: Language;
  audioStatus: AudioStatus;
  globeReady: boolean;
  modelsReady: boolean;

  encyclopediaOpen: boolean;
  continentPanelRegion: string | null;

  quizState: QuizState;
  quizQuestions: QuizQuestion[];
  quizCurrentIndex: number;
  quizScore: number;
  quizLastCorrect: boolean | null;

  showAllRoutes: boolean;
  evolutionTimelineOpen: boolean;
  soundGuessState: SoundGuessState;
  soundGuessRound: number;
  soundGuessScore: number;
  soundGuessOptions: SoundGuessOption[];
  soundGuessCorrectId: string | null;

  setSelectedBird: (id: string | null) => void;
  toggleLanguage: () => void;
  setAudioStatus: (status: AudioStatus) => void;
  setGlobeReady: (ready: boolean) => void;
  setModelsReady: (ready: boolean) => void;

  setEncyclopediaOpen: (open: boolean) => void;
  setContinentPanelRegion: (region: string | null) => void;

  startQuiz: (questions: QuizQuestion[]) => void;
  answerQuiz: (correct: boolean) => void;
  nextQuizQuestion: () => void;
  endQuiz: () => void;

  setShowAllRoutes: (show: boolean) => void;
  setEvolutionTimelineOpen: (open: boolean) => void;
  startSoundGuess: () => void;
  setSoundGuessOptions: (options: SoundGuessOption[], correctId: string) => void;
  answerSoundGuess: (birdId: string) => void;
  nextSoundGuessRound: () => void;
  endSoundGuess: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  selectedBirdId: null,
  language: "zh",
  audioStatus: "idle",
  globeReady: false,
  modelsReady: false,

  encyclopediaOpen: false,
  continentPanelRegion: null,

  quizState: "idle",
  quizQuestions: [],
  quizCurrentIndex: 0,
  quizScore: 0,
  quizLastCorrect: null,

  showAllRoutes: false,
  evolutionTimelineOpen: false,
  soundGuessState: "idle",
  soundGuessRound: 0,
  soundGuessScore: 0,
  soundGuessOptions: [],
  soundGuessCorrectId: null,

  setSelectedBird: (id) => set({ selectedBirdId: id }),
  toggleLanguage: () =>
    set((state) => ({ language: state.language === "zh" ? "en" : "zh" })),
  setAudioStatus: (audioStatus) => set({ audioStatus }),
  setGlobeReady: (globeReady) => set({ globeReady }),
  setModelsReady: (modelsReady) => set({ modelsReady }),

  setEncyclopediaOpen: (encyclopediaOpen) => set({ encyclopediaOpen }),
  setContinentPanelRegion: (continentPanelRegion) =>
    set({ continentPanelRegion }),

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
        return { quizState: "result" };
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
  setEvolutionTimelineOpen: (evolutionTimelineOpen) =>
    set({ evolutionTimelineOpen }),
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
}));
