# 万羽拾音 (Kids Bird Globe) — Implementation Plan (v15)

> **v15 changelog**: Immersive Experience Upgrade — real-time day-night Earth rendering with dynamic sun-position directional light (day side bright, night side dark with city lights emissive texture), enhanced atmosphere glow, AI bird narration system using Web Speech API with "Tell me about this bird" button, improved bird discovery celebration with star-particle animation, enhanced educational bird info card with scientific name and wingspan comparison, improved camera fly-to with gentle orbit after arrival, Whooping Crane migration route added, performance optimization with lazy loading and KTX2 textures.
>
> **v14 changelog**: Visual & Interaction Upgrade — glassmorphism design system with CSS utility classes, modern pill-shaped buttons with hover glow, improved globe rendering (enhanced atmosphere, rim lighting, better clouds), bird hover interactions (scale, glow, tooltip), particle bird silhouettes around globe, improved camera animation (ease-in-out, 1.2s), bottom discovery panel with progress bar, responsive layout improvements, rendering performance optimizations.
>
> **v13 changelog**: Global UI Layer System — unified 7-layer z-index hierarchy, refactored App root into layered container architecture, panel collision avoidance (one panel active at a time via `activePanel` store state), bird info card repositioned to right side (desktop) / bottom center (mobile), responsive layout (desktop sidebar+bottom+right, tablet collapsed+center modal, mobile full-screen sheets), safe area padding (20px all sides), modal priority with overlay blocking, smooth panel animations (250ms slide/scale-fade).
>
> **v12 changelog**: Full-scope expansion — dataset to 50+ birds, migration visualization with animated arcs and moving dots, bird distribution heatmap layer, AR bird viewing mode, enhanced bird click animations (flap, hop, look, circle flight), performance optimization with KTX2 textures and lazy loading, educational features (wingspan bar, fun facts).
>
> **v11 changelog**: Full-scope upgrade — UI layout overhaul with strict flex-column card structure and spacing tokens, 3D bird model system with GLTFLoader and LOD switching, bird dataset expansion to 40+ species, bird sound playback feature, bird discovery system with "New bird discovered!" notification, exploration progress system with continent-level tracking, bird click animations (wing flap, lift, rotate), performance optimizations (lazy loading, visibility culling), child-friendly design polish (glass-morphism, tag colors, wingspan bar).
>
> **v10 changelog**: Major upgrade — UI layout overhaul with strict flex-column card structure and spacing tokens, 3D bird model system with GLTFLoader and LOD switching, bird dataset expansion to 30+ species, bird sound playback feature, performance optimizations (lazy loading, visibility culling), child-friendly design polish (glass-morphism, tag colors, wingspan bar).
>
> **v9 changelog**: Educational exploration expansion — migration mode, guided discovery tour, AI bird guide, enhanced quiz, bird rarity system, bird radar, story-based exploration. Complete UI system overhaul with ActionButton component, right control panel, mobile safe areas, responsive layout, z-index hierarchy, bird tooltip, loading UI with progress.
>
> **v8 changelog**: Core interactive learning — bird info card redesign, animated birds, bird collection system, region filter, kid quest system, globe visual improvements, bird data model refactor.

## Key Technical Decisions (v15)

### TD-96: Real-Time Day-Night Earth Rendering
**Problem**: The globe has static uniform lighting — no sense of day/night, no city lights, no dynamic sun position. The Earth feels flat and unrealistic.
**Solution**: Replace the static directional light with a slowly rotating sun light. Modify `Globe.tsx` to use a custom shader that blends the day Earth texture with a night city-lights emissive texture based on the dot product of the surface normal and the sun direction. Fragments facing the sun are bright (day), fragments facing away show city lights (night). The sun direction rotates at ~0.02 rad/s. Add a city lights texture loaded via `useTexture`. The atmosphere shell already provides glow; enhance it to be visible from all angles.

### TD-97: AI Bird Narration System
**Problem**: Children can read bird info but cannot hear it spoken aloud. No audio narration exists.
**Solution**: Add a "Tell me about this bird" button to `BirdInfoCard`. On click, use the browser's `SpeechSynthesis` API to speak a child-friendly narration generated from the bird's data (name, habitat, fun fact, lifespan, wingspan). Voice selection prefers English voices with friendly tone. Rate set to 0.9 for clarity. If `SpeechSynthesis` is unavailable, display the narration text in a visible panel as fallback. Create a `useNarration` hook encapsulating the speech logic.

