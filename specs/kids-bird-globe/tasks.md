# 万羽拾音 (Kids Bird Globe) — Task Breakdown (v12)

> All v1–v7 phases (1–55) are complete (470 tasks).
> v8 phases (56–64) and v9 phases (65–75) are complete.
> v10 phases (76–84) are complete.
> v11 phases (85–92) are complete.
> v12 phases (93–100) are new.

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

## Summary (v12)

| Group | Tasks | Status |
|-------|-------|--------|
| Dataset Expansion 50+ (v12) | 93.1–93.9 | Complete |
| Migration Route Enhancement (v12) | 94.1–94.7 | Complete |
| Bird Distribution Heatmap (v12) | 95.1–95.7 | Complete |
| AR Bird Viewing (v12) | 96.1–96.8 | Complete |
| Enhanced Animations (v12) | 97.1–97.6 | Complete |
| UI Layout Hardening (v12) | 98.1–98.7 | Complete |
| Performance Optimization (v12) | 99.1–99.6 | Complete |
| Final Verification (v12) | 100.1–100.14 | Complete |
| **Total v12 tasks** | **51 tasks** | **51 complete** |
| **Total v11 tasks** | **54 tasks** | **54 complete** |
| **Total v10 tasks** | **49 tasks** | **49 complete** |
| **Total all tasks (v1–v12)** | **~729 tasks** | **~729 complete** |
