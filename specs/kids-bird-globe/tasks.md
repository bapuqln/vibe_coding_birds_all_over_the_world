# 万羽拾音 (Kids Bird Globe) — Task Breakdown (v9)

> All v1–v7 phases (1–55) are complete (470 tasks).
> v8 phases (56–64) and v9 phases (65–75) are listed below.

---

# v8 Tasks (Core Interactive Learning)

---

## Phase 56: Data Model Extension (v8)

- [ ] **56.1** Add `Rarity` type to `types.ts`: `"common" | "rare" | "legendary"`.
- [ ] **56.2** Add `Quest`, `CollectedBird`, `StoryTheme` interfaces to `types.ts`.
- [ ] **56.3** Add optional fields to `Bird`: `rarity`, `storyTheme`, `migration_path`.
- [ ] **56.4** Add `rarity` to all 15 birds in `birds.json`.
- [ ] **56.5** Add `storyTheme` to all 15 birds in `birds.json`.
- [ ] **56.6** Create `src/data/quests.json` with 8+ quest definitions.
- [ ] **56.7** Create `src/data/stories.json` with 4 themed exploration sets.
- [ ] **56.8** Extend Zustand store with v8+v9 state (collection, region, quests, tour, guide, radar, tooltip).

---

## Phase 57: UI System — ActionButton + RightControlPanel

- [ ] **57.1** Create `src/components/ui/ActionButton.tsx` with spec styling (44px height, 120px min-width, glass-morphism).
- [ ] **57.2** Create `src/components/ui/RightControlPanel.tsx` container (fixed bottom-right, flex-col, gap-8px).
- [ ] **57.3** Add mobile safe area CSS support with `env(safe-area-inset-*)`.
- [ ] **57.4** Add responsive horizontal layout for screen < 900px.
- [ ] **57.5** Migrate existing buttons (Discover, Quiz, SoundGuess, MigrationMap, Timeline) into RightControlPanel using ActionButton.
- [ ] **57.6** Remove old fixed-position button styling from migrated components.
- [ ] **57.7** Enforce z-index hierarchy across all components.

---

## Phase 58: Bird Info Card Redesign

- [ ] **58.1** Redesign `BirdInfoCard.tsx` as center-bottom modal panel.
- [ ] **58.2** Add sound playback button with play/pause toggle.
- [ ] **58.3** Add "Collect Bird" button with sparkle animation.
- [ ] **58.4** Add rarity badge display.
- [ ] **58.5** Ensure card does not overlap right control panel.
- [ ] **58.6** Springy slide-up animation from bottom.
- [ ] **58.7** Max height 60vh, scrollable content.

---

## Phase 59: Animated Bird Markers + Tooltip

- [ ] **59.1** Add circular flight animation to `BirdMarker.tsx` using sin/cos offset.
- [ ] **59.2** Clicking bird pauses flight animation for 3 seconds.
- [ ] **59.3** Create `BirdTooltip` component showing bird name + region on hover.
- [ ] **59.4** Set `hoveredBirdId` in store on pointer over/out.
- [ ] **59.5** Render tooltip via `<Html>` from drei above bird marker.

---

## Phase 60: Bird Collection System

- [ ] **60.1** Create `src/hooks/useCollection.ts` with localStorage persistence.
- [ ] **60.2** Implement `collectBird` action in Zustand store.
- [ ] **60.3** Load collected birds from localStorage on app init.
- [ ] **60.4** Create `src/components/ui/MyBirdsPanel.tsx` grid display.
- [ ] **60.5** Add sparkle/confetti animation on bird collection.
- [ ] **60.6** Show collection count badge on "Birds" button.
- [ ] **60.7** Add "Already collected" state to info card collect button.

---

## Phase 61: Region Filter

- [ ] **61.1** Define region center coordinates (lat/lng for each of 8 regions).
- [ ] **61.2** Create `src/components/ui/RegionFilterPanel.tsx` with 8 region buttons.
- [ ] **61.3** Implement `setActiveRegion` in store with camera zoom trigger.
- [ ] **61.4** Filter bird visibility based on active region in `GlobeScene.tsx`.
- [ ] **61.5** Add smooth camera animation to region center in `CameraController.tsx`.
- [ ] **61.6** "All Birds" button resets filter and zooms out.

