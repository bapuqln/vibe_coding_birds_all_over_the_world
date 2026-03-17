import tracksData from "../data/learning-tracks.json";
import type { LearningTrack } from "../types";

const tracks = tracksData as LearningTrack[];

export function getAllTracks(): LearningTrack[] {
  return tracks;
}

export function getTrackById(id: string): LearningTrack | undefined {
  return tracks.find((t) => t.id === id);
}

export function getTrackProgress(
  trackId: string,
  discoveredBirdIds: readonly string[],
): { completed: number; total: number; fraction: number } {
  const track = getTrackById(trackId);
  const discovered = new Set(discoveredBirdIds);
  const total = track?.birdIds.length ?? 0;
  const completed = track ? track.birdIds.filter((id) => discovered.has(id)).length : 0;
  return {
    completed,
    total,
    fraction: total > 0 ? completed / total : 0,
  };
}

export function isTrackComplete(trackId: string, discoveredBirdIds: readonly string[]): boolean {
  const { completed, total } = getTrackProgress(trackId, discoveredBirdIds);
  return total > 0 && completed >= total;
}

/**
 * Returns true if adding `stepId` (a bird id in this track) completes the track.
 */
export function checkTrackCompletion(
  trackId: string,
  stepId: string,
  discoveredBirdIds: readonly string[],
): boolean {
  const track = getTrackById(trackId);
  if (!track || !track.birdIds.includes(stepId)) return false;
  const next = new Set(discoveredBirdIds);
  next.add(stepId);
  return isTrackComplete(trackId, [...next]);
}
