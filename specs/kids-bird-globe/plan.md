# 万羽拾音 (Kids Bird Globe) — Implementation Plan (v7)

> **v7 changelog**: Global migration map overlay, bird evolution timeline UI, bird diet visualization, wingspan comparison bar, sound guess gameplay mode, improved starfield with parallax depth layers. Extended data model with `evolutionEra`, `dietType`, `wingspanCm`. New systems: `MigrationMapSystem`, `SoundGuessManager`. New components: `EvolutionTimeline`, `WingspanBar`, `SoundGuessPanel`, `MigrationMapToggle`.
>
> **v6 changelog**: Sound ripple system, habitat highlight rendering, discovery gameplay mode, quiz gameplay system, migration story animation, bird size comparison, continent learning panel, wing flap animation, bird encyclopedia panel. Extended data model. All new systems follow declarative R3F patterns.
>
> **v5 changelog**: Fix OrbitControls target lock to [0,0,0], replace low-quality bird model, fix useGLTF hooks violation, add country borders via GeoJSON, add zoom-dependent map labels, improve lighting with hemisphere light, improve atmosphere with Fresnel shell, enforce declarative R3F patterns throughout.

## High-Level Architecture

```
App.tsx
├── Canvas (camera, background)
│   └── Suspense
│       └── GlobeScene
│           ├── Lighting (ambient + directional + hemisphere)
│           ├── Starfield (3-layer parallax: far/mid/near + twinkle)
│           ├── AtmosphereShell (Fresnel BackSide sphere)
│           ├── group (earth group — all children rotate together)
│           │   ├── Globe (textured sphere)
│           │   ├── CloudLayer (semi-transparent sphere)
│           │   ├── CountryBorders (GeoJSON line segments)
│           │   ├── HabitatHighlight (colored glow patch on globe)
│           │   ├── BirdMarker × 15 (GLTF models + wing flap)
│           │   ├── SoundRipple (expanding rings at bird position)
│           │   └── MigrationPaths (supports all-routes mode)
│           │       ├── MigrationArc × N (dashed animated lines, colored)
│           │       ├── FlyingBirdIcon × N (moving sphere along arc)
│           │       └── MigrationLabel × N (Html distance text)
│           ├── MapLabels (Html elements, zoom-dependent, clickable)
│           ├── CameraController (useFrame animation)
│           └── OrbitControls (target=[0,0,0], locked)
├── LoadingScreen
├── AppTitle
├── LangToggle
├── BirdInfoCard (size bar + diet icons + wingspan bar)
├── AudioPlayer
├── DiscoverButton (random bird selection)
├── QuizPanel (quiz UI + confetti + shake)
├── SoundGuessPanel (sound guessing game)
├── BirdEncyclopediaPanel (scrollable bird list)
├── ContinentBirdPanel (birds by continent)
├── EvolutionTimeline (horizontal timeline panel)
└── MigrationMapToggle (all-routes toggle button)
```

## Key Technical Decisions

### TD-25: OrbitControls target locked to [0,0,0]
**Problem**: v4 CameraController lerps `controls.target` toward bird position, causing rotation pivot drift.
**Solution**: Never modify `controls.target`. Camera zoom-to-bird only changes camera position (direction + distance). Remove all `controls.target.lerp()` calls. OrbitControls target prop is `[0, 0, 0]` and never changes.

### TD-26: Declarative R3F patterns
**Problem**: v4 uses imperative patterns (try-catch around hooks, `new Material()` in useMemo, `primitive object=`).
**Solution**: Use declarative JSX for materials and geometry. Use `<meshStandardMaterial>` instead of `new MeshStandardMaterial()`. Use `<Suspense>` + error boundaries for loading states. Call hooks unconditionally.

### TD-27: Atmosphere as Fresnel shell
**Problem**: v4 `onBeforeCompile` rim glow is fragile and hard to tune.
**Solution**: Dedicated `<AtmosphereShell>` component — a BackSide sphere at scale 1.025 with custom ShaderMaterial using smooth Fresnel falloff (exponent 3.0, opacity 0.15, additive blending).

### TD-28: Country borders via GeoJSON
**Problem**: Globe has no geographic reference points.
**Solution**: Load simplified Natural Earth GeoJSON (110m resolution). Project coordinates to 3D at radius 1.001. Render as `<Line>` segments from drei. Thin, semi-transparent white lines.

