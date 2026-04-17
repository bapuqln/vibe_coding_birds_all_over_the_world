# Store Slice Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the 1,372-line `src/store.ts` monolith into composable zustand slices while preserving the single-store contract (`useAppStore` and its selector API remain unchanged).

**Architecture:** Zustand v5 slice-composition pattern. Each slice is a `StateCreator<AppStore, [], [], SliceShape>` living in its own file under `src/store/slices/`. The combined `useAppStore` spreads all slices. Every slice gets the typed full-store `get()`, so cross-slice calls (e.g. `discoverBird` calling `updateExpeditionProgress`) still work by name.

**Tech Stack:** TypeScript strict, zustand 5.0.x, Vite 8 (rolldown). No test runner exists in this project, so each task's verification gate is `tsc -b` + `vite build`.

**Safety invariants:**
- `useAppStore` import path stays `@/store` (via directory index). No consumer file in `src/` gets modified.
- `AppStore` public type stays identical (union of slice shapes).
- localStorage keys and persistence behaviour unchanged.
- Zero field renames during this refactor. Pure relocation.
- Each task produces a green `tsc -b && vite build`. Commit after each task.

**Final layout:**

```
src/store/
├── index.ts              — create(), composes all slices, exports useAppStore + AppStore type
├── types.ts              — PanelType, AppStore (union), storage-key constants
├── persistence.ts        — loadFromStorage, saveToStorage, loadMissions, getTodayKey, generateMissions, MAX_PHOTOS
└── slices/
    ├── coreSlice.ts          — selection, language, audio, globe/models ready, hover, guide msg, fps/lod, appMode, birdCard, activePanel, radar, heatmap, weather, timeOfDay
    ├── discoverySlice.ts     — collectedBirds, discoveredBirds, encyclopedia, continents, activeRegion, compare, evolution timeline
    ├── progressionSlice.ts   — quests, dailyMissions, achievements, expeditions, tracks, discoveryMissions (and their notifications/badges/counters)
    ├── photoSlice.ts         — birdPhotos, photographer, sharePanel, screenshots
    ├── quizSlice.ts          — quiz game state
    ├── soundSlice.ts         — soundGuess + soundRecognition
    ├── tourSlice.ts          — guided tour
    ├── storySlice.ts         — storyExplorer + storyAdventure mode
    ├── aiGuideSlice.ts       — aiGuide + birdExplanation + tts
    ├── ecosystemSlice.ts     — season, ecosystemState, habitat filters, ecosystem panel, biome
    ├── migrationSlice.ts     — migration mode, showAllRoutes, speed, timeState, info path, journey
    └── specialModesSlice.ts  — classroom, sandbox, AR
```

The existing `src/store.ts` file is deleted at the end; `src/store/` directory's `index.ts` takes its place. TypeScript module resolution treats `from "../../store"` as the directory automatically.

---

## Preflight

- [ ] **Step P1: Verify current state is clean**

Run: `git status`
Expected: working tree has only the modifications from the earlier session already committed. If unexpected files, stop and ask.

- [ ] **Step P2: Baseline build sanity**

Run: `zsh -c './node_modules/.bin/tsc -b --force && ./node_modules/.bin/vite build'`
Expected: both exit 0. Note the dist chunk sizes — will re-check at the end to confirm no regression.

- [ ] **Step P3: Create target directory structure**

Run: `mkdir -p src/store/slices`
Expected: no output, directory exists.

---

## Task 1: Move store.ts to src/store/index.ts (pure relocation)

**Files:**
- Move: `src/store.ts` → `src/store/index.ts`

- [ ] **Step 1.1: Git-move the file**

Run: `git mv src/store.ts src/store/index.ts`
Expected: no output.

- [ ] **Step 1.2: Verify TypeScript resolves the new path**

Run: `zsh -c './node_modules/.bin/tsc -b --force'`
Expected: exit 0, no errors. TypeScript's moduleResolution "bundler" will find `src/store/index.ts` when consumers import from `"../../store"`.

- [ ] **Step 1.3: Verify vite build**

Run: `zsh -c './node_modules/.bin/vite build'`
Expected: exit 0. Chunks still build.

- [ ] **Step 1.4: Commit**

```bash
git add src/store/index.ts
git commit -m "refactor(store): move src/store.ts to src/store/index.ts in prep for slicing"
```

---

## Task 2: Extract persistence helpers and storage keys

**Files:**
- Create: `src/store/persistence.ts`
- Modify: `src/store/index.ts` (remove the extracted lines, add import)

- [ ] **Step 2.1: Create `src/store/persistence.ts`**

Write exactly:

```ts
import type { DailyMission, MissionTemplate } from "../types";
import missionTemplates from "../data/missions.json";

export const COLLECTION_KEY = "kids-bird-globe-collection";
export const QUEST_KEY = "kids-bird-globe-quests";
export const STORY_KEY = "kids-bird-globe-stories";
export const POINTS_KEY = "kids-bird-globe-points";
export const DISCOVERY_KEY = "kids-bird-globe-discovered";
export const MISSIONS_KEY = "kids-bird-globe-missions";
export const MISSIONS_DATE_KEY = "kids-bird-globe-missions-date";
export const PHOTOS_KEY = "kids-bird-globe-photos";
export const ACHIEVEMENTS_KEY = "kids-bird-globe-achievements";
export const LISTEN_COUNT_KEY = "kids-bird-globe-listen-count";
export const COMPLETED_MISSIONS_KEY = "kids-bird-globe-completed-missions";
export const EXPEDITIONS_KEY = "kids-bird-globe-expeditions";
export const TRACKS_KEY = "kids-bird-globe-learning-tracks";
export const DISCOVERY_BADGES_KEY = "kids-bird-globe-discovery-badges";
export const DISCOVERY_MISSIONS_KEY = "kids-bird-globe-discovery-missions-progress";
export const JOURNEY_PROGRESS_KEY = "kids-bird-globe-journey-progress";
export const VISITED_STOPS_KEY = "kids-bird-globe-visited-stops";
export const COMPLETED_STORIES_KEY = "kids-bird-globe-completed-stories";

export const MAX_PHOTOS = 50;

const templates = missionTemplates as MissionTemplate[];

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded */
  }
}

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function generateMissions(): DailyMission[] {
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 4);
  return selected.map((t) => ({
    id: `${t.id}-${getTodayKey()}`,
    templateId: t.id,
    type: t.type,
    titleZh: t.titleZh,
    titleEn: t.titleEn,
    target: t.target,
    goal: t.goal,
    current: 0,
    completed: false,
    badge: t.badge,
  }));
}

export function loadMissions(): DailyMission[] {
  const savedDate = loadFromStorage<string>(MISSIONS_DATE_KEY, "");
  const today = getTodayKey();
  if (savedDate === today) {
    return loadFromStorage<DailyMission[]>(MISSIONS_KEY, []);
  }
  const missions = generateMissions();
  saveToStorage(MISSIONS_KEY, missions);
  saveToStorage(MISSIONS_DATE_KEY, today);
  return missions;
}
```

Note: also extracted `COMPLETED_STORIES_KEY` (string literal was inline at `completeStoryAdventure`) so all persistence keys live together.

- [ ] **Step 2.2: Strip the extracted lines from `src/store/index.ts`**

In `src/store/index.ts`, delete lines that are now in `persistence.ts`:

