import type { Bird, HabitatFilterType } from "../types";

export type { HabitatFilterType };

export function mapHabitatToFilter(habitatType: string): HabitatFilterType {
  const map: Record<string, HabitatFilterType> = {
    rainforest: "forest",
    forest: "forest",
    wetlands: "wetlands",
    coast: "ocean",
    ocean: "ocean",
    grassland: "grassland",
    mountains: "mountain",
    polar: "mountain",
    desert: "grassland",
    tundra: "mountain",
  };
  return map[habitatType] ?? "grassland";
}

export function filterBirdsByHabitat(birds: Bird[], activeFilters: HabitatFilterType[]): Bird[] {
  if (activeFilters.length === 0) return birds;

  const set = new Set(activeFilters);
  return birds.filter((b) => {
    const raw = b.habitatType ?? "";
    const cat = mapHabitatToFilter(raw);
    return set.has(cat);
  });
}