### TD-29: Zoom-dependent map labels
**Problem**: No continent/ocean names on globe.
**Solution**: Use `<Html>` from drei positioned at continent/ocean centers. Visibility controlled by camera distance (< 2.0). Opacity fades smoothly. Bilingual text from language store.

### TD-30: Improved lighting
**Problem**: Flat lighting (ambient 0.4 + two directionals) lacks depth.
**Solution**: Reduce ambient to 0.3, add `<hemisphereLight>` for sky-ground gradient, keep directionals for sun/fill.

### TD-31: Higher-quality bird model
**Problem**: Generated bird.glb is crude geometric shapes.
**Solution**: Source a quality stylized bird GLB from free asset library or create a proper one. Must look recognizable at 0.03 scale.

### TD-32: Sound ripple system *(v6)*
**Problem**: No visual feedback when bird audio plays.
**Solution**: `<SoundRipple>` component renders expanding `RingGeometry` meshes at bird position when `audioStatus === "playing"`. Uses `useFrame` for radius/opacity animation. 2-3 concurrent rings with staggered timing. Positioned at bird marker height, oriented along surface normal.

### TD-33: Habitat highlight rendering *(v6)*
**Problem**: No visual indication of bird habitat type on globe.
**Solution**: `<HabitatHighlight>` component renders a `CircleGeometry` glow patch at radius 1.003 when a bird is selected. Color mapped from `habitatType` field. `MeshBasicMaterial` with additive blending, transparent. Fades in/out on selection change.

### TD-34: Discovery gameplay mode *(v6)*
**Problem**: Children may not know which bird to explore next.
**Solution**: `<DiscoverButton>` UI component selects a random bird from `birds.json`, calls `setSelectedBird()`. Positioned bottom-right, bilingual label, large tap target. Reuses existing camera fly-to and info card systems.

### TD-35: Quiz gameplay system *(v6)*
**Problem**: No way to test what children have learned.
**Solution**: `QuizManager.ts` generates 3 questions per round from 3 types (geography, sound, size). `<QuizPanel>` renders quiz UI with idle/active/result states. Zustand store manages `quizState`, `quizQuestions`, `quizCurrentIndex`, `quizScore`, `quizLastCorrect`. Confetti on correct, shake on wrong.

### TD-36: Migration story animation *(v6)*
**Problem**: Migration arcs are static dashed lines — not engaging for children.
**Solution**: Add `FlyingBirdIcon` (small sphere) that traverses each arc over 3 seconds using `useFrame` + curve sampling. Add `MigrationLabel` using `<Html>` at arc midpoint showing distance text. Labels only visible when camera distance < 2.5.

### TD-37: Bird size comparison *(v6)*
**Problem**: Children can't visualize bird sizes.
**Solution**: Add `sizeCategory` field to bird data. Display horizontal size bar in `BirdInfoCard` with reference icons (sparrow → eagle). Categories: tiny, small, medium, large.

### TD-38: Continent learning panel *(v6)*
**Problem**: No way to explore birds by geographic region.
**Solution**: `<ContinentBirdPanel>` slides in when a continent label is clicked. Lists all birds in that continent's region. Click entry → fly to bird. Uses `continentPanelRegion` state in Zustand.

### TD-39: Wing flap animation *(v6)*
**Problem**: Bird markers feel static.
**Solution**: In `BirdMarker.tsx`, add Y-axis scale oscillation via `useFrame`. Period ~1.2s, small amplitude. Does not affect click targets.

### TD-40: Bird encyclopedia panel *(v6)*
**Problem**: No overview of all available birds.
**Solution**: `<BirdEncyclopediaPanel>` slides in from left. Scrollable list of all 15 birds with thumbnail, Chinese name, English name. Click entry → fly to bird + open info card. Toggle via "📖" button. Uses `encyclopediaOpen` state in Zustand.

### TD-41: Global migration map visualization *(v7)*
**Problem**: Children can only see migration routes one at a time — no sense of global migration scale.
**Solution**: Add `showAllRoutes` boolean to Zustand store. When toggled, `MigrationPaths.tsx` renders all routes simultaneously with distinct colors from a warm palette. Selected bird's route highlights at full opacity; others dim to 0.3. `<MigrationMapToggle>` UI button controls the toggle.

### TD-42: Bird evolution timeline *(v7)*
**Problem**: No temporal context for birds — children don't know how old bird species are.
**Solution**: `<EvolutionTimeline>` panel slides up from bottom. Horizontal scrollable timeline from 150 Mya to present. Birds placed at positions based on `evolutionEra` field. Click bird avatar → fly to bird on globe. Uses `evolutionTimelineOpen` state in Zustand.

