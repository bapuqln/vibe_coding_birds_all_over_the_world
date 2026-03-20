# 万羽拾音 (Kids Bird Globe) — Task Breakdown (v11)

> All v1–v7 phases (1–55) are complete (470 tasks).
> v8 phases (56–64) and v9 phases (65–75) are listed below.
> v10 phases (76–84) are listed below.
> v11 phases (85–92) are new.

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

- [x] **86.1** Create `DiscoveryProgressBar` component showing global progress (e.g. "12/40 Birds Found").
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
- [x] **88.2** Add Resplendent Quetzal (Central America / South America).
- [x] **88.3** Add Blue-footed Booby (South America / Galapagos).
- [x] **88.4** Add Greater Flamingo (Africa / Europe).
- [x] **88.5** Add Golden Eagle (Europe / North America).
- [x] **88.6** Add Barn Owl (worldwide).
- [x] **88.7** Add Ostrich (Africa).
- [x] **88.8** Add Emu (Oceania).
- [x] **88.9** Add Kakapo (Oceania / New Zealand).
- [x] **88.10** Add Magnificent Frigatebird (ocean).
- [x] **88.11** Add King Penguin (Antarctica).
- [x] **88.12** Add Snowy Egret (North America).
- [x] **88.13** Update stories.json with all new bird IDs.
- [x] **88.14** Verify all birds have complete data fields including soundUrl.

---

## Phase 89: UI Layout Hardening

- [x] **89.1** Verify BirdInfoCard strict flex-column layout with zero absolute positioning inside card.
- [x] **89.2** Verify tag row wraps correctly on narrow screens.
- [x] **89.3** Verify card max-height 80vh with overflow-y auto.
- [x] **89.4** Verify sidebar buttons identical size, vertically aligned.
- [x] **89.5** Verify no UI overlap between any panels at all viewport sizes.
- [x] **89.6** Verify glass-morphism style applied correctly.

---

## Phase 90: MyBirdsPanel Enhancement

- [x] **90.1** Update MyBirdsPanel to show discovered birds with full details.
- [x] **90.2** Show locked/undiscovered birds as silhouettes with "?" overlay.
- [x] **90.3** Display discovery count: "12 / 40 birds discovered".
- [x] **90.4** Add continent filter tabs in collection view.

---

## Phase 91: Performance Tuning

- [x] **91.1** Verify model lazy loading works with 40+ birds.
- [x] **91.2** Verify max 15 simultaneous 3D models enforced.
- [x] **91.3** Verify ~60 FPS during all interactions.
- [x] **91.4** Verify audio lazy loading on demand.

---

## Phase 92: Final Verification (v11)

- [x] **92.1** No absolute positioning inside bird info card. (AC-V11-1)
- [x] **92.2** Card uses strict flex-column layout. (AC-V11-1)
- [x] **92.3** Tag row wraps instead of overflowing. (AC-V11-1)
- [x] **92.4** Card has max-height 80vh with overflow-y auto. (AC-V11-1)
- [x] **92.5** Glass-morphism style applied. (AC-V11-1)
- [x] **92.6** Tag colors correct (blue/green/orange). (AC-V11-1)
- [x] **92.7** Click animation: wing flap, lift, rotate. (AC-V11-2)
- [x] **92.8** 40+ birds in dataset. (AC-V11-3)
- [x] **92.9** "Listen" button plays bird sound. (AC-V11-4)
- [x] **92.10** First-time click shows "New bird discovered!" (AC-V11-5)
- [x] **92.11** Global progress bar shows discovery count. (AC-V11-6)
- [x] **92.12** Continent-level progress displayed. (AC-V11-6)
- [x] **92.13** Max 15 simultaneous 3D models. (AC-V11-8)
- [x] **92.14** ~60 FPS maintained. (AC-V11-8)

---

# v10 Tasks (Major Upgrade)

---

## Phase 76: UI Layout Fix — BirdInfoCard Strict Structure

