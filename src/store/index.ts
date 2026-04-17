import { create } from "zustand";
import type { AppStore } from "./types";
export type { AppStore, PanelType } from "./types";
import { createCoreSlice } from "./slices/coreSlice";
import { createDiscoverySlice } from "./slices/discoverySlice";
import { createProgressionSlice } from "./slices/progressionSlice";
import { createPhotoSlice } from "./slices/photoSlice";
import { createQuizSlice } from "./slices/quizSlice";
import { createSoundSlice } from "./slices/soundSlice";
import { createTourSlice } from "./slices/tourSlice";
import { createStorySlice } from "./slices/storySlice";
import { createAiGuideSlice } from "./slices/aiGuideSlice";
import { createEcosystemSlice } from "./slices/ecosystemSlice";
import { createMigrationSlice } from "./slices/migrationSlice";
import { createSpecialModesSlice } from "./slices/specialModesSlice";

export const useAppStore = create<AppStore>()((...a) => ({
  ...createCoreSlice(...a),
  ...createDiscoverySlice(...a),
  ...createProgressionSlice(...a),
  ...createPhotoSlice(...a),
  ...createQuizSlice(...a),
  ...createSoundSlice(...a),
  ...createTourSlice(...a),
  ...createStorySlice(...a),
  ...createAiGuideSlice(...a),
  ...createEcosystemSlice(...a),
  ...createMigrationSlice(...a),
  ...createSpecialModesSlice(...a),
}));
