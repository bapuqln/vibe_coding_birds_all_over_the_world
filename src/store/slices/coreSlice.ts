import type { StateCreator } from "zustand";
import type {
  AppMode,
  AudioStatus,
  Language,
  TimeOfDay,
} from "../../types";
import type { AppStore, PanelType } from "../types";

export interface CoreSlice {
  selectedBirdId: string | null;
  language: Language;
  audioStatus: AudioStatus;
  globeReady: boolean;
  modelsReady: boolean;
  hoveredBirdId: string | null;
  guideMessage: string | null;
  guideMessageZh: string | null;
  currentFps: number;
  dynamicLodDistance: number;
  appMode: AppMode;
  birdCardExpanded: boolean;
  radarOpen: boolean;
  heatmapVisible: boolean;
  weatherVisible: boolean;
  timeOfDay: TimeOfDay;
  activePanel: PanelType | null;

  setSelectedBird: (id: string | null) => void;
  toggleLanguage: () => void;
  setAudioStatus: (status: AudioStatus) => void;
  setGlobeReady: (ready: boolean) => void;
  setModelsReady: (ready: boolean) => void;
  setHoveredBird: (id: string | null) => void;
  setGuideMessage: (en: string | null, zh: string | null) => void;
  setCurrentFps: (fps: number) => void;
  setDynamicLodDistance: (distance: number) => void;
  setAppMode: (mode: AppMode) => void;
  setBirdCardExpanded: (expanded: boolean) => void;
  setRadarOpen: (open: boolean) => void;
  setHeatmapVisible: (visible: boolean) => void;
  setWeatherVisible: (visible: boolean) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setActivePanel: (panel: PanelType | null) => void;
}

export const createCoreSlice: StateCreator<AppStore, [], [], CoreSlice> = (
  set,
  get,
) => ({
  selectedBirdId: null,
  language: "zh",
  audioStatus: "idle",
  globeReady: false,
  modelsReady: false,
  hoveredBirdId: null,
  guideMessage: null,
  guideMessageZh: null,
  currentFps: 60,
  dynamicLodDistance: 2.5,
  appMode: "explore",
  birdCardExpanded: true,
  radarOpen: false,
  heatmapVisible: false,
  weatherVisible: false,
  timeOfDay: "morning",
  activePanel: null,

  setSelectedBird: (id) => set({ selectedBirdId: id }),
  toggleLanguage: () =>
    set((state) => ({ language: state.language === "zh" ? "en" : "zh" })),
  setAudioStatus: (audioStatus) => set({ audioStatus }),
  setGlobeReady: (globeReady) => set({ globeReady }),
  setModelsReady: (modelsReady) => set({ modelsReady }),
  setHoveredBird: (hoveredBirdId) => set({ hoveredBirdId }),
  setGuideMessage: (en, zh) => set({ guideMessage: en, guideMessageZh: zh }),
  setCurrentFps: (currentFps) => set({ currentFps }),
  setDynamicLodDistance: (dynamicLodDistance) => set({ dynamicLodDistance }),
  setAppMode: (appMode) => set({ appMode }),
  setBirdCardExpanded: (birdCardExpanded) => set({ birdCardExpanded }),
  setRadarOpen: (radarOpen) => set({ radarOpen }),
  setHeatmapVisible: (heatmapVisible) => set({ heatmapVisible }),
  setWeatherVisible: (weatherVisible) => set({ weatherVisible }),
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),

  setActivePanel: (activePanel) => {
    const state = get();
    if (activePanel === state.activePanel) return;
    const reset: Partial<AppStore> = { activePanel };
    if (activePanel !== null && activePanel !== "birdCard") {
      reset.selectedBirdId = null;
    }
    if (activePanel !== null && activePanel !== "collection") {
      reset.isCollectionOpen = false;
    }
    if (activePanel !== null && activePanel !== "regionFilter") {
      reset.regionFilterOpen = false;
    }
    if (activePanel !== null && activePanel !== "quests") {
      reset.questsOpen = false;
    }
    if (activePanel !== null && activePanel !== "storyExplorer") {
      reset.storyExplorerOpen = false;
    }
    if (activePanel !== null && activePanel !== "encyclopedia") {
      reset.encyclopediaOpen = false;
    }
    if (activePanel !== null && activePanel !== "continentBird") {
      reset.continentPanelRegion = null;
    }
    if (activePanel !== null && activePanel !== "evolution") {
      reset.evolutionTimelineOpen = false;
    }
    if (activePanel !== null && activePanel !== "ar") {
      reset.arViewerBirdId = null;
    }
    if (activePanel !== null && activePanel !== "missions") {
      reset.missionsPanelOpen = false;
    }
    if (activePanel !== null && activePanel !== "photoGallery") {
      reset.photoGalleryOpen = false;
    }
    if (activePanel !== null && activePanel !== "achievements") {
      reset.achievementPanelOpen = false;
    }
    if (activePanel !== null && activePanel !== "expeditions") {
      reset.expeditionPanelOpen = false;
    }
    if (activePanel !== null && activePanel !== "share") {
      reset.sharePanelOpen = false;
    }
    if (activePanel !== null && activePanel !== "aiGuide") {
      reset.aiGuideOpen = false;
    }
    if (activePanel !== null && activePanel !== "classroom") {
      reset.classroomModeActive = false;
    }
    if (activePanel !== null && activePanel !== "sandbox") {
      reset.sandboxModeActive = false;
    }
    if (activePanel !== null && activePanel !== "learningTracks") {
      reset.learningTracksOpen = false;
    }
    if (activePanel !== null && activePanel !== "discoverMissions") {
      reset.discoveryMissionsPanelOpen = false;
    }
    if (activePanel !== null && activePanel !== "ecosystemPanel") {
      reset.ecosystemPanelOpen = false;
    }
    if (activePanel !== null && activePanel !== "journeyPanel") {
      reset.journeyPanelOpen = false;
    }
    if (activePanel !== null && activePanel !== "migrationIntelligence") {
      reset.migrationInfoPathIndex = null;
    }
    set(reset);
  },
});
