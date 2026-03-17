import type { Season } from "../types";

const SEASON_ORDER: Season[] = ["spring", "summer", "autumn", "winter"];

const MS_PER_FULL_CYCLE = 120_000;

function seasonAt(p: number): Season {
  const idx = Math.floor(p) % SEASON_ORDER.length;
  const safe = idx < 0 ? idx + SEASON_ORDER.length : idx;
  return SEASON_ORDER[safe]!;
}

/**
 * Smooth linear progression through the season cycle (one full loop = 4 seasons).
 * `speed` scales how fast the cycle runs (1 = default).
 */
export function createSeasonController(speed = 1) {
  let position = 0;

  return {
    tick(deltaMs: number): Season {
      position += (deltaMs * speed * SEASON_ORDER.length) / MS_PER_FULL_CYCLE;
      while (position >= SEASON_ORDER.length) position -= SEASON_ORDER.length;
      while (position < 0) position += SEASON_ORDER.length;
      return seasonAt(position);
    },
    /** 0–1 progress within the current season segment */
    getCurrentProgress(): number {
      const frac = position % 1;
      return frac < 0 ? frac + 1 : frac;
    },
  };
}
