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

export interface AppStore {
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

  discoveredBirds: string[];
  discoveryNotification: string | null;

  heatmapVisible: boolean;
  arViewerBirdId: string | null;

  activePanel: PanelType | null;

  dailyMissions: DailyMission[];
  missionsPanelOpen: boolean;
  completedMissionCount: number;
  missionNotification: string | null;

  birdPhotos: BirdPhoto[];
  photoGalleryOpen: boolean;
  photoModeActive: boolean;

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

  aiGuideOpen: boolean;
  aiGuideQuestion: string | null;
  aiGuideAnswer: string | null;

  birdExplanation: KnowledgeResult | null;
  birdExplanationLoading: boolean;
  ttsStatus: TTSStatus;

  arSessionActive: boolean;

  photographerModeActive: boolean;
  photographerScore: PhotoScore | null;

  activeBiome: string | null;
  biomeAudioEnabled: boolean;

  migrationSpeed: number;

  classroomModeActive: boolean;
  presentationMode: boolean;
  activeLessonId: string | null;
  lessonStepIndex: number;

  sandboxModeActive: boolean;
  spawnedBirds: SpawnedBird[];
  sandboxTimeHour: number;

  learningTracksOpen: boolean;
  trackProgress: TrackProgress[];
  trackNotification: string | null;

  currentSeason: Season;
  ecosystemState: WorldState;

  activeHabitatFilters: HabitatFilterType[];

  compareBirdA: string | null;
  compareBirdB: string | null;
  compareMode: boolean;

  discoveryMissions: DiscoveryMissionProgress[];
  discoveryMissionsPanelOpen: boolean;
  discoveryBadges: string[];
  discoveryMissionNotification: string | null;

  evolutionTimelineValue: number;

  ecosystemPanelOpen: boolean;
  ecosystemManualOverride: boolean;

  soundRecognitionActive: boolean;
  soundRecognitionResult: string | null;
  soundRecognitionConfidence: number;

  appMode: AppMode;
  birdCardExpanded: boolean;

  activeJourneyId: string | null;
  journeyProgress: JourneyProgress[];
  visitedStops: string[];
  journeyPanelOpen: boolean;

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

  discoverBird: (birdId: string) => void;
  dismissDiscoveryNotification: () => void;

  setHeatmapVisible: (visible: boolean) => void;
  setARViewerBird: (birdId: string | null) => void;

  setActivePanel: (panel: PanelType | null) => void;

  setMissionsPanelOpen: (open: boolean) => void;
  updateMissionProgress: (type: DailyMission["type"], region?: string) => void;
  dismissMissionNotification: () => void;

  capturePhoto: (
    birdId: string,
    birdNameZh: string,
    birdNameEn: string,
    dataUrl: string,
  ) => void;
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

  setAiGuideOpen: (open: boolean) => void;
  setAiGuideQuestion: (q: string | null) => void;
  setAiGuideAnswer: (a: string | null) => void;

  requestBirdExplanation: (birdId: string) => void;
  clearBirdExplanation: () => void;
  speakExplanation: () => void;
  stopSpeaking: () => void;

  setArSessionActive: (active: boolean) => void;

  setPhotographerModeActive: (active: boolean) => void;
  setPhotographerScore: (score: PhotoScore | null) => void;

  setActiveBiome: (biome: string | null) => void;
  setBiomeAudioEnabled: (enabled: boolean) => void;

  setMigrationSpeed: (speed: number) => void;

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

  setLearningTracksOpen: (open: boolean) => void;
  updateTrackProgress: () => void;
  dismissTrackNotification: () => void;
  setCurrentSeason: (season: Season) => void;
  setEcosystemState: (state: WorldState) => void;
  toggleHabitatFilter: (filter: HabitatFilterType) => void;
  clearHabitatFilters: () => void;

  setCompareMode: (mode: boolean) => void;
  setCompareBirdA: (id: string | null) => void;
  setCompareBirdB: (id: string | null) => void;

  setDiscoveryMissionsPanelOpen: (open: boolean) => void;
  updateDiscoveryMissions: () => void;
  dismissDiscoveryMissionNotification: () => void;

  setEvolutionTimelineValue: (value: number) => void;

  setEcosystemPanelOpen: (open: boolean) => void;
  setEcosystemManualOverride: (override: boolean) => void;

  setSoundRecognitionActive: (active: boolean) => void;
  setSoundRecognitionResult: (birdId: string | null) => void;
  setSoundRecognitionConfidence: (confidence: number) => void;

  setAppMode: (mode: AppMode) => void;
  setBirdCardExpanded: (expanded: boolean) => void;

  setActiveJourney: (id: string | null) => void;
  visitStop: (journeyId: string, stopId: string) => void;
  completeJourney: (journeyId: string) => void;
  setJourneyPanelOpen: (open: boolean) => void;

  setTimeState: (state: TimeState) => void;
  playTimeline: () => void;
  pauseTimeline: () => void;
  setTimeMonth: (month: number) => void;
  setTimeSpeed: (speed: number) => void;
  scrubTimeline: (progress: number) => void;
  setMigrationInfoPathIndex: (index: number | null) => void;
}
