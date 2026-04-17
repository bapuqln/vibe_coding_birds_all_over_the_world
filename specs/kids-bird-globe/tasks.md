# 万羽拾音 (Kids Bird Globe) — Task Breakdown (v32)

> All v1–v7 phases (1–55) are complete (470 tasks).
> **v32 phases (257–264) complete ✅** (42 tasks).
> **Total: 512 tasks completed** across 32 versions.

---

# v32 Tasks (Bird Migration Intelligence)

> **v32 Complete ✅** — All 42 tasks finished

---

## Phase 257: Core — TimeController & Store

- [x] **257.1** Add `TimeState` interface to `types.ts` (month, progress, isPlaying, speed).
- [x] **257.2** Add `MigrationPath` interface to `types.ts` (birdId, waypoints, season, color, nameZh, nameEn).
- [x] **257.3** Add `FlockConfig` interface to `types.ts` (birdId, instanceCount, pathId, offsets).
- [x] **257.4** Add `SeasonVisual` interface to `types.ts` (month, northTint, southTint, migrationHighlight).
- [x] **257.5** Add `TimeState` slice to Zustand store: `timeState`, `tickTime`, `playTimeline`, `pauseTimeline`, `setTimeMonth`, `setTimeSpeed`, `scrubTimeline`.
- [x] **257.6** Create `src/core/TimeController.ts` with `tick(delta)` logic advancing month/progress.
- [x] **257.7** Create `src/core/AnimationScheduler.tsx` — single `useFrame` component calling `TimeController.tick`.

---

## Phase 258: Domain — Migration Data & Path Computation

- [x] **258.1** Create `src/domain/migration-paths.ts` — load migration path data, compute `CatmullRomCurve3` from waypoints using `latLngToVector3`.
- [x] **258.2** Create `src/domain/flock-config.ts` — generate `FlockConfig[]` from migration paths (3–8 instances per species, random offsets).
- [x] **258.3** Create `src/data/migration-intelligence.json` — 6 migration paths with waypoint arrays, seasons, colors.

---

## Phase 259: Render — Migration Path Renderer

- [x] **259.1** Create `src/render/MigrationPathRenderer.tsx` — render `CatmullRomCurve3` paths as `TubeGeometry` or `Line` with gradient `ShaderMaterial`.
- [x] **259.2** Implement gradient shader: bright at bird head position, dim at tail.
- [x] **259.3** Path elevation: waypoints at `globeRadius + 0.02`.
- [x] **259.4** Path visibility tied to `TimeState.month` matching path season.
- [x] **259.5** Smooth fade-in/fade-out for path appearance.

---

## Phase 260: Render — Flock Renderer (InstancedMesh)

- [x] **260.1** Create `src/render/MigrationFlockRenderer.tsx` — `InstancedMesh` per species with shared `ConeGeometry` + `MeshStandardMaterial`.
- [x] **260.2** Position instances along `CatmullRomCurve3` using `TimeState.progress`.
- [x] **260.3** Per-instance random offset (±0.01 units) for natural spread.
- [x] **260.4** Batch matrix updates: reuse `Matrix4`/`Vector3`/`Quaternion` refs.
- [x] **260.5** Orient bird instances along path tangent.
- [x] **260.6** Click handler on flock: pause timeline, highlight path, show info card.

---

## Phase 261: Render — Season Visual Overlay

- [x] **261.1** Create `src/render/SeasonOverlay.tsx` — shader-based hemisphere tinting.
- [x] **261.2** Winter (months 11–1): cooler blue tone in northern hemisphere.
- [x] **261.3** Summer (months 5–7): greener tones globally.
- [x] **261.4** Migration season (months 2–4, 8–10): highlight migration paths with glow.
- [x] **261.5** Smooth interpolation between season states using `TimeState.progress`.

---

## Phase 262: UI — Timeline Panel

- [x] **262.1** Create `src/ui/TimelinePanel.tsx` — horizontal month bar (Jan–Dec).
- [x] **262.2** Implement play/pause button toggling `TimeState.isPlaying`.
- [x] **262.3** Implement speed toggle (1x / 2x).
- [x] **262.4** Implement drag-to-scrub on month bar.
- [x] **262.5** Current month indicator with label.
- [x] **262.6** Glass-morphism styling consistent with existing UI.

---

## Phase 263: UI — Migration Info Card

- [x] **263.1** Create `src/ui/MigrationInfoCard.tsx` — shown on flock click.
- [x] **263.2** Display: bird name, migration origin → destination, distance, season, fun fact.
- [x] **263.3** "Resume" button to unpause timeline.
- [x] **263.4** Glass-morphism card styling.

---

## Phase 264: Integration & Verification

- [x] **264.1** Add `AnimationScheduler` to `GlobeScene.tsx`.
- [x] **264.2** Add `MigrationPathRenderer` to globe group in `GlobeScene.tsx`.
- [x] **264.3** Add `MigrationFlockRenderer` to globe group in `GlobeScene.tsx`.
- [x] **264.4** Add `SeasonOverlay` to globe group in `GlobeScene.tsx`.
- [x] **264.5** Add `TimelinePanel` to App.tsx bottom panel layer.
- [x] **264.6** Add `MigrationInfoCard` to App.tsx card layer.
- [x] **264.7** Add `migrationIntelligence` to `PanelType` union in store.
- [x] **264.8** Verify TimeController is single source of truth. (AC-V32-1)
- [x] **264.9** Verify no per-object animation loops. (AC-V32-2)
- [x] **264.10** Verify InstancedMesh for bird rendering. (AC-V32-3)
- [x] **264.11** Verify spherical interpolation on paths. (AC-V32-4)
- [x] **264.12** Verify ≥30 birds at 50+ FPS. (AC-V32-5)
- [x] **264.13** Verify click-to-learn interaction. (AC-V32-6)
- [x] **264.14** Build passes without TypeScript errors. (AC-V32-7)

---

> v8 phases (56–64) and v9 phases (65–75) are complete.
> v10 phases (76–84) are complete.
> v11 phases (85–92) are complete.
> v12 phases (93–100) are complete.
> v13 phases (101–108) are complete.
> v14 phases (109–118) are complete.
> v15 phases (119–126) are complete.
> v16 phases (127–134) are complete.
> v17 phases (135–141) are complete.
> v18 phases (142–149) are complete.
> v19 phases (150–161) are complete.
> v20 phases (162–173) are complete.
> v21 phases (174–178) are complete.
> v22 phases (179–181) are complete.
> v23 phases (182–186) are complete.
> v24 phases (187–192) are complete.
> v25 phases (193–197) are complete.
> v26 phases (198–201) are complete.
> v27 phases (202–204) are complete.
> v28 phases (205–209) are complete.
> v29 phases (210–214) are complete.
> v30 phases (215–221) are complete.
> v31 phases (222–231b) in progress.

---

# v21 Tasks (Architecture Refactor)

---

## Phase 174: Core Module Setup

- [x] **174.1** Create `/src/core/` directory.
- [x] **174.2** Create `Engine.ts` — render loop manager exporting `useEngine` hook.
- [x] **174.3** Create `SceneManager.ts` — scene configuration and lighting setup.
- [x] **174.4** Refactor `CameraController.tsx` into `/src/core/CameraController.ts` with re-export from original location.
- [x] **174.5** Create `/src/core/index.ts` barrel export.

---

## Phase 175: Systems Module Setup

- [x] **175.1** Create `/src/systems/` directory.
- [x] **175.2** Create `BirdSystem.ts` — consolidate bird data loading, marker logic, discovery tracking into `useBirdSystem` hook.
- [x] **175.3** Create `MigrationSystem.ts` — migration route data and animation logic.
- [x] **175.4** Create `QuizSystem.ts` — quiz question generation and scoring logic (refactor from QuizManager.ts).
- [x] **175.5** Create `AudioSystem.ts` — sound playback management (refactor from useAudio.ts).
- [x] **175.6** Create `AchievementSystem.ts` — achievement checking and mission tracking logic.
- [x] **175.7** Create `/src/systems/index.ts` barrel export.

---

## Phase 176: Data Separation

- [x] **176.1** Verify `/src/data/` contains only JSON data files (birds.json, migrations.json, achievements.json, missions.json, quests.json, stories.json).
- [x] **176.2** Move any business logic out of data files into system modules.
- [x] **176.3** Create `/src/data/index.ts` barrel export for typed data imports.

---

## Phase 177: Component Rewiring

- [x] **177.1** Update component imports to use system module hooks where applicable.
- [x] **177.2** Verify all existing components work with new module structure.
- [x] **177.3** Remove any duplicate logic that now lives in system modules.

---

## Phase 178: V21 Verification

- [x] **178.1** `/src/core/` directory exists with Engine.ts, SceneManager.ts, CameraController.ts. (AC-V21-1)
- [x] **178.2** `/src/systems/` directory exists with all 5 system files. (AC-V21-1)
- [x] **178.3** `/src/data/` has barrel exports for typed data. (AC-V21-1)
- [x] **178.4** Build succeeds with zero TypeScript errors. (AC-V21-1)
- [x] **178.5** All existing features continue to work. (AC-V21-1)

---

# v22 Tasks (Content Expansion)

---

## Phase 179: Bird Database Expansion

- [x] **179.1** Audit current birds.json for required fields: name, continent, habitat, diet, wingspan, funFact, modelPath, soundPath.
- [x] **179.2** Add missing fields (diet, modelPath, soundPath) to existing bird entries.
- [x] **179.3** Ensure at least 30 birds total with all 7 regions represented (min 3 per region).
- [x] **179.4** Validate no bird entry has missing required fields.

---

## Phase 180: Region Clusters

- [x] **180.1** Create `RegionCluster.tsx` component in `/src/components/three/`.
- [x] **180.2** Define region center positions for all 7 regions.
- [x] **180.3** Render cluster markers showing region name and bird count.
- [x] **180.4** Implement cluster click to trigger region filter and camera zoom.
- [x] **180.5** Clusters visible at far zoom (distance > 4), fade at close zoom.

---

## Phase 181: V22 Verification

- [x] **181.1** 30+ birds in birds.json with complete fields. (AC-V22-1)
- [x] **181.2** All 7 regions have at least 3 birds. (AC-V22-1)
- [x] **181.3** Region clusters visible and clickable. (AC-V22-1)
- [x] **181.4** Build succeeds with zero TypeScript errors. (AC-V22-1)

---

# v23 Tasks (Performance Optimization)

---

## Phase 182: Model LOD System

- [x] **182.1** Add camera distance calculation to bird markers in BirdSystem.
- [x] **182.2** Implement LOD switching: high-poly model < 3 units, simplified mesh >= 3 units.
- [x] **182.3** Add opacity crossfade (0.3s) for smooth LOD transitions.
- [x] **182.4** Throttle distance checks to every 10 frames.

---

## Phase 183: Lazy Loading

- [x] **183.1** Implement on-demand model loading when bird enters camera frustum.
- [x] **183.2** Add lightweight placeholder (colored sphere) while model loads.
- [x] **183.3** Cache loaded models in Map for instant re-display.
- [x] **183.4** Enforce maximum 15 models loaded simultaneously.

---

## Phase 184: Instanced Markers

- [x] **184.1** Create InstancedMesh for distant bird markers.
- [x] **184.2** Set instance attributes: position, color, scale per bird.
- [x] **184.3** Update instance matrices when birds change LOD state.
- [x] **184.4** Verify single draw call for all instanced markers.

---

## Phase 185: Render Loop Optimization

- [x] **185.1** Audit useFrame callbacks for blocking operations.
- [x] **185.2** Throttle expensive computations (sorting, LOD) to every N frames.
- [x] **185.3** Verify all geometry/material creation uses useMemo.
- [x] **185.4** Profile with Chrome DevTools to confirm 60 FPS.

---

## Phase 186: V23 Verification

- [x] **186.1** LOD system switches models based on distance. (AC-V23-1)
- [x] **186.2** Models lazy-loaded on demand. (AC-V23-1)
- [x] **186.3** InstancedMesh used for distant markers. (AC-V23-1)
- [x] **186.4** 60 FPS maintained on mid-range hardware. (AC-V23-1)

---

# v24 Tasks (Visual Polish)

---

## Phase 187: Atmosphere Glow

- [x] **187.1** Enhance AtmosphereShell with animated Fresnel shader (inner warm + outer cool).
- [x] **187.2** Add subtle sine-wave glow intensity animation (amplitude 0.05, period 8s).
- [x] **187.3** Verify glow visible from all viewing angles.

---

## Phase 188: Cloud Layer

- [x] **188.1** Add independent rotation to CloudLayer (0.001 rad/frame).
- [x] **188.2** Set cloud opacity to 0.4 for subtle parallax effect.
- [x] **188.3** Verify clouds visible in both day and night regions.

---

## Phase 189: Sun Light & Shadows

- [x] **189.1** Configure directional sun light with shadow casting enabled.
- [x] **189.2** Set shadow map resolution to 512x512.
- [x] **189.3** Bird markers cast soft shadows on globe surface.
- [x] **189.4** Tune shadow bias and opacity (0.3) for subtle effect.

---

## Phase 190: Marker Visuals

- [x] **190.1** Implement rarity-based glow colors (common: blue, rare: gold, legendary: purple).
- [x] **190.2** Add animated pulse ring at marker base.
- [x] **190.3** Smooth scale animation on hover (1.2x with ease-out).
- [x] **190.4** Discovered markers show subtle sparkle effect.

---

## Phase 191: Camera Inertia

- [x] **191.1** Enable OrbitControls damping (`enableDamping: true`).
- [x] **191.2** Set damping factor to 0.08 for smooth deceleration.
- [x] **191.3** Verify inertia works with existing zoom and fly-to animations.

---

## Phase 192: V24 Verification

- [x] **192.1** Atmosphere glow visible from all angles. (AC-V24-1)
- [x] **192.2** Cloud layer rotates with parallax. (AC-V24-1)
- [x] **192.3** Sun light casts shadows. (AC-V24-1)
- [x] **192.4** Marker glow colors match rarity. (AC-V24-1)
- [x] **192.5** Camera inertia smooth after drag. (AC-V24-1)
- [x] **192.6** 60 FPS maintained. (AC-V24-1)

---

# v25 Tasks (Exploration Experience)

---

## Phase 193: Expedition System

- [x] **193.1** Create expedition data in `/src/data/expeditions.json` with predefined missions.
- [x] **193.2** Add expedition types to `types.ts`: Expedition, ExpeditionProgress.
- [x] **193.3** Create `ExpeditionSystem.ts` in `/src/systems/` with expedition lifecycle management.
- [x] **193.4** Add expedition state to Zustand store: activeExpedition, expeditionProgress, completedExpeditions.
- [x] **193.5** Add localStorage persistence for expedition data.
- [x] **193.6** Wire expedition progress to bird discovery events.

