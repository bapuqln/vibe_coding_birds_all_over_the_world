# 万羽拾音 (Kids Bird Globe) — Implementation Plan (v12)

> **v12 changelog**: Full-scope expansion — dataset to 50+ birds, migration visualization with animated arcs and moving dots, bird distribution heatmap layer, AR bird viewing mode, enhanced bird click animations (flap, hop, look, circle flight), performance optimization with KTX2 textures and lazy loading, educational features (wingspan bar, fun facts).
>
> **v11 changelog**: Full-scope upgrade — UI layout overhaul with strict flex-column card structure and spacing tokens, 3D bird model system with GLTFLoader and LOD switching, bird dataset expansion to 40+ species, bird sound playback feature, bird discovery system with "New bird discovered!" notification, exploration progress system with continent-level tracking, bird click animations (wing flap, lift, rotate), performance optimizations (lazy loading, visibility culling), child-friendly design polish (glass-morphism, tag colors, wingspan bar).
>
> **v10 changelog**: Major upgrade — UI layout overhaul with strict flex-column card structure and spacing tokens, 3D bird model system with GLTFLoader and LOD switching, bird dataset expansion to 30+ species, bird sound playback feature, performance optimizations (lazy loading, visibility culling), child-friendly design polish (glass-morphism, tag colors, wingspan bar).
>
> **v9 changelog**: Educational exploration expansion — migration mode, guided discovery tour, AI bird guide, enhanced quiz, bird rarity system, bird radar, story-based exploration. Complete UI system overhaul with ActionButton component, right control panel, mobile safe areas, responsive layout, z-index hierarchy, bird tooltip, loading UI with progress.
>
> **v8 changelog**: Core interactive learning — bird info card redesign, animated birds, bird collection system, region filter, kid quest system, globe visual improvements, bird data model refactor.

## High-Level Architecture (v12)

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
│           │   ├── BirdMarker × 50+ (3D model + LOD + tooltip + click animation) [z-index: 1]
│           │   ├── SoundRipple
│           │   ├── MigrationPaths (animated arcs + moving dots)
│           │   ├── HeatmapLayer (bird density visualization)
│           │   └── RarityEffects (glow/particles for rare birds)
│           ├── MapLabels (Html, zoom-dependent, clickable)
│           ├── CameraController (fly-to, auto-rotate, region zoom, tour)
│           └── OrbitControls (target=[0,0,0], locked)
│
├── LoadingScreen (progress indicator) [z-index: 100]
├── AppTitle [z-index: 10]
├── LangToggle [z-index: 10]
│
├── DiscoveryProgressBar (global + continent progress) [z-index: 10]
│
├── RightControlPanel [z-index: 10]
│   ├── ActionButton "Discover" → random bird
│   ├── ActionButton "Birds" → BirdEncyclopediaPanel
│   ├── ActionButton "Regions" → RegionFilterPanel
│   ├── ActionButton "Migration" → MigrationModePanel
│   ├── ActionButton "Heatmap" → toggle heatmap layer
│   ├── ActionButton "Quests" → QuestPanel
│   ├── ActionButton "Tour" → GuidedTour
│   └── ActionButton "Reset" → reset view
│
├── BirdInfoCard (center-bottom modal) [z-index: 20]
│   ├── ImageHeader (photo + rarity badge + audio indicator)
│   ├── TitleSection (nameZh large bold, pinyin small subtle, nameEn medium)
│   ├── FunFact (amber card with "Did you know?")
│   ├── TagRow (continent=blue, habitat=green, lifespan=orange)
│   ├── InfoGrid (size, diet, wingspan bar)
│   ├── ActionButtons (Collect + Listen + View in AR)
│   └── Close button
│
├── ARViewerModal (camera overlay + 3D model) [z-index: 30]
│
├── DiscoveryNotification ("New bird discovered!") [z-index: 25]
│
├── MyBirdsPanel (collection album with discovered/locked) [z-index: 20]
├── RegionFilterPanel [z-index: 20]
├── QuestPanel [z-index: 20]
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

## Key Technical Decisions (v12)

### TD-77: Dataset Expansion to 50+
**Problem**: 47 birds is insufficient for the target of 50+ with comprehensive global coverage.
**Solution**: Add additional birds to reach 50+ total: Barn Swallow (Europe/Africa migration), Bar-tailed Godwit (record migration), Snowy Egret (North America), Ruby-throated Hummingbird (North America), Galápagos Penguin (South America), Superb Lyrebird (Oceania). Each with complete data fields including migration flag and model path.

### TD-78: Migration Route Visualization Enhancement
**Problem**: Current migration routes reference non-existent bird IDs and lack visual impact.
**Solution**: Fix migration data to reference actual bird IDs. Add Arctic Tern (Arctic to Antarctic), Bar-tailed Godwit (Alaska to New Zealand), Barn Swallow (Europe to Africa) routes. Enhance visualization with glowing arc lines (emissive shader) and animated moving dots along the path. Each route has a distinct color.

### TD-79: Bird Distribution Heatmap
**Problem**: No visualization of global bird diversity patterns.
**Solution**: Create `HeatmapLayer` component that renders a semi-transparent sphere overlay slightly above the globe. Generate heatmap from bird coordinates using Gaussian kernel density estimation. Color gradient: blue (few birds) → green (moderate) → red (high diversity). Toggle via "Bird Diversity Map" button in control panel. Implemented as a custom shader on a sphere mesh.

