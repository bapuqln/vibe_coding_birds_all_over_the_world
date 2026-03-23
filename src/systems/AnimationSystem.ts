import type { BirdAnimState } from "../types";

export interface AnimStateConfig {
  state: BirdAnimState;
  duration: number;
  nextState: BirdAnimState;
}

const STATE_CONFIGS: Record<BirdAnimState, AnimStateConfig> = {
  idle: { state: "idle", duration: 8000 + Math.random() * 7000, nextState: "takeoff" },
  takeoff: { state: "takeoff", duration: 800, nextState: "flying" },
  flying: { state: "flying", duration: 3000 + Math.random() * 4000, nextState: "landing" },
  landing: { state: "landing", duration: 600, nextState: "perching" },
  perching: { state: "perching", duration: 5000 + Math.random() * 10000, nextState: "idle" },
};

export function getStateConfig(state: BirdAnimState): AnimStateConfig {
  return STATE_CONFIGS[state];
}

export function getAnimationParams(state: BirdAnimState, progress: number): {
  wingFlap: number;
  altitude: number;
  headTurn: number;
  tailFlick: number;
} {
  const t = Math.min(progress, 1);

  switch (state) {
    case "takeoff":
      return {
        wingFlap: Math.sin(t * Math.PI * 8) * 0.15,
        altitude: t * 0.08,
        headTurn: 0,
        tailFlick: 0,
      };
    case "flying":
      return {
        wingFlap: Math.sin(t * Math.PI * 4) * 0.08,
        altitude: 0.06 + Math.sin(t * Math.PI * 2) * 0.02,
        headTurn: Math.sin(t * Math.PI) * 0.1,
        tailFlick: 0,
      };
    case "landing":
      return {
        wingFlap: Math.sin(t * Math.PI * 6) * 0.12 * (1 - t),
        altitude: 0.06 * (1 - t),
        headTurn: 0,
        tailFlick: 0,
      };
    case "perching":
      return {
        wingFlap: 0,
        altitude: 0,
        headTurn: Math.sin(t * Math.PI * 3) * 0.15,
        tailFlick: Math.sin(t * Math.PI * 5) * 0.05,
      };
    default:
      return {
        wingFlap: Math.sin(t * Math.PI * 2) * 0.04,
        altitude: Math.sin(t * Math.PI * 2) * 0.02,
        headTurn: 0,
        tailFlick: 0,
      };
  }
}

export function shouldTransition(elapsed: number, config: AnimStateConfig): boolean {
  return elapsed >= config.duration;
}
