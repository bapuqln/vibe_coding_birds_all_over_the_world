import { create } from "zustand";
import type { AudioStatus, Language } from "./types";

interface AppStore {
  selectedBirdId: string | null;
  language: Language;
  audioStatus: AudioStatus;
  globeReady: boolean;
  modelsReady: boolean;

  setSelectedBird: (id: string | null) => void;
  toggleLanguage: () => void;
  setAudioStatus: (status: AudioStatus) => void;
  setGlobeReady: (ready: boolean) => void;
  setModelsReady: (ready: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  selectedBirdId: null,
  language: "zh",
  audioStatus: "idle",
  globeReady: false,
  modelsReady: false,

  setSelectedBird: (id) => set({ selectedBirdId: id }),
  toggleLanguage: () =>
    set((state) => ({ language: state.language === "zh" ? "en" : "zh" })),
  setAudioStatus: (audioStatus) => set({ audioStatus }),
  setGlobeReady: (globeReady) => set({ globeReady }),
  setModelsReady: (modelsReady) => set({ modelsReady }),
}));
