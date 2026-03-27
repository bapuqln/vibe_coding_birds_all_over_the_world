# 万羽拾音 (Kids Bird Globe) — Feature Specification v33

> **v32 changelog**: Bird Migration Intelligence — centralized TimeController as single source of truth for all animation (birds, paths, seasons), centralized animation scheduler replacing per-object loops, InstancedMesh-based bird flock rendering for 30+ simultaneous birds at 50+ FPS, spherical interpolation migration paths using CatmullRomCurve3 mapped onto globe surface, gradient path materials (bright head, dim tail), season visual system with shader-based hemisphere tinting (winter cool north, summer green, migration highlight), learning interaction system (click bird → pause timeline → highlight path → show info card), timeline UI with month scrubbing (Jan–Dec), play/pause, speed control (1x/2x).

---

## V32 — Bird Migration Intelligence

### Overview

V32 introduces a unified time-driven migration intelligence system. All animations — bird movement, path rendering, season visuals — derive from a single `TimeState` controlled by a `TimeController`. Birds are rendered via `InstancedMesh` for GPU efficiency. Migration paths use spherical interpolation on the globe surface. The architecture enforces strict separation between rendering, domain logic, and UI.

### Data Models

#### TimeState

```typescript
interface TimeState {
  month: number; // 0–11 (Jan=0, Dec=11)
  progress: number; // 0–1 continuous progress within month
  isPlaying: boolean; // play/pause state
  speed: number; // 1 or 2
}
```

#### MigrationPath

```typescript
interface MigrationPath {
  birdId: string;
  waypoints: [number, number][]; // [lat, lng] array
  season: "spring" | "autumn";
  color: string;
  nameZh: string;
  nameEn: string;
}
```

#### FlockConfig

```typescript
interface FlockConfig {
  birdId: string;
  instanceCount: number; // 3–8
  pathId: string;
  offsets: number[]; // random per-instance offset
}
```

#### SeasonVisual

```typescript
interface SeasonVisual {
  month: number;
  northTint: string; // hex color for northern hemisphere
  southTint: string; // hex color for southern hemisphere
  migrationHighlight: boolean;
}
```

### TimeController (Single Source of Truth)

- Manages `TimeState` in Zustand store
- Provides `tick(delta)` method called by centralized animation scheduler
- All consumers read from `TimeState` — no independent timers
- Timeline UI drives `TimeState` via actions: `play()`, `pause()`, `setMonth(n)`, `setSpeed(s)`, `scrub(progress)`

### Animation Scheduler

- Single `useFrame` hook in `AnimationScheduler` component
- Calls `TimeController.tick(delta)` each frame
- All animated systems register update callbacks
- No per-object `useFrame` loops for migration animation

### Migration Path Rendering

- Paths computed via `CatmullRomCurve3` from waypoints
- Each waypoint converted to 3D via `latLngToVector3` at `radius + 0.02` (slight elevation)
- Spherical interpolation ensures paths follow globe curvature
- Gradient `ShaderMaterial`: bright at bird position (head), dim behind (tail)
- Path visibility tied to `TimeState.month` matching path season

### Flock Animation (InstancedMesh)

- Each species spawns 3–8 instances in a single `InstancedMesh`
- Shared `ConeGeometry` + `MeshStandardMaterial`
- Position derived from `TimeState.progress` along `CatmullRomCurve3`
- Per-instance random offset (±0.01 units) for natural spread
- Instance matrices updated in batch via `instanceMatrix.needsUpdate`

### Season Visual System

- Shader-based hemisphere tinting (no texture swapping)
- Winter (month 11–1): cooler blue tone in northern hemisphere
- Summer (month 5–7): greener tones globally
- Migration season (month 2–4, 8–10): highlighted migration paths with glow
- Smooth transitions between season states using `TimeState.progress`

### Learning Interaction

- Click on bird flock → `TimeController.pause()`
- Highlight associated migration path (increase glow intensity)
- Show info card: "This [bird name] migrates from [origin] to [destination]"
- Card includes: bird name, migration distance, season, fun fact
- Resume timeline on card dismiss

### Performance Requirements

- ≥ 30 birds rendered simultaneously via InstancedMesh
- Maintain 50+ FPS on M1 MacBook baseline
- No visible GC spikes (avoid per-frame allocations)
- Single draw call per flock species

### Non-Functional Requirements

- TimeController is the ONLY source of animation time
- No per-object animation loops
- Rendering, domain logic, and UI fully decoupled
- All migration paths use spherical interpolation

---

# 万羽拾音 (Kids Bird Globe) — Feature Specification v31

> **v31 changelog**: Structured Learning Experience — Learning Tracks system with themed bird discovery journeys (Birds of Prey, Ocean Birds, Rainforest Birds, Migratory Birds, Colorful Birds), track progress with badge rewards, upgraded AI Bird Guide with RAG-like BirdGuideService and prewritten fallback answers, Ecosystem Simulation with seasonal/temperature/wind/timeOfDay world state influencing bird behavior, Habitat Filter sidebar toggle for forest/wetlands/ocean/grassland/mountain/urban filtering, Seasonal Migration Visualization with glowing arc lines and directional particle flow tied to ecosystem seasons, Data Expansion with regional JSON lazy loading (asia.json, europe.json, americas.json).
>
> **v30 changelog**: Educational Layer — Bird Encyclopedia panel with search, continent filter, diet filter, wingspan filter, each bird entry with 3D model preview, habitat map highlight, sound playback, and detailed facts, performance monitoring overlay, dynamic LOD tuning, improved asset preloading, texture compression pipeline.
>
> **v29 changelog**: Shareable Discoveries — screenshot capture button saving canvas as PNG, share card generator creating shareable images with bird name/location/fun fact, export progress as JSON file, share UI panel with copy-to-clipboard and download options.
>
> **v28 changelog**: Story Mode — guided "Bird Adventure" exploration system with story sequences (Journey of the Arctic Tern, Rainforest Guardians, Birds of the African Savannah), camera auto-travel between story locations, voice narration per story step, highlighted birds at each location, Story panel UI with story selection and progress tracking.
>
> **v27 changelog**: Flocking System — replaced static bird markers with dynamic flock behavior using simplified boids algorithm (separation, alignment, cohesion), species-specific flock parameters (flock size, speed, altitude range), GPU-friendly instanced mesh updates for flock rendering, birds wander, flock, and circle habitats naturally.
>
> **v26 changelog**: Dynamic World Simulation — enhanced day/night cycle with real Earth rotation and sun position changes, night side city lights texture with smooth fade transitions, weather zone system with cloud clusters/rain particles/storm visuals per region, bird activity variation where day birds are active in daytime and nocturnal birds appear at night, time-of-day indicator in HUD.
>
> **v25 changelog**: Exploration Experience — added Bird Expedition Mode with structured mission system ("Find 3 birds in Africa", "Discover a bird that migrates"), mission panel with active/completed states, achievement badge rewards on mission completion, progress tracker showing expedition completion percentage, completion celebration with confetti and badge reveal, expedition history in explorer profile, new ExpeditionSystem.ts managing mission lifecycle, MissionPanel.tsx and ProgressPanel.tsx UI components, integration with existing discovery and achievement systems.
>
> **v24 changelog**: Visual Polish — added atmosphere glow shell around Earth with animated Fresnel shader, cloud layer with slow rotation and soft opacity, directional sun light with shadow casting, soft shadow projection for bird markers on globe surface, improved marker visuals with animated glow rings and rarity-based colors, subtle camera inertia with damping for smooth exploration feel, enhanced lighting setup with hemisphere + directional + ambient lights.
>
> **v23 changelog**: Performance Optimization — implemented model LOD system (high-poly near camera, simplified mesh when far), lazy loading for bird models loaded on-demand when entering view, instanced markers using THREE.InstancedMesh for distant birds reducing draw calls, render loop optimization avoiding blocking operations, target 60 FPS on mid-range laptop verified.
>
> **v22 changelog**: Content Expansion — expanded bird database to 30 fully-detailed birds across all 7 regions (North America, South America, Africa, Europe, Asia, Oceania, Antarctica), each bird includes name/continent/habitat/diet/wingspan/funFact/modelPath/soundPath, added region cluster markers on globe showing bird count per region, region clusters clickable to filter birds by region.
>
> **v21 changelog**: Architecture Refactor — restructured monolithic codebase into modular architecture with /src/core/ (Engine.ts, SceneManager.ts, CameraController.ts), /src/systems/ (BirdSystem.ts, MigrationSystem.ts, QuizSystem.ts, AudioSystem.ts, AchievementSystem.ts), /src/ui/ (HUD.ts, BirdPanel.ts, QuizPanel.ts, ProgressPanel.ts), /src/data/ (birds.json, migrations.json, achievements.json), separated data from logic, created clear module boundaries for easier bird additions and feature development.
>
> **v20 changelog**: Asset Quality & Exploration Upgrade — rebuilt build-bird-assets.mjs with significantly improved bird geometry (more anatomically accurate silhouettes with species-specific features, better wing shapes, proper body proportions, and enhanced detail for all 12 bird types), improved BirdMarker rendering to use full GLB scene clones with original materials instead of extracting only the first mesh geometry (preserving multi-mesh models and embedded materials), enhanced bird idle animation with dual-layer system (gentle wing flap via Y-scale sine wave + smooth vertical floating via normal-direction offset, both with per-bird phase offsets for natural variety), improved marker hover/click feedback with enhanced glow pulse and scale animations, strengthened UI layer structure with explicit z-index CSS custom properties and spacing tokens (xs=6px, sm=10px, md=16px, lg=24px), improved globe visuals with higher-resolution sphere geometry (80 segments), enhanced cloud layer opacity and rotation, improved atmosphere shell with refined Fresnel shaders for softer glow, improved camera fly-to with 1s smoothstep animation and gentle orbit after arrival, enhanced discovery notification with discovery counter and celebration animations, improved BirdInfoCard with 200px left margin on desktop to prevent sidebar overlap, added model preloading for all 12 bird GLB assets, maintained Draco compression support for GLB loading.
>
> **v19 changelog**: High-Quality Bird Models Upgrade — removed ALL procedurally generated bird geometry (scripts/generate-bird-models.mjs and its outputs), established proper asset pipeline with /public/models/birds/ for external GLB bird models, integrated high-quality stylized low-poly bird starter set (eagle, owl, parrot, penguin, flamingo, duck, sparrow, crow, toucan, peacock, woodpecker, seagull) loaded exclusively from GLB files via useGLTF with Draco compression support, standardized model scale normalization (1-unit bounding box with auto-scaling on load), added idle bird animation system (subtle wing flap + vertical sine-wave floating with 3–5s loop), improved bird markers with glowing ring base and soft hover glow, enhanced bird discovery interaction with "You discovered a new bird!" feedback and X/Total progress tracking, fixed UI layering with strict z-index hierarchy (globe 0, markers 5, sidebar 20, bottom panel 30, info card 60, modal 100), added safe layout margins (info card left: 200px on desktop), improved camera fly-to experience (~1s smooth animation stopping above bird marker), enabled DRACOLoader for compressed GLB loading, added visual polish with subtle floating sine-wave motion on all bird models.
>
> **v18 changelog**: Stability & Core Experience — fixed critical UI overlap where sidebar buttons covered bird info cards by enforcing strict z-index hierarchy (sidebar z-20, info card z-60) and adding sidebar collision avoidance (opacity reduction when card opens), replaced unrealistic procedural 3D bird geometry with stylized low-poly bird model featuring proper wings/tail/beak silhouette and slow wing-flap animation, improved bird marker visuals with glowing base circle and bird icon, enhanced bird info card with section titles (Habitat, Lifespan, Wingspan) and safe left margin (200px) to prevent sidebar collision, improved camera fly-to experience with ~1s smooth animation, added discovery glow pulse on bird click, added discovery counter display, reduced sidebar button width for cleaner layout, enforced consistent spacing tokens (xs=6px, sm=10px, md=16px, lg=24px) across all UI, ensured all panels respect safe margins and never overlap.
>
> **v17 changelog**: Game-Like Exploration Polish — enhanced daily mission panel with continent progress mini-bars and animated completion badges, bird photo mode upgraded with full-screen photo overlay including zoom slider and rotation controls, bird encyclopedia improved with continent section grouping and search filter, explorer achievement system enhanced with progress bars showing requirement completion percentage, discovery celebration upgraded with layered confetti + sparkle + glow pulse animation lasting 2.5s, bottom discovery panel now shows continent-level progress bars with color-coded regions, bird hint system improved with proximity-based pulse intensity and undiscovered bird flutter animation, exploration encouragement messages now rotate through suggestions, performance verified with all v17 features active at 60 FPS.
>
> **v16 changelog**: Game-Like Exploration Upgrade — daily bird discovery mission system with progress tracking and celebration animations, bird photo mode with camera freeze / zoom / rotate and local photo gallery, enhanced bird encyclopedia with discovered/locked entries and progress indicator, explorer achievement system with badges (First Discovery, Explorer, World Traveler, Bird Listener), improved discovery celebration with confetti burst and sparkle particles, continent exploration progress with hint animations and exploration encouragement messages, performance optimization with lazy loading for photos/models/sounds and 15-model limit enforcement.
>
> **v15 changelog**: Immersive Experience Upgrade — real-time day-night Earth rendering with dynamic sun-position lighting (bright day side, dark night side with city lights texture), atmospheric glow ring, cloud layer visible in both day and night, enhanced bird migration route visualization with Whooping Crane route added and glowing animated arcs with particle dots, AI bird narration system using Web Speech API (text-to-speech) with "Tell me about this bird" button and friendly child-oriented narration content, improved bird discovery experience with star-particle celebration animation and continent-level discovery progress UI, enhanced educational bird info card with scientific name / habitat / wingspan / lifespan / fun fact sections and wingspan comparison bar, improved camera fly-to experience with gentle orbit after arrival, performance optimization with 15-model limit fallback to icon markers and lazy loading for models/audio/textures and KTX2 compressed texture support.
>
> **v14 changelog**: Visual & Interaction Upgrade — glassmorphism design system (semi-transparent backgrounds, backdrop blur 20px, soft shadows, rounded corners), modern pill-shaped buttons with hover glow and scale effects, improved globe rendering (enhanced atmosphere glow, better cloud layer, rim lighting, higher-quality Fresnel shader), bird hover interactions (scale animation, soft glow, floating motion, styled tooltip), particle bird silhouettes flying around the globe, improved camera animation system (ease-in-out transitions, 1.2s duration), bottom discovery panel with progress bar, responsive panel layout improvements, rendering performance optimizations (lazy loading, compressed textures, model limits).
>
> **v13 changelog**: Global UI Layer System — unified z-index hierarchy (7 layers from canvas z-0 to overlay z-100), refactored App root into layered container architecture (GlobeLayer → MarkerLayer → SidebarLayer → BottomPanelLayer → CardLayer → ModalLayer → OverlayLayer), panel collision avoidance system (only one panel type active at a time), bird info card repositioned to right side to prevent overlap with bottom panels, responsive layout rules (desktop: sidebar+bottom+right card, tablet: collapsed sidebar+center modal, mobile: full-screen sheets), safe area padding (20px all sides), modal priority system with semi-transparent overlay blocking lower layers, smooth panel animations (slide-up 250ms for bottom, slide-right 250ms for side, scale-fade 250ms for modal).
>
> **v12 changelog**: Full-scope expansion — dataset expanded to 50+ birds with comprehensive global coverage, migration visualization with animated arc lines and moving dots for Arctic Tern / Bar-tailed Godwit / Swallow routes, bird distribution heatmap layer with blue-green-red density visualization and toggle button, AR bird viewing mode via WebXR with camera overlay and 3D model placement, enhanced bird animations (wing flap, hop, look-toward-camera, circle flight), performance optimization with model lazy loading (max 15 simultaneous 3D models), KTX2 texture compression, educational wingspan visualization bar, fun fact section redesign. All UI layout issues resolved with strict flex-column card structure, spacing tokens, tag wrapping, sidebar alignment, and glass-morphism design.
>
> **v11 changelog**: Full-scope upgrade — UI layout overhaul (strict flex-column card structure, zero-overlap enforcement, spacing tokens, tag row wrapping, sidebar button alignment, card scroll), 3D bird model system with GLTFLoader and LOD switching, bird dataset expansion to 40+ species across all continents, bird sound playback feature with xeno-canto integration and lazy-loaded audio, bird discovery and collection system with "New bird discovered!" notification, exploration progress system with continent-level tracking and progress bars, bird animation interactions (wing flap, lift, rotate-to-camera on click), performance optimizations (model lazy loading, visibility culling, texture compression, max 15 simultaneous 3D models), child-friendly design polish (glass-morphism cards, habitat/continent/lifespan tag colors, wingspan visualization bar, typography hierarchy).
>
> **v10 changelog**: Major upgrade — UI layout overhaul (strict flex-column card structure, spacing tokens, tag row wrapping, sidebar button alignment, card scroll), 3D bird model system with GLTFLoader and LOD (level-of-detail) switching, bird dataset expansion to 30+ species across all continents, bird sound playback feature with xeno-canto integration, performance optimizations (model lazy loading, visibility culling, texture compression), child-friendly design polish (glass-morphism cards, habitat/continent/lifespan tag colors, wingspan visualization bar).
>
> **v9 changelog**: Educational exploration expansion — migration mode with animated arcs, guided discovery tour, AI bird guide character, enhanced learning quiz, bird rarity system, bird radar, story-based themed exploration sets. New data fields: `rarity`, `migration_path`, `storyTheme`. New components: `MigrationModePanel`, `GuidedTour`, `BirdGuide`, `BirdRadar`, `StoryExplorer`.
>
> **v8 changelog**: Core interactive learning features — bird information card redesign as center-bottom modal, animated birds replacing static markers, bird collection system with localStorage, region filter with camera zoom, kid quest system with missions/badges, globe visual improvements (atmosphere glow, cloud layer, lighting), bird data model refactor with `latin_name`, `habitat`, `fun_fact`, `image`, `audio`, `migration_path`. Complete UI system overhaul — ActionButton component, right control panel, mobile safe areas, responsive layout, z-index hierarchy, bird tooltip, loading UI with progress, National Geographic Kids visual style.