---

## Phase 62: Kid Quest System

- [ ] **62.1** Create `src/systems/QuestManager.ts` with quest progress logic.
- [ ] **62.2** Create `src/hooks/useQuests.ts` with localStorage persistence.
- [ ] **62.3** Create `src/components/ui/QuestPanel.tsx` with quest list and progress bars.
- [ ] **62.4** Track quest progress on bird selection and collection events.
- [ ] **62.5** Award points and badges on quest completion.
- [ ] **62.6** Show completion celebration (confetti + badge reveal).

---

## Phase 63: Loading UI Enhancement

- [ ] **63.1** Update `LoadingScreen.tsx` with staged progress messages.
- [ ] **63.2** Add animated progress bar.
- [ ] **63.3** Show "Loading Earth..." → "Loading Birds..." → "Ready!" stages.

---

## Phase 64: Globe Visual Improvements

- [ ] **64.1** Verify atmosphere glow renders cleanly at all zoom levels.
- [ ] **64.2** Ensure smooth camera transitions for all new features.
- [ ] **64.3** Verify cloud layer renders correctly.

---

# v9 Tasks (Exploration Expansion)

---

## Phase 65: Migration Mode

- [ ] **65.1** Create `src/components/ui/MigrationModePanel.tsx` toggle.
- [ ] **65.2** Add `migrationModeActive` state to store.
- [ ] **65.3** When active, render all migration routes with enhanced visuals.
- [ ] **65.4** Add migration info overlay with route details.

---

## Phase 66: Guided Discovery Tour

- [ ] **66.1** Create `src/systems/TourManager.ts` with waypoint definitions.
- [ ] **66.2** Create `src/components/ui/GuidedTour.tsx` overlay.
- [ ] **66.3** Implement tour state machine (idle → intro → touring → paused → complete).
- [ ] **66.4** Camera auto-navigation between waypoints.
- [ ] **66.5** Show featured bird at each stop.
- [ ] **66.6** Add pause/resume/skip controls.

---

## Phase 67: AI Bird Guide

- [ ] **67.1** Create `src/components/ui/BirdGuide.tsx` with owl avatar.
- [ ] **67.2** Define contextual messages for different user actions.
- [ ] **67.3** Auto-show guide when bird selected, region changed, or idle.
- [ ] **67.4** Auto-dismiss after 5 seconds.
- [ ] **67.5** Position bottom-left, no overlap with other UI.

---

## Phase 68: Enhanced Learning Quiz

- [ ] **68.1** Update `QuizPanel.tsx` to use ActionButton styling.
- [ ] **68.2** Add "Where does this bird live?" question type with map interaction.
- [ ] **68.3** Ensure quiz integrates with new UI system.

---

## Phase 69: Bird Rarity System

- [ ] **69.1** Add rarity visual effects to `BirdMarker.tsx`.
- [ ] **69.2** Rare birds: subtle golden glow ring.
- [ ] **69.3** Legendary birds: particle sparkle effect.
- [ ] **69.4** Rarity badge in info card and collection panel.

---

## Phase 70: Bird Radar

- [ ] **70.1** Create `src/components/ui/BirdRadar.tsx` circular radar display.
- [ ] **70.2** Calculate bird positions relative to camera direction.
- [ ] **70.3** Render dots on radar with pulsing animation.
- [ ] **70.4** Update radar on camera movement.

---

## Phase 71: Story-Based Exploration

- [ ] **71.1** Create `src/components/ui/StoryExplorer.tsx` panel.
- [ ] **71.2** Define 4 themed sets: Rainforest, Arctic, Desert/Grassland, Ocean/Coast.
- [ ] **71.3** Track discovery progress per theme in localStorage.
- [ ] **71.4** Unlock badge on theme completion.

---

# Refactor + Polish Tasks

---

## Phase 72: UI Consistency Pass

