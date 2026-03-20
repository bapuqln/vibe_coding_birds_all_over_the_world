# 万羽拾音 (Kids Bird Globe) — Task Breakdown (v6)

> Each task is small and independently implementable.
> Tasks are ordered by dependency — complete top-to-bottom within each group.
> Mapped to spec requirements (R-x), acceptance criteria (AC-x), and bugs (BUG-x).
> All v1–v5 phases (1–34) are complete. v6 phases (35–45) are complete.

---

## 3D Systems

### Sound Ripple System ✅ → R-14, AC-12

- [x] **35.1** Create `src/components/three/SoundRipple.tsx` with expanding `RingGeometry` meshes.
- [x] **35.2** Position rings at bird marker location using `latLngToVector3(lat, lng, 1.02)`.
- [x] **35.3** Orient rings along surface normal using quaternion from bird position.
- [x] **35.4** Animate ring radius from 0 to ~0.08 over ~2 seconds using `useFrame`.
- [x] **35.5** Animate opacity from 0.6 to 0 as rings expand.
- [x] **35.6** Render 2-3 concurrent rings with staggered start times (0ms, 600ms, 1200ms).
- [x] **35.7** Use warm gold color `#fbbf24` with `MeshBasicMaterial`, transparent, additive blending.
- [x] **35.8** Only render when `audioStatus === "playing"` and `selectedBirdId` is set.
- [x] **35.9** Add `<SoundRipple />` inside earth group in `GlobeScene.tsx`.
- [x] **35.10** Verify: rings appear when audio plays, fade out, no performance degradation.

### Habitat Highlight Rendering ✅ → R-15, AC-13

- [x] **36.1** Create `src/components/three/HabitatHighlight.tsx` with `CircleGeometry`.
- [x] **36.2** Map habitat types to colors: rainforest=#22c55e, wetlands=#06b6d4, coast=#3b82f6, grassland=#eab308, forest=#16a34a, polar=#e0f2fe.
- [x] **36.3** Position at globe surface radius 1.003, oriented along surface normal.
- [x] **36.4** Use `MeshBasicMaterial` with additive blending, transparent, depthWrite false.
- [x] **36.5** Radius ~0.15 units. Fade in on bird selection, fade out on deselection.
- [x] **36.6** Read `selectedBirdId` and bird data from store/JSON to get habitat type.
- [x] **36.7** Add `<HabitatHighlight />` inside earth group in `GlobeScene.tsx`.
- [x] **36.8** Verify: colored glow visible on globe, matches habitat type, no clipping.

### Migration Story Animation ✅ → R-17, AC-15

- [x] **38.1** In `MigrationPaths.tsx`, add `FlyingBirdIcon` sub-component: small sphere mesh.
- [x] **38.2** Use `useFrame` to traverse the migration curve over 3 seconds, loop continuously.
- [x] **38.3** Sample position from `CatmullRomCurve3.getPointAt(t)` where `t = (time % 3) / 3`.
- [x] **38.4** Add short fading trail behind the icon using opacity.
- [x] **38.5** Add `MigrationLabel` sub-component using `<Html>` from drei at arc midpoint.
- [x] **38.6** Display bilingual distance text: "This bird travels XXXX km" / "这只鸟每年飞行XXXX公里".
- [x] **38.7** Use `migrationDistanceKm` from migration route data.
- [x] **38.8** Only show label when camera distance < 2.5.
- [x] **38.9** Verify: icon moves along arcs, loops, distance text visible when zoomed in.

### Wing Flap Animation ✅ → R-21, AC-19

- [x] **42.1** In `BirdMarker.tsx`, add Y-axis scale oscillation in `useFrame`.
- [x] **42.2** Period ~1.2 seconds, small amplitude.
- [x] **42.3** Ensure animation does not affect click target bounding box.
- [x] **42.4** Verify: subtle wing animation visible, click targets unaffected.

---

## UI Systems

### Bird Info Card Size Comparison ✅ → R-18, AC-16

- [x] **39.1** In `BirdInfoCard.tsx`, add size comparison section.
- [x] **39.2** Display horizontal bar showing relative size (tiny → large).
- [x] **39.3** Show reference icons: sparrow (tiny), pigeon (small), duck (medium), eagle (large).
- [x] **39.4** Read `sizeCategory` from bird data.
- [x] **39.5** Verify: size bar visible in info card, correct category highlighted.

