# 万羽拾音 (Kids Bird Globe) — Task Breakdown (v20)

> All v1–v7 phases (1–55) are complete (470 tasks).
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
> v20 phases (162–173) are new.

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

## Summary (v18)

| Group | Tasks | Status |
|-------|-------|--------|
| UI Overlap Fix (v18) | 142.1–142.3 | Complete |
| Improved Bird Model (v18) | 143.1–143.3 | Complete |
| Bird Marker Visuals (v18) | 144.1–144.3 | Complete |
| Info Card Sections (v18) | 145.1–145.3 | Complete |
| Discovery Feedback (v18) | 146.1–146.3 | Complete |
| Camera Experience (v18) | 147.1–147.3 | Complete |
| UI Stability (v18) | 148.1–148.3 | Complete |
| Final Verification (v18) | 149.1–149.7 | Complete |
| **Total v18 tasks** | **28 tasks** | **28 complete** |
| Enhanced Mission Panel (v17) | 135.1–135.4 | Complete |
| Photo Mode Overlay (v17) | 136.1–136.4 | Complete |
| Encyclopedia Search & Grouping (v17) | 137.1–137.4 | Complete |
| Achievement Progress Bars (v17) | 138.1–138.3 | Complete |
| Continent Progress & Rotating Tips (v17) | 139.1–139.4 | Complete |
| Enhanced Bird Hints (v17) | 140.1–140.3 | Complete |
| Final Verification (v17) | 141.1–141.8 | Complete |
| **Total v17 tasks** | **30 tasks** | **30 complete** |
| Daily Bird Mission System (v16) | 127.1–127.11 | New |
| Bird Photo Mode (v16) | 128.1–128.10 | New |
| Bird Encyclopedia Enhancement (v16) | 129.1–129.5 | New |
| Explorer Achievement System (v16) | 130.1–130.11 | New |
| Discovery Celebration Enhancement (v16) | 131.1–131.4 | New |
| Exploration Progress & Hints (v16) | 132.1–132.5 | New |
| Performance Optimization (v16) | 133.1–133.5 | New |
| Final Verification (v16) | 134.1–134.8 | New |
| **Total v16 tasks** | **59 tasks** | **0 complete** |
| Real-Time Day-Night Earth (v15) | 119.1–119.5 | New |
| Enhanced Migration Routes (v15) | 120.1–120.4 | New |
| AI Bird Narration System (v15) | 121.1–121.6 | New |
| Bird Discovery Celebration (v15) | 122.1–122.4 | New |
| Enhanced Bird Info Card (v15) | 123.1–123.4 | New |
| Camera Orbit After Arrival (v15) | 124.1–124.4 | New |
| Performance Optimization (v15) | 125.1–125.5 | New |
| Final Verification (v15) | 126.1–126.7 | New |
| **Total v15 tasks** | **39 tasks** | **0 complete** |
| **Total v14 tasks** | **35 tasks** | **35 complete** |
| **Total v13 tasks** | **52 tasks** | **52 complete** |
| **Total v12 tasks** | **51 tasks** | **51 complete** |
| **Total v11 tasks** | **54 tasks** | **54 complete** |
| **Total v10 tasks** | **49 tasks** | **49 complete** |
| **Total v19 tasks** | **36 tasks** | **36 complete** |
| **Total v18 tasks** | **28 tasks** | **28 complete** |
| **Total all tasks (v1–v19)** | **~1008 tasks** | **~910 complete** |
