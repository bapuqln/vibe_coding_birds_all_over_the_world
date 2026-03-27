import type { TimeState } from "../types";

const MONTHS_PER_SECOND = 0.15;

export function createInitialTimeState(): TimeState {
  return {
    month: 0,
    progress: 0,
    isPlaying: false,
    speed: 1,
  };
}

export function tickTime(state: TimeState, delta: number): TimeState {
  if (!state.isPlaying) return state;

  const advance = delta * MONTHS_PER_SECOND * state.speed;
  let newProgress = state.progress + advance;
  let newMonth = state.month;

  if (newProgress >= 1) {
    newMonth = (newMonth + 1) % 12;
    newProgress -= 1;
  }

  return {
    ...state,
    month: newMonth,
    progress: Math.min(newProgress, 0.9999),
  };
}

export function getMonthLabel(month: number): string {
  const labels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return labels[month % 12];
}

export function getMonthLabelZh(month: number): string {
  const labels = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月",
  ];
  return labels[month % 12];
}

export function isSpringMigration(month: number): boolean {
  return month >= 2 && month <= 4;
}

export function isAutumnMigration(month: number): boolean {
  return month >= 8 && month <= 10;
}

export function isMigrationSeason(month: number): boolean {
  return isSpringMigration(month) || isAutumnMigration(month);
}

export function getSeasonForMonth(month: number): "winter" | "spring" | "summer" | "autumn" {
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}
