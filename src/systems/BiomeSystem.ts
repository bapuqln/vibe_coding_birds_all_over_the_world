import biomesData from "../data/biomes.json";
import type { BiomeZone, BiomeType } from "../types";

const biomes = biomesData as BiomeZone[];

export function getBiomeAtPosition(lat: number, lng: number): BiomeZone | null {
  for (const biome of biomes) {
    const dLat = lat - biome.centerLat;
    const dLng = lng - biome.centerLng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist <= biome.radius) return biome;
  }
  return null;
}

export function getBiomeColor(type: BiomeType): string {
  switch (type) {
    case "rainforest": return "#2d5a27";
    case "savannah": return "#c4a035";
    case "arctic": return "#b8d4e3";
    case "ocean": return "#1a8a8a";
    default: return "#ffffff";
  }
}

export function getAllBiomes(): BiomeZone[] {
  return biomes;
}

export function getBiomeById(id: string): BiomeZone | undefined {
  return biomes.find((b) => b.id === id);
}