---

## Phase 194: Mission Panel

- [x] **194.1** Create `ExpeditionPanel.tsx` in `/src/components/ui/`.
- [x] **194.2** Show available missions with descriptions and reward badge preview.
- [x] **194.3** Active mission highlighted with progress bar.
- [x] **194.4** Completed missions show earned badge.
- [x] **194.5** Minimum tap size 56px for all interactive elements.
- [x] **194.6** Add "Expeditions" button to RightControlPanel.
- [x] **194.7** Integrate into App.tsx modal layer.

---

## Phase 195: Progress Tracker

- [x] **195.1** Create `ExpeditionProgressBar.tsx` in `/src/components/ui/`.
- [x] **195.2** Display "Expeditions: X/Y Complete" with progress bar.
- [x] **195.3** Position in sidebar layer below existing progress bar.
- [x] **195.4** Compact display, no overlap with other UI.

---

## Phase 196: Completion Celebration

- [x] **196.1** Create celebration animation: confetti burst (30 particles).
- [x] **196.2** Badge reveal animation (scale 0→1 with bounce easing).
- [x] **196.3** "Mission Complete!" message with expedition name.
- [x] **196.4** Duration 2.5s, non-blocking, auto-dismiss.

---

## Phase 197: V25 Verification

- [x] **197.1** Expedition missions available and selectable. (AC-V25-1)
- [x] **197.2** Active mission progress tracked. (AC-V25-1)
- [x] **197.3** Completed missions award badges. (AC-V25-1)
- [x] **197.4** Progress tracker shows completion. (AC-V25-1)
- [x] **197.5** Celebration animation works. (AC-V25-1)
- [x] **197.6** No UI overlap. (AC-V25-1)
- [x] **197.7** 60 FPS maintained. (AC-V25-1)

---

# v20 Tasks (Asset Quality & Exploration Upgrade)

---

## Phase 162: Improved Bird Model Geometry

- [x] **162.1** Rebuild all 12 bird models in `build-bird-assets.mjs` with improved anatomy and species-specific features.
- [x] **162.2** Ensure each model has clear recognizable silhouette with proper wing shapes and body proportions.
- [x] **162.3** Verify all models remain under 2000 triangles and fit 1-unit bounding box.

---

## Phase 163: Full Scene Clone Rendering

- [x] **163.1** Update `BirdMarker.tsx` to clone full normalized GLB scene instead of extracting first mesh geometry.
- [x] **163.2** Render bird models using `<primitive object={scene}>` to preserve original materials.
- [x] **163.3** Verify all 12 bird types render correctly with their embedded materials.

---

## Phase 164: Enhanced Idle Animation

- [x] **164.1** Implement dual-layer idle animation: wing flap (Y-scale sine, amplitude 0.04, ~4s period) + vertical float (normal offset sine, amplitude 0.02-0.05, 3-5s period).
- [x] **164.2** Per-bird phase offsets for natural variety across all markers.
- [x] **164.3** Click animation layers: rapid flap, hop, look-toward-camera, circle flight phases.

---

## Phase 165: Bird Marker Enhancement

- [x] **165.1** Glowing base ring with additive blending at marker position.
- [x] **165.2** Hover effect: scale 1.35x with glow pulse intensification.
- [x] **165.3** Click effect: discovery glow pulse on first-time discovery.
- [x] **165.4** Undiscovered bird hint: proximity-based pulse and flutter animation.

---

## Phase 166: Discovery System Improvement

- [x] **166.1** "You discovered a new bird!" notification with celebration animation.
- [x] **166.2** Discovery counter: Birds Found X / Total display in notification.
- [x] **166.3** Discovered birds remain highlighted on the map with rarity-based glow.

---

## Phase 167: Camera Experience

- [x] **167.1** Smooth camera fly-to bird location on click (~1s smoothstep easing).
- [x] **167.2** Camera stops above bird marker (ZOOM_DISTANCE = 1.8, above globe radius).
- [x] **167.3** Gentle auto-rotate orbit after arrival (speed 0.5).

---

## Phase 168: UI Layer Structure

- [x] **168.1** Enforce z-index hierarchy: globe 0, markers 5, sidebar 20, bottom panel 30, info card 60, modal 80, overlay 100.
- [x] **168.2** Sidebar dims when bird card open (opacity 0.4, shift left 10px).
- [x] **168.3** Info cards never covered by sidebar (z-card: 60 > z-sidebar: 20).

---

## Phase 169: Safe UI Margins

- [x] **169.1** Info card desktop position with left margin 200px.
- [x] **169.2** Consistent spacing tokens: xs=6px, sm=10px, md=16px, lg=24px.
- [x] **169.3** All panels respect 20px safe area margins.

---

## Phase 170: Globe Visual Improvement

- [x] **170.1** Increase globe sphere geometry to 80 segments for smoother appearance.
- [x] **170.2** Adjust cloud layer opacity to 0.5 for better visibility.
- [x] **170.3** Refine atmosphere shell Fresnel shaders for softer glow.

---

## Phase 171: Model Preloading

- [x] **171.1** Preload all 12 bird GLB paths using useGLTF.preload() at module init.
- [x] **171.2** Verify models are cached before BirdMarker components mount.

---

## Phase 172: Draco Compression

- [x] **172.1** Maintain DRACOLoader configuration with Google-hosted decoder.
- [x] **172.2** Verify both compressed and uncompressed GLB files load correctly.

---

## Phase 173: Final Verification (v20)

- [x] **173.1** All 12 bird models render with improved geometry and original materials.
- [x] **173.2** Idle animations smooth and natural with per-bird variety.
- [x] **173.3** UI layers correct with no overlap issues.
- [x] **173.4** Globe visuals improved (smoother sphere, better clouds, refined atmosphere).
- [x] **173.5** Camera fly-to smooth with orbit after arrival.
- [x] **173.6** Discovery system working with counter and celebration.
- [x] **173.7** Performance stable at 60 FPS with all improvements active.

---

# v19 Tasks (High-Quality Bird Models Upgrade)

---

## Phase 150: Remove Generated Bird Models

- [x] **150.1** Delete `scripts/generate-bird-models.mjs` procedural bird generation script.
- [x] **150.2** Remove all procedurally generated GLB files from `public/models/birds/`.
- [x] **150.3** Verify no procedural geometry code remains in bird marker components.

---

## Phase 151: Asset Pipeline Setup

- [x] **151.1** Establish `/public/models/birds/` as canonical bird GLB directory.
- [x] **151.2** Create `src/utils/birdModelLoader.ts` with DRACOLoader configuration and bounding-box normalization.
- [x] **151.3** Update `src/data/birdModels.ts` to use new loader utility.

---

## Phase 152: High-Quality Bird Model Integration

- [x] **152.1** Create proper GLB bird models for starter set: eagle, owl, parrot, penguin, flamingo, duck, sparrow, crow, toucan, peacock, woodpecker, seagull.
- [x] **152.2** Each model fits 1-unit bounding box, < 2000 triangles, stylized low-poly.
- [x] **152.3** Update `BirdMarker.tsx` to load full GLB scenes (not just geometry) with proper materials.

---

## Phase 153: Model Scale Normalization

- [x] **153.1** Implement bounding-box computation and auto-scale in loader.
- [x] **153.2** Center all models at origin after normalization.
- [x] **153.3** Verify all 12 bird models render at consistent sizes on globe.

---

## Phase 154: Bird Idle Animation

- [x] **154.1** Add subtle wing-flap animation (Y-axis scale sine wave, amplitude 0.04, period ~4s).
- [x] **154.2** Add vertical floating motion (sine wave, amplitude 0.02–0.05 units, period 3–5s).
- [x] **154.3** Per-bird phase offset for animation variety.

---

## Phase 155: Bird Marker Enhancement

- [x] **155.1** Glowing base ring with additive blending at marker position.
- [x] **155.2** Hover effect: scale 1.35x with glow intensification.
- [x] **155.3** Ring opacity pulse with sine wave animation.

---

## Phase 156: Bird Discovery Interaction

- [x] **156.1** Camera smooth fly-to bird location on click (~1s duration).
- [x] **156.2** Open bird info card after camera arrives.
- [x] **156.3** "You discovered a new bird!" notification with Birds Found X/Total counter.

---

## Phase 157: UI Layering Fix

- [x] **157.1** Enforce z-index hierarchy: globe 0, markers 5, sidebar 20, bottom panel 30, info card 60, modal 100.
- [x] **157.2** Sidebar dims when bird card open (opacity 0.4, shift left 10px).
- [x] **157.3** Info cards never covered by sidebar.

---

## Phase 158: Safe Layout Margins

- [x] **158.1** Info card desktop position with left margin 200px.
- [x] **158.2** Tablet: center modal layout.
- [x] **158.3** Mobile: bottom sheet layout.

---

## Phase 159: Camera Experience

- [x] **159.1** Smooth camera fly-to with smoothstep easing (~1s).
- [x] **159.2** Stop above bird marker (ZOOM_DISTANCE = 1.8).
- [x] **159.3** Gentle auto-rotate orbit after arrival.

---

## Phase 160: Draco Compression

- [x] **160.1** Configure DRACOLoader with Google-hosted decoder.
- [x] **160.2** Integrate with useGLTF for transparent compressed loading.
- [x] **160.3** Verify both compressed and uncompressed GLB files load correctly.

---

## Phase 161: Visual Polish

- [x] **161.1** Subtle floating sine-wave effect on all bird models (amplitude 0.02–0.05).
- [x] **161.2** Smooth wing-flap breathing animation on Y axis.
- [x] **161.3** Per-bird phase offsets for natural variety.

---

# v18 Tasks (Stability & Core Experience)

---

## Phase 142: UI Overlap Fix

- [x] **142.1** Update `--z-bottom-panel` from 40 to 30 in `index.css` to match spec z-index hierarchy.
- [x] **142.2** Add sidebar collision avoidance in `App.tsx`: reduce sidebar opacity to 0.4 and shift left 10px when bird info card is open.
- [x] **142.3** Verify info card (z-60) always renders above sidebar (z-20).

---

## Phase 143: Improved Bird Model

- [x] **143.1** Replace GLTF-based bird geometry in `BirdMarker.tsx` with procedural low-poly bird shape (body ellipsoid, wings, tail, beak).
- [x] **143.2** Add slow wing-flap idle animation using sine wave in `useFrame`.
- [x] **143.3** Ensure bird silhouette is recognizable from all angles.

---

## Phase 144: Bird Marker Visuals

- [x] **144.1** Add glowing base ring at marker position in `BirdMarker.tsx`.
- [x] **144.2** Bird model hovers above the glowing ring.
- [x] **144.3** Hover effect: scale 1.35x with glow intensification.

---

## Phase 145: Info Card Sections

- [x] **145.1** Add section titles (Habitat, Lifespan, Wingspan) to `BirdInfoCard.tsx`.
- [x] **145.2** Set bird info card desktop position with left margin 200px.
- [x] **145.3** Verify card max-height 80vh with overflow-y auto.

---

## Phase 146: Discovery Feedback

- [x] **146.1** Add discovery glow pulse to bird marker on first click in `BirdMarker.tsx`.
- [x] **146.2** Verify discovery counter display in `DiscoveryNotification`.
- [x] **146.3** Verify "New bird discovered" notification works.

---

## Phase 147: Camera Experience

- [x] **147.1** Reduce `ANIM_DURATION` from 1200ms to 1000ms in `CameraController.tsx`.
- [x] **147.2** Verify smooth ease-in-out camera animation.
- [x] **147.3** Verify camera stops slightly above bird location.

---

## Phase 148: UI Stability

- [x] **148.1** Verify consistent spacing tokens (xs=6px, sm=10px, md=16px, lg=24px) across all UI.
- [x] **148.2** Verify all floating panels respect 20px safe area margins.
- [x] **148.3** Verify no UI overlap at any viewport size.

---

## Phase 149: Final Verification (v18)

- [x] **149.1** UI overlap fix verified. (AC-V18-1)
- [x] **149.2** Improved bird model with wing animation. (AC-V18-2)
- [x] **149.3** Bird marker glowing base. (AC-V18-3)
- [x] **149.4** Info card section titles. (AC-V18-4)
- [x] **149.5** Discovery feedback works. (AC-V18-5)
- [x] **149.6** Camera fly-to ~1s. (AC-V18-6)
- [x] **149.7** UI stability verified. (AC-V18-7)

---

# v17 Tasks (Game-Like Exploration Polish)

---

## Phase 135: Enhanced Mission Panel

- [x] **135.1** Add continent mini-progress bars to region-type mission cards in `DailyMissionsPanel.tsx`.
- [x] **135.2** Add animated glow badge to completed missions.
- [x] **135.3** Add daily progress summary ring in panel header.
- [x] **135.4** Add confetti particles to mission completion celebration.

---

## Phase 136: Photo Mode Overlay

- [x] **136.1** Add full-screen photo mode overlay component in `BirdInfoCard.tsx`.
- [x] **136.2** Add zoom slider control (1x to 3x).
- [x] **136.3** Add capture button with flash animation feedback.
- [x] **136.4** Add exit photo mode button.

---

## Phase 137: Encyclopedia Search & Grouping

- [x] **137.1** Add search input to `BirdEncyclopediaPanel.tsx` header.
- [x] **137.2** Group birds by continent with section headers.
- [x] **137.3** Show continent discovery count in each section header.
- [x] **137.4** Filter birds by search query (zh and en names).

---

## Phase 138: Achievement Progress Bars

- [x] **138.1** Add progress bar to each achievement card in `AchievementPanel.tsx`.
- [x] **138.2** Show current progress value and requirement.
- [x] **138.3** Add glow effect to unlocked achievement progress bars.

---

## Phase 139: Continent Progress & Rotating Tips

- [x] **139.1** Add continent mini-bars to `BottomDiscoveryPanel.tsx`.
- [x] **139.2** Color-code bars by continent.
- [x] **139.3** Implement rotating exploration tips with 8-second interval.
- [x] **139.4** Add fade transition between tips.

---

## Phase 140: Enhanced Bird Hints

- [x] **140.1** Add proximity-based pulse intensity to undiscovered bird markers in `BirdMarker.tsx`.
- [x] **140.2** Modulate flutter amplitude based on camera distance.
- [x] **140.3** Add warm amber glow color shift for close-proximity hints.

---

## Phase 141: Final Verification (v17)