## Goal

Build an interactive 3D globe web application that teaches children (ages 6–12) about birds around the world. The experience should feel like an **interactive science discovery game for kids** — similar to Google Earth + Natural History Museum + Discovery Game. Users spin a realistic globe, discover animated 3D birds flying around their regions, collect birds into a personal album, complete quests, take guided tours, listen to bird calls, view migration routes, explore bird diversity heatmaps, and even view birds in AR. The UI must be kid-friendly with rounded corners, playful colors, large icons, and readable fonts. Zero UI overlap, consistent layout, glass-morphism card design, and smooth 3D interaction are mandatory.

## User Stories

### US-1: Explore the Globe

As a child, I can drag to rotate and scroll to zoom a 3D Earth so that I feel like I'm exploring the real world.

### US-2: Discover Animated Birds

As a child, I can see animated 3D birds slowly flying around their regions on the globe, making the world feel alive.

### US-3: Learn About a Bird

As a child, I can click a bird to open an information card showing the bird's name, image, region, habitat, fun fact, sound playback button, and a collect button.

### US-4: Hear Bird Calls

As a child, I can play bird sounds from the info card to connect each bird to its call via a dedicated "Listen" button.

### US-5: Collect Birds

As a child, I can collect discovered birds into "My Birds" album that persists between sessions.

### US-6: Filter by Region

As a child, I can filter birds by continent/region, with the camera smoothly zooming to that region.

### US-7: Complete Quests

As a child, I can complete discovery missions like "Find 3 birds in Africa" to earn points and badges.

### US-8: Watch Migration Paths

As a child, I can enter migration mode to see animated arcs showing how birds travel across the globe, with glowing arc lines and moving dots along the path.

### US-9: Take a Guided Tour

As a child, I can start an automated tour that visits different regions and highlights special birds.

### US-10: Get Help from Bird Guide

As a child, I see a friendly AI guide character that gives me fun facts and learning prompts.

### US-11: Take Quizzes

As a child, I can answer quiz questions about birds with immediate feedback.

### US-12: Discover Rare Birds

As a child, I can find common, rare, and legendary birds — rare ones appear less frequently.

### US-13: Use Bird Radar

As a child, I can see a radar showing nearby birds in my current view.

### US-14: Explore Themed Stories

As a child, I can explore themed bird sets like "Rainforest Birds" or "Arctic Birds" and earn badges.

### US-15: See Bird Tooltips

As a child, when I hover over a bird I see its name and region as a tooltip.

### US-16: Switch Languages

As a user, I can toggle between Chinese and English.

### US-17: Navigate Intuitively

As a parent, I can hand the app to my child without explanation because the interface is self-evident.

### US-18: See 3D Bird Models

As a child, I see realistic 3D bird models on the globe that have idle animations and gentle floating motion.

### US-19: Listen to Bird Sounds

As a child, I can press a "Listen" button on the bird card to hear the bird's real call sound.

### US-20: Explore Many Birds (v12)

As a child, I can discover 50+ birds from every continent including South America, North America, Africa, Asia, Oceania, Europe, and polar regions.

### US-21: Discover New Birds

As a child, when I click a bird for the first time, I see a "New bird discovered!" celebration message and the bird is marked as discovered.

### US-22: Track Discovery Progress

As a child, I can see my global bird discovery progress (e.g. "12/50 Birds Found") and continent-level progress bars.

### US-23: View Bird Collection

As a child, I can open a collection screen showing all discovered birds and locked birds not yet discovered, motivating me to explore more.

### US-24: See Bird Click Animations (v12 enhanced)

As a child, when I click a bird marker, it plays a short animation — wings flap, bird hops, looks toward camera, and does a short circle flight.

### US-25: View Migration Routes (v12)

As a child, I can see animated migration routes for migratory birds like Arctic Tern, Bar-tailed Godwit, and Swallow, displayed as glowing arc lines with moving dots.

### US-26: View Bird Diversity Heatmap (v12)

As a child, I can toggle a "Bird Diversity Map" to see a heatmap overlay showing where birds are most concentrated, with blue (few) to red (many) colors.

### US-27: View Birds in AR (v12)

As a child, I can click "View in AR" to open my device camera and place a 3D bird model in my real environment, rotating and zooming it.

### US-28: Compare Wingspans (v12)

As a child, I can see a visual bar comparing different birds' wingspan sizes in the info card.

### US-29: See Day and Night on Earth (v15)

As a child, I can see the globe with realistic day and night regions based on the sun's position, with city lights glowing on the dark side, making the Earth feel alive.

### US-30: Hear Bird Narration (v15)

As a child, I can press "Tell me about this bird" to hear a friendly spoken narration about the bird, including where it lives, what it eats, and a fun fact.

### US-31: See Discovery Celebration (v15)

As a child, when I discover a new bird, I see a celebration animation with star particles and a "New Bird Discovered" message, making exploration feel rewarding.

### US-32: Track Continent Progress (v15)

As a child, I can see how many birds I've discovered on each continent with visual progress indicators like "Asia: 4/10 birds discovered".

### US-33: See Enhanced Bird Info (v15)

As a child, I can see detailed bird information including scientific name, habitat, wingspan comparison, lifespan, and fun facts in a beautifully designed card.

### US-34: Experience Smooth Camera Flight (v15)

As a child, when I click a bird, the camera smoothly flies to it in about 1.2 seconds and then gently orbits so I can see the bird clearly.

### US-35: Complete Daily Missions (v16)

As a child, I can see a set of daily discovery missions like "Find a bird in South America" or "Discover 2 new birds today", track my progress, and see a celebration animation when I complete a mission.

### US-36: Take Bird Photos (v16)

As a child, I can take a photo of a bird I discover by freezing the camera, zooming and rotating, then capturing the image to save in my photo gallery.

### US-37: Browse Bird Encyclopedia (v16)

As a child, I can open a bird encyclopedia that shows all birds with discovered entries unlocked and undiscovered entries locked, along with a progress indicator showing how many I've found.

### US-38: Earn Explorer Achievements (v16)

As a child, I can earn achievement badges like "First Discovery", "Explorer", "World Traveler", and "Bird Listener" that appear in my explorer profile panel.

### US-39: See Discovery Celebrations (v16)

As a child, when I discover a new bird I see a celebration with sparkle particles, confetti burst, and a "New Bird Discovered" message that makes exploration feel rewarding.

### US-40: Track Continent Progress (v16)

As a child, I can see my exploration progress for each continent and receive encouragement messages like "Try exploring South America. Many colorful birds live there."

### US-41: See Bird Hints (v16)

As a child, when I rotate the globe near a bird location, I see subtle hint animations like a marker pulse or small bird icon flutter that guide me to undiscovered birds.

### US-42: See Mission Continent Progress (v17)

As a child, I can see mini continent progress bars inside the daily missions panel, showing how close I am to completing region-specific missions.

### US-43: Use Photo Mode Overlay (v17)

As a child, when I enter photo mode I see a full-screen overlay with zoom slider and rotation controls so I can frame the bird perfectly before capturing.

### US-44: Search Bird Encyclopedia (v17)

As a child, I can search for birds by name in the encyclopedia and see them grouped by continent for easier browsing.

### US-45: See Achievement Progress (v17)

As a child, I can see progress bars on each achievement showing how close I am to unlocking it, motivating me to keep exploring.

### US-46: See Continent Progress Bars (v17)

As a child, I can see color-coded continent progress bars in the bottom discovery panel showing my exploration progress for each region.

### US-47: Get Rotating Exploration Tips (v17)

As a child, I see rotating exploration tip messages that suggest different continents and activities to keep me engaged.

## Requirements

### R-1: 3D Globe (React Three Fiber)

- Render a textured Earth sphere using NASA Blue Marble texture, radius `1.0`.
- Cloud layer at radius ~1.005.
- Atmosphere glow: Fresnel shell at scale 1.025, BackSide rendering, smooth falloff.
- Enhanced lighting with hemisphere light for natural illumination.
- Country borders via simplified GeoJSON.
- Zoom-dependent map labels (continent/ocean names).
- Dark parallax starfield background.
- Orbit controls with smooth damping.
- Responsive — fills viewport on desktop and mobile.

### R-2: Bird Data Model (v12 expanded)

- Each bird entry follows the enhanced data model:

```json
{
  "id": "",
  "nameZh": "",
  "pinyin": "",
  "nameEn": "",
  "scientificName": "",
  "lat": 0,
  "lng": 0,
  "region": "",
  "funFactZh": "",
  "funFactEn": "",
  "photoUrl": "",
  "xenoCantoQuery": "",
  "silhouette": "",
  "sizeCategory": "",
  "habitatType": "",
  "diet": "",
  "wingspan": "",
  "lifespan": "",
  "evolutionEra": "",
  "dietType": "",
  "wingspanCm": 0,
  "rarity": "common",
  "storyTheme": "",
  "soundUrl": "",
  "migration": false,
  "model": ""
}
```

- 50+ bird entries covering all major continents.
- Rarity field: `"common"`, `"rare"`, `"legendary"`.
- Story theme field for themed exploration sets.
- `soundUrl` field for direct audio playback.
- `migration` field indicating if bird is migratory.
- `model` field for custom 3D model path.

### R-3: Animated Bird Markers (v12 — enhanced animations)

- Use GLTFLoader to load 3D bird models in glTF/GLB format.
- Birds display small idle animation (wing flap) and slow floating motion with gentle rotation.
- Model scale: 0.2–0.3 relative to marker size.
- LOD system: show simple icon marker when camera is far, load 3D model when camera zooms closer.
- Clicking a bird temporarily pauses its movement.
- Hover shows tooltip with bird name and region.
- Click animation sequence: wing flap → short hop → look toward camera → short circle flight.
- Animations should feel playful and child-friendly.

### R-4: Bird Information Card (v12 design)

- Strict flex-column layout with no absolute positioning inside the card.
- Structure: ImageHeader → TitleSection → FunFact → TagRow → InfoGrid → ActionButtons.
- Spacing tokens: xs=6px, sm=10px, md=16px, lg=24px, xl=32px.
- Tag row: `display: flex; flex-wrap: wrap; gap: 8px;` — tags wrap instead of overflowing.
- Card: `max-height: 80vh; overflow-y: auto;` — content scrolls, never overflows.
- Glass-morphism: `border-radius: 20px; soft shadow; semi-transparent background; backdrop-filter: blur`.
- Tag colors: continent=blue, habitat=green, lifespan=orange.
- Typography hierarchy: bird Chinese name large bold, English name medium, pinyin small subtle.
- Bird sound playback button with "Listen" label.
- "Collect Bird" button with sparkle animation.
- Close button and click-outside-to-dismiss.
- Springy slide-up animation.
- Must not overlap with sidebar or right control panel.
- Fun Fact section: short and exciting with "Did you know?" prompt.
- Wingspan visualization bar comparing sizes.

### R-5: Bird Collection System (v12 enhanced)

- Clicking "Collect" saves bird to localStorage.
- "My Birds" panel shows collected birds with image and name.
- Works like a bird discovery album.
- Persists across browser sessions.
- Visual feedback on collection (sparkle animation).
- First-time discovery shows "New bird discovered!" notification.
- Collection screen shows discovered birds and locked/undiscovered birds.
- Progress display: "12 / 50 birds discovered".

### R-6: Region Filter

- Filter controls for: All Birds, North America, South America, Europe, Africa, Asia, Oceania, Antarctica.
- When selected: camera smoothly zooms to region center.
- Only birds in that region appear (others fade out).
- Region filter UI in the right control panel.

### R-7: Kid Quest System

- Simple discovery missions.
- Example quests: "Find 3 birds in Africa", "Discover a bird in Antarctica", "Collect 5 birds".
- Completing quests awards points and small badges.
- Quest progress persisted in localStorage.
- Quest panel accessible from right control panel.

### R-8: Globe Visual Improvements

- Enhanced atmosphere glow effect.
- Subtle lighting improvements.
- Smoother camera transitions.
- Optional cloud layer toggle.

### R-9: Migration Visualization (v12 enhanced)

- Toggle migration exploration mode.
- Visualize migration paths as animated curved arc lines on the globe.
- Glowing arc line with moving dot along the path.
- Example migration birds: Arctic Tern (Arctic to Antarctic), Bar-tailed Godwit (Alaska to New Zealand), Barn Swallow (Europe to Africa).
- Each route has distinct color.
- Flying bird icon animates along the path.

### R-10: Guided Discovery Tour

- Automated tour mode.
- Camera automatically visits: Amazon Rainforest, African Savanna, Antarctica, etc.
- During tour, show bird highlights with info cards.
- "Welcome explorer!" introduction.
- Pause/resume/skip controls.

### R-11: AI Bird Guide

- Simple guide character (owl or parrot avatar).
- Provides short explanations, fun facts, learning prompts.
- Appears contextually when exploring.
- Keep explanations short and child-friendly.
- Positioned bottom-left, does not overlap other UI.

### R-12: Learning Quiz Mode

- Quiz questions: "Where does this bird live?" with multiple choice.
- Immediate feedback (correct/wrong).
- Confetti on correct, shake on wrong.
- Score tracking per session.

### R-13: Bird Rarity System

- Rarity classification: Common, Rare, Legendary.
- Rare birds have subtle glow effect.
- Legendary birds have special particle effect.
- Rarity badge shown in info card and collection.

### R-14: Bird Radar

- Small radar UI showing nearby birds in current camera view.
- Circular radar display in corner.
- Dots represent birds, pulsing when close to center of view.

### R-15: Story-Based Exploration

- Themed discovery sets: Rainforest Birds, Arctic Birds, Desert Birds, Ocean Birds.
- Each theme has a set of birds to discover.
- Completing a theme unlocks a badge.
- Progress tracked in localStorage.

### R-16: Audio Playback (v12 enhanced)

- Bird sound playback via xeno-canto API or direct `soundUrl`.
- Dedicated "Listen" button with speaker icon on bird info card.
- Play/pause control with visual feedback (animated bars).
- Audio files lazy-loaded and compressed.
- Graceful fallback if API unavailable.

### R-17: Bilingual UI

- All user-facing text has Chinese and English variants.
- Language toggle switches between `zh` and `en`.
- Default language: Chinese.

### R-18: Camera System

- Smooth zoom-to-bird on click.
- OrbitControls target always [0,0,0].
- Auto-rotation when idle (>5s).
- Region zoom for filter feature.
- Minimum camera distance 1.15.

### R-19: UI System (v13 CRITICAL — Global UI Layer System)

#### UI Layer Architecture

- All UI components organized into strict layer hierarchy.
- Layer 0: 3D Globe Canvas (z-index: 0)
- Layer 1: Map markers (z-index: 5)
- Layer 2: Left sidebar controls (z-index: 20)
- Layer 3: Bottom panels (z-index: 40)
- Layer 4: Information cards (z-index: 60)
- Layer 5: Modal dialogs (z-index: 80)
- Layer 6: Full screen overlays (z-index: 100)
- No component may randomly assign z-index outside this hierarchy.

#### UI Root Structure

- AppRoot contains layered containers:
  - GlobeLayer (Three.js canvas, z-0)
  - UILayer (all floating UI):
    - SidebarLayer (left controls, z-20)
    - BottomPanelLayer (bottom panels, z-40)
    - CardLayer (info cards, z-60)
    - ModalLayer (modal dialogs, z-80)
    - OverlayLayer (full-screen overlays, z-100)
- All floating UI must live inside UILayer, never attached directly to globe container.

#### Sidebar Buttons

- All sidebar buttons must have identical width and height.
- Vertically aligned, never overlap the globe.
- Position: `fixed; left: 20px; top: 120px;`
- Layout: `display: flex; flex-direction: column; gap: 16px;`
- Z-index: 20 (sidebar layer).

#### Right Control Panel

- All action buttons in a single container.
- Position: fixed, right: 20px, bottom: 20px.
- Flex column, gap: 8px, align-items: flex-end.
- Buttons: Discover, Birds, Regions, Migration, Heatmap, Quests, Tour, Reset.
- Z-index: 20 (sidebar layer).
- No other UI may overlap this panel.

#### Card Layout Structure

- BirdCard → ImageHeader → TitleSection → FunFact → TagRow → InfoGrid → ActionButtons.
- No absolute positioning inside the card.
- Use flex column layout.
- Consistent spacing between sections using tokens: xs=6px, sm=10px, md=16px, lg=24px, xl=32px.

#### Tag Row

- `display: flex; flex-wrap: wrap; gap: 8px;`
- Tags wrap instead of overflowing.

#### Card Scroll

- `max-height: 80vh; overflow-y: auto;`
- Content never overflows the container.

#### Glass-morphism Card Style

- `border-radius: 20px;`
- Soft shadow.
- Semi-transparent glass background with backdrop blur.

#### Tag Color Rules

- Continent tags = blue.
- Habitat tags = green.
- Lifespan tags = orange.

#### Safe Area Rules (v13)

- Every floating panel must respect screen safe area.
- Top safe area: 20px padding.
- Left safe area: 20px padding.
- Right safe area: 20px padding.
- Bottom safe area: 20px padding.
- Plus device safe-area-inset values where applicable.

#### Responsive Layout (v13)

- Desktop (>= 1024px): Left sidebar + Bottom discovery panel + Right info card.
- Tablet (768px–1023px): Sidebar collapses, info card becomes center modal.
- Mobile (< 768px): Panels become full-screen sheets.

#### Panel Collision Avoidance (v13)

- Only one panel type can be active at a time.
- Bird card open → hide discovery panel.
- Modal open → hide all panels.
- Settings open → hide bird card.
- Managed via `activePanel` state in store.

#### Modal Priority (v13)

- Modal dialogs always appear above all panels.
- Modals block interaction with lower layers.
- Semi-transparent overlay backdrop.
- Overlay z-index: 80, Modal content z-index: 80.

#### Panel Animation Rules (v13)

