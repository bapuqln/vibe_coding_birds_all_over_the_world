import { create } from "zustand";
import type {
  AchievementProgress,
  BirdPhoto,
  CollectedBird,
  DiscoveryMissionProgress,
  ExpeditionProgress,
  JourneyProgress,
  QuestProgress,
  StoryPlayState,
  TrackProgress,
  TTSStatus,
} from "../types";
import { createInitialTimeState } from "../core/TimeController";
import birdsData from "../data/birds.json";
import achievementDefs from "../data/achievements.json";
import expeditionsData from "../data/expeditions.json";
import type { AchievementDef, Bird, Expedition } from "../types";
import { getAllTracks } from "../systems/LearningTrackSystem";
import { checkMissionProgress, getAllDiscoverMissions } from "../systems/DiscoverMissionSystem";
import {
  loadFromStorage,
  saveToStorage,
  loadMissions,
  COLLECTION_KEY,
  QUEST_KEY,
  STORY_KEY,
  POINTS_KEY,
  DISCOVERY_KEY,
  MISSIONS_KEY,
  PHOTOS_KEY,
  ACHIEVEMENTS_KEY,
  LISTEN_COUNT_KEY,
  COMPLETED_MISSIONS_KEY,
  EXPEDITIONS_KEY,
  TRACKS_KEY,
  DISCOVERY_BADGES_KEY,
  DISCOVERY_MISSIONS_KEY,
  JOURNEY_PROGRESS_KEY,
  VISITED_STOPS_KEY,
  COMPLETED_STORIES_KEY,
  MAX_PHOTOS,
} from "./persistence";
import type { AppStore } from "./types";
export type { AppStore, PanelType } from "./types";
import { createCoreSlice } from "./slices/coreSlice";

const allBirds = birdsData as Bird[];


export const useAppStore = create<AppStore>()((set, get, store) => ({
  ...createCoreSlice(set, get, store),

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


  migrationModeActive: false,

  storyExplorerOpen: false,
  storyProgress: loadFromStorage<Record<string, string[]>>(STORY_KEY, {}),



  discoveredBirds: loadFromStorage<string[]>(DISCOVERY_KEY, []),
  discoveryNotification: null,

  arViewerBirdId: null,


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
  completedStories: loadFromStorage<string[]>(COMPLETED_STORIES_KEY, []),


  sharePanelOpen: false,
  screenshotFlash: false,
  recentScreenshots: [],

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


  activeJourneyId: null,
  journeyProgress: loadFromStorage<JourneyProgress[]>(JOURNEY_PROGRESS_KEY, []),
  visitedStops: loadFromStorage<string[]>(VISITED_STOPS_KEY, []),
  journeyPanelOpen: false,

  timeState: createInitialTimeState(),
  migrationInfoPathIndex: null,


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

  setARViewerBird: (arViewerBirdId) => set({ arViewerBirdId }),


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
    saveToStorage(COMPLETED_STORIES_KEY, updated);
    set({
      storyPlayState: "complete",
      completedStories: updated,
    });
  },


  setSharePanelOpen: (sharePanelOpen) => set({ sharePanelOpen }),
  addScreenshot: (dataUrl) =>
    set((state) => ({
      recentScreenshots: [dataUrl, ...state.recentScreenshots].slice(0, 10),
    })),
  setScreenshotFlash: (screenshotFlash) => set({ screenshotFlash }),

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