- [x] **141.1** Enhanced mission panel with continent progress. (AC-V17-1)
- [x] **141.2** Photo mode overlay with controls. (AC-V17-2)
- [x] **141.3** Encyclopedia search and grouping. (AC-V17-3)
- [x] **141.4** Achievement progress bars. (AC-V17-4)
- [x] **141.5** Continent progress in bottom panel. (AC-V17-5)
- [x] **141.6** Rotating exploration tips. (AC-V17-6)
- [x] **141.7** Enhanced bird hints. (AC-V17-7)
- [x] **141.8** ~60 FPS maintained. (AC-V17-8)

---

# v16 Tasks (Game-Like Exploration Upgrade)

---

## Phase 127: Daily Bird Mission System

- [ ] **127.1** Create `src/data/missions.json` with mission template definitions (find_region, discover_count, listen_sounds, explore_region).
- [ ] **127.2** Add `DailyMission` type to `types.ts`.
- [ ] **127.3** Add mission state to Zustand store: `dailyMissions`, `missionsPanelOpen`, `completedMissionCount`.
- [ ] **127.4** Add mission actions: `generateDailyMissions()`, `updateMissionProgress()`, `completeMission()`, `setMissionsPanelOpen()`.
- [ ] **127.5** Add localStorage persistence for missions with daily reset logic (date key comparison).
- [ ] **127.6** Create `DailyMissionsPanel.tsx` with mission list, progress bars, and celebration animation.
- [ ] **127.7** Add "Missions" button to `RightControlPanel.tsx`.
- [ ] **127.8** Wire mission progress updates to bird discovery, sound playback, and region exploration events.
- [ ] **127.9** Add mission completion celebration animation (star particles + "Mission Complete" message).
- [ ] **127.10** Add `missionsPanelOpen` to `PanelType` and panel collision avoidance.
- [ ] **127.11** Integrate `DailyMissionsPanel` into `App.tsx` modal layer.

---

## Phase 128: Bird Photo Mode

- [ ] **128.1** Add `BirdPhoto` type to `types.ts`.
- [ ] **128.2** Add photo state to Zustand store: `birdPhotos`, `photoGalleryOpen`, `photoModeActive`.
- [ ] **128.3** Add photo actions: `capturePhoto()`, `deletePhoto()`, `setPhotoGalleryOpen()`, `setPhotoModeActive()`.
- [ ] **128.4** Add localStorage persistence for photos with 50-photo limit.
- [ ] **128.5** Add "Take Photo" button to `BirdInfoCard.tsx`.
- [ ] **128.6** Implement photo capture using R3F canvas `toDataURL` with JPEG compression.
- [ ] **128.7** Create `PhotoGalleryPanel.tsx` with grid layout showing saved photos and bird names.
- [ ] **128.8** Add "Photos" button to `RightControlPanel.tsx`.
- [ ] **128.9** Add `photoGalleryOpen` to `PanelType` and panel collision avoidance.
- [ ] **128.10** Integrate `PhotoGalleryPanel` into `App.tsx` modal layer.

---

## Phase 129: Bird Encyclopedia Enhancement

- [ ] **129.1** Modify `BirdEncyclopediaPanel.tsx` to check `discoveredBirds` from store.
- [ ] **129.2** Add discovered/locked visual states: discovered shows full info, locked shows question mark overlay.
- [ ] **129.3** Add progress header: "X / Y birds discovered" with progress bar.
- [ ] **129.4** Clicking locked bird shows hint toast about which continent to explore.
- [ ] **129.5** Sort birds: discovered first, then locked.

---

## Phase 130: Explorer Achievement System

- [ ] **130.1** Create `src/data/achievements.json` with achievement definitions.
- [ ] **130.2** Add `Achievement` type to `types.ts`.
- [ ] **130.3** Add achievement state to Zustand store: `achievements`, `achievementPanelOpen`, `achievementNotification`, `listenCount`.
- [ ] **130.4** Add achievement actions: `checkAchievements()`, `unlockAchievement()`, `setAchievementPanelOpen()`, `incrementListenCount()`.
- [ ] **130.5** Add localStorage persistence for achievements and listen count.
- [ ] **130.6** Create `AchievementPanel.tsx` with badge grid showing locked/unlocked achievements.
- [ ] **130.7** Add "Badges" button to `RightControlPanel.tsx`.
- [ ] **130.8** Wire achievement checks to bird discovery, sound playback, photo capture, and mission completion events.
- [ ] **130.9** Add achievement unlock notification with celebration animation.
- [ ] **130.10** Add `achievementPanelOpen` to `PanelType` and panel collision avoidance.
- [ ] **130.11** Integrate `AchievementPanel` into `App.tsx` modal layer.

---

## Phase 131: Discovery Celebration Enhancement

- [ ] **131.1** Add confetti burst animation to `DiscoveryNotification.tsx` (colored rectangles falling).
- [ ] **131.2** Increase celebration duration to ~2s.
- [ ] **131.3** Add subtle glow pulse behind notification card.
- [ ] **131.4** Ensure celebration is non-blocking and auto-dismisses.

---

## Phase 132: Exploration Progress & Hints

- [ ] **132.1** Add exploration encouragement messages to `BottomDiscoveryPanel.tsx`.
- [ ] **132.2** Show continent suggestion for lowest-discovery region.
- [ ] **132.3** Add hint pulse animation to undiscovered bird markers in `BirdMarker.tsx`.
- [ ] **132.4** Add subtle bird icon flutter for undiscovered markers.
- [ ] **132.5** Ensure hints only appear for undiscovered birds and do not reveal identity.

---

## Phase 133: Performance Optimization

- [ ] **133.1** Implement photo compression (JPEG quality 0.6, max 400px width) before localStorage storage.
- [ ] **133.2** Enforce 50-photo limit with auto-removal of oldest.
- [ ] **133.3** Verify lazy loading for photo gallery thumbnails.
- [ ] **133.4** Verify max 15 simultaneous 3D models enforced.
- [ ] **133.5** Verify ~60 FPS maintained with all v16 features active.

---

## Phase 134: Final Verification (v16)

- [ ] **134.1** Daily missions display and progress tracking. (AC-V16-1)
- [ ] **134.2** Bird photo mode capture and gallery. (AC-V16-2)
- [ ] **134.3** Encyclopedia discovered/locked states. (AC-V16-3)
- [ ] **134.4** Achievement system with badges. (AC-V16-4)
- [ ] **134.5** Enhanced discovery celebration. (AC-V16-5)
- [ ] **134.6** Exploration progress and encouragement. (AC-V16-6)
- [ ] **134.7** Bird hint animations. (AC-V16-7)
- [ ] **134.8** ~60 FPS maintained. (AC-V16-8)

---

# v15 Tasks (Immersive Experience Upgrade)

---

## Phase 119: Real-Time Day-Night Earth

- [ ] **119.1** Add rotating sun directional light to `GlobeScene.tsx` with slow rotation (~0.02 rad/s).
- [ ] **119.2** Create day-night custom shader for `Globe.tsx` blending day texture and night city-lights emissive based on sun direction.
- [ ] **119.3** Add city lights texture loading (`/textures/earth_night.jpg`) with emissive map.
- [ ] **119.4** Ensure cloud layer is visible in both day and night regions.
- [ ] **119.5** Enhance atmosphere glow to be visible from all angles as soft blue ring.

---

## Phase 120: Enhanced Migration Routes

- [ ] **120.1** Add Whooping Crane bird entry to `birds.json` with complete data fields.
- [ ] **120.2** Add Whooping Crane migration route to `migrations.json` (Wood Buffalo, Canada → Aransas, Texas).
- [ ] **120.3** Verify all migration arcs render with glowing effect and moving particle dots.
- [ ] **120.4** Ensure migration toggle button works correctly with new route.

---

## Phase 121: AI Bird Narration System

- [ ] **121.1** Create `useNarration.ts` hook in `src/hooks/` using Web Speech API (SpeechSynthesis).
- [ ] **121.2** Implement narration text generation from bird data (name, habitat, fun fact, lifespan, wingspan).
- [ ] **121.3** Add "Tell me about this bird" button to `BirdInfoCard.tsx`.
- [ ] **121.4** Implement voice selection (prefer English, friendly tone, rate 0.9).
- [ ] **121.5** Add fallback: display narration text when speech synthesis unavailable.
- [ ] **121.6** Add narration state management (idle, speaking, unavailable) to store or local state.

---

## Phase 122: Bird Discovery Celebration

- [ ] **122.1** Enhance `DiscoveryNotification.tsx` with star-particle burst animation (12-16 stars).
- [ ] **122.2** Add CSS keyframes for star particles animating outward.
- [ ] **122.3** Add scale-bounce animation to notification card.
- [ ] **122.4** Verify celebration animation is brief (~1.5s) and non-blocking.

---

## Phase 123: Enhanced Bird Info Card

- [ ] **123.1** Add scientific name display (italic) below common name in `BirdInfoCard.tsx`.
- [ ] **123.2** Verify habitat, wingspan, lifespan sections are present and styled.
- [ ] **123.3** Verify wingspan comparison bar renders correctly.
- [ ] **123.4** Ensure fun fact section uses "Did you know?" prompt styling.

---

## Phase 124: Camera Orbit After Arrival

- [ ] **124.1** Modify `CameraController.tsx` to enable gentle auto-orbit after fly-to completes.
- [ ] **124.2** Set orbit speed to slow (~0.5 autoRotateSpeed).
- [ ] **124.3** Disable auto-orbit immediately when user interacts (drag/scroll).
- [ ] **124.4** Verify camera stops slightly above bird location.

---

## Phase 125: Performance Optimization

- [ ] **125.1** Verify max 15 simultaneous 3D models with icon marker fallback.
- [ ] **125.2** Verify lazy loading for bird models and audio files.
- [ ] **125.3** Verify day-night shader performs well on mid-range devices.
- [ ] **125.4** Ensure narration audio is generated on-demand, not preloaded.
- [ ] **125.5** Verify ~60 FPS maintained with all v15 features active.

---

## Phase 126: Final Verification (v15)

- [ ] **126.1** Day-night Earth rendering with city lights. (AC-V15-1)
- [ ] **126.2** Migration routes with glowing arcs and moving dots. (AC-V15-2)
- [ ] **126.3** AI narration via "Tell me about this bird" button. (AC-V15-3)
- [ ] **126.4** Star-particle discovery celebration. (AC-V15-4)
- [ ] **126.5** Enhanced bird info card with scientific name. (AC-V15-5)
- [ ] **126.6** Camera fly-to with gentle orbit. (AC-V15-6)
- [ ] **126.7** ~60 FPS maintained. (AC-V15-7)

---

# v14 Tasks (Visual & Interaction Upgrade)

---

## Phase 109: Glass UI Design System

- [x] **109.1** Add glass UI CSS utility classes in `index.css` (`.glass-panel`, `.glass-card`, `.glass-button`).
- [x] **109.2** Add hover glow keyframe animation in `index.css`.
- [x] **109.3** Define glass color tokens as CSS custom properties.

---

## Phase 110: Modern Button Design

- [x] **110.1** Refactor `ActionButton.tsx` to use pill shape (`border-radius: 9999px`).
- [x] **110.2** Apply glass background and hover glow to `ActionButton`.
- [x] **110.3** Add `scale(1.05)` hover and `scale(0.97)` active feedback.
- [x] **110.4** Apply glass styling to `BirdInfoCard` action buttons.

---

## Phase 111: Globe Visual Improvements

- [x] **111.1** Enhance `AtmosphereShell.tsx` with two-layer Fresnel shader (inner warm + outer cool).
- [x] **111.2** Add rim light to `GlobeScene.tsx` (directional from behind).
- [x] **111.3** Improve `CloudLayer.tsx` opacity and blending.
- [x] **111.4** Increase hemisphere light warmth in `GlobeScene`.

---

## Phase 112: Bird Hover Interaction

- [x] **112.1** Enhance hover scale lerp in `BirdMarker.tsx` (smoother, target 1.3).
- [x] **112.2** Increase hover emissive glow intensity.
- [x] **112.3** Upgrade `Html` tooltip with glass-style background and fade-in.

---

## Phase 113: Particle Bird Effects

- [x] **113.1** Create `BirdParticles.tsx` component in `src/components/three/`.
- [x] **113.2** Render ~10 bird-shaped particles orbiting globe at varying altitudes.
- [x] **113.3** Integrate `BirdParticles` into `GlobeScene.tsx`.

---

## Phase 114: Camera Animation System

- [x] **114.1** Replace constant lerp with ease-in-out smoothstep in `CameraController.tsx`.
- [x] **114.2** Set animation duration to ~1.2 seconds.
- [x] **114.3** Add smooth deceleration at destination.

---

## Phase 115: Bottom Discovery Panel

- [x] **115.1** Create `BottomDiscoveryPanel.tsx` in `src/components/ui/`.
- [x] **115.2** Display "Birds discovered: X / Y" with glass-style progress bar.
- [x] **115.3** Add slide-up animation.
- [x] **115.4** Integrate into `App.tsx` BottomPanelLayer.

---

## Phase 116: Panel Layout & Responsive

- [x] **116.1** Verify panels never overlap at any viewport size.
- [x] **116.2** Ensure bottom discovery panel respects safe areas.
- [x] **116.3** Verify responsive breakpoints for all new components.

---

## Phase 117: Performance Optimization

- [x] **117.1** Verify particle bird effects don't impact FPS.
- [x] **117.2** Verify enhanced atmosphere shader performs well.
- [x] **117.3** Ensure max 15 simultaneous 3D models still enforced.

---

## Phase 118: Final Verification (v14)

- [x] **118.1** Glass UI design system applied to all panels. (AC-V14-1)
- [x] **118.2** Modern pill buttons with hover glow. (AC-V14-2)
- [x] **118.3** Enhanced globe atmosphere and lighting. (AC-V14-3)
- [x] **118.4** Bird hover interactions work. (AC-V14-4)
- [x] **118.5** Particle bird effects visible. (AC-V14-5)
- [x] **118.6** Camera ease-in-out animation. (AC-V14-6)
- [x] **118.7** Bottom discovery panel works. (AC-V14-7)
- [x] **118.8** ~60 FPS maintained. (AC-V14-8)

---

# v13 Tasks (Global UI Layer System)

---

## Phase 101: Global UI Layer System — CSS & Z-Index

- [x] **101.1** Define CSS custom properties for z-index layers in `index.css` (--z-globe: 0, --z-marker: 5, --z-sidebar: 20, --z-bottom-panel: 40, --z-card: 60, --z-modal: 80, --z-overlay: 100).
- [x] **101.2** Add layer utility classes in `index.css` for each z-index tier.
- [x] **101.3** Add panel animation keyframes in `index.css` (slideUp, slideRight, scaleFade).