1. Remove these imports:
```ts
import missionTemplates from "./data/missions.json";
```
(keep the birds/achievements/expeditions data imports — they're still used inside the store body.)

2. Remove these constants (all `*_KEY` declarations in the top block):
```ts
const COLLECTION_KEY = "kids-bird-globe-collection";
// ...all the way through...
const VISITED_STOPS_KEY = "kids-bird-globe-visited-stops";
```

3. Remove `const templates = missionTemplates as MissionTemplate[];`
4. Remove `const MAX_PHOTOS = 50;`
5. Remove functions: `getTodayKey`, `generateMissions`, `loadMissions`, `loadFromStorage`, `saveToStorage`.

6. Add to the top import block of `src/store/index.ts`:

```ts
import {
  loadFromStorage,
  saveToStorage,
  loadMissions,
  COLLECTION_KEY,
  QUEST_KEY,
  STORY_KEY,
  POINTS_KEY,
  DISCOVERY_KEY,
  MISSIONS_KEY,
  PHOTOS_KEY,
  ACHIEVEMENTS_KEY,
  LISTEN_COUNT_KEY,
  COMPLETED_MISSIONS_KEY,
  EXPEDITIONS_KEY,
  TRACKS_KEY,
  DISCOVERY_BADGES_KEY,
  DISCOVERY_MISSIONS_KEY,
  JOURNEY_PROGRESS_KEY,
  VISITED_STOPS_KEY,
  COMPLETED_STORIES_KEY,
  MAX_PHOTOS,
} from "./persistence";
```

7. Replace the inline string literal `"kids-bird-globe-completed-stories"` inside `completeStoryAdventure` with `COMPLETED_STORIES_KEY`. (Grep confirms: lines 584 and 1121 in the current file use this literal twice.)

   - Line with `completedStories: loadFromStorage<string[]>("kids-bird-globe-completed-stories", []),` → `completedStories: loadFromStorage<string[]>(COMPLETED_STORIES_KEY, []),`
   - Line with `saveToStorage("kids-bird-globe-completed-stories", updated);` → `saveToStorage(COMPLETED_STORIES_KEY, updated);`

8. Remove now-unused type imports from the top (e.g. `MissionTemplate` — no longer referenced inside `index.ts` if only used in generateMissions).

   Check and remove if unused: grep `MissionTemplate` in `src/store/index.ts` — if zero hits outside the type import, remove it from the type import block.

- [ ] **Step 2.3: Verify build**

Run: `zsh -c './node_modules/.bin/tsc -b --force'`
Expected: exit 0. If TS reports "unused import" for a type, remove it.

Run: `zsh -c './node_modules/.bin/vite build'`
Expected: exit 0.

- [ ] **Step 2.4: Commit**

```bash
git add src/store/persistence.ts src/store/index.ts
git commit -m "refactor(store): extract persistence helpers and storage keys"
```

---

## Task 3: Create `src/store/types.ts` with AppStore union scaffold

**Files:**
- Create: `src/store/types.ts`
- Modify: `src/store/index.ts` (re-export, no behaviour change yet)

Rationale: locks the public `AppStore` and `PanelType` types in a stable file before we start splitting. All slice files will import `AppStore` from here for their `StateCreator<AppStore, ...>` signature.

- [ ] **Step 3.1: Create `src/store/types.ts`**

Content: copy the `PanelType` union and the full `AppStore` interface from the current `src/store/index.ts` verbatim. Export both. Prepend imports for every type the interface uses (they're currently imported at the top of index.ts).

Exact content:

```ts
import type {
  AchievementProgress,
  AppMode,
  AudioStatus,
  BirdPhoto,
  CollectedBird,
  DailyMission,
  DiscoveryMissionProgress,
  ExpeditionProgress,
  HabitatFilterType,
  JourneyProgress,
  KnowledgeResult,
  Language,
  PhotoScore,
  QuestProgress,
  QuizQuestion,
  QuizState,
  Season,
  SoundGuessOption,
  SoundGuessState,
  SpawnedBird,
  StoryPlayState,
  TimeOfDay,
  TimeState,
  TourState,
  TrackProgress,
  TTSStatus,
  WorldState,
} from "../types";

export type PanelType =
  | "birdCard"
  | "collection"
  | "regionFilter"
  | "quests"
  | "tour"
  | "quiz"
  | "soundGuess"
  | "encyclopedia"
  | "continentBird"
  | "storyExplorer"
  | "evolution"
  | "ar"
  | "missions"
  | "photoGallery"
  | "achievements"
  | "expeditions"
  | "share"
  | "aiGuide"
  | "photographer"
  | "classroom"
  | "sandbox"
  | "learningTracks"
  | "discoverMissions"
  | "ecosystemPanel"
  | "journeyPanel"
  | "migrationIntelligence";

export interface AppStore {
  /* paste EVERY field + every action signature from the current AppStore interface
     in src/store/index.ts, unchanged. Preserve comments, order, and groupings. */
}
```

When filling the interface body, copy lines from the current `src/store/index.ts` interface declaration exactly (fields + action signatures). Do not edit field names or types.

- [ ] **Step 3.2: Update `src/store/index.ts` to import `AppStore` from new types file**

1. Delete the entire `export type PanelType = ...` union in `src/store/index.ts`.
2. Delete the entire `interface AppStore { ... }` block.
3. Change the `create` call:

   From: `export const useAppStore = create<AppStore>((set, get) => ({`
   To: `export const useAppStore = create<AppStore>()((set, get) => ({`

   (Note the extra `()` — zustand v5 curried pattern. This is required when we later use `StateCreator<AppStore, [], [], SliceShape>`.)

4. Add imports near the top of `src/store/index.ts`:

```ts
import type { AppStore, PanelType } from "./types";
export type { AppStore, PanelType } from "./types";
```

The `export type` re-export preserves the `PanelType` public export that existing consumers may rely on.

- [ ] **Step 3.3: Verify build**

Run: `zsh -c './node_modules/.bin/tsc -b --force'`
Expected: exit 0.

Run: `zsh -c './node_modules/.bin/vite build'`
Expected: exit 0.

If `tsc` complains about the `create<AppStore>()((set, get) => ...)` curried syntax, the zustand version may differ. Check `node_modules/zustand/package.json` version — needs ^5.0.0. (package.json says `^5.0.12`, so this should be fine.)

- [ ] **Step 3.4: Commit**

```bash
git add src/store/types.ts src/store/index.ts
git commit -m "refactor(store): extract AppStore/PanelType into dedicated types module"
```

---

## Task 4: Extract `coreSlice`

Covers ~25 fields that are UI chrome / global meta — not tied to any single gameplay system.

**Fields (state + defaults + actions) to move:**

| State field | Initial | Action(s) |
|-------------|---------|-----------|
| `selectedBirdId` | `null` | `setSelectedBird` |
| `language` | `"zh"` | `toggleLanguage` |
| `audioStatus` | `"idle"` | `setAudioStatus` |
| `globeReady` | `false` | `setGlobeReady` |
| `modelsReady` | `false` | `setModelsReady` |
| `hoveredBirdId` | `null` | `setHoveredBird` |
| `guideMessage` | `null` | (paired) `setGuideMessage` |
| `guideMessageZh` | `null` | (paired) |
| `currentFps` | `60` | `setCurrentFps` |
| `dynamicLodDistance` | `2.5` | `setDynamicLodDistance` |
| `appMode` | `"explore"` | `setAppMode` |
| `birdCardExpanded` | `true` | `setBirdCardExpanded` |
| `radarOpen` | `false` | `setRadarOpen` |
| `heatmapVisible` | `false` | `setHeatmapVisible` |
| `weatherVisible` | `false` | `setWeatherVisible` |
| `timeOfDay` | `"morning"` | `setTimeOfDay` |
| `activePanel` | `null` | `setActivePanel` (complex, reads full store) |

**Files:**
- Create: `src/store/slices/coreSlice.ts`
- Modify: `src/store/index.ts`

- [ ] **Step 4.1: Create the slice file**

```ts
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
```

- [ ] **Step 4.2: Update `src/store/index.ts` to compose core slice**

1. In `src/store/index.ts`, delete the state-init lines for every field listed above from inside the `create<AppStore>()((set, get) => ({ ... }))` body.

2. Delete the corresponding action definitions (`setSelectedBird`, `toggleLanguage`, `setAudioStatus`, `setGlobeReady`, `setModelsReady`, `setHoveredBird`, `setGuideMessage`, `setCurrentFps`, `setDynamicLodDistance`, `setAppMode`, `setBirdCardExpanded`, `setRadarOpen`, `setHeatmapVisible`, `setWeatherVisible`, `setTimeOfDay`, `setActivePanel`).

3. Add import at the top of `src/store/index.ts`:
```ts
import { createCoreSlice } from "./slices/coreSlice";
```

4. Change the `create` call body to spread the slice:
```ts
export const useAppStore = create<AppStore>()((...a) => ({
  ...createCoreSlice(...a),
  // rest of the still-inline state + actions
  encyclopediaOpen: false,
  // ... (remaining lines unchanged)
}));
```

Note the `(...a) =>` spread pattern — lets us pass `set, get, store` tuple to each slice factory.

- [ ] **Step 4.3: Verify build**

Run: `zsh -c './node_modules/.bin/tsc -b --force'`
Expected: exit 0. TypeScript enforces that `CoreSlice` + remaining inline state = full `AppStore`.

Run: `zsh -c './node_modules/.bin/vite build'`
Expected: exit 0.

- [ ] **Step 4.4: Smoke-check a consumer**

Grep one selector to confirm it still type-checks: `grep -rn 'useAppStore((s) => s.language)' src/`
Expected: matches exist (e.g. in `LangToggle.tsx`). No need to edit — types flow through.

- [ ] **Step 4.5: Commit**

```bash
git add src/store/slices/coreSlice.ts src/store/index.ts
git commit -m "refactor(store): extract coreSlice (chrome + appMode + activePanel)"
```

---

## Task 5: Extract `discoverySlice`

**Fields & actions to move:**

- `collectedBirds: CollectedBird[]` / `isCollectionOpen: boolean` — actions: `collectBird`, `setCollectionOpen`
- `discoveredBirds: string[]` / `discoveryNotification: string | null` — actions: `discoverBird`, `dismissDiscoveryNotification`
- `encyclopediaOpen: boolean` / `encyclopediaEntryBirdId: string | null` — `setEncyclopediaOpen`, `setEncyclopediaEntryBirdId`
- `continentPanelRegion: string | null` — `setContinentPanelRegion`
- `activeRegion: string | null` / `regionFilterOpen: boolean` — `setActiveRegion`, `setRegionFilterOpen`
- `compareBirdA / compareBirdB / compareMode` — `setCompareMode`, `setCompareBirdA`, `setCompareBirdB`
- `evolutionTimelineOpen: boolean` / `evolutionTimelineValue: number` — `setEvolutionTimelineOpen`, `setEvolutionTimelineValue`

`discoverBird` is cross-cutting: it calls `get().updateExpeditionProgress()`, `get().updateTrackProgress()`, `get().updateDiscoveryMissions()` (via setTimeout). Those actions still live in the monolith at this point; they'll keep working via `get()` because `AppStore` type includes them.

**Files:**
- Create: `src/store/slices/discoverySlice.ts`
- Modify: `src/store/index.ts`

- [ ] **Step 5.1: Create slice file**

```ts
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
```

- [ ] **Step 5.2: Remove extracted lines from `src/store/index.ts`**

Remove from the state-init body:
- `collectedBirds`, `isCollectionOpen`, `discoveredBirds`, `discoveryNotification`
- `encyclopediaOpen`, `encyclopediaEntryBirdId`, `continentPanelRegion`
- `activeRegion`, `regionFilterOpen`
- `compareBirdA`, `compareBirdB`, `compareMode`
- `evolutionTimelineOpen`, `evolutionTimelineValue`

Remove from actions:
- `collectBird`, `setCollectionOpen`
- `discoverBird`, `dismissDiscoveryNotification`
- `setEncyclopediaOpen`, `setEncyclopediaEntryBirdId`, `setContinentPanelRegion`
- `setActiveRegion`, `setRegionFilterOpen`
- `setCompareMode`, `setCompareBirdA`, `setCompareBirdB`
- `setEvolutionTimelineOpen`, `setEvolutionTimelineValue`

Add to imports and spread:
```ts
import { createDiscoverySlice } from "./slices/discoverySlice";
// inside create():
  ...createCoreSlice(...a),
  ...createDiscoverySlice(...a),
```

- [ ] **Step 5.3: Verify build**

Run: `zsh -c './node_modules/.bin/tsc -b --force && ./node_modules/.bin/vite build'`
Expected: exit 0.

- [ ] **Step 5.4: Commit**

```bash
git add src/store/slices/discoverySlice.ts src/store/index.ts
git commit -m "refactor(store): extract discoverySlice (collection, discovered, encyclopedia, regions, compare)"
```

---

## Task 6: Extract `progressionSlice`

The six progression subsystems (quests, dailyMissions, achievements, expeditions, learningTracks, discoveryMissions). They share a pattern: a list of progress records + a completion notification + persistence. Grouping avoids 6 tiny files.

**State fields:**
- quests: `questsOpen`, `questProgress`, `totalPoints`
- dailyMissions: `dailyMissions`, `missionsPanelOpen`, `completedMissionCount`, `missionNotification`
- achievements: `achievements`, `achievementPanelOpen`, `achievementNotification`, `listenCount`
- expeditions: `expeditions`, `expeditionPanelOpen`, `expeditionNotification`
- tracks: `learningTracksOpen`, `trackProgress`, `trackNotification`
- discoveryMissions: `discoveryMissions`, `discoveryMissionsPanelOpen`, `discoveryBadges`, `discoveryMissionNotification`

**Actions:**
- Quests: `setQuestsOpen`, `updateQuestProgress`, `completeQuest`
- Missions: `setMissionsPanelOpen`, `updateMissionProgress`, `dismissMissionNotification`
- Achievements: `setAchievementPanelOpen`, `checkAchievements`, `dismissAchievementNotification`, `incrementListenCount`
- Expeditions: `setExpeditionPanelOpen`, `updateExpeditionProgress`, `dismissExpeditionNotification`
- Tracks: `setLearningTracksOpen`, `updateTrackProgress`, `dismissTrackNotification`
- DiscoveryMissions: `setDiscoveryMissionsPanelOpen`, `updateDiscoveryMissions`, `dismissDiscoveryMissionNotification`

**Dependencies:** reads `state.discoveredBirds`, `state.birdPhotos`, `state.completedMissionCount`, `state.listenCount` — all from `get()` which sees the full `AppStore`. Also imports data files: `achievementDefs`, `expeditionsData`, `missionTemplates` (loading), `getAllTracks`, `getAllDiscoverMissions`, `checkMissionProgress`, `allBirds`.

**Files:**
- Create: `src/store/slices/progressionSlice.ts`
- Modify: `src/store/index.ts`

- [ ] **Step 6.1: Create slice file**

Build `src/store/slices/progressionSlice.ts` by copying these exact blocks from the current `src/store/index.ts`:

```ts
import type { StateCreator } from "zustand";
import type {
  AchievementDef,
  AchievementProgress,
  DailyMission,
  DiscoveryMissionProgress,
  Expedition,
  ExpeditionProgress,
  QuestProgress,
  TrackProgress,
} from "../../types";
import type { AppStore } from "../types";
import type { Bird } from "../../types";
import birdsData from "../../data/birds.json";
import achievementDefs from "../../data/achievements.json";
import expeditionsData from "../../data/expeditions.json";
import {
  ACHIEVEMENTS_KEY,
  COMPLETED_MISSIONS_KEY,
  DISCOVERY_BADGES_KEY,
  DISCOVERY_MISSIONS_KEY,
  EXPEDITIONS_KEY,
  LISTEN_COUNT_KEY,
  MISSIONS_KEY,
  POINTS_KEY,
  QUEST_KEY,
  TRACKS_KEY,
  loadFromStorage,
  loadMissions,
  saveToStorage,
} from "../persistence";
import {
  checkMissionProgress,
  getAllDiscoverMissions,
} from "../../systems/DiscoverMissionSystem";
import { getAllTracks } from "../../systems/LearningTrackSystem";

const allBirds = birdsData as Bird[];

export interface ProgressionSlice {
  questsOpen: boolean;
  questProgress: QuestProgress[];
  totalPoints: number;
  dailyMissions: DailyMission[];
  missionsPanelOpen: boolean;
  completedMissionCount: number;
  missionNotification: string | null;
  achievements: AchievementProgress[];
  achievementPanelOpen: boolean;
  achievementNotification: string | null;
  listenCount: number;
  expeditions: ExpeditionProgress[];
  expeditionPanelOpen: boolean;
  expeditionNotification: string | null;
  learningTracksOpen: boolean;
  trackProgress: TrackProgress[];
  trackNotification: string | null;
  discoveryMissions: DiscoveryMissionProgress[];
  discoveryMissionsPanelOpen: boolean;
  discoveryBadges: string[];
  discoveryMissionNotification: string | null;

  setQuestsOpen: (open: boolean) => void;
  updateQuestProgress: (questId: string, current: number) => void;
  completeQuest: (questId: string, reward: number) => void;
  setMissionsPanelOpen: (open: boolean) => void;
  updateMissionProgress: (type: DailyMission["type"], region?: string) => void;
  dismissMissionNotification: () => void;
  setAchievementPanelOpen: (open: boolean) => void;
  checkAchievements: () => void;
  dismissAchievementNotification: () => void;
  incrementListenCount: () => void;
  setExpeditionPanelOpen: (open: boolean) => void;
  updateExpeditionProgress: () => void;
  dismissExpeditionNotification: () => void;
  setLearningTracksOpen: (open: boolean) => void;
  updateTrackProgress: () => void;
  dismissTrackNotification: () => void;
  setDiscoveryMissionsPanelOpen: (open: boolean) => void;
  updateDiscoveryMissions: () => void;
  dismissDiscoveryMissionNotification: () => void;
}

export const createProgressionSlice: StateCreator<
  AppStore,
  [],
  [],
  ProgressionSlice
> = (set, get) => ({
  questsOpen: false,
  questProgress: loadFromStorage<QuestProgress[]>(QUEST_KEY, []),
  totalPoints: loadFromStorage<number>(POINTS_KEY, 0),
  dailyMissions: loadMissions(),
  missionsPanelOpen: false,
  completedMissionCount: loadFromStorage<number>(COMPLETED_MISSIONS_KEY, 0),
  missionNotification: null,
  achievements: loadFromStorage<AchievementProgress[]>(ACHIEVEMENTS_KEY, []),
  achievementPanelOpen: false,
  achievementNotification: null,
  listenCount: loadFromStorage<number>(LISTEN_COUNT_KEY, 0),
  expeditions: loadFromStorage<ExpeditionProgress[]>(EXPEDITIONS_KEY, []),
  expeditionPanelOpen: false,
  expeditionNotification: null,
  learningTracksOpen: false,
  trackProgress: loadFromStorage<TrackProgress[]>(TRACKS_KEY, []),
  trackNotification: null,
  discoveryMissions: loadFromStorage<DiscoveryMissionProgress[]>(
    DISCOVERY_MISSIONS_KEY,
    [],
  ),
  discoveryMissionsPanelOpen: false,
  discoveryBadges: loadFromStorage<string[]>(DISCOVERY_BADGES_KEY, []),
  discoveryMissionNotification: null,

  setQuestsOpen: (questsOpen) => set({ questsOpen }),
  updateQuestProgress: (questId, current) => {
    // copy verbatim from current store.ts updateQuestProgress
  },
  completeQuest: (questId, reward) => {
    // copy verbatim
  },

  setMissionsPanelOpen: (missionsPanelOpen) => set({ missionsPanelOpen }),
  updateMissionProgress: (type, region) => {
    // copy verbatim
  },
  dismissMissionNotification: () => set({ missionNotification: null }),

  setAchievementPanelOpen: (achievementPanelOpen) =>
    set({ achievementPanelOpen }),
  checkAchievements: () => {
    // copy verbatim
  },
  dismissAchievementNotification: () => set({ achievementNotification: null }),
  incrementListenCount: () => {
    // copy verbatim
  },

  setExpeditionPanelOpen: (expeditionPanelOpen) => set({ expeditionPanelOpen }),
  updateExpeditionProgress: () => {
    // copy verbatim
  },
  dismissExpeditionNotification: () => set({ expeditionNotification: null }),

  setLearningTracksOpen: (learningTracksOpen) => set({ learningTracksOpen }),
  updateTrackProgress: () => {
    // copy verbatim
  },
  dismissTrackNotification: () => set({ trackNotification: null }),

  setDiscoveryMissionsPanelOpen: (discoveryMissionsPanelOpen) =>
    set({ discoveryMissionsPanelOpen }),
  updateDiscoveryMissions: () => {
    // copy verbatim
  },
  dismissDiscoveryMissionNotification: () =>
    set({ discoveryMissionNotification: null }),
});
```

When filling each `// copy verbatim` comment, copy the ACTUAL body from the current `src/store/index.ts` for that action — do not retype from memory. Preserve all calls to `get()`, `set()`, `saveToStorage()`, etc.

- [ ] **Step 6.2: Remove extracted lines from `src/store/index.ts`**

Remove all 22 state fields listed above and all 18 actions listed above. Also remove now-unused imports if TypeScript flags them: `AchievementDef`, `AchievementProgress`, etc. (Check by running tsc and reading errors.)

Add the spread:
```ts
import { createProgressionSlice } from "./slices/progressionSlice";
// inside create():
  ...createCoreSlice(...a),
  ...createDiscoverySlice(...a),
  ...createProgressionSlice(...a),
```

**Special care**: `allBirds` is also used by `discoverBird`-triggered logic inside discoverySlice (which calls `get().updateExpeditionProgress`) and by the still-inline rest of the store. It's now duplicated across `progressionSlice` (needed for expedition/achievement checks). That's fine — each slice has its own `allBirds` constant. Keep the one inside `src/store/index.ts` if any still-inline action uses it; otherwise delete the top-level `allBirds` declaration too.

- [ ] **Step 6.3: Verify build**

Run: `zsh -c './node_modules/.bin/tsc -b --force && ./node_modules/.bin/vite build'`
Expected: exit 0.

- [ ] **Step 6.4: Commit**

```bash
git add src/store/slices/progressionSlice.ts src/store/index.ts
git commit -m "refactor(store): extract progressionSlice (quests/missions/achievements/expeditions/tracks/discoveryMissions)"
```

---

## Task 7: Extract `photoSlice`

**Fields & actions:**
- `birdPhotos: BirdPhoto[]`, `photoGalleryOpen: boolean`, `photoModeActive: boolean`, `photographerModeActive: boolean`, `photographerScore: PhotoScore | null`, `sharePanelOpen: boolean`, `screenshotFlash: boolean`, `recentScreenshots: string[]`
- Actions: `capturePhoto`, `deletePhoto`, `setPhotoGalleryOpen`, `setPhotoModeActive`, `setPhotographerModeActive`, `setPhotographerScore`, `setSharePanelOpen`, `addScreenshot`, `setScreenshotFlash`

**Files:**
- Create: `src/store/slices/photoSlice.ts`
- Modify: `src/store/index.ts`

- [ ] **Step 7.1: Create slice file**

```ts
import type { StateCreator } from "zustand";
import type { BirdPhoto, PhotoScore } from "../../types";
import type { AppStore } from "../types";
import {
  MAX_PHOTOS,
  PHOTOS_KEY,
  loadFromStorage,
  saveToStorage,
} from "../persistence";

export interface PhotoSlice {
  birdPhotos: BirdPhoto[];
  photoGalleryOpen: boolean;
  photoModeActive: boolean;
  photographerModeActive: boolean;
  photographerScore: PhotoScore | null;
  sharePanelOpen: boolean;
  screenshotFlash: boolean;
  recentScreenshots: string[];

  capturePhoto: (
    birdId: string,
    birdNameZh: string,
    birdNameEn: string,
    dataUrl: string,
  ) => void;
  deletePhoto: (photoId: string) => void;
  setPhotoGalleryOpen: (open: boolean) => void;
  setPhotoModeActive: (active: boolean) => void;
  setPhotographerModeActive: (active: boolean) => void;
  setPhotographerScore: (score: PhotoScore | null) => void;
  setSharePanelOpen: (open: boolean) => void;
  addScreenshot: (dataUrl: string) => void;
  setScreenshotFlash: (flash: boolean) => void;
}

export const createPhotoSlice: StateCreator<AppStore, [], [], PhotoSlice> = (
  set,
  get,
) => ({
  birdPhotos: loadFromStorage<BirdPhoto[]>(PHOTOS_KEY, []),
  photoGalleryOpen: false,
  photoModeActive: false,
  photographerModeActive: false,
  photographerScore: null,
  sharePanelOpen: false,
  screenshotFlash: false,
  recentScreenshots: [],

  capturePhoto: (birdId, birdNameZh, birdNameEn, dataUrl) => {
    const state = get();
    const photo: BirdPhoto = {
      id: `photo-${Date.now()}`,
      birdId,
      birdNameZh,
      birdNameEn,
      dataUrl,
      capturedAt: Date.now(),
    };
    let updated = [photo, ...state.birdPhotos];
    if (updated.length > MAX_PHOTOS) {
      updated = updated.slice(0, MAX_PHOTOS);
    }
    saveToStorage(PHOTOS_KEY, updated);
    set({ birdPhotos: updated });
  },
  deletePhoto: (photoId) => {
    const state = get();
    const updated = state.birdPhotos.filter((p) => p.id !== photoId);
    saveToStorage(PHOTOS_KEY, updated);
    set({ birdPhotos: updated });
  },
  setPhotoGalleryOpen: (photoGalleryOpen) => set({ photoGalleryOpen }),
  setPhotoModeActive: (photoModeActive) => set({ photoModeActive }),
  setPhotographerModeActive: (photographerModeActive) =>
    set({ photographerModeActive, photographerScore: null }),
  setPhotographerScore: (photographerScore) => set({ photographerScore }),
  setSharePanelOpen: (sharePanelOpen) => set({ sharePanelOpen }),
  addScreenshot: (dataUrl) =>
    set((state) => ({
      recentScreenshots: [dataUrl, ...state.recentScreenshots].slice(0, 10),
    })),
  setScreenshotFlash: (screenshotFlash) => set({ screenshotFlash }),
});
```

- [ ] **Step 7.2: Remove extracted lines from `src/store/index.ts`**

Remove all 8 state fields + 9 actions. Add slice spread. Add import.

- [ ] **Step 7.3: Verify build**

Run: `zsh -c './node_modules/.bin/tsc -b --force && ./node_modules/.bin/vite build'`
Expected: exit 0.

- [ ] **Step 7.4: Commit**

```bash
git add src/store/slices/photoSlice.ts src/store/index.ts
git commit -m "refactor(store): extract photoSlice (photos, photographer, share, screenshot)"
```

---

## Task 8: Extract `quizSlice`

**Fields:** `quizState`, `quizQuestions`, `quizCurrentIndex`, `quizScore`, `quizLastCorrect`
**Actions:** `startQuiz`, `answerQuiz`, `nextQuizQuestion`, `endQuiz`

**Files:** Create `src/store/slices/quizSlice.ts`. Modify `src/store/index.ts`.

- [ ] **Step 8.1: Create slice file**

```ts
import type { StateCreator } from "zustand";
import type { QuizQuestion, QuizState } from "../../types";
import type { AppStore } from "../types";

export interface QuizSlice {
  quizState: QuizState;
  quizQuestions: QuizQuestion[];
  quizCurrentIndex: number;
  quizScore: number;
  quizLastCorrect: boolean | null;

  startQuiz: (questions: QuizQuestion[]) => void;
  answerQuiz: (correct: boolean) => void;
  nextQuizQuestion: () => void;
  endQuiz: () => void;
}

export const createQuizSlice: StateCreator<AppStore, [], [], QuizSlice> = (
  set,
) => ({
  quizState: "idle",
  quizQuestions: [],
  quizCurrentIndex: 0,
  quizScore: 0,
  quizLastCorrect: null,

  startQuiz: (questions) =>
    set({
      quizState: "active",
      quizQuestions: questions,
      quizCurrentIndex: 0,
      quizScore: 0,
      quizLastCorrect: null,
    }),
  answerQuiz: (correct) =>
    set((state) => ({
      quizScore: correct ? state.quizScore + 1 : state.quizScore,
      quizLastCorrect: correct,
    })),
  nextQuizQuestion: () =>
    set((state) => {
      const nextIndex = state.quizCurrentIndex + 1;
      if (nextIndex >= state.quizQuestions.length) {
        return { quizState: "result" as const };
      }
      return { quizCurrentIndex: nextIndex, quizLastCorrect: null };
    }),
  endQuiz: () =>
    set({
      quizState: "idle",
      quizQuestions: [],
      quizCurrentIndex: 0,
      quizScore: 0,
      quizLastCorrect: null,
    }),
});
```

- [ ] **Step 8.2: Remove extracted lines, add slice spread.**
- [ ] **Step 8.3: Verify build.**
- [ ] **Step 8.4: Commit**

```bash
git add src/store/slices/quizSlice.ts src/store/index.ts
git commit -m "refactor(store): extract quizSlice"
```

---

## Task 9: Extract `soundSlice`

Covers soundGuess mini-game AND soundRecognition audio-ID feature.

**Fields:**
- `soundGuessState: SoundGuessState`, `soundGuessRound`, `soundGuessScore`, `soundGuessOptions`, `soundGuessCorrectId`
- `soundRecognitionActive`, `soundRecognitionResult`, `soundRecognitionConfidence`

**Actions:** `startSoundGuess`, `setSoundGuessOptions`, `answerSoundGuess`, `nextSoundGuessRound`, `endSoundGuess`, `setSoundRecognitionActive`, `setSoundRecognitionResult`, `setSoundRecognitionConfidence`

- [ ] **Step 9.1: Create `src/store/slices/soundSlice.ts`**

```ts
import type { StateCreator } from "zustand";
import type { SoundGuessOption, SoundGuessState } from "../../types";
import type { AppStore } from "../types";

export interface SoundSlice {
  soundGuessState: SoundGuessState;
  soundGuessRound: number;
  soundGuessScore: number;
  soundGuessOptions: SoundGuessOption[];
  soundGuessCorrectId: string | null;
  soundRecognitionActive: boolean;
  soundRecognitionResult: string | null;
  soundRecognitionConfidence: number;

  startSoundGuess: () => void;
  setSoundGuessOptions: (
    options: SoundGuessOption[],
    correctId: string,
  ) => void;
  answerSoundGuess: (birdId: string) => void;
  nextSoundGuessRound: () => void;
  endSoundGuess: () => void;
  setSoundRecognitionActive: (active: boolean) => void;
  setSoundRecognitionResult: (birdId: string | null) => void;
  setSoundRecognitionConfidence: (confidence: number) => void;
}

export const createSoundSlice: StateCreator<AppStore, [], [], SoundSlice> = (
  set,
) => ({
  soundGuessState: "idle",
  soundGuessRound: 0,
  soundGuessScore: 0,
  soundGuessOptions: [],
  soundGuessCorrectId: null,
  soundRecognitionActive: false,
  soundRecognitionResult: null,
  soundRecognitionConfidence: 0,

  startSoundGuess: () =>
    set({
      soundGuessState: "playing",
      soundGuessRound: 1,
      soundGuessScore: 0,
      soundGuessOptions: [],
      soundGuessCorrectId: null,
    }),
  setSoundGuessOptions: (options, correctId) =>
    set({
      soundGuessState: "guessing",
      soundGuessOptions: options,
      soundGuessCorrectId: correctId,
    }),
  answerSoundGuess: (birdId) =>
    set((state) => ({
      soundGuessScore:
        birdId === state.soundGuessCorrectId
          ? state.soundGuessScore + 1
          : state.soundGuessScore,
    })),
  nextSoundGuessRound: () =>
    set((state) => {
      if (state.soundGuessRound >= 5) {
        return { soundGuessState: "result" as const };
      }
      return {
        soundGuessState: "playing" as const,
        soundGuessRound: state.soundGuessRound + 1,
        soundGuessOptions: [],
        soundGuessCorrectId: null,
      };
    }),
  endSoundGuess: () =>
    set({
      soundGuessState: "idle",
      soundGuessRound: 0,
      soundGuessScore: 0,
      soundGuessOptions: [],
      soundGuessCorrectId: null,
    }),

  setSoundRecognitionActive: (soundRecognitionActive) =>
    set({ soundRecognitionActive }),
  setSoundRecognitionResult: (soundRecognitionResult) =>
    set({ soundRecognitionResult }),
  setSoundRecognitionConfidence: (soundRecognitionConfidence) =>
    set({ soundRecognitionConfidence }),
});
```

- [ ] **Step 9.2: Remove extracted lines, add spread.**
- [ ] **Step 9.3: Verify build.**
- [ ] **Step 9.4: Commit**

```bash
git add src/store/slices/soundSlice.ts src/store/index.ts
git commit -m "refactor(store): extract soundSlice (soundGuess + soundRecognition)"
```

---

## Task 10: Extract `tourSlice`

**Fields:** `tourState`, `tourStep`
**Actions:** `startTour`, `pauseTour`, `resumeTour`, `nextTourStep`, `endTour`

- [ ] **Step 10.1: Create `src/store/slices/tourSlice.ts`**

```ts
import type { StateCreator } from "zustand";
import type { TourState } from "../../types";
import type { AppStore } from "../types";

export interface TourSlice {
  tourState: TourState;
  tourStep: number;
  startTour: () => void;
  pauseTour: () => void;
  resumeTour: () => void;
  nextTourStep: () => void;
  endTour: () => void;
}

export const createTourSlice: StateCreator<AppStore, [], [], TourSlice> = (
  set,
) => ({
  tourState: "idle",
  tourStep: 0,

  startTour: () => set({ tourState: "intro", tourStep: 0 }),
  pauseTour: () => set({ tourState: "paused" }),
  resumeTour: () => set({ tourState: "touring" }),
  nextTourStep: () =>
    set((state) => ({ tourStep: state.tourStep + 1, tourState: "touring" })),
  endTour: () => set({ tourState: "idle", tourStep: 0 }),
});
```

- [ ] **Step 10.2: Remove extracted lines, add spread.**
- [ ] **Step 10.3: Verify build.**
- [ ] **Step 10.4: Commit**

```bash
git add src/store/slices/tourSlice.ts src/store/index.ts
git commit -m "refactor(store): extract tourSlice"
```

---

## Task 11: Extract `storySlice`

**Fields:** `storyExplorerOpen`, `storyProgress`, `storyModeActive`, `storyPlayState`, `activeStoryId`, `storyStepIndex`, `storyHighlightBirdId`, `completedStories`

**Actions:** `setStoryExplorerOpen`, `markStoryBirdDiscovered`, `setStoryModeActive`, `startStoryAdventure`, `nextStoryStep`, `pauseStoryAdventure`, `resumeStoryAdventure`, `exitStoryAdventure`, `completeStoryAdventure`

- [ ] **Step 11.1: Create `src/store/slices/storySlice.ts`**

```ts
import type { StateCreator } from "zustand";
import type { StoryPlayState } from "../../types";
import type { AppStore } from "../types";
import {
  COMPLETED_STORIES_KEY,
  STORY_KEY,
  loadFromStorage,
  saveToStorage,
} from "../persistence";

export interface StorySlice {
  storyExplorerOpen: boolean;
  storyProgress: Record<string, string[]>;
  storyModeActive: boolean;
  storyPlayState: StoryPlayState;
  activeStoryId: string | null;
  storyStepIndex: number;
  storyHighlightBirdId: string | null;
  completedStories: string[];

  setStoryExplorerOpen: (open: boolean) => void;
  markStoryBirdDiscovered: (storyId: string, birdId: string) => void;
  setStoryModeActive: (active: boolean) => void;
  startStoryAdventure: (storyId: string) => void;
  nextStoryStep: () => void;
  pauseStoryAdventure: () => void;
  resumeStoryAdventure: () => void;
  exitStoryAdventure: () => void;
  completeStoryAdventure: () => void;
}

export const createStorySlice: StateCreator<AppStore, [], [], StorySlice> = (
  set,
  get,
) => ({
  storyExplorerOpen: false,
  storyProgress: loadFromStorage<Record<string, string[]>>(STORY_KEY, {}),
  storyModeActive: false,
  storyPlayState: "idle" as StoryPlayState,
  activeStoryId: null,
  storyStepIndex: 0,
  storyHighlightBirdId: null,
  completedStories: loadFromStorage<string[]>(COMPLETED_STORIES_KEY, []),

  setStoryExplorerOpen: (storyExplorerOpen) => set({ storyExplorerOpen }),

  markStoryBirdDiscovered: (storyId, birdId) => {
    const state = get();
    const current = state.storyProgress[storyId] || [];
    if (current.includes(birdId)) return;
    const updated = {
      ...state.storyProgress,
      [storyId]: [...current, birdId],
    };
    saveToStorage(STORY_KEY, updated);
    set({ storyProgress: updated });
  },

  setStoryModeActive: (storyModeActive) => set({ storyModeActive }),

  startStoryAdventure: (storyId) =>
    set({
      storyModeActive: true,
      storyPlayState: "playing",
      activeStoryId: storyId,
      storyStepIndex: 0,
      storyHighlightBirdId: null,
    }),

  nextStoryStep: () =>
    set((state) => ({
      storyStepIndex: state.storyStepIndex + 1,
      storyHighlightBirdId: null,
    })),

  pauseStoryAdventure: () => set({ storyPlayState: "paused" }),
  resumeStoryAdventure: () => set({ storyPlayState: "playing" }),

  exitStoryAdventure: () =>
    set({
      storyModeActive: false,
      storyPlayState: "idle",
      activeStoryId: null,
      storyStepIndex: 0,
      storyHighlightBirdId: null,
    }),

  completeStoryAdventure: () => {
    const state = get();
    if (!state.activeStoryId) return;
    const updated = state.completedStories.includes(state.activeStoryId)
      ? state.completedStories
      : [...state.completedStories, state.activeStoryId];
    saveToStorage(COMPLETED_STORIES_KEY, updated);
    set({
      storyPlayState: "complete",
      completedStories: updated,
    });
  },
});
```

- [ ] **Step 11.2: Remove extracted lines, add spread.**
- [ ] **Step 11.3: Verify build.**
- [ ] **Step 11.4: Commit**

```bash
git add src/store/slices/storySlice.ts src/store/index.ts
git commit -m "refactor(store): extract storySlice"
```

---

## Task 12: Extract `aiGuideSlice`

**Fields:** `aiGuideOpen`, `aiGuideQuestion`, `aiGuideAnswer`, `birdExplanation`, `birdExplanationLoading`, `ttsStatus`
**Actions:** `setAiGuideOpen`, `setAiGuideQuestion`, `setAiGuideAnswer`, `requestBirdExplanation`, `clearBirdExplanation`, `speakExplanation`, `stopSpeaking`

- [ ] **Step 12.1: Create `src/store/slices/aiGuideSlice.ts`**

```ts
import type { StateCreator } from "zustand";
import type { KnowledgeResult, TTSStatus } from "../../types";
import type { AppStore } from "../types";

export interface AiGuideSlice {
  aiGuideOpen: boolean;
  aiGuideQuestion: string | null;
  aiGuideAnswer: string | null;
  birdExplanation: KnowledgeResult | null;
  birdExplanationLoading: boolean;
  ttsStatus: TTSStatus;

  setAiGuideOpen: (open: boolean) => void;
  setAiGuideQuestion: (q: string | null) => void;
  setAiGuideAnswer: (a: string | null) => void;
  requestBirdExplanation: (birdId: string) => void;
  clearBirdExplanation: () => void;
  speakExplanation: () => void;
  stopSpeaking: () => void;
}

export const createAiGuideSlice: StateCreator<
  AppStore,
  [],
  [],
  AiGuideSlice
> = (set, get) => ({
  aiGuideOpen: false,
  aiGuideQuestion: null,
  aiGuideAnswer: null,
  birdExplanation: null,
  birdExplanationLoading: false,
  ttsStatus: "idle" as TTSStatus,

  setAiGuideOpen: (aiGuideOpen) => set({ aiGuideOpen }),
  setAiGuideQuestion: (aiGuideQuestion) => set({ aiGuideQuestion }),
  setAiGuideAnswer: (aiGuideAnswer) => set({ aiGuideAnswer }),

  requestBirdExplanation: (birdId) => {
    set({ birdExplanationLoading: true, birdExplanation: null });
    import("../../features/KnowledgeService").then(
      ({ queryBirdExplanation }) => {
        queryBirdExplanation(birdId)
          .then((result) => {
            set({
              birdExplanation: result,
              birdExplanationLoading: false,
              aiGuideOpen: true,
            });
          })
          .catch(() => {
            set({ birdExplanationLoading: false });
          });
      },
    );
  },
  clearBirdExplanation: () =>
    set({ birdExplanation: null, birdExplanationLoading: false }),
  speakExplanation: () => {
    const { birdExplanation, language } = get();
    if (!birdExplanation) return;
    import("../../features/tts-service").then(({ speak }) => {
      const text =
        language === "zh" ? birdExplanation.textZh : birdExplanation.text;
      const status = speak(text, language, () => set({ ttsStatus: "idle" }));
      set({ ttsStatus: status });
    });
  },
  stopSpeaking: () => {
    import("../../features/tts-service").then(({ stop }) => {
      stop();
      set({ ttsStatus: "idle" });
    });
  },
});
```

Note: dynamic import paths changed from `./features/KnowledgeService` to `../../features/KnowledgeService` because the slice lives deeper in the tree.

- [ ] **Step 12.2: Remove extracted lines, add spread.**
- [ ] **Step 12.3: Verify build.**
- [ ] **Step 12.4: Commit**

```bash
git add src/store/slices/aiGuideSlice.ts src/store/index.ts
git commit -m "refactor(store): extract aiGuideSlice"
```

---

## Task 13: Extract `ecosystemSlice`

**Fields:** `currentSeason`, `ecosystemState`, `activeHabitatFilters`, `ecosystemPanelOpen`, `ecosystemManualOverride`, `activeBiome`, `biomeAudioEnabled`

**Actions:** `setCurrentSeason`, `setEcosystemState`, `toggleHabitatFilter`, `clearHabitatFilters`, `setEcosystemPanelOpen`, `setEcosystemManualOverride`, `setActiveBiome`, `setBiomeAudioEnabled`

- [ ] **Step 13.1: Create `src/store/slices/ecosystemSlice.ts`**

```ts
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
```

- [ ] **Step 13.2: Remove extracted lines, add spread.**
- [ ] **Step 13.3: Verify build.**
- [ ] **Step 13.4: Commit**

```bash
git add src/store/slices/ecosystemSlice.ts src/store/index.ts
git commit -m "refactor(store): extract ecosystemSlice (season, habitat, biome)"
```

---

## Task 14: Extract `migrationSlice`

**Fields:** `migrationModeActive`, `showAllRoutes`, `migrationSpeed`, `timeState`, `migrationInfoPathIndex`, `activeJourneyId`, `journeyProgress`, `visitedStops`, `journeyPanelOpen`

**Actions:** `setMigrationModeActive`, `setShowAllRoutes`, `setMigrationSpeed`, `setTimeState`, `playTimeline`, `pauseTimeline`, `setTimeMonth`, `setTimeSpeed`, `scrubTimeline`, `setMigrationInfoPathIndex`, `setActiveJourney`, `visitStop`, `completeJourney`, `setJourneyPanelOpen`

- [ ] **Step 14.1: Create `src/store/slices/migrationSlice.ts`**

```ts
import type { StateCreator } from "zustand";
import type { JourneyProgress, TimeState } from "../../types";
import type { AppStore } from "../types";
import { createInitialTimeState } from "../../core/TimeController";
import {
  JOURNEY_PROGRESS_KEY,
  VISITED_STOPS_KEY,
  loadFromStorage,
  saveToStorage,
} from "../persistence";

export interface MigrationSlice {
  migrationModeActive: boolean;
  showAllRoutes: boolean;
  migrationSpeed: number;
  timeState: TimeState;
  migrationInfoPathIndex: number | null;
  activeJourneyId: string | null;
  journeyProgress: JourneyProgress[];
  visitedStops: string[];
  journeyPanelOpen: boolean;

  setMigrationModeActive: (active: boolean) => void;
  setShowAllRoutes: (show: boolean) => void;
  setMigrationSpeed: (speed: number) => void;
  setTimeState: (state: TimeState) => void;
  playTimeline: () => void;
  pauseTimeline: () => void;
  setTimeMonth: (month: number) => void;
  setTimeSpeed: (speed: number) => void;
  scrubTimeline: (progress: number) => void;
  setMigrationInfoPathIndex: (index: number | null) => void;
  setActiveJourney: (id: string | null) => void;
  visitStop: (journeyId: string, stopId: string) => void;
  completeJourney: (journeyId: string) => void;
  setJourneyPanelOpen: (open: boolean) => void;
}

export const createMigrationSlice: StateCreator<
  AppStore,
  [],
  [],
  MigrationSlice
> = (set, get) => ({
  migrationModeActive: false,
  showAllRoutes: false,
  migrationSpeed: 1,
  timeState: createInitialTimeState(),
  migrationInfoPathIndex: null,
  activeJourneyId: null,
  journeyProgress: loadFromStorage<JourneyProgress[]>(JOURNEY_PROGRESS_KEY, []),
  visitedStops: loadFromStorage<string[]>(VISITED_STOPS_KEY, []),
  journeyPanelOpen: false,

  setMigrationModeActive: (migrationModeActive) =>
    set({ migrationModeActive }),
  setShowAllRoutes: (showAllRoutes) => set({ showAllRoutes }),
  setMigrationSpeed: (migrationSpeed) => set({ migrationSpeed }),
  setTimeState: (timeState) => set({ timeState }),
  playTimeline: () =>
    set((s) => ({ timeState: { ...s.timeState, isPlaying: true } })),
  pauseTimeline: () =>
    set((s) => ({ timeState: { ...s.timeState, isPlaying: false } })),
  setTimeMonth: (month) =>
    set((s) => ({ timeState: { ...s.timeState, month, progress: 0 } })),
  setTimeSpeed: (speed) =>
    set((s) => ({ timeState: { ...s.timeState, speed } })),
  scrubTimeline: (progress) =>
    set((s) => ({ timeState: { ...s.timeState, progress } })),
  setMigrationInfoPathIndex: (migrationInfoPathIndex) =>
    set({ migrationInfoPathIndex }),

  setActiveJourney: (activeJourneyId) => set({ activeJourneyId }),

  visitStop: (journeyId, stopId) => {
    const state = get();
    const visitedStops = state.visitedStops.includes(stopId)
      ? state.visitedStops
      : [...state.visitedStops, stopId];
    saveToStorage(VISITED_STOPS_KEY, visitedStops);

    const existing = state.journeyProgress.find(
      (p) => p.journeyId === journeyId,
    );
    let journeyProgress: JourneyProgress[];
    if (existing) {
      journeyProgress = state.journeyProgress.map((p) =>
        p.journeyId === journeyId
          ? {
              ...p,
              visitedStopIds: p.visitedStopIds.includes(stopId)
                ? p.visitedStopIds
                : [...p.visitedStopIds, stopId],
            }
          : p,
      );
    } else {
      journeyProgress = [
        ...state.journeyProgress,
        {
          journeyId,
          visitedStopIds: [stopId],
          discoveredBirdIds: [],
          completed: false,
        },
      ];
    }
    saveToStorage(JOURNEY_PROGRESS_KEY, journeyProgress);
    set({ visitedStops, journeyProgress });
  },

  completeJourney: (journeyId) => {
    const state = get();
    const journeyProgress = state.journeyProgress.map((p) =>
      p.journeyId === journeyId
        ? { ...p, completed: true, completedAt: Date.now() }
        : p,
    );
    saveToStorage(JOURNEY_PROGRESS_KEY, journeyProgress);
    set({ journeyProgress });
  },

  setJourneyPanelOpen: (journeyPanelOpen) => set({ journeyPanelOpen }),
});
```

- [ ] **Step 14.2: Remove extracted lines, add spread.**
- [ ] **Step 14.3: Verify build.**
- [ ] **Step 14.4: Commit**

```bash
git add src/store/slices/migrationSlice.ts src/store/index.ts
git commit -m "refactor(store): extract migrationSlice (migration + journey + timeline)"
```

---

## Task 15: Extract `specialModesSlice` (final non-core fields)

Wraps up the remaining modal/mode state: classroom, sandbox, AR.

**Fields:** `classroomModeActive`, `presentationMode`, `activeLessonId`, `lessonStepIndex`, `sandboxModeActive`, `spawnedBirds`, `sandboxTimeHour`, `arViewerBirdId`, `arSessionActive`

**Actions:** `setClassroomModeActive`, `setPresentationMode`, `setActiveLessonId`, `setLessonStepIndex`, `nextLessonStep`, `setSandboxModeActive`, `addSpawnedBird`, `removeSpawnedBird`, `clearSpawnedBirds`, `setSandboxTimeHour`, `setARViewerBird`, `setArSessionActive`

- [ ] **Step 15.1: Create `src/store/slices/specialModesSlice.ts`**

```ts
import type { StateCreator } from "zustand";
import type { SpawnedBird } from "../../types";
import type { AppStore } from "../types";

export interface SpecialModesSlice {
  classroomModeActive: boolean;
  presentationMode: boolean;
  activeLessonId: string | null;
  lessonStepIndex: number;
  sandboxModeActive: boolean;
  spawnedBirds: SpawnedBird[];
  sandboxTimeHour: number;
  arViewerBirdId: string | null;
  arSessionActive: boolean;

  setClassroomModeActive: (active: boolean) => void;
  setPresentationMode: (active: boolean) => void;
  setActiveLessonId: (id: string | null) => void;
  setLessonStepIndex: (index: number) => void;
  nextLessonStep: () => void;
  setSandboxModeActive: (active: boolean) => void;
  addSpawnedBird: (bird: SpawnedBird) => void;
  removeSpawnedBird: (id: string) => void;
  clearSpawnedBirds: () => void;
  setSandboxTimeHour: (hour: number) => void;
  setARViewerBird: (birdId: string | null) => void;
  setArSessionActive: (active: boolean) => void;
}

export const createSpecialModesSlice: StateCreator<
  AppStore,
  [],
  [],
  SpecialModesSlice
> = (set) => ({
  classroomModeActive: false,
  presentationMode: false,
  activeLessonId: null,
  lessonStepIndex: 0,
  sandboxModeActive: false,
  spawnedBirds: [],
  sandboxTimeHour: 12,
  arViewerBirdId: null,
  arSessionActive: false,

  setClassroomModeActive: (classroomModeActive) =>
    set({ classroomModeActive }),
  setPresentationMode: (presentationMode) => set({ presentationMode }),
  setActiveLessonId: (activeLessonId) =>
    set({ activeLessonId, lessonStepIndex: 0 }),
  setLessonStepIndex: (lessonStepIndex) => set({ lessonStepIndex }),
  nextLessonStep: () =>
    set((state) => ({ lessonStepIndex: state.lessonStepIndex + 1 })),

  setSandboxModeActive: (sandboxModeActive) => set({ sandboxModeActive }),
  addSpawnedBird: (bird) =>
    set((state) => ({
      spawnedBirds:
        state.spawnedBirds.length < 50
          ? [...state.spawnedBirds, bird]
          : state.spawnedBirds,
    })),
  removeSpawnedBird: (id) =>
    set((state) => ({
      spawnedBirds: state.spawnedBirds.filter((b) => b.id !== id),
    })),
  clearSpawnedBirds: () => set({ spawnedBirds: [] }),
  setSandboxTimeHour: (sandboxTimeHour) => set({ sandboxTimeHour }),

  setARViewerBird: (arViewerBirdId) => set({ arViewerBirdId }),
  setArSessionActive: (arSessionActive) => set({ arSessionActive }),
});
```

- [ ] **Step 15.2: Remove extracted lines, add spread.**

At this point, `src/store/index.ts` body should be **empty of inline state/actions** — everything is in slices. The file should look like:

```ts
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
```

- [ ] **Step 15.3: Verify build**

Run: `zsh -c './node_modules/.bin/tsc -b --force && ./node_modules/.bin/vite build'`
Expected: exit 0.

The TypeScript union-of-slices check will fail noisily if any field of `AppStore` is missing from every slice. Fix by adding the field to the appropriate slice interface + creator — don't widen `AppStore`.

- [ ] **Step 15.4: Commit**

```bash
git add src/store/slices/specialModesSlice.ts src/store/index.ts
git commit -m "refactor(store): extract specialModesSlice (classroom, sandbox, AR)"
```

---

## Task 16: Final sweep + CLAUDE.md update

- [ ] **Step 16.1: Confirm `src/store/index.ts` has no stray logic**

Run: `wc -l src/store/index.ts`
Expected: < 40 lines (just imports, type re-exports, `create()` composition).

Run: `grep -n "loadFromStorage\|saveToStorage\|const.*= \"kids-bird-globe" src/store/index.ts`
Expected: zero matches. All storage logic is in slices or `persistence.ts`.

- [ ] **Step 16.2: Verify every `AppStore` field is covered by exactly one slice**

Run the following script (saved as a one-off check — do not commit):

```bash
grep -hE "^\s+[a-zA-Z]+(\??):" src/store/slices/*.ts | \
  sed 's/^[[:space:]]*//;s/[?:].*//' | \
  sort -u > /tmp/slice-fields.txt

grep -hE "^\s+[a-zA-Z]+(\??):" src/store/types.ts | \
  sed 's/^[[:space:]]*//;s/[?:].*//' | \
  sort -u > /tmp/store-fields.txt

diff /tmp/store-fields.txt /tmp/slice-fields.txt
```

Expected: empty diff. If not, a field is orphaned or duplicated — fix before proceeding.

- [ ] **Step 16.3: Confirm bundle size didn't regress**

Run: `zsh -c './node_modules/.bin/vite build' 2>&1 | grep -E "dist/assets|built in"`

Expected: total gzip bytes comparable to baseline from Step P2 (within ±5%). The app index chunk may differ slightly due to module grouping, but `three-vendor` and `react-vendor` should be identical.

- [ ] **Step 16.4: Update `CLAUDE.md` "State" section**

Edit the `### State: one monolithic Zustand store` section of `CLAUDE.md`. Replace the first sentence and file reference:

From:
```
`src/store.ts` (~42 KB, ~100 fields) is the single source of truth.
```

To:
```
`src/store/` (12 slices composing one `useAppStore`) is the single source of truth. Entry: `src/store/index.ts` composes all slices. Persistence helpers and storage keys live in `src/store/persistence.ts`. Each slice under `src/store/slices/` owns a cohesive subset of fields + actions. Cross-slice reads use `get()` — never import one slice's creator from another slice.
```

Also update the layered source-tree diagram: change
```
└── store.ts     The single Zustand store
```
to
```
└── store/       One Zustand store composed of 12 slices (see store/slices/)
```

- [ ] **Step 16.5: Final build + commit**

Run: `zsh -c './node_modules/.bin/tsc -b --force && ./node_modules/.bin/vite build'`
Expected: exit 0.

```bash
git add CLAUDE.md
git commit -m "docs(claude): update store section to describe slice composition"
```

- [ ] **Step 16.6: Review the commit series**

Run: `git log --oneline main..HEAD`
Expected: ~15 commits, each small and semantically named. If any commit is "refactor + unrelated fix" or lacks the slice name in its subject, consider squashing interactively (but only on request from user — don't rewrite history unilaterally).

---

## Rollback plan

If any task breaks in a way that can't be debugged in 15 minutes:

```bash
git reset --hard <commit-before-task-N>
```

Each task is isolated — partial completion (e.g. 10 of 12 slices extracted) still leaves a working build, since the remaining inline state in `index.ts` continues to satisfy `AppStore`.

---

## Out of scope (not done in this plan)

- Splitting `useAppStore` into multiple separate stores → explicitly forbidden by `ai/gstack.yaml` and CLAUDE.md.
- Adding zustand middleware (persist, devtools, immer) → separate decision.
- Renaming any field for clarity → zero-rename constraint preserves git blame signal.
- Adding selector helpers (e.g. `useDiscovered()` hooks) → separate convenience layer, out of scope.