### Discover Button ✅ → R-16, AC-14

- [x] **37.1** Create `src/components/ui/DiscoverButton.tsx`.
- [x] **37.2** Position in bottom-right corner, large tap target (min 48px).
- [x] **37.3** Bilingual label: "🎲 Discover" / "🎲 发现".
- [x] **37.4** On click: select random bird from birds.json, call `setSelectedBird()`.
- [x] **37.5** Reuse existing camera fly-to, info card, and audio systems.
- [x] **37.6** Verify: button visible, random bird selected on click, camera flies to bird.

### Continent Learning Panel ✅ → R-19, AC-17

- [x] **40.1** Create `src/components/ui/ContinentBirdPanel.tsx`.
- [x] **40.2** Slide-in panel triggered by `continentPanelRegion` state.
- [x] **40.3** List all birds matching the selected continent's region.
- [x] **40.4** Each entry shows bird name + photo thumbnail.
- [x] **40.5** Click entry → `setSelectedBird()` → camera flies to bird.
- [x] **40.6** Close button and click-outside-to-dismiss.
- [x] **40.7** In `MapLabels.tsx`, add click handler on continent labels to set `continentPanelRegion`.
- [x] **40.8** Verify: clicking continent label opens panel, correct birds listed, fly-to works.

### Quiz Panel ✅ → R-20, AC-18

- [x] **41.1** Create `src/components/ui/QuizPanel.tsx` with idle/active/result states.
- [x] **41.2** Idle state: "🎮 Quiz" / "🎮 答题" button.
- [x] **41.3** Active state: question prompt, answer options, progress indicator.
- [x] **41.4** Result state: score display, play-again button.
- [x] **41.5** Confetti animation on correct answer.
- [x] **41.6** Card shake animation on wrong answer.
- [x] **41.7** 3 questions per round, randomly selected from geography/sound/size types.
- [x] **41.8** Verify: quiz flow works end-to-end, confetti/shake animations play.

### Bird Encyclopedia Panel ✅ → R-22, AC-20

- [x] **43.1** Create `src/components/ui/BirdEncyclopediaPanel.tsx`.
- [x] **43.2** Scrollable panel listing all 15 birds.
- [x] **43.3** Each entry: bird photo thumbnail, Chinese name, English name.
- [x] **43.4** Click entry → `setSelectedBird()` → camera flies to bird, info card opens.
- [x] **43.5** Toggle via "📖" button in UI toolbar.
- [x] **43.6** Panel slides in from left side.
- [x] **43.7** Uses `encyclopediaOpen` state in Zustand store.
- [x] **43.8** Verify: panel opens with all birds, clicking entry flies to bird.

---

## Gameplay Systems

### Quiz Manager ✅ → R-20, AC-18

- [x] **41.9** Create `src/systems/QuizManager.ts`.
- [x] **41.10** Generate geography questions: "Find the bird that lives in [region]".
- [x] **41.11** Generate sound questions: play bird call, pick from 3 choices.
- [x] **41.12** Generate size questions: "Which bird is the largest?" from 3 choices.
- [x] **41.13** Ensure 3 questions per round with random type selection.
- [x] **41.14** Return `QuizQuestion[]` array for Zustand store.

---

## Data Model

### Extended Bird Data ✅ → R-14–R-22

- [x] **44.1** In `src/types.ts`, add `SizeCategory` type: `"tiny" | "small" | "medium" | "large"`.
- [x] **44.2** In `src/types.ts`, add `HabitatType` type: `"rainforest" | "wetlands" | "coast" | "grassland" | "forest" | "polar"`.
- [x] **44.3** In `src/types.ts`, add optional fields to `Bird`: `sizeCategory`, `habitatType`, `migrationDistanceKm`, `diet`, `wingspan`, `lifespan`.
- [x] **44.4** In `src/types.ts`, add `migrationDistanceKm` to `MigrationRoute`.
- [x] **44.5** In `src/types.ts`, add `QuizType`, `QuizQuestion`, `QuizState` types.
- [x] **44.6** In `src/data/birds.json`, add `sizeCategory` to all 15 birds.
- [x] **44.7** In `src/data/birds.json`, add `habitatType` to all 15 birds.
- [x] **44.8** In `src/data/birds.json`, add `diet`, `wingspan`, `lifespan` to all 15 birds.
- [x] **44.9** In `src/data/migrations.json`, add `migrationDistanceKm` to all routes.
- [x] **44.10** Verify: all type definitions compile, all data fields present.

