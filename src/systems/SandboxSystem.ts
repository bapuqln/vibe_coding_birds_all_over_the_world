import type { SpawnedBird } from "../types";

const MAX_SPAWNED = 50;

export function canSpawnBird(current: SpawnedBird[]): boolean {
  return current.length < MAX_SPAWNED;
}

export function createSpawnedBird(birdId: string, lat: number, lng: number): SpawnedBird {
  return {
    id: `spawned-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    birdId,
    lat,
    lng,
    spawnedAt: Date.now(),
  };
}

export function removeSpawnedBird(birds: SpawnedBird[], id: string): SpawnedBird[] {
  return birds.filter((b) => b.id !== id);
}

export function clearAllSpawned(): SpawnedBird[] {
  return [];
}

export function sunAngleFromHour(hour: number): number {
  return ((hour / 24) * Math.PI * 2) - Math.PI / 2;
}
