# 万羽拾音 (Kids Bird Globe) — Implementation Plan (v10)

> **v10 changelog**: Major upgrade — UI layout overhaul with strict flex-column card structure and spacing tokens, 3D bird model system with GLTFLoader and LOD switching, bird dataset expansion to 30+ species, bird sound playback feature, performance optimizations (lazy loading, visibility culling), child-friendly design polish (glass-morphism, tag colors, wingspan bar).
>
> **v9 changelog**: Educational exploration expansion — migration mode, guided discovery tour, AI bird guide, enhanced quiz, bird rarity system, bird radar, story-based exploration. Complete UI system overhaul with ActionButton component, right control panel, mobile safe areas, responsive layout, z-index hierarchy, bird tooltip, loading UI with progress.
>
> **v8 changelog**: Core interactive learning — bird info card redesign, animated birds, bird collection system, region filter, kid quest system, globe visual improvements, bird data model refactor.

## High-Level Architecture (v10)

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
│           │   ├── BirdMarker × 30+ (3D model + LOD + tooltip) [z-index: 1]
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
│   ├── ActionButton "Discover" → random bird
│   ├── ActionButton "Birds" → BirdEncyclopediaPanel
│   ├── ActionButton "Regions" → RegionFilterPanel
│   ├── ActionButton "Migration" → MigrationModePanel
│   ├── ActionButton "Quests" → QuestPanel
│   ├── ActionButton "Tour" → GuidedTour
│   └── ActionButton "Reset" → reset view
│
├── BirdInfoCard (center-bottom modal) [z-index: 20]
│   ├── ImageHeader (photo + rarity badge + audio indicator)
│   ├── TitleSection (nameZh, pinyin, nameEn)
│   ├── FunFact (amber card with "Did you know?")
│   ├── TagRow (continent=blue, habitat=green, lifespan=orange)
│   ├── InfoGrid (size, diet, wingspan bar)
│   ├── ActionButtons (Collect + Listen)
│   └── Close button
│
├── MyBirdsPanel (collection album) [z-index: 20]
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

## Key Technical Decisions (v10)

### TD-63: UI Layout Overhaul — Strict Flex-Column Card
**Problem**: Bird info card sections overlap each other, bottom tags overflow the card container, layout breaks on smaller screens.
**Solution**: Refactor BirdInfoCard to use strict flex-column layout with no absolute positioning inside the card. Structure: ImageHeader → TitleSection → FunFact → TagRow → InfoGrid → ActionButtons. Use spacing tokens (xs=6px, sm=10px, md=16px, lg=24px, xl=32px). Tag row uses `flex-wrap: wrap; gap: 8px`. Card uses `max-height: 80vh; overflow-y: auto`. Glass-morphism with `border-radius: 20px`.

### TD-64: Tag Row Overflow Fix
**Problem**: Tags overflow the card container on narrow screens.
**Solution**: Tag row uses `display: flex; flex-wrap: wrap; gap: 8px`. Tags wrap to next line instead of overflowing. Tag colors: continent=blue, habitat=green, lifespan=orange.

### TD-65: Sidebar Button Alignment
**Problem**: Floating sidebar buttons have inconsistent sizes and may overlap the globe.
**Solution**: All sidebar buttons have identical width and height. Position: `fixed; left: 24px; top: 120px`. Layout: `flex; flex-direction: column; gap: 16px`. Buttons never overlap the globe.

### TD-66: Card Scroll Behavior
**Problem**: Bird information panel content overflows the container.
**Solution**: Card uses `max-height: 80vh; overflow-y: auto`. Content scrolls within the container and never overflows.

### TD-67: 3D Bird Model System
**Problem**: App uses simple colored meshes instead of realistic bird models.
**Solution**: Use Three.js GLTFLoader via `@react-three/drei`'s `useGLTF` to load GLB bird models. Each bird location displays a small 3D model with idle animation (wing flap), slow floating motion, and gentle rotation. Scale: 0.2–0.3 relative to marker size. Sources: Sketchfab free models, PolyPizza, Google Poly archive.