---

## Phase 102: Layered Container Architecture

- [x] **102.1** Refactor `App.tsx` into layered container structure: GlobeLayer, UILayer (SidebarLayer, BottomPanelLayer, CardLayer, ModalLayer, OverlayLayer).
- [x] **102.2** Move all HUD components into SidebarLayer container.
- [x] **102.3** Move bottom panels into BottomPanelLayer container.
- [x] **102.4** Move info cards into CardLayer container.
- [x] **102.5** Move all modal panels into ModalLayer container.
- [x] **102.6** Move LoadingScreen into OverlayLayer container.

---

## Phase 103: Panel Collision Avoidance

- [x] **103.1** Add `activePanel` state and `PanelType` type to Zustand store.
- [x] **103.2** Add `setActivePanel(panel)` action to store.
- [x] **103.3** Update all panel open actions to use `setActivePanel`.
- [x] **103.4** Verify only one panel type is active at any time.

---

## Phase 104: Bird Info Card Repositioning

- [x] **104.1** Refactor `BirdInfoCard.tsx` to open from right side on desktop (>=1024px).
- [x] **104.2** Keep bottom-sheet behavior on mobile (<768px).
- [x] **104.3** Center modal behavior on tablet (768–1023px).
- [x] **104.4** Ensure bird card never overlaps with bottom panels or left sidebar.

---

## Phase 105: Update All Component Z-Indexes

- [x] **105.1** Update `AppTitle` to z-20 (sidebar layer).
- [x] **105.2** Update `LangToggle` to z-20 (sidebar layer).
- [x] **105.3** Update `DiscoveryProgressBar` to z-20 (sidebar layer).
- [x] **105.4** Update `RightControlPanel` to z-20 (sidebar layer).
- [x] **105.5** Update `BirdGuide` to z-20 (sidebar layer).
- [x] **105.6** Update `BirdRadar` to z-20 (sidebar layer).
- [x] **105.7** Update `StoryExplorer` launcher to z-20, modal to z-80.
- [x] **105.8** Update `BirdEncyclopediaPanel` launcher to z-20, modal to z-80.
- [x] **105.9** Update `QuizPanel` launcher to z-20, active/result to z-80.
- [x] **105.10** Update `SoundGuessPanel` launcher to z-20, active/result to z-80.
- [x] **105.11** Update `EvolutionTimeline` launcher to z-20, sheet to z-40.
- [x] **105.12** Update `BirdInfoCard` to z-60 (card layer).
- [x] **105.13** Update `DiscoveryNotification` to z-60 (card layer).
- [x] **105.14** Update `MyBirdsPanel` to z-80 (modal layer).
- [x] **105.15** Update `RegionFilterPanel` to z-80 (modal layer).
- [x] **105.16** Update `QuestPanel` to z-80 (modal layer).
- [x] **105.17** Update `GuidedTour` intro to z-80, touring panel to z-40.
- [x] **105.18** Update `ContinentBirdPanel` to z-80 (modal layer).
- [x] **105.19** Update `ARViewerModal` to z-80 (modal layer).
- [x] **105.20** Verify `LoadingScreen` at z-[100] (overlay layer).

---

## Phase 106: Responsive Layout Rules

- [x] **106.1** Implement desktop layout: left sidebar + bottom panel + right info card.
- [x] **106.2** Implement tablet layout: collapsed sidebar, center modal card.
- [x] **106.3** Implement mobile layout: full-screen sheet panels.

---

## Phase 107: Safe Area & Animation Rules

- [x] **107.1** Add 20px safe area padding to all floating panels.
- [x] **107.2** Implement slide-up animation for bottom panels (250ms).
- [x] **107.3** Implement slide-right animation for side panels (250ms).
- [x] **107.4** Implement scale-fade animation for modals (250ms).

---

## Phase 108: Final Verification (v13)

- [x] **108.1** Unified z-index hierarchy with 7 layers. (AC-V13-1)
- [x] **108.2** All components use layer-appropriate z-index. (AC-V13-1)
- [x] **108.3** App root uses layered container architecture. (AC-V13-2)
- [x] **108.4** Panel collision avoidance works. (AC-V13-3)
- [x] **108.5** Bird info card opens from right (desktop). (AC-V13-4)
- [x] **108.6** No panel overlap at any viewport size. (AC-V13-4)
- [x] **108.7** Desktop responsive layout correct. (AC-V13-5)
- [x] **108.8** Tablet responsive layout correct. (AC-V13-5)
- [x] **108.9** Mobile responsive layout correct. (AC-V13-5)
- [x] **108.10** 20px safe area padding applied. (AC-V13-6)
- [x] **108.11** Modals appear above all panels. (AC-V13-7)
- [x] **108.12** Panel animations smooth (250ms). (AC-V13-8)

---

# v12 Tasks (Full-Scope Expansion)

---

## Phase 93: Dataset Expansion to 50+

- [x] **93.1** Add Barn Swallow (Europe) to birds.json with complete data fields.
- [x] **93.2** Add Bar-tailed Godwit (Oceania) to birds.json with complete data fields.
- [x] **93.3** Add Snowy Egret (North America) to birds.json with complete data fields.
- [x] **93.4** Add Ruby-throated Hummingbird (North America) to birds.json.
- [x] **93.5** Add Galápagos Penguin (South America) to birds.json.
- [x] **93.6** Add Superb Lyrebird (Oceania) to birds.json.
- [x] **93.7** Verify total bird count is 50+ with all required fields.
- [x] **93.8** Add `migration` and `model` fields to all bird entries.
- [x] **93.9** Update stories.json with new bird IDs.

---

## Phase 94: Migration Route Fix & Enhancement

- [x] **94.1** Fix migrations.json to reference actual bird IDs from birds.json.
- [x] **94.2** Add Arctic Tern migration route (Arctic to Antarctic).
- [x] **94.3** Add Bar-tailed Godwit migration route (Alaska to New Zealand).
- [x] **94.4** Add Barn Swallow migration route (Europe to Africa).
- [x] **94.5** Add glowing arc effect to migration route lines.
- [x] **94.6** Add animated moving dot along migration path.
- [x] **94.7** Assign distinct colors to each migration route.

---

## Phase 95: Bird Distribution Heatmap

- [x] **95.1** Create `HeatmapLayer.tsx` component in `src/components/three/`.
- [x] **95.2** Generate heatmap data from bird coordinates using Gaussian kernel.
- [x] **95.3** Implement blue-green-red color gradient shader.
- [x] **95.4** Add `heatmapVisible` state to Zustand store.
- [x] **95.5** Add "Bird Diversity Map" toggle button to RightControlPanel.
- [x] **95.6** Integrate HeatmapLayer into GlobeScene.
- [x] **95.7** Ensure heatmap is semi-transparent and doesn't obscure globe.

---

## Phase 96: AR Bird Viewing Mode

- [x] **96.1** Create `ARViewerModal.tsx` component in `src/components/ui/`.
- [x] **96.2** Implement camera access via `navigator.mediaDevices.getUserMedia`.
- [x] **96.3** Render 3D bird model overlay on camera feed.
- [x] **96.4** Add touch controls for rotate and zoom.
- [x] **96.5** Add `arViewerBirdId` state to Zustand store.
- [x] **96.6** Add "View in AR" button to BirdInfoCard.
- [x] **96.7** Implement graceful fallback for unsupported devices.
- [x] **96.8** Integrate ARViewerModal into App.tsx.

---

## Phase 97: Enhanced Bird Click Animations

- [x] **97.1** Add hop animation phase to BirdMarker click sequence.
- [x] **97.2** Add look-toward-camera animation phase.
- [x] **97.3** Add short circle flight animation phase.
- [x] **97.4** Implement animation state machine with phase tracking.
- [x] **97.5** Ensure total animation duration ~1.3s.
- [x] **97.6** Verify animations feel playful and child-friendly.

---

## Phase 98: UI Layout Hardening

- [x] **98.1** Verify BirdInfoCard strict flex-column layout with zero absolute positioning inside card.
- [x] **98.2** Verify tag row wraps correctly on narrow screens.
- [x] **98.3** Verify card max-height 80vh with overflow-y auto.
- [x] **98.4** Verify sidebar buttons identical size, vertically aligned.
- [x] **98.5** Verify no UI overlap between any panels at all viewport sizes.
- [x] **98.6** Verify glass-morphism style applied correctly.
- [x] **98.7** Verify typography hierarchy: Chinese name large bold, English medium, pinyin small.

---

## Phase 99: Performance Optimization

- [x] **99.1** Verify model lazy loading works with 50+ birds.
- [x] **99.2** Verify max 15 simultaneous 3D models enforced.
- [x] **99.3** Implement KTX2 texture compression where possible.
- [x] **99.4** Verify ~60 FPS during all interactions.
- [x] **99.5** Verify audio lazy loading on demand.
- [x] **99.6** Verify compressed textures load correctly.

---

## Phase 100: Final Verification (v12)

- [x] **100.1** 50+ birds in dataset. (AC-V12-1)
- [x] **100.2** All birds have complete data fields. (AC-V12-1)
- [x] **100.3** Migration routes display animated arcs. (AC-V12-2)
- [x] **100.4** Moving dots along migration paths. (AC-V12-2)
- [x] **100.5** Heatmap layer toggleable. (AC-V12-3)
- [x] **100.6** Blue-green-red gradient correct. (AC-V12-3)
- [x] **100.7** AR viewer opens camera with 3D model. (AC-V12-4)
- [x] **100.8** Graceful AR fallback. (AC-V12-4)
- [x] **100.9** Enhanced click animations work. (AC-V12-5)
- [x] **100.10** UI layout rules enforced. (AC-V12-6)
- [x] **100.11** Max 15 simultaneous 3D models. (AC-V12-7)
- [x] **100.12** ~60 FPS maintained. (AC-V12-7)
- [x] **100.13** Fun facts short and exciting. (AC-V12-8)
- [x] **100.14** Wingspan bar works. (AC-V12-8)

---

# v11 Tasks (Full-Scope Upgrade)

---

## Phase 85: Bird Discovery System

- [x] **85.1** Add `discoveredBirds` state to Zustand store with localStorage persistence.
- [x] **85.2** Add `discoverBird(birdId)` action that marks a bird as discovered on first click.
- [x] **85.3** Add `discoveryNotification` state for "New bird discovered!" notification.
- [x] **85.4** Create `DiscoveryNotification` component with celebration animation.
- [x] **85.5** Auto-dismiss discovery notification after 3 seconds.
- [x] **85.6** Integrate discovery tracking into BirdMarker click handler.

---

## Phase 86: Exploration Progress System

- [x] **86.1** Create `DiscoveryProgressBar` component showing global progress (e.g. "12/50 Birds Found").
- [x] **86.2** Add continent-level progress breakdown (e.g. "Asia: 3/8").
- [x] **86.3** Add visual progress bar with animated fill.
- [x] **86.4** Position in HUD layer (z-index 10), no overlap with other UI.
- [x] **86.5** Progress updates in real-time as birds are discovered.

---

## Phase 87: Bird Click Animation

- [x] **87.1** Add click animation state tracking in BirdMarker (click timestamp, animation phase).
- [x] **87.2** Implement rapid wing flap animation on click (0.5s duration).
- [x] **87.3** Implement bird lift animation (0.02 units along surface normal).
- [x] **87.4** Implement bird rotate-toward-camera on click.
- [x] **87.5** Ensure animation is short, playful, and non-blocking.

---

## Phase 88: Dataset Expansion to 40+

- [x] **88.1** Add additional birds to reach 40+ total in birds.json.
- [x] **88.2–88.13** Individual bird additions and data verification.
- [x] **88.14** Verify all birds have complete data fields including soundUrl.

---

## Phase 89–92: UI Layout Hardening, MyBirdsPanel, Performance, Verification

- [x] All tasks complete. See v11 task details.

---

# v10 Tasks (Major Upgrade)

---

## Phase 76–84: UI Layout, 3D Models, Dataset, Sound, Performance, Design, Verification

- [x] All tasks complete. See v10 task details.

---

# v8 Tasks (Core Interactive Learning)

---

## Phase 56–64: Data Model, UI System, Info Card, Markers, Collection, Region, Quests, Loading, Globe

- [x] All tasks complete. See v8 task details.

---

# v9 Tasks (Exploration Expansion)

---

## Phase 65–75: Migration, Tour, Guide, Quiz, Rarity, Radar, Stories, Consistency, Responsive, Performance, Verification

- [x] All tasks complete. See v9 task details.

---

# v26 Tasks (Dynamic World Simulation)

---

## Phase 198: Enhanced Day/Night Cycle

- [x] **198.1** Increase sun rotation speed to 0.03 rad/s for more visible day/night cycle.
- [x] **198.2** Improve city lights shader with smooth per-fragment fade based on sun angle.
- [x] **198.3** Create `TimeIndicator.tsx` HUD component showing time of day (morning/afternoon/evening/night).
- [x] **198.4** Add time-of-day state to store based on sun angle.

---

## Phase 199: Weather Zone System

- [x] **199.1** Create weather configuration data in `/src/data/weather.json` defining weather per region.
- [x] **199.2** Create `WeatherSystem.ts` in `/src/systems/` managing weather state.
- [x] **199.3** Create `CloudCluster.tsx` component rendering billboard cloud sprites above regions.
- [x] **199.4** Create `RainParticles.tsx` component with vertical particle streams.
- [x] **199.5** Create `StormEffect.tsx` component with dark clouds and lightning flash.
- [x] **199.6** Integrate weather components into GlobeScene.
- [x] **199.7** Add weather toggle button to RightControlPanel.
- [x] **199.8** Add `weatherVisible` state to store.

---

## Phase 200: Bird Activity Variation

- [x] **200.1** Add `activityPeriod` field to Bird type: "diurnal" | "nocturnal" | "crepuscular".
- [x] **200.2** Update birds.json with activityPeriod for all 53 birds.
- [x] **200.3** Compute sun angle at each bird's lat/lng in BirdMarker.
- [x] **200.4** Adjust bird marker opacity based on activity period and sun angle.
- [x] **200.5** Add nocturnal bird eye-glow shader effect.
- [x] **200.6** Crepuscular birds visible during dawn/dusk transitions.

---

## Phase 201: V26 Verification

- [x] **201.1** Day/night cycle with visible sun rotation. (AC-V26-1)
- [x] **201.2** City lights smooth on night side. (AC-V26-1)
- [x] **201.3** Weather effects visible in regions. (AC-V26-1)
- [x] **201.4** Bird activity varies with time of day. (AC-V26-1)
- [x] **201.5** Time indicator in HUD. (AC-V26-1)
- [x] **201.6** 60 FPS maintained. (AC-V26-1)