---

## State Management

### Zustand Store Extensions ✅ → R-16, R-19, R-20, R-22

- [x] **44.11** Add `encyclopediaOpen: boolean` state and `setEncyclopediaOpen` action.
- [x] **44.12** Add `continentPanelRegion: string | null` state and `setContinentPanelRegion` action.
- [x] **44.13** Add quiz state: `quizState`, `quizQuestions`, `quizCurrentIndex`, `quizScore`, `quizLastCorrect`.
- [x] **44.14** Add quiz actions: `startQuiz`, `answerQuiz`, `nextQuizQuestion`, `endQuiz`.
- [x] **44.15** Verify: all state transitions work correctly.

---

## Final Verification (v6) ✅ → AC-12 through AC-20, AC-ARCH

- [x] **45.1** Run `npx tsc --noEmit` — zero TypeScript errors.
- [x] **45.2** Run `npm run build` — production build succeeds.
- [x] **45.3** Sound ripple appears when bird audio plays. (AC-12)
- [x] **45.4** Habitat highlight renders correctly with habitat-type colors. (AC-13)
- [x] **45.5** Discover mode selects random bird and flies camera. (AC-14)
- [x] **45.6** Migration story animation: icon moves along arcs, distance text visible. (AC-15)
- [x] **45.7** Bird size comparison bar visible in info card. (AC-16)
- [x] **45.8** Continent learning panel lists correct birds. (AC-17)
- [x] **45.9** Quiz mode works with scoring, confetti, shake. (AC-18)
- [x] **45.10** Wing flap animation runs smoothly. (AC-19)
- [x] **45.11** Bird encyclopedia panel lists all 15 birds. (AC-20)
- [x] **45.12** OrbitControls target remains [0,0,0]. (AC-ARCH)
- [x] **45.13** No scene.add() or scene.remove() calls. (AC-ARCH)
- [x] **45.14** All animations via useFrame. (AC-ARCH)
- [x] **45.15** Performance target: ~60 FPS on laptop GPU.

---

## Summary (v6)

| Group | Tasks | Status |
|-------|-------|--------|
| 3D Systems | 35.1–35.10, 36.1–36.8, 38.1–38.9, 42.1–42.4 | ✅ Complete |
| UI Systems | 39.1–39.5, 37.1–37.6, 40.1–40.8, 41.1–41.8, 43.1–43.8 | ✅ Complete |
| Gameplay Systems | 41.9–41.14 | ✅ Complete |
| Data Model | 44.1–44.10 | ✅ Complete |
| State Management | 44.11–44.15 | ✅ Complete |
| Final Verification | 45.1–45.15 | ✅ Complete |
| **Total v6 tasks** | **76 tasks** | **76 complete, 0 remaining** |

---

# v7 Tasks

---

## Data Model (v7)

### Extended Bird Types → R-23, R-24, R-25, R-26, R-27

- [x] **46.1** In `src/types.ts`, add `EvolutionEra` type: `"mesozoic" | "paleogene" | "neogene" | "quaternary"`.
- [x] **46.2** In `src/types.ts`, add `DietType` type: `"insects" | "fish" | "seeds" | "fruit" | "meat" | "omnivore"`.
- [x] **46.3** In `src/types.ts`, add optional fields to `Bird`: `evolutionEra`, `dietType`, `wingspanCm`.
- [x] **46.4** In `src/types.ts`, add `SoundGuessOption` interface: `{ birdId: string; photoUrl: string; nameZh: string; nameEn: string }`.
- [x] **46.5** In `src/data/birds.json`, add `evolutionEra` to all 15 birds.
- [x] **46.6** In `src/data/birds.json`, add `dietType` to all 15 birds.
- [x] **46.7** In `src/data/birds.json`, add `wingspanCm` to all 15 birds.

---

## State Management (v7)

### Zustand Store Extensions → R-23, R-24, R-27

- [x] **46.8** In `src/store.ts`, add `showAllRoutes: boolean` state (default `false`) and `setShowAllRoutes` action.
- [x] **46.9** In `src/store.ts`, add `evolutionTimelineOpen: boolean` state (default `false`) and `setEvolutionTimelineOpen` action.
- [x] **46.10** In `src/store.ts`, add sound guess state: `soundGuessState` (`"idle"`), `soundGuessRound` (`0`), `soundGuessScore` (`0`), `soundGuessOptions` (`[]`), `soundGuessCorrectId` (`null`).
- [x] **46.11** In `src/store.ts`, add sound guess actions: `startSoundGuess`, `setSoundGuessOptions`, `answerSoundGuess`, `nextSoundGuessRound`, `endSoundGuess`.