### TD-43: Bird diet visualization *(v7)*
**Problem**: Diet information is plain text — not engaging for children.
**Solution**: Add `dietType` structured field to bird data. Map each type to an emoji icon. Display in `BirdInfoCard` as a compact icon + label row. Bilingual labels.

### TD-44: Wingspan comparison bar *(v7)*
**Problem**: Wingspan numbers are abstract — children can't visualize them.
**Solution**: Add `wingspanCm` numeric field to bird data. Display horizontal bar in `BirdInfoCard` showing wingspan relative to a child's arm span (120 cm reference line). Bar color matches habitat color. `<WingspanBar>` sub-component.

### TD-45: Sound guess gameplay *(v7)*
**Problem**: Quiz mode tests knowledge but doesn't train listening skills.
**Solution**: `SoundGuessManager.ts` generates rounds: play random bird audio, show 3 photo options. `<SoundGuessPanel>` renders game UI. 5 rounds per session. Reuses confetti/shake from quiz. State: `soundGuessState`, `soundGuessRound`, `soundGuessScore`, `soundGuessOptions`, `soundGuessCorrectId`.

### TD-46: Improved starfield with parallax depth *(v7)*
**Problem**: Single-layer starfield feels flat.
**Solution**: Replace `Starfield.tsx` with 3-layer parallax system. Far layer (3000 stars, radius 15–20), mid layer (1500 stars, radius 10–15), near layer (500 stars, radius 6–10). Each layer rotates at slightly different speed relative to camera. 10% of stars have slow opacity twinkle via `useFrame`. Total ~5000 particles.

## Component Inventory

### 3D Components (src/components/three/)
| Component | Purpose | Version |
|-----------|---------|---------|
| `GlobeScene.tsx` | Scene orchestrator: lights, globe, markers, paths, labels, camera | v1+ |
| `Globe.tsx` | Earth sphere mesh with texture | v1+ |
| `CloudLayer.tsx` | Semi-transparent cloud sphere | v3+ |
| `Starfield.tsx` | 3-layer parallax star background with twinkle | v1+ (v7: parallax) |
| `AtmosphereShell.tsx` | Fresnel atmosphere glow | v5+ |
| `CountryBorders.tsx` | GeoJSON country boundary lines | v5+ |
| `MapLabels.tsx` | Continent/ocean labels (Html) | v5+ |
| `BirdMarker.tsx` | GLTF bird model with interactions + wing flap | v1+ (v6: wing flap) |
| `MigrationPaths.tsx` | Migration arcs + flying icon + labels + all-routes mode | v3+ (v7: all-routes) |
| `SoundRipple.tsx` | Expanding ring waves at bird position | v6 |
| `HabitatHighlight.tsx` | Colored habitat glow on globe | v6 |
| `CameraController.tsx` | Camera fly-to, auto-rotate, zoom | v2+ |

### UI Components (src/components/ui/)
| Component | Purpose | Version |
|-----------|---------|---------|
| `BirdInfoCard.tsx` | Bird info overlay with size, diet, wingspan | v1+ (v7: diet + wingspan) |
| `LangToggle.tsx` | Language switch button | v1+ |
| `LoadingScreen.tsx` | Asset loading screen | v1+ |
| `AudioPlayer.tsx` | Audio playback controller | v1+ |
| `DiscoverButton.tsx` | Random bird discovery button | v6 |
| `QuizPanel.tsx` | Quiz UI (idle/active/result) | v6 |
| `BirdEncyclopediaPanel.tsx` | Scrollable bird list panel | v6 |
| `ContinentBirdPanel.tsx` | Birds-by-continent panel | v6 |
| `EvolutionTimeline.tsx` | Horizontal bird evolution timeline panel | v7 |
| `WingspanBar.tsx` | Wingspan comparison bar sub-component | v7 |
| `SoundGuessPanel.tsx` | Sound guessing game UI | v7 |
| `MigrationMapToggle.tsx` | All-routes toggle button | v7 |

### Systems (src/systems/)
| System | Purpose | Version |
|--------|---------|---------|
| `QuizManager.ts` | Quiz question generation (geography/sound/size) | v6 |
| `SoundGuessManager.ts` | Sound guess round generation | v7 |

## State Management

