# 万羽拾音 (Kids Bird Globe) — Implementation Plan (v32)

> **v32 changelog**: Bird Migration Intelligence — centralized TimeController, animation scheduler, InstancedMesh flock rendering, spherical interpolation migration paths, season visual system, learning interaction, timeline UI.

---

## V32 Architecture Design

### Core Principle: TimeController as Single Source of Truth

All time-dependent behavior derives from a single `TimeState` object managed by `TimeController`. No component maintains its own animation clock.

```
TimeController (Zustand)
    ├── AnimationScheduler (single useFrame)
    │   ├── MigrationFlockSystem (reads TimeState, updates InstancedMesh matrices)
    │   ├── MigrationPathRenderer (reads TimeState, updates path visibility/gradient)
    │   └── SeasonVisualSystem (reads TimeState, updates hemisphere tint uniforms)
    └── TimelineUI (writes TimeState via actions)
```

### Module Structure

```
src/core/
  TimeController.ts        — TimeState store slice, tick(), play/pause/scrub actions
  AnimationScheduler.tsx   — Single useFrame driving all animation systems

src/domain/
  migration-paths.ts       — MigrationPath data model, path computation
  flock-config.ts          — FlockConfig generation from migration data

src/render/
  MigrationPathRenderer.tsx — CatmullRomCurve3 path rendering with gradient shader
  MigrationFlockRenderer.tsx — InstancedMesh flock with per-instance offsets
  SeasonOverlay.tsx         — Shader-based hemisphere season tinting

src/ui/
  TimelinePanel.tsx         — Month scrubber, play/pause, speed control
  MigrationInfoCard.tsx     — Bird migration info on click
```

### Animation Pipeline

1. **Each frame:** `AnimationScheduler.useFrame(delta)` fires
2. **TimeController.tick(delta):** Updates `month` and `progress` based on `speed` and `isPlaying`
3. **MigrationFlockSystem:** Reads `progress`, computes position on CatmullRomCurve3, updates InstancedMesh matrices
4. **MigrationPathRenderer:** Reads `month`, shows/hides paths based on season, updates gradient uniform
5. **SeasonVisualSystem:** Reads `month`, interpolates hemisphere tint colors

### Performance Strategy

1. **InstancedMesh:** One mesh per species, 3–8 instances. Single draw call per species.
2. **Shared geometry/material:** All instances of a species share ConeGeometry + MeshStandardMaterial.
3. **Batch matrix updates:** Set all instance matrices in one loop, then `instanceMatrix.needsUpdate = true`.
4. **No per-frame allocations:** Reuse Vector3/Matrix4/Quaternion objects via refs.
5. **CatmullRomCurve3 caching:** Compute curves once, sample via `getPointAt(t)`.
6. **Shader uniforms:** Season tinting via uniform updates, no texture swaps.

### Integration Points

- `TimeController` added as Zustand store slice alongside existing store
- `AnimationScheduler` component added to `GlobeScene.tsx`
- `MigrationPathRenderer` and `MigrationFlockRenderer` added to globe group
- `SeasonOverlay` wraps globe mesh
- `TimelinePanel` added to App.tsx sidebar layer
- `MigrationInfoCard` added to App.tsx card layer
- Click handler on flock instances calls `TimeController.pause()` and shows info card

### Data Flow

```
migration-journeys.json → MigrationPath[] → CatmullRomCurve3[]
                                          → FlockConfig[]
                                          → MigrationPathRenderer (3D paths)
                                          → MigrationFlockRenderer (InstancedMesh birds)

TimeState.month → SeasonOverlay (tint uniforms)
               → MigrationPathRenderer (path visibility)
               → TimelinePanel (UI state)
```

---

# 万羽拾音 (Kids Bird Globe) — Implementation Plan (v31)

> **v31 changelog**: Structured Learning Experience — LearningTrackSystem with themed bird discovery journeys and badge rewards, upgraded BirdGuideService with RAG-like architecture (PromptBuilder + ResponseRenderer) and bird_facts.json fallback, EcosystemSystem with seasonal world state (season/temperature/wind/timeOfDay) influencing bird density and migration, HabitatFilter sidebar toggle for 6 habitat types, SeasonController managing season transitions, MigrationVisualizer with glowing arcs and directional particles tied to ecosystem seasons, BirdDataLoader with lazy regional JSON loading.
>
> **v30 changelog**: Educational Layer — Bird Encyclopedia panel with search/filter (continent, diet, wingspan), detailed bird entries with 3D model preview/habitat map/sound/facts, performance monitoring overlay, dynamic LOD tuning based on FPS, progressive asset preloading with priority queue, texture compression pipeline with KTX2/Basis support.
>
> **v29 changelog**: Shareable Discoveries — screenshot capture via canvas toDataURL with flash animation and browser download, share card generator rendering bird info to off-screen canvas (600x400px), progress export as JSON with all discovery/achievement/expedition data, share UI panel with recent captures and download options.
>
> **v28 changelog**: Story Mode — story data structure with location sequences and narration, three predefined stories (Arctic Tern Journey, Rainforest Guardians, African Savannah Birds), camera auto-travel between story locations with cinematic zoom, Web Speech API narration per step, story panel UI with selection/progress/controls, featured bird highlighting with golden glow, story completion badges.
>
> **v27 changelog**: Flocking System — simplified boids algorithm (separation, alignment, cohesion) replacing static bird positions, species-specific flock parameters (flockSize, speed, altitudeRange, wanderRadius), GPU-friendly InstancedMesh rendering for flock members, spatial hashing for neighbor lookups, throttled computation for distant flocks, maximum 8 active flocks.
>
> **v26 changelog**: Dynamic World Simulation — enhanced day/night cycle with configurable sun rotation speed, city lights texture with smooth per-fragment fade, weather zone system with cloud clusters/rain particles/storm visuals per region, bird activity variation (diurnal/nocturnal/crepuscular) based on sun angle at bird position, nocturnal bird eye-glow shader, time-of-day HUD indicator, weather toggle button.
>
> **v25 changelog**: Exploration Experience — ExpeditionSystem.ts for structured mission lifecycle, MissionPanel.tsx with available/active/completed mission states, ProgressPanel.tsx for expedition completion tracking, completion celebration with confetti burst and badge reveal animation, expedition data persisted in localStorage, integrated with existing discovery and achievement systems.
>
> **v24 changelog**: Visual Polish — enhanced AtmosphereShell with animated two-layer Fresnel glow, CloudLayer with independent slow rotation for parallax, directional sun light with shadow casting, soft shadow projection for bird markers (512x512 shadow map), improved marker visuals with rarity-based glow colors and animated pulse rings, camera inertia via OrbitControls damping (factor 0.92) for fluid exploration.
>
> **v23 changelog**: Performance Optimization — model LOD system in BirdSystem (high-poly < 3 units, simplified mesh >= 3 units), lazy loading via Suspense boundaries loading models on-demand, InstancedMesh for distant bird markers reducing draw calls to O(1), render loop optimization with throttled distance calculations every 10 frames, verified 60 FPS on mid-range hardware.
>
> **v22 changelog**: Content Expansion — expanded birds.json to 30 fully-detailed birds across 7 regions, each with name/continent/habitat/diet/wingspan/funFact/modelPath/soundPath, added RegionCluster component showing bird count per region on globe, cluster click triggers region filter and camera zoom.
>
> **v21 changelog**: Architecture Refactor — created /src/core/ (Engine.ts, SceneManager.ts, CameraController.ts), /src/systems/ (BirdSystem.ts, MigrationSystem.ts, QuizSystem.ts, AudioSystem.ts, AchievementSystem.ts), refactored existing components to use system modules, barrel exports in each directory, separated data from logic, maintained all existing functionality.
>
> **v20 changelog**: Asset Quality & Exploration Upgrade — rebuilt build-bird-assets.mjs with improved bird geometry (better silhouettes, species-specific features, proper proportions), improved BirdMarker to render full GLB scene clones with original materials, enhanced idle animation with dual-layer wing flap + floating system, improved marker hover/click feedback, strengthened UI z-index hierarchy and spacing tokens, improved globe visuals (higher-res sphere, better clouds, refined atmosphere), improved camera fly-to (1s smoothstep + orbit), enhanced discovery notification with counter, improved BirdInfoCard layout margins, added model preloading, maintained Draco compression.
>
> **v19 changelog**: High-Quality Bird Models Upgrade — removed all procedurally generated bird geometry and the generate-bird-models.mjs script, established proper GLB asset pipeline, integrated 12 high-quality stylized low-poly bird models loaded via useGLTF with DRACOLoader support, added bounding-box normalization (1-unit scale), idle animation system (wing flap + floating sine wave), improved markers with glow ring and hover effects, enhanced discovery interaction with progress tracking, fixed UI z-index layering, added safe layout margins, improved camera fly-to, enabled Draco compression.
>
> **v18 changelog**: Stability & Core Experience — fixed critical UI overlap (sidebar covering info cards) by enforcing z-index hierarchy and adding sidebar collision avoidance with opacity/shift, replaced unrealistic bird geometry with stylized low-poly procedural bird model with wing-flap animation, improved marker visuals with glowing base circle, enhanced info card with section titles and 200px left margin, improved camera fly-to (~1s), added discovery glow pulse, enforced consistent spacing tokens and safe margins across all UI.
>
> **v17 changelog**: Game-Like Exploration Polish — enhanced daily mission panel with continent progress mini-bars and animated completion badges, bird photo mode upgraded with full-screen photo overlay including zoom slider and rotation controls, bird encyclopedia improved with continent section grouping and search filter, explorer achievement system enhanced with progress bars showing requirement completion percentage, discovery celebration upgraded with layered confetti + sparkle + glow pulse animation, bottom discovery panel now shows continent-level progress bars with color-coded regions, bird hint system improved with proximity-based pulse intensity, exploration encouragement messages now rotate through suggestions, performance verified with all v17 features active at 60 FPS.
>
> **v16 changelog**: Game-Like Exploration Upgrade — daily bird discovery mission system with progress tracking and celebration animations, bird photo mode with camera freeze / zoom / rotate and local photo gallery, enhanced bird encyclopedia with discovered/locked entries and progress indicator, explorer achievement system with badges (First Discovery, Explorer, World Traveler, Bird Listener, Photographer, Mission Master), improved discovery celebration with confetti burst and sparkle particles, continent exploration progress with hint animations and exploration encouragement messages, performance optimization with lazy loading for photos/models/sounds.
>
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

## Key Technical Decisions (v20)