---

## 3D Systems (v7)

### Improved Starfield Depth → R-28, AC-26

- [x] **47.1** In `Starfield.tsx`, refactor to render 3 separate `<Points>` groups (far, mid, near).
- [x] **47.2** Far layer: 3000 stars, radius 15–20, smallest size (0.03–0.06).
- [x] **47.3** Mid layer: 1500 stars, radius 10–15, medium size (0.05–0.10).
- [x] **47.4** Near layer: 500 stars, radius 6–10, larger size (0.08–0.15).
- [x] **47.5** Add subtle parallax: each layer group has a slow `useFrame` rotation offset proportional to camera angle delta.
- [x] **47.6** Add twinkle effect: color-tinted star layers provide visual variation.
- [x] **47.7** Add color variation: 5% of stars with slight gold or blue tint.
- [x] **47.8** Verify: multiple star layers visible, parallax effect when rotating, no performance degradation.

### Global Migration Map → R-23, AC-21

- [x] **48.1** In `MigrationPaths.tsx`, read `showAllRoutes` from Zustand store.
- [x] **48.2** Define route color palette: `["#fbbf24", "#f87171", "#34d399", "#a78bfa"]` (gold, coral, teal, violet).
- [x] **48.3** When `showAllRoutes` is true, render ALL migration routes with distinct colors.
- [x] **48.4** When a bird is selected and `showAllRoutes` is true, highlight that bird's route at full opacity, dim others to 0.3.
- [x] **48.5** Flying bird icons animate on all visible routes when `showAllRoutes` is true.
- [x] **48.6** Verify: all routes visible when toggled, colors distinct, selected route highlights.

---

## UI Systems (v7)

### Migration Map Toggle → R-23, AC-21

- [x] **48.7** Create `src/components/ui/MigrationMapToggle.tsx`.
- [x] **48.8** Button: "🗺️ All Routes" / "🗺️ 全部路线", positioned near other toolbar buttons.
- [x] **48.9** Toggle `showAllRoutes` state on click. Active state visually indicated.
- [x] **48.10** Verify: button toggles all-routes mode on/off.

### Bird Diet Display → R-25, AC-23

- [x] **49.1** In `BirdInfoCard.tsx`, add diet section below existing content.
- [x] **49.2** Map `dietType` to emoji: insects=🐛, fish=🐟, seeds=🌾, fruit=🍎, meat=🥩, omnivore=🍽️.
- [x] **49.3** Display icon + bilingual label: "Diet: Fish" / "食性：鱼类".
- [x] **49.4** Verify: diet icon and label visible in info card for all birds.

### Wingspan Comparison Bar → R-26, AC-24

- [x] **50.1** Create `src/components/ui/WingspanBar.tsx` sub-component.
- [x] **50.2** Horizontal bar showing bird's `wingspanCm` relative to 0–250 cm range.
- [x] **50.3** Dashed reference line at 120 cm labeled "Your arm span" / "你的臂展".
- [x] **50.4** Bar color matches bird's habitat color.
- [x] **50.5** Numeric label: "Wingspan: 180 cm" / "翼展：180厘米".
- [x] **50.6** In `BirdInfoCard.tsx`, add `<WingspanBar>` below diet section.
- [x] **50.7** Verify: wingspan bar visible, reference line correct, bilingual labels.

### Evolution Timeline → R-24, AC-22

- [x] **51.1** Create `src/components/ui/EvolutionTimeline.tsx`.
- [x] **51.2** Panel slides up from bottom, toggle via "🦕 Timeline" / "🦕 时间线" button.
- [x] **51.3** Horizontal scrollable timeline: 150 Mya → present.
- [x] **51.4** Era sections: Mesozoic (150–66), Paleogene (66–23), Neogene (23–2.6), Quaternary (2.6–0).
- [x] **51.5** Each bird rendered as circular avatar at its era position.
- [x] **51.6** Click bird avatar → `setSelectedBird()` → camera flies to bird.
- [x] **51.7** Bilingual era labels and bird names.
- [x] **51.8** Uses `evolutionTimelineOpen` from Zustand store.
- [x] **51.9** Verify: timeline opens, birds at correct eras, click flies to bird, scrollable.