### TD-68: LOD (Level of Detail) System
**Problem**: Loading 30+ 3D models simultaneously is too expensive.
**Solution**: When camera is far from a bird location, show a simple icon marker (sphere with emissive material). When camera zooms closer, load and display the 3D bird model. Limit max simultaneous 3D models to 15. Use distance-based culling to determine which birds get 3D models.

### TD-69: Bird Dataset Expansion
**Problem**: Current dataset has only 15 birds, too small for educational value.
**Solution**: Expand to 30+ birds covering all continents: South America (Andean Condor, Harpy Eagle, Scarlet Macaw, Hoatzin, Toco Toucan), North America (Bald Eagle, Snowy Owl, Peregrine Falcon, Canada Goose, California Condor), Africa (Secretary Bird, African Grey Parrot, Shoebill, Marabou Stork, Lilac-breasted Roller), Asia (Red-crowned Crane, Mandarin Duck, Great Hornbill, Himalayan Monal, Indian Peafowl), Oceania (Kookaburra, Cassowary, Kiwi, Sulphur-crested Cockatoo), Polar (Emperor Penguin, Albatross, Puffin, Arctic Tern).

### TD-70: Bird Sound Feature
**Problem**: No dedicated sound playback button on bird card.
**Solution**: Add "Listen" button with speaker icon on bird info card. Clicking plays bird call audio via xeno-canto API or direct soundUrl. Audio files lazy-loaded and compressed. Visual feedback with animated audio bars during playback.

### TD-71: Performance — Model Lazy Loading
**Problem**: Loading all bird models at once causes performance issues.
**Solution**: Only load bird models when they enter the visible region. Limit simultaneously visible models to 15. If more birds are nearby, fallback to icon markers. Use texture compression (KTX2) where possible.

### TD-72: Child-Friendly Design Polish
**Problem**: Card style needs more visual appeal for children.
**Solution**: Glass-morphism cards with `border-radius: 20px`, soft shadow, semi-transparent background. Tag color rules: continent=blue, habitat=green, lifespan=orange. Fun Fact section with "Did you know?" prompt. Habitat tags displayed prominently. Wingspan visualization bar showing comparison to child's arm span.

## Key Technical Decisions (v8+v9 — preserved)

### TD-47: UI System Overhaul — ActionButton Component
**Problem**: Buttons have inconsistent width, overlap each other, no defined layout zones.
**Solution**: Create reusable `ActionButton` component with fixed dimensions (h-44px, min-w-120px, rounded-12px, glass-morphism bg). All action buttons live inside `RightControlPanel` container positioned at bottom-right with flex-column layout and 8px gap. Mobile responsive: horizontal layout below 900px.

### TD-48: Z-Index Hierarchy
**Problem**: UI elements overlap unpredictably.
**Solution**: Enforce strict z-index layers: canvas=0, markers=1, HUD panels=10, tooltips=15, modal cards=20, loading=100. All components use these exact values.

### TD-49: Bird Information Card Redesign
**Problem**: Current card slides from side, blocks globe view.
**Solution**: Redesign as center-bottom modal panel that slides up. Max height 80vh. Includes sound playback button and collect button. Does not overlap right control panel.

### TD-50: Animated Bird Markers
**Problem**: Static markers feel lifeless.
**Solution**: Add subtle circular/floating flight animation to BirdMarker. Each bird orbits a small radius around its position using `useFrame`. Clicking pauses animation for 3 seconds. Keep animation lightweight — simple sin/cos position offset.

### TD-51: Bird Collection System
**Problem**: No way to save discovered birds.
**Solution**: `useCollection` hook manages localStorage persistence. Collect button in info card triggers save with sparkle animation. `MyBirdsPanel` displays grid of collected bird thumbnails.

### TD-52: Region Filter
**Problem**: No way to explore birds by geographic region.
**Solution**: `RegionFilterPanel` with 8 region buttons. Selecting a region triggers camera zoom and filters visible birds.

### TD-53: Kid Quest System
**Problem**: No gamification or goals for children.
**Solution**: `QuestManager` system generates quests from templates. Quest types: find_region, collect_count, discover_bird. Progress tracked in localStorage.

### TD-54: Migration Mode
**Problem**: No dedicated migration exploration mode.
**Solution**: `MigrationModePanel` provides focused migration exploration with animated routes and flying bird icons.

