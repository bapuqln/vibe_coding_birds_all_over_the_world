import type { StateCreator } from "zustand";
import type { CollectedBird } from "../../types";
import type { AppStore } from "../types";
import {
  COLLECTION_KEY,
  DISCOVERY_KEY,
  loadFromStorage,
  saveToStorage,
} from "../persistence";

export interface DiscoverySlice {
  collectedBirds: CollectedBird[];
  isCollectionOpen: boolean;
  discoveredBirds: string[];
  discoveryNotification: string | null;
  encyclopediaOpen: boolean;
  encyclopediaEntryBirdId: string | null;
  continentPanelRegion: string | null;
  activeRegion: string | null;
  regionFilterOpen: boolean;
  compareBirdA: string | null;
  compareBirdB: string | null;
  compareMode: boolean;
  evolutionTimelineOpen: boolean;
  evolutionTimelineValue: number;

  collectBird: (birdId: string) => void;
  setCollectionOpen: (open: boolean) => void;
  discoverBird: (birdId: string) => void;
  dismissDiscoveryNotification: () => void;
  setEncyclopediaOpen: (open: boolean) => void;
  setEncyclopediaEntryBirdId: (id: string | null) => void;
  setContinentPanelRegion: (region: string | null) => void;
  setActiveRegion: (region: string | null) => void;
  setRegionFilterOpen: (open: boolean) => void;
  setCompareMode: (mode: boolean) => void;
  setCompareBirdA: (id: string | null) => void;
  setCompareBirdB: (id: string | null) => void;
  setEvolutionTimelineOpen: (open: boolean) => void;
  setEvolutionTimelineValue: (value: number) => void;
}

export const createDiscoverySlice: StateCreator<
  AppStore,
  [],
  [],
  DiscoverySlice
> = (set, get) => ({
  collectedBirds: loadFromStorage<CollectedBird[]>(COLLECTION_KEY, []),
  isCollectionOpen: false,
  discoveredBirds: loadFromStorage<string[]>(DISCOVERY_KEY, []),
  discoveryNotification: null,
  encyclopediaOpen: false,
  encyclopediaEntryBirdId: null,
  continentPanelRegion: null,
  activeRegion: null,
  regionFilterOpen: false,
  compareBirdA: null,
  compareBirdB: null,
  compareMode: false,
  evolutionTimelineOpen: false,
  evolutionTimelineValue: 3,

  collectBird: (birdId) => {
    const state = get();
    if (state.collectedBirds.some((b) => b.birdId === birdId)) return;
    const updated = [
      ...state.collectedBirds,
      { birdId, collectedAt: Date.now() },
    ];
    saveToStorage(COLLECTION_KEY, updated);
    set({ collectedBirds: updated });
  },
  setCollectionOpen: (isCollectionOpen) => set({ isCollectionOpen }),

  discoverBird: (birdId) => {
    const state = get();
    if (state.discoveredBirds.includes(birdId)) return;
    const updated = [...state.discoveredBirds, birdId];
    saveToStorage(DISCOVERY_KEY, updated);
    set({ discoveredBirds: updated, discoveryNotification: birdId });
    setTimeout(() => get().updateExpeditionProgress(), 100);
    setTimeout(() => get().updateTrackProgress(), 100);
    setTimeout(() => get().updateDiscoveryMissions(), 150);
  },
  dismissDiscoveryNotification: () => set({ discoveryNotification: null }),

  setEncyclopediaOpen: (encyclopediaOpen) => set({ encyclopediaOpen }),
  setEncyclopediaEntryBirdId: (encyclopediaEntryBirdId) =>
    set({ encyclopediaEntryBirdId }),
  setContinentPanelRegion: (continentPanelRegion) =>
    set({ continentPanelRegion }),
  setActiveRegion: (activeRegion) => set({ activeRegion }),
  setRegionFilterOpen: (regionFilterOpen) => set({ regionFilterOpen }),

  setCompareMode: (compareMode) => set({ compareMode }),
  setCompareBirdA: (compareBirdA) => set({ compareBirdA }),
  setCompareBirdB: (compareBirdB) => set({ compareBirdB }),

  setEvolutionTimelineOpen: (evolutionTimelineOpen) =>
    set({ evolutionTimelineOpen }),
  setEvolutionTimelineValue: (evolutionTimelineValue) =>
    set({ evolutionTimelineValue }),
});