---

## Gameplay Systems (v7)

### Sound Guess Manager → R-27, AC-25

- [x] **52.1** Create `src/systems/SoundGuessManager.ts`.
- [x] **52.2** `generateSoundGuessRound()`: pick random bird, select 2 distractors, return options + correct ID.
- [x] **52.3** Ensure distractors are different birds from different regions when possible.
- [x] **52.4** Return `SoundGuessOption[]` and `correctBirdId`.

### Sound Guess Panel → R-27, AC-25

- [x] **52.5** Create `src/components/ui/SoundGuessPanel.tsx`.
- [x] **52.6** Idle state: "🎵 Sound Guess" / "🎵 听声辨鸟" button.
- [x] **52.7** Playing state: audio plays, "Listen carefully..." prompt.
- [x] **52.8** Guessing state: 3 bird photo cards to choose from.
- [x] **52.9** Correct answer: confetti + fly to bird on globe.
- [x] **52.10** Wrong answer: shake + reveal correct bird.
- [x] **52.11** Result state: score display (X/5), play-again button.
- [x] **52.12** 5 rounds per session.
- [x] **52.13** In `App.tsx`, add `<SoundGuessPanel />` to overlay.
- [x] **52.14** Verify: full game flow works, audio plays, confetti/shake, score displayed.

---

## Refactor Tasks (v7)

- [x] **53.1** Ensure all new components follow declarative R3F patterns (no scene.add/remove).
- [x] **53.2** Verify Zustand store has no duplicated logic between quiz and sound guess.
- [x] **53.3** Extract shared confetti/shake animation logic into reusable utility if duplicated.
- [x] **53.4** Ensure all new UI panels have consistent styling (rounded corners, warm colors, slide transitions).
- [x] **53.5** Verify Suspense boundaries cover all GLTF and async loading.
- [x] **53.6** Check for unused imports and dead code in modified files.

---

## Final Verification (v7) → AC-21 through AC-26, AC-ARCH

- [x] **55.1** Run `npx tsc --noEmit` — zero TypeScript errors.
- [x] **55.2** Run `npm run build` — production build succeeds.
- [x] **55.3** Global migration map: all routes visible when toggled, distinct colors, selected highlights. (AC-21)
- [x] **55.4** Evolution timeline: panel opens, birds at correct eras, click flies to bird. (AC-22)
- [x] **55.5** Bird diet: icon + label visible in info card. (AC-23)
- [x] **55.6** Wingspan bar: visible in info card, reference line at 120 cm. (AC-24)
- [x] **55.7** Sound guess: full game flow works, 5 rounds, score displayed. (AC-25)
- [x] **55.8** Starfield: multiple layers, parallax effect, color variation, no FPS drop. (AC-26)
- [x] **55.9** Sound ripple appears when bird audio plays. (AC-12)
- [x] **55.10** Habitat highlight renders correctly. (AC-13)
- [x] **55.11** Discover mode selects random bird. (AC-14)
- [x] **55.12** Quiz mode works with scoring. (AC-18)
- [x] **55.13** Bird encyclopedia panel lists birds. (AC-20)
- [x] **55.14** Migration animation works. (AC-15)
- [x] **55.15** Wing animation runs smoothly. (AC-19)
- [x] **55.16** OrbitControls target remains [0,0,0]. (AC-ARCH)
- [x] **55.17** Performance target: ~60 FPS on laptop GPU.

---

## Summary (v7)

| Group | Tasks | Status |
|-------|-------|--------|
| Data Model | 46.1–46.7 | ✅ Complete |
| State Management | 46.8–46.11 | ✅ Complete |
| 3D Systems | 47.1–47.8, 48.1–48.6 | ✅ Complete |
| UI Systems | 48.7–48.10, 49.1–49.4, 50.1–50.7, 51.1–51.9 | ✅ Complete |
| Gameplay Systems | 52.1–52.14 | ✅ Complete |
| Refactor Tasks | 53.1–53.6 | ✅ Complete |
| Final Verification | 55.1–55.17 | ✅ Complete |
| **Total v7 tasks** | **78 tasks** | **78 complete, 0 remaining** |
| **Total all tasks (v1–v7)** | **470 tasks** | **470 complete, 0 remaining** |
