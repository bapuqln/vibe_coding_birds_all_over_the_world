# 万羽拾音 (Kids Bird Globe) — Implementation Plan (v9)

> **v9 changelog**: Educational exploration expansion — migration mode, guided discovery tour, AI bird guide, enhanced quiz, bird rarity system, bird radar, story-based exploration. Complete UI system overhaul with ActionButton component, right control panel, mobile safe areas, responsive layout, z-index hierarchy, bird tooltip, loading UI with progress.
>
> **v8 changelog**: Core interactive learning — bird info card redesign, animated birds, bird collection system, region filter, kid quest system, globe visual improvements, bird data model refactor.

## High-Level Architecture (v9)

```
App.tsx
├── Canvas (camera, background) [z-index: 0]
│   └── Suspense
│       └── GlobeScene
│           ├── Lighting (ambient + directional + hemisphere)
│           ├── Starfield (3-layer parallax)
│           ├── AtmosphereShell (Fresnel)
│           ├── group (earth group)
│           │   ├── Globe (textured sphere)
│           │   ├── CloudLayer
│           │   ├── CountryBorders (GeoJSON)
│           │   ├── HabitatHighlight
│           │   ├── BirdMarker × 15 (animated flight + tooltip) [z-index: 1]
│           │   ├── SoundRipple
│           │   ├── MigrationPaths (all-routes + migration mode)
│           │   └── RarityEffects (glow/particles for rare birds)
│           ├── MapLabels (Html, zoom-dependent, clickable)
│           ├── CameraController (fly-to, auto-rotate, region zoom, tour)
│           └── OrbitControls (target=[0,0,0], locked)
│
├── LoadingScreen (progress indicator) [z-index: 100]
├── AppTitle [z-index: 10]
├── LangToggle [z-index: 10]
│
├── RightControlPanel [z-index: 10]
│   ├── ActionButton "Birds" → BirdEncyclopediaPanel
│   ├── ActionButton "Regions" → RegionFilterPanel
│   ├── ActionButton "Migration" → MigrationModePanel
│   ├── ActionButton "Quests" → QuestPanel
│   ├── ActionButton "Tour" → GuidedTour
│   └── ActionButton "Reset" → reset view
│
├── BirdInfoCard (center-bottom modal) [z-index: 20]
│   ├── Bird image, name, region, habitat, fun fact
│   ├── Sound playback button
│   ├── Collect button
│   ├── Rarity badge
│   ├── Size comparison, diet, wingspan
│   └── Close button
│
├── MyBirdsPanel (collection album) [z-index: 20]
├── RegionFilterPanel [z-index: 20]
├── QuestPanel [z-index: 20]
├── MigrationModePanel [z-index: 20]
├── GuidedTour overlay [z-index: 20]
├── BirdGuide (bottom-left character) [z-index: 10]
├── BirdRadar (corner radar) [z-index: 10]
├── StoryExplorer [z-index: 20]
├── QuizPanel [z-index: 20]
├── SoundGuessPanel [z-index: 20]
├── BirdEncyclopediaPanel [z-index: 20]
├── ContinentBirdPanel [z-index: 20]
├── EvolutionTimeline [z-index: 20]
├── AudioPlayer (invisible)
└── BirdTooltip [z-index: 15]
```

## Key Technical Decisions (v8+v9)

### TD-47: UI System Overhaul — ActionButton Component
**Problem**: Buttons have inconsistent width, overlap each other, no defined layout zones.
**Solution**: Create reusable `ActionButton` component with fixed dimensions (h-44px, min-w-120px, rounded-12px, glass-morphism bg). All action buttons live inside `RightControlPanel` container positioned at bottom-right with flex-column layout and 8px gap. Mobile responsive: horizontal layout below 900px.

### TD-48: Z-Index Hierarchy
**Problem**: UI elements overlap unpredictably.
**Solution**: Enforce strict z-index layers: canvas=0, markers=1, HUD panels=10, tooltips=15, modal cards=20, loading=100. All components use these exact values.

### TD-49: Bird Information Card Redesign
**Problem**: Current card slides from side, blocks globe view.
**Solution**: Redesign as center-bottom modal panel that slides up. Max height 60vh. Includes sound playback button and collect button. Does not overlap right control panel.