---

# v27 Tasks (Flocking System)

---

## Phase 202: Boids Algorithm

- [x] **202.1** Create `FlockingSystem.ts` in `/src/systems/` with boids computation.
- [x] **202.2** Implement separation force (avoid crowding neighbors).
- [x] **202.3** Implement alignment force (match neighbor heading).
- [x] **202.4** Implement cohesion force (move toward group center).
- [x] **202.5** Add species-specific flock parameters: flockSize, speed, altitudeRange, wanderRadius.
- [x] **202.6** Add flock data to birds.json or separate flock config.
- [x] **202.7** Implement globe surface collision avoidance.

---

## Phase 203: Flock Rendering

- [x] **203.1** Create `FlockRenderer.tsx` component using InstancedMesh per flock.
- [x] **203.2** Update instance matrices per frame from boids positions.
- [x] **203.3** Implement spatial hashing grid for O(1) neighbor lookups.
- [x] **203.4** Throttle distant flock updates to every 2 frames.
- [x] **203.5** Enforce maximum 8 active flocks visible.
- [x] **203.6** Add animation phase offsets for wing-flap variety.
- [x] **203.7** Integrate FlockRenderer into GlobeScene.

---

## Phase 204: V27 Verification

- [x] **204.1** Birds move in natural-looking flocks. (AC-V27-1)
- [x] **204.2** Boids behaviors visible. (AC-V27-1)
- [x] **204.3** Species have different flock parameters. (AC-V27-1)
- [x] **204.4** GPU-friendly rendering confirmed. (AC-V27-1)
- [x] **204.5** 60 FPS maintained. (AC-V27-1)

---

# v28 Tasks (Story Mode)

---

## Phase 205: Story System

- [x] **205.1** Create story data in `/src/data/stories-adventure.json` with three stories.
- [x] **205.2** Add story types to `types.ts`: Story, StoryStep, StoryState.
- [x] **205.3** Create `StorySystem.ts` in `/src/systems/` with story lifecycle management.
- [x] **205.4** Add story state to store: activeStory, storyStep, storyState, storyModeActive.
- [x] **205.5** Add localStorage persistence for completed stories.

---

## Phase 206: Story Camera

- [x] **206.1** Implement camera auto-travel between story locations in CameraController.
- [x] **206.2** Add cinematic zoom-out-then-in effect during travel.
- [x] **206.3** Disable OrbitControls during story camera travel.
- [x] **206.4** Travel duration proportional to angular distance (1-3s).

---

## Phase 207: Story Narration

- [x] **207.1** Integrate Web Speech API narration for story steps.
- [x] **207.2** Narration starts when camera arrives at location.
- [x] **207.3** Add fallback text display when speech unavailable.
- [x] **207.4** Voice selection: friendly, rate 0.9.

---

## Phase 208: Story Panel UI

- [x] **208.1** Create `StoryModePanel.tsx` in `/src/components/ui/`.
- [x] **208.2** Story selection view with story cards.
- [x] **208.3** Playback view with narration text and progress dots.
- [x] **208.4** Controls: play/pause, next step, exit story.
- [x] **208.5** Featured bird golden glow highlight effect.
- [x] **208.6** Story completion badge award.
- [x] **208.7** Add "Stories" button to RightControlPanel.
- [x] **208.8** Integrate into App.tsx modal layer.

---

## Phase 209: V28 Verification

- [x] **209.1** Story selection panel works. (AC-V28-1)
- [x] **209.2** Camera auto-travels between locations. (AC-V28-1)
- [x] **209.3** Narration plays at each step. (AC-V28-1)
- [x] **209.4** Featured birds highlighted. (AC-V28-1)
- [x] **209.5** Controls work (play/pause/skip/exit). (AC-V28-1)
- [x] **209.6** Story completion awards badge. (AC-V28-1)
- [x] **209.7** 60 FPS maintained. (AC-V28-1)

---

# v29 Tasks (Shareable Discoveries)

---

## Phase 210: Screenshot Capture

- [x] **210.1** Add "Screenshot" button to RightControlPanel.
- [x] **210.2** Implement canvas capture via `gl.domElement.toDataURL('image/png')`.
- [x] **210.3** Add flash animation overlay (white fade 0.3s).
- [x] **210.4** Trigger browser download with timestamped filename.

---

## Phase 211: Share Card Generator

- [x] **211.1** Create `ShareCardGenerator.ts` utility in `/src/utils/`.
- [x] **211.2** Render bird info to off-screen canvas (600x400px).
- [x] **211.3** Include bird name, region, fun fact, app branding.
- [x] **211.4** Export as PNG via toDataURL.
- [x] **211.5** Add "Share" button to BirdInfoCard.

---

## Phase 212: Progress Export

- [x] **212.1** Create `exportProgress()` utility function.
- [x] **212.2** Collect all localStorage data (discoveries, achievements, expeditions).
- [x] **212.3** Serialize to JSON and trigger browser download.
- [x] **212.4** Add "Export" button to control panel or share panel.

---

## Phase 213: Share Panel UI

- [x] **213.1** Create `SharePanel.tsx` in `/src/components/ui/`.
- [x] **213.2** Show recent screenshots as thumbnails.
- [x] **213.3** "Copy to Clipboard" and "Download" buttons.
- [x] **213.4** Glass UI styling.
- [x] **213.5** Add "Share" button to RightControlPanel.
- [x] **213.6** Integrate into App.tsx modal layer.

---

## Phase 214: V29 Verification

- [x] **214.1** Screenshot capture downloads PNG. (AC-V29-1)
- [x] **214.2** Flash animation on capture. (AC-V29-1)
- [x] **214.3** Share card generates with bird info. (AC-V29-1)
- [x] **214.4** Progress export downloads JSON. (AC-V29-1)
- [x] **214.5** Share panel works. (AC-V29-1)
- [x] **214.6** 60 FPS maintained. (AC-V29-1)

---

# v30 Tasks (Educational Layer)

---

## Phase 215: Enhanced Encyclopedia

- [x] **215.1** Rebuild `BirdEncyclopediaPanel.tsx` with advanced filter system.
- [x] **215.2** Add continent filter (multi-select checkboxes).
- [x] **215.3** Add diet type filter (checkbox group).
- [x] **215.4** Add wingspan range filter (small/medium/large buttons).
- [x] **215.5** Combine filters with AND logic, search with OR on names.
- [x] **215.6** Responsive grid layout for results.

---

## Phase 216: Detailed Bird Entry

- [x] **216.1** Create `BirdEntryPanel.tsx` in `/src/components/ui/`.
- [x] **216.2** Add 3D model preview with rotating bird in small Canvas.
- [x] **216.3** Add habitat map with mini SVG globe highlighting region.
- [x] **216.4** Add sound playback with waveform bars animation.
- [x] **216.5** Add facts grid: habitat, diet, wingspan, lifespan, fun fact.
- [x] **216.6** Slide-in animation (right on desktop, bottom on mobile).

---

## Phase 217: Performance Monitoring

- [x] **217.1** Create `PerformanceMonitor.tsx` component.
- [x] **217.2** Display FPS, draw calls, triangles, textures from renderer.info.
- [x] **217.3** Hidden by default, activated via triple-tap or URL param `?perf=1`.
- [x] **217.4** Semi-transparent overlay in top-right corner.

---

## Phase 218: Dynamic LOD Tuning

- [x] **218.1** Track rolling average FPS over 60 frames in Engine.ts.
- [x] **218.2** If avg FPS < 45: increase LOD distance by 0.5.
- [x] **218.3** If avg FPS > 55: decrease LOD distance by 0.25.
- [x] **218.4** Clamp LOD distance between 1.5 and 5.0.
- [x] **218.5** Store dynamic LOD distance in Zustand store.

---

## Phase 219: Asset Preloading

- [x] **219.1** Implement progressive asset preloading on app start.
- [x] **219.2** Priority order: Earth textures → bird models → sound files.
- [x] **219.3** Show loading progress in LoadingScreen.
- [x] **219.4** Background preloading continues after initial render.

---

## Phase 220: Texture Compression

- [x] **220.1** Add KTX2/Basis texture support where available.
- [x] **220.2** Fallback to standard textures on unsupported devices.
- [x] **220.3** Create texture atlas for bird silhouettes.
- [x] **220.4** Lazy texture loading for off-screen content.

---

## Phase 221: V30 Verification

- [x] **221.1** Encyclopedia with search and filters works. (AC-V30-1)
- [x] **221.2** Bird entries show 3D preview and habitat map. (AC-V30-1)
- [x] **221.3** Sound playback in encyclopedia works. (AC-V30-1)
- [x] **221.4** Performance monitoring available. (AC-V30-1)
- [x] **221.5** Dynamic LOD tuning adjusts based on FPS. (AC-V30-1)
- [x] **221.6** Asset preloading shows progress. (AC-V30-1)
- [x] **221.7** 60 FPS maintained with all V30 features. (AC-V30-1)

---

## Summary (v30)

| Group                          | Tasks           | Status             |
| ------------------------------ | --------------- | ------------------ |
| Core Module Setup (v21)        | 174.1–174.5     | Complete           |
| Systems Module Setup (v21)     | 175.1–175.7     | Complete           |
| Data Separation (v21)          | 176.1–176.3     | Complete           |
| Component Rewiring (v21)       | 177.1–177.3     | Complete           |
| V21 Verification               | 178.1–178.5     | Complete           |
| **Total v21 tasks**            | **23 tasks**    | **23 complete**    |
| Bird Database Expansion (v22)  | 179.1–179.4     | Complete           |
| Region Clusters (v22)          | 180.1–180.5     | Complete           |
| V22 Verification               | 181.1–181.4     | Complete           |
| **Total v22 tasks**            | **13 tasks**    | **13 complete**    |
| Model LOD System (v23)         | 182.1–182.4     | Complete           |
| Lazy Loading (v23)             | 183.1–183.4     | Complete           |
| Instanced Markers (v23)        | 184.1–184.4     | Complete           |
| Render Loop Optimization (v23) | 185.1–185.4     | Complete           |
| V23 Verification               | 186.1–186.4     | Complete           |
| **Total v23 tasks**            | **20 tasks**    | **20 complete**    |
| Atmosphere Glow (v24)          | 187.1–187.3     | Complete           |
| Cloud Layer (v24)              | 188.1–188.3     | Complete           |
| Sun Light & Shadows (v24)      | 189.1–189.4     | Complete           |
| Marker Visuals (v24)           | 190.1–190.4     | Complete           |
| Camera Inertia (v24)           | 191.1–191.3     | Complete           |
| V24 Verification               | 192.1–192.6     | Complete           |
| **Total v24 tasks**            | **23 tasks**    | **23 complete**    |
| Expedition System (v25)        | 193.1–193.6     | Complete           |
| Mission Panel (v25)            | 194.1–194.7     | Complete           |
| Progress Tracker (v25)         | 195.1–195.4     | Complete           |
| Completion Celebration (v25)   | 196.1–196.4     | Complete           |
| V25 Verification               | 197.1–197.7     | Complete           |
| **Total v25 tasks**            | **28 tasks**    | **28 complete**    |
| Enhanced Day/Night (v26)       | 198.1–198.4     | Complete           |
| Weather Zones (v26)            | 199.1–199.8     | Complete           |
| Bird Activity (v26)            | 200.1–200.6     | Complete           |
| V26 Verification               | 201.1–201.6     | Complete           |
| **Total v26 tasks**            | **24 tasks**    | **24 complete**    |
| Boids Algorithm (v27)          | 202.1–202.7     | Complete           |
| Flock Rendering (v27)          | 203.1–203.7     | Complete           |
| V27 Verification               | 204.1–204.5     | Complete           |
| **Total v27 tasks**            | **19 tasks**    | **19 complete**    |
| Story System (v28)             | 205.1–205.5     | Complete           |
| Story Camera (v28)             | 206.1–206.4     | Complete           |
| Story Narration (v28)          | 207.1–207.4     | Complete           |
| Story Panel UI (v28)           | 208.1–208.8     | Complete           |
| V28 Verification               | 209.1–209.7     | Complete           |
| **Total v28 tasks**            | **28 tasks**    | **28 complete**    |
| Screenshot Capture (v29)       | 210.1–210.4     | Complete           |
| Share Card Generator (v29)     | 211.1–211.5     | Complete           |
| Progress Export (v29)          | 212.1–212.4     | Complete           |
| Share Panel UI (v29)           | 213.1–213.6     | Complete           |
| V29 Verification               | 214.1–214.6     | Complete           |
| **Total v29 tasks**            | **25 tasks**    | **25 complete**    |
| Enhanced Encyclopedia (v30)    | 215.1–215.6     | Complete           |
| Detailed Bird Entry (v30)      | 216.1–216.6     | Complete           |
| Performance Monitoring (v30)   | 217.1–217.4     | Complete           |
| Dynamic LOD Tuning (v30)       | 218.1–218.5     | Complete           |
| Asset Preloading (v30)         | 219.1–219.4     | Complete           |
| Texture Compression (v30)      | 220.1–220.4     | Complete           |
| V30 Verification               | 221.1–221.7     | Complete           |
| **Total v30 tasks**            | **36 tasks**    | **36 complete**    |
| **Total v20 tasks**            | **36 tasks**    | **36 complete**    |
| **Total v19 tasks**            | **36 tasks**    | **36 complete**    |
| **Total v18 tasks**            | **28 tasks**    | **28 complete**    |
| **Total v17 tasks**            | **30 tasks**    | **30 complete**    |
| **Total all tasks (v1–v30)**   | **~1267 tasks** | **~1169 complete** |

---

# v31 Tasks (Structured Learning Experience)

---

## Phase 222: AI Guide Knowledge Base & Fallback

- [ ] **222.1** Create `/src/data/bird-knowledge.json` with 100+ Q&A pairs covering behavior, habitat, diet, appearance, migration.
- [ ] **222.2** Create `/src/data/bird_facts.json` with prewritten fallback answers for common questions.
- [ ] **222.3** Upgrade `AIGuideSystem.ts` in `/src/systems/` with enhanced keyword-based question routing.
- [ ] **222.4** Add question categories: "why", "how", "what", "where" with pattern matching.
- [ ] **222.5** Add fallback responses for unmatched questions using bird_facts.json.
- [ ] **222.6** Add AI guide types to `types.ts`: LearningTrack, TrackProgress, WorldState, HabitatFilterType.

---

## Phase 223: AI Guide Service Layer

