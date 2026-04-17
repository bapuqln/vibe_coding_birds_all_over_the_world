import type { StateCreator } from "zustand";
import type {
  AchievementDef,
  AchievementProgress,
  Bird,
  DailyMission,
  DiscoveryMissionProgress,
  Expedition,
  ExpeditionProgress,
  QuestProgress,
  TrackProgress,
} from "../../types";
import type { AppStore } from "../types";
import birdsData from "../../data/birds.json";
import achievementDefs from "../../data/achievements.json";
import expeditionsData from "../../data/expeditions.json";
import {
  ACHIEVEMENTS_KEY,
  COMPLETED_MISSIONS_KEY,
  DISCOVERY_BADGES_KEY,
  DISCOVERY_MISSIONS_KEY,
  EXPEDITIONS_KEY,
  LISTEN_COUNT_KEY,
  MISSIONS_KEY,
  POINTS_KEY,
  QUEST_KEY,
  TRACKS_KEY,
  loadFromStorage,
  loadMissions,
  saveToStorage,
} from "../persistence";
import {
  checkMissionProgress,
  getAllDiscoverMissions,
} from "../../systems/DiscoverMissionSystem";
import { getAllTracks } from "../../systems/LearningTrackSystem";

const allBirds = birdsData as Bird[];

export interface ProgressionSlice {
  questsOpen: boolean;
  questProgress: QuestProgress[];
  totalPoints: number;
  dailyMissions: DailyMission[];
  missionsPanelOpen: boolean;
  completedMissionCount: number;
  missionNotification: string | null;
  achievements: AchievementProgress[];
  achievementPanelOpen: boolean;
  achievementNotification: string | null;
  listenCount: number;
  expeditions: ExpeditionProgress[];
  expeditionPanelOpen: boolean;
  expeditionNotification: string | null;
  learningTracksOpen: boolean;
  trackProgress: TrackProgress[];
  trackNotification: string | null;
  discoveryMissions: DiscoveryMissionProgress[];
  discoveryMissionsPanelOpen: boolean;
  discoveryBadges: string[];
  discoveryMissionNotification: string | null;

  setQuestsOpen: (open: boolean) => void;
  updateQuestProgress: (questId: string, current: number) => void;
  completeQuest: (questId: string, reward: number) => void;
  setMissionsPanelOpen: (open: boolean) => void;
  updateMissionProgress: (type: DailyMission["type"], region?: string) => void;
  dismissMissionNotification: () => void;
  setAchievementPanelOpen: (open: boolean) => void;
  checkAchievements: () => void;
  dismissAchievementNotification: () => void;
  incrementListenCount: () => void;
  setExpeditionPanelOpen: (open: boolean) => void;
  updateExpeditionProgress: () => void;
  dismissExpeditionNotification: () => void;
  setLearningTracksOpen: (open: boolean) => void;
  updateTrackProgress: () => void;
  dismissTrackNotification: () => void;
  setDiscoveryMissionsPanelOpen: (open: boolean) => void;
  updateDiscoveryMissions: () => void;
  dismissDiscoveryMissionNotification: () => void;
}

export const createProgressionSlice: StateCreator<
  AppStore,
  [],
  [],
  ProgressionSlice
> = (set, get) => ({
  questsOpen: false,
  questProgress: loadFromStorage<QuestProgress[]>(QUEST_KEY, []),
  totalPoints: loadFromStorage<number>(POINTS_KEY, 0),
  dailyMissions: loadMissions(),
  missionsPanelOpen: false,
  completedMissionCount: loadFromStorage<number>(COMPLETED_MISSIONS_KEY, 0),
  missionNotification: null,
  achievements: loadFromStorage<AchievementProgress[]>(ACHIEVEMENTS_KEY, []),
  achievementPanelOpen: false,
  achievementNotification: null,
  listenCount: loadFromStorage<number>(LISTEN_COUNT_KEY, 0),
  expeditions: loadFromStorage<ExpeditionProgress[]>(EXPEDITIONS_KEY, []),
  expeditionPanelOpen: false,
  expeditionNotification: null,
  learningTracksOpen: false,
  trackProgress: loadFromStorage<TrackProgress[]>(TRACKS_KEY, []),
  trackNotification: null,
  discoveryMissions: loadFromStorage<DiscoveryMissionProgress[]>(
    DISCOVERY_MISSIONS_KEY,
    [],
  ),
  discoveryMissionsPanelOpen: false,
  discoveryBadges: loadFromStorage<string[]>(DISCOVERY_BADGES_KEY, []),
  discoveryMissionNotification: null,

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

  setAchievementPanelOpen: (achievementPanelOpen) =>
    set({ achievementPanelOpen }),
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

  setDiscoveryMissionsPanelOpen: (discoveryMissionsPanelOpen) =>
    set({ discoveryMissionsPanelOpen }),
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
  dismissDiscoveryMissionNotification: () =>
    set({ discoveryMissionNotification: null }),
});
