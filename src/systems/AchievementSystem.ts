import achievementDefs from "../data/achievements.json";
import type { AchievementDef } from "../types";

const defs = achievementDefs as AchievementDef[];

export function getAllAchievements(): AchievementDef[] {
  return defs;
}

export function getAchievementById(id: string): AchievementDef | undefined {
  return defs.find((a) => a.id === id);
}

export function checkAchievementProgress(
  type: AchievementDef["type"],
  currentCount: number,
): AchievementDef[] {
  return defs.filter((d) => d.type === type && currentCount >= d.requirement);
}