- [x] **76.1** Refactor BirdInfoCard to strict flex-column layout: ImageHeader → TitleSection → FunFact → TagRow → InfoGrid → ActionButtons.
- [x] **76.2** Remove all absolute positioning inside the card content area.
- [x] **76.3** Apply spacing tokens: xs=6px, sm=10px, md=16px, lg=24px, xl=32px between sections.
- [x] **76.4** Set card `max-height: 80vh; overflow-y: auto` so content scrolls.
- [x] **76.5** Apply glass-morphism style: `border-radius: 20px`, soft shadow, semi-transparent background.

---

## Phase 77: UI Layout Fix — Tag Row and Card Scroll

- [x] **77.1** Refactor tag row to use `display: flex; flex-wrap: wrap; gap: 8px`.
- [x] **77.2** Apply tag color rules: continent tags = blue, habitat tags = green, lifespan tags = orange.
- [x] **77.3** Ensure tags wrap instead of overflowing on narrow screens.
- [x] **77.4** Verify card scroll behavior at various content heights.

---

## Phase 78: UI Layout Fix — Sidebar and Control Panel

- [x] **78.1** Ensure all sidebar buttons have identical width and height.
- [x] **78.2** Apply sidebar layout: `position: fixed; left: 24px; top: 120px; flex-direction: column; gap: 16px`.
- [x] **78.3** Verify sidebar buttons never overlap the globe.
- [x] **78.4** Verify right control panel buttons are consistently sized and aligned.

---

## Phase 79: 3D Bird Model System

- [x] **79.1** Update BirdMarker to support GLTFLoader for loading GLB bird models.
- [x] **79.2** Add idle animation (wing flap) to 3D bird models.
- [x] **79.3** Add slow floating motion and gentle rotation.
- [x] **79.4** Implement LOD system: icon marker when far, 3D model when close.
- [x] **79.5** Set model scale to 0.2–0.3 relative to marker size.
- [x] **79.6** Limit max simultaneous 3D models to 15.

---

## Phase 80: Bird Dataset Expansion

- [x] **80.1** Expand birds.json to 30+ birds.
- [x] **80.2** Add South America birds: Andean Condor, Harpy Eagle, Scarlet Macaw, Hoatzin, Toco Toucan.
- [x] **80.3** Add North America birds: Bald Eagle, Snowy Owl, Peregrine Falcon, Canada Goose, California Condor.
- [x] **80.4** Add Africa birds: Secretary Bird, African Grey Parrot, Shoebill, Marabou Stork, Lilac-breasted Roller.
- [x] **80.5** Add Asia birds: Red-crowned Crane, Mandarin Duck, Great Hornbill, Himalayan Monal, Indian Peafowl.
- [x] **80.6** Add Oceania birds: Kookaburra, Cassowary, Kiwi, Sulphur-crested Cockatoo.
- [x] **80.7** Add Polar/ocean birds: Emperor Penguin, Albatross, Puffin, Arctic Tern.
- [x] **80.8** Add soundUrl field to all bird entries.
- [x] **80.9** Update stories.json with new bird IDs.

---

## Phase 81: Bird Sound Feature

- [x] **81.1** Add "Listen" button with speaker icon to BirdInfoCard.
- [x] **81.2** Implement audio playback on button click via xeno-canto or soundUrl.
- [x] **81.3** Add visual feedback during playback (animated audio bars).
- [x] **81.4** Lazy-load audio files on demand.
- [x] **81.5** Add graceful fallback on audio error.

---

## Phase 82: Performance Optimization

- [x] **82.1** Implement model lazy loading — only load when in visible region.
- [x] **82.2** Limit simultaneously visible 3D models to 15.
- [x] **82.3** Fallback to icon markers for distant birds.
- [x] **82.4** Verify ~60 FPS during all interactions.

---

## Phase 83: Child-Friendly Design Polish