- [ ] **223.1** Create `/src/features/` directory for v31 feature modules.
- [ ] **223.2** Create `BirdGuideService.ts` — orchestrates question routing and answer retrieval.
- [ ] **223.3** Create `PromptBuilder.ts` — constructs context from bird encyclopedia database.
- [ ] **223.4** Create `ResponseRenderer.ts` — formats answers with typing animation support.
- [ ] **223.5** BirdGuideService checks for API key; if absent, uses bird_facts.json fallback.

---

## Phase 224: AI Guide UI Upgrade

- [ ] **224.1** Upgrade `AIBirdGuidePanel.tsx` with BirdGuideService integration.
- [ ] **224.2** Implement speech bubble with glass-morphism styling.
- [ ] **224.3** Add typing animation (30ms per character reveal) via ResponseRenderer.
- [ ] **224.4** Add narration button triggering Web Speech API.
- [ ] **224.5** Add guide character avatar with bobbing CSS animation.
- [ ] **224.6** Position in card layer (z-60), bottom-left area.
- [ ] **224.7** Add predefined question prompts when bird is selected.
- [ ] **224.8** Add floating "Ask the Bird Guide" button in sidebar.
- [ ] **224.9** Integrate into App.tsx card layer.

---

## Phase 225b: Learning Track Data Model

- [ ] **225b.1** Create `/src/data/learning-tracks.json` with 5 tracks: Birds of Prey, Ocean Birds, Rainforest Birds, Migratory Birds, Colorful Birds.
- [ ] **225b.2** Each track contains: id, name, nameZh, description, descriptionZh, birdIds (5-10), badgeIcon.
- [ ] **225b.3** Create `LearningTrackSystem.ts` in `/src/systems/` with track management.
- [ ] **225b.4** Add TrackProgress type and localStorage persistence.
- [ ] **225b.5** Track completion detection: cross-reference discoveredBirds with track birdIds.
- [ ] **225b.6** Add track state to store: `learningTracksOpen`, `trackProgress`, `trackNotification`.
- [ ] **225b.7** Export track functions from systems/index.ts barrel.

---

## Phase 226b: Learning Track UI

- [ ] **226b.1** Create `TrackPanel.tsx` in `/src/components/ui/`.
- [ ] **226b.2** Show list of 5 learning tracks with progress bars.
- [ ] **226b.3** Each track card shows: name, description, discovered/total birds, progress bar.
- [ ] **226b.4** Completed tracks show earned badge with glow effect.
- [ ] **226b.5** Track completion triggers celebration animation (confetti + badge reveal).
- [ ] **226b.6** Add "Learning Tracks" button to RightControlPanel.
- [ ] **226b.7** Integrate TrackPanel into App.tsx modal layer.
- [ ] **226b.8** Add `learningTracks` to PanelType and panel collision avoidance.

---

## Phase 227b: Ecosystem Simulation

- [ ] **227b.1** Create `EcosystemSystem.ts` in `/src/systems/` managing world state.
- [ ] **227b.2** Implement season cycle: spring → summer → autumn → winter (configurable speed, default 60s/year).
- [ ] **227b.3** Create `SeasonController.ts` in `/src/features/` for smooth season transitions.
- [ ] **227b.4** Add world state to store: `currentSeason`, `ecosystemState` (temperature, wind, timeOfDay).
- [ ] **227b.5** Season influences bird density: winter → more equatorial, summer → more northern.
- [ ] **227b.6** Add season indicator to HUD (icon + season name).
- [ ] **227b.7** Ecosystem simulation ticks every 500ms (not per-frame).
- [ ] **227b.8** Export ecosystem functions from systems/index.ts barrel.

---

## Phase 228b: Habitat Filter

- [ ] **228b.1** Create `HabitatFilter.ts` in `/src/features/` with filter logic.
- [ ] **228b.2** Define 6 habitat types: forest, wetlands, ocean, grassland, mountain, urban.
- [ ] **228b.3** Map existing bird habitatType fields to filter categories.
- [ ] **228b.4** Add filter state to store: `activeHabitatFilters` (string array).
- [ ] **228b.5** Add habitat filter toggle buttons in sidebar (RightControlPanel).
- [ ] **228b.6** Non-matching birds render at 0.1 opacity when filter active.
- [ ] **228b.7** Filter badge shows count of active filters.
- [ ] **228b.8** Memoized filtered bird list for performance.

---

## Phase 229b: Seasonal Migration Visualization

- [ ] **229b.1** Create `MigrationVisualizer.ts` in `/src/features/` integrating with EcosystemSystem.
- [ ] **229b.2** Migration arcs only render during autumn and spring seasons.
- [ ] **229b.3** Add glowing arc lines with emissive shader.
- [ ] **229b.4** Add directional particle flow along migration paths.
- [ ] **229b.5** Particles move in migration direction with configurable speed.
- [ ] **229b.6** Paths hidden during summer and winter (non-migration seasons).
- [ ] **229b.7** Update MigrationPaths.tsx to read season state from ecosystem.

---

## Phase 230b: Data Expansion

- [ ] **230b.1** Create `/src/data/birds/` directory structure.
- [ ] **230b.2** Create `index.json` — master index with bird IDs and region references.
- [ ] **230b.3** Create `regions/asia.json` with Asian bird data.
- [ ] **230b.4** Create `regions/europe.json` with European bird data.
- [ ] **230b.5** Create `regions/americas.json` with Americas bird data.
- [ ] **230b.6** Create `BirdDataLoader.ts` in `/src/features/` with lazy loading support.
- [ ] **230b.7** Loader reads index at startup, loads regional files on demand.
- [ ] **230b.8** Cache loaded regions in memory Map.
- [ ] **230b.9** Backward compatible fallback to monolithic birds.json.

---

## Phase 231b: V31 Verification

- [ ] **231b.1** AI Bird Guide character visible with idle animation. (AC-V31-1)
- [ ] **231b.2** Guide responds with child-friendly answers via BirdGuideService. (AC-V31-1)
- [ ] **231b.3** Fallback to prewritten answers when no API key. (AC-V31-1)
- [ ] **231b.4** 5 learning tracks available in sidebar. (AC-V31-2)
- [ ] **231b.5** Track progress bars update as birds discovered. (AC-V31-2)
- [ ] **231b.6** Completing a track unlocks badge with celebration. (AC-V31-2)
- [ ] **231b.7** Season cycle runs with HUD indicator. (AC-V31-3)
- [ ] **231b.8** Bird density shifts with seasons. (AC-V31-3)
- [ ] **231b.9** Habitat filter toggles work in sidebar. (AC-V31-4)
- [ ] **231b.10** Migration arcs appear only during migration seasons. (AC-V31-5)
- [ ] **231b.11** Regional JSON files loadable with lazy loading. (AC-V31-6)
- [ ] **231b.12** 60 FPS maintained with all V31 features. (AC-V31-6)

---

# v32 Tasks (AR Bird Mode)

---

## Phase 225: Enhanced AR Mode

- [ ] **225.1** Enhance `ARViewerModal.tsx` with WebXR session request.
- [ ] **225.2** Implement hit-test for surface detection.
- [ ] **225.3** Add touch controls: pinch-to-scale, drag-to-rotate.
- [ ] **225.4** Bird plays idle animation in AR mode.
- [ ] **225.5** Create `ARSystem.ts` in `/src/systems/` for AR session management.
- [ ] **225.6** Implement fallback simulated AR with camera feed and gyroscope.

---

## Phase 226: AR UI Overlay

- [ ] **226.1** Add "Enter AR" button enhancement to bird info card.
- [ ] **226.2** AR overlay with place/animation/exit buttons.
- [ ] **226.3** Instructions overlay for surface detection.
- [ ] **226.4** Screenshot button in AR mode.
- [ ] **226.5** Clean enter/exit AR transitions.

---

## Phase 227: V32 Verification

- [ ] **227.1** WebXR AR mode launches on supported devices. (AC-V32-1)
- [ ] **227.2** Camera feed visible as background. (AC-V32-1)
- [ ] **227.3** Bird animations play in AR. (AC-V32-1)
- [ ] **227.4** Touch controls work. (AC-V32-1)
- [ ] **227.5** Fallback simulated AR works. (AC-V32-1)

---

# v33 Tasks (Advanced Bird Animation)

---

## Phase 228: Animation State Machine

- [ ] **228.1** Create `AnimationSystem.ts` in `/src/systems/` with state machine.
- [ ] **228.2** Implement takeoff animation: crouch + rapid flaps + lift.
- [ ] **228.3** Implement landing animation: descend + spread wings + settle.
- [ ] **228.4** Implement perching behavior: head turns + tail flicks (5-15s).
- [ ] **228.5** Implement inter-habitat flight: curved arc between regions.
- [ ] **228.6** Add 0.3s crossfade blending between states.
- [ ] **228.7** Per-bird random timing via phase offsets.

---

## Phase 229: Anchor Points

- [ ] **229.1** Define anchor point data per habitat region.
- [ ] **229.2** 3-5 anchor points per region at surface level.
- [ ] **229.3** Birds select random anchor within habitat for perching.
- [ ] **229.4** Integrate anchor points with BirdMarker animation.

---

## Phase 230: V33 Verification

- [ ] **230.1** Takeoff animation plays correctly. (AC-V33-1)
- [ ] **230.2** Landing animation plays correctly. (AC-V33-1)
- [ ] **230.3** Birds perch for 5-15 seconds. (AC-V33-1)
- [ ] **230.4** Inter-habitat flight works. (AC-V33-1)
- [ ] **230.5** 60 FPS maintained. (AC-V33-1)

---

# v34 Tasks (Bird Photographer Game)

---

## Phase 231: Photographer System

- [ ] **231.1** Create `PhotographerSystem.ts` in `/src/systems/` with scoring algorithm.
- [ ] **231.2** Implement distance scoring (max 30 points).
- [ ] **231.3** Implement pose scoring (max 30 points).
- [ ] **231.4** Implement composition scoring with rule-of-thirds (max 20 points).
- [ ] **231.5** Implement rarity bonus multiplier (max 20 points).
- [ ] **231.6** Add photographer state to store: `photographerModeActive`, `photographerScore`.
- [ ] **231.7** Score to star rating mapping (1-5 stars).

---

## Phase 232: Photographer UI

- [ ] **232.1** Create `PhotographerMode.tsx` in `/src/components/ui/`.
- [ ] **232.2** Viewfinder overlay with rule-of-thirds grid.
- [ ] **232.3** Score popup animation after capture.
- [ ] **232.4** Star rating display.
- [ ] **232.5** Timer mode (60 seconds).
- [ ] **232.6** Add "Photographer" button to RightControlPanel.
- [ ] **232.7** Integrate into App.tsx overlay layer.

---

## Phase 233: V34 Verification

- [ ] **233.1** Photographer mode accessible. (AC-V34-1)
- [ ] **233.2** Scoring works correctly. (AC-V34-1)
- [ ] **233.3** Star rating displayed. (AC-V34-1)
- [ ] **233.4** Timer mode works. (AC-V34-1)
- [ ] **233.5** 60 FPS maintained. (AC-V34-1)

---

# v35 Tasks (Habitat Ecosystems)

---

## Phase 234: Biome System

- [ ] **234.1** Create `/src/data/biomes.json` with four biome zone definitions.
- [ ] **234.2** Create `BiomeSystem.ts` in `/src/systems/` managing biome state.
- [ ] **234.3** Create `BiomeEffects.tsx` in `/src/components/three/` for visual effects.
- [ ] **234.4** Implement rainforest effects: green tint, floating leaf particles.
- [ ] **234.5** Implement savannah effects: amber tint, dust particles.
- [ ] **234.6** Implement arctic effects: blue-white tint, snow particles.
- [ ] **234.7** Implement ocean effects: turquoise tint, wave shimmer.
- [ ] **234.8** Smooth biome transitions based on camera position.

---

## Phase 235: Biome Audio

- [ ] **235.1** Extend `AudioSystem.ts` with ambient sound management.
- [ ] **235.2** Implement volume fade based on camera distance and zoom.
- [ ] **235.3** Web Audio API GainNode for smooth crossfading.
- [ ] **235.4** Add `biomeAudioEnabled` state to store.

---

## Phase 236: Biome Bird Assignment

- [ ] **236.1** Add `biome` field to Bird type in types.ts.
- [ ] **236.2** Update birds.json with biome assignments.
- [ ] **236.3** Add biome filter to encyclopedia.
- [ ] **236.4** Biome info displayed in bird info card.

---

## Phase 237: V35 Verification

- [ ] **237.1** Four biome zones visible. (AC-V35-1)
- [ ] **237.2** Particle effects per biome. (AC-V35-1)
- [ ] **237.3** Ambient sounds play. (AC-V35-1)
- [ ] **237.4** Biome filter works. (AC-V35-1)
- [ ] **237.5** 60 FPS maintained. (AC-V35-1)

---

# v36 Tasks (Real Migration Data)

---

## Phase 238: Real Migration Data

- [ ] **238.1** Expand `migrations.json` with 10+ species migration routes.
- [ ] **238.2** Add waypoint arrays with lat/lng for each route.
- [ ] **238.3** Add distance (km), duration (days), season, fun fact per route.
- [ ] **238.4** Add migration info popup on route tap.
- [ ] **238.5** Add `migrationSpeed` state to store (1x/2x/5x).

---

## Phase 239: Migration Visualization Enhancement

- [ ] **239.1** Enhance `MigrationPaths.tsx` with thicker gradient arcs.
- [ ] **239.2** Add bird silhouette icon animating along path.
- [ ] **239.3** Add season indicator per route.
- [ ] **239.4** Add migration speed control UI.
- [ ] **239.5** Multiple simultaneous migration animations.

---

## Phase 240: V36 Verification

- [ ] **240.1** 10+ migration routes present. (AC-V36-1)
- [ ] **240.2** Bird silhouette icons animate. (AC-V36-1)
- [ ] **240.3** Route tap shows facts. (AC-V36-1)
- [ ] **240.4** Speed control works. (AC-V36-1)
- [ ] **240.5** 60 FPS maintained. (AC-V36-1)

---

# v37 Tasks (Advanced Visual Rendering)

---

## Phase 241: HDR Lighting

- [ ] **241.1** Add ACES Filmic tone mapping to Canvas.
- [ ] **241.2** Create procedural environment map.
- [ ] **241.3** Exposure adjustment based on time of day.
- [ ] **241.4** Environment map influences bird materials.

---

## Phase 242: Volumetric Clouds

- [ ] **242.1** Enhance `CloudLayer.tsx` with 3 layers at different altitudes.
- [ ] **242.2** Different rotation speeds and opacities per layer.
- [ ] **242.3** Cloud density variation by region.
- [ ] **242.4** Soft shadow casting from clouds.

