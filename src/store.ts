import { create } from "zustand";
import type {
  AchievementProgress,
  AudioStatus,
  BirdPhoto,
  CollectedBird,
  DailyMission,
  Language,
  MissionTemplate,
  QuestProgress,
  QuizQuestion,
  QuizState,
  SoundGuessOption,
  SoundGuessState,
  TourState,
} from "./types";
import birdsData from "./data/birds.json";
import missionTemplates from "./data/missions.json";
import achievementDefs from "./data/achievements.json";
import type { AchievementDef, Bird } from "./types";

export type PanelType =
  | "birdCard"
  | "collection"
  | "regionFilter"
  | "quests"
  | "tour"
  | "quiz"
  | "soundGuess"
  | "encyclopedia"
  | "continentBird"
  | "storyExplorer"
  | "evolution"
  | "ar"
  | "missions"
  | "photoGallery"
  | "achievements";

const COLLECTION_KEY = "kids-bird-globe-collection";
const QUEST_KEY = "kids-bird-globe-quests";
const STORY_KEY = "kids-bird-globe-stories";
const POINTS_KEY = "kids-bird-globe-points";
const DISCOVERY_KEY = "kids-bird-globe-discovered";
const MISSIONS_KEY = "kids-bird-globe-missions";
const MISSIONS_DATE_KEY = "kids-bird-globe-missions-date";
const PHOTOS_KEY = "kids-bird-globe-photos";
const ACHIEVEMENTS_KEY = "kids-bird-globe-achievements";
const LISTEN_COUNT_KEY = "kids-bird-globe-listen-count";
const COMPLETED_MISSIONS_KEY = "kids-bird-globe-completed-missions";

const allBirds = birdsData as Bird[];
const templates = missionTemplates as MissionTemplate[];
const MAX_PHOTOS = 50;

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function generateMissions(): DailyMission[] {
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 4);
  return selected.map((t) => ({
    id: `${t.id}-${getTodayKey()}`,
    templateId: t.id,
    type: t.type,
    titleZh: t.titleZh,
    titleEn: t.titleEn,
    target: t.target,
    goal: t.goal,
    current: 0,
    completed: false,
    badge: t.badge,
  }));
}