- [x] **83.1** Apply glass-morphism card style with soft shadow.
- [x] **83.2** Implement tag color rules: continent=blue, habitat=green, lifespan=orange.
- [x] **83.3** Add "Did you know?" fun fact section styling.
- [x] **83.4** Add habitat tags display.
- [x] **83.5** Verify wingspan visualization bar works with expanded dataset.

---

## Phase 84: Final Verification (v10)

- [x] **84.1** No absolute positioning inside bird info card. (AC-V10-1)
- [x] **84.2** Card uses strict flex-column layout. (AC-V10-1)
- [x] **84.3** Tag row wraps instead of overflowing. (AC-V10-1)
- [x] **84.4** Card has max-height 80vh with overflow-y auto. (AC-V10-1)
- [x] **84.5** Glass-morphism style applied. (AC-V10-1)
- [x] **84.6** Tag colors correct (blue/green/orange). (AC-V10-1)
- [x] **84.7** 3D bird models load via GLTFLoader. (AC-V10-2)
- [x] **84.8** LOD system works (icon far, model close). (AC-V10-2)
- [x] **84.9** 30+ birds in dataset. (AC-V10-3)
- [x] **84.10** "Listen" button plays bird sound. (AC-V10-4)
- [x] **84.11** Max 15 simultaneous 3D models. (AC-V10-5)
- [x] **84.12** ~60 FPS maintained. (AC-V10-5)

---

# v8 Tasks (Core Interactive Learning)

---

## Phase 56: Data Model Extension (v8)

- [x] **56.1** Add `Rarity` type to `types.ts`: `"common" | "rare" | "legendary"`.
- [x] **56.2** Add `Quest`, `CollectedBird`, `StoryTheme` interfaces to `types.ts`.
- [x] **56.3** Add optional fields to `Bird`: `rarity`, `storyTheme`, `migration_path`.
- [x] **56.4** Add `rarity` to all birds in `birds.json`.
- [x] **56.5** Add `storyTheme` to all birds in `birds.json`.
- [x] **56.6** Create `src/data/quests.json` with 8+ quest definitions.
- [x] **56.7** Create `src/data/stories.json` with 4 themed exploration sets.
- [x] **56.8** Extend Zustand store with v8+v9 state.

---

## Phase 57: UI System — ActionButton + RightControlPanel

- [x] **57.1** Create `src/components/ui/ActionButton.tsx` with spec styling.
- [x] **57.2** Create `src/components/ui/RightControlPanel.tsx` container.
- [x] **57.3** Add mobile safe area CSS support.
- [x] **57.4** Add responsive horizontal layout for screen < 900px.
- [x] **57.5** Migrate existing buttons into RightControlPanel.
- [x] **57.6** Remove old fixed-position button styling.
- [x] **57.7** Enforce z-index hierarchy across all components.

---

## Phase 58: Bird Info Card Redesign

- [x] **58.1** Redesign `BirdInfoCard.tsx` as center-bottom modal panel.
- [x] **58.2** Add sound playback button with play/pause toggle.
- [x] **58.3** Add "Collect Bird" button with sparkle animation.
- [x] **58.4** Add rarity badge display.
- [x] **58.5** Ensure card does not overlap right control panel.
- [x] **58.6** Springy slide-up animation from bottom.
- [x] **58.7** Max height 80vh, scrollable content.

---

## Phase 59: Animated Bird Markers + Tooltip

- [x] **59.1** Add circular flight animation to `BirdMarker.tsx`.
- [x] **59.2** Clicking bird pauses flight animation for 3 seconds.
- [x] **59.3** Create `BirdTooltip` showing bird name + region on hover.
- [x] **59.4** Set `hoveredBirdId` in store on pointer over/out.
- [x] **59.5** Render tooltip via `<Html>` from drei above bird marker.

---

## Phase 60: Bird Collection System