### TD-50: Animated Bird Markers
**Problem**: Static markers feel lifeless.
**Solution**: Add subtle circular/floating flight animation to BirdMarker. Each bird orbits a small radius around its position using `useFrame`. Clicking pauses animation for 3 seconds. Keep animation lightweight — simple sin/cos position offset.

### TD-51: Bird Collection System
**Problem**: No way to save discovered birds.
**Solution**: `useCollection` hook manages localStorage persistence. Collect button in info card triggers save with sparkle animation. `MyBirdsPanel` displays grid of collected bird thumbnails. Store: `collectedBirds: CollectedBird[]`, `isCollectionOpen: boolean`.

### TD-52: Region Filter
**Problem**: No way to explore birds by geographic region.
**Solution**: `RegionFilterPanel` with 8 region buttons. Selecting a region: (1) sets `activeRegion` in store, (2) triggers camera zoom to region center coordinates, (3) filters visible birds. Region centers defined as lat/lng constants. Camera animation reuses existing CameraController infrastructure.

### TD-53: Kid Quest System
**Problem**: No gamification or goals for children.
**Solution**: `QuestManager` system generates quests from templates. Quest types: find_region (find N birds in region), collect_count (collect N total birds), discover_bird (find specific bird). Progress tracked in localStorage. Points and emoji badges awarded. `QuestPanel` shows active quests with progress bars.

### TD-54: Migration Mode
**Problem**: Migration paths always visible or toggled per-route — no dedicated exploration mode.
**Solution**: `MigrationModePanel` provides a focused migration exploration experience. When active, all migration routes render with distinct colors and animated flying bird icons. Reuses existing `MigrationPaths` component with `showAllRoutes` state.

### TD-55: Guided Discovery Tour
**Problem**: Children may not know where to start exploring.
**Solution**: `GuidedTour` component orchestrates an automated camera tour. Visits predefined waypoints (Amazon, Africa, Antarctica, etc.). At each stop, highlights a featured bird with info card. Tour state machine: idle → intro → touring → paused → complete. Camera animation via CameraController with waypoint queue.

### TD-56: AI Bird Guide
**Problem**: No contextual help or educational prompts.
**Solution**: `BirdGuide` component renders a small owl/parrot avatar at bottom-left. Shows contextual messages based on user actions (selected bird, region, idle). Messages are short, child-friendly fun facts. Auto-dismisses after 5 seconds. Does not block interaction.

### TD-57: Bird Rarity System
**Problem**: All birds feel equally important.
**Solution**: Add `rarity` field to bird data. Common birds: normal appearance. Rare birds: subtle golden glow. Legendary birds: particle sparkle effect. Rarity badge displayed in info card and collection panel.

### TD-58: Bird Radar
**Problem**: Children may miss birds in their current view.
**Solution**: `BirdRadar` component renders a small circular radar in top-right corner. Uses camera frustum to detect visible birds. Dots on radar represent bird positions relative to camera direction. Pulsing animation for birds near center of view.

### TD-59: Story-Based Exploration
**Problem**: No themed discovery experience.
**Solution**: `StoryExplorer` panel offers themed bird sets (Rainforest, Arctic, Desert, Ocean). Each theme lists its birds with discovery progress. Completing all birds in a theme unlocks a badge. Progress persisted in localStorage.

### TD-60: Mobile Safe Areas
**Problem**: UI elements hidden behind notches/home indicators.
**Solution**: RightControlPanel and all fixed UI use `env(safe-area-inset-*)` CSS functions. Bottom padding: `calc(env(safe-area-inset-bottom) + 16px)`.

### TD-61: Bird Tooltip
**Problem**: No quick identification of birds without clicking.
**Solution**: HTML tooltip rendered via `<Html>` from drei on bird hover. Shows bird name and region. Positioned above the bird marker. Fades in/out on hover.

### TD-62: Loading UI Enhancement
**Problem**: Loading screen lacks progress information.
**Solution**: Enhanced `LoadingScreen` with staged progress: "Loading Earth..." → "Loading Birds..." → "Ready!". Animated progress bar. Smooth fade-out transition.

