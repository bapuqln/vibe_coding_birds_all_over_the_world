import type { DailyMission, MissionTemplate } from "../types";
import missionTemplates from "../data/missions.json";

export const COLLECTION_KEY = "kids-bird-globe-collection";
export const QUEST_KEY = "kids-bird-globe-quests";
export const STORY_KEY = "kids-bird-globe-stories";
export const POINTS_KEY = "kids-bird-globe-points";
export const DISCOVERY_KEY = "kids-bird-globe-discovered";
export const MISSIONS_KEY = "kids-bird-globe-missions";
export const MISSIONS_DATE_KEY = "kids-bird-globe-missions-date";
export const PHOTOS_KEY = "kids-bird-globe-photos";
export const ACHIEVEMENTS_KEY = "kids-bird-globe-achievements";
export const LISTEN_COUNT_KEY = "kids-bird-globe-listen-count";
export const COMPLETED_MISSIONS_KEY = "kids-bird-globe-completed-missions";
export const EXPEDITIONS_KEY = "kids-bird-globe-expeditions";
export const TRACKS_KEY = "kids-bird-globe-learning-tracks";
export const DISCOVERY_BADGES_KEY = "kids-bird-globe-discovery-badges";
export const DISCOVERY_MISSIONS_KEY = "kids-bird-globe-discovery-missions-progress";
export const JOURNEY_PROGRESS_KEY = "kids-bird-globe-journey-progress";
export const VISITED_STOPS_KEY = "kids-bird-globe-visited-stops";
export const COMPLETED_STORIES_KEY = "kids-bird-globe-completed-stories";

export const MAX_PHOTOS = 50;

const templates = missionTemplates as MissionTemplate[];

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded */
  }
}

export function getTodayKey(): string {
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

export function loadMissions(): DailyMission[] {
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