function loadMissions(): DailyMission[] {
  const savedDate = loadFromStorage<string>(MISSIONS_DATE_KEY, "");
  const today = getTodayKey();
  if (savedDate === today) {
    return loadFromStorage<DailyMission[]>(MISSIONS_KEY, []);
  }
  const missions = generateMissions();
  saveToStorage(MISSIONS_KEY, missions);
  saveToStorage(MISSIONS_DATE_KEY, today);
  return missions;
}

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

  collectedBirds: CollectedBird[];
  isCollectionOpen: boolean;

  activeRegion: string | null;
  regionFilterOpen: boolean;

  questsOpen: boolean;
  questProgress: QuestProgress[];
  totalPoints: number;

  tourState: TourState;
  tourStep: number;

  guideMessage: string | null;
  guideMessageZh: string | null;

  migrationModeActive: boolean;

  storyExplorerOpen: boolean;
  storyProgress: Record<string, string[]>;

  radarOpen: boolean;

  hoveredBirdId: string | null;

  // v11: Discovery system
  discoveredBirds: string[];
  discoveryNotification: string | null;

  // v12: Heatmap and AR
  heatmapVisible: boolean;
  arViewerBirdId: string | null;

  // v13: Panel collision avoidance
  activePanel: PanelType | null;

  // v16: Missions
  dailyMissions: DailyMission[];
  missionsPanelOpen: boolean;
  completedMissionCount: number;
  missionNotification: string | null;

  // v16: Photos
  birdPhotos: BirdPhoto[];
  photoGalleryOpen: boolean;
  photoModeActive: boolean;

  // v16: Achievements
  achievements: AchievementProgress[];
  achievementPanelOpen: boolean;
  achievementNotification: string | null;
  listenCount: number;

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

  collectBird: (birdId: string) => void;
  setCollectionOpen: (open: boolean) => void;
  setActiveRegion: (region: string | null) => void;
  setRegionFilterOpen: (open: boolean) => void;
  setQuestsOpen: (open: boolean) => void;
  updateQuestProgress: (questId: string, current: number) => void;
  completeQuest: (questId: string, reward: number) => void;

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

  // v11 actions
  discoverBird: (birdId: string) => void;
  dismissDiscoveryNotification: () => void;

  // v12 actions
  setHeatmapVisible: (visible: boolean) => void;
  setARViewerBird: (birdId: string | null) => void;

  // v13 actions
  setActivePanel: (panel: PanelType | null) => void;

  // v16 actions
  setMissionsPanelOpen: (open: boolean) => void;
  updateMissionProgress: (type: DailyMission["type"], region?: string) => void;
  dismissMissionNotification: () => void;

  capturePhoto: (birdId: string, birdNameZh: string, birdNameEn: string, dataUrl: string) => void;
  deletePhoto: (photoId: string) => void;
  setPhotoGalleryOpen: (open: boolean) => void;
  setPhotoModeActive: (active: boolean) => void;

  setAchievementPanelOpen: (open: boolean) => void;
  checkAchievements: () => void;
  dismissAchievementNotification: () => void;
  incrementListenCount: () => void;
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

  discoveredBirds: loadFromStorage<string[]>(DISCOVERY_KEY, []),
  discoveryNotification: null,

  heatmapVisible: false,
  arViewerBirdId: null,

  activePanel: null,

  dailyMissions: loadMissions(),
  missionsPanelOpen: false,
  completedMissionCount: loadFromStorage<number>(COMPLETED_MISSIONS_KEY, 0),
  missionNotification: null,

  birdPhotos: loadFromStorage<BirdPhoto[]>(PHOTOS_KEY, []),
  photoGalleryOpen: false,
  photoModeActive: false,

  achievements: loadFromStorage<AchievementProgress[]>(ACHIEVEMENTS_KEY, []),
  achievementPanelOpen: false,
  achievementNotification: null,
  listenCount: loadFromStorage<number>(LISTEN_COUNT_KEY, 0),

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

  discoverBird: (birdId) => {
    const state = get();
    if (state.discoveredBirds.includes(birdId)) return;
    const updated = [...state.discoveredBirds, birdId];
    saveToStorage(DISCOVERY_KEY, updated);
    set({ discoveredBirds: updated, discoveryNotification: birdId });
  },
  dismissDiscoveryNotification: () => set({ discoveryNotification: null }),

  setHeatmapVisible: (heatmapVisible) => set({ heatmapVisible }),
  setARViewerBird: (arViewerBirdId) => set({ arViewerBirdId }),

  setActivePanel: (activePanel) => {
    const state = get();
    if (activePanel === state.activePanel) return;
    const reset: Partial<AppStore> = { activePanel };
    if (activePanel !== null && activePanel !== "birdCard") {
      reset.selectedBirdId = null;
    }
    if (activePanel !== null && activePanel !== "collection") {
      reset.isCollectionOpen = false;
    }
    if (activePanel !== null && activePanel !== "regionFilter") {
      reset.regionFilterOpen = false;
    }
    if (activePanel !== null && activePanel !== "quests") {
      reset.questsOpen = false;
    }
    if (activePanel !== null && activePanel !== "storyExplorer") {
      reset.storyExplorerOpen = false;
    }
    if (activePanel !== null && activePanel !== "encyclopedia") {
      reset.encyclopediaOpen = false;
    }
    if (activePanel !== null && activePanel !== "continentBird") {
      reset.continentPanelRegion = null;
    }
    if (activePanel !== null && activePanel !== "evolution") {
      reset.evolutionTimelineOpen = false;
    }
    if (activePanel !== null && activePanel !== "ar") {
      reset.arViewerBirdId = null;
    }
    if (activePanel !== null && activePanel !== "missions") {
      reset.missionsPanelOpen = false;
    }
    if (activePanel !== null && activePanel !== "photoGallery") {
      reset.photoGalleryOpen = false;
    }
    if (activePanel !== null && activePanel !== "achievements") {
      reset.achievementPanelOpen = false;
    }
    set(reset);
  },

  setMissionsPanelOpen: (missionsPanelOpen) => set({ missionsPanelOpen }),

  updateMissionProgress: (type, region) => {
    const state = get();
    let changed = false;
    let completedId: string | null = null;
    const updated = state.dailyMissions.map((m) => {
      if (m.completed) return m;
      if (m.type !== type) return m;
      if (type === "find_region" && m.target !== region) return m;

      const newCurrent = m.current + 1;
      const isComplete = newCurrent >= m.goal;
      changed = true;
      if (isComplete) completedId = m.id;
      return { ...m, current: newCurrent, completed: isComplete };
    });

    if (changed) {
      saveToStorage(MISSIONS_KEY, updated);
      const newCompletedCount = completedId
        ? state.completedMissionCount + 1
        : state.completedMissionCount;
      if (completedId) {
        saveToStorage(COMPLETED_MISSIONS_KEY, newCompletedCount);
      }
      set({
        dailyMissions: updated,
        completedMissionCount: newCompletedCount,
        missionNotification: completedId,
      });
    }
  },

  dismissMissionNotification: () => set({ missionNotification: null }),

  capturePhoto: (birdId, birdNameZh, birdNameEn, dataUrl) => {
    const state = get();
    const photo: BirdPhoto = {
      id: `photo-${Date.now()}`,
      birdId,
      birdNameZh,
      birdNameEn,
      dataUrl,
      capturedAt: Date.now(),
    };
    let updated = [photo, ...state.birdPhotos];
    if (updated.length > MAX_PHOTOS) {
      updated = updated.slice(0, MAX_PHOTOS);
    }
    saveToStorage(PHOTOS_KEY, updated);
    set({ birdPhotos: updated });
  },

  deletePhoto: (photoId) => {
    const state = get();
    const updated = state.birdPhotos.filter((p) => p.id !== photoId);
    saveToStorage(PHOTOS_KEY, updated);
    set({ birdPhotos: updated });
  },

  setPhotoGalleryOpen: (photoGalleryOpen) => set({ photoGalleryOpen }),
  setPhotoModeActive: (photoModeActive) => set({ photoModeActive }),

  setAchievementPanelOpen: (achievementPanelOpen) => set({ achievementPanelOpen }),

  checkAchievements: () => {
    const state = get();
    const discovered = state.discoveredBirds;
    const regions = new Set(
      allBirds.filter((b) => discovered.includes(b.id)).map((b) => b.region),
    );

    const checks: Record<string, number> = {
      discover: discovered.length,
      continent: regions.size,
      listen: state.listenCount,
      photo: state.birdPhotos.length,
      mission: state.completedMissionCount,
    };

    let newUnlock: string | null = null;
    const updatedAchievements = [...state.achievements];
    const defs = achievementDefs as AchievementDef[];

    for (const def of defs) {
      const existing = updatedAchievements.find((a) => a.achievementId === def.id);
      if (existing?.unlocked) continue;

      const progress = checks[def.type] ?? 0;
      if (progress >= def.requirement) {
        if (existing) {
          existing.unlocked = true;
          existing.unlockedAt = Date.now();
        } else {
          updatedAchievements.push({
            achievementId: def.id,
            unlocked: true,
            unlockedAt: Date.now(),
          });
        }
        newUnlock = def.id;
      }
    }

    saveToStorage(ACHIEVEMENTS_KEY, updatedAchievements);
    set({
      achievements: updatedAchievements,
      achievementNotification: newUnlock,
    });
  },

  dismissAchievementNotification: () => set({ achievementNotification: null }),

  incrementListenCount: () => {
    const state = get();
    const newCount = state.listenCount + 1;
    saveToStorage(LISTEN_COUNT_KEY, newCount);
    set({ listenCount: newCount });
  },
}));
