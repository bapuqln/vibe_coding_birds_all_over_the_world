import { create } from "zustand";
import type {
  AudioStatus,
  CollectedBird,
  Language,
  QuestProgress,
  QuizQuestion,
  QuizState,
  SoundGuessOption,
  SoundGuessState,
  TourState,
} from "./types";

const COLLECTION_KEY = "kids-bird-globe-collection";
const QUEST_KEY = "kids-bird-globe-quests";
const STORY_KEY = "kids-bird-globe-stories";
const POINTS_KEY = "kids-bird-globe-points";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded */ }
}

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

  // v8: Collection
  collectedBirds: CollectedBird[];
  isCollectionOpen: boolean;

  // v8: Region filter
  activeRegion: string | null;
  regionFilterOpen: boolean;

  // v8: Quests
  questsOpen: boolean;
  questProgress: QuestProgress[];
  totalPoints: number;

  // v9: Guided tour
  tourState: TourState;
  tourStep: number;

  // v9: Bird guide
  guideMessage: string | null;
  guideMessageZh: string | null;

  // v9: Migration mode
  migrationModeActive: boolean;

  // v9: Story explorer
  storyExplorerOpen: boolean;
  storyProgress: Record<string, string[]>;

  // v9: Bird radar
  radarOpen: boolean;

  // UI: Tooltip
  hoveredBirdId: string | null;

  // Actions
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

  // v8 actions
  collectBird: (birdId: string) => void;
  setCollectionOpen: (open: boolean) => void;
  setActiveRegion: (region: string | null) => void;
  setRegionFilterOpen: (open: boolean) => void;
  setQuestsOpen: (open: boolean) => void;
  updateQuestProgress: (questId: string, current: number) => void;
  completeQuest: (questId: string, reward: number) => void;

  // v9 actions
  startTour: () => void;
  pauseTour: () => void;
  resumeTour: () => void;
  nextTourStep: () => void;
  endTour: () => void;
  setGuideMessage: (en: string | null, zh: string | null) => void;
  setMigrationModeActive: (active: boolean) => void;
  setStoryExplorerOpen: (open: boolean) => void;
  markStoryBirdDiscovered: (storyId: string, birdId: string) => void;
  setRadarOpen: (open: boolean) => void;
  setHoveredBird: (id: string | null) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
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

  collectedBirds: loadFromStorage<CollectedBird[]>(COLLECTION_KEY, []),
  isCollectionOpen: false,

  activeRegion: null,
  regionFilterOpen: false,

  questsOpen: false,
  questProgress: loadFromStorage<QuestProgress[]>(QUEST_KEY, []),
  totalPoints: loadFromStorage<number>(POINTS_KEY, 0),

  tourState: "idle",
  tourStep: 0,

  guideMessage: null,
  guideMessageZh: null,

  migrationModeActive: false,

  storyExplorerOpen: false,
  storyProgress: loadFromStorage<Record<string, string[]>>(STORY_KEY, {}),

  radarOpen: false,

  hoveredBirdId: null,

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

  collectBird: (birdId) => {
    const state = get();
    if (state.collectedBirds.some((b) => b.birdId === birdId)) return;
    const updated = [...state.collectedBirds, { birdId, collectedAt: Date.now() }];
    saveToStorage(COLLECTION_KEY, updated);
    set({ collectedBirds: updated });
  },
  setCollectionOpen: (isCollectionOpen) => set({ isCollectionOpen }),

  setActiveRegion: (activeRegion) => set({ activeRegion }),
  setRegionFilterOpen: (regionFilterOpen) => set({ regionFilterOpen }),

  setQuestsOpen: (questsOpen) => set({ questsOpen }),
  updateQuestProgress: (questId, current) => {
    const state = get();
    const existing = state.questProgress.find((q) => q.questId === questId);
    let updated: QuestProgress[];
    if (existing) {
      updated = state.questProgress.map((q) =>
        q.questId === questId ? { ...q, current } : q,
      );
    } else {
      updated = [...state.questProgress, { questId, current, completed: false }];
    }
    saveToStorage(QUEST_KEY, updated);
    set({ questProgress: updated });
  },
  completeQuest: (questId, reward) => {
    const state = get();
    const updated = state.questProgress.map((q) =>
      q.questId === questId ? { ...q, completed: true, completedAt: Date.now() } : q,
    );
    const newPoints = state.totalPoints + reward;
    saveToStorage(QUEST_KEY, updated);
    saveToStorage(POINTS_KEY, newPoints);
    set({ questProgress: updated, totalPoints: newPoints });
  },

  startTour: () => set({ tourState: "intro", tourStep: 0 }),
  pauseTour: () => set({ tourState: "paused" }),
  resumeTour: () => set({ tourState: "touring" }),
  nextTourStep: () =>
    set((state) => ({ tourStep: state.tourStep + 1, tourState: "touring" })),
  endTour: () => set({ tourState: "idle", tourStep: 0 }),

  setGuideMessage: (en, zh) => set({ guideMessage: en, guideMessageZh: zh }),

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

  setRadarOpen: (radarOpen) => set({ radarOpen }),
  setHoveredBird: (hoveredBirdId) => set({ hoveredBirdId }),
}));