## Component Inventory (v8+v9 additions)

### UI Components (new)
| Component | Purpose | Version |
|-----------|---------|---------|
| `ActionButton.tsx` | Reusable glass-morphism button | v8 |
| `RightControlPanel.tsx` | Container for all action buttons | v8 |
| `MyBirdsPanel.tsx` | Bird collection album | v8 |
| `RegionFilterPanel.tsx` | Region filter controls | v8 |
| `QuestPanel.tsx` | Quest missions and progress | v8 |
| `MigrationModePanel.tsx` | Migration exploration toggle | v9 |
| `GuidedTour.tsx` | Automated tour overlay | v9 |
| `BirdGuide.tsx` | AI guide character | v9 |
| `BirdRadar.tsx` | Nearby bird radar | v9 |
| `StoryExplorer.tsx` | Themed exploration sets | v9 |
| `BirdTooltip.tsx` | Hover tooltip for birds | v8 |

### Systems (new)
| System | Purpose | Version |
|--------|---------|---------|
| `QuestManager.ts` | Quest generation and progress tracking | v8 |
| `CollectionManager.ts` | localStorage bird collection | v8 |
| `TourManager.ts` | Guided tour waypoint management | v9 |

### Hooks (new)
| Hook | Purpose | Version |
|------|---------|---------|
| `useCollection.ts` | Bird collection localStorage hook | v8 |
| `useQuests.ts` | Quest progress management hook | v8 |

## State Management (v8+v9 additions)

```typescript
interface AppStore {
  // ... existing v7 state ...

  // v8: Collection
  collectedBirds: CollectedBird[];
  isCollectionOpen: boolean;
  collectBird: (birdId: string) => void;
  setCollectionOpen: (open: boolean) => void;

  // v8: Region filter
  activeRegion: string | null;
  setActiveRegion: (region: string | null) => void;

  // v8: Quests
  questsOpen: boolean;
  setQuestsOpen: (open: boolean) => void;

  // v9: Guided tour
  tourState: "idle" | "intro" | "touring" | "paused" | "complete";
  tourStep: number;
  startTour: () => void;
  pauseTour: () => void;
  resumeTour: () => void;
  nextTourStep: () => void;
  endTour: () => void;

  // v9: Bird guide
  guideMessage: string | null;
  guideMessageZh: string | null;
  setGuideMessage: (en: string | null, zh: string | null) => void;

  // v9: Migration mode
  migrationModeActive: boolean;
  setMigrationModeActive: (active: boolean) => void;

  // v9: Story explorer
  storyExplorerOpen: boolean;
  setStoryExplorerOpen: (open: boolean) => void;

  // v9: Bird radar
  radarOpen: boolean;
  setRadarOpen: (open: boolean) => void;

  // UI: Tooltip
  hoveredBirdId: string | null;
  setHoveredBird: (id: string | null) => void;

  // UI: Region filter panel
  regionFilterOpen: boolean;
  setRegionFilterOpen: (open: boolean) => void;
}
```

## Implementation Phases (v8)

- Phase 56: Data Model Extension (v8) → R-2
- Phase 57: UI System — ActionButton + RightControlPanel → R-19
- Phase 58: Bird Info Card Redesign → R-4
- Phase 59: Animated Bird Markers + Tooltip → R-3
- Phase 60: Bird Collection System → R-5
- Phase 61: Region Filter → R-6
- Phase 62: Kid Quest System → R-7
- Phase 63: Loading UI Enhancement → R-19
- Phase 64: Globe Visual Improvements → R-8

## Implementation Phases (v9)

- Phase 65: Migration Mode → R-9
- Phase 66: Guided Discovery Tour → R-10
- Phase 67: AI Bird Guide → R-11
- Phase 68: Enhanced Learning Quiz → R-12
- Phase 69: Bird Rarity System → R-13
- Phase 70: Bird Radar → R-14
- Phase 71: Story-Based Exploration → R-15

## Implementation Phases (Refactor + Polish)

- Phase 72: UI Consistency Pass → R-19
- Phase 73: Mobile Responsive + Safe Areas → R-19
- Phase 74: Performance Optimization → R-20
- Phase 75: Final Verification → All ACs