### TD-128: Improved Bird Model Geometry
**Problem**: The build-bird-assets.mjs script produces bird models with basic primitive shapes that look like chickens. Wings are flat boxes, bodies are simple spheres, and species-specific features are minimal.
**Solution**: Rebuild all 12 bird models in build-bird-assets.mjs with significantly improved geometry. Each bird gets more anatomically accurate proportions, better wing shapes (curved, tapered), proper body contours, and enhanced species-specific features (eagle's hooked beak and broad wings, owl's facial disc and ear tufts, flamingo's S-curved neck and long legs, etc.). All models remain under 2000 triangles and fit within a 1-unit bounding box.

### TD-129: Full Scene Clone Rendering
**Problem**: BirdMarker extracts only the first mesh geometry from GLB files, losing multi-mesh models and embedded materials. All birds render with the same orange MeshStandardMaterial.
**Solution**: Modify BirdMarker to clone the entire normalized GLB scene and render it as a group using `<primitive object={scene}>`. This preserves the original materials, colors, and multi-mesh structure from the GLB files. The scene is normalized to fit within a 1-unit bounding box on load.

### TD-130: Enhanced Idle Animation System
**Problem**: Bird idle animations need to feel more natural with smooth, layered motion.
**Solution**: Implement a dual-layer animation system: (1) gentle wing flap via Y-axis scale modulation with sine wave (amplitude 0.04, period ~4s), (2) vertical floating via normal-direction offset with sine wave (amplitude 0.02-0.05 units, period ~3-5s). Both use per-bird phase offsets for variety. Click animations layer on top with rapid flap, hop, look-toward-camera, and circle flight phases.

### TD-131: Globe Visual Enhancement
**Problem**: Globe sphere geometry is 64 segments which can show faceting at close zoom. Cloud layer and atmosphere could be more visually refined.
**Solution**: Increase globe sphere geometry to 80 segments for smoother appearance. Adjust cloud layer opacity to 0.5 for better visibility. Refine atmosphere shell Fresnel shaders with adjusted falloff exponents for softer, more natural glow. Ensure all visual improvements maintain 60 FPS.

### TD-132: UI Layer Enforcement
**Problem**: Z-index hierarchy needs consistent enforcement across all UI layers with proper spacing tokens.
**Solution**: Verify and enforce z-index CSS custom properties: globe 0, markers 5, sidebar 20, bottom panel 30, info card 60, modal 80, overlay 100. Ensure spacing tokens (xs=6px, sm=10px, md=16px, lg=24px) are used consistently. BirdInfoCard desktop position uses left: 200px to prevent sidebar overlap.

### TD-133: Model Preloading
**Problem**: Bird models load on demand which can cause visible pop-in as the user explores the globe.
**Solution**: Preload all 12 bird GLB model paths using useGLTF.preload() at module initialization time. This ensures models are cached before any BirdMarker component mounts, eliminating load-time visual artifacts.

## Key Technical Decisions (v19)

### TD-121: Remove Procedural Bird Generation
**Problem**: `scripts/generate-bird-models.mjs` generates low-quality procedural bird GLBs from Three.js primitives. Models look like chickens with poor topology and unrealistic shapes.
**Solution**: Delete the generation script. Remove all procedurally generated GLB files from `public/models/birds/`. Birds must NEVER be generated procedurally again. All bird models must be loaded from external GLB assets.

### TD-122: GLB Asset Pipeline
**Problem**: No standardized asset pipeline exists. Bird models were generated ad-hoc.
**Solution**: Establish `/public/models/birds/` as the canonical directory for bird GLB assets. Create a proper model loader utility (`src/utils/birdModelLoader.ts`) that handles loading via `useGLTF` with DRACOLoader support, bounding-box normalization to 1-unit scale, and scene traversal to extract the first mesh. All models must be < 2000 triangles and use stylized low-poly aesthetic.

### TD-123: Bounding Box Normalization
**Problem**: External GLB models may have inconsistent scales.
**Solution**: On load, compute the model's bounding box, find the max dimension, and scale to fit within a 1-unit bounding box. Center the model at origin. This normalization happens in the loader utility and ensures all birds render at consistent sizes.

### TD-124: DRACOLoader Integration
**Problem**: GLB files can be large. Need compression support for performance.
**Solution**: Configure `useGLTF` with DRACOLoader using the Google-hosted decoder (`https://www.gstatic.com/draco/versioned/decoders/1.5.7/`). This enables loading Draco-compressed GLB files transparently. Non-compressed files still load normally.

### TD-125: Idle Animation System
**Problem**: Birds need subtle life-like motion even when not interacted with.
**Solution**: Add two animation layers in `useFrame`: (1) gentle wing flap via Y-axis scale modulation with sine wave (amplitude 0.04, period ~4s), (2) vertical floating via normal-direction offset with sine wave (amplitude 0.02-0.05 units, period ~3-5s). Both use per-bird phase offsets for variety.

### TD-126: Enhanced Bird Markers
**Problem**: Markers need clearer visual anchoring and hover feedback.
**Solution**: Keep the glowing ring base (RingGeometry with additive blending). On hover: scale increase to 1.35x with soft glow intensification. Ring opacity pulses with sine wave. Undiscovered birds get warm amber glow, discovered birds get their rarity-based color.

### TD-127: Camera Fly-To Improvement
**Problem**: Camera needs to stop above the bird marker, not clip into the globe.
**Solution**: Set `ZOOM_DISTANCE = 1.8` (above globe radius 1.0 + marker radius 0.02). Use spherical interpolation for smooth arc movement. Duration ~1s with smoothstep easing. After arrival, enable gentle auto-rotate orbit around the bird.

## Key Technical Decisions (v18)

### TD-115: UI Overlap Fix — Sidebar Collision Avoidance
**Problem**: Left sidebar buttons (z-20) visually overlap the bird info card because the sidebar layer covers the card area. Even though z-index hierarchy is correct (card z-60 > sidebar z-20), the sidebar buttons block interaction and create visual clutter.
**Solution**: When `selectedBirdId` is set (bird info card open), reduce sidebar layer opacity to 0.4 and shift it left by 10px using CSS transition. This creates visual separation. Additionally, set bird info card's desktop position with `left: 200px` minimum to prevent physical overlap with sidebar content. The sidebar layer wrapper in `App.tsx` reads `selectedBirdId` from store and applies the transition.

### TD-116: Improved Procedural Bird Model
**Problem**: The current bird model loaded from `/models/bird.glb` looks like a chicken — no clear wings, no recognizable bird silhouette. The file may not even exist in the repo.
**Solution**: Replace GLTF loading with procedural geometry built from Three.js primitives. Create a stylized low-poly bird using: ellipsoid body, two swept-back wing shapes (using `ShapeGeometry` or scaled boxes), a tail fan, and a pointed beak cone. Merge geometries into a single `BufferGeometry` for performance. Add slow wing-flap animation via `useFrame` (sine wave modulating wing rotation). The result is a clean, recognizable bird silhouette that works well for a kids app.

### TD-117: Bird Marker Glowing Base
**Problem**: Bird markers are just colored meshes floating on the globe with no visual anchor point.
**Solution**: Add a small glowing circle (ring geometry with emissive material) at the marker's base position on the globe surface. The bird model/icon hovers slightly above this circle. The ring uses additive blending for a soft glow effect. This anchors the bird visually to its location.

### TD-118: Info Card Section Titles and Left Margin
**Problem**: Bird info card sections lack clear labels, making it hard for children to understand what each section shows. On desktop, the card can overlap with the sidebar.
**Solution**: Add explicit section title labels ("Habitat", "Lifespan", "Wingspan") above each info section in `BirdInfoCard.tsx`. On desktop (>=1024px), position the card with `left: 200px` instead of `right: var(--safe-area)` to ensure it never overlaps with the left sidebar.

### TD-119: Discovery Glow Pulse
**Problem**: Clicking a bird has animation but no clear "discovery" visual feedback on the marker itself.
**Solution**: When a bird is clicked and discovered for the first time, trigger a brief glow pulse animation on the marker (emissive intensity spike that fades over 0.5s). This provides immediate visual feedback at the click location.

### TD-120: Camera Animation Duration
**Problem**: Current camera fly-to is 1.2s which feels slightly slow for quick exploration.
**Solution**: Reduce `ANIM_DURATION` in `CameraController.tsx` from 1200ms to 1000ms for snappier feel while maintaining smooth ease-in-out.

## Key Technical Decisions (v17)

### TD-108: Enhanced Mission Panel with Continent Progress
**Problem**: The daily missions panel shows progress bars but lacks context about continent-level exploration. Region missions don't show how much of that continent has been explored.
**Solution**: Add continent mini-progress bars inside the `DailyMissionsPanel` for region-type missions. Each region mission card shows a small bar indicating how many birds in that continent have been discovered. Completed missions display an animated badge with a glow effect. The panel header shows a daily progress ring indicator.

### TD-109: Photo Mode Overlay
**Problem**: The photo capture is a single button press with no framing controls. Children cannot compose their shot.
**Solution**: Enhance the photo capture flow in `BirdInfoCard`. When "Take Photo" is pressed, show a full-screen overlay with the canvas visible behind a semi-transparent frame. Add a zoom slider (1x-3x) and rotation hint. The capture button triggers a flash animation before saving. An exit button returns to normal view. The overlay is non-blocking and uses z-index from the overlay layer.

### TD-110: Encyclopedia Search and Continent Grouping
**Problem**: The encyclopedia is a flat list that becomes hard to browse with 50+ birds.
**Solution**: Add a search input at the top of `BirdEncyclopediaPanel` that filters birds by name (zh or en). Group birds by continent with collapsible section headers. Each section header shows the continent name, emoji, and discovery count (e.g., "Asia 🏯 4/10"). Discovered birds sort first within each section.

### TD-111: Achievement Progress Bars
**Problem**: Achievement cards show locked/unlocked state but no progress toward unlocking.
**Solution**: Add a progress bar to each achievement card in `AchievementPanel`. The bar fills based on current count vs requirement (e.g., 7/10 birds discovered = 70% fill). Unlocked achievements show a full bar with a subtle glow. Locked achievements show the current progress value as text.

### TD-112: Continent Progress in Bottom Panel
**Problem**: The bottom discovery panel shows global progress but not per-continent breakdown.
**Solution**: Add compact continent mini-bars to `BottomDiscoveryPanel`. Each continent gets a small colored bar showing discovery percentage. Bars animate smoothly on updates. Continent labels are abbreviated (e.g., "AS", "EU", "AF"). Color coding matches the region tag colors from the design system.

### TD-113: Rotating Exploration Tips
**Problem**: The encouragement message is static — always showing the lowest-discovery continent.
**Solution**: Implement a rotating tip system in `BottomDiscoveryPanel`. Tips cycle every 8 seconds with a fade transition. Tips include continent suggestions, activity prompts ("Try listening to bird sounds!"), and milestone encouragements. Tips are context-aware based on discovery state.

### TD-114: Enhanced Bird Hint Animations
**Problem**: Undiscovered bird hints have a fixed pulse intensity regardless of camera distance.
**Solution**: In `BirdMarker`, calculate camera distance to each undiscovered bird. Closer distance = stronger pulse and flutter amplitude. The pulse color shifts to warm amber. Flutter uses a sine wave with distance-modulated amplitude. This creates a "warmer/colder" discovery mechanic.

## Key Technical Decisions (v16)

### TD-101: Daily Bird Mission System
**Problem**: Children lack structured motivation to explore the globe daily. There is no daily engagement loop.
**Solution**: Add a mission system with predefined mission templates. Each day, generate a set of 3-4 missions from templates (find a bird in a continent, discover N new birds, listen to N sounds, explore a region). Store mission state in localStorage with a date key for daily reset. Create `DailyMissionsPanel` component accessible from the right control panel. Track progress reactively — when a bird is discovered, sound played, or region explored, update matching mission progress. On completion, show celebration animation and award a badge. Missions stored under `kids-bird-globe-missions` localStorage key.

### TD-102: Bird Photo Mode
**Problem**: Children cannot capture and save their bird discoveries visually. No photo or screenshot feature exists.
**Solution**: Add a "Take Photo" button to `BirdInfoCard`. When activated, enter photo mode: freeze the R3F canvas rendering loop, overlay zoom/rotate controls, and show a capture button. On capture, use `canvas.toDataURL('image/jpeg', 0.7)` to generate a compressed image. Store photos in localStorage under `kids-bird-globe-photos` as an array of `{id, birdId, dataUrl, capturedAt}`. Create `PhotoGalleryPanel` component showing saved photos in a grid with bird name labels. Limit to 50 photos max; auto-remove oldest when exceeded.

### TD-103: Bird Encyclopedia Enhancement
**Problem**: The existing encyclopedia shows all birds equally with no discovery/locked distinction. No progress indicator.
**Solution**: Modify `BirdEncyclopediaPanel` to check `discoveredBirds` from the store. Discovered birds show full info (photo, name, region). Undiscovered birds show a locked state with a question mark overlay and greyed-out appearance. Add a progress header: "17 / 50 birds discovered" with a progress bar. Clicking a discovered bird opens the info card. Clicking a locked bird shows a hint toast about which continent to explore.

### TD-104: Explorer Achievement System
**Problem**: No long-term achievement tracking beyond quest points. Children lack badges for milestones.
**Solution**: Define achievements in a data file: First Discovery (1 bird), Explorer (10 birds), World Traveler (all continents), Bird Listener (10 sounds), Photographer (5 photos), Mission Master (5 missions). Track achievement progress in localStorage under `kids-bird-globe-achievements`. Check achievement conditions reactively in the store. On unlock, show celebration animation. Create `AchievementPanel` component showing all achievements with locked/unlocked states and badge icons. Accessible from the right control panel.

### TD-105: Discovery Celebration Enhancement
**Problem**: The current discovery notification has star particles but lacks confetti and feels brief.
**Solution**: Enhance `DiscoveryNotification` with additional confetti burst animation (small colored rectangles falling). Increase celebration duration to ~2s. Add a subtle glow pulse behind the notification card. Keep the star particles and add confetti as a second layer. Ensure animation is non-blocking and auto-dismisses.

### TD-106: Bird Hint System
**Problem**: Children have no visual guidance toward undiscovered birds when rotating the globe.
**Solution**: In `BirdMarker`, check if the bird is undiscovered. If so, add a subtle pulse animation to the marker and a small flutter effect on the bird icon. The pulse is a CSS animation on the marker's outer ring. The flutter is a gentle rotation oscillation. Hints only appear for undiscovered birds and do not reveal the bird's identity. Add exploration encouragement messages in `BottomDiscoveryPanel` suggesting continents with low discovery rates.

### TD-107: Performance — Photo & Mission Storage
**Problem**: Storing photos as base64 in localStorage can consume significant space.
**Solution**: Compress photos to JPEG quality 0.6, resize to max 400px width before storing. Limit to 50 photos. Use efficient JSON serialization. Mission and achievement data are small and pose no storage concern. Ensure lazy loading for photo gallery thumbnails.

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

## Component Inventory (v18 — stability and core experience)

### Modified Components
| Component | Changes | Version |
|-----------|---------|---------|
| `App.tsx` | Sidebar layer opacity/shift when bird card open | v18 |
| `BirdMarker.tsx` | Procedural bird geometry, glowing base ring, discovery glow pulse | v18 |
| `BirdInfoCard.tsx` | Section titles, left margin 200px on desktop | v18 |
| `CameraController.tsx` | Reduced animation duration to 1000ms | v18 |
| `index.css` | Updated bottom-panel z-index to 30 | v18 |

## Implementation Phases (v18)

- Phase 142: UI Overlap Fix — sidebar collision avoidance, z-index enforcement → R-56
- Phase 143: Improved Bird Model — procedural low-poly bird geometry, wing-flap animation → R-57
- Phase 144: Bird Marker Visuals — glowing base circle, improved hover → R-58
- Phase 145: Info Card Sections — section titles, left margin → R-59
- Phase 146: Discovery Feedback — glow pulse, counter display → R-60
- Phase 147: Camera Experience — 1s animation duration → R-61
- Phase 148: UI Stability — spacing tokens, safe margins → R-62
- Phase 149: Final Verification → All v18 ACs

## Component Inventory (v17 — enhancements to existing components)

### Modified Components
| Component | Changes | Version |
|-----------|---------|---------|
| `DailyMissionsPanel.tsx` | Added continent mini-progress bars, animated completion badges, progress ring header | v17 |
| `BirdInfoCard.tsx` | Enhanced photo capture with overlay mode, zoom slider, flash animation | v17 |
| `BirdEncyclopediaPanel.tsx` | Added search input, continent section grouping, collapsible headers | v17 |
| `AchievementPanel.tsx` | Added progress bars to each achievement card | v17 |
| `BottomDiscoveryPanel.tsx` | Added continent mini-bars, rotating exploration tips | v17 |
| `DiscoveryNotification.tsx` | Enhanced celebration with glow pulse background | v17 |
| `BirdMarker.tsx` | Proximity-based hint pulse intensity | v17 |

## Implementation Phases (v17)

- Phase 135: Enhanced Mission Panel — continent mini-bars, animated badges, progress ring → R-49
- Phase 136: Photo Mode Overlay — zoom slider, rotation, flash animation → R-50
- Phase 137: Encyclopedia Search & Grouping — search input, continent sections → R-51
- Phase 138: Achievement Progress Bars — progress indicators on each card → R-52
- Phase 139: Continent Progress & Rotating Tips — bottom panel mini-bars, tip rotation → R-53, R-54
- Phase 140: Enhanced Bird Hints — proximity-based pulse, improved flutter → R-55
- Phase 141: Performance Verification → All v17 ACs

## Component Inventory (v16 additions)

### New Components
| Component | Purpose | Version |
|-----------|---------|---------|
| `DailyMissionsPanel.tsx` | Daily mission list with progress bars and celebration | v16 |
| `PhotoGalleryPanel.tsx` | Photo gallery showing captured bird photos | v16 |
| `AchievementPanel.tsx` | Explorer achievement badges and progress | v16 |

### Modified Components
| Component | Changes | Version |
|-----------|---------|---------|
| `BirdEncyclopediaPanel.tsx` | Added discovered/locked states, progress indicator | v16 |
| `BirdInfoCard.tsx` | Added "Take Photo" button | v16 |
| `DiscoveryNotification.tsx` | Enhanced with confetti burst animation | v16 |
| `BottomDiscoveryPanel.tsx` | Added exploration encouragement messages | v16 |
| `RightControlPanel.tsx` | Added Missions, Photos, Achievements buttons | v16 |
| `BirdMarker.tsx` | Added hint pulse animation for undiscovered birds | v16 |
| `App.tsx` | Added new panels to modal layer | v16 |

### Store Changes
| State | Changes | Version |
|-------|---------|---------|
| `dailyMissions` | New: array of daily mission objects | v16 |
| `missionsPanelOpen` | New: toggle for missions panel | v16 |
| `birdPhotos` | New: array of captured bird photos | v16 |
| `photoGalleryOpen` | New: toggle for photo gallery | v16 |
| `photoModeActive` | New: toggle for photo capture mode | v16 |
| `achievements` | New: array of achievement objects | v16 |
| `achievementPanelOpen` | New: toggle for achievement panel | v16 |
| `achievementNotification` | New: recently unlocked achievement ID | v16 |
| `listenCount` | New: total bird sounds listened to | v16 |
| `completedMissionCount` | New: total missions completed | v16 |

### Data Changes
| File | Changes | Version |
|------|---------|---------|
| `missions.json` | New: mission template definitions | v16 |
| `achievements.json` | New: achievement definitions | v16 |

## Implementation Phases (v16)

- Phase 127: Daily Bird Mission System — mission data, store state, panel UI, progress tracking → R-41
- Phase 128: Bird Photo Mode — photo capture, localStorage storage, gallery panel → R-42
- Phase 129: Bird Encyclopedia Enhancement — discovered/locked states, progress indicator → R-43
- Phase 130: Explorer Achievement System — achievement data, store tracking, panel UI → R-44
- Phase 131: Discovery Celebration Enhancement — confetti, sparkles, improved animation → R-45
- Phase 132: Exploration Progress & Hints — encouragement messages, bird hint animations → R-46, R-47
- Phase 133: Performance Optimization — photo compression, lazy loading, storage limits → R-48
- Phase 134: Final Verification → All v16 ACs

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

---

## Key Technical Decisions (v21)

### TD-134: Module Architecture
**Problem**: The codebase is a flat collection of components and utilities with no clear module boundaries. Adding new birds or features requires touching many unrelated files.
**Solution**: Create `/src/core/` for engine-level concerns (Engine.ts wrapping the render loop, SceneManager.ts for scene configuration, CameraController.ts refactored from components/three/). Create `/src/systems/` for domain logic (BirdSystem.ts consolidating bird data/markers/discovery, MigrationSystem.ts for routes, QuizSystem.ts for quiz logic, AudioSystem.ts for sound playback, AchievementSystem.ts for achievements/missions). Each system exports a React hook. Existing components import from systems instead of duplicating logic.

### TD-135: Data Separation
**Problem**: Business logic is mixed with data files and UI components.
**Solution**: `/src/data/` contains only JSON files (birds.json, migrations.json, achievements.json). All business logic that operates on this data lives in `/src/systems/`. UI components in `/src/ui/` (renamed from components/ui/) consume system hooks. Barrel `index.ts` files in each directory for clean imports.

### TD-136: Backward Compatibility
**Problem**: Refactoring must not break any existing features.
**Solution**: The refactor is structural only — moving files and creating re-exports. All existing component APIs remain unchanged. The store remains the single source of truth. Systems are thin wrappers that organize existing logic. Integration test: app builds and runs identically before and after refactor.

## Key Technical Decisions (v22)

### TD-137: Bird Database Expansion
**Problem**: The spec requires 30 birds with complete data fields across all 7 regions.
**Solution**: Curate 30 birds ensuring at least 3 per region. Each bird entry includes: name (zh+en), continent, habitat, diet, wingspan, funFact, modelPath, soundPath. Reuse existing model types (eagle, owl, parrot, etc.) mapped to new birds. Validate all entries have no missing required fields.

### TD-138: Region Clusters
**Problem**: With 30+ birds, the globe can feel cluttered at far zoom levels.
**Solution**: Add RegionCluster component that renders cluster markers at region center positions when camera is zoomed out (distance > 4 units). Each cluster shows region name and bird count. Clicking a cluster triggers the existing region filter and camera zoom. At close zoom, clusters fade and individual markers appear. Uses existing `activeRegion` store state.

## Key Technical Decisions (v23)

### TD-139: Model LOD System
**Problem**: Rendering high-poly 3D models for all 30+ birds simultaneously is expensive.
**Solution**: In BirdSystem, compute camera distance to each bird marker. Birds within 3 units render full 3D model. Birds beyond 3 units render a simplified sprite or low-poly mesh. LOD transition uses opacity crossfade over 0.3s to prevent pop-in. Distance check throttled to every 10 frames.

### TD-140: Lazy Model Loading
**Problem**: Preloading all bird models at startup increases initial load time.
**Solution**: Load bird 3D models on-demand when they first enter the camera's visible frustum. Use React Suspense with a lightweight placeholder (colored sphere) while loading. Cache loaded models in a Map for instant re-display. Maximum 15 models loaded simultaneously; evict least-recently-viewed when exceeded.

### TD-141: Instanced Markers
**Problem**: Each distant bird marker is a separate draw call, causing GPU overhead.
**Solution**: Use `THREE.InstancedMesh` for all markers beyond LOD distance. Single geometry (small sphere or diamond), single material, instance matrix and color attributes set per-bird. Reduces distant marker rendering to 1-2 draw calls regardless of bird count.

### TD-142: Render Loop Optimization
**Problem**: Per-frame computations (distance sorting, LOD decisions, animation updates) can cause frame drops.
**Solution**: Throttle expensive computations: LOD distance checks every 10 frames, bird sorting every 30 frames. Use `useMemo` for all geometry and material creation. Avoid object allocation in `useFrame`. Profile with Chrome DevTools to verify 60 FPS.

## Key Technical Decisions (v24)

### TD-143: Atmosphere Glow Enhancement
**Problem**: The atmosphere needs to feel more alive and magical for children.
**Solution**: Enhance AtmosphereShell with animated Fresnel shader. Inner layer: warm glow (slightly orange), outer layer: cool halo (blue-white). Animate glow intensity with subtle sine wave (amplitude 0.05, period 8s). Visible from all angles. Additive blending, BackSide rendering.

### TD-144: Cloud Layer Parallax
**Problem**: Static clouds feel unrealistic.
**Solution**: CloudLayer rotates independently at 0.001 rad/frame, creating parallax against the globe. Opacity 0.4 for subtlety. Uses alpha-transparent cloud texture on a sphere slightly above globe radius (1.006).

### TD-145: Sun Shadows
**Problem**: Bird markers float above the globe with no grounding visual.
**Solution**: Enable shadow casting on the directional sun light. Bird marker groups cast shadows onto the globe surface. Shadow map resolution 512x512 for performance. Shadow bias tuned to prevent artifacts. Shadows are subtle (opacity 0.3) to not distract.

### TD-146: Camera Inertia
**Problem**: Camera stops abruptly when user releases drag, feeling unnatural.
**Solution**: Configure OrbitControls with `enableDamping: true`, `dampingFactor: 0.08`. This creates smooth deceleration after drag release. Damping is frame-rate independent. Works with existing zoom and fly-to animations.

## Key Technical Decisions (v25)

### TD-147: Expedition System
**Problem**: Children need structured goals beyond free exploration to maintain engagement.
**Solution**: Create ExpeditionSystem.ts in `/src/systems/` managing expedition lifecycle. Predefined expeditions: region exploration ("Find 3 birds in Africa"), trait discovery ("Discover a bird that migrates"), collection milestones ("Collect 5 birds"). Each expedition has: id, title, description, type, target, goal, reward badge. System tracks active expedition, progress, and completion. Persisted in localStorage.

### TD-148: Mission Panel
**Problem**: Children need a clear UI to see available missions and track progress.
**Solution**: Create MissionPanel.tsx showing available/active/completed expeditions. Available missions show description and reward badge preview. Active mission shows progress bar and current/goal count. Completed missions show earned badge with glow. Panel accessible from HUD. Positioned right side, respects z-index hierarchy (modal layer z-80). Minimum tap size 56px.

### TD-149: Progress Tracker
**Problem**: Children need to see overall expedition progress at a glance.
**Solution**: Create ProgressPanel.tsx showing "Expeditions Complete: X/Y" with visual progress bar. Positioned top-left below existing progress bar. Compact display that doesn't overlap other UI. Updates in real-time as expeditions complete.

### TD-150: Completion Celebration
**Problem**: Mission completion needs to feel rewarding and exciting for children.
**Solution**: On expedition completion: trigger confetti burst (30 colored particles falling), badge reveal animation (scale from 0 to 1 with bounce easing), "Mission Complete!" message with expedition name, glow pulse behind badge. Duration 2.5s, non-blocking. Auto-dismiss after animation.

## Implementation Phases (v21)

- Phase 174: Core Module Setup — create /src/core/ with Engine.ts, SceneManager.ts, CameraController.ts → R-63
- Phase 175: Systems Module Setup — create /src/systems/ with BirdSystem.ts, MigrationSystem.ts, QuizSystem.ts, AudioSystem.ts, AchievementSystem.ts → R-63
- Phase 176: Data Separation — ensure /src/data/ contains only JSON, create barrel exports → R-63
- Phase 177: Component Rewiring — update imports across all components to use new modules → R-63
- Phase 178: V21 Verification — build succeeds, all features work → AC-V21-1

## Implementation Phases (v22)

- Phase 179: Bird Database Expansion — expand birds.json to 30 birds with complete fields → R-64
- Phase 180: Region Clusters — RegionCluster component on globe → R-65
- Phase 181: V22 Verification — 30 birds, all regions covered, clusters work → AC-V22-1

## Implementation Phases (v23)

- Phase 182: Model LOD System — distance-based model switching → R-66
- Phase 183: Lazy Loading — on-demand model loading with Suspense → R-67
- Phase 184: Instanced Markers — InstancedMesh for distant birds → R-68
- Phase 185: Render Loop Optimization — throttled computations, useMemo → R-69
- Phase 186: V23 Verification — 60 FPS, reduced draw calls → AC-V23-1

## Implementation Phases (v24)

- Phase 187: Atmosphere Glow — animated Fresnel shell → R-70
- Phase 188: Cloud Layer — independent rotation, parallax → R-71
- Phase 189: Sun Light & Shadows — directional light, shadow casting → R-72, R-73
- Phase 190: Marker Visuals — rarity glow, animated rings → R-74
- Phase 191: Camera Inertia — OrbitControls damping → R-75
- Phase 192: V24 Verification — all visual improvements, 60 FPS → AC-V24-1

## Implementation Phases (v25)

- Phase 193: Expedition System — ExpeditionSystem.ts, data, store state → R-76, R-77
- Phase 194: Mission Panel — MissionPanel.tsx UI → R-79
- Phase 195: Progress Tracker — ProgressPanel.tsx UI → R-78
- Phase 196: Completion Celebration — confetti, badge reveal → R-80
- Phase 197: V25 Verification — all expedition features, 60 FPS → AC-V25-1


## Key Technical Decisions (v26)

### TD-151: Enhanced Day/Night Cycle
**Problem**: The existing day/night cycle has basic sun rotation but lacks immersive detail like smooth city light transitions and time awareness.
**Solution**: Enhance the sun rotation system with configurable speed (0.03 rad/s default). Improve the city lights shader to use smooth per-fragment fade based on dot product of surface normal and sun direction. Add a time-of-day indicator component to the HUD showing approximate time (morning/afternoon/evening/night) based on sun angle. The indicator uses simple icon + text display.

### TD-152: Weather Zone System
**Problem**: The globe feels static without atmospheric weather effects.
**Solution**: Create WeatherSystem.ts managing weather state per region. Define weather configurations in weather data (region → weather type). Implement three weather effect components: CloudCluster (billboard sprites above region), RainParticles (vertical particle system), StormEffect (dark clouds + flash). Weather effects rendered as children of the earth group, positioned at region centers. Effects are subtle (low opacity, small scale) to not obscure bird markers. Toggle via control panel button.

### TD-153: Bird Activity Variation
**Problem**: All birds are visible all the time regardless of time of day.
**Solution**: Add `activityPeriod` field to Bird type ("diurnal" | "nocturnal" | "crepuscular"). In BirdMarker, compute sun angle at bird's lat/lng position. Diurnal birds: full opacity during day, fade to 0.1 at night. Nocturnal birds: appear with eye-glow effect at night, fade during day. Crepuscular: visible during transitions. Sun angle computed from the rotating sun light position.

## Key Technical Decisions (v27)

### TD-154: Boids Flocking Algorithm
**Problem**: Birds are static markers on the globe, lacking natural movement.
**Solution**: Implement simplified boids with three forces: separation (avoid crowding), alignment (match neighbor heading), cohesion (move toward group center). Each species defines: flockSize (3-12), speed (0.001-0.01), altitudeRange ([0.02, 0.08] above surface), wanderRadius (0.1-0.3). Flocks orbit their home position with gentle wandering. Boids computation runs in FlockingSystem.ts, updating positions stored in a Float32Array for direct InstancedMesh matrix updates.

### TD-155: GPU-Friendly Flock Rendering
**Problem**: Rendering individual meshes for each flock member is expensive.
**Solution**: Each flock uses a single InstancedMesh with bird geometry. Instance matrices updated per frame from boids positions. Spatial hashing grid (cell size 0.1) for O(1) neighbor lookups. Distant flocks (camera distance > 3) update every 2 frames. Maximum 8 visible flocks; others show single marker. Flock members have animation phase offsets for wing-flap variety.

## Key Technical Decisions (v28)

### TD-156: Story System Architecture
**Problem**: No guided exploration experience exists.
**Solution**: Create StorySystem.ts managing story lifecycle. Story data in stories-adventure.json: array of stories, each with steps (location, camera, narration, featuredBirdId, duration). Story state machine: idle → selecting → playing → step → complete. Camera controlled by story system during playback, overriding OrbitControls. Story progress persisted in localStorage.

### TD-157: Story Camera Travel
**Problem**: Camera needs cinematic travel between story locations.
**Solution**: During story playback, compute spherical interpolation between current and target positions. Add subtle zoom-out-then-in effect: camera pulls back 20% at midpoint of travel, then zooms to target. Travel duration proportional to angular distance (1-3s). OrbitControls disabled during travel, re-enabled on story exit. Easing: cubic-bezier for smooth acceleration/deceleration.

### TD-158: Story Panel UI
**Problem**: Need UI for story selection and playback controls.
**Solution**: StoryModePanel.tsx in modal layer. Selection view: story cards with title, description, cover image (generated from first location). Playback view: narration text, progress dots, play/pause/next/exit buttons. Featured bird highlighted with golden glow (emissive intensity 2.0, gold color). Story completion triggers badge award via achievement system.

## Key Technical Decisions (v29)

### TD-159: Screenshot Capture
**Problem**: No way to capture and save the globe view.
**Solution**: Add "Screenshot" button to control panel. On click: call `gl.domElement.toDataURL('image/png')`, create download link, trigger click. Flash animation: white overlay fading from 0.8 to 0 opacity over 0.3s. Filename includes timestamp. Simple and reliable approach using existing canvas API.

### TD-160: Share Card Generator
**Problem**: Need shareable bird discovery cards.
**Solution**: Create ShareCardGenerator utility. On "Share" button click from bird info card: create off-screen canvas (600x400), draw gradient background, bird silhouette, bird name (zh+en), region badge, fun fact text, app branding. Use Canvas 2D API for text rendering. Export as PNG via toDataURL. Offer download and clipboard copy (via navigator.clipboard.write with Blob).

### TD-161: Progress Export
**Problem**: No way to save/share discovery progress.
**Solution**: Collect all localStorage data: discoveredBirds, collectedBirds, achievements, expeditions, missions, photos (metadata only, not image data), statistics. Serialize to JSON. Create Blob and trigger download. Filename: `bird-globe-progress-{date}.json`.

## Key Technical Decisions (v30)

### TD-162: Enhanced Encyclopedia
**Problem**: Current encyclopedia is a simple list without advanced filtering.
**Solution**: Rebuild BirdEncyclopediaPanel with filter system. Filters: continent (checkbox group), diet type (checkbox group), wingspan range (three buttons: small/medium/large). Filters combine with AND logic. Search combines with OR on nameZh/nameEn. Results displayed in responsive grid. Each card shows bird photo/silhouette, name, region badge, diet icon. Click opens detailed entry.

### TD-163: Detailed Bird Entry
**Problem**: Bird info card lacks 3D preview and habitat visualization.
**Solution**: Create BirdEntryPanel.tsx with: (1) 3D model preview using a small inline Canvas with the bird's GLB model rotating slowly, (2) habitat map using a mini SVG globe with the bird's region highlighted, (3) sound playback with simple waveform bars animation, (4) facts grid with habitat/diet/wingspan/lifespan/fun fact. Panel slides in from right on desktop, bottom sheet on mobile.

### TD-164: Performance Monitoring
**Problem**: No way to monitor scene performance during development.
**Solution**: Create PerformanceMonitor component showing FPS, draw calls, triangles, textures. Uses useEngine hook for FPS, renderer.info for scene stats. Hidden by default, activated via triple-tap on top-right corner or URL parameter `?perf=1`. Minimal UI: small semi-transparent overlay in top-right.

### TD-165: Dynamic LOD Tuning
**Problem**: Fixed LOD distance doesn't adapt to device capability.
**Solution**: In Engine.ts, track rolling average FPS over 60 frames. If avg FPS < 45 for 2 consecutive checks: increase LOD distance by 0.5 (fewer 3D models). If avg FPS > 55 for 2 consecutive checks: decrease LOD distance by 0.25 (more detail). Clamp LOD distance between 1.5 and 5.0. Store current LOD distance in Zustand for BirdMarker to read.

## Implementation Phases (v26)

- Phase 198: Enhanced Day/Night Cycle — configurable sun speed, improved city lights shader, time indicator → R-81
- Phase 199: Weather Zone System — WeatherSystem.ts, cloud clusters, rain particles, storm effects → R-82
- Phase 200: Bird Activity Variation — activityPeriod field, sun angle computation, nocturnal glow → R-83
- Phase 201: V26 Verification → AC-V26-1

## Implementation Phases (v27)

- Phase 202: Boids Algorithm — FlockingSystem.ts, separation/alignment/cohesion, species parameters → R-84
- Phase 203: Flock Rendering — InstancedMesh per flock, matrix updates, spatial hashing → R-85
- Phase 204: V27 Verification → AC-V27-1

## Implementation Phases (v28)

- Phase 205: Story System — StorySystem.ts, story data, state machine → R-86
- Phase 206: Story Camera — cinematic travel, zoom effects, OrbitControls override → R-87
- Phase 207: Story Narration — Web Speech API integration, fallback text → R-88
- Phase 208: Story Panel UI — selection, playback, progress, controls → R-89
- Phase 209: V28 Verification → AC-V28-1

## Implementation Phases (v29)

- Phase 210: Screenshot Capture — canvas capture, flash animation, download → R-90
- Phase 211: Share Card Generator — off-screen canvas, bird card rendering → R-91
- Phase 212: Progress Export — JSON serialization, download trigger → R-92
- Phase 213: Share Panel UI — recent captures, download/copy buttons → R-93
- Phase 214: V29 Verification → AC-V29-1

## Implementation Phases (v30)

- Phase 215: Enhanced Encyclopedia — search, filters, responsive grid → R-94
- Phase 216: Detailed Bird Entry — 3D preview, habitat map, sound, facts → R-95
- Phase 217: Performance Monitoring — FPS overlay, scene stats → R-96
- Phase 218: Dynamic LOD Tuning — adaptive LOD based on FPS → R-97
- Phase 219: Asset Preloading — progressive loading, priority queue → R-98
- Phase 220: Texture Compression — KTX2/Basis support, atlas → R-99
- Phase 221: V30 Verification → AC-V30-1

---

## Key Technical Decisions (v31)

### TD-166: AI Bird Guide Knowledge Base
**Problem**: Children want to ask questions about birds but there's no interactive Q&A system.
**Solution**: Create a local JSON knowledge base (`bird-knowledge.json`) with 100+ Q&A pairs covering common bird questions. Implement keyword-based pattern matching in `AIGuideSystem.ts` to route questions to appropriate answers. Categories: behavior, habitat, diet, appearance, migration. Each answer is 2-3 sentences, child-friendly. Fallback response for unmatched questions. Guide character rendered as a floating UI element with speech bubble and typing animation.

### TD-167: Guide Speech Bubble UI
**Problem**: Need an engaging way to display AI guide responses.
**Solution**: Create `AIBirdGuidePanel.tsx` with glass-morphism speech bubble. Typing animation reveals text at 30ms per character. Narration button triggers Web Speech API. Guide avatar (bird icon) has gentle bobbing CSS animation. Panel positioned in card layer (z-60), bottom-left area, avoiding overlap with existing UI.

### TD-168b: BirdGuideService Architecture
**Problem**: The AI guide needs a structured service layer for question routing and answer generation.
**Solution**: Create `BirdGuideService.ts` with RAG-like architecture. `PromptBuilder` constructs context from the bird encyclopedia database (bird data, knowledge base). `ResponseRenderer` formats answers with typing animation and child-friendly language. Service checks for API key; if absent, falls back to prewritten answers from `bird_facts.json`. Service is stateless and can be called from any component.

### TD-169b: Learning Track System
**Problem**: Children lack structured learning paths through the bird content.
**Solution**: Create `LearningTrackSystem.ts` managing themed bird discovery journeys. Five predefined tracks stored in `learning-tracks.json`. Each track maps to 5-10 bird IDs from the existing database. `TrackProgress` stored in localStorage. When all birds in a track are discovered (cross-referenced with `discoveredBirds` store state), the track is marked complete and a badge is awarded. Track panel in sidebar shows progress bars per track. Celebration animation reuses existing confetti + badge reveal pattern from expedition system.

### TD-170b: Ecosystem Simulation
**Problem**: The world feels static — no seasonal variation in bird behavior or density.
**Solution**: Create `EcosystemSystem.ts` managing world state: season (spring/summer/autumn/winter), temperature, wind, timeOfDay. Season cycles at configurable speed (default 60s per year). `SeasonController.ts` manages smooth transitions between seasons using linear interpolation. Season influences bird density via latitude-based weighting: winter pushes birds toward equator, summer spreads them to higher latitudes. Ecosystem state stored in Zustand. Simulation ticks every 500ms (not per-frame) for performance. HUD season indicator shows current season with icon.

### TD-171b: Habitat Filter
**Problem**: No way to focus exploration on specific habitat types.
**Solution**: Create `HabitatFilter.ts` module with filter logic. Six habitat types: forest, wetlands, ocean, grassland, mountain, urban. Each bird's `habitatType` field is mapped to these categories. Filter state stored in Zustand (array of active habitat strings). When filters active, non-matching birds render at 0.1 opacity via BirdMarker. Filter toggles in sidebar with badge showing active count. Uses memoized filtered bird list for performance.

### TD-172b: Seasonal Migration Visualization
**Problem**: Migration paths are always visible regardless of season.
**Solution**: Upgrade `MigrationVisualizer.ts` to integrate with `EcosystemSystem`. Migration arcs only render during autumn (southward) and spring (northward) seasons. Add directional particle flow along arcs using instanced points with velocity. Particles move along the arc path with configurable speed. Glowing arc lines use emissive shader with season-based intensity (brighter during peak migration). `MigrationSystem` reads season from ecosystem state before rendering.

### TD-173b: Data Expansion with Lazy Loading
**Problem**: The monolithic `birds.json` doesn't scale to hundreds of birds.
**Solution**: Create `BirdDataLoader.ts` supporting lazy regional loading. New directory `src/data/birds/` with `index.json` (master index with bird IDs and region references) and `regions/` subdirectory (asia.json, europe.json, americas.json). Loader reads index at startup, then loads regional files on demand when user navigates to a region. Loaded data cached in a Map. Backward compatible: if regional files don't exist, falls back to existing `birds.json`. Loader exports async functions consumed by BirdSystem.

## V31 Architecture Diagram

```
src/
├── core/
│   ├── Engine.ts
│   ├── SceneManager.ts
│   └── CameraController.ts
├── systems/
│   ├── BirdSystem.ts
│   ├── MigrationSystem.ts
│   ├── EcosystemSystem.ts          ← NEW v31
│   ├── LearningTrackSystem.ts      ← NEW v31
│   ├── AudioSystem.ts
│   ├── LODSystem (in Engine.ts)
│   ├── AIGuideSystem.ts            ← UPGRADED v31
│   ├── FlockingSystem.ts
│   ├── WeatherSystem.ts
│   ├── AchievementSystem.ts
│   ├── StorySystem.ts
│   ├── QuizSystem.ts
│   └── index.ts
├── features/
│   ├── BirdGuideService.ts         ← NEW v31
│   ├── PromptBuilder.ts            ← NEW v31
│   ├── ResponseRenderer.ts         ← NEW v31
│   ├── HabitatFilter.ts            ← NEW v31
│   ├── SeasonController.ts         ← NEW v31
│   ├── MigrationVisualizer.ts      ← NEW v31
│   └── BirdDataLoader.ts           ← NEW v31
├── ui/
│   ├── components/three/
│   └── components/ui/
│       ├── TrackPanel.tsx           ← NEW v31
│       ├── AIBirdGuidePanel.tsx     ← UPGRADED v31
│       └── ... (existing panels)
└── data/
    ├── birds.json
    ├── bird-knowledge.json
    ├── bird_facts.json              ← NEW v31
    ├── learning-tracks.json         ← NEW v31
    └── birds/                       ← NEW v31
        ├── index.json
        └── regions/
            ├── asia.json
            ├── europe.json
            └── americas.json
```

## Key Technical Decisions (v32)

### TD-168: Enhanced AR Mode
**Problem**: Existing AR mode is basic camera overlay. Need proper surface detection and interaction.
**Solution**: Enhance `ARViewerModal.tsx` with WebXR hit-test API for surface detection when available. Bird placed at hit-test result position. Touch controls: pinch-to-scale, drag-to-rotate. Bird plays idle animation in AR. Fallback: simulated AR with camera feed background and gyroscope-based rotation using DeviceOrientationEvent. AR session managed via `ARSystem.ts`.

## Key Technical Decisions (v33)

### TD-169: Advanced Animation State Machine
**Problem**: Birds only have idle animation. Need takeoff, landing, perching, and inter-habitat flight.
**Solution**: Create `AnimationSystem.ts` with state machine: idle → takeoff → flying → landing → perching → idle. Each state has enter/update/exit handlers. Takeoff: crouch + rapid flaps + lift. Landing: descend + spread wings + settle. Perching: head turns + tail flicks for 5-15s. Inter-habitat flight: curved arc between regions. Transitions use 0.3s crossfade blending. Per-bird random timing via phase offsets.

### TD-170: Animation Anchor Points
**Problem**: Birds need places to land/perch on the globe.
**Solution**: Define 3-5 anchor points per habitat region in bird data. Anchor points are lat/lng positions at globe surface. Birds select random anchor within their habitat for perching. Anchor data stored in `biome-anchors.json`.

## Key Technical Decisions (v34)

### TD-171: Bird Photographer Scoring
**Problem**: Photo mode lacks gamification. Need scoring to make photography engaging.
**Solution**: Create `PhotographerSystem.ts` with scoring algorithm. Distance score: inverse of camera-to-bird distance (max 30pts). Pose score: check if bird is mid-animation (flying/flapping = bonus, max 30pts). Composition score: check if bird is near rule-of-thirds grid intersections (max 20pts). Rarity bonus: rare=1.5x, legendary=2x multiplier (max 20pts). Total: 0-100 mapped to 1-5 stars. Score displayed with animation after capture.

## Key Technical Decisions (v35)

### TD-172: Habitat Biome System
**Problem**: Globe looks uniform. Need distinct biome environments.
**Solution**: Create `BiomeSystem.ts` managing four biome zones with lat/lng boundaries. Each biome applies: color tint overlay (shader uniform), particle effects (leaves/dust/snow/shimmer), ambient lighting adjustment. Biome data in `biomes.json`. Transitions smooth based on camera position. Particle effects use lightweight instanced points.

### TD-173: Biome Ambient Sound
**Problem**: No audio atmosphere for different regions.
**Solution**: Extend `AudioSystem.ts` with ambient sound management. Each biome has a looping audio source. Volume fades based on camera distance to biome center and zoom level. Uses Web Audio API GainNode for smooth crossfading. Sound files lazy-loaded on first biome entry.

## Key Technical Decisions (v36)

### TD-174: Real Migration Data
**Problem**: Migration routes are simplified. Need realistic data for 10+ species.
**Solution**: Expand `migrations.json` with detailed waypoint arrays for 10 species based on real migration patterns. Each route: waypoints (lat/lng array), total distance (km), travel duration (days), season, fun fact. Migration visualization enhanced with bird silhouette icons, gradient coloring, and speed control (1x/2x/5x). Route tap shows info popup.

## Key Technical Decisions (v37)

### TD-175: HDR Environment Lighting
**Problem**: Globe lighting is flat. Need realistic HDR lighting.
**Solution**: Add ACES Filmic tone mapping to R3F Canvas. Create environment map from procedural sky gradient. Exposure adjusts with time of day (brighter at noon, darker at night). Environment map influences bird model materials via `envMapIntensity`. Minimal performance impact as it's a renderer-level setting.

### TD-176: Enhanced Atmospheric Effects
**Problem**: Atmosphere looks basic. Need volumetric clouds and scattering.
**Solution**: Enhance `CloudLayer.tsx` with multiple layers (3 layers at different altitudes with different rotation speeds and opacities). Add atmospheric scattering to `AtmosphereShell.tsx`: Rayleigh scattering formula in fragment shader produces blue edges and orange/red at dawn/dusk based on sun angle. Subtle god-ray effect via screen-space radial blur from sun position.

## Key Technical Decisions (v38)

### TD-177: Encyclopedia Pro Filtering
**Problem**: Current encyclopedia filters are basic. Need professional-grade filtering.
**Solution**: Enhance `BirdEncyclopediaPanel.tsx` with: full-text search across all fields, wingspan range slider (0-300cm), activity period filter, rarity filter, sort options (name/wingspan/rarity). Filters combine with AND logic. Active filter count badge. Results count display. Smooth scroll pagination.

### TD-178: Enhanced Bird Entry
**Problem**: Bird entries need more depth for educational value.
**Solution**: Enhance `BirdEntryPanel.tsx` with: orbit controls on 3D preview, interactive mini-globe for habitat range, waveform visualization for bird call, multiple fun facts (3-5 cards), size comparison visualization (bird silhouette next to child's hand), related birds section.

## Key Technical Decisions (v39)

### TD-179: Classroom Mode
**Problem**: No teacher-facing features for educational use.
**Solution**: Create `ClassroomSystem.ts` with teacher mode state machine. Activated via long-press (3s) on app title. Teacher panel provides: bird search/highlight, migration demo trigger, quiz launcher, region focus, time/weather control. Guided lessons stored in `lessons.json` with step sequences. Presentation mode hides non-essential UI and scales text 1.5x.

## Key Technical Decisions (v40)

### TD-180: Sandbox Mode
**Problem**: No free-form creative exploration mode.
**Solution**: Create `SandboxSystem.ts` managing sandbox state. Bird spawner: tap globe to place bird at lat/lng, select type from palette. Spawned birds stored in array (max 50). Flock creator: select birds to group, adjust speed/size. Time slider: 0-24h mapped to sun angle. Weather toggles: per-region rain/clouds/storms. All sandbox state is session-only (not persisted).

---

## Implementation Phases (v31)

- Phase 222: AI Guide Knowledge Base — bird-knowledge.json data, bird_facts.json fallback, AIGuideSystem.ts upgrade → R-100, R-101
- Phase 223: AI Guide Service Layer — BirdGuideService.ts, PromptBuilder.ts, ResponseRenderer.ts → R-100
- Phase 224: AI Guide UI — AIBirdGuidePanel.tsx upgrade, speech bubble, typing animation → R-102
- Phase 225b: Learning Track Data — learning-tracks.json, LearningTrackSystem.ts → R-103b
- Phase 226b: Learning Track UI — TrackPanel.tsx, progress bars, badge rewards → R-103b
- Phase 227b: Ecosystem Simulation — EcosystemSystem.ts, SeasonController.ts, world state → R-104b
- Phase 228b: Habitat Filter — HabitatFilter.ts, sidebar toggles, filter logic → R-105b
- Phase 229b: Seasonal Migration — MigrationVisualizer.ts, glowing arcs, directional particles → R-106b
- Phase 230b: Data Expansion — BirdDataLoader.ts, regional JSON files, lazy loading → R-107b
- Phase 231b: V31 Verification → AC-V31-1 through AC-V31-6

## Implementation Phases (v32)

- Phase 225: Enhanced AR Mode — WebXR integration, surface detection, touch controls → R-103
- Phase 226: AR UI Overlay — enhanced AR controls, instructions, screenshot → R-104
- Phase 227: V32 Verification → AC-V32-1

## Implementation Phases (v33)

- Phase 228: Animation State Machine — AnimationSystem.ts, states, transitions → R-105
- Phase 229: Anchor Points — biome-anchors data, perching behavior → R-106
- Phase 230: V33 Verification → AC-V33-1

## Implementation Phases (v34)

- Phase 231: Photographer System — PhotographerSystem.ts, scoring algorithm → R-107
- Phase 232: Photographer UI — viewfinder overlay, score display, timer → R-108
- Phase 233: V34 Verification → AC-V34-1

## Implementation Phases (v35)

- Phase 234: Biome System — BiomeSystem.ts, biome data, visual effects → R-109
- Phase 235: Biome Audio — ambient sound management, crossfading → R-110
- Phase 236: Biome Bird Assignment — biome field, filters → R-111
- Phase 237: V35 Verification → AC-V35-1

## Implementation Phases (v36)

- Phase 238: Real Migration Data — expanded migration routes, waypoints → R-112
- Phase 239: Migration Visualization — enhanced arcs, silhouettes, speed control → R-113
- Phase 240: V36 Verification → AC-V36-1

## Implementation Phases (v37)

- Phase 241: HDR Lighting — tone mapping, environment map, exposure → R-114
- Phase 242: Volumetric Clouds — multi-layer clouds, shadows → R-115
- Phase 243: Atmospheric Scattering — Rayleigh shader, dawn/dusk colors → R-116
- Phase 244: V37 Verification → AC-V37-1

## Implementation Phases (v38)

- Phase 245: Encyclopedia Pro Filters — full-text search, sliders, sort → R-117
- Phase 246: Enhanced Bird Entry — orbit controls, mini-globe, waveform, facts → R-118
- Phase 247: V38 Verification → AC-V38-1

## Implementation Phases (v39)

- Phase 248: Classroom System — ClassroomSystem.ts, teacher panel, lessons → R-119
- Phase 249: Presentation UI — fullscreen mode, large text, teacher toolbar → R-120
- Phase 250: V39 Verification → AC-V39-1

## Implementation Phases (v40)

- Phase 251: Sandbox System — SandboxSystem.ts, bird spawner, flock creator → R-121
- Phase 252: Sandbox UI — toolbar, palettes, sliders, toggles → R-122
- Phase 253: V40 Verification → AC-V40-1

## Component Inventory (v31-v40)

### New Components
| Component | Purpose | Version |
|-----------|---------|---------|
| `AIBirdGuidePanel.tsx` | AI guide speech bubble with Q&A (upgraded) | v31 |
| `TrackPanel.tsx` | Learning track selection and progress | v31 |
| `PhotographerMode.tsx` | Bird photographer game overlay | v34 |
| `BiomeEffects.tsx` | Biome visual effects on globe | v35 |
| `ClassroomPanel.tsx` | Teacher control panel | v39 |
| `SandboxToolbar.tsx` | Sandbox mode controls | v40 |

### New Systems
| System | Purpose | Version |
|--------|---------|---------|
| `AIGuideSystem.ts` | Knowledge base Q&A routing (upgraded) | v31 |
| `LearningTrackSystem.ts` | Themed learning journey management | v31 |
| `EcosystemSystem.ts` | Seasonal world state simulation | v31 |
| `ARSystem.ts` | Enhanced AR session management | v32 |
| `AnimationSystem.ts` | Advanced bird animation state machine | v33 |
| `PhotographerSystem.ts` | Photo scoring algorithm | v34 |
| `BiomeSystem.ts` | Habitat biome management | v35 |
| `ClassroomSystem.ts` | Teacher mode and lessons | v39 |
| `SandboxSystem.ts` | Sandbox mode state management | v40 |

### New Data Files
| File | Purpose | Version |
|------|---------|---------|
| `bird-knowledge.json` | AI guide Q&A knowledge base | v31 |
| `bird_facts.json` | Prewritten fallback answers | v31 |
| `learning-tracks.json` | Learning track definitions | v31 |
| `birds/index.json` | Master bird index for lazy loading | v31 |
| `birds/regions/asia.json` | Asian bird data | v31 |
| `birds/regions/europe.json` | European bird data | v31 |
| `birds/regions/americas.json` | Americas bird data | v31 |
| `biomes.json` | Biome zone definitions | v35 |
| `lessons.json` | Classroom lesson plans | v39 |

### Modified Components
| Component | Changes | Version |
|-----------|---------|---------|
| `MigrationPaths.tsx` | Season-aware rendering, directional particles | v31 |
| `BirdMarker.tsx` | Habitat filter opacity, ecosystem density | v31 |
| `RightControlPanel.tsx` | Learning Tracks, Habitat Filter buttons | v31 |
| `App.tsx` | TrackPanel, ecosystem HUD integrated | v31 |
| `GlobeScene.tsx` | Season indicator, ecosystem integration | v31 |
| `ARViewerModal.tsx` | WebXR hit-test, touch controls | v32 |
| `BirdEncyclopediaPanel.tsx` | Pro filters, full-text search | v38 |
| `BirdEntryPanel.tsx` | Orbit controls, waveform, facts | v38 |
| `AtmosphereShell.tsx` | Rayleigh scattering shader | v37 |
| `CloudLayer.tsx` | Multi-layer volumetric clouds | v37 |
| `MigrationPaths.tsx` | Enhanced visualization, speed control | v36 |
| `RightControlPanel.tsx` | New buttons for v31-v40 features | v31-v40 |
| `App.tsx` | New panels integrated into layers | v31-v40 |
| `GlobeScene.tsx` | Biome effects, tone mapping | v35, v37 |

### Store Changes (v31-v40)
| State | Purpose | Version |
|-------|---------|---------|
| `aiGuideOpen` | AI guide panel visibility | v31 |
| `aiGuideQuestion` | Current question being asked | v31 |
| `aiGuideAnswer` | Current answer being displayed | v31 |
| `learningTracksOpen` | Learning tracks panel visibility | v31 |
| `trackProgress` | Array of TrackProgress objects | v31 |
| `trackNotification` | Recently completed track ID | v31 |
| `currentSeason` | Current ecosystem season | v31 |
| `ecosystemState` | Full world state object | v31 |
| `activeHabitatFilters` | Array of active habitat filter strings | v31 |
| `arSessionActive` | WebXR AR session state | v32 |
| `photographerModeActive` | Photographer game state | v34 |
| `photographerScore` | Current photo score | v34 |
| `activeBiome` | Currently focused biome | v35 |
| `biomeAudioEnabled` | Biome ambient sound toggle | v35 |
| `migrationSpeed` | Migration animation speed multiplier | v36 |
| `classroomModeActive` | Teacher mode state | v39 |
| `presentationMode` | Fullscreen presentation state | v39 |
| `sandboxModeActive` | Sandbox mode state | v40 |
| `spawnedBirds` | Array of sandbox-spawned birds | v40 |
| `sandboxTimeHour` | Sandbox time slider value | v40 |
| `compareBirdA` | First bird ID for compare mode | v31 |
| `compareBirdB` | Second bird ID for compare mode | v31 |
| `compareMode` | Compare panel visibility | v31 |
| `discoveryMissions` | Array of DiscoveryMission objects | v31 |
| `discoveryMissionsPanelOpen` | Discovery missions panel visibility | v31 |
| `discoveryBadges` | Array of earned badge strings | v31 |
| `evolutionTimelineValue` | Current era slider value (0-3) | v31 |

---

# Implementation Plan — V31 (Discovery & Comparison Learning Layer)

> **v31 changelog addendum**: Bird Compare Mode with side-by-side stat comparison and green highlight for larger values, Discover Missions system with gamified exploration challenges and badge rewards, Bird Evolution Timeline slider with era-based bird filtering and info cards, new data fields (era, nocturnal, flightSpeed) on bird entries, right panel layout fix for vertical stack with equal-width buttons.

## Key Technical Decisions (v31 addendum)

### TD-174b: Bird Compare Mode
**Problem**: Children cannot visually compare two bird species to understand biological differences.
**Solution**: Create `BirdComparePanel.tsx` in modal layer. Long-press a bird marker triggers compare mode — first bird is set as Bird A, then user taps a second bird to set Bird B. Panel renders two columns with stat rows. Each stat row compares values; the larger value gets a green highlight (`#22c55e`). Stats: wingspan, weight (derived from sizeCategory), habitat, diet, flight speed. Close button exits compare mode and clears both bird selections.

### TD-175b: Discover Missions System
**Problem**: Children need structured exploration goals beyond daily missions and expeditions.
**Solution**: Create `DiscoverMissionSystem.ts` in `/src/systems/` with predefined discovery missions. Missions stored in `discover-missions.json`: find rainforest birds, find birds with wingspan > 2m, find nocturnal birds, find Antarctic birds. Each mission has: id, titleZh, titleEn, descriptionZh, descriptionEn, type (habitat/trait/region), target, goal, badge. Progress tracked reactively when birds are discovered. Completion triggers celebration + badge award. Badges persisted in localStorage under `kids-bird-globe-discovery-badges`.

### TD-176b: Bird Evolution Timeline
**Problem**: No way to explore bird evolution history on the globe.
**Solution**: Enhance existing `EvolutionTimeline.tsx` with a slider control. Four era stops: Mesozoic (150M years ago — Archaeopteryx), Paleogene (60M — early seabirds), Neogene (5M — modern bird groups), Quaternary (today — current species). Slider position filters birds on globe by `evolutionEra` field. Non-matching birds fade to 0.1 opacity. Info panel shows era name, description, and representative bird. Era data stored in `evolution-eras.json`.

### TD-177b: Data Schema Extension
**Problem**: Bird data lacks flightSpeed field needed for compare mode.
**Solution**: Add `flightSpeed` (number, km/h) to Bird interface in types.ts. The `era` field already exists as `evolutionEra`. The `nocturnal` boolean is derived from existing `activityPeriod === "nocturnal"`. Update birds.json with flightSpeed values for all 53 birds.

### TD-178b: Right Panel Layout Fix
**Problem**: Right control panel buttons can overlap on smaller viewports.
**Solution**: Add `max-height: calc(100vh - 40px)` and `overflow-y: auto` to the right panel container. All buttons use consistent width via `min-width: 100px`. Panel remains fixed-position at bottom-right.

## Implementation Phases (v31 addendum)

- Phase 232b: Discover Mission System — DiscoverMissionSystem.ts, discover-missions.json, store state → R-124
- Phase 233b: Bird Compare Panel — BirdComparePanel.tsx, compare logic, stat highlighting → R-123
- Phase 234b: Evolution Timeline Enhancement — slider control, era filtering, info cards → R-125
- Phase 235b: Data Schema Update — flightSpeed field on all birds → R-126
- Phase 236b: Right Panel Layout Fix — scrollable vertical stack, equal-width buttons → R-127
- Phase 237b: V31 Addendum Verification → AC-V31-2

## Component Inventory (v31 addendum)

### New Components
| Component | Purpose | Version |
|-----------|---------|---------|
| `BirdComparePanel.tsx` | Side-by-side bird stat comparison | v31 |
| `DiscoverMissionsPanel.tsx` | Discovery mission list and progress | v31 |

### New Systems
| System | Purpose | Version |
|--------|---------|---------|
| `DiscoverMissionSystem.ts` | Discovery mission tracking and completion | v31 |

### New Data Files
| File | Purpose | Version |
|------|---------|---------|
| `discover-missions.json` | Discovery mission definitions | v31 |
| `evolution-eras.json` | Evolution era definitions and descriptions | v31 |

### Modified Components
| Component | Changes | Version |
|-----------|---------|---------|
| `EvolutionTimeline.tsx` | Added slider control, era filtering | v31 |
| `RightControlPanel.tsx` | Added Compare, Discover Missions buttons; scrollable layout | v31 |
| `App.tsx` | BirdComparePanel, DiscoverMissionsPanel integrated | v31 |
| `store.ts` | Compare mode state, discovery missions state | v31 |
| `types.ts` | DiscoveryMission, DiscoveryBadge types; flightSpeed on Bird | v31 |

---

# Implementation Plan — V32 (Intelligent Discovery Systems)

> **v32 changelog addendum**: AI Bird Guide 2.0 with multi-source RAG semantic matching and voice narration, Bird Sound Recognition system with Web Audio API frequency analysis, Global Migration Simulation with seasonal animated routes, Habitat Ecosystem Interaction panel with manual override sliders, Bird Size Comparison Mode with proportional wingspan visualization, Data Expansion from 53 to 100 birds.

## Key Technical Decisions (v32 addendum)

### TD-179: AI Bird Guide 2.0
**Problem**: The existing guide only does simple keyword matching; children need richer, context-aware answers.
**Solution**: Upgrade `BirdGuideService.ts` with multi-source RAG pipeline. The `getGuideAnswer` function now searches across `bird-knowledge.json`, `bird_facts.json`, migration data, and habitat data. Scoring weights: exact phrase match (+4), pattern match (+2), token overlap (+1), bird-specific context (+3). Voice narration via Web Speech API already exists in `AIBirdGuidePanel.tsx` — enhance with auto-narrate option. Add migration and habitat context to answers by cross-referencing `migrations.json` and bird `habitatType` fields.

### TD-180: Bird Sound Recognition
**Problem**: Children cannot identify birds by sound in an interactive way.
**Solution**: Create `SoundRecognitionSystem.ts` in `/src/systems/`. Uses MediaRecorder API to capture short audio clips, Web Audio API AnalyserNode to extract frequency spectrum, and compares against stored bird sound frequency profiles. Each bird entry has a `soundFrequencyProfile` (peak frequency range in Hz). Matching uses Euclidean distance on frequency bins. Returns top match with confidence 0–1. Below 0.3 confidence triggers fallback message. UI: button in `RightControlPanel.tsx`, result shown in a toast-style notification.

### TD-181: Global Migration Simulation
**Problem**: Migration paths are static — no seasonal behavior.
**Solution**: Upgrade `MigrationSystem.ts` with seasonal state from `EcosystemSystem`. Add `getMigrationProgress(season)` function: spring returns 0→1 (northbound), autumn returns 0→1 (southbound), summer/winter returns 1.0 (at destination). `MigrationPaths.tsx` reads season from store and positions bird icons at `progress * pathLength`. Particle trails use three trailing spheres with decreasing opacity. Season label shown on migration distance badge.

### TD-182: Ecosystem Interaction Panel
**Problem**: Ecosystem runs automatically — children cannot experiment with environment changes.
**Solution**: Create `EcosystemPanel.tsx` with three sliders: Season (discrete: spring/summer/autumn/winter), Temperature (continuous: -10 to 40°C), Time of Day (discrete: dawn/morning/afternoon/dusk/night). When panel is open, ecosystem auto-tick pauses and manual values override. Store fields: `ecosystemPanelOpen: boolean`, `ecosystemManualOverride: boolean`. Bird visibility in `GlobeScene` filters: nocturnal birds hidden unless timeOfDay is night/dusk, migratory birds hidden unless season is spring/autumn, density scaled by temperature proximity to bird's preferred range.

### TD-183: Bird Size Comparison Enhancement
**Problem**: Compare panel shows stats but no visual size difference.
**Solution**: Upgrade `BirdComparePanel.tsx`. Add a proportional size bar: each bird image container width is scaled by `wingspanCm / max(wingspanA, wingspanB)`. Add lifespan stat row. Keep existing stat highlighting logic.

### TD-184: Data Expansion to 100 Birds
**Problem**: Dataset has 53 birds — need broader global coverage.
**Solution**: Add 47 new bird entries to `birds.json`. Focus on underrepresented regions: South America (15), Africa (12), Oceania (10), Arctic (5), mixed (5). Each entry must have all required `Bird` interface fields. Add corresponding knowledge entries to `bird-knowledge.json` for new species.

## Implementation Phases (v32 addendum)

- Phase 238: Data Expansion — Add 47 birds to birds.json, knowledge entries → R-133
- Phase 239: BirdGuideService 2.0 — Multi-source RAG, migration/habitat context → R-128
- Phase 240: SoundRecognitionSystem — Audio recording, frequency analysis, matching → R-129
- Phase 241: Migration Simulation — Seasonal state, animated progress, particle trails → R-130
- Phase 242: Ecosystem Panel — Manual override sliders, bird visibility filtering → R-131
- Phase 243: Bird Size Comparison — Proportional visualization, lifespan stat → R-132
- Phase 244: V32 Integration & Verification → AC-V32

## Store State Additions (v32 addendum)

| Field | Purpose | Version |
|-------|---------|---------|
| `ecosystemPanelOpen` | Ecosystem panel visibility | v32 |
| `ecosystemManualOverride` | Manual ecosystem override active | v32 |
| `soundRecognitionActive` | Sound recognition recording state | v32 |
| `soundRecognitionResult` | Matched bird ID from sound recognition | v32 |
| `soundRecognitionConfidence` | Match confidence 0–1 | v32 |

## Component Inventory (v32 addendum)

### New Components
| Component | Purpose | Version |
|-----------|---------|---------|
| `EcosystemPanel.tsx` | Ecosystem simulation sliders | v32 |

### New Systems
| System | Purpose | Version |
|--------|---------|---------|
| `SoundRecognitionSystem.ts` | Audio recording and bird sound matching | v32 |

### Modified Components
| Component | Changes | Version |
|-----------|---------|---------|
| `BirdGuideService.ts` | Multi-source RAG with migration/habitat context | v32 |
| `MigrationSystem.ts` | Seasonal migration progress computation | v32 |
| `MigrationPaths.tsx` | Season-aware bird icon positioning | v32 |
| `EcosystemSystem.ts` | Manual override support | v32 |
| `BirdComparePanel.tsx` | Proportional size visualization, lifespan stat | v32 |
| `RightControlPanel.tsx` | Sound recognition button, ecosystem panel button | v32 |
| `App.tsx` | EcosystemPanel integrated | v32 |
| `store.ts` | V32 state fields and actions | v32 |
| `types.ts` | SoundRecognitionState type | v32 |
| `birds.json` | Expanded to 100 birds | v32 |
| `bird-knowledge.json` | Knowledge entries for new birds | v32 |

---

# Implementation Plan — V33

## Overview

Redesign the right-side control panel into a three-mode system (Explore / Learn / Play), add compact/expanded bird info card, upgrade migration arc visualization, add a science HUD overlay, and unify UI with space-science design language.

## Phase 1 — Control System Refactor

Refactor right-side control panel. Replace the long button list with a mode-based panel.

Create: `/src/components/ui/MainModePanel.tsx`

Responsibilities:
- Mode switching (Explore / Learn / Play)
- Context tool rendering per mode
- Utility actions (Screenshot, Share, Reset) always visible

## Phase 2 — Bird Info Card Upgrade

Upgrade existing BirdInfoCard component to support compact/expanded modes.

Modify: `/src/components/ui/BirdInfoCard.tsx`

Supports:
- Compact mode (name, image, quick stats — max 160px)
- Expanded mode (full encyclopedia card)
- Toggle via arrow icon

## Phase 3 — Migration Visualization Upgrade

Upgrade migration system with enhanced arc rendering.

Modify: `/src/components/three/MigrationPaths.tsx`

Features:
- Arc path rendering with glow shader
- Animated bird markers with particle trails
- Distance labels with season context

## Phase 4 — Scientific HUD

Create: `/src/components/ui/ScienceHUD.tsx`

Displays:
- Latitude / Longitude
- Biome
- Season
- Temperature

Position: Top-left overlay, below app title.

## Phase 5 — Integration

Integrate new components in App.tsx:
- Replace RightControlPanel with MainModePanel
- Add ScienceHUD to sidebar layer
- Register new store state for UI mode

## Store State Additions (v33)

| Field | Purpose | Version |
|-------|---------|---------|
| `uiMode` | Current UI mode: explore / learn / play | v33 |
| `birdCardExpanded` | Bird info card expanded state | v33 |

## Component Inventory (v33)

### New Components
| Component | Purpose | Version |
|-----------|---------|---------|
| `MainModePanel.tsx` | Three-mode control panel | v33 |
| `ScienceHUD.tsx` | Scientific information overlay | v33 |

### Modified Components
| Component | Changes | Version |
|-----------|---------|---------|
| `BirdInfoCard.tsx` | Compact/expanded mode toggle | v33 |
| `MigrationPaths.tsx` | Enhanced arc glow and particle trails | v33 |
| `App.tsx` | MainModePanel + ScienceHUD integration | v33 |
| `store.ts` | V33 state fields (uiMode, birdCardExpanded) | v33 |
| `types.ts` | UIMode type | v33 |

---

# Implementation Plan — V34: Migration Journey System

## Overview

Implement a migration journey gameplay system. Children select a journey, follow the route on the globe, discover birds at each stop, and earn badges upon completion. Includes season-aware route filtering, LOD performance optimization, and UI panels for journey selection and progress tracking.

## Architecture

### New Data: `/src/data/`

| File | Purpose |
|------|---------|
| `migration-journeys.json` | Journey data: 4 journeys with stops, coordinates, bird IDs, seasons |

### New Components: `/src/components/ui/`

| File | Purpose |
|------|---------|
| `MigrationJourneyPanel.tsx` | Journey selection and progress panel |
| `SeasonSelector.tsx` | Season toggle (Spring/Summer/Autumn/Winter) |

### New Three.js Components: `/src/components/three/`

| File | Purpose |
|------|---------|
| `JourneyRoute.tsx` | Renders journey path with CatmullRomCurve3, stop markers, animated bird |

---

## Phase 1 — Migration Journey Data

Create `/src/data/migration-journeys.json` with 4 journey definitions.

Each journey structure:

```
id, nameZh, nameEn, descriptionZh, descriptionEn, badge, seasons[], stops[]
```

Each stop structure:

```
id, nameZh, nameEn, lat, lng, birdIds[]
```

---

## Phase 2 — Types & Store

Add to `types.ts`:
- `MigrationJourney` interface
- `JourneyStop` interface
- `JourneyProgress` interface

Add to `store.ts`:
- `activeJourneyId: string | null`
- `journeyProgress: JourneyProgress[]`
- `visitedStops: string[]`
- `journeyPanelOpen: boolean`
- Actions: `setActiveJourney`, `visitStop`, `completeJourney`, `setJourneyPanelOpen`

---

## Phase 3 — Journey Route Rendering

Create `JourneyRoute.tsx` using Three.js:

- Convert stop coordinates to globe positions via `latLngToVector3`
- Generate CatmullRomCurve3 through all stops
- Render path with animated glow ShaderMaterial
- Add clickable stop markers
- Animate bird icon along path: `t += speed * delta; position = curve.getPointAt(t)`

LOD:
- Distance > 3.0: glowing line only
- Distance < 3.0: full animation + stop markers

---

## Phase 4 — Journey Selection Panel

Create `MigrationJourneyPanel.tsx`:
- Journey list with cards
- Progress bar per journey
- Start/resume buttons
- Badge display for completed journeys

---

## Phase 5 — Season Selector

Create `SeasonSelector.tsx`:
- 4 season buttons (Spring/Summer/Autumn/Winter)
- Position: top-right, below language toggle
- Wires to `setCurrentSeason` store action
- Filters active journeys by season

---

## Phase 6 — Integration

- Add `MigrationJourneyPanel` to App.tsx modal layer
- Add `SeasonSelector` to App.tsx sidebar layer
- Add `JourneyRoute` to GlobeScene
- Add journey button to MainModePanel Explore tools
- Wire panel open/close via `setActivePanel`

---

## Phase 7 — UI Consistency Fix

- Consistent button dimensions: width 180px, height 44px, border-radius 12px
- Bottom-left buttons: flex-direction column, gap 12px
- Safe margins: left 20px, bottom 20px

---

## Store State Additions (v34)

| Field | Purpose | Version |
|-------|---------|---------|
| `activeJourneyId` | Currently active journey | v34 |
| `journeyProgress` | Progress per journey | v34 |
| `visitedStops` | Set of visited stop IDs | v34 |
| `journeyPanelOpen` | Journey panel visibility | v34 |

## Component Inventory (v34)

### New Components
| Component | Purpose | Version |
|-----------|---------|---------|
| `MigrationJourneyPanel.tsx` | Journey selection and progress | v34 |
| `SeasonSelector.tsx` | Season toggle UI | v34 |
| `JourneyRoute.tsx` | Three.js journey route rendering | v34 |

### Modified Components
| Component | Changes | Version |
|-----------|---------|---------|
| `App.tsx` | Journey panel + season selector integration | v34 |
| `store.ts` | V34 state fields and actions | v34 |
| `types.ts` | Journey types | v34 |
| `MainModePanel.tsx` | Journey button in Explore mode | v34 |
| `GlobeScene.tsx` | JourneyRoute component mount | v34 |

---

# v35-labels Plan: Smart Continent Label System

## Overview

Rewrite `MapLabels.tsx` to implement physically correct label behavior:
backside occlusion, horizon fade, zoom-level LOD, and distance-based scaling.

All logic is self-contained within `MapLabels.tsx` — no new modules required.

---

## Phase 1 — Backside Occlusion

In the `useFrame` loop of each `GlobeLabel`:

1. Compute the label's 3D position as a normalized direction vector.
2. Compute the camera direction (camera position normalized, since globe is at origin).
3. Calculate `dot = labelDir.dot(cameraDir)`.
4. If `dot < 0`, the label is behind the globe → hide it.

---

## Phase 2 — Horizon Fade

Extend the dot product check with a smooth fade zone:

- `dot < 0` → opacity = 0 (hidden)
- `0 <= dot < 0.15` → opacity fades in smoothly
- `dot >= 0.15` → opacity = 1 (fully visible)

Formula: `opacity = clamp((dot - 0.05) / 0.2, 0, 1)`

This replaces the old distance-only opacity logic.

---

## Phase 3 — Zoom-Level LOD

Add camera distance thresholds to reduce label density:

- `distance > 4.0` → hide all labels
- `distance > 3.0` → show only major labels (ids: `north-america`, `europe`, `asia`)
- `distance <= 3.0` → show all labels

Major labels are defined as a constant set.

---

## Phase 4 — Distance-Based Scaling

Apply a scale factor to each label based on camera distance:

```
scale = clamp(2 / distance, 0.6, 1.4)
```

Applied via CSS `transform: scale(...)` on the label container.

---

## Modified Components (v35-labels)

| Component | Changes |
|-----------|---------|
| `MapLabels.tsx` | Full rewrite of `GlobeLabel` useFrame: occlusion, fade, LOD, scaling |