- [x] **60.1** Implement `collectBird` action in Zustand store.
- [x] **60.2** Load collected birds from localStorage on app init.
- [x] **60.3** Create `src/components/ui/MyBirdsPanel.tsx` grid display.
- [x] **60.4** Add sparkle/confetti animation on bird collection.
- [x] **60.5** Show collection count badge on "Birds" button.
- [x] **60.6** Add "Already collected" state to info card collect button.

---

## Phase 61: Region Filter

- [x] **61.1** Define region center coordinates.
- [x] **61.2** Create `src/components/ui/RegionFilterPanel.tsx`.
- [x] **61.3** Implement `setActiveRegion` in store with camera zoom trigger.
- [x] **61.4** Filter bird visibility based on active region.
- [x] **61.5** Add smooth camera animation to region center.
- [x] **61.6** "All Birds" button resets filter and zooms out.

---

## Phase 62: Kid Quest System

- [x] **62.1** Create `src/systems/QuestManager.ts`.
- [x] **62.2** Create `src/components/ui/QuestPanel.tsx`.
- [x] **62.3** Track quest progress on bird selection and collection events.
- [x] **62.4** Award points and badges on quest completion.

---

## Phase 63: Loading UI Enhancement

- [x] **63.1** Update `LoadingScreen.tsx` with staged progress messages.
- [x] **63.2** Add animated progress bar.
- [x] **63.3** Show staged loading messages.

---

## Phase 64: Globe Visual Improvements

- [x] **64.1** Verify atmosphere glow renders cleanly.
- [x] **64.2** Ensure smooth camera transitions.
- [x] **64.3** Verify cloud layer renders correctly.

---

# v9 Tasks (Exploration Expansion)

---

## Phase 65: Migration Mode

- [x] **65.1** Add `migrationModeActive` state to store.
- [x] **65.2** When active, render all migration routes with enhanced visuals.
- [x] **65.3** Add migration info overlay with route details.

---

## Phase 66: Guided Discovery Tour

- [x] **66.1** Create `src/components/ui/GuidedTour.tsx` overlay.
- [x] **66.2** Implement tour state machine.
- [x] **66.3** Camera auto-navigation between waypoints.
- [x] **66.4** Show featured bird at each stop.
- [x] **66.5** Add pause/resume/skip controls.

---

## Phase 67: AI Bird Guide

- [x] **67.1** Create `src/components/ui/BirdGuide.tsx` with owl avatar.
- [x] **67.2** Define contextual messages for different user actions.
- [x] **67.3** Auto-show guide when bird selected, region changed, or idle.
- [x] **67.4** Auto-dismiss after 5 seconds.
- [x] **67.5** Position bottom-left, no overlap with other UI.

---

## Phase 68: Enhanced Learning Quiz

- [x] **68.1** Update `QuizPanel.tsx` to use ActionButton styling.
- [x] **68.2** Ensure quiz integrates with new UI system.

---

## Phase 69: Bird Rarity System

- [x] **69.1** Add rarity visual effects to `BirdMarker.tsx`.
- [x] **69.2** Rare birds: subtle golden glow ring.
- [x] **69.3** Legendary birds: particle sparkle effect.
- [x] **69.4** Rarity badge in info card and collection panel.

---

## Phase 70: Bird Radar

- [x] **70.1** Create `src/components/ui/BirdRadar.tsx` circular radar display.
- [x] **70.2** Calculate bird positions relative to camera direction.
- [x] **70.3** Render dots on radar with pulsing animation.
- [x] **70.4** Update radar on camera movement.

---

## Phase 71: Story-Based Exploration

- [x] **71.1** Create `src/components/ui/StoryExplorer.tsx` panel.
- [x] **71.2** Define 4 themed sets.
- [x] **71.3** Track discovery progress per theme in localStorage.
- [x] **71.4** Unlock badge on theme completion.

---

# Refactor + Polish Tasks

---

## Phase 72: UI Consistency Pass