- Bottom panel: slide up, 250ms ease-out.
- Side panel: slide from right, 250ms ease-out.
- Modal: scale fade, 250ms ease-out.
- All animations use CSS transitions or keyframes.

### R-27: Glass UI Design System (v14)

- Glassmorphism applied to all floating UI panels.
- Glass card properties: `background: rgba(255,255,255,0.2)`, `backdrop-filter: blur(20px)`, `border-radius: 20px`, soft shadow.
- Applied to: bird info card, discovery panel, floating buttons, progress bar.
- CSS utility classes for glass variants (light, dark, accent).

### R-28: Modern Button Design (v14)

- Rounded pill shape (`border-radius: 9999px`).
- Subtle shadow with hover glow effect.
- Hover: `scale(1.05)`, increased shadow, subtle glow.
- Active: `scale(0.97)` press feedback.
- Consistent across all ActionButtons.

### R-29: Globe Visual Improvements (v14)

- Enhanced atmosphere glow with two-layer Fresnel (inner warm, outer cool).
- Improved cloud layer with higher opacity and better blending.
- Three-light setup: ambient, directional sunlight, subtle rim light.
- Atmospheric glow ring around Earth visible from all angles.

### R-30: Bird Hover Interaction (v14)

- Hover over bird marker triggers: scale slightly larger, soft glow, small floating animation.
- Display styled tooltip showing bird name and region.
- Tooltip: glass-style background, rounded corners, smooth fade-in.

### R-31: Particle Bird Effects (v14)

- Subtle bird silhouette particles flying around the globe.
- Very low density (~8-12 particles), slow movement, small size.
- Creates ambient sense of life around the globe.
- Particles rendered as simple bird shapes using Points or small meshes.

### R-32: Camera Animation System (v14)

- Smooth fly-to animation when bird is clicked.
- Ease-in-out timing function.
- Duration ~1.2 seconds.
- Camera stops at comfortable viewing distance.
- Smooth deceleration at end of animation.

### R-33: Bottom Discovery Panel (v14)

- Bottom-center panel showing recently discovered birds and exploration progress.
- Displays "Birds discovered: X / Y" with progress bar.
- Glass UI styling consistent with design system.
- Slide-up animation on open.

### R-20: Performance (v12 enhanced)

- Model lazy loading: only load bird models when they enter the visible region.
- Limit simultaneously visible 3D models to 15; fallback to icon markers for others.
- Use KTX2 texture compression where possible.
- Minimize draw calls.
- Keep bird animations lightweight.
- Ensure smooth globe rotation.
- Target ~60 FPS on mid-range laptop.
- Compressed textures preferred.

### R-21: Bird Discovery System

- First-time bird click triggers "New bird discovered!" notification with celebration animation.
- Discovery state stored in localStorage separately from collection.
- Discovery count displayed in UI: "12 / 50 birds discovered".
- Continent-level discovery progress: "Asia: 3/8 birds discovered".

### R-22: Exploration Progress System

- Global progress bar: "Bird Discovery Progress — 12/50 Birds Found".
- Continent progress breakdown with individual progress bars.
- Progress indicator visible in HUD layer.
- Updates in real-time as birds are discovered.

### R-23: Bird Click Animation (v12 enhanced)

- On click: bird flaps wings rapidly for 0.5s.
- Bird lifts slightly into the air (0.02 units along surface normal).
- Bird rotates to face the camera direction.
- Short hop animation.
- Brief circle flight around position.
- Animation is short, playful, and does not block interaction.

### R-24: Bird Distribution Heatmap (v12 new)

- Heatmap layer visualizing bird population density on the globe.
- Colors: blue = few birds, green = moderate, red = high diversity.
- Toggle button: "Bird Diversity Map".
- Heatmap generated from bird coordinates with Gaussian spread.
- Semi-transparent overlay that doesn't obscure the globe.

### R-25: AR Bird Viewing Mode (v12 new)

- Optional AR viewing mode for supported devices.
- Click "View in AR" button on bird info card.
- Opens device camera with 3D bird model overlay.
- Children can rotate and zoom the bird model.
- Uses WebXR API or simple camera overlay fallback.
- Graceful degradation on unsupported devices.

### R-26: Educational Features (v12 enhanced)

- Fun Fact section: short, exciting, child-friendly.
- Example: "Did you know? Andean Condors can glide for hours without flapping their wings."
- Wingspan visualization bar comparing bird sizes.
- Visual comparison to child's arm span.

## Extended Data Model (v12)

### Bird type additions:

```typescript
interface Bird {
  // ... existing fields ...
  rarity?: "common" | "rare" | "legendary";
  storyTheme?: string;
  migration_path?: [number, number][];
  soundUrl?: string;
  migration?: boolean;
  model?: string;
}
```

### Habitat types expanded:

```typescript
type HabitatType =
  | "rainforest"
  | "wetlands"
  | "coast"
  | "grassland"
  | "forest"
  | "polar"
  | "mountains"
  | "desert"
  | "ocean"
  | "tundra";
```

### New types:

```typescript
interface Quest {
  id: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  type: "find_region" | "collect_count" | "discover_bird";
  target: string | number;
  reward: number;
  badge?: string;
}

interface CollectedBird {
  birdId: string;
  collectedAt: number;
}

interface StoryTheme {
  id: string;
  titleZh: string;
  titleEn: string;
  birdIds: string[];
  badge: string;
}

type Rarity = "common" | "rare" | "legendary";
```

### New types (v16):

```typescript
interface DailyMission {
  id: string;
  type: "find_region" | "discover_count" | "listen_sounds" | "explore_region";
  titleZh: string;
  titleEn: string;
  target: string | number;
  current: number;
  completed: boolean;
  badge: string;
}

interface BirdPhoto {
  id: string;
  birdId: string;
  dataUrl: string;
  capturedAt: number;
}

interface Achievement {
  id: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  icon: string;
  requirement: number;
  type: "discover" | "continent" | "listen" | "photo" | "mission";
  unlocked: boolean;
  unlockedAt?: number;
}
```

### R-34: Real-Time Day-Night Earth (v15)

- Dynamic lighting system simulating day and night on the globe.
- Directional light representing the sun, slowly rotating to simulate Earth rotation.
- Day side: bright, fully lit by directional light.
- Night side: dark with city lights texture visible (emissive map on night hemisphere).
- Earth rendering layers: base Earth texture, night city lights (emissive), cloud layer, atmosphere glow.
- Atmosphere: soft blue glow ring around the planet using slightly transparent sphere with additive blending.
- Sun rotation speed: very slow (~0.02 radians per second) for gentle day-night cycle.
- City lights fade in/out based on sun angle per fragment.

### R-35: Enhanced Bird Migration Route Visualization (v15)

- Migration routes displayed as curved glowing arcs connecting regions.
- Moving particle/dot traveling along each path with smooth animation.
- Toggle button "Migration Routes" to show/hide all migration paths.
- Whooping Crane migration route added (North America).
- Animation speed slow and smooth.
- Each route has distinct color for visual clarity.
- Arc lines glow with emissive shader effect.

### R-36: AI Bird Narration System (v15)

- "Tell me about this bird" button on bird info card.
- Narration content: friendly, short, child-oriented.
- Example: "This is the Scarlet Macaw. It lives in the rainforests of South America. Its bright feathers help it communicate with other birds. Scarlet Macaws can live for more than fifty years."
- Audio: use browser Web Speech API (SpeechSynthesis) as primary.
- Voice: friendly, clear, moderate speed.
- Fallback: display narration text if speech synthesis unavailable.
- Narration auto-generated from bird data fields (name, habitat, fun fact, lifespan, wingspan).

### R-37: Bird Discovery Celebration (v15)

- When a new bird is discovered: show celebration animation with star particles.
- Soft sound effect (optional, CSS animation primary).
- Message: "New Bird Discovered!" with bird name.
- Star particles: small sparkle/burst animation around notification.
- Bird discovery counter: "Birds Found: 14 / 50" displayed in UI.
- Continent discovery progress: "Asia: 4/10 birds discovered", "Africa: 3/8 birds discovered".

### R-38: Enhanced Bird Information Card (v15)

- Sections: Bird name, Scientific name, Habitat, Wingspan, Lifespan, Fun fact.
- Wingspan comparison visualization bar.
- Habitat region indicator: briefly highlight region on globe when card opens.
- Scientific name displayed in italic below common name.
- All sections use consistent spacing tokens.

### R-39: Camera Experience Improvements (v15)