### TD-98: Bird Discovery Celebration Enhancement
**Problem**: The current discovery notification is a simple slide-in card. It lacks the "wow" factor for children.
**Solution**: Enhance `DiscoveryNotification` with a star-particle burst animation. Add 12-16 small star/sparkle elements that animate outward from the notification center using CSS keyframes. Add a subtle scale-bounce to the notification itself. The celebration should feel magical but brief (~1.5s).

### TD-99: Camera Orbit After Arrival
**Problem**: After the camera flies to a bird, it stops. The user must manually rotate to see the bird from different angles.
**Solution**: After the fly-to animation completes (1.2s), enable a gentle auto-orbit around the bird's position. Set `OrbitControls.autoRotate = true` with a slow speed (~0.5). If the user interacts (drag/scroll), disable auto-orbit immediately. This creates a cinematic "showcase" feel when viewing a bird.

### TD-100: Whooping Crane Migration Route
**Problem**: The migration dataset lacks the Whooping Crane, a well-known migratory bird.
**Solution**: Add Whooping Crane to `birds.json` (if not present) and add a migration route from breeding grounds (Wood Buffalo, Canada) to wintering grounds (Aransas, Texas) in `migrations.json`. Use a distinct color (#ec4899 pink) for the route.

## Key Technical Decisions (v14)

### TD-89: Glass UI Design System
**Problem**: UI panels use opaque dark backgrounds that feel heavy and dated. No consistent visual language across floating panels.
**Solution**: Implement glassmorphism design system with CSS utility classes. Glass properties: `background: rgba(255,255,255,0.12)`, `backdrop-filter: blur(20px)`, `border-radius: 20px`, soft shadow, subtle border. Three variants: `.glass-panel` (dark glass for overlays), `.glass-card` (light glass for cards), `.glass-button` (compact glass for buttons). Applied to BirdInfoCard, DiscoveryProgressBar, ActionButton, and bottom discovery panel.

### TD-90: Modern Button Design
**Problem**: ActionButtons use flat dark backgrounds with basic hover effects. They don't feel premium or kid-friendly.
**Solution**: Upgrade to rounded pill shape (`border-radius: 9999px`), glass background, hover glow effect (box-shadow with color spread), scale(1.05) on hover, scale(0.97) on active. Consistent across all button instances.

### TD-91: Globe Visual Improvements
**Problem**: Atmosphere glow is subtle and lighting is flat. Globe doesn't feel immersive.
**Solution**: Enhance AtmosphereShell with two-pass Fresnel shader (inner warm glow + outer cool halo). Add rim light (directional from behind) to create depth. Improve cloud layer opacity and blending. Increase hemisphere light warmth.

### TD-92: Bird Hover Interaction
**Problem**: Bird markers have basic hover (scale + emissive change) but no styled tooltip or smooth animation.
**Solution**: Enhance hover in BirdMarker: smoother scale lerp to 1.3, increased emissive glow, gentle floating bob. Upgrade Html tooltip with glass-style background, fade-in transition, bird name + region display.

### TD-93: Particle Bird Effects
**Problem**: Globe feels static when not interacting with birds.
**Solution**: Add `BirdParticles` component to GlobeScene. Render ~10 small bird-shaped particles orbiting the globe at varying altitudes and speeds. Use Points with custom shader or small instanced meshes. Very low density, slow movement, creates ambient life.

### TD-94: Camera Animation System
**Problem**: Camera lerp uses constant factor (0.04) resulting in linear-feeling motion without smooth acceleration/deceleration.
**Solution**: Replace constant lerp with ease-in-out timing. Track animation start time and use smoothstep function over 1.2s duration. Camera decelerates smoothly at destination. Feels cinematic and polished.

### TD-95: Bottom Discovery Panel
**Problem**: Discovery progress is only shown in the left sidebar. No prominent bottom panel showing exploration status.
**Solution**: Add `BottomDiscoveryPanel` component in bottom-center position. Shows "Birds discovered: X / Y" with glass-style progress bar. Positioned in BottomPanelLayer (z-40). Slide-up animation. Respects panel collision avoidance.

## High-Level Architecture (v13 — Layered UI)

```
App.tsx
├── GlobeLayer [z-index: 0]
│   └── Canvas (camera, background)
│       └── Suspense
│           └── GlobeScene
│               ├── Lighting (ambient + directional + hemisphere)
│               ├── Starfield (3-layer parallax)
│               ├── AtmosphereShell (Fresnel)
│               ├── group (earth group)
│               │   ├── Globe (textured sphere)
│               │   ├── CloudLayer
│               │   ├── CountryBorders (GeoJSON)
│               │   ├── HabitatHighlight
│               │   ├── BirdMarker × 50+ [z-index: 5 — marker layer]
│               │   ├── SoundRipple
│               │   ├── MigrationPaths
│               │   ├── HeatmapLayer
│               │   └── RarityEffects
│               ├── MapLabels
│               ├── CameraController
│               └── OrbitControls
│
├── UILayer (all floating UI)
│   ├── SidebarLayer [z-index: 20]
│   │   ├── AppTitle
│   │   ├── LangToggle
│   │   ├── DiscoveryProgressBar
│   │   ├── RightControlPanel
│   │   ├── BirdGuide
│   │   ├── BirdRadar
│   │   ├── StoryExplorer (launcher)
│   │   ├── BirdEncyclopediaPanel (launcher)
│   │   ├── QuizPanel (launcher)
│   │   ├── SoundGuessPanel (launcher)
│   │   └── EvolutionTimeline (launcher)
│   │
│   ├── BottomPanelLayer [z-index: 40]
│   │   ├── EvolutionTimeline (sheet)
│   │   └── GuidedTour (touring panel)
│   │
│   ├── CardLayer [z-index: 60]
│   │   ├── BirdInfoCard (right side on desktop, bottom on mobile)
│   │   └── DiscoveryNotification
│   │
│   ├── ModalLayer [z-index: 80]
│   │   ├── MyBirdsPanel
│   │   ├── RegionFilterPanel
│   │   ├── QuestPanel
│   │   ├── GuidedTour (intro)
│   │   ├── QuizPanel (active/result)
│   │   ├── SoundGuessPanel (active/result)
│   │   ├── StoryExplorer (modal)
│   │   ├── BirdEncyclopediaPanel (modal)
│   │   ├── ContinentBirdPanel
│   │   └── ARViewerModal
│   │
│   └── OverlayLayer [z-index: 100]
│       └── LoadingScreen
│
└── AudioPlayer (invisible)
```

## Component Inventory (v15 additions)

### New Components
| Component | Purpose | Version |
|-----------|---------|---------|
| `DayNightGlobe.tsx` | Replaces `Globe.tsx` with day-night shader using sun position | v15 |
| `SunLight.tsx` | Rotating directional light representing the sun | v15 |

### Modified Components
| Component | Changes | Version |
|-----------|---------|---------|
| `Globe.tsx` | Day-night custom shader with city lights emissive map | v15 |
| `GlobeScene.tsx` | Added rotating sun light, updated lighting setup | v15 |
| `BirdInfoCard.tsx` | Added "Tell me about this bird" narration button, scientific name display | v15 |
| `DiscoveryNotification.tsx` | Enhanced with star-particle celebration animation | v15 |
| `CameraController.tsx` | Added gentle orbit after fly-to arrival | v15 |
| `DiscoveryProgressBar.tsx` | Enhanced continent progress display | v15 |

### New Hooks
| Hook | Purpose | Version |
|------|---------|---------|
| `useNarration.ts` | Web Speech API narration with fallback | v15 |

### Data Changes
| File | Changes | Version |
|------|---------|---------|
| `migrations.json` | Added Whooping Crane migration route | v15 |
| `birds.json` | Added Whooping Crane bird entry | v15 |

## Implementation Phases (v15)

- Phase 119: Real-Time Day-Night Earth — sun light rotation, day-night shader, city lights → R-34
- Phase 120: Enhanced Migration Routes — Whooping Crane route, improved arc visualization → R-35
- Phase 121: AI Bird Narration System — useNarration hook, TTS button, fallback → R-36
- Phase 122: Bird Discovery Celebration — star particles, enhanced notification → R-37
- Phase 123: Enhanced Bird Info Card — scientific name, improved sections → R-38
- Phase 124: Camera Orbit After Arrival — gentle auto-rotate post fly-to → R-39
- Phase 125: Performance Optimization — lazy loading, model limits, KTX2 → R-40
- Phase 126: Final Verification → All v15 ACs

## Component Inventory (v14 additions)

### New Components
| Component | Purpose | Version |
|-----------|---------|---------|
| `BirdParticles.tsx` | Ambient bird silhouette particles orbiting globe | v14 |
| `BottomDiscoveryPanel.tsx` | Bottom-center discovery progress panel | v14 |

### Modified Components
| Component | Changes | Version |
|-----------|---------|---------|
| `index.css` | Glass UI utility classes, button glow keyframes | v14 |
| `ActionButton.tsx` | Pill shape, glass background, hover glow | v14 |
| `BirdInfoCard.tsx` | Glass background with enhanced blur | v14 |
| `DiscoveryProgressBar.tsx` | Glass panel styling | v14 |
| `AtmosphereShell.tsx` | Enhanced two-layer Fresnel glow | v14 |
| `GlobeScene.tsx` | Added rim light, BirdParticles | v14 |
| `CloudLayer.tsx` | Improved opacity and blending | v14 |
| `BirdMarker.tsx` | Enhanced hover glow, styled tooltip | v14 |
| `CameraController.tsx` | Ease-in-out animation, 1.2s duration | v14 |
| `App.tsx` | Added BottomDiscoveryPanel to BottomPanelLayer | v14 |

## Implementation Phases (v14)

- Phase 109: Glass UI Design System — CSS utility classes, glass variants → R-27
- Phase 110: Modern Button Design — pill shape, hover glow → R-28
- Phase 111: Globe Visual Improvements — atmosphere, lighting, clouds → R-29
- Phase 112: Bird Hover Interaction — scale, glow, tooltip → R-30
- Phase 113: Particle Bird Effects — ambient bird silhouettes → R-31
- Phase 114: Camera Animation System — ease-in-out, 1.2s → R-32
- Phase 115: Bottom Discovery Panel — progress display → R-33
- Phase 116: Panel Layout & Responsive — layout improvements → R-19
- Phase 117: Performance Optimization — lazy loading, limits → R-20
- Phase 118: Final Verification → All v14 ACs

## Key Technical Decisions (v13)

### TD-83: Global UI Layer System
**Problem**: UI elements overlap incorrectly — bird info card overlaps floating panels, floating UI elements block each other, modal panels appear behind other elements. Z-index values are inconsistent (z-10, z-20, z-25, z-30, z-50, z-100) with no unified system.
**Solution**: Implement a 7-layer z-index hierarchy: Layer 0 (canvas, z-0), Layer 1 (markers, z-5), Layer 2 (sidebar, z-20), Layer 3 (bottom panels, z-40), Layer 4 (cards, z-60), Layer 5 (modals, z-80), Layer 6 (overlays, z-100). All components must use layer-appropriate values. CSS custom properties define the layer values centrally.

### TD-84: Layered Container Architecture
**Problem**: All UI components are flat siblings in App.tsx with no structural grouping.
**Solution**: Refactor App.tsx into layered containers: GlobeLayer wraps the Canvas, UILayer wraps all floating UI with sub-containers SidebarLayer, BottomPanelLayer, CardLayer, ModalLayer, OverlayLayer. Each layer is a positioned div with the correct z-index. Components are placed in their semantic layer.

### TD-85: Panel Collision Avoidance
**Problem**: Multiple panels can open simultaneously causing overlap (e.g., BirdInfoCard + EvolutionTimeline, or multiple modals).
**Solution**: Add `activePanel` state to Zustand store tracking which panel type is currently active. Panel types: `null | 'birdCard' | 'collection' | 'regionFilter' | 'quests' | 'tour' | 'quiz' | 'soundGuess' | 'encyclopedia' | 'continentBird' | 'storyExplorer' | 'evolution' | 'ar'`. Opening one panel closes others. Store action `setActivePanel` manages transitions.

### TD-86: Bird Info Card Repositioning
**Problem**: Bird info card slides from bottom-center and overlaps with bottom panels (EvolutionTimeline, BirdGuide).
**Solution**: On desktop (>=1024px), bird info card opens from the right side as a slide-in panel. On mobile (<768px), it remains a bottom sheet. On tablet (768–1023px), it opens as a center modal. This ensures no overlap with left sidebar or bottom panels.

### TD-87: Responsive Layout Rules
**Problem**: No systematic responsive behavior — panels overlap on smaller screens.
**Solution**: Desktop: left sidebar + bottom panel + right info card. Tablet: sidebar collapses to icons, info card becomes center modal. Mobile: all panels become full-screen sheets with safe area padding.

### TD-88: Panel Animation System
**Problem**: Inconsistent animation styles across panels.
**Solution**: Standardize: bottom panels slide up (250ms ease-out), side panels slide from right (250ms ease-out), modals scale-fade in (250ms ease-out). Use CSS transitions with consistent timing.

## Key Technical Decisions (v12 — preserved)

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

## Component Inventory (v13 additions)

### Modified Components
| Component | Changes | Version |
|-----------|---------|---------|
| `App.tsx` | Refactored into layered container architecture | v13 |
| `BirdInfoCard.tsx` | Repositioned to right side (desktop), responsive layout, z-60 | v13 |
| `RightControlPanel.tsx` | Updated z-index to sidebar layer (z-20), safe area padding | v13 |
| `DiscoveryProgressBar.tsx` | Updated z-index to sidebar layer (z-20) | v13 |
| `BirdGuide.tsx` | Updated z-index to sidebar layer (z-20) | v13 |
| `BirdRadar.tsx` | Updated z-index to sidebar layer (z-20) | v13 |
| `LangToggle.tsx` | Updated z-index to sidebar layer (z-20) | v13 |
| `EvolutionTimeline.tsx` | Updated z-index: launcher z-20, sheet z-40 | v13 |
| `MyBirdsPanel.tsx` | Updated z-index to modal layer (z-80) | v13 |
| `RegionFilterPanel.tsx` | Updated z-index to modal layer (z-80) | v13 |
| `QuestPanel.tsx` | Updated z-index to modal layer (z-80) | v13 |
| `GuidedTour.tsx` | Updated z-index to modal layer (z-80) | v13 |
| `QuizPanel.tsx` | Updated z-index: launcher z-20, active z-80 | v13 |
| `SoundGuessPanel.tsx` | Updated z-index: launcher z-20, active z-80 | v13 |
| `StoryExplorer.tsx` | Updated z-index: launcher z-20, modal z-80 | v13 |
| `BirdEncyclopediaPanel.tsx` | Updated z-index: launcher z-20, modal z-80 | v13 |
| `ContinentBirdPanel.tsx` | Updated z-index to modal layer (z-80) | v13 |
| `ARViewerModal.tsx` | Updated z-index to modal layer (z-80) | v13 |
| `DiscoveryNotification.tsx` | Updated z-index to card layer (z-60) | v13 |
| `LoadingScreen.tsx` | Updated z-index to overlay layer (z-[100]) | v13 |

### New CSS
| File | Changes | Version |
|------|---------|---------|
| `index.css` | Added CSS custom properties for z-index layers, layer utility classes, panel animation keyframes | v13 |

### Store Changes
| State | Changes | Version |
|-------|---------|---------|
| `activePanel` | New: tracks which panel is currently active for collision avoidance | v13 |
| `setActivePanel` | New: action to set active panel, closing others | v13 |

## State Management (v13)

New Zustand store additions:
- `activePanel: PanelType | null` — tracks currently active panel for collision avoidance.
- `setActivePanel(panel)` — sets active panel, used by all panel open/close actions.
- Panel types: `'birdCard' | 'collection' | 'regionFilter' | 'quests' | 'tour' | 'quiz' | 'soundGuess' | 'encyclopedia' | 'continentBird' | 'storyExplorer' | 'evolution' | 'ar'`.

## Implementation Phases (v13)

- Phase 101: Global UI Layer System — CSS custom properties, z-index hierarchy → R-19
- Phase 102: Layered Container Architecture — refactor App.tsx → R-19
- Phase 103: Panel Collision Avoidance — activePanel store state → R-19
- Phase 104: Bird Info Card Repositioning — right side desktop, responsive → R-4, R-19
- Phase 105: Update All Component Z-Indexes — align all components to layer system → R-19
- Phase 106: Responsive Layout Rules — desktop/tablet/mobile breakpoints → R-19
- Phase 107: Safe Area & Animation Rules — 20px padding, 250ms animations → R-19
- Phase 108: Final Verification → All v13 ACs

## Component Inventory (v12 — preserved)

### New Components (v12)
| Component | Purpose | Version |
|-----------|---------|---------|
| `HeatmapLayer.tsx` | Bird density heatmap overlay on globe | v12 |
| `ARViewerModal.tsx` | AR bird viewing with camera overlay | v12 |

### Store Changes (v12)
| State | Changes | Version |
|-------|---------|---------|
| `heatmapVisible` | New: toggle for heatmap layer | v12 |
| `arViewerBirdId` | New: bird ID for AR viewer modal | v12 |

## Implementation Phases (v12 — preserved)

- Phase 93–100: See v12 plan for dataset expansion, migration routes, heatmap, AR, animations, UI hardening, performance, verification.

## Implementation Phases (v11 — preserved)

- Phase 85–92: See v11 plan for discovery system, progress, click animation, dataset expansion, UI hardening, MyBirdsPanel, performance, verification.

## Implementation Phases (v10 — preserved)

- Phase 76–84: See v10 plan for UI layout, 3D models, dataset, sound, performance, design polish, verification.

## Implementation Phases (v8+v9 — preserved)

- Phase 56–75: See v8/v9 plan for data model, UI system, info card, animated markers, collection, region filter, quests, loading, globe visuals, migration, tour, guide, quiz, rarity, radar, stories, consistency, responsive, performance, verification.