- [x] **72.1** Ensure all panels use consistent rounded corners and warm colors.
- [x] **72.2** Verify no UI overlap between any panels.
- [x] **72.3** Verify z-index hierarchy is correct across all components.
- [x] **72.4** Ensure all buttons use ActionButton component.

---

## Phase 73: Mobile Responsive + Safe Areas

- [x] **73.1** Test and fix responsive layout at 375px, 768px, 1024px, 1920px.
- [x] **73.2** Verify safe area insets work on notched devices.
- [x] **73.3** Horizontal button layout on screens < 900px.

---

## Phase 74: Performance Optimization

- [x] **74.1** Profile and optimize bird animation performance.
- [x] **74.2** Ensure ~60 FPS during all interactions.
- [x] **74.3** Minimize unnecessary re-renders.

---

## Phase 75: Final Verification (v8+v9)

- [x] **75.1** Bird info card opens as center-bottom modal. (AC-V8-1)
- [x] **75.2** Animated birds fly around regions. (AC-V8-2)
- [x] **75.3** Bird collection saves to localStorage. (AC-V8-3)
- [x] **75.4** Region filter zooms camera and filters birds. (AC-V8-4)
- [x] **75.5** Quest system tracks progress and awards badges. (AC-V8-5)
- [x] **75.6** Migration mode shows animated paths. (AC-V9-1)
- [x] **75.7** Guided tour visits regions automatically. (AC-V9-2)
- [x] **75.8** Bird guide shows contextual messages. (AC-V9-3)
- [x] **75.9** Quiz mode works with feedback. (AC-V9-4)
- [x] **75.10** Rarity effects visible on birds. (AC-V9-5)
- [x] **75.11** Radar shows nearby birds. (AC-V9-6)
- [x] **75.12** Story themes track progress. (AC-V9-7)
- [x] **75.13** ActionButton consistent across all buttons. (AC-UI-1)
- [x] **75.14** Right control panel has no overlaps. (AC-UI-2)
- [x] **75.15** Z-index hierarchy correct. (AC-UI-3)
- [x] **75.16** Mobile safe areas respected. (AC-UI-4)
- [x] **75.17** Loading UI shows progress. (AC-UI-5)
- [x] **75.18** Bird tooltip shows on hover. (AC-UI-6)
- [x] **75.19** ~60 FPS maintained. (AC-PERF)

---

## Summary (v11)

| Group | Tasks | Status |
|-------|-------|--------|
| Bird Discovery System (v11) | 85.1–85.6 | Complete |
| Exploration Progress (v11) | 86.1–86.5 | Complete |
| Bird Click Animation (v11) | 87.1–87.5 | Complete |
| Dataset Expansion 40+ (v11) | 88.1–88.14 | Complete |
| UI Layout Hardening (v11) | 89.1–89.6 | Complete |
| MyBirdsPanel Enhancement (v11) | 90.1–90.4 | Complete |
| Performance Tuning (v11) | 91.1–91.4 | Complete |
| Final Verification (v11) | 92.1–92.14 | Complete |
| UI Layout — Card (v10) | 76.1–76.5 | Complete |
| UI Layout — Tags (v10) | 77.1–77.4 | Complete |
| UI Layout — Sidebar (v10) | 78.1–78.4 | Complete |
| 3D Bird Models (v10) | 79.1–79.6 | Complete |
| Dataset Expansion (v10) | 80.1–80.9 | Complete |
| Bird Sound (v10) | 81.1–81.5 | Complete |
| Performance (v10) | 82.1–82.4 | Complete |
| Design Polish (v10) | 83.1–83.5 | Complete |
| Final Verification (v10) | 84.1–84.12 | Complete |
| **Total v11 tasks** | **54 tasks** | **54 complete** |
| **Total v10 tasks** | **49 tasks** | **49 complete** |
| **Total all tasks (v1–v11)** | **~678 tasks** | **~678 complete** |