- [ ] **72.1** Ensure all panels use consistent rounded corners and warm colors.
- [ ] **72.2** Verify no UI overlap between any panels.
- [ ] **72.3** Verify z-index hierarchy is correct across all components.
- [ ] **72.4** Ensure all buttons use ActionButton component.

---

## Phase 73: Mobile Responsive + Safe Areas

- [ ] **73.1** Test and fix responsive layout at 375px, 768px, 1024px, 1920px.
- [ ] **73.2** Verify safe area insets work on notched devices.
- [ ] **73.3** Horizontal button layout on screens < 900px.

---

## Phase 74: Performance Optimization

- [ ] **74.1** Profile and optimize bird animation performance.
- [ ] **74.2** Ensure ~60 FPS during all interactions.
- [ ] **74.3** Minimize unnecessary re-renders.

---

## Phase 75: Final Verification (v8+v9)

- [ ] **75.1** Run `npx tsc --noEmit` — zero TypeScript errors.
- [ ] **75.2** Run `npm run build` — production build succeeds.
- [ ] **75.3** Bird info card opens as center-bottom modal. (AC-V8-1)
- [ ] **75.4** Animated birds fly around regions. (AC-V8-2)
- [ ] **75.5** Bird collection saves to localStorage. (AC-V8-3)
- [ ] **75.6** Region filter zooms camera and filters birds. (AC-V8-4)
- [ ] **75.7** Quest system tracks progress and awards badges. (AC-V8-5)
- [ ] **75.8** Migration mode shows animated paths. (AC-V9-1)
- [ ] **75.9** Guided tour visits regions automatically. (AC-V9-2)
- [ ] **75.10** Bird guide shows contextual messages. (AC-V9-3)
- [ ] **75.11** Quiz mode works with feedback. (AC-V9-4)
- [ ] **75.12** Rarity effects visible on birds. (AC-V9-5)
- [ ] **75.13** Radar shows nearby birds. (AC-V9-6)
- [ ] **75.14** Story themes track progress. (AC-V9-7)
- [ ] **75.15** ActionButton consistent across all buttons. (AC-UI-1)
- [ ] **75.16** Right control panel has no overlaps. (AC-UI-2)
- [ ] **75.17** Z-index hierarchy correct. (AC-UI-3)
- [ ] **75.18** Mobile safe areas respected. (AC-UI-4)
- [ ] **75.19** Loading UI shows progress. (AC-UI-5)
- [ ] **75.20** Bird tooltip shows on hover. (AC-UI-6)
- [ ] **75.21** ~60 FPS maintained. (AC-PERF)
- [ ] **75.22** OrbitControls target [0,0,0]. (AC-ARCH)
- [ ] **75.23** No scene.add/remove calls. (AC-ARCH)

---

## Summary (v8+v9)

| Group | Tasks | Status |
|-------|-------|--------|
| Data Model (v8) | 56.1–56.8 | Pending |
| UI System | 57.1–57.7 | Pending |
| Bird Info Card | 58.1–58.7 | Pending |
| Animated Birds | 59.1–59.5 | Pending |
| Collection System | 60.1–60.7 | Pending |
| Region Filter | 61.1–61.6 | Pending |
| Quest System | 62.1–62.6 | Pending |
| Loading UI | 63.1–63.3 | Pending |
| Globe Visuals | 64.1–64.3 | Pending |
| Migration Mode | 65.1–65.4 | Pending |
| Guided Tour | 66.1–66.6 | Pending |
| AI Bird Guide | 67.1–67.5 | Pending |
| Enhanced Quiz | 68.1–68.3 | Pending |
| Bird Rarity | 69.1–69.4 | Pending |
| Bird Radar | 70.1–70.4 | Pending |
| Story Exploration | 71.1–71.4 | Pending |
| UI Consistency | 72.1–72.4 | Pending |
| Mobile Responsive | 73.1–73.3 | Pending |
| Performance | 74.1–74.3 | Pending |
| Final Verification | 75.1–75.23 | Pending |
| **Total v8+v9 tasks** | **~105 tasks** | **0 complete** |
| **Total all tasks (v1–v9)** | **~575 tasks** | **470 complete** |
