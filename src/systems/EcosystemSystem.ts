import type { Season, TimeOfDay, WorldState } from "../types";

const SEASON_ORDER: Season[] = ["spring", "summer", "autumn", "winter"];

let seasonIndex = 0;
/** 0–1 day phase (used to derive {@link TimeOfDay}) */
let timePhase = 0.35;
let temperature = 18;
let wind = 12;
let ecosystemMs = 0;

const SEASON_LENGTH_MS = 90_000;

function clampPhase(t: number): number {
  let x = t % 1;
  if (x < 0) x += 1;
  return x;
}

function phaseToTimeOfDay(phase: number): TimeOfDay {
  const t = clampPhase(phase);
  if (t >= 0.875 || t < 0.125) return "night";
  if (t < 0.25) return "dawn";
  if (t < 0.45) return "morning";
  if (t < 0.65) return "afternoon";
  return "dusk";
}

export function getCurrentSeason(): Season {
  return SEASON_ORDER[seasonIndex % SEASON_ORDER.length]!;
}

export function getWorldState(): WorldState {
  return {
    season: getCurrentSeason(),
    temperature,
    wind,
    timeOfDay: phaseToTimeOfDay(timePhase),
  };
}

export function tickEcosystem(deltaMs: number): void {
  ecosystemMs += deltaMs;

  while (ecosystemMs >= SEASON_LENGTH_MS) {
    ecosystemMs -= SEASON_LENGTH_MS;
    seasonIndex = (seasonIndex + 1) % SEASON_ORDER.length;
  }

  const dayAdvance = deltaMs / 240_000;
  timePhase = clampPhase(timePhase + dayAdvance);

  const season = getCurrentSeason();
  const baseTemp: Record<Season, number> = {
    spring: 16,
    summer: 26,
    autumn: 14,
    winter: 4,
  };
  const diurnal = Math.sin(timePhase * Math.PI * 2 - Math.PI / 2) * 4;
  temperature = baseTemp[season] + diurnal;

  const windNoise = Math.sin(ecosystemMs / 8000) * 3;
  wind = Math.max(0, 10 + windNoise + (season === "winter" ? 6 : 0));
}

/**
 * Seasonal density multiplier for bird presence by latitude (degrees).
 * Winter favors equatorial latitudes; summer favors more northerly areas.
 */
export function getSeasonalBirdDensityMultiplier(lat: number): number {
  const season = getCurrentSeason();
  const absLat = Math.min(90, Math.abs(lat)) / 90;

  switch (season) {
    case "winter": {
      const equatorBoost = 1 - absLat;
      return 0.55 + 0.45 * equatorBoost;
    }
    case "summer": {
      const northern = Math.max(0, lat) / 90;
      return 0.55 + 0.45 * northern;
    }
    case "spring":
    case "autumn":
      return 0.85 + 0.15 * (1 - absLat);
  }
}