- On bird selection: camera smoothly flies to bird location.
- Animation duration ~1.2 seconds with ease-in-out.
- Camera stops slightly above bird location.
- After arrival: gentle camera orbit (slow auto-rotate around the bird's position).
- Orbit helps user see the bird model clearly from multiple angles.

### R-40: Performance Optimization (v15)

- Limit visible 3D bird models to 15; fallback to icon markers for others.
- Lazy loading for bird models, audio files, high-resolution textures.
- Use compressed textures (KTX2) when possible.
- Day-night shader optimized for mobile (single-pass fragment shader).
- Migration arc geometry cached and reused.
- Narration audio generated on-demand, not preloaded.

### R-41: Daily Bird Mission System (v16)

- Daily mission set generated from predefined mission templates.
- Mission types: find a bird in a specific continent, discover N new birds, listen to N bird sounds, explore birds from a specific region.
- Mission progress tracked in localStorage with daily reset.
- Mission UI displayed in a dedicated panel accessible from the right control panel.
- Mission completion triggers celebration animation with star particles and a "Mission Complete" message.
- Completing missions awards badges stored in localStorage.

### R-42: Bird Photo Mode (v16)

- "Take Photo" button on bird info card.
- Photo mode freezes the current camera view.
- In photo mode: user can zoom and rotate to frame the bird.
- Capture button saves the current view as a base64 image to localStorage.
- Photo gallery panel ("My Bird Photos") accessible from the right control panel.
- Gallery shows saved photos with bird name labels.
- Photos lazy-loaded from localStorage.

### R-43: Bird Encyclopedia Enhancement (v16)

- Encyclopedia shows all birds: discovered birds with full info, undiscovered birds as locked entries.
- Locked entries display bird silhouette or question mark instead of photo.
- Progress indicator: "17 / 50 birds discovered" at the top of the encyclopedia.
- Clicking a discovered bird opens the bird info card.
- Clicking a locked bird shows a hint about the bird's continent.

### R-44: Explorer Achievement System (v16)

- Achievement definitions: First Discovery (discover 1 bird), Explorer (discover 10 birds), World Traveler (discover birds from all continents), Bird Listener (listen to 10 bird sounds), Photographer (take 5 bird photos), Mission Master (complete 5 missions).
- Achievement progress tracked in localStorage.
- Achievement unlock triggers celebration animation.
- Explorer profile panel showing earned badges.
- Badge icons displayed as visual indicators.

### R-45: Discovery Celebration Enhancement (v16)

- Enhanced celebration on new bird discovery: sparkle particles + confetti burst.
- Soft celebration sound effect (CSS animation primary, optional audio).
- "New Bird Discovered!" message with bird name prominently displayed.
- Celebration animation duration ~2s, non-blocking.

### R-46: Exploration Progress Enhancement (v16)

- Global progress: "World Bird Discovery: 17 / 50 birds discovered".
- Continent progress with individual bars: "Asia: 4/10", "Africa: 3/8".
- Exploration encouragement messages when a continent has low discovery rate.
- Example: "Try exploring South America. Many colorful birds live there."

### R-47: Bird Hint System (v16)

- When globe rotates near an undiscovered bird location, show subtle hint animation.
- Hint types: marker pulse animation, small bird icon flutter.
- Hints only appear for undiscovered birds.
- Hints are subtle and do not reveal the exact bird identity.

### R-48: Performance — Photo & Mission Storage (v16)

- Photos stored as compressed base64 in localStorage with size limits.
- Mission progress and achievements use efficient localStorage keys.
- Lazy loading for photo gallery thumbnails.
- Maximum 50 stored photos; oldest auto-removed when limit reached.

### R-49: Enhanced Mission Panel (v17)

- Daily missions panel shows continent mini-progress bars for region missions.
- Completed missions display animated badge with glow effect.
- Mission completion celebration includes confetti particles.
- Panel header shows daily progress ring indicator.

### R-50: Photo Mode Overlay (v17)

- Full-screen photo mode overlay with semi-transparent background.
- Zoom slider control (1x to 3x).
- Rotation controls for framing.
- Capture button with flash animation feedback.
- Exit photo mode button clearly visible.

### R-51: Encyclopedia Search and Grouping (v17)

- Search input at top of encyclopedia panel filters birds by name.
- Birds grouped by continent with collapsible sections.
- Each continent section shows discovery count.
- Smooth scroll to section when continent header tapped.

### R-52: Achievement Progress Bars (v17)

- Each achievement card shows a progress bar indicating completion percentage.
- Progress bar fills based on current count vs requirement.
- Unlocked achievements show full bar with glow effect.
- Locked achievements show current progress value.

### R-53: Continent Progress in Bottom Panel (v17)

- Bottom discovery panel shows compact continent progress bars.
- Each continent has a color-coded mini bar.
- Bars animate on discovery updates.
- Continent names shown as abbreviated labels.

### R-54: Rotating Exploration Tips (v17)

- Exploration encouragement messages rotate every 8 seconds.
- Tips suggest continents, activities (listen, photograph, collect).
- Tips context-aware based on current discovery state.
- Smooth fade transition between tips.

### R-55: Enhanced Bird Hint Animations (v17)

- Undiscovered bird markers pulse with intensity based on camera proximity.
- Closer camera = stronger pulse and flutter.
- Pulse color shifts subtly (warm amber glow).
- Flutter animation uses sine wave with varying amplitude.

### R-56: UI Overlap Fix — Sidebar Collision Avoidance (v18 CRITICAL)

- When bird info card opens, sidebar layer reduces opacity to 0.4 and shifts left by 10px.
- Info card z-index (60) always above sidebar z-index (20).
- Bird info card left margin: 200px on desktop to prevent collision with sidebar.
- Sidebar buttons width: 120px, height: 44px with 10px gap between buttons.
- All UI elements respect strict z-index hierarchy: globe(0) → markers(5) → sidebar(20) → bottom-panel(30) → info-card(60) → modal(100).

### R-57: Improved 3D Bird Model (v18)

- Replace generic GLTF geometry with procedural stylized low-poly bird shape.
- Bird shape: elongated body, swept-back wings, tail fan, pointed beak.
- Slow wing-flap idle animation (gentle sine wave every few seconds).
- Correct bird silhouette recognizable from all angles.
- If external models unavailable, use procedural geometry that looks like a bird.

### R-58: Bird Marker Visual Improvement (v18)

- Markers display a small glowing circle at base position.
- Bird icon/model hovers above the glowing circle.
- Hover effect: scale up to 1.35x with soft glow intensification.
- Undiscovered birds show warm amber pulse.

### R-59: Bird Info Card Section Titles (v18)

- Info card sections have clear titles: Habitat, Lifespan, Wingspan, Fun Fact.
- Card content: bird name, English name, continent, habitat, lifespan, wingspan, fun fact.
- Card never overflows: max-height 80vh, overflow-y auto.
- Left margin 200px on desktop prevents sidebar overlap.

### R-60: Discovery Feedback Improvement (v18)

- Bird click triggers glow pulse animation around marker.
- Discovery notification: "You discovered a new bird!" message.
- Discovery counter visible: "Birds Found: 8 / 50".

### R-61: Camera Experience Improvement (v18)

- Bird click triggers smooth camera fly-to (~1s duration).
- Camera stops slightly above bird location.
- Ease-in-out animation curve.

### R-62: UI Stability — Consistent Spacing (v18)

- Spacing tokens enforced: xs=6px, sm=10px, md=16px, lg=24px.
- All floating panels respect 20px safe area margins.
- Left margin for info cards: 200px to avoid sidebar collision.
- No UI element may overlap another at any viewport size.

## Non-goals

- User accounts or server-side progress tracking.
- Offline support / PWA.
- Server-side rendering.
- CMS or admin panel.
- Deployment pipeline.
- High-resolution GeoJSON.

## Acceptance Criteria

### AC-V18-1: UI Overlap Fix

- [ ] Info card (z-60) always renders above sidebar (z-20).
- [ ] Sidebar reduces opacity when bird info card is open.
- [ ] Bird info card has 200px left margin on desktop.
- [ ] No UI elements overlap at any viewport size.

### AC-V18-2: Improved Bird Model

- [ ] Bird model has recognizable bird silhouette (wings, tail, beak).
- [ ] Slow wing-flap idle animation visible.
- [ ] Model renders correctly at all LOD distances.

### AC-V18-3: Bird Marker Visuals

- [ ] Glowing base circle visible at marker position.
- [ ] Hover triggers scale and glow effect.
- [ ] Undiscovered birds show amber pulse.

### AC-V18-4: Bird Info Card Sections

- [ ] Section titles (Habitat, Lifespan, Wingspan) visible.
- [ ] Card never overflows viewport.
- [ ] Card respects left margin on desktop.

### AC-V18-5: Discovery Feedback

- [ ] Glow pulse on bird click.
- [ ] Discovery counter visible in UI.
- [ ] "New bird discovered" notification works.

### AC-V18-6: Camera Experience

- [ ] Smooth fly-to on bird click (~1s).
- [ ] Camera stops above bird location.
- [ ] Ease-in-out animation.

### AC-V18-7: UI Stability

- [ ] Consistent spacing tokens used.
- [ ] Safe area margins respected.
- [ ] ~60 FPS maintained.

### AC-V17-1: Enhanced Mission Panel

- [ ] Mission panel shows continent mini-progress bars for region missions.
- [ ] Completed missions display animated badge with glow.
- [ ] Panel header shows daily progress summary.

### AC-V17-2: Photo Mode Overlay

- [ ] Photo mode shows full-screen overlay with controls.
- [ ] Zoom slider works (1x-3x).
- [ ] Capture button provides flash feedback.
- [ ] Exit button returns to normal view.

### AC-V17-3: Encyclopedia Search and Grouping

- [ ] Search input filters birds by name.
- [ ] Birds grouped by continent sections.
- [ ] Each section shows continent discovery count.

### AC-V17-4: Achievement Progress Bars

- [ ] Each achievement shows progress bar.
- [ ] Progress percentage displayed.
- [ ] Unlocked achievements show full bar with glow.

### AC-V17-5: Continent Progress in Bottom Panel

- [ ] Bottom panel shows continent mini-bars.
- [ ] Bars are color-coded by continent.
- [ ] Bars animate on discovery.

### AC-V17-6: Rotating Exploration Tips

- [ ] Tips rotate every 8 seconds.
- [ ] Tips are context-aware.
- [ ] Smooth fade transition between tips.

### AC-V17-7: Enhanced Bird Hints

- [ ] Pulse intensity varies with camera proximity.
- [ ] Flutter animation visible on undiscovered birds.

### AC-V17-8: Performance

- [ ] ~60 FPS maintained with all v17 features.
- [ ] Build succeeds with no TypeScript errors.

### AC-V16-1: Daily Bird Mission System

- [ ] Daily missions displayed in a dedicated panel.
- [ ] Mission types include find_region, discover_count, listen_sounds, explore_region.
- [ ] Mission progress updates in real-time.
- [ ] Mission completion triggers celebration animation.
- [ ] Completed missions award badges.
- [ ] Mission progress persisted in localStorage with daily reset.

### AC-V16-2: Bird Photo Mode

- [ ] "Take Photo" button on bird info card.
- [ ] Photo mode freezes camera and allows zoom/rotate.
- [ ] Capture saves image to localStorage.
- [ ] Photo gallery panel shows saved photos with bird names.
- [ ] Photos lazy-loaded in gallery.

### AC-V16-3: Bird Encyclopedia Enhancement

- [ ] Encyclopedia shows discovered birds with full info.
- [ ] Undiscovered birds shown as locked entries.
- [ ] Progress indicator shows "X / Y birds discovered".
- [ ] Clicking discovered bird opens info card.

### AC-V16-4: Explorer Achievement System

- [ ] Achievement definitions for First Discovery, Explorer, World Traveler, Bird Listener, Photographer, Mission Master.
- [ ] Achievement progress tracked and persisted.
- [ ] Achievement unlock triggers celebration.
- [ ] Explorer profile panel shows earned badges.

### AC-V16-5: Discovery Celebration Enhancement

- [ ] Sparkle particles and confetti on new bird discovery.
- [ ] "New Bird Discovered" message with bird name.
- [ ] Celebration animation ~2s, non-blocking.

### AC-V16-6: Exploration Progress Enhancement

- [ ] Global progress displayed.
- [ ] Continent progress with individual bars.
- [ ] Encouragement messages for low-discovery continents.

### AC-V16-7: Bird Hint System

- [ ] Subtle hint animation near undiscovered bird locations.
- [ ] Hints only for undiscovered birds.
- [ ] Hints do not reveal bird identity.

### AC-V16-8: Performance

- [ ] Photo storage with size limits.
- [ ] Max 15 simultaneous 3D models enforced.
- [ ] Lazy loading for photos, models, sounds.
- [ ] ~60 FPS maintained with all v16 features.

### AC-V15-1: Real-Time Day-Night Earth

- [ ] Globe displays bright day side and dark night side.
- [ ] City lights visible on night side.
- [ ] Directional sun light slowly rotates.
- [ ] Atmosphere glow ring visible around planet.
- [ ] Cloud layer renders in both day and night.

### AC-V15-2: Bird Migration Routes

- [ ] Migration arcs display as glowing curved lines.
- [ ] Moving particle dot animates along each path.
- [ ] Toggle button shows/hides migration routes.
- [ ] Whooping Crane route included.
- [ ] Each route has distinct color.

### AC-V15-3: AI Bird Narration

- [ ] "Tell me about this bird" button on info card.
- [ ] Clicking triggers spoken narration via Web Speech API.
- [ ] Narration content is friendly and child-oriented.
- [ ] Fallback text display when speech unavailable.

### AC-V15-4: Bird Discovery Celebration

- [ ] Star particle celebration on new bird discovery.
- [ ] "New Bird Discovered" message displays.
- [ ] Discovery counter shows "Birds Found: X / Y".
- [ ] Continent progress shows per-continent discovery.

### AC-V15-5: Enhanced Bird Info Card

- [ ] Scientific name displayed in italic.
- [ ] Habitat, wingspan, lifespan sections present.
- [ ] Wingspan comparison bar works.
- [ ] Fun fact section styled with "Did you know?" prompt.

### AC-V15-6: Camera Experience

- [ ] Camera fly-to uses ease-in-out over ~1.2s.
- [ ] Camera stops above bird location.
- [ ] Gentle orbit after arrival.

### AC-V15-7: Performance

- [ ] Max 15 simultaneous 3D models enforced.
- [ ] Lazy loading for models and audio.
- [ ] ~60 FPS maintained with all v15 features.

### AC-V14-1: Glass UI Design System

- [ ] Glassmorphism CSS utility classes defined.
- [ ] Bird info card uses glass background with backdrop blur.
- [ ] Discovery panel uses glass styling.
- [ ] Floating buttons use glass design.

### AC-V14-2: Modern Button Design

- [ ] Buttons use rounded pill shape.
- [ ] Hover glow and scale effect works.
- [ ] Active press feedback works.

### AC-V14-3: Globe Visual Improvements

- [ ] Enhanced atmosphere glow visible.
- [ ] Cloud layer renders with improved quality.
- [ ] Rim light adds depth to globe.

### AC-V14-4: Bird Hover Interaction

- [ ] Hover triggers scale and glow animation.
- [ ] Tooltip displays bird name and region.
- [ ] Tooltip has glass-style design.

### AC-V14-5: Particle Bird Effects

- [ ] Bird silhouette particles visible around globe.
- [ ] Low density, slow movement.
- [ ] Particles do not impact performance.

### AC-V14-6: Camera Animation

- [ ] Camera fly-to uses ease-in-out.
- [ ] Animation duration ~1.2s.
- [ ] Smooth deceleration at end.

### AC-V14-7: Bottom Discovery Panel

- [ ] Discovery panel shows progress.
- [ ] Glass UI styling applied.
- [ ] Slide-up animation works.

### AC-V14-8: Performance

- [ ] ~60 FPS maintained with all v14 features.
- [ ] No jank during hover or camera animations.

### AC-V13-1: Global UI Layer System

- [ ] Unified z-index hierarchy with 7 defined layers.
- [ ] All components use layer-appropriate z-index values.
- [ ] No random z-index assignments outside the hierarchy.

### AC-V13-2: UI Root Structure

- [ ] App root refactored into layered container architecture.
- [ ] All floating UI lives inside UILayer containers.
- [ ] GlobeLayer, SidebarLayer, BottomPanelLayer, CardLayer, ModalLayer, OverlayLayer defined.

### AC-V13-3: Panel Collision Avoidance

- [ ] Only one panel type active at a time.
- [ ] Bird card open hides discovery panel.
- [ ] Modal open hides all panels.
- [ ] activePanel state manages panel exclusivity.

### AC-V13-4: Bird Panel Behavior

- [ ] Bird info card opens from right side (desktop) or bottom center (mobile).
- [ ] Bird card and bottom panels never overlap.
- [ ] Left side: navigation. Bottom: discovery panel. Right: bird info card.

### AC-V13-5: Responsive Layout

- [ ] Desktop: sidebar + bottom panel + right card.
- [ ] Tablet: collapsed sidebar, center modal card.
- [ ] Mobile: full-screen sheet panels.

### AC-V13-6: Safe Area Rules

- [ ] 20px padding on all sides for floating panels.
- [ ] Device safe-area-inset respected.

### AC-V13-7: Modal Priority

- [ ] Modals appear above all panels.
- [ ] Semi-transparent overlay blocks lower layers.
- [ ] Overlay and modal use z-index 80+.

### AC-V13-8: Panel Animations

- [ ] Bottom panels slide up (250ms).
- [ ] Side panels slide from right (250ms).
- [ ] Modals scale-fade in (250ms).

### AC-V12-1: Expanded Dataset

- [ ] 50+ birds in birds.json.
- [ ] Birds from South America, North America, Africa, Asia, Oceania, Europe, Polar regions.
- [ ] Each bird has all required fields including soundUrl, migration, model.

### AC-V12-2: Migration Visualization

- [ ] Animated arc lines for migration routes.
- [ ] Moving dot along migration path.
- [ ] Arctic Tern, Bar-tailed Godwit, Swallow routes included.
- [ ] Glowing arc effect.

### AC-V12-3: Bird Distribution Heatmap

- [ ] Heatmap layer toggleable via "Bird Diversity Map" button.
- [ ] Blue-green-red color gradient.
- [ ] Semi-transparent overlay.

### AC-V12-4: AR Bird Viewing

- [ ] "View in AR" button on bird info card.
- [ ] Camera overlay with 3D model (on supported devices).
- [ ] Graceful fallback on unsupported devices.

### AC-V12-5: Enhanced Animations

- [ ] Wing flap on click.
- [ ] Hop animation.
- [ ] Look-toward-camera.
- [ ] Short circle flight.

### AC-V12-6: UI Layout

- [ ] No absolute positioning inside bird info card.
- [ ] Card uses strict flex-column layout with spacing tokens.
- [ ] Tag row wraps instead of overflowing.
- [ ] Card has max-height 80vh with overflow-y auto.
- [ ] Glass-morphism style with border-radius 20px.
- [ ] Continent tags blue, habitat tags green, lifespan tags orange.
- [ ] Sidebar buttons identical size, vertically aligned.
- [ ] No UI overlap between any panels.

### AC-V12-7: Performance

- [ ] Model lazy loading implemented.
- [ ] Max 15 visible 3D models.
- [ ] KTX2 texture compression where possible.
- [ ] ~60 FPS maintained.

### AC-V12-8: Educational

- [ ] Fun facts short and exciting.
- [ ] Wingspan visualization bar works.
- [ ] "Did you know?" section styled.

### AC-V11-1: UI Layout Fix

- [x] No absolute positioning inside bird info card.
- [x] Card uses strict flex-column layout with spacing tokens.
- [x] Tag row wraps instead of overflowing.
- [x] Card has max-height 80vh with overflow-y auto.
- [x] Glass-morphism style with border-radius 20px.
- [x] Continent tags blue, habitat tags green, lifespan tags orange.
- [x] Sidebar buttons identical size, vertically aligned.
- [x] No UI overlap between any panels.

### AC-V11-2: 3D Bird Models

- [x] GLTFLoader loads bird models in GLB format.
- [x] Birds display idle animation and floating motion.
- [x] LOD: icon markers when far, 3D models when close.
- [x] Max 15 simultaneous 3D models.
- [x] Click animation: wing flap, lift, rotate toward camera.

### AC-V11-3: Expanded Bird Dataset

- [x] 40+ birds in birds.json.
- [x] Birds from South America, North America, Africa, Asia, Oceania, Polar regions.
- [x] Each bird has all required fields including soundUrl.

### AC-V11-4: Bird Sound Feature

- [x] "Listen" button on bird info card.
- [x] Clicking plays bird call audio.
- [x] Audio lazy-loaded.
- [x] Graceful fallback on error.

### AC-V11-5: Bird Discovery System

- [x] First-time click shows "New bird discovered!" notification.
- [x] Discovery state persisted in localStorage.
- [x] Collection screen shows discovered and locked birds.

### AC-V11-6: Exploration Progress

- [x] Global progress bar: "12/40 Birds Found".
- [x] Continent-level progress displayed.
- [x] Progress updates in real-time.

### AC-V11-7: Bird Click Animation

- [x] Wing flap animation on click.
- [x] Bird lifts slightly on click.
- [x] Bird rotates toward camera on click.

### AC-V11-8: Performance

- [x] Model lazy loading implemented.
- [x] Max 15 visible 3D models.
- [x] ~60 FPS maintained.

### AC-PERF: Performance

- [ ] ~60 FPS on mid-range laptop.
- [ ] No jank during animations.
- [ ] Smooth globe rotation at all times.

### AC-ARCH: Architecture Invariants

- [ ] OrbitControls target always [0,0,0].
- [ ] Camera zoom respects minDistance 1.15.
- [ ] No scene.add() or scene.remove() calls.
- [ ] All animations via useFrame.
- [ ] All geometry via useMemo.
- [ ] Declarative R3F patterns throughout.

---

## V21 — Architecture Refactor

### US-48: Modular Codebase (v21)

As a developer, I can find and modify any feature in a clearly organized module structure so that adding new birds or features is straightforward.

### R-63: Module Architecture (v21)

- Refactor project into clear module boundaries:
  - `/src/core/` — Engine.ts (render loop manager), SceneManager.ts (scene setup/teardown), CameraController.ts (camera animation/controls)
  - `/src/systems/` — BirdSystem.ts (bird data, markers, discovery), MigrationSystem.ts (migration routes/animation), QuizSystem.ts (quiz logic), AudioSystem.ts (sound playback), AchievementSystem.ts (achievements/missions)
  - `/src/ui/` — HUD.ts (heads-up display), BirdPanel.ts (bird info card), QuizPanel.ts (quiz UI), ProgressPanel.ts (progress tracking UI)
  - `/src/data/` — birds.json, migrations.json, achievements.json (pure data, no logic)
- Remove monolithic files by extracting logic into system modules.
- Each system module exports a React hook or component that encapsulates its domain.
- Data files contain only JSON data; all business logic lives in system modules.
- Barrel exports (`index.ts`) in each directory for clean imports.

### AC-V21-1: Architecture Refactor

- [ ] `/src/core/` directory exists with Engine.ts, SceneManager.ts, CameraController.ts.
- [ ] `/src/systems/` directory exists with BirdSystem.ts, MigrationSystem.ts, QuizSystem.ts, AudioSystem.ts, AchievementSystem.ts.
- [ ] `/src/ui/` directory exists with HUD.ts, BirdPanel.ts, QuizPanel.ts, ProgressPanel.ts.
- [ ] `/src/data/` directory contains birds.json, migrations.json, achievements.json.
- [ ] No monolithic files remain; logic is separated from data.
- [ ] All existing features continue to work after refactor.
- [ ] Build succeeds with zero TypeScript errors.

---

## V22 — Content Expansion

### US-49: Explore 30 Detailed Birds (v22)

As a child, I can discover 30 birds from every continent, each with rich information including habitat, diet, wingspan, and fun facts.

### US-50: See Region Clusters (v22)

As a child, I can see cluster markers on the globe showing how many birds are in each region, making it easy to find bird-rich areas.

### R-64: Expanded Bird Database (v22)

- 30 birds minimum, each with complete fields:
  - `name` (zh + en), `continent`, `habitat`, `diet`, `wingspan`, `funFact`, `modelPath`, `soundPath`
- Regions covered: North America, South America, Africa, Europe, Asia, Oceania, Antarctica.
- Each region has at least 3 birds.
- Bird data validated: no missing required fields.

### R-65: Region Clusters on Globe (v22)

- Cluster markers displayed at region center positions on globe.
- Each cluster shows region name and bird count badge.
- Clicking a cluster filters to that region's birds and zooms camera.
- Clusters use distinct colors per region.
- Clusters visible at far zoom, individual markers visible at close zoom.

### AC-V22-1: Content Expansion

- [ ] 30+ birds in birds.json with all required fields.
- [ ] All 7 regions represented with at least 3 birds each.
- [ ] Each bird has name, continent, habitat, diet, wingspan, funFact, modelPath, soundPath.
- [ ] Region cluster markers visible on globe.
- [ ] Clicking cluster zooms to region and filters birds.
- [ ] Build succeeds with zero TypeScript errors.

---

## V23 — Performance Optimization

### US-51: Smooth Experience (v23)

As a child, I experience smooth animations and fast loading even with many birds on the globe.

### R-66: Model LOD System (v23)

- Near camera (distance < 3 units): render high-poly 3D bird model.
- Far from camera (distance >= 3 units): render simplified low-poly mesh or sprite.
- LOD transition is smooth with no visible pop-in.
- LOD distance thresholds configurable.

### R-67: Lazy Loading (v23)

- Bird 3D models loaded only when the bird enters the camera's visible region.
- Models cached after first load for instant re-display.
- Loading indicator shown briefly while model loads.
- Unloaded birds display lightweight icon markers.

### R-68: Instanced Markers (v23)

- Use `THREE.InstancedMesh` for rendering distant bird markers.
- Single draw call for all instanced markers.
- Instance attributes: position, color, scale.
- Reduces draw calls from O(n) to O(1) for distant markers.

### R-69: Render Loop Optimization (v23)

- No blocking operations in `requestAnimationFrame` / `useFrame`.
- Heavy computations (distance sorting, LOD decisions) throttled to run every N frames.
- Geometry and material creation via `useMemo` to prevent re-allocation.
- Target: 60 FPS on mid-range laptop (Intel i5, integrated GPU).

### AC-V23-1: Performance Optimization

- [ ] LOD system switches between high-poly and low-poly based on camera distance.
- [ ] Bird models lazy-loaded on demand.
- [ ] InstancedMesh used for distant markers.
- [ ] Draw calls reduced compared to V22.
- [ ] 60 FPS maintained on mid-range hardware.
- [ ] No jank during globe rotation or bird interaction.

---

## V24 — Visual Polish

### US-52: Beautiful Globe (v24)

As a child, I see a beautiful, realistic globe with glowing atmosphere, clouds, and proper lighting that makes exploration feel magical.

### R-70: Atmosphere Glow (v24)

- Animated Fresnel-based atmosphere shell around Earth.
- Soft blue-white glow visible from all angles.
- Glow intensity varies with view angle (stronger at edges).
- Two-layer system: inner warm glow + outer cool halo.

### R-71: Cloud Layer (v24)

- Semi-transparent cloud texture layer above globe surface.
- Slow rotation independent of globe (creates parallax effect).
- Opacity ~0.4 for subtle effect without obscuring geography.
- Visible in both day and night regions.

### R-72: Sun Light Direction (v24)

- Directional light simulating sun position.
- Slowly rotating to create day/night cycle.
- Warm color temperature (slightly yellow-white).
- Shadow casting enabled for bird markers.

### R-73: Soft Shadows (v24)

- Bird markers cast soft shadows on globe surface.
- Shadow map resolution appropriate for performance (512x512).
- Shadows fade with distance from marker.
- Shadow intensity subtle, not distracting.

### R-74: Improved Marker Visuals (v24)

- Animated glow ring at marker base with pulse effect.
- Rarity-based glow colors (common: blue, rare: gold, legendary: purple).
- Smooth scale animation on hover (1.2x with ease-out).
- Discovered markers have subtle sparkle effect.

### R-75: Camera Inertia (v24)

- Camera rotation has momentum/inertia after user releases drag.
- Smooth deceleration (damping factor ~0.92).
- Inertia respects zoom level (less inertia when zoomed in).
- Feels natural and fluid for children to use.

### AC-V24-1: Visual Polish

- [ ] Atmosphere glow visible around globe from all angles.
- [ ] Cloud layer rotates independently with parallax effect.
- [ ] Directional sun light creates day/night regions.
- [ ] Bird markers cast soft shadows on globe.
- [ ] Marker glow colors match rarity.
- [ ] Camera has smooth inertia after drag release.
- [ ] All visual improvements maintain 60 FPS.

---

## V25 — Exploration Experience

### US-53: Bird Expedition Mode (v25)

As a child, I can start Bird Expedition missions that give me specific goals like "Find 3 birds in Africa" or "Discover a bird that migrates", making exploration feel like an adventure.

### US-54: Earn Expedition Badges (v25)

As a child, I earn achievement badges when I complete expedition missions, motivating me to keep exploring.

### US-55: Track My Progress (v25)

As a child, I can see my expedition progress showing how many missions I've completed and what badges I've earned.

### US-56: Celebrate Completion (v25)

As a child, when I complete an expedition mission, I see a fun celebration with confetti and my new badge, making me feel accomplished.

### R-76: Bird Expedition Mode (v25)

- Structured expedition system with predefined missions.
- Mission types: region exploration ("Find 3 birds in Africa"), trait discovery ("Discover a bird that migrates"), collection goals ("Collect 5 birds").
- Missions have clear objectives, progress tracking, and completion state.
- Active mission displayed prominently in HUD.
- Multiple missions available; one active at a time.

### R-77: Mission Rewards (v25)

- Each completed mission awards an achievement badge.
- Badges stored in localStorage and displayed in explorer profile.
- Badge designs: region badges (continent icons), trait badges (migration, diet), milestone badges (first 5, first 10).
- Badge unlock triggers celebration animation.

### R-78: Progress Tracker (v25)

- Progress panel showing overall expedition completion.
- Visual progress bar: "Expeditions Complete: 5/12".
- Per-mission progress: "Find 3 birds in Africa: 2/3".
- Progress persisted in localStorage across sessions.

### R-79: Mission Panel UI (v25)

- Dedicated mission panel accessible from HUD.
- Shows available missions with descriptions and rewards.
- Active mission highlighted with progress indicator.
- Completed missions show earned badge.
- Minimum tap size 56px for all interactive elements.
- Panel positioned to not overlap other UI elements.

### R-80: Completion Celebration (v25)

- On mission completion: confetti burst + badge reveal animation.
- Badge scales in from center with glow effect.
- "Mission Complete!" message with mission name.
- Celebration duration ~2.5s, non-blocking.
- Sound effect optional (CSS animation primary).

### AC-V25-1: Exploration Experience

- [ ] Bird Expedition Mode with structured missions available.
- [ ] Mission types include region, trait, and collection goals.
- [ ] Active mission progress tracked and displayed.
- [ ] Completed missions award achievement badges.
- [ ] Progress tracker shows overall expedition completion.
- [ ] Mission panel UI with 56px minimum tap targets.
- [ ] Completion celebration with confetti and badge reveal.
- [ ] All expedition data persisted in localStorage.
- [ ] No UI overlap with existing panels.
- [ ] 60 FPS maintained with expedition features active.

---

## V26 — Dynamic World Simulation

### US-57: See Real Day/Night Cycle (v26)

As a child, I can see the Earth rotating with realistic lighting where the sun position changes over time, making the globe feel like a living planet.

### US-58: See City Lights at Night (v26)

As a child, I can see subtle city lights glowing on the dark side of the Earth, making nighttime exploration magical.

### US-59: See Weather on the Globe (v26)

As a child, I can see cloud clusters, rain particles, and storm visuals in different regions, making the world feel dynamic.

### US-60: See Birds Change with Time (v26)

As a child, I notice that some birds are active during the day while others appear at night, teaching me about nocturnal and diurnal birds.

### R-81: Enhanced Day/Night Cycle (v26)

- Earth rotates with real lighting simulation.
- Sun position changes continuously over time.
- Day side fully lit, night side dark with city lights texture.
- City lights fade in/out smoothly based on sun angle per fragment.
- Sun rotation speed configurable (default ~0.03 rad/s for visible cycle).
- Time-of-day indicator in HUD showing approximate time.

### R-82: Weather Zone System (v26)

- Regions can display weather effects: cloud clusters, rain particles, storm visuals.
- Weather data defined per region in weather configuration.
- Cloud clusters: groups of small cloud sprites above region.
- Rain particles: vertical particle streams in rainy regions.
- Storm visuals: darker clouds with occasional lightning flash effect.
- Weather effects are subtle and do not obscure bird markers.
- Weather toggle button in control panel.

### R-83: Bird Activity Variation (v26)

- Birds have `activityPeriod` field: "diurnal" | "nocturnal" | "crepuscular".
- Diurnal birds visible and animated during day cycle.
- Nocturnal birds appear with glow effect during night cycle.
- Crepuscular birds active during dawn/dusk transitions.
- Activity state determined by sun angle at bird's position.
- Nocturnal birds have subtle eye-glow shader effect.

### AC-V26-1: Dynamic World Simulation

- [ ] Day/night cycle with smooth sun rotation visible.
- [ ] City lights visible on night side of globe.
- [ ] Weather effects (clouds, rain, storms) visible in regions.
- [ ] Day birds active during daytime, nocturnal birds at night.
- [ ] Time-of-day indicator in HUD.
- [ ] Weather toggle button works.
- [ ] 60 FPS maintained with all V26 features.

---

## V27 — Flocking System

### US-61: See Birds Flying in Flocks (v27)

As a child, I can see groups of birds flying together in natural-looking flocks, making the globe feel alive with movement.

### US-62: See Different Flock Behaviors (v27)

As a child, I notice that different bird species fly in different patterns — some in tight groups, others spread out, and some circling their habitats.

### R-84: Boids Flocking Algorithm (v27)

- Implement simplified boids algorithm with three rules: separation, alignment, cohesion.
- Each bird species has configurable flock parameters:
  - `flockSize`: number of birds in group (3-12).
  - `speed`: movement speed (0.001-0.01 units/frame).
  - `altitudeRange`: [min, max] altitude above globe surface.
  - `wanderRadius`: how far flock wanders from home position.
- Flocks wander naturally around their habitat region.
- Flocks circle habitat center with gentle orbital motion.
- Collision avoidance with globe surface.

### R-85: GPU-Friendly Flock Rendering (v27)

- Use InstancedMesh for each flock group.
- Update instance matrices per frame from boids computation.
- Boids computation runs on main thread but optimized:
  - Spatial hashing for neighbor lookups.
  - Throttled to every 2 frames for distant flocks.
- Each flock member has slight animation offset for variety.
- Maximum 8 active flocks visible simultaneously.

### AC-V27-1: Flocking System

- [ ] Birds move in natural-looking flocks.
- [ ] Separation, alignment, cohesion behaviors visible.
- [ ] Species have different flock sizes and speeds.
- [ ] Flocks wander and circle habitats.
- [ ] GPU-friendly rendering with InstancedMesh.
- [ ] Maximum 8 active flocks enforced.
- [ ] 60 FPS maintained with flocking active.

---

## V28 — Story Mode

### US-63: Follow a Bird Adventure (v28)

As a child, I can start a "Bird Adventure" story that takes me on a guided journey to different parts of the world, learning about birds along the way.

### US-64: Hear Story Narration (v28)

As a child, I can hear friendly narration as the camera travels to each story location, making the adventure feel like a nature documentary.

### US-65: See Highlighted Story Birds (v28)

As a child, I can see the featured birds highlighted with special effects at each story location, making them easy to find and learn about.

### R-86: Story System (v28)

- Story data structure: sequence of locations with camera positions, narration text, and featured bird IDs.
- Predefined stories:
  - "Journey of the Arctic Tern" — follows migration from Arctic to Antarctic.
  - "Rainforest Guardians" — explores tropical birds of South America.
  - "Birds of the African Savannah" — discovers savannah birds of Africa.
- Each story step: location (lat/lng), camera zoom, narration text (zh/en), featured bird ID, duration.
- Story auto-advances after each step's duration.
- User can pause, resume, skip steps, or exit story.

### R-87: Story Camera System (v28)

- Camera auto-travels between story locations with smooth animation.
- Travel duration proportional to distance (1-3 seconds).
- Camera arrives at comfortable viewing angle for featured bird.
- During travel, subtle zoom-out then zoom-in for cinematic feel.
- OrbitControls disabled during story camera travel.

### R-88: Story Narration (v28)

- Each story step has narration text in zh and en.
- Narration played via Web Speech API (SpeechSynthesis).
- Narration starts when camera arrives at location.
- Fallback: display narration text in story panel if speech unavailable.
- Voice: friendly, moderate speed (rate 0.9).

### R-89: Story Panel UI (v28)

- Story selection panel showing available stories with cover images.
- Active story panel showing current step, progress dots, narration text.
- Controls: play/pause, next step, exit story.
- Featured bird highlighted with golden glow effect.
- Story completion awards a badge.
- Panel positioned in modal layer (z-80).

### AC-V28-1: Story Mode

- [ ] Story selection panel shows available stories.
- [ ] Camera auto-travels between story locations.
- [ ] Narration plays at each story step.
- [ ] Featured birds highlighted with glow effect.
- [ ] Story progress tracked with dots.
- [ ] Play/pause/skip/exit controls work.
- [ ] Story completion awards badge.
- [ ] 60 FPS maintained during story mode.

---

## V29 — Shareable Discoveries

### US-66: Take a Screenshot (v29)

As a child, I can capture a screenshot of the globe showing my discovered birds to share with friends and family.

### US-67: Create a Share Card (v29)

As a child, I can generate a beautiful share card showing a bird I discovered with its name, location, and a fun fact.

### US-68: Export My Progress (v29)

As a child (or parent), I can export my discovery progress as a file to save or share.

### R-90: Screenshot Capture (v29)

- "Screenshot" button in control panel.
- Captures the Three.js canvas as PNG image.
- Uses `renderer.domElement.toDataURL('image/png')`.
- Shows brief flash animation on capture.
- Triggers browser download of the image file.
- Filename: `bird-globe-{timestamp}.png`.

### R-91: Share Card Generator (v29)

- "Share" button on bird info card.
- Generates a shareable image card containing:
  - Bird name (zh + en).
  - Bird silhouette or model preview.
  - Location on mini-globe or region name.
  - Fun fact text.
  - App branding ("万羽拾音 — Kids Bird Globe").
- Card rendered to off-screen canvas (600x400px).
- Download as PNG or copy to clipboard.

### R-92: Progress Export (v29)

- "Export Progress" button in settings/control panel.
- Exports JSON file containing:
  - Discovered birds list.
  - Collection data.
  - Achievement progress.
  - Expedition progress.
  - Total statistics.
- Filename: `bird-globe-progress-{timestamp}.json`.
- Triggers browser download.

### R-93: Share UI Panel (v29)

- Share panel accessible from control panel.
- Shows recent screenshots thumbnails.
- "Copy to Clipboard" button for share cards.
- "Download" button for all shareable content.
- Glass UI styling consistent with design system.

### AC-V29-1: Shareable Discoveries

- [ ] Screenshot capture button works and downloads PNG.
- [ ] Flash animation on screenshot capture.
- [ ] Share card generates image with bird info.
- [ ] Share card downloadable as PNG.
- [ ] Progress export downloads JSON file.
- [ ] Share panel shows recent captures.
- [ ] 60 FPS maintained.

---

## V30 — Educational Layer

### US-69: Browse Bird Encyclopedia (v30)

As a child, I can open a comprehensive Bird Encyclopedia that lets me search and browse all birds with detailed information.

### US-70: Filter Birds by Properties (v30)

As a child, I can filter birds by continent, diet, and wingspan to find specific types of birds I'm interested in.

### US-71: See Detailed Bird Entries (v30)

As a child, I can see detailed bird entries with a 3D model preview, habitat map, sound playback, and interesting facts.

### R-94: Bird Encyclopedia Panel (v30)

- Full-featured encyclopedia panel in modal layer.
- Search bar: filter birds by name (zh/en).
- Filter controls:
  - By continent (multi-select checkboxes).
  - By diet type (insect, fish, seeds, fruit, meat, omnivore).
  - By wingspan range (small <50cm, medium 50-100cm, large >100cm).
- Results grid showing bird cards with photo, name, region badge.
- Discovered birds show full info, undiscovered show silhouette.
- Pagination or virtual scroll for performance.

### R-95: Detailed Bird Entry (v30)

- Each bird entry panel shows:
  - 3D model preview (rotating model in small viewport).
  - Habitat map: mini-globe with bird's region highlighted.
  - Sound playback button with waveform visualization.
  - Facts section: habitat, diet, wingspan, lifespan, fun fact.
  - Scientific name in italic.
  - Conservation status indicator (if available).
- Entry panel slides in from right on desktop, bottom sheet on mobile.

### R-96: Performance Monitoring (v30)

- Optional FPS counter overlay (developer toggle).
- Scene statistics: draw calls, triangles, textures.
- Memory usage indicator.
- Accessible via hidden gesture (triple-tap corner).

### R-97: Dynamic LOD Tuning (v30)

- Automatic LOD distance adjustment based on FPS.
- If FPS drops below 45, increase LOD distance (show fewer 3D models).
- If FPS stable above 55, decrease LOD distance (show more detail).
- LOD tuning runs every 60 frames.
- Configurable min/max LOD distances.

### R-98: Asset Preloading (v30)

- Progressive asset preloading on app start.
- Priority: Earth textures → bird models → sound files.
- Loading progress shown in loading screen.
- Background preloading continues after initial render.
- Preload queue with priority levels.

### R-99: Texture Compression (v30)

- Use compressed texture formats where supported (KTX2/Basis).
- Fallback to standard textures on unsupported devices.
- Texture atlas for bird silhouettes to reduce draw calls.
- Lazy texture loading for off-screen content.

### AC-V30-1: Educational Layer

- [ ] Bird Encyclopedia panel with search and filters.
- [ ] Filter by continent, diet, wingspan works.
- [ ] Bird entries show 3D model preview.
- [ ] Habitat map highlights bird's region.
- [ ] Sound playback works in encyclopedia.
- [ ] Performance monitoring available via hidden toggle.
- [ ] Dynamic LOD tuning adjusts based on FPS.
- [ ] Asset preloading shows progress.
- [ ] 60 FPS maintained with all V30 features.

---

## V31 — Structured Learning Experience

### US-72: Ask the AI Bird Guide (v31)

As a child, I can click on any bird and ask questions like "Why do flamingos stand on one leg?" and get a friendly, simplified answer from the AI Bird Guide character.

### US-73: See the Bird Guide Character (v31)

As a child, I see a friendly animated bird character (the Guide) that appears with a speech bubble when I interact with birds, making learning feel like a conversation.

### US-74: Hear the Guide Speak (v31)

As a child, I can press a narration button to hear the AI Guide read its answer aloud, making the experience accessible even if I can't read well yet.

### US-75b: Follow Learning Tracks (v31)

As a child, I can choose a themed learning journey like "Birds of Prey" or "Ocean Birds" and discover all the birds in that track to earn a badge.

### US-76b: Track My Learning Progress (v31)

As a child, I can see which birds I've discovered in each learning track and how close I am to completing it.

### US-77b: Observe Seasonal Changes (v31)

As a child, I can watch how the world changes with seasons — birds migrate during winter, more birds appear near the equator in cold months, and flocks shift with the weather.

### US-78b: Filter Birds by Habitat (v31)

As a child, I can toggle habitat filters to see only forest birds, ocean birds, or mountain birds, helping me focus my exploration.

### US-79b: Watch Seasonal Migration (v31)

As a child, I can see glowing migration paths that appear during migration seasons, with animated particles showing the direction birds fly.

### R-100: AI Bird Guide System (v31)

- Friendly animated bird guide character displayed as a floating UI element.
- Children can click a bird and ask predefined questions or type simple queries.
- Guide responds with simplified, child-friendly explanations.
- Local knowledge base with 100+ Q&A pairs covering common bird questions.
- RAG-like system architecture:
  - `BirdGuideService` — orchestrates question routing and answer retrieval.
  - `PromptBuilder` — constructs context from bird encyclopedia database.
  - `ResponseRenderer` — formats and displays answers with typing animation.
- Fallback behavior: if no API key is present, use prewritten answers from `bird_facts.json`.
- Speech bubble UI with typing animation effect.
- Narration button triggers Web Speech API to read the answer aloud.
- Guide character has idle animation (gentle bobbing).
- Questions categorized: behavior, habitat, diet, appearance, migration.
- Response length: 2-3 sentences maximum for child comprehension.
- Floating "Ask the Bird Guide" button accessible from any screen.

### R-101: Bird Guide Knowledge Base (v31)

- JSON knowledge base with structured Q&A entries.
- Each entry: question pattern, bird ID (or "general"), answer text (zh/en).
- Pattern matching for question routing (keyword-based).
- Categories: "why" questions, "how" questions, "what" questions, "where" questions.
- Fallback responses for unmatched questions.
- Knowledge base loaded from `/src/data/bird-knowledge.json`.
- Additional prewritten facts in `/src/data/bird_facts.json` for offline fallback.

### R-102: Guide UI (v31)

- Speech bubble component with glass-morphism styling.
- Typing animation (characters appear one by one, 30ms per character).
- Narration button (speaker icon) triggers TTS.
- Close button to dismiss.
- Guide character: small bird avatar with bobbing animation.
- Positioned bottom-left, above existing BirdGuide component.
- Does not overlap with bird info card or control panel.
- z-index: card layer (60).
- Floating "Ask the Bird Guide" button in sidebar.

### R-103b: Learning Tracks System (v31)

- Themed learning journeys children can follow.
- Predefined tracks:
  - Birds of Prey (eagle, hawk, owl, falcon, osprey).
  - Ocean Birds (penguin, seagull, albatross, pelican, puffin).
  - Rainforest Birds (toucan, macaw, parrot, quetzal, hornbill).
  - Migratory Birds (arctic tern, swallow, godwit, crane, stork).
  - Colorful Birds (flamingo, peacock, kingfisher, bee-eater, lorikeet).
- Each track contains 5–10 birds.
- Data structure:

```typescript
interface LearningTrack {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  birdIds: string[];
  badgeIcon: string;
}
```

- User progress tracking:

```typescript
interface TrackProgress {
  trackId: string;
  discoveredBirds: string[];
  completed: boolean;
  completedAt?: number;
}
```

- When a child discovers all birds in a track:
  - Unlock badge.
  - Play celebration animation (confetti + badge reveal).
  - Track marked as completed in localStorage.
- UI: Sidebar → Learning Tracks panel.
- Track panel shows progress bar per track.
- Completed tracks show earned badge with glow effect.

### R-104b: Ecosystem Simulation (v31)

- Environmental simulation system influencing bird behavior.
- New system: `EcosystemSystem`.
- World state variables:

```typescript
interface WorldState {
  season: "spring" | "summer" | "autumn" | "winter";
  temperature: number;
  wind: number;
  timeOfDay: "dawn" | "morning" | "afternoon" | "dusk" | "night";
}
```

- Season influences:
  - Bird migration: winter triggers migration paths, spring triggers return.
  - Bird density: winter → more birds near equator; summer → more birds in northern hemisphere.
  - Spawn locations shift based on season.
- Season cycle: configurable speed, default ~60 seconds per full year cycle.
- `SeasonController` manages season transitions with smooth interpolation.
- Season indicator in HUD showing current season with icon.
- Temperature and wind affect bird animation speed and flock behavior.

### R-105b: Habitat Filter (v31)

- Users can filter birds by habitat type.
- Habitat types:
  - Forest
  - Wetlands
  - Ocean
  - Grassland
  - Mountain
  - Urban
- UI: Toggle filter buttons in sidebar.
- When filter active: only show birds matching selected habitats.
- Multiple habitats can be selected simultaneously (OR logic).
- Filter state persisted in session (not localStorage).
- Filtered-out birds fade to 0.1 opacity (not removed, for context).
- Filter badge shows count of active filters.
- `HabitatFilter` module handles filter logic.

### R-106b: Seasonal Migration Visualization (v31)

- Upgraded migration arc system integrated with `EcosystemSystem`.
- Migration paths appear only during migration seasons (autumn/spring).
- During non-migration seasons, paths are hidden.
- Animation enhancements:
  - Glowing arc lines with emissive shader.
  - Directional particle flow along migration paths.
  - Particles move in the direction of migration.
  - Particle density increases during peak migration.
- `MigrationVisualizer` integrates with `EcosystemSystem` to read current season.
- `MigrationSystem` updated to check season state before rendering paths.

### R-107b: Data Expansion Support (v31)

- Prepare for larger bird datasets with lazy loading.
- New data directory structure:

```
src/data/birds/
  index.json        — master index with bird IDs and region references
  regions/
    asia.json       — birds in Asia
    europe.json     — birds in Europe
    americas.json   — birds in the Americas
```

- `BirdDataLoader` supports lazy loading:
  - Load `index.json` at startup (lightweight, IDs + metadata only).
  - Load regional JSON on demand when user explores a region.
  - Cache loaded regions in memory.
- Backward compatible: existing `birds.json` still works as fallback.
- Loader detects whether regional files exist; if not, falls back to monolithic `birds.json`.

### R-108b: Performance Requirements (v31)

- Maintain 60 FPS target with all v31 features active.
- Use `InstancedMesh` for distant birds.
- LOD system:
  - Far → particles.
  - Mid → instanced meshes.
  - Near → full 3D model.
- Ecosystem simulation runs on a 500ms tick (not per-frame).
- Habitat filter uses memoized bird lists.
- Learning track progress checks are event-driven (not polled).

### AC-V31-1: AI Bird Guide

- [ ] AI Bird Guide character visible with idle animation.
- [ ] Clicking a bird shows question prompts.
- [ ] Guide responds with child-friendly answers.
- [ ] Knowledge base contains 100+ Q&A pairs.
- [ ] Speech bubble with typing animation works.
- [ ] Narration button reads answer aloud.
- [ ] Guide does not overlap other UI.
- [ ] BirdGuideService with PromptBuilder and ResponseRenderer works.
- [ ] Fallback to prewritten answers when no API key present.

### AC-V31-2: Learning Tracks

- [ ] At least 5 learning tracks available in sidebar.
- [ ] Each track shows progress bar with discovered/total birds.
- [ ] Completing a track unlocks a badge with celebration animation.
- [ ] Track progress persisted in localStorage.
- [ ] Track panel accessible from sidebar.

### AC-V31-3: Ecosystem Simulation

- [ ] Season cycle runs (spring → summer → autumn → winter).
- [ ] Season indicator visible in HUD.
- [ ] Bird density shifts with seasons (more equatorial in winter).
- [ ] Migration paths appear only during migration seasons.
- [ ] Temperature/wind affect bird animation.

### AC-V31-4: Habitat Filter

- [ ] Habitat filter toggles visible in sidebar.
- [ ] Selecting a habitat shows only matching birds.
- [ ] Multiple habitats can be selected.
- [ ] Filtered-out birds fade but remain visible.
- [ ] Filter count badge displayed.

### AC-V31-5: Seasonal Migration Visualization

- [ ] Migration arcs appear during autumn/spring seasons.
- [ ] Glowing arc lines with directional particle flow.
- [ ] Particles move in migration direction.
- [ ] Paths hidden during non-migration seasons.

### AC-V31-6: Data Expansion

- [ ] Regional JSON files loadable (asia.json, europe.json, americas.json).
- [ ] BirdDataLoader supports lazy loading.
- [ ] Fallback to monolithic birds.json works.
- [ ] 60 FPS maintained with all V31 features.

---

## V32 — AR Bird Mode

### US-75: Place Birds in My Room (v32)

As a child, I can enter AR mode and place a 3D bird on my table or floor, then walk around it to see it from all angles.

### US-76: Watch AR Bird Animations (v32)

As a child, I can see the AR bird play animations like flapping wings and hopping, making it feel like a real bird is in my room.

### R-103: Enhanced AR Mode (v32)

- WebXR integration when available (AR session request).
- Camera feed background with 3D bird overlay.
- Hit-test for surface detection to place bird on detected surfaces.
- Bird model rendered at real-world scale.
- Touch controls: pinch to scale, drag to rotate, tap to place.
- Bird plays idle animation (wing flap, hop) in AR.
- Fallback: simulated AR using device camera feed as background with gyroscope-based rotation.
- AR session management: enter/exit cleanly.
- Performance: maintain 30+ FPS in AR mode.

### R-104: AR UI Overlay (v32)

- "Enter AR" button on bird info card (replaces/enhances existing "View in AR").
- AR mode overlay with: place button, animation toggle, exit button.
- Instructions overlay: "Point at a flat surface and tap to place the bird".
- Semi-transparent UI controls that don't obscure the bird.
- Screenshot button in AR mode.

### AC-V32-1: AR Bird Mode

- [ ] WebXR AR mode launches on supported devices.
- [ ] Camera feed visible as background.
- [ ] Bird model placed on detected surface.
- [ ] Bird animations play in AR.
- [ ] Touch controls for scale/rotate work.
- [ ] Fallback simulated AR works on non-WebXR devices.
- [ ] Clean enter/exit AR transitions.
- [ ] 30+ FPS in AR mode.

---

## V33 — Advanced Bird Animation

### US-77: See Birds Take Off and Land (v33)

As a child, I can see birds perform takeoff and landing animations, making them feel more alive and realistic.

### US-78: See Birds Perch and Rest (v33)

As a child, I can see birds occasionally rest on invisible anchor points near their habitat, then take off again to fly around.

### US-79: See Birds Fly Between Habitats (v33)

As a child, I occasionally see birds fly from one habitat area to another, showing natural movement patterns.

### R-105: Advanced Animation System (v33)

- Takeoff animation: bird crouches slightly, rapid wing flaps, lifts off surface.
- Landing animation: bird descends, spreads wings to brake, settles on surface.
- Perching behavior: birds periodically land on invisible anchor points near habitat.
- Perch duration: 5-15 seconds with idle perch animation (head turns, tail flicks).
- Inter-habitat flight: birds occasionally fly between nearby habitat zones.
- Flight path: curved arc between habitats with altitude variation.
- Animation state machine: idle → takeoff → flying → landing → perching → idle.
- Transition blending between animation states (0.3s crossfade).
- Per-bird random timing for natural variety.

### R-106: Animation Anchor Points (v33)

- Invisible anchor points defined per habitat region.
- 3-5 anchor points per region at surface level.
- Birds select random anchor point within their habitat for perching.
- Anchor points positioned at biologically plausible locations.

### AC-V33-1: Advanced Bird Animation

- [ ] Takeoff animation plays when bird leaves perch.
- [ ] Landing animation plays when bird arrives at perch.
- [ ] Birds perch for 5-15 seconds with idle animation.
- [ ] Birds occasionally fly between habitats.
- [ ] Animation state machine transitions smoothly.
- [ ] Per-bird random timing creates natural variety.
- [ ] 60 FPS maintained with advanced animations.

---

## V34 — Bird Photographer Game

### US-80: Play the Bird Photographer Game (v34)

As a child, I can enter a special camera mode where I try to take the best photos of birds, earning scores based on how well I frame the shot.

### US-81: See My Photography Score (v34)

As a child, after taking a photo I see a score based on the bird's distance, pose, and composition, motivating me to take better photos.

### R-107: Bird Photographer Mini-Game (v34)

- Dedicated "Photographer Mode" accessible from control panel.
- Camera viewfinder overlay with rule-of-thirds grid.
- Scoring system based on:
  - Distance: closer = higher score (max 30 points).
  - Bird pose: mid-animation (flying, flapping) = bonus (max 30 points).
  - Composition: bird near grid intersections = bonus (max 20 points).
  - Rarity: rare/legendary birds = bonus multiplier (max 20 points).
- Score displayed immediately after capture with star rating (1-5 stars).
- Photo saved to gallery with score metadata.
- Leaderboard: top 10 best photos by score.
- Timer mode: capture as many high-scoring photos as possible in 60 seconds.

### R-108: Photographer UI (v34)

- Viewfinder overlay with crosshair and grid lines.
- Score popup animation after capture.
- Star rating display (1-5 stars based on score).
- Timer display for timed mode.
- Best score indicator.
- Glass-morphism styling consistent with design system.

### AC-V34-1: Bird Photographer Game

- [ ] Photographer mode accessible from control panel.
- [ ] Viewfinder overlay with grid lines.
- [ ] Scoring based on distance, pose, composition, rarity.
- [ ] Score and star rating displayed after capture.
- [ ] Photos saved with score metadata.
- [ ] Timer mode works (60 seconds).
- [ ] 60 FPS maintained in photographer mode.

---

## V35 — Habitat Ecosystems

### US-82: Explore Different Biomes (v35)

As a child, I can see distinct biome environments on the globe — rainforest, savannah, arctic, and ocean islands — each with unique visual styling.

### US-83: Hear Biome Sounds (v35)

As a child, when I zoom into a biome region, I hear ambient sounds like rainforest insects, savannah wind, or arctic wind, making each region feel unique.

### US-84: See Biome-Specific Birds (v35)

As a child, I can see that each biome has its own set of unique birds that only appear in that environment.

### R-109: Habitat Biome System (v35)

- Four distinct biome zones on the globe:
  - Rainforest: lush green tint, particle effects (floating leaves), warm lighting.
  - Savannah: golden-amber tint, dust particles, warm directional light.
  - Arctic: blue-white tint, snow particles, cool lighting.
  - Ocean Islands: turquoise water tint, wave shimmer effect, bright lighting.
- Biome visual effects rendered as localized overlays on globe surface.
- Each biome has custom ambient lighting adjustments.
- Biome boundaries defined by lat/lng regions.
- Smooth transition when camera moves between biomes.

### R-110: Biome Ambient Sound (v35)

- Each biome has an ambient sound loop.
- Sound fades in when camera enters biome region, fades out when leaving.
- Rainforest: insects, birds, rain drops.
- Savannah: wind, distant animal calls.
- Arctic: wind, ice cracking.
- Ocean: waves, seabirds.
- Volume adjusts based on camera zoom level (louder when closer).
- Uses Web Audio API for spatial audio effect.

### R-111: Biome Bird Assignment (v35)

- Each bird in birds.json has a `biome` field mapping to its primary biome.
- Biome filter in encyclopedia and control panel.
- Birds visually enhanced when in their home biome (subtle glow).
- Biome info displayed in bird info card.

### AC-V35-1: Habitat Ecosystems

- [ ] Four biome zones visible on globe with distinct visual styling.
- [ ] Biome-specific particle effects (leaves, dust, snow, shimmer).
- [ ] Ambient sounds play when camera enters biome region.
- [ ] Sound volume adjusts with zoom level.
- [ ] Birds assigned to biomes.
- [ ] Biome filter available in encyclopedia.
- [ ] Smooth transitions between biomes.
- [ ] 60 FPS maintained with biome effects.

---

## V36 — Real Migration Data

### US-85: See Real Migration Routes (v36)

As a child, I can see animated migration paths based on real data, showing how birds like the Arctic Tern travel thousands of miles across the globe.

### US-86: Learn Migration Facts (v36)

As a child, I can tap on a migration route to learn interesting facts about the journey, like distance traveled and time taken.

### R-112: Real Migration Data System (v36)

- Migration routes based on public datasets (eBird, BirdLife International patterns).
- Expanded migration data for 10+ species:
  - Arctic Tern (Arctic ↔ Antarctic, ~70,000 km).
  - Barn Swallow (Europe ↔ Africa, ~10,000 km).
  - Bar-tailed Godwit (Alaska → New Zealand, ~11,000 km non-stop).
  - Ruby-throated Hummingbird (Eastern US ↔ Central America).
  - Whooping Crane (Canada ↔ Texas).
  - Flamingo (seasonal movements within Africa/Americas).
  - Osprey (North America ↔ South America).
  - Peregrine Falcon (Arctic ↔ South America).
  - Sooty Shearwater (circumnavigation route).
  - Snow Goose (Arctic ↔ Southern US).
- Each route: waypoints array, total distance, travel time, season.
- Animated migration paths with speed proportional to real travel time.
- Migration info popup on route tap: distance, duration, fun fact.

### R-113: Migration Visualization Enhancement (v36)

- Thicker, more visible migration arcs with gradient coloring.
- Bird silhouette icon animating along the path.
- Season indicator showing when migration occurs.
- Multiple birds can migrate simultaneously.
- Migration speed control (1x, 2x, 5x).

### AC-V36-1: Real Migration Data

- [ ] 10+ migration routes with real data.
- [ ] Animated paths with bird silhouette icons.
- [ ] Route tap shows migration facts.
- [ ] Distance and duration displayed per route.
- [ ] Migration speed control works.
- [ ] 60 FPS maintained with migration animations.

---

## V37 — Advanced Visual Rendering

### US-87: See a More Realistic Earth (v37)

As a child, I see a beautiful, realistic Earth with HDR lighting, volumetric clouds, and atmospheric scattering that makes the globe feel like a real planet.

### R-114: HDR Environment Lighting (v37)

- HDR environment map for realistic reflections and ambient lighting.
- Tone mapping (ACES Filmic) for natural color reproduction.
- Exposure control adjusting with time of day.
- Environment map influences bird model materials.

### R-115: Volumetric Clouds (v37)

- Enhanced cloud system with volumetric appearance.
- Multiple cloud layers at different altitudes.
- Cloud density varies by region (more over tropics, less over deserts).
- Soft shadow casting from clouds onto globe surface.
- Cloud animation: slow drift with turbulence.

### R-116: Atmospheric Scattering (v37)

- Rayleigh scattering simulation for sky color.
- Blue atmosphere visible at globe edges.
- Orange/red tint during dawn/dusk transitions.
- Scattering intensity varies with sun angle.
- Subtle god-ray effect from sun direction.

### AC-V37-1: Advanced Visual Rendering

- [ ] HDR environment lighting with tone mapping.
- [ ] Volumetric cloud appearance with multiple layers.
- [ ] Atmospheric scattering visible at globe edges.
- [ ] Dawn/dusk color transitions work.
- [ ] Cloud shadows on globe surface.
- [ ] 60 FPS maintained with advanced rendering.

---

## V38 — Bird Encyclopedia Pro

### US-88: Search and Filter Birds Professionally (v38)

As a child, I can search birds by name and filter by continent, wingspan, and diet with an intuitive, professional-quality encyclopedia interface.

### US-89: See 3D Bird Previews (v38)

As a child, I can see a rotating 3D preview of each bird in the encyclopedia, along with its habitat map and bird call.

### US-90: Read Fun Facts (v38)

As a child, each bird entry has multiple fun facts, conservation status, and comparison data that teaches me interesting things.

### R-117: Encyclopedia Pro System (v38)

- Upgraded encyclopedia with professional-grade filtering:
  - Full-text search across all bird fields.
  - Multi-select continent filter with visual map.
  - Wingspan range slider (0-300cm).
  - Diet type filter with icons.
  - Activity period filter (day/night/dawn-dusk).
  - Rarity filter (common/rare/legendary).
- Sort options: name, wingspan, rarity, continent.
- Results count and active filter indicators.
- Pagination with smooth scroll.

### R-118: Enhanced Bird Entry (v38)

- 3D model preview with orbit controls in entry panel.
- Habitat map: interactive mini-globe showing bird's range.
- Bird call playback with waveform visualization.
- Multiple fun facts (3-5 per bird) displayed as cards.
- Conservation status indicator (if applicable).
- Size comparison: bird silhouette next to human hand/child.
- Related birds section showing similar species.

### AC-V38-1: Bird Encyclopedia Pro

- [ ] Full-text search works across all fields.
- [ ] All filter types functional (continent, wingspan, diet, activity, rarity).
- [ ] Sort options work correctly.
- [ ] 3D model preview with orbit controls.
- [ ] Habitat map shows bird's range.
- [ ] Bird call playback with waveform.
- [ ] Multiple fun facts per bird.
- [ ] 60 FPS maintained.

---

## V39 — Classroom Mode

### US-91: Teacher Controls the Experience (v39)

As a teacher, I can enter Classroom Mode to control the globe experience for my students, triggering specific birds, migration demos, and quiz sessions.

### US-92: Fullscreen Presentation (v39)

As a teacher, I can use a fullscreen presentation mode that hides unnecessary UI and shows only the globe and educational content.

### US-93: Guided Lessons (v39)

As a teacher, I can start guided lesson sequences that walk students through specific topics like "Bird Migration" or "Tropical Birds".

### R-119: Classroom Mode System (v39)

- Teacher mode toggle (password-protected or long-press activation).
- Teacher control panel with:
  - Bird selector: search and highlight specific birds on globe.
  - Migration demo: trigger specific migration route animations.
  - Quiz launcher: start quiz sessions with custom question sets.
  - Region focus: zoom to specific continent/region.
  - Time control: set time of day for day/night demonstration.
  - Weather control: toggle weather effects for teaching.
- Guided lesson system with predefined lesson plans:
  - "Bird Migration" lesson.
  - "Tropical Birds" lesson.
  - "Arctic Survival" lesson.
  - "Bird Anatomy" lesson.
- Each lesson: sequence of steps with narration, bird highlights, quiz questions.

### R-120: Presentation UI (v39)

- Fullscreen presentation mode hiding control panel and sidebar.
- Large, readable text for classroom projection.
- Teacher controls accessible via floating toolbar.
- Student view: clean globe with highlighted content only.
- Presentation mode toggle in teacher panel.
- Font size scaling for projection (1.5x-2x).

### AC-V39-1: Classroom Mode

- [ ] Teacher mode activatable with long-press.
- [ ] Teacher control panel with bird/migration/quiz/region/time/weather controls.
- [ ] Guided lessons available with step sequences.
- [ ] Fullscreen presentation mode works.
- [ ] Large text for projection readability.
- [ ] Teacher controls accessible in presentation mode.
- [ ] 60 FPS maintained in classroom mode.

---

## V40 — Exploration Sandbox

### US-94: Spawn Birds Freely (v40)

As a child, I can tap anywhere on the globe to spawn a bird of my choice, creating my own bird world.

### US-95: Create Custom Flocks (v40)

As a child, I can create flocks of birds that fly together, adjusting their size and speed.

### US-96: Control Time and Weather (v40)

As a child, I can adjust the time of day and toggle weather effects to see how birds behave in different conditions.

### US-97: Free Exploration (v40)

As a child, I have a sandbox where I can experiment freely with birds, time, and weather, encouraging creativity and discovery.

### R-121: Sandbox Mode System (v40)

- Sandbox mode toggle from control panel.
- Bird spawner: tap globe surface to place a bird.
  - Bird type selector (grid of available birds).
  - Spawned birds animate and flock naturally.
  - Maximum 50 spawned birds for performance.
- Flock creator: select multiple spawned birds to form a flock.
  - Adjustable flock speed (slow/medium/fast).
  - Adjustable flock size (tight/loose).
  - Flock follows touch/click point on globe.
- Time control slider: drag to change time of day (0-24h).
  - Real-time lighting updates.
  - Bird activity changes with time.
- Weather toggle panel: enable/disable rain, clouds, storms per region.
- Reset sandbox button to clear all spawned birds.

### R-122: Sandbox UI (v40)

- Sandbox toolbar at bottom of screen.
- Bird spawner palette (scrollable grid of bird icons).
- Time slider with sun/moon icon.
- Weather toggles with icons.
- Flock controls (speed/size sliders).
- "Clear All" button with confirmation.
- Sandbox mode indicator in HUD.
- Glass-morphism styling consistent with design system.

### AC-V40-1: Exploration Sandbox

- [ ] Sandbox mode toggleable from control panel.
- [ ] Tap to spawn birds on globe surface.
- [ ] Bird type selector works.
- [ ] Spawned birds animate naturally.
- [ ] Flock creation works with speed/size controls.
- [ ] Time slider changes lighting and bird activity.
- [ ] Weather toggles work per region.
- [ ] Maximum 50 spawned birds enforced.
- [ ] Reset clears all spawned birds.
- [ ] 60 FPS maintained in sandbox mode.

---

# Version 31 — Discovery & Comparison Learning Layer

This version enhances educational depth by introducing comparison learning, exploration missions, and evolution awareness.

Children learn more effectively when they:

- compare animals
- complete missions
- explore historical evolution

---

## 1. Bird Compare Mode

Allow children to compare two birds side-by-side.

Trigger:
Long press a bird marker
Show option: "Compare With Another Bird"

UI layout example:

```
-----------------------------------------
| Bird A        | Bird B                |
|---------------------------------------|
| 3D Model      | 3D Model              |
| Wingspan      | Wingspan              |
| Weight        | Weight                |
| Habitat       | Habitat               |
| Diet          | Diet                  |
| Flight speed  | Flight speed          |
-----------------------------------------
```

Comparison rules:

Highlight larger value in green.

Example:

Wingspan
Albatross: 3.5m (highlight)
Eagle: 2.3m

Educational goal:
Children visually understand biological differences between species.

---

## 2. Discover Missions

Introduce gamified exploration missions.

Examples:

Find 3 birds that live in rainforests
Discover a bird with wingspan > 2m
Find a nocturnal bird
Locate a bird in Antarctica

Add a new UI button:

🎯 Missions

Mission panel layout:

```
--------------------------------
Mission List

☐ Find a rainforest bird
☐ Discover a nocturnal bird
☐ Find bird with wingspan > 2m

Progress: 1 / 3
--------------------------------
```

When a mission completes show:

🎉 Mission Complete!
+1 Bird Badge

Badges should be stored locally.

---

## 3. Bird Evolution Timeline

Add an evolution timeline slider to illustrate bird evolution.

Timeline example:

150M years ago — Archaeopteryx
60M years ago — Early seabirds
5M years ago — Modern bird groups
Today — Current species

Timeline UI concept:

```
---------------------------------
Evolution Timeline

[-----O----------------------]
150M      60M      5M       Today
---------------------------------
```

When the slider moves:

- highlight birds belonging to that era
- update the information panel

Example info card:

Archaeopteryx
One of the earliest birds
Lived during the Jurassic period

---

## 4. Data Schema Updates

Update bird data structure.

Current fields:

name
scientificName
wingspan
weight
diet
habitat
continent
modelUrl

Add new fields:

era
nocturnal
flightSpeed

---

## 5. UI Improvements

Fix button overlapping issues.

Right side control panel should be a fixed vertical stack.

Example structure:

```
rightPanel
 ├─ search
 ├─ missions
 ├─ encyclopedia
 ├─ settings
```

All buttons must have equal width.

---

## 6. Performance Constraints

Maintain performance targets:

60 FPS rendering
<150MB memory usage
<2s initial load time

3D models must be lazy loaded.

---

### US-98: Compare Birds Side-by-Side (v31)

As a child, I can long-press a bird and select "Compare With Another Bird" to see two birds side-by-side with their stats highlighted.

### US-99: Complete Discovery Missions (v31)

As a child, I can open the Missions panel, see a list of discovery challenges, and earn badges by completing them.

### US-100: Explore Bird Evolution (v31)

As a child, I can drag the evolution timeline slider to see which birds existed in different eras and learn about bird evolution.

### R-123: Bird Compare Mode (v31)

- Long-press bird marker triggers compare option.
- Compare panel shows two birds side-by-side.
- Stats displayed: 3D model, wingspan, weight, habitat, diet, flight speed.
- Larger stat values highlighted in green.
- Panel positioned in modal layer (z-80).
- Glass-morphism styling.
- Close button to exit compare mode.

### R-124: Discover Missions (v31)

- Mission panel accessible from right control panel.
- Predefined discovery missions:
  - Find 3 rainforest birds.
  - Discover a bird with wingspan > 2m.
  - Find a nocturnal bird.
  - Locate a bird in Antarctica.
- Mission progress tracked and persisted in localStorage.
- Completion triggers celebration animation and badge award.
- Badges stored locally.

### R-125: Bird Evolution Timeline (v31)

- Timeline slider component in bottom panel layer.
- Four eras: Mesozoic (150M), Paleogene (60M), Neogene (5M), Quaternary (Today).
- Sliding highlights birds belonging to selected era.
- Info card shows era description and representative bird.
- Smooth slider interaction.

### R-126: Data Schema Updates (v31)

- Add `era` field to Bird type (maps to EvolutionEra).
- Add `nocturnal` field (boolean, derived from activityPeriod).
- Add `flightSpeed` field (number, km/h).
- Update birds.json with new fields for all birds.

### R-127: UI Layout Fix (v31)

- Right control panel uses fixed vertical stack layout.
- All buttons equal width.
- No overlapping at any viewport size.
- Scrollable when buttons exceed viewport height.

### AC-V31-2: Discovery & Comparison Learning Layer

- [ ] Bird Compare Mode shows two birds side-by-side.
- [ ] Stats highlight differences (green for larger).
- [ ] Discovery missions display with progress tracking.
- [ ] Mission completion triggers celebration and badge.
- [ ] Evolution timeline slider changes bird highlights.
- [ ] Era info card displays correctly.
- [ ] New data fields (era, nocturnal, flightSpeed) present on birds.
- [ ] Right panel layout fixed with no overlapping.
- [ ] 60 FPS maintained.
- [ ] <150MB memory usage.
- [ ] <2s initial load time.

---

# Version 32 — Intelligent Discovery Systems

Major features introduced:

1. AI Bird Guide 2.0 (RAG-based answer system)
2. Bird Sound Recognition
3. Global Migration Simulation
4. Habitat Ecosystem Interaction
5. Bird Size Comparison Mode
6. Data Expansion to 100 birds

## AI Bird Guide 2.0

Upgrade the existing Bird Guide to support intelligent question answering.

Children can ask questions such as:

- "Why do birds migrate?"
- "Which bird flies the farthest?"
- "Why are flamingos pink?"

### System Design

**BirdGuideService** enhanced with multi-source RAG pipeline.

Data sources:

- Bird encyclopedia data (`birds.json`)
- Prewritten knowledge snippets (`bird-knowledge.json`, `bird_facts.json`)
- Migration data (`migrations.json`)
- Habitat data (bird `habitatType` fields)

Architecture:

```
Question → semantic match → knowledge answer → spoken response
```

Example flow:

- Child asks: "Why do birds migrate?"
- AI guide response: "Some birds migrate to find food and warmer weather. For example, the Arctic Tern travels from the Arctic to Antarctica every year."

### UI

- Floating guide bubble (existing `AIBirdGuidePanel.tsx` enhanced).
- Guide avatar: owl character.
- Voice narration using Web Speech API.

### R-128: AI Bird Guide 2.0 (v32)

- BirdGuideService upgraded with multi-source semantic matching.
- Knowledge base expanded with migration and habitat context.
- Voice narration via Web Speech API on answers.
- Owl avatar with floating animation.
- Suggested question prompts context-aware per bird.

## Bird Sound Recognition

Allow children to identify birds by sound.

### UI

Button: "Identify Bird Sound" in right control panel.

### Workflow

1. Record short audio via MediaRecorder API.
2. Extract basic audio fingerprint (frequency analysis via Web Audio API).
3. Compare with stored bird sound frequency profiles.
4. Return likely bird match.

### Fallback

If recognition fails, show: "That sound is similar to a sparrow or finch."

### Educational Goal

Teach kids to recognize birds by their calls.

### R-129: Bird Sound Recognition (v32)

- SoundRecognitionSystem created at `/src/systems/SoundRecognitionSystem.ts`.
- Records audio via MediaRecorder API.
- Extracts frequency fingerprint via Web Audio API AnalyserNode.
- Matches against stored bird sound frequency profiles.
- Returns top match with confidence score.
- Fallback message when confidence is low.
- UI button in right control panel.
- Result panel shows matched bird with "Listen to this bird" action.

## Global Migration Simulation

Replace static migration lines with animated seasonal migration behavior.

### Simulation Features

Seasonal cycles:

- Spring: migration north
- Autumn: migration south
- Summer/Winter: birds at destination

Bird flocks travel along routes gradually based on current season.

### Migration Routes

- Arctic Tern (Arctic ↔ Antarctic)
- Bar-tailed Godwit (Alaska ↔ New Zealand)
- Barn Swallow (Europe ↔ Africa)
- Whooping Crane (Canada ↔ Texas)

### Visualization

- Glowing curved path with seasonal direction.
- Moving bird icons along path with progress tied to season.
- Particle trails behind moving birds.
- Season indicator on migration panel.

### R-130: Global Migration Simulation (v32)

- MigrationSystem upgraded with seasonal state.
- Migration progress computed from current ecosystem season.
- Spring: birds travel north (progress 0→1 on northbound leg).
- Autumn: birds travel south (progress 0→1 on southbound leg).
- Summer/Winter: birds stationary at destination.
- MigrationPaths.tsx updated with season-aware animation.
- Bird icons position interpolated by seasonal progress.
- Particle trail effect behind moving birds.

## Habitat Ecosystem Interaction

Bird behavior reacts to ecosystem state.

### Global Environment Parameters

- Temperature
- Season
- Time of Day
- Wind

### Behavior Rules

- Rainforest birds more active during day.
- Owls appear only at night.
- Migratory birds appear during migration seasons.
- Activity density varies with temperature.

### UI Panel

"Ecosystem Simulation" panel with sliders:

- Season (Spring / Summer / Autumn / Winter)
- Temperature (-10°C to 40°C)
- Time of Day (Dawn / Morning / Afternoon / Dusk / Night)

Changing environment updates bird activity on the globe.

### R-131: Habitat Ecosystem Interaction (v32)

- EcosystemSystem upgraded with manual override sliders.
- New `EcosystemPanel.tsx` component with Season, Temperature, Time of Day controls.
- Bird visibility filtered by ecosystem state:
  - Nocturnal birds visible only at night/dusk.
  - Migratory birds visible only during spring/autumn.
  - Activity density scaled by temperature.
- Store state: `ecosystemPanelOpen`, `ecosystemManualOverride`.

## Bird Size Comparison Mode

Children can compare two birds visually with accurate size scaling.

### Display

- Two bird images side-by-side.
- Scaled proportionally by wingspan.
- Stats panel: wingspan, weight, flight speed.
- Differences highlighted in green.

### R-132: Bird Size Comparison Mode (v32)

- BirdComparePanel upgraded with proportional size visualization.
- Bird images scaled relative to each other by wingspanCm.
- Lifespan stat row added.
- Visual size bar showing relative wingspan proportion.

## Data Expansion

Expand bird dataset from 53 → 100 birds.

### New Birds From

- South America (15 new)
- Africa (12 new)
- Oceania (10 new)
- Arctic/Antarctic regions (5 new)
- Additional Asia/Europe/Americas (5 new)

### Each Entry Includes

- name (nameZh, nameEn)
- scientificName
- habitat (habitatType)
- diet
- wingspan (wingspanCm)
- lifespan
- sound (soundUrl/soundPath)
- model (modelPath)
- migration flag
- rarity
- All existing required fields (lat, lng, region, photoUrl, etc.)

### R-133: Data Expansion to 100 Birds (v32)

- birds.json expanded from 53 to 100 entries.
- New birds span South America, Africa, Oceania, Arctic regions.
- All entries include complete field set matching Bird interface.
- Knowledge base entries added for new birds.

## Performance Targets

### R-134: Performance Maintenance (v32)

- 60 FPS target maintained.
- Max 20 active 3D birds rendered simultaneously.
- Lazy loading for bird models.
- Audio files loaded on demand.
- Bird data filtered before rendering based on ecosystem state.

### AC-V32: Intelligent Discovery Systems

- [ ] AI Bird Guide answers simple bird questions with multi-source matching.
- [ ] Voice narration plays answer text via Web Speech API.
- [ ] Sound recognition records audio and returns likely bird match.
- [ ] Sound recognition fallback message displays on low confidence.
- [ ] Migration routes animate seasonally (spring north, autumn south).
- [ ] Migration bird icons move along routes based on season.
- [ ] Ecosystem sliders change bird activity on globe.
- [ ] Nocturnal birds hidden during day, visible at night.
- [ ] Bird comparison mode displays two birds with proportional sizing.
- [ ] Comparison stats highlight larger values in green.
- [ ] Dataset expanded to 100 birds.
- [ ] New birds include all required fields.
- [ ] Build succeeds without errors.
- [ ] 60 FPS maintained.
- [ ] <150MB memory usage.
- [ ] <2s initial load time.

---

# Version 33 — UI Architecture Upgrade

This version introduces a redesigned interface to improve usability for children while preserving scientific clarity.

Major improvements:

1. Simplified Control System
2. Collapsible Information Cards
3. Migration Route Visualization
4. Contextual Tool Panels
5. Scientific HUD Design
6. Interactive Habitat Highlight

## 1. Simplified Control System

### R-135: Three-Mode Control Panel (v33)

The current right-side control bar contains too many buttons. Replace the long button list with three primary modes:

- **Explore** — Discover birds, Migration routes, Habitat map
- **Learn** — Encyclopedia, Bird comparison, Evolution timeline
- **Play** — Missions, Sound recognition, Quiz

UI Layout:

- RightPanel contains a Mode Selector (3 buttons) and a Context Panel (dynamic tools).
- When mode = Explore: show Migration, Habitats, Regions tools.
- When mode = Learn: show Compare, Encyclopedia, Timeline tools.
- When mode = Play: show Missions, Sound ID, Quiz tools.
- Additional utility actions (Screenshot, Share, Reset) remain accessible in all modes.

## 2. Collapsible Bird Info Card

### R-136: Compact/Expanded Bird Card (v33)

Current information panel blocks too much screen space. Introduce two states:

- **Compact Mode**: Small card with bird name, image, quick stats. Max height 160px.
- **Expanded Mode**: Full encyclopedia card with habitat, diet, lifespan, wingspan, facts.
- Interaction: tap arrow icon to expand/collapse.

## 3. Migration Route Visualization

### R-137: Animated Migration Arcs (v33)

Current migration path uses translucent shapes. Replace with animated migration arcs:

- Curved arc above the globe.
- Animated bird icons moving along route.
- Particle trails.
- Distance labels.

Example: Arctic Tern — Arctic to Antarctica — 40,000 km.

## 4. Scientific HUD Design

### R-138: Science HUD Overlay (v33)

Introduce a minimal science HUD. Top-left overlay showing globe information:

- Latitude
- Longitude
- Biome
- Temperature
- Season

Example: Latitude: 48°N, Biome: Boreal Forest, Season: Spring.

## 5. Interactive Habitat Highlight

### R-139: Bird Habitat Region Highlight (v33)

Allow children to highlight bird habitats. When selecting a bird, highlight its natural habitat region on globe.

Example: Flamingo — highlight wetlands, lakes, salt flats.

Visualization: soft glowing region overlay.

## 6. UI Visual Consistency

### R-140: Space Science Interface Design (v33)

Unify UI style with globe visuals. Design language: space science interface.

Elements:

- Dark translucent panels
- Soft glowing borders
- Thin line icons
- NASA-style typography

## 7. Performance Constraints

### R-141: Performance Maintenance (v33)

- 60 FPS rendering target maintained.
- <150MB memory usage.
- Max 25 active birds on globe.

### AC-V33: UI Architecture Upgrade

- [ ] Right side panel shows only 3 modes (Explore, Learn, Play).
- [ ] Mode switching updates tool panel dynamically.
- [ ] Bird card supports compact and expanded modes.
- [ ] Migration routes display animated arcs with particle trails.
- [ ] Habitat regions highlight correctly when bird selected.
- [ ] HUD shows latitude, biome, season, temperature.
- [ ] UI uses consistent dark translucent space-science design.
- [ ] Build succeeds without errors.
- [ ] 60 FPS maintained.
- [ ] <150MB memory usage.

---

# Feature Specification — V34: Migration Journey System

## Problem

Current app interaction is passive. Users click birds but lack motivation to explore further. Birds appear isolated without ecological context — there is no sense of journey or seasonal movement.

Children learn better through:

- Journeys and narrative progression
- Discovery and surprise
- Rewards and collectible systems

## Goal

Create an exploration gameplay loop using real bird migration routes. Children follow seasonal journeys across the globe, discover birds at each stop, unlock facts, and earn badges upon completion.

## Gameplay Loop

```
Choose Migration Journey
→ Follow route on globe
→ Discover birds at each stop
→ Unlock bird facts
→ Complete journey
→ Earn badge
```

---

## R-142: Migration Journey Data Model (v34)

Each journey represents a real-world migration route with multiple geographic stops.

Example — Arctic Tern Journey:

| Stop | Location                    |
| ---- | --------------------------- |
| 1    | Greenland (72°N, -40°W)     |
| 2    | United Kingdom (54°N, -2°W) |
| 3    | Morocco (32°N, -5°W)        |
| 4    | South Africa (-34°S, 18°E)  |
| 5    | Antarctica (-75°S, 0°E)     |

Each stop contains:

- `latitude` / `longitude`
- `name` (zh/en)
- `birdIds` — birds discoverable at that stop
- `season` — which seasons this stop is active

---

## R-143: Migration Journey UI Panel (v34)

Add a "Migration Journeys" button to the Explore mode tool panel.

Clicking opens a journey selection panel listing available journeys:

- Arctic Tern Journey
- Swan Migration
- Pacific Flyway
- Amazon Rainforest Loop

Each journey card shows:

- Journey name
- Number of stops
- Completion progress
- Badge earned (if completed)

---

## R-144: Journey Route Visualization (v34)

When a journey is active:

- Render the full route as a glowing CatmullRomCurve3 path on the globe
- Show stop markers at each waypoint (clickable)
- Animate a bird icon moving along the path
- Camera follows the route when "auto-follow" is enabled

Clicking a stop marker:

- Zooms camera to that region
- Shows birds located at that stop
- Allows discovery of new birds

---

## R-145: Bird Discovery System (v34)

When the user discovers a new bird at a journey stop:

- Show animated notification: "✨ New Bird Discovered!"
- Bird is added to the collection
- Journey progress updates
- Discovery count increments

---

## R-146: Bird Collection Panel Enhancement (v34)

Enhance the existing My Birds panel:

- Show discovery progress: "Discovered: 18 / 120"
- Grid of bird cards
- Locked/undiscovered birds appear as silhouette with "?" overlay
- Filter by journey, region, or rarity

---

## R-147: Season Selector System (v34)

Add a season selector in the top-right corner of the UI.

Options:

- 🌸 Spring
- ☀️ Summer
- 🍂 Autumn
- ❄️ Winter

Changing season updates:

- Active migration routes (some routes only active in certain seasons)
- Bird availability at stops
- Visual atmosphere on globe

---

## R-148: Journey Completion & Badges (v34)

When all stops in a journey are visited and all required birds discovered:

- Show completion animation
- Award journey badge
- Badge appears in collection panel

---

## R-149: Migration LOD Performance (v34)

Migration routes support Level of Detail:

- Camera far (distance > 3.0): Hide animated birds, show only glowing line
- Camera close (distance < 3.0): Enable bird animation and stop markers
- Maximum 4 active journey routes rendered simultaneously

---

### AC-V34: Migration Journey System

- [ ] Migration journey data model with stops, birds, and seasons.
- [ ] Journey selection panel accessible from Explore mode.
- [ ] Journey routes render as glowing animated paths on globe.
- [ ] Stop markers are clickable and zoom camera to region.
- [ ] Bird discovery notification shows on new bird found.
- [ ] Bird collection panel shows progress with silhouette for locked birds.
- [ ] Season selector changes migration route availability.
- [ ] Journey completion awards badge.
- [ ] LOD hides bird animation when camera is far.
- [ ] Build succeeds without errors.
- [ ] 60 FPS maintained.
- [ ] <150MB memory usage.

---

## R-150: Smart Continent Label System (v35-labels)

Continent and ocean labels must behave like physical markers attached to the globe surface.

### Backside Occlusion

Labels must be hidden when the continent they represent is on the back side of the globe relative to the camera.

Detection method:

- Convert each label's lat/lng position to a normalized 3D vector on the unit sphere.
- Compute the camera direction vector (normalized camera position, since the globe is at origin).
- Calculate `dot = positionVector.dot(cameraDirection)`.
- If `dot < 0`, the label is on the back side. Set `visible = false`.

### Horizon Fade

Even when a label is technically on the front side, labels near the globe's horizon edge should fade out smoothly.

Thresholds:

- `dot < 0` → fully hidden
- `dot < 0.15` → fading zone
- `dot >= 0.15` → fully visible

Opacity formula:

```
opacity = clamp((dot - 0.05) / 0.2, 0, 1)
```

This creates a smooth gradient from invisible to visible near the globe edge.

### Zoom-Level LOD (Level of Detail)

When the camera is zoomed out, reduce label density to prevent visual clutter.

Camera distance thresholds:

- `distance > 4.0` → hide all labels
- `distance > 3.0` → show only major continents: North America, Europe, Asia
- `distance <= 3.0` → show all labels (current behavior)

### Distance-Based Label Scaling

Label size must scale with camera distance for consistent visual weight.

Scale formula:

```
scale = clamp(2 / distance, 0.6, 1.4)
```

Applied to the label container transform.

---

### AC-V35-labels: Smart Continent Label System

- [ ] Labels hidden when continent is behind the globe.
- [ ] Labels fade smoothly near the globe horizon.
- [ ] Labels reduce density when zoomed out (LOD thresholds).
- [ ] Label size scales with camera distance.
- [ ] Build succeeds without errors.
- [ ] 60 FPS maintained.

---

# V33 — AI Bird Guide

## Overview

V33 introduces a multi-layer knowledge system that generates kid-friendly bird explanations on click. The architecture enforces strict separation: UI never calls AI directly. All knowledge flows through a `KnowledgeService` that queries three layers in order:

| Layer | Source                                                 | Latency    | Offline |
| ----- | ------------------------------------------------------ | ---------- | ------- |
| L1    | Static bird data (`birds.json`, `bird-knowledge.json`) | 0ms        | Yes     |
| L2    | Local cache (`localStorage`)                           | 0ms        | Yes     |
| L3    | Remote AI provider (OpenAI)                            | 200-2000ms | No      |

Query order: L1 → L2 → L3. Each bird triggers AI at most once; results are cached in L2 for all future lookups.

## System Architecture

```
┌─────────────────────────────────────────────────┐
│  UI Layer (AIBirdGuidePanel)                     │
│  - Click bird → request explanation              │
│  - Display answer with typing animation          │
│  - TTS playback button                           │
│                                                  │
│  ↕ store actions only                            │
├─────────────────────────────────────────────────┤
│  KnowledgeService                                │
│  - queryBirdExplanation(birdId, lang)            │
│  - Orchestrates L1 → L2 → L3 fallback           │
│  - Returns { text, source }                      │
│                                                  │
│  ↕ delegates to layers                           │
├─────────────────────────────────────────────────┤
│  L1: StaticKnowledge                             │
│  - birds.json fields → template rendering        │
│  - bird-knowledge.json pattern matching          │
│                                                  │
│  L2: KnowledgeCache                              │
│  - localStorage keyed by birdId+lang             │
│  - Persisted across sessions                     │
│                                                  │
│  L3: AIProvider                                  │
│  - Abstract interface                            │
│  - OpenAIProvider implementation                 │
│  - Uses PromptTemplate (no hardcoded prompts)    │
└─────────────────────────────────────────────────┘
```

## KnowledgeService

Single entry point for all bird knowledge queries. Never called from UI directly — only through store actions.

```typescript
interface KnowledgeResult {
  text: string;
  textZh: string;
  source: "static" | "cache" | "ai";
}

function queryBirdExplanation(birdId: string): Promise<KnowledgeResult>;
```

Query flow:

1. Check L1 (static data). If a rich explanation exists, return it.
2. Check L2 (cache). If a cached AI result exists for this birdId, return it.
3. Call L3 (AI provider). If API key present, generate explanation, cache in L2, return it.
4. If L3 fails or no API key, return L1 fallback.

## PromptTemplate System

All prompts are defined as named templates in a registry. No string literals in service code.

```typescript
interface PromptTemplate {
  id: string;
  system: string;
  user: string; // supports {{birdName}}, {{habitat}}, {{funFact}} etc.
}
```

Templates:

- `bird-explain`: Generate a short (≤100 words) kid-friendly explanation of a bird.
- `bird-explain-zh`: Same but in Simplified Chinese.

Template variables are interpolated from bird data at runtime.

## AIProvider Abstraction

```typescript
interface AIProvider {
  id: string;
  generate(systemPrompt: string, userPrompt: string): Promise<string | null>;
  isAvailable(): boolean;
}
```

Implementations:

- `OpenAIProvider`: Uses `VITE_OPENAI_API_KEY`, calls `gpt-4o-mini`.
- Future providers can be added without changing KnowledgeService.

## KnowledgeCache

localStorage-backed cache keyed by `bird-guide-cache-{birdId}`.

```typescript
interface CachedExplanation {
  text: string;
  textZh: string;
  timestamp: number;
}
```

- Max 200 entries. LRU eviction when full.
- Each bird triggers AI at most once (cache-first).

## TTS Playback

Web Speech API integration for reading explanations aloud.

```typescript
interface TTSState {
  status: "idle" | "speaking" | "unavailable";
}
```

- Uses `SpeechSynthesisUtterance` with rate 0.9.
- Language matches current app language.
- Cancel on panel close or new request.

## UI: Click Bird → Explanation

When a bird is clicked:

1. `BirdInfoCard` shows a "Tell me about this bird!" button.
2. Button dispatches `requestBirdExplanation(birdId)` store action.
3. Store calls `KnowledgeService.queryBirdExplanation(birdId)`.
4. Result displayed in `AIBirdGuidePanel` with typing animation.
5. TTS button appears after typing completes.

## Constraints

- Each bird triggers AI at most once (enforced by L2 cache).
- Explanations must be ≤100 words and kid-friendly.
- Must support offline mode (L1 always available).
- No hardcoded prompts (all via PromptTemplate registry).
- No direct API calls in UI components.
- Clear layering: UI → Store → KnowledgeService → Layers.

### AC-V33-guide: AI Bird Guide

- [ ] Click bird generates kid-friendly explanation (≤100 words).
- [ ] KnowledgeService queries L1 → L2 → L3 in order.
- [ ] AI called at most once per bird (cache enforced).
- [ ] PromptTemplate system used (no hardcoded prompts).
- [ ] AIProvider abstraction layer present.
- [ ] TTS playback works via Web Speech API.
- [ ] Offline mode works (L1 static data).
- [ ] No direct API calls in UI components.
- [ ] Build succeeds without TypeScript errors.
- [ ] 60 FPS maintained.

---

## V33 Upgrade — AI Bird Guide + Mode-Driven HUD Refactor

> **v33 changelog**: Introduces `AppMode` type system (`"explore" | "migration" | "learning"`) replacing the existing `UIMode`. All UI panels render conditionally based on `AppMode`. Removes duplicated feature entry points. Hardens the 3-layer Knowledge System (L1 static → L2 cache → L3 AI). Enforces strict service-layer architecture: UI never calls AI directly. Globe remains dominant at ≥70% viewport.

### Overview

V33 is a combined AI Bird Guide + UI architecture refactor:

1. **Replaces `UIMode` with `AppMode`** — a strict 3-mode system controlling all UI visibility.
2. **Hardens the Knowledge System** — enforces L1→L2→L3 query pipeline with error boundaries.
3. **Refactors UI into Mode-Driven HUD** — each panel declares which modes it belongs to.
4. **Removes duplicated feature entry points** — consolidates into mode-specific tool groups.

### AppMode (replaces UIMode)

```typescript
type AppMode = "explore" | "migration" | "learning";
```

| Mode | Purpose | Visible Panels |
|------|---------|----------------|
| `explore` | Default globe exploration | BirdInfoCard, AIBirdGuidePanel, RegionFilter, Habitats, Heatmap, Weather, Ecosystem, Journeys |
| `migration` | Migration-focused view | TimelinePanel, MigrationInfoCard, MigrationPaths, SeasonOverlay, FlockRenderer |
| `learning` | Educational content | Encyclopedia, EvolutionTimeline, BirdCompare, LearningTracks, DiscoverMissions, Classroom |

### Mode Visibility Configuration

```typescript
const MODE_VISIBILITY: Record<string, AppMode[]> = {
  BirdInfoCard:        ["explore", "learning"],
  AIBirdGuidePanel:    ["explore", "learning"],
  RegionFilterPanel:   ["explore"],
  MainModePanel:       ["explore", "migration", "learning"],
  ScienceHUD:          ["explore", "learning"],
  SeasonSelector:      ["explore", "migration"],
  TimelinePanel:       ["migration"],
  MigrationInfoCard:   ["migration"],
  BottomDiscoveryPanel:["explore"],
  GuidedTour:          ["explore"],
  QuizPanel:           ["explore"],
  SoundGuessPanel:     ["explore"],
  EvolutionTimeline:   ["learning"],
  BirdEncyclopedia:    ["learning"],
  BirdComparePanel:    ["learning"],
  TrackPanel:          ["learning"],
  DiscoverMissions:    ["learning"],
  ClassroomPanel:      ["learning"],
  EcosystemPanel:      ["explore"],
  MigrationJourney:    ["explore", "migration"],
};
```

### Knowledge System (3-Layer Pipeline)

```
L1: Static Data (always available)
    ├── Bird model fields (funFact, habitat, diet, region)
    └── AIGuideSystem knowledge base (pattern-matched Q&A)

L2: Persistent Cache (localStorage LRU, max 200 entries)
    └── Key: bird-guide-cache-{birdId}

L3: Remote AI Provider (OpenAI gpt-4o-mini)
    └── Guarded by API key check, JSON response { text, textZh }
```

Query order: L2 cache → L3 AI → L1 static fallback.

### Service Layer Rules

1. UI MUST NOT call AI directly — all through KnowledgeService.
2. Store actions are the only bridge between UI and services.
3. KnowledgeService orchestrates L1/L2/L3.
4. AIProvider is swappable without touching KnowledgeService.
5. PromptTemplate registry — no hardcoded prompts.

### Globe Dominance Rule

- Globe canvas ≥70% viewport at all times.
- Panels are overlays, not side-by-side.
- No panel exceeds 400px width or 50% viewport height.

### Offline Fallback

1. L2 cache checked first (may have previous AI results).
2. L1 static data always available.
3. Source badge: "Local" / "Cached" / "AI".
4. No error modals — graceful degradation.

### AC-V33-mode: Mode-Driven HUD

- [ ] `AppMode` type replaces `UIMode` in types.ts.
- [ ] Store uses `appMode` instead of `uiMode`.
- [ ] Mode selector shows 3 modes: Explore, Migration, Learning.
- [ ] Each panel only renders when current mode is in its allowed modes list.
- [ ] Globe occupies ≥70% viewport in all modes.
- [ ] No duplicated feature entry points across modes.
- [ ] Mode switch animates panels in/out smoothly.
- [ ] Build succeeds without TypeScript errors.
- [ ] 60 FPS maintained during mode transitions.
