import type { StateCreator } from "zustand";
import type { HabitatFilterType, Season, WorldState } from "../../types";
import type { AppStore } from "../types";

export interface EcosystemSlice {
  currentSeason: Season;
  ecosystemState: WorldState;
  activeHabitatFilters: HabitatFilterType[];
  ecosystemPanelOpen: boolean;
  ecosystemManualOverride: boolean;
  activeBiome: string | null;
  biomeAudioEnabled: boolean;

  setCurrentSeason: (season: Season) => void;
  setEcosystemState: (state: WorldState) => void;
  toggleHabitatFilter: (filter: HabitatFilterType) => void;
  clearHabitatFilters: () => void;
  setEcosystemPanelOpen: (open: boolean) => void;
  setEcosystemManualOverride: (override: boolean) => void;
  setActiveBiome: (biome: string | null) => void;
  setBiomeAudioEnabled: (enabled: boolean) => void;
}

export const createEcosystemSlice: StateCreator<
  AppStore,
  [],
  [],
  EcosystemSlice
> = (set) => ({
  currentSeason: "spring",
  ecosystemState: {
    season: "spring",
    temperature: 20,
    wind: 5,
    timeOfDay: "morning",
  },
  activeHabitatFilters: [],
  ecosystemPanelOpen: false,
  ecosystemManualOverride: false,
  activeBiome: null,
  biomeAudioEnabled: true,

  setCurrentSeason: (season) =>
    set((s) => ({
      currentSeason: season,
      ecosystemState: { ...s.ecosystemState, season },
    })),
  setEcosystemState: (ecosystemState) => set({ ecosystemState }),
  toggleHabitatFilter: (filter) =>
    set((s) => {
      const has = s.activeHabitatFilters.includes(filter);
      return {
        activeHabitatFilters: has
          ? s.activeHabitatFilters.filter((f) => f !== filter)
          : [...s.activeHabitatFilters, filter],
      };
    }),
  clearHabitatFilters: () => set({ activeHabitatFilters: [] }),
  setEcosystemPanelOpen: (ecosystemPanelOpen) => set({ ecosystemPanelOpen }),
  setEcosystemManualOverride: (ecosystemManualOverride) =>
    set({ ecosystemManualOverride }),
  setActiveBiome: (activeBiome) => set({ activeBiome }),
  setBiomeAudioEnabled: (biomeAudioEnabled) => set({ biomeAudioEnabled }),
});
