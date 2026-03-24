import type { Season } from "../types";

export function shouldShowMigration(season: Season): boolean {
  return season === "spring" || season === "autumn";
}

export function getMigrationDirection(season: Season): "south" | "north" | null {
  if (season === "autumn") return "south";
  if (season === "spring") return "north";
  return null;
}

/**
 * Visual emphasis for migration arcs (0 = off, 1 = full).
 */
export function getMigrationIntensity(season: Season): number {
  if (season === "spring" || season === "autumn") return 1;
  return 0;
}