### TD-80: AR Bird Viewing Mode
**Problem**: No way to view birds in real-world context.
**Solution**: Add `ARViewerModal` component. On supported devices, use `navigator.mediaDevices.getUserMedia` to access camera feed, overlay 3D bird model using a secondary Three.js canvas. Touch controls for rotate/zoom. Graceful fallback: show 3D model viewer without camera background on unsupported devices. Button appears on bird info card.

### TD-81: Enhanced Bird Click Animations
**Problem**: Click animation is limited to wing flap, lift, and rotate.
**Solution**: Extend animation sequence: (1) rapid wing flap 0.3s, (2) short hop upward 0.2s, (3) rotate to face camera 0.3s, (4) brief circle flight around position 0.5s. Total animation ~1.3s. Implemented via state machine in `useFrame` with phase tracking. Animations feel playful and child-friendly.

### TD-82: Performance — KTX2 Textures
**Problem**: Texture loading can be slow on mobile devices.
**Solution**: Where possible, use KTX2 compressed textures via `@react-three/drei`'s `useKTX2` or manual KTX2Loader. Fallback to standard textures if KTX2 not supported. Maintain max 15 simultaneous 3D models with distance-based culling.

## Key Technical Decisions (v11 — preserved)

### TD-73: Bird Discovery System
**Problem**: No first-time discovery mechanic.
**Solution**: Track discovered birds in localStorage. Show "New bird discovered!" notification on first click. Discovery count: "12/50 birds discovered". Collection screen shows discovered and locked birds.

### TD-74: Exploration Progress System
**Problem**: No global or continent-level progress tracking.
**Solution**: `DiscoveryProgressBar` showing global progress with continent breakdown. Real-time updates.

### TD-75: Bird Click Animation
**Problem**: Clicking a bird has no visual feedback beyond pausing movement.
**Solution**: On click, trigger animation: wing flap, lift, rotate to camera. Implemented in `useFrame`.

### TD-76: Dataset Expansion
**Problem**: Dataset needs more birds for educational value.
**Solution**: Expand to 50+ birds covering all continents with complete data fields.

## Key Technical Decisions (v10 — preserved)

### TD-63: UI Layout Overhaul — Strict Flex-Column Card
**Problem**: Bird info card sections overlap.
**Solution**: Strict flex-column layout. Structure: ImageHeader → TitleSection → FunFact → TagRow → InfoGrid → ActionButtons. Spacing tokens. Tag row wraps. Card scrolls at 80vh. Glass-morphism with border-radius 20px.

### TD-64–TD-72: (preserved from v10/v11)
See previous plan versions for details on tag overflow fix, sidebar alignment, 3D model system, LOD, sound feature, performance, and design polish.

## Component Inventory (v12 additions)

### New Components
| Component | Purpose | Version |
|-----------|---------|---------|
| `HeatmapLayer.tsx` | Bird density heatmap overlay on globe | v12 |
| `ARViewerModal.tsx` | AR bird viewing with camera overlay | v12 |

### Modified Components
| Component | Changes | Version |
|-----------|---------|---------|
| `BirdInfoCard.tsx` | Add "View in AR" button, enhanced fun fact styling | v12 |
| `BirdMarker.tsx` | Enhanced click animation (hop, circle flight) | v12 |
| `RightControlPanel.tsx` | Add Heatmap toggle button | v12 |
| `MigrationPaths.tsx` | Fix route references, add new migration routes | v12 |
| `GlobeScene.tsx` | Add HeatmapLayer component | v12 |

### Data Files
| File | Changes | Version |
|------|---------|---------|
| `birds.json` | Expanded to 50+ birds, added migration/model fields | v12 |
| `migrations.json` | Fixed references, added Arctic Tern/Godwit/Swallow routes | v12 |

### Store Changes
| State | Changes | Version |
|-------|---------|---------|
| `heatmapVisible` | New: toggle for heatmap layer | v12 |
| `arViewerBirdId` | New: bird ID for AR viewer modal | v12 |

## State Management (v12)

New Zustand store additions:
- `heatmapVisible: boolean` — toggle for bird distribution heatmap.
- `setHeatmapVisible(visible)` — sets heatmap visibility.
- `arViewerBirdId: string | null` — bird ID for AR viewer.
- `setARViewerBird(birdId)` — opens AR viewer for bird.

## Implementation Phases (v12)

- Phase 93: Dataset Expansion to 50+ — additional birds in birds.json → R-2
- Phase 94: Migration Route Fix & Enhancement — fix references, add new routes, glowing arcs → R-9
- Phase 95: Bird Distribution Heatmap — HeatmapLayer component, toggle button → R-24
- Phase 96: AR Bird Viewing Mode — ARViewerModal, camera overlay → R-25
- Phase 97: Enhanced Bird Click Animations — hop, circle flight → R-23
- Phase 98: UI Layout Hardening — verify all layout rules → R-4, R-19
- Phase 99: Performance Optimization — KTX2, lazy loading verification → R-20
- Phase 100: Final Verification → All v12 ACs

## Implementation Phases (v11 — preserved)

- Phase 85–92: See v11 plan for discovery system, progress, click animation, dataset expansion, UI hardening, MyBirdsPanel, performance, verification.

## Implementation Phases (v10 — preserved)

- Phase 76–84: See v10 plan for UI layout, 3D models, dataset, sound, performance, design polish, verification.

## Implementation Phases (v8+v9 — preserved)

- Phase 56–75: See v8/v9 plan for data model, UI system, info card, animated markers, collection, region filter, quests, loading, globe visuals, migration, tour, guide, quiz, rarity, radar, stories, consistency, responsive, performance, verification.
