import type { FlockConfig, MigrationIntelligencePath } from "../types";
import { getAllMigrationIntelligencePaths } from "./migration-paths";

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateFlockConfigs(): FlockConfig[] {
  const paths = getAllMigrationIntelligencePaths();
  return paths.map((path: MigrationIntelligencePath, index: number) => {
    const rng = seededRandom(index * 31 + 7);
    const instanceCount = 3 + Math.floor(rng() * 6);
    const offsets: number[] = [];
    for (let i = 0; i < instanceCount; i++) {
      offsets.push((rng() - 0.5) * 0.02);
    }
    return {
      birdId: path.birdId,
      instanceCount,
      pathIndex: index,
      offsets,
    };
  });
}
