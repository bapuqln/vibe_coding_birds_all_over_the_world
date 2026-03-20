# 万羽拾音 (Kids Bird Globe) — Task Breakdown (v14)

> All v1–v7 phases (1–55) are complete (470 tasks).
> v8 phases (56–64) and v9 phases (65–75) are complete.
> v10 phases (76–84) are complete.
> v11 phases (85–92) are complete.
> v12 phases (93–100) are complete.
> v13 phases (101–108) are complete.
> v14 phases (109–118) are new.

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

## Summary (v14)

| Group | Tasks | Status |
|-------|-------|--------|
| Glass UI Design System (v14) | 109.1–109.3 | Complete |
| Modern Button Design (v14) | 110.1–110.4 | Complete |
| Globe Visual Improvements (v14) | 111.1–111.4 | Complete |
| Bird Hover Interaction (v14) | 112.1–112.3 | Complete |
| Particle Bird Effects (v14) | 113.1–113.3 | Complete |
| Camera Animation System (v14) | 114.1–114.3 | Complete |
| Bottom Discovery Panel (v14) | 115.1–115.4 | Complete |
| Panel Layout & Responsive (v14) | 116.1–116.3 | Complete |
| Performance Optimization (v14) | 117.1–117.3 | Complete |
| Final Verification (v14) | 118.1–118.8 | Complete |
| **Total v14 tasks** | **35 tasks** | **35 complete** |
| **Total v13 tasks** | **52 tasks** | **52 complete** |
| **Total v12 tasks** | **51 tasks** | **51 complete** |
| **Total v11 tasks** | **54 tasks** | **54 complete** |
| **Total v10 tasks** | **49 tasks** | **49 complete** |
| **Total all tasks (v1–v14)** | **~816 tasks** | **~816 complete** |
