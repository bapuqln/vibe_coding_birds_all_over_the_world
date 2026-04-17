import { create } from "zustand";
import type {
  AchievementProgress,
  AppMode,
  AudioStatus,
  BirdPhoto,
  CollectedBird,
  DailyMission,
  DiscoveryMissionProgress,
  ExpeditionProgress,
  HabitatFilterType,
  JourneyProgress,
  KnowledgeResult,
  Language,
  MissionTemplate,
  PhotoScore,
  QuestProgress,
  QuizQuestion,
  QuizState,
  Season,
  SoundGuessOption,
  SoundGuessState,
  SpawnedBird,
  StoryPlayState,
  TimeOfDay,
  TimeState,
  TourState,
  TrackProgress,
  TTSStatus,
  WorldState,
} from "../types";
import { createInitialTimeState } from "../core/TimeController";
import birdsData from "../data/birds.json";
import missionTemplates from "../data/missions.json";
import achievementDefs from "../data/achievements.json";
import expeditionsData from "../data/expeditions.json";
import type { AchievementDef, Bird, Expedition } from "../types";
import { getAllTracks } from "../systems/LearningTrackSystem";
import { checkMissionProgress, getAllDiscoverMissions } from "../systems/DiscoverMissionSystem";

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
  | "achievements"
  | "expeditions"
  | "share"
  | "aiGuide"
  | "photographer"
  | "classroom"
  | "sandbox"
  | "learningTracks"
  | "discoverMissions"
  | "ecosystemPanel"
  | "journeyPanel"
  | "migrationIntelligence";

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
const EXPEDITIONS_KEY = "kids-bird-globe-expeditions";
const TRACKS_KEY = "kids-bird-globe-learning-tracks";
const DISCOVERY_BADGES_KEY = "kids-bird-globe-discovery-badges";
const DISCOVERY_MISSIONS_KEY = "kids-bird-globe-discovery-missions-progress";
const JOURNEY_PROGRESS_KEY = "kids-bird-globe-journey-progress";
const VISITED_STOPS_KEY = "kids-bird-globe-visited-stops";

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

  expeditions: ExpeditionProgress[];
  expeditionPanelOpen: boolean;
  expeditionNotification: string | null;

  storyModeActive: boolean;
  storyPlayState: StoryPlayState;
  activeStoryId: string | null;
  storyStepIndex: number;
  storyHighlightBirdId: string | null;
  completedStories: string[];

  weatherVisible: boolean;
  timeOfDay: TimeOfDay;

  sharePanelOpen: boolean;
  screenshotFlash: boolean;
  recentScreenshots: string[];

  currentFps: number;
  dynamicLodDistance: number;
  encyclopediaEntryBirdId: string | null;

  // V31 — AI Guide
  aiGuideOpen: boolean;
  aiGuideQuestion: string | null;
  aiGuideAnswer: string | null;

  // V33 — AI Bird Guide Knowledge System
  birdExplanation: KnowledgeResult | null;
  birdExplanationLoading: boolean;
  ttsStatus: TTSStatus;

  // V32 — AR
  arSessionActive: boolean;

  // V34 — Photographer
  photographerModeActive: boolean;
  photographerScore: PhotoScore | null;

  // V35 — Biomes
  activeBiome: string | null;
  biomeAudioEnabled: boolean;

  // V36 — Migration
  migrationSpeed: number;

  // V39 — Classroom
  classroomModeActive: boolean;
  presentationMode: boolean;
  activeLessonId: string | null;
  lessonStepIndex: number;

  // V40 — Sandbox
  sandboxModeActive: boolean;
  spawnedBirds: SpawnedBird[];
  sandboxTimeHour: number;

  // V31 — Learning Tracks
  learningTracksOpen: boolean;
  trackProgress: TrackProgress[];
  trackNotification: string | null;

  // V31 — Ecosystem
  currentSeason: Season;
  ecosystemState: WorldState;

  // V31 — Habitat Filter
  activeHabitatFilters: HabitatFilterType[];

  // V31 — Bird Compare Mode
  compareBirdA: string | null;
  compareBirdB: string | null;
  compareMode: boolean;

  // V31 — Discovery Missions
  discoveryMissions: DiscoveryMissionProgress[];
  discoveryMissionsPanelOpen: boolean;
  discoveryBadges: string[];
  discoveryMissionNotification: string | null;

  // V31 — Evolution Timeline
  evolutionTimelineValue: number;

  // V32 — Ecosystem Panel
  ecosystemPanelOpen: boolean;
  ecosystemManualOverride: boolean;

  // V32 — Sound Recognition
  soundRecognitionActive: boolean;
  soundRecognitionResult: string | null;
  soundRecognitionConfidence: number;

  // V33 — App Mode (mode-driven HUD)
  appMode: AppMode;
  birdCardExpanded: boolean;

  // V34 — Migration Journey
  activeJourneyId: string | null;
  journeyProgress: JourneyProgress[];
  visitedStops: string[];
  journeyPanelOpen: boolean;

  // V32 — Bird Migration Intelligence
  timeState: TimeState;
  migrationInfoPathIndex: number | null;

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

  setExpeditionPanelOpen: (open: boolean) => void;
  updateExpeditionProgress: () => void;
  dismissExpeditionNotification: () => void;

  setStoryModeActive: (active: boolean) => void;
  startStoryAdventure: (storyId: string) => void;
  nextStoryStep: () => void;
  pauseStoryAdventure: () => void;
  resumeStoryAdventure: () => void;
  exitStoryAdventure: () => void;
  completeStoryAdventure: () => void;

  setWeatherVisible: (visible: boolean) => void;
  setTimeOfDay: (time: TimeOfDay) => void;

  setSharePanelOpen: (open: boolean) => void;
  addScreenshot: (dataUrl: string) => void;
  setScreenshotFlash: (flash: boolean) => void;

  setCurrentFps: (fps: number) => void;
  setDynamicLodDistance: (distance: number) => void;
  setEncyclopediaEntryBirdId: (id: string | null) => void;

  // V31
  setAiGuideOpen: (open: boolean) => void;
  setAiGuideQuestion: (q: string | null) => void;
  setAiGuideAnswer: (a: string | null) => void;

  // V33 — AI Bird Guide Knowledge System
  requestBirdExplanation: (birdId: string) => void;
  clearBirdExplanation: () => void;
  speakExplanation: () => void;
  stopSpeaking: () => void;

  // V32
  setArSessionActive: (active: boolean) => void;

  // V34
  setPhotographerModeActive: (active: boolean) => void;
  setPhotographerScore: (score: PhotoScore | null) => void;

  // V35
  setActiveBiome: (biome: string | null) => void;
  setBiomeAudioEnabled: (enabled: boolean) => void;

  // V36
  setMigrationSpeed: (speed: number) => void;

  // V39
  setClassroomModeActive: (active: boolean) => void;
  setPresentationMode: (active: boolean) => void;
  setActiveLessonId: (id: string | null) => void;
  setLessonStepIndex: (index: number) => void;
  nextLessonStep: () => void;

  // V40
  setSandboxModeActive: (active: boolean) => void;
  addSpawnedBird: (bird: SpawnedBird) => void;
  removeSpawnedBird: (id: string) => void;
  clearSpawnedBirds: () => void;
  setSandboxTimeHour: (hour: number) => void;

  // V31 — Learning Tracks & ecosystem
  setLearningTracksOpen: (open: boolean) => void;
  updateTrackProgress: () => void;
  dismissTrackNotification: () => void;
  setCurrentSeason: (season: Season) => void;
  setEcosystemState: (state: WorldState) => void;
  toggleHabitatFilter: (filter: HabitatFilterType) => void;
  clearHabitatFilters: () => void;

  // V31 — Compare
  setCompareMode: (mode: boolean) => void;
  setCompareBirdA: (id: string | null) => void;
  setCompareBirdB: (id: string | null) => void;

  // V31 — Discovery Missions
  setDiscoveryMissionsPanelOpen: (open: boolean) => void;
  updateDiscoveryMissions: () => void;
  dismissDiscoveryMissionNotification: () => void;

  // V31 — Evolution Timeline
  setEvolutionTimelineValue: (value: number) => void;

  // V32 — Ecosystem Panel
  setEcosystemPanelOpen: (open: boolean) => void;
  setEcosystemManualOverride: (override: boolean) => void;

  // V32 — Sound Recognition
  setSoundRecognitionActive: (active: boolean) => void;
  setSoundRecognitionResult: (birdId: string | null) => void;
  setSoundRecognitionConfidence: (confidence: number) => void;

  // V33 — App Mode (mode-driven HUD)
  setAppMode: (mode: AppMode) => void;
  setBirdCardExpanded: (expanded: boolean) => void;

  // V34 — Migration Journey
  setActiveJourney: (id: string | null) => void;
  visitStop: (journeyId: string, stopId: string) => void;
  completeJourney: (journeyId: string) => void;
  setJourneyPanelOpen: (open: boolean) => void;

  // V32 — Bird Migration Intelligence
  setTimeState: (state: TimeState) => void;
  playTimeline: () => void;
  pauseTimeline: () => void;
  setTimeMonth: (month: number) => void;
  setTimeSpeed: (speed: number) => void;
  scrubTimeline: (progress: number) => void;
  setMigrationInfoPathIndex: (index: number | null) => void;
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

  expeditions: loadFromStorage<ExpeditionProgress[]>(EXPEDITIONS_KEY, []),
  expeditionPanelOpen: false,
  expeditionNotification: null,

  storyModeActive: false,
  storyPlayState: "idle" as StoryPlayState,
  activeStoryId: null,
  storyStepIndex: 0,
  storyHighlightBirdId: null,
  completedStories: loadFromStorage<string[]>("kids-bird-globe-completed-stories", []),

  weatherVisible: false,
  timeOfDay: "morning" as TimeOfDay,

  sharePanelOpen: false,
  screenshotFlash: false,
  recentScreenshots: [],

  currentFps: 60,
  dynamicLodDistance: 2.5,
  encyclopediaEntryBirdId: null,

  aiGuideOpen: false,
  aiGuideQuestion: null,
  aiGuideAnswer: null,

  birdExplanation: null,
  birdExplanationLoading: false,
  ttsStatus: "idle" as TTSStatus,

  arSessionActive: false,

  photographerModeActive: false,
  photographerScore: null,

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

  learningTracksOpen: false,
  trackProgress: loadFromStorage<TrackProgress[]>(TRACKS_KEY, []),
  trackNotification: null,

  currentSeason: "spring",
  ecosystemState: {
    season: "spring",
    temperature: 20,
    wind: 5,
    timeOfDay: "morning",
  },

  activeHabitatFilters: [],

  compareBirdA: null,
  compareBirdB: null,
  compareMode: false,

  discoveryMissions: loadFromStorage<DiscoveryMissionProgress[]>(DISCOVERY_MISSIONS_KEY, []),
  discoveryMissionsPanelOpen: false,
  discoveryBadges: loadFromStorage<string[]>(DISCOVERY_BADGES_KEY, []),
  discoveryMissionNotification: null,

  evolutionTimelineValue: 3,

  ecosystemPanelOpen: false,
  ecosystemManualOverride: false,

  soundRecognitionActive: false,
  soundRecognitionResult: null,
  soundRecognitionConfidence: 0,

  appMode: "explore",
  birdCardExpanded: true,

  activeJourneyId: null,
  journeyProgress: loadFromStorage<JourneyProgress[]>(JOURNEY_PROGRESS_KEY, []),
  visitedStops: loadFromStorage<string[]>(VISITED_STOPS_KEY, []),
  journeyPanelOpen: false,

  timeState: createInitialTimeState(),
  migrationInfoPathIndex: null,

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
    setTimeout(() => get().updateExpeditionProgress(), 100);
    setTimeout(() => get().updateTrackProgress(), 100);
    setTimeout(() => get().updateDiscoveryMissions(), 150);
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
    if (activePanel !== null && activePanel !== "expeditions") {
      reset.expeditionPanelOpen = false;
    }
    if (activePanel !== null && activePanel !== "share") {
      reset.sharePanelOpen = false;
    }
    if (activePanel !== null && activePanel !== "aiGuide") {
      reset.aiGuideOpen = false;
    }
    if (activePanel !== null && activePanel !== "classroom") {
      reset.classroomModeActive = false;
    }
    if (activePanel !== null && activePanel !== "sandbox") {
      reset.sandboxModeActive = false;
    }
    if (activePanel !== null && activePanel !== "learningTracks") {
      reset.learningTracksOpen = false;
    }
    if (activePanel !== null && activePanel !== "discoverMissions") {
      reset.discoveryMissionsPanelOpen = false;
    }
    if (activePanel !== null && activePanel !== "ecosystemPanel") {
      reset.ecosystemPanelOpen = false;
    }
    if (activePanel !== null && activePanel !== "journeyPanel") {
      reset.journeyPanelOpen = false;
    }
    if (activePanel !== null && activePanel !== "migrationIntelligence") {
      reset.migrationInfoPathIndex = null;
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

  setExpeditionPanelOpen: (expeditionPanelOpen) => set({ expeditionPanelOpen }),

  updateExpeditionProgress: () => {
    const state = get();
    const discovered = state.discoveredBirds;
    const allExpeditions = expeditionsData as Expedition[];
    let newCompletion: string | null = null;

    const updated = allExpeditions.map((exp) => {
      const existing = state.expeditions.find((e) => e.expeditionId === exp.id);
      if (existing?.completed) return existing;

      let current = 0;

      if (exp.type === "region") {
        current = allBirds.filter(
          (b) => b.region === exp.target && discovered.includes(b.id),
        ).length;
      } else if (exp.type === "collection") {
        current = discovered.length;
      } else if (exp.type === "trait" && exp.target === "migration") {
        current = allBirds.filter(
          (b) => Boolean(b.migration) && discovered.includes(b.id),
        ).length;
      } else if (exp.type === "trait" && exp.target === "rare") {
        current = allBirds.filter(
          (b) =>
            (b.rarity === "rare" || b.rarity === "legendary") &&
            discovered.includes(b.id),
        ).length;
      } else if (exp.type === "continents") {
        const regions = new Set(
          allBirds
            .filter((b) => discovered.includes(b.id))
            .map((b) => b.region),
        );
        current = regions.size;
      }

      const completed = current >= exp.goal;
      if (completed && !existing?.completed) {
        newCompletion = exp.id;
      }

      return {
        expeditionId: exp.id,
        current: Math.min(current, exp.goal),
        completed,
        completedAt: completed ? existing?.completedAt || Date.now() : undefined,
      };
    });

    saveToStorage(EXPEDITIONS_KEY, updated);
    set({
      expeditions: updated,
      expeditionNotification: newCompletion,
    });
  },

  dismissExpeditionNotification: () => set({ expeditionNotification: null }),

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
    saveToStorage("kids-bird-globe-completed-stories", updated);
    set({
      storyPlayState: "complete",
      completedStories: updated,
    });
  },

  setWeatherVisible: (weatherVisible) => set({ weatherVisible }),
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),

  setSharePanelOpen: (sharePanelOpen) => set({ sharePanelOpen }),
  addScreenshot: (dataUrl) =>
    set((state) => ({
      recentScreenshots: [dataUrl, ...state.recentScreenshots].slice(0, 10),
    })),
  setScreenshotFlash: (screenshotFlash) => set({ screenshotFlash }),

  setCurrentFps: (currentFps) => set({ currentFps }),
  setDynamicLodDistance: (dynamicLodDistance) => set({ dynamicLodDistance }),
  setEncyclopediaEntryBirdId: (encyclopediaEntryBirdId) => set({ encyclopediaEntryBirdId }),

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

  setPhotographerModeActive: (photographerModeActive) => set({ photographerModeActive, photographerScore: null }),
  setPhotographerScore: (photographerScore) => set({ photographerScore }),

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

  setLearningTracksOpen: (learningTracksOpen) => set({ learningTracksOpen }),

  updateTrackProgress: () => {
    const state = get();
    const tracks = getAllTracks();
    const globalDiscovered = new Set(state.discoveredBirds);
    const prevById = new Map<string, TrackProgress>(
      state.trackProgress.map((p) => [p.trackId, p]),
    );

    let newCompletion: string | null = null;
    const updated: TrackProgress[] = tracks.map((t) => {
      const discoveredInTrack = t.birdIds.filter((id) => globalDiscovered.has(id));
      const completed = discoveredInTrack.length >= t.birdIds.length;
      const was: TrackProgress | undefined = prevById.get(t.id);
      if (completed && !was?.completed) {
        newCompletion = t.id;
      }
      return {
        trackId: t.id,
        discoveredBirds: discoveredInTrack,
        completed,
        completedAt: completed ? (was?.completedAt ?? Date.now()) : undefined,
      };
    });

    saveToStorage(TRACKS_KEY, updated);
    set({
      trackProgress: updated,
      ...(newCompletion ? { trackNotification: newCompletion } : {}),
    });
  },

  dismissTrackNotification: () => set({ trackNotification: null }),

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

  setCompareMode: (compareMode) => set({ compareMode }),
  setCompareBirdA: (compareBirdA) => set({ compareBirdA }),
  setCompareBirdB: (compareBirdB) => set({ compareBirdB }),

  setDiscoveryMissionsPanelOpen: (discoveryMissionsPanelOpen) => set({ discoveryMissionsPanelOpen }),

  updateDiscoveryMissions: () => {
    const state = get();
    const discovered = state.discoveredBirds;
    const allMissions = getAllDiscoverMissions();
    let newCompletion: string | null = null;
    const newBadges = [...state.discoveryBadges];

    const updated: DiscoveryMissionProgress[] = allMissions.map((m) => {
      const existing = state.discoveryMissions.find((p) => p.missionId === m.id);
      if (existing?.completed) return existing;

      const current = checkMissionProgress(m.id, discovered);
      const completed = current >= m.goal;
      if (completed && !existing?.completed) {
        newCompletion = m.id;
        if (!newBadges.includes(m.badge)) {
          newBadges.push(m.badge);
        }
      }
      return {
        missionId: m.id,
        current: Math.min(current, m.goal),
        completed,
        completedAt: completed ? (existing?.completedAt ?? Date.now()) : undefined,
      };
    });

    saveToStorage(DISCOVERY_MISSIONS_KEY, updated);
    saveToStorage(DISCOVERY_BADGES_KEY, newBadges);
    set({
      discoveryMissions: updated,
      discoveryBadges: newBadges,
      discoveryMissionNotification: newCompletion,
    });
  },

  dismissDiscoveryMissionNotification: () => set({ discoveryMissionNotification: null }),

  setEvolutionTimelineValue: (evolutionTimelineValue) => set({ evolutionTimelineValue }),

  setEcosystemPanelOpen: (ecosystemPanelOpen) => set({ ecosystemPanelOpen }),
  setEcosystemManualOverride: (ecosystemManualOverride) => set({ ecosystemManualOverride }),

  setSoundRecognitionActive: (soundRecognitionActive) => set({ soundRecognitionActive }),
  setSoundRecognitionResult: (soundRecognitionResult) => set({ soundRecognitionResult }),
  setSoundRecognitionConfidence: (soundRecognitionConfidence) => set({ soundRecognitionConfidence }),

  setAppMode: (appMode) => set({ appMode }),
  setBirdCardExpanded: (birdCardExpanded) => set({ birdCardExpanded }),

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