---

## Phase 243: Atmospheric Scattering

- [ ] **243.1** Enhance `AtmosphereShell.tsx` with Rayleigh scattering shader.
- [ ] **243.2** Blue atmosphere at globe edges.
- [ ] **243.3** Orange/red tint during dawn/dusk.
- [ ] **243.4** Scattering varies with sun angle.

---

## Phase 244: V37 Verification

- [ ] **244.1** HDR lighting with tone mapping. (AC-V37-1)
- [ ] **244.2** Multi-layer clouds visible. (AC-V37-1)
- [ ] **244.3** Atmospheric scattering at edges. (AC-V37-1)
- [ ] **244.4** Dawn/dusk color transitions. (AC-V37-1)
- [ ] **244.5** 60 FPS maintained. (AC-V37-1)

---

# v38 Tasks (Bird Encyclopedia Pro)

---

## Phase 245: Encyclopedia Pro Filters

- [ ] **245.1** Enhance `BirdEncyclopediaPanel.tsx` with full-text search.
- [ ] **245.2** Add wingspan range slider (0-300cm).
- [ ] **245.3** Add activity period filter.
- [ ] **245.4** Add rarity filter.
- [ ] **245.5** Add sort options (name, wingspan, rarity).
- [ ] **245.6** Active filter count badge.

---

## Phase 246: Enhanced Bird Entry

- [ ] **246.1** Enhance `BirdEntryPanel.tsx` with orbit controls on 3D preview.
- [ ] **246.2** Interactive mini-globe for habitat range.
- [ ] **246.3** Waveform visualization for bird call.
- [ ] **246.4** Multiple fun facts (3-5 cards).
- [ ] **246.5** Size comparison visualization.
- [ ] **246.6** Related birds section.

---

## Phase 247: V38 Verification

- [ ] **247.1** Full-text search works. (AC-V38-1)
- [ ] **247.2** All filters functional. (AC-V38-1)
- [ ] **247.3** Sort options work. (AC-V38-1)
- [ ] **247.4** 3D preview with orbit controls. (AC-V38-1)
- [ ] **247.5** 60 FPS maintained. (AC-V38-1)

---

# v39 Tasks (Classroom Mode)

---

## Phase 248: Classroom System

- [ ] **248.1** Create `/src/data/lessons.json` with 4 lesson plans.
- [ ] **248.2** Create `ClassroomSystem.ts` in `/src/systems/`.
- [ ] **248.3** Add teacher mode activation (long-press 3s on title).
- [ ] **248.4** Add classroom state to store: `classroomModeActive`, `presentationMode`.
- [ ] **248.5** Teacher panel with bird/migration/quiz/region/time/weather controls.

---

## Phase 249: Presentation UI

- [ ] **249.1** Create `ClassroomPanel.tsx` in `/src/components/ui/`.
- [ ] **249.2** Fullscreen presentation mode hiding non-essential UI.
- [ ] **249.3** Large text scaling (1.5x) for projection.
- [ ] **249.4** Teacher floating toolbar.
- [ ] **249.5** Guided lesson step navigation.
- [ ] **249.6** Add "Classroom" indicator to HUD when active.

---

## Phase 250: V39 Verification

- [ ] **250.1** Teacher mode activatable. (AC-V39-1)
- [ ] **250.2** Teacher controls work. (AC-V39-1)
- [ ] **250.3** Guided lessons available. (AC-V39-1)
- [ ] **250.4** Presentation mode works. (AC-V39-1)
- [ ] **250.5** 60 FPS maintained. (AC-V39-1)

---

# v40 Tasks (Exploration Sandbox)

---

## Phase 251: Sandbox System

- [ ] **251.1** Create `SandboxSystem.ts` in `/src/systems/`.
- [ ] **251.2** Implement bird spawner: tap globe to place bird at lat/lng.
- [ ] **251.3** Bird type selector palette.
- [ ] **251.4** Spawned birds animate with flock behavior.
- [ ] **251.5** Maximum 50 spawned birds enforcement.
- [ ] **251.6** Flock creator: select birds, adjust speed/size.
- [ ] **251.7** Time control slider (0-24h → sun angle).
- [ ] **251.8** Weather toggles per region.
- [ ] **251.9** Add sandbox state to store: `sandboxModeActive`, `spawnedBirds`, `sandboxTimeHour`.

---

## Phase 252: Sandbox UI

- [ ] **252.1** Create `SandboxToolbar.tsx` in `/src/components/ui/`.
- [ ] **252.2** Bird spawner palette (scrollable grid).
- [ ] **252.3** Time slider with sun/moon icon.
- [ ] **252.4** Weather toggle icons.
- [ ] **252.5** Flock speed/size sliders.
- [ ] **252.6** "Clear All" button with confirmation.
- [ ] **252.7** Sandbox mode indicator in HUD.
- [ ] **252.8** Add "Sandbox" button to RightControlPanel.
- [ ] **252.9** Integrate into App.tsx bottom panel layer.

---

## Phase 253: V40 Verification

- [ ] **253.1** Sandbox mode toggleable. (AC-V40-1)
- [ ] **253.2** Tap to spawn birds works. (AC-V40-1)
- [ ] **253.3** Flock creation works. (AC-V40-1)
- [ ] **253.4** Time slider changes lighting. (AC-V40-1)
- [ ] **253.5** Weather toggles work. (AC-V40-1)
- [ ] **253.6** Max 50 spawned birds enforced. (AC-V40-1)
- [ ] **253.7** Reset clears all. (AC-V40-1)
- [ ] **253.8** 60 FPS maintained. (AC-V40-1)

---

## Summary (v31-v40)

| Group                          | Tasks           | Status             |
| ------------------------------ | --------------- | ------------------ |
| AI Guide Knowledge Base (v31)  | 222.1–222.6     | Pending            |
| AI Guide Service Layer (v31)   | 223.1–223.5     | Pending            |
| AI Guide UI Upgrade (v31)      | 224.1–224.9     | Pending            |
| Learning Track Data (v31)      | 225b.1–225b.7   | Pending            |
| Learning Track UI (v31)        | 226b.1–226b.8   | Pending            |
| Ecosystem Simulation (v31)     | 227b.1–227b.8   | Pending            |
| Habitat Filter (v31)           | 228b.1–228b.8   | Pending            |
| Seasonal Migration (v31)       | 229b.1–229b.7   | Pending            |
| Data Expansion (v31)           | 230b.1–230b.9   | Pending            |
| V31 Verification               | 231b.1–231b.12  | Pending            |
| **Total v31 tasks**            | **79 tasks**    | **0 complete**     |
| Enhanced AR Mode (v32)         | 225.1–225.6     | Pending            |
| AR UI Overlay (v32)            | 226.1–226.5     | Pending            |
| V32 Verification               | 227.1–227.5     | Pending            |
| **Total v32 tasks**            | **16 tasks**    | **0 complete**     |
| Animation State Machine (v33)  | 228.1–228.7     | Pending            |
| Anchor Points (v33)            | 229.1–229.4     | Pending            |
| V33 Verification               | 230.1–230.5     | Pending            |
| **Total v33 tasks**            | **16 tasks**    | **0 complete**     |
| Photographer System (v34)      | 231.1–231.7     | Pending            |
| Photographer UI (v34)          | 232.1–232.7     | Pending            |
| V34 Verification               | 233.1–233.5     | Pending            |
| **Total v34 tasks**            | **19 tasks**    | **0 complete**     |
| Biome System (v35)             | 234.1–234.8     | Pending            |
| Biome Audio (v35)              | 235.1–235.4     | Pending            |
| Biome Bird Assignment (v35)    | 236.1–236.4     | Pending            |
| V35 Verification               | 237.1–237.5     | Pending            |
| **Total v35 tasks**            | **21 tasks**    | **0 complete**     |
| Real Migration Data (v36)      | 238.1–238.5     | Pending            |
| Migration Visualization (v36)  | 239.1–239.5     | Pending            |
| V36 Verification               | 240.1–240.5     | Pending            |
| **Total v36 tasks**            | **15 tasks**    | **0 complete**     |
| HDR Lighting (v37)             | 241.1–241.4     | Pending            |
| Volumetric Clouds (v37)        | 242.1–242.4     | Pending            |
| Atmospheric Scattering (v37)   | 243.1–243.4     | Pending            |
| V37 Verification               | 244.1–244.5     | Pending            |
| **Total v37 tasks**            | **17 tasks**    | **0 complete**     |
| Encyclopedia Pro Filters (v38) | 245.1–245.6     | Pending            |
| Enhanced Bird Entry (v38)      | 246.1–246.6     | Pending            |
| V38 Verification               | 247.1–247.5     | Pending            |
| **Total v38 tasks**            | **17 tasks**    | **0 complete**     |
| Classroom System (v39)         | 248.1–248.5     | Pending            |
| Presentation UI (v39)          | 249.1–249.6     | Pending            |
| V39 Verification               | 250.1–250.5     | Pending            |
| **Total v39 tasks**            | **16 tasks**    | **0 complete**     |
| Sandbox System (v40)           | 251.1–251.9     | Pending            |
| Sandbox UI (v40)               | 252.1–252.9     | Pending            |
| V40 Verification               | 253.1–253.8     | Pending            |
| **Total v40 tasks**            | **26 tasks**    | **0 complete**     |
| **Total v31-v40 tasks**        | **242 tasks**   | **0 complete**     |
| **Total all tasks (v1–v40)**   | **~1509 tasks** | **~1169 complete** |

---

# v31 Addendum Tasks (Discovery & Comparison Learning Layer)

---

## Phase 232b: Discover Mission System

- [x] **232b.1** Create `/src/data/discover-missions.json` with predefined discovery missions.
- [x] **232b.2** Create `DiscoverMissionSystem.ts` in `/src/systems/` with mission tracking.
- [x] **232b.3** Add `DiscoveryMission` and `DiscoveryBadge` types to `types.ts`.
- [x] **232b.4** Add discovery mission state to store.
- [x] **232b.5** Add localStorage persistence for discovery badges.
- [x] **232b.6** Wire mission progress to bird discovery events.
- [x] **232b.7** Create `DiscoverMissionsPanel.tsx`.
- [x] **232b.8** Add "Discover Missions" button to `RightControlPanel.tsx`.

---

## Phase 233b: Bird Compare Panel

- [x] **233b.1** Add compare mode state to store.
- [x] **233b.2** Create `BirdComparePanel.tsx` with side-by-side layout.
- [x] **233b.3** Render stat rows: wingspan, weight, habitat, diet, flight speed.
- [x] **233b.4** Highlight larger numeric values in green.
- [x] **233b.5** Add "Compare" button to `RightControlPanel.tsx`.
- [x] **233b.6** Integrate `BirdComparePanel` into `App.tsx` modal layer.

---

## Phase 234b: Evolution Timeline Enhancement

- [x] **234b.1** Create `/src/data/evolution-eras.json` with era definitions.
- [x] **234b.2** Add `evolutionTimelineValue` state to store.
- [x] **234b.3** Enhance `EvolutionTimeline.tsx` with slider control and era info cards.
- [x] **234b.4** Era filtering: non-matching birds fade when slider active.

---

## Phase 235b: Data Schema Update

- [x] **235b.1** Add `flightSpeed` field to Bird interface.
- [x] **235b.2** Update `birds.json` with flightSpeed values.

---

## Phase 236b: Right Panel Layout Fix

- [x] **236b.1** Add scrollable container to RightControlPanel.
- [x] **236b.2** Ensure all buttons have equal width.

---

## Phase 237b: V31 Addendum Verification

- [x] **237b.1** Bird Compare Mode works. (AC-V31-2)
- [x] **237b.2** Discovery missions work. (AC-V31-2)
- [x] **237b.3** Evolution timeline slider works. (AC-V31-2)
- [x] **237b.4** Right panel layout fixed. (AC-V31-2)
- [x] **237b.5** Build passes. (AC-V31-2)

---

## Phase 238b: V33 — UI Mode Store Setup

- [ ] **238b.1** Add `UIMode` type to `types.ts`.
- [ ] **238b.2** Add `uiMode` and `birdCardExpanded` state to store.
- [ ] **238b.3** Add `setUIMode` and `setBirdCardExpanded` actions to store.

---

## Phase 239b: V33 — MainModePanel

- [ ] **239b.1** Create `MainModePanel.tsx` in `/src/components/ui/`.
- [ ] **239b.2** Implement mode selector (Explore / Learn / Play) with space-science styling.
- [ ] **239b.3** Implement context tool panel per mode.
- [ ] **239b.4** Add utility actions (Screenshot, Share, Reset) always visible.
- [ ] **239b.5** Replace `RightControlPanel` with `MainModePanel` in `App.tsx`.

---

## Phase 240b: V33 — BirdInfoCard Compact/Expanded

- [ ] **240b.1** Add compact mode to `BirdInfoCard.tsx` (name, image, quick stats, max 160px).
- [ ] **240b.2** Add expand/collapse toggle arrow icon.
- [ ] **240b.3** Wire `birdCardExpanded` store state.

---

## Phase 241b: V33 — Migration Arc Enhancement

- [ ] **241b.1** Enhance `MigrationPaths.tsx` arc glow shader.
- [ ] **241b.2** Add particle trail meshes to `FlyingBirdIcon`.
- [ ] **241b.3** Improve distance label styling.

---

## Phase 242b: V33 — ScienceHUD

- [ ] **242b.1** Create `ScienceHUD.tsx` in `/src/components/ui/`.
- [ ] **242b.2** Display latitude, longitude, biome, season, temperature.
- [ ] **242b.3** Space-science styling (dark translucent, glowing borders).
- [ ] **242b.4** Add `ScienceHUD` to sidebar layer in `App.tsx`.

---

## Phase 243b: V33 — Integration & Verification

- [ ] **243b.1** Right side panel shows only 3 modes. (AC-V33)
- [ ] **243b.2** Mode switching updates tool panel. (AC-V33)
- [ ] **243b.3** Bird card supports compact and expanded modes. (AC-V33)
- [ ] **243b.4** Migration routes display animated arcs. (AC-V33)
- [ ] **243b.5** HUD shows location information. (AC-V33)
- [ ] **243b.6** Build passes. (AC-V33)

---

## Phase 244b: V34 — Migration Journey Data

- [ ] **244b.1** Create `/src/data/migration-journeys.json` with 4 journeys (Arctic Tern, Swan, Pacific Flyway, Amazon Loop).
- [ ] **244b.2** Each journey has stops with lat/lng, name (zh/en), birdIds, seasons.
- [ ] **244b.3** Add `MigrationJourney`, `JourneyStop`, `JourneyProgress` types to `types.ts`.