### TD-55: Guided Discovery Tour
**Problem**: Children may not know where to start exploring.
**Solution**: `GuidedTour` orchestrates automated camera tour visiting predefined waypoints with featured birds.

### TD-56: AI Bird Guide
**Problem**: No contextual help or educational prompts.
**Solution**: `BirdGuide` renders owl avatar at bottom-left with contextual messages. Auto-dismisses after 5 seconds.

### TD-57: Bird Rarity System
**Problem**: All birds feel equally important.
**Solution**: Rarity field (common/rare/legendary) with visual effects: golden glow for rare, particle sparkle for legendary.

### TD-58: Bird Radar
**Problem**: Children may miss birds in their current view.
**Solution**: `BirdRadar` renders circular radar in corner showing nearby bird positions.

### TD-59: Story-Based Exploration
**Problem**: No themed discovery experience.
**Solution**: `StoryExplorer` offers themed bird sets with discovery progress and badge rewards.

## Component Inventory (v10 additions)

### Modified Components
| Component | Changes | Version |
|-----------|---------|---------|
| `BirdInfoCard.tsx` | Strict flex-column layout, spacing tokens, tag colors, glass-morphism, Listen button, 80vh scroll | v10 |
| `BirdMarker.tsx` | 3D model support, LOD system, enhanced animations | v10 |
| `RightControlPanel.tsx` | Consistent button sizing, no overlap | v10 |
| `ActionButton.tsx` | Identical width/height enforcement | v10 |
| `LoadingScreen.tsx` | Enhanced progress stages for 30+ birds | v10 |

### Data Files
| File | Changes | Version |
|------|---------|---------|
| `birds.json` | Expanded to 30+ birds, added soundUrl field | v10 |
| `stories.json` | Updated with new bird IDs | v10 |

### Types
| Type | Changes | Version |
|------|---------|---------|
| `Bird` | Added `soundUrl` field | v10 |
| `HabitatType` | Added mountains, desert, ocean, tundra | v10 |

## State Management (v10 — no new state needed)

Existing Zustand store already supports all v10 features. Audio playback uses existing `audioStatus` state. Bird selection, collection, and region filtering work with expanded dataset without changes.

## Implementation Phases (v10)

- Phase 76: UI Layout Fix — BirdInfoCard strict flex-column, spacing tokens, tag colors → R-4, R-19
- Phase 77: UI Layout Fix — Tag row overflow, card scroll, glass-morphism → R-4, R-19
- Phase 78: UI Layout Fix — Sidebar buttons, right control panel alignment → R-19
- Phase 79: 3D Bird Model System — GLTFLoader, LOD, animations → R-3
- Phase 80: Bird Dataset Expansion — 30+ birds in birds.json → R-2
- Phase 81: Bird Sound Feature — Listen button, audio playback → R-16
- Phase 82: Performance Optimization — Lazy loading, visibility culling → R-20
- Phase 83: Child-Friendly Design Polish — Glass-morphism, tag colors, wingspan bar → R-4
- Phase 84: Final Verification → All v10 ACs

## Implementation Phases (v8 — preserved)

- Phase 56: Data Model Extension (v8) → R-2
- Phase 57: UI System — ActionButton + RightControlPanel → R-19
- Phase 58: Bird Info Card Redesign → R-4
- Phase 59: Animated Bird Markers + Tooltip → R-3
- Phase 60: Bird Collection System → R-5
- Phase 61: Region Filter → R-6
- Phase 62: Kid Quest System → R-7
- Phase 63: Loading UI Enhancement → R-19
- Phase 64: Globe Visual Improvements → R-8

## Implementation Phases (v9 — preserved)

- Phase 65: Migration Mode → R-9
- Phase 66: Guided Discovery Tour → R-10
- Phase 67: AI Bird Guide → R-11
- Phase 68: Enhanced Learning Quiz → R-12
- Phase 69: Bird Rarity System → R-13
- Phase 70: Bird Radar → R-14
- Phase 71: Story-Based Exploration → R-15

## Implementation Phases (Refactor + Polish — preserved)

- Phase 72: UI Consistency Pass → R-19
- Phase 73: Mobile Responsive + Safe Areas → R-19
- Phase 74: Performance Optimization → R-20
- Phase 75: Final Verification → All ACs