Zustand store shape (v7):
```typescript
interface AppStore {
  // Core state
  selectedBirdId: string | null;
  language: Language;
  audioStatus: AudioStatus;
  globeReady: boolean;
  modelsReady: boolean;

  // v6: Encyclopedia
  encyclopediaOpen: boolean;

  // v6: Continent learning
  continentPanelRegion: string | null;

  // v6: Quiz
  quizState: QuizState;
  quizQuestions: QuizQuestion[];
  quizCurrentIndex: number;
  quizScore: number;
  quizLastCorrect: boolean | null;

  // v7: Global migration map
  showAllRoutes: boolean;

  // v7: Evolution timeline
  evolutionTimelineOpen: boolean;

  // v7: Sound guess
  soundGuessState: "idle" | "playing" | "guessing" | "result";
  soundGuessRound: number;
  soundGuessScore: number;
  soundGuessOptions: SoundGuessOption[];
  soundGuessCorrectId: string | null;

  // Actions (existing)
  setSelectedBird: (id: string | null) => void;
  toggleLanguage: () => void;
  setAudioStatus: (status: AudioStatus) => void;
  setGlobeReady: (ready: boolean) => void;
  setModelsReady: (ready: boolean) => void;
  setEncyclopediaOpen: (open: boolean) => void;
  setContinentPanelRegion: (region: string | null) => void;
  startQuiz: (questions: QuizQuestion[]) => void;
  answerQuiz: (correct: boolean) => void;
  nextQuizQuestion: () => void;
  endQuiz: () => void;

  // Actions (v7)
  setShowAllRoutes: (show: boolean) => void;
  setEvolutionTimelineOpen: (open: boolean) => void;
  startSoundGuess: () => void;
  setSoundGuessOptions: (options: SoundGuessOption[], correctId: string) => void;
  answerSoundGuess: (birdId: string) => void;
  nextSoundGuessRound: () => void;
  endSoundGuess: () => void;
}
```

## Data Files

### `src/data/birds.json`
15 bird entries with v7 extended fields: `sizeCategory`, `habitatType`, `migrationDistanceKm`, `diet`, `wingspan`, `lifespan`, `evolutionEra`, `dietType`, `wingspanCm`.

### `src/data/migrations.json`
4 migration routes with `migrationDistanceKm`.

### `src/data/labels.ts`
Continent and ocean label positions with bilingual names.

### `public/data/countries-110m.json`
Simplified Natural Earth GeoJSON for country borders.

## Implementation Phases (v5 — completed)

- Phase 26: Fix OrbitControls Target Lock ✅
- Phase 27: Improve Lighting ✅
- Phase 28: Replace Atmosphere with Fresnel Shell ✅
- Phase 29: Fix BirdMarker Hooks & Declarative Pattern ✅
- Phase 30: Replace Bird Model ✅
- Phase 31: Improve Migration Paths ✅
- Phase 32: Add Country Borders ✅
- Phase 33: Add Map Labels ✅
- Phase 34: Final Verification (v5) ✅

## Implementation Phases (v6 — completed)

- Phase 35: Sound Ripple System ✅ → R-14, AC-12
- Phase 36: Habitat Highlight Rendering ✅ → R-15, AC-13
- Phase 37: Discovery Gameplay Mode ✅ → R-16, AC-14
- Phase 38: Migration Story Animation ✅ → R-17, AC-15
- Phase 39: Bird Size Comparison ✅ → R-18, AC-16
- Phase 40: Continent Learning Panel ✅ → R-19, AC-17
- Phase 41: Quiz Gameplay System ✅ → R-20, AC-18
- Phase 42: Wing Flap Animation ✅ → R-21, AC-19
- Phase 43: Bird Encyclopedia Panel ✅ → R-22, AC-20
- Phase 44: Extended Data Model ✅ → Bird + MigrationRoute type extensions
- Phase 45: Final Verification (v6) ✅ → AC-12 through AC-20, AC-ARCH

## Implementation Phases (v7)

- Phase 46: Extended Data Model (v7) → Bird type + data extensions
- Phase 47: Improved Starfield Depth → R-28, AC-26
- Phase 48: Global Migration Map → R-23, AC-21
- Phase 49: Bird Diet Visualization → R-25, AC-23
- Phase 50: Wingspan Comparison Bar → R-26, AC-24
- Phase 51: Bird Evolution Timeline → R-24, AC-22
- Phase 52: Sound Guess Mode → R-27, AC-25
- Phase 53: BirdInfoCard v7 Integration → R-25, R-26
- Phase 54: Refactor & Clean Up → AC-ARCH
- Phase 55: Final Verification (v7) → AC-21 through AC-26, AC-ARCH
