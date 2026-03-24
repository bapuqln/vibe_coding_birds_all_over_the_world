import migrationsData from "../data/migrations.json";
import type { MigrationRoute, Season } from "../types";

const routes = migrationsData as MigrationRoute[];

export function getAllMigrationRoutes(): MigrationRoute[] {
  return routes;
}

export function getMigrationRouteById(id: string): MigrationRoute | undefined {
  return routes.find((r) => r.id === id);
}

/**
 * Returns migration progress 0–1 based on season.
 * Spring: birds travel northbound (0→1).
 * Autumn: birds travel southbound (0→1).
 * Summer: birds at northern destination (1.0).
 * Winter: birds at southern destination (0.0).
 */
export function getMigrationProgress(season: Season, elapsedFraction: number): number {
  const t = Math.max(0, Math.min(1, elapsedFraction));
  switch (season) {
    case "spring":
      return t;
    case "summer":
      return 1.0;
    case "autumn":
      return 1.0 - t;
    case "winter":
      return 0.0;
  }
}

export function isMigrationActive(season: Season): boolean {
  return season === "spring" || season === "autumn";
}