---

## Phase 245b: V34 — Store State for Journeys

- [ ] **245b.1** Add `activeJourneyId`, `journeyProgress`, `visitedStops`, `journeyPanelOpen` to store.
- [ ] **245b.2** Add `setActiveJourney`, `visitStop`, `completeJourney`, `setJourneyPanelOpen` actions.
- [ ] **245b.3** Add `journeyPanel` to `PanelType` union.
- [ ] **245b.4** Persist journey progress to localStorage.

---

## Phase 246b: V34 — Journey Route Rendering

- [ ] **246b.1** Create `JourneyRoute.tsx` in `/src/components/three/`.
- [ ] **246b.2** Generate CatmullRomCurve3 from journey stops using `latLngToVector3`.
- [ ] **246b.3** Render path with animated glow ShaderMaterial.
- [ ] **246b.4** Add clickable stop markers (glowing spheres).
- [ ] **246b.5** Animate bird icon along path.
- [ ] **246b.6** Implement LOD: hide bird animation when camera > 3.0.

---

## Phase 247b: V34 — Migration Journey Panel

- [ ] **247b.1** Create `MigrationJourneyPanel.tsx` in `/src/components/ui/`.
- [ ] **247b.2** Display journey list with cards (name, stops, progress, badge).
- [ ] **247b.3** Start/resume journey button.
- [ ] **247b.4** Season filter: only show journeys active in current season.

---

## Phase 248b: V34 — Season Selector

- [ ] **248b.1** Create `SeasonSelector.tsx` in `/src/components/ui/`.
- [ ] **248b.2** Display 4 season buttons (Spring/Summer/Autumn/Winter).
- [ ] **248b.3** Wire to `setCurrentSeason` store action.
- [ ] **248b.4** Position top-right corner below language toggle.

---

## Phase 249b: V34 — Integration

- [ ] **249b.1** Add `MigrationJourneyPanel` to App.tsx modal layer.
- [ ] **249b.2** Add `SeasonSelector` to App.tsx sidebar layer.
- [ ] **249b.3** Add `JourneyRoute` to `GlobeScene.tsx`.
- [ ] **249b.4** Add "Migration Journeys" button to MainModePanel Explore tools.
- [ ] **249b.5** Wire journey panel open/close via `setActivePanel`.

---

## Phase 250b: V34 — UI Refactor

- [ ] **250b.1** Fix bottom-left button layout: flex-direction column, gap 12px.
- [ ] **250b.2** Consistent button style: width 180px, height 44px, border-radius 12px.
- [ ] **250b.3** Safe margins: left 20px, bottom 20px.

---

## Phase 251b: V34 — Verification

- [ ] **251b.1** Migration journey data loads correctly. (AC-V34)
- [ ] **251b.2** Journey selection panel opens from Explore mode. (AC-V34)
- [ ] **251b.3** Journey routes render as glowing animated paths. (AC-V34)
- [ ] **251b.4** Stop markers are clickable. (AC-V34)
- [ ] **251b.5** Season selector changes journey availability. (AC-V34)
- [ ] **251b.6** LOD hides bird animation when camera is far. (AC-V34)
- [ ] **251b.7** Build passes without errors. (AC-V34)

---

# v35-labels Tasks (Smart Continent Label System)

---

## Phase 252b: Backside Occlusion

- [ ] **252b.1** Compute normalized label direction vector from lat/lng position.
- [ ] **252b.2** Compute camera direction vector (normalized camera position).
- [ ] **252b.3** Calculate dot product of label direction and camera direction.
- [ ] **252b.4** Hide label when `dot < 0` (backside of globe).

---

## Phase 253b: Horizon Fade

- [ ] **253b.1** Apply smooth opacity fade for labels near globe horizon.
- [ ] **253b.2** Opacity formula: `clamp((dot - 0.05) / 0.2, 0, 1)`.
- [ ] **253b.3** Labels at `dot < 0` fully hidden, `dot >= 0.15` fully visible.

---

## Phase 254b: Label LOD System

- [ ] **254b.1** Define major label set: `north-america`, `europe`, `asia`.
- [ ] **254b.2** Camera distance > 4.0: hide all labels.
- [ ] **254b.3** Camera distance > 3.0: show only major labels.
- [ ] **254b.4** Camera distance <= 3.0: show all labels.

---

## Phase 255b: Distance-Based Label Scaling

- [ ] **255b.1** Compute scale factor: `clamp(2 / distance, 0.6, 1.4)`.
- [ ] **255b.2** Apply scale via CSS transform on label container.

---

## Phase 256b: V35-labels Verification

- [ ] **256b.1** Labels hidden when continent is behind the globe. (AC-V35-labels)
- [ ] **256b.2** Labels fade smoothly near the globe horizon. (AC-V35-labels)
- [ ] **256b.3** Labels reduce density when zoomed out. (AC-V35-labels)
- [ ] **256b.4** Label size scales with camera distance. (AC-V35-labels)
- [ ] **256b.5** Build succeeds without errors. (AC-V35-labels)
- [ ] **256b.6** 60 FPS maintained. (AC-V35-labels)

---

# V33 Tasks (AI Bird Guide)

---

## Phase 265: Types & PromptTemplate System

- [ ] **265.1** Add `KnowledgeResult` interface to `types.ts` (text, textZh, source: "static" | "cache" | "ai").
- [ ] **265.2** Add `PromptTemplate` interface to `types.ts` (id, system, user template strings).
- [ ] **265.3** Add `TTSStatus` type to `types.ts` ("idle" | "speaking" | "unavailable").
- [ ] **265.4** Create `src/features/prompt-templates.ts` — template registry with `getTemplate(id)` and `renderTemplate(template, vars)`.
- [ ] **265.5** Define `bird-explain` template: system prompt for kid-friendly educator, user prompt with `{{birdName}}`, `{{habitat}}`, `{{funFact}}`, `{{diet}}`, `{{region}}` variables.

---

## Phase 266: AIProvider Abstraction

- [ ] **266.1** Create `src/features/ai-provider.ts` — `AIProvider` interface with `id`, `isAvailable()`, `generate(system, user)`.
- [ ] **266.2** Implement `OpenAIProvider` class using `VITE_OPENAI_API_KEY` and `gpt-4o-mini`.
- [ ] **266.3** `generate()` returns `{ text: string; textZh: string } | null`.
- [ ] **266.4** `isAvailable()` checks for API key presence.
- [ ] **266.5** Error handling: return `null` on network/auth/parse failures.

---

## Phase 267: KnowledgeCache

- [ ] **267.1** Create `src/features/knowledge-cache.ts` — localStorage-backed cache.
- [ ] **267.2** Key format: `bird-guide-cache-{birdId}`.
- [ ] **267.3** `get(birdId)` returns `{ text, textZh, timestamp } | null`.
- [ ] **267.4** `set(birdId, result)` stores with current timestamp.
- [ ] **267.5** LRU eviction at 200 entries max.

---

## Phase 268: KnowledgeService Orchestrator

- [ ] **268.1** Create `src/features/KnowledgeService.ts` — single `queryBirdExplanation(birdId): Promise<KnowledgeResult>`.
- [ ] **268.2** L1: Build static explanation from bird data fields via PromptTemplate rendering.
- [ ] **268.3** L2: Check KnowledgeCache. If hit, return with `source: "cache"`.
- [ ] **268.4** L3: If AIProvider available, render prompt, call provider, cache result, return with `source: "ai"`.
- [ ] **268.5** Fallback: If L3 fails or unavailable, return L1 with `source: "static"`.
- [ ] **268.6** Enforce ≤100 word limit on all returned explanations.

---

## Phase 269: TTS Service

- [ ] **269.1** Create `src/features/tts-service.ts` — `speak(text, lang)`, `stop()`, `isAvailable()`.
- [ ] **269.2** Use `SpeechSynthesisUtterance` with rate 0.9.
- [ ] **269.3** Language: `zh-CN` for Chinese, `en-US` for English.
- [ ] **269.4** Cancel current speech on `stop()` or new `speak()` call.

---

## Phase 270: Store Integration

- [ ] **270.1** Add `birdExplanation: KnowledgeResult | null` to store interface.
- [ ] **270.2** Add `birdExplanationLoading: boolean` to store interface.
- [ ] **270.3** Add `ttsStatus: TTSStatus` to store interface.
- [ ] **270.4** Add `requestBirdExplanation(birdId: string)` async action — calls KnowledgeService, sets result.
- [ ] **270.5** Add `clearBirdExplanation()` action.
- [ ] **270.6** Add `speakExplanation()` action — triggers TTS with current explanation.
- [ ] **270.7** Add `stopSpeaking()` action.

---

## Phase 271: UI — BirdInfoCard Button

- [ ] **271.1** Add "Tell me about this bird!" / "给我讲讲这只鸟！" button to `BirdInfoCard.tsx`.
- [ ] **271.2** Button dispatches `requestBirdExplanation(selectedBirdId)`.
- [ ] **271.3** Button disabled while `birdExplanationLoading` is true.
- [ ] **271.4** Minimum tap size 56px.

---

## Phase 272: UI — AIBirdGuidePanel Upgrade

- [ ] **272.1** Show explanation text with `ResponseRenderer` typing animation when `birdExplanation` is set.
- [ ] **272.2** Show loading spinner during AI call (`birdExplanationLoading`).
- [ ] **272.3** Show TTS play button after typing completes.
- [ ] **272.4** Show source badge: "📚 Local" / "💾 Cached" / "🤖 AI".
- [ ] **272.5** TTS button calls `speakExplanation()` store action.
- [ ] **272.6** Panel auto-opens when explanation arrives.
- [ ] **272.7** Clear explanation on panel close.

---

## Phase 273: Integration & Verification

- [ ] **273.1** Wire `BirdInfoCard` button to store `requestBirdExplanation`.
- [ ] **273.2** Wire `AIBirdGuidePanel` to read `birdExplanation` and `birdExplanationLoading` from store.
- [ ] **273.3** Verify L1 → L2 → L3 query order (static → cache → AI).
- [ ] **273.4** Verify each bird triggers AI at most once (second click returns cache).
- [ ] **273.5** Verify offline mode works (L1 static data returned).
- [ ] **273.6** Verify no hardcoded prompts (all via PromptTemplate).
- [ ] **273.7** Verify no direct API calls in UI components.
- [ ] **273.8** Verify TTS playback works.
- [ ] **273.9** Build passes without TypeScript errors. (AC-V33-guide)
- [ ] **273.10** 60 FPS maintained. (AC-V33-guide)

---

# V33 Upgrade Tasks — Mode-Driven HUD + Knowledge System Hardening

## Phase 280: Types — Replace UIMode with AppMode

- [ ] **280.1** Add `AppMode` type: `"explore" | "migration" | "learning"` to `types.ts`.
- [ ] **280.2** Deprecate `UIMode` type (keep as alias for backward compat during migration).
- [ ] **280.3** Verify no TypeScript errors after type addition.

---

## Phase 281: Store — AppMode Integration

- [ ] **281.1** Replace `uiMode: UIMode` with `appMode: AppMode` in store interface.
- [ ] **281.2** Replace `setUIMode` with `setAppMode` action.
- [ ] **281.3** Update initial state: `appMode: "explore"`.
- [ ] **281.4** Update all internal references from `uiMode` to `appMode`.
- [ ] **281.5** Verify store compiles without errors.

---

## Phase 282: ModeGate Component

- [ ] **282.1** Create `src/components/ui/ModeGate.tsx`.
- [ ] **282.2** Implement: reads `appMode` from store, returns `null` if mode not in allowed list.
- [ ] **282.3** Export `ModeGate` and `MODE_VISIBILITY` map.

---

## Phase 283: App.tsx — Mode-Driven Rendering

- [ ] **283.1** Import `ModeGate` in `App.tsx`.
- [ ] **283.2** Wrap sidebar panels (ScienceHUD, SeasonSelector, etc.) with appropriate `ModeGate`.
- [ ] **283.3** Wrap bottom panels (GuidedTour, BottomDiscoveryPanel, TimelinePanel) with `ModeGate`.
- [ ] **283.4** Wrap card panels (BirdInfoCard, AIBirdGuidePanel, MigrationInfoCard) with `ModeGate`.
- [ ] **283.5** Wrap modal panels with `ModeGate`.
- [ ] **283.6** Keep always-visible components unwrapped (LoadingScreen, PerformanceMonitor, AudioPlayer).
- [ ] **283.7** Verify all panels render correctly in each mode.

---

## Phase 284: MainModePanel — Mode Selector Update

- [ ] **284.1** Update MODES array: `explore` → "Explore", `migration` → "Migration", `learning` → "Learning".
- [ ] **284.2** Replace `setUIMode` calls with `setAppMode`.
- [ ] **284.3** Replace `uiMode` reads with `appMode`.
- [ ] **284.4** Update context tools to match new mode names.
- [ ] **284.5** Verify mode switching works end-to-end.

---

## Phase 285: KnowledgeService Hardening

- [ ] **285.1** Add try/catch error boundary around L3 AI call in `queryBirdExplanation`.
- [ ] **285.2** Add timeout (10s) for AI provider calls.
- [ ] **285.3** Ensure L1 static fallback always returns valid data.
- [ ] **285.4** Add input validation for birdId parameter.
- [ ] **285.5** Verify cache-first behavior (L2 before L3).

---

## Phase 286: AIProvider Hardening

- [ ] **286.1** Add AbortController timeout (10s) to fetch call.
- [ ] **286.2** Add response validation (check JSON structure).
- [ ] **286.3** Return null on any error (no thrown exceptions).
- [ ] **286.4** Verify provider works with and without API key.

---

## Phase 287: AIBirdGuidePanel — Remove Direct Speech Calls

- [ ] **287.1** Remove direct `window.speechSynthesis` usage in `handleNarrate`.
- [ ] **287.2** Use store `speakExplanation`/`stopSpeaking` actions instead.
- [ ] **287.3** Verify TTS works through store actions only.

---

## Phase 288: Integration & Verification

- [ ] **288.1** All panels render correctly per mode.
- [ ] **288.2** Mode switching hides/shows correct panels.
- [ ] **288.3** KnowledgeService L1→L2→L3 flow works.
- [ ] **288.4** No direct AI calls in UI components.
- [ ] **288.5** No duplicated feature entry points.
- [ ] **288.6** Globe occupies ≥70% viewport.
- [ ] **288.7** Build passes without TypeScript errors. (AC-V33-mode)
- [ ] **288.8** 60 FPS maintained. (AC-V33-mode)
