# 万羽拾音 (Kids Bird Globe) — Feature Specification v9

> **v9 changelog**: Educational exploration expansion — migration mode with animated arcs, guided discovery tour, AI bird guide character, enhanced learning quiz, bird rarity system, bird radar, story-based themed exploration sets. New data fields: `rarity`, `migration_path`, `storyTheme`. New components: `MigrationModePanel`, `GuidedTour`, `BirdGuide`, `BirdRadar`, `StoryExplorer`.
>
> **v8 changelog**: Core interactive learning features — bird information card redesign as center-bottom modal, animated birds replacing static markers, bird collection system with localStorage, region filter with camera zoom, kid quest system with missions/badges, globe visual improvements (atmosphere glow, cloud layer, lighting), bird data model refactor with `latin_name`, `habitat`, `fun_fact`, `image`, `audio`, `migration_path`. Complete UI system overhaul — ActionButton component, right control panel, mobile safe areas, responsive layout, z-index hierarchy, bird tooltip, loading UI with progress, National Geographic Kids visual style.
>
> **v7 changelog**: Global migration map overlay with all-routes toggle, bird evolution timeline UI, bird diet visualization system, wingspan comparison bar, sound guess gameplay mode, improved starfield with parallax depth layers. Extended data model with `evolutionEra`, `dietType`, `wingspanCm`.
>
> **v6 changelog**: Sound ripple visualization, habitat highlighting, discover mode, enhanced migration story animation, bird size comparison, continent learning panel, mini quiz mode, wing flap animation, bird encyclopedia panel.
>
> **v5 changelog**: Higher-quality bird models, great-circle migration arcs, OrbitControls target locked to [0,0,0], country/continent borders, zoom-dependent map labels, improved lighting, improved atmosphere glow.

## Goal

Build an interactive 3D globe web application that teaches children (ages 6–12) about birds around the world. The experience should feel like an **interactive science discovery game for kids** — similar to National Geographic Kids. Users spin a realistic globe, discover animated birds flying around their regions, collect birds into a personal album, complete quests, take guided tours, and learn through quizzes. The UI must be kid-friendly with rounded corners, playful colors, large icons, and readable fonts. Zero UI overlap, consistent layout, and smooth 3D interaction are mandatory.

## User Stories

### US-1: Explore the Globe
As a child, I can drag to rotate and scroll to zoom a 3D Earth so that I feel like I'm exploring the real world.

### US-2: Discover Animated Birds
As a child, I can see animated birds slowly flying around their regions on the globe, making the world feel alive.

### US-3: Learn About a Bird
As a child, I can click a bird to open an information card showing the bird's name, image, region, habitat, fun fact, sound playback button, and a collect button.

### US-4: Hear Bird Calls
As a child, I can play bird sounds from the info card to connect each bird to its call.

### US-5: Collect Birds
As a child, I can collect discovered birds into "My Birds" album that persists between sessions.

### US-6: Filter by Region
As a child, I can filter birds by continent/region, with the camera smoothly zooming to that region.

### US-7: Complete Quests
As a child, I can complete discovery missions like "Find 3 birds in Africa" to earn points and badges.

### US-8: Watch Migration Paths
As a child, I can enter migration mode to see animated arcs showing how birds travel across the globe.

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

### R-2: Bird Data Model (v8 refactor)
- Each bird entry follows the enhanced data model:
```json
{
  "id": "",
  "name": "",
  "nameZh": "",
  "pinyin": "",
  "latin_name": "",
  "nameEn": "",
  "region": "",
  "lat": 0,
  "lng": 0,
  "habitat": "",
  "habitatType": "",
  "fun_fact": "",
  "funFactZh": "",
  "funFactEn": "",
  "image": "",
  "audio": "",
  "rarity": "common",
  "storyTheme": "",
  "migration_path": [],
  "sizeCategory": "",
  "dietType": "",
  "wingspanCm": 0,
  "evolutionEra": ""
}
```
- Backward compatible with existing fields.
- 15+ bird entries covering all major regions.
- Rarity field: `"common"`, `"rare"`, `"legendary"`.
- Story theme field for themed exploration sets.

### R-3: Animated Bird Markers (v8)
- Replace static markers with animated birds.
- Birds slowly fly in subtle floating/circular patterns around their region.
- Clicking a bird temporarily pauses its movement.
- Animation must be simple and lightweight (no heavy physics).
- Hover shows tooltip with bird name and region.

### R-4: Bird Information Card (v8 redesign)
- Center-bottom modal panel (not blocking entire globe).
- Displays: bird name, bird image, region, habitat, fun fact.
- Bird sound playback button.
- "Collect Bird" button.
- Close button and click-outside-to-dismiss.
- Springy slide-up animation.
- Must not overlap with right control panel.

### R-5: Bird Collection System (v8)
- Clicking "Collect" saves bird to localStorage.
- "My Birds" panel shows collected birds with image and name.
- Works like a bird discovery album.
- Persists across browser sessions.
- Visual feedback on collection (sparkle animation).

### R-6: Region Filter (v8)
- Filter controls for: All Birds, North America, South America, Europe, Africa, Asia, Australia, Antarctica.
- When selected: camera smoothly zooms to region center.
- Only birds in that region appear (others fade out).
- Region filter UI in the right control panel.

### R-7: Kid Quest System (v8)
- Simple discovery missions.
- Example quests: "Find 3 birds in Africa", "Discover a bird in Antarctica", "Collect 5 birds".
- Completing quests awards points and small badges.
- Quest progress persisted in localStorage.
- Quest panel accessible from right control panel.

### R-8: Globe Visual Improvements (v8)
- Enhanced atmosphere glow effect.
- Subtle lighting improvements.
- Smoother camera transitions.
- Optional cloud layer toggle.

### R-9: Migration Mode (v9)
- Toggle migration exploration mode.
- Visualize migration paths as animated arcs above the globe.
- Example: Arctic Tern migration from Arctic to Antarctica.
- Each route has distinct color.
- Flying bird icon animates along the path.

### R-10: Guided Discovery Tour (v9)
- Automated tour mode.
- Camera automatically visits: Amazon Rainforest, African Savanna, Antarctica, etc.
- During tour, show bird highlights with info cards.
- "Welcome explorer!" introduction.
- Pause/resume/skip controls.

### R-11: AI Bird Guide (v9)
- Simple guide character (owl or parrot avatar).
- Provides short explanations, fun facts, learning prompts.
- Example: "Did you know? Penguins cannot fly but are excellent swimmers!"
- Appears contextually when exploring.
- Keep explanations short and child-friendly.
- Positioned bottom-left, does not overlap other UI.

### R-12: Learning Quiz Mode (v9 enhanced)
- Quiz questions: "Where does this bird live?" with multiple choice.
- Immediate feedback (correct/wrong).
- Confetti on correct, shake on wrong.
- Score tracking per session.
- Reuses existing quiz infrastructure.

### R-13: Bird Rarity System (v9)
- Rarity classification: Common, Rare, Legendary.
- Rare birds have subtle glow effect.
- Legendary birds have special particle effect.
- Rarity badge shown in info card and collection.

### R-14: Bird Radar (v9)
- Small radar UI showing nearby birds in current camera view.
- Circular radar display in corner.
- Dots represent birds, pulsing when close to center of view.
- Helps children discover birds they might miss.

### R-15: Story-Based Exploration (v9)
- Themed discovery sets: Rainforest Birds, Arctic Birds, Desert Birds, Ocean Birds.
- Each theme has a set of birds to discover.
- Completing a theme unlocks a badge.
- Progress tracked in localStorage.

### R-16: Audio Playback
- Bird sound playback via xeno-canto API or direct audioUrl.
- Play/pause control in info card.
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

### R-19: UI System Overhaul (CRITICAL)

#### ActionButton Component
- Reusable button component with consistent styling.
- Height: 44px, min-width: 120px, padding: 0 16px, border-radius: 12px.
- Background: rgba(0,0,0,0.65), backdrop-filter: blur(8px), color: white.
- Hover: scale 1.05. Click: scale 0.95.

#### Right Control Panel
- All action buttons in a single container.
- Position: absolute, right: 16px, bottom: 16px.
- Flex column, gap: 8px, align-items: flex-end.
- Buttons: Birds, Regions, Migration, Quests, Reset.
- No other UI may overlap this panel.

#### Mobile Safe Area Support
- bottom: calc(env(safe-area-inset-bottom) + 16px)
- right: calc(env(safe-area-inset-right) + 16px)

#### Responsive Layout
- Screen width < 900px: convert right panel to horizontal layout.

#### Z-Index Hierarchy
- 3D canvas: z-index 0
- Bird markers: z-index 1
- HUD panels: z-index 10
- Modal cards: z-index 20

#### Bird Tooltip
- Hover over bird marker shows: Bird Name, Region.

#### Loading UI
- Loading states: "Loading Earth...", "Loading Birds..."
- Progress indicator (animated bar).

#### Visual Style
- National Geographic Kids inspired.
- Rounded UI, playful colors, large icons, readable fonts.

### R-20: Performance
- Minimize draw calls.
- Avoid heavy animations.
- Keep bird animations lightweight.
- Ensure smooth globe rotation.
- Target ~60 FPS on mid-range laptop.

## Extended Data Model (v8+v9)

### Bird type additions:
```typescript
interface Bird {
  // ... existing v7 fields ...
  rarity?: "common" | "rare" | "legendary";
  storyTheme?: string;
  migration_path?: [number, number][];
}
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

## Non-goals
- User accounts or server-side progress tracking.
- Offline support / PWA.
- Server-side rendering.
- CMS or admin panel.
- Deployment pipeline.
- High-resolution GeoJSON.

## Acceptance Criteria

### AC-V8-1: Bird Information Card
- [ ] Clicking bird opens center-bottom modal.
- [ ] Card shows name, image, region, habitat, fun fact.
- [ ] Sound playback button works.
- [ ] Collect button saves to localStorage.
- [ ] Card does not block entire globe.

### AC-V8-2: Animated Birds
- [ ] Birds have subtle floating/circular flight animation.
- [ ] Clicking pauses animation temporarily.
- [ ] Animation is lightweight (<1ms per frame per bird).

### AC-V8-3: Bird Collection
- [ ] Collect button saves bird to localStorage.
- [ ] My Birds panel shows collected birds.
- [ ] Collection persists across sessions.
- [ ] Visual feedback on collection.

### AC-V8-4: Region Filter
- [ ] All 8 region filters work.
- [ ] Camera smoothly zooms to selected region.
- [ ] Only region birds visible when filtered.
- [ ] "All Birds" shows everything.

### AC-V8-5: Kid Quest System
- [ ] At least 5 quests available.
- [ ] Quest progress tracks correctly.
- [ ] Points and badges awarded on completion.
- [ ] Progress persists in localStorage.

### AC-V8-6: Globe Visuals
- [ ] Atmosphere glow visible and artifact-free.
- [ ] Smooth camera transitions.
- [ ] Cloud layer renders correctly.

### AC-V9-1: Migration Mode
- [ ] Migration toggle shows/hides paths.
- [ ] Animated arcs visible above globe.
- [ ] Flying bird icon on paths.

### AC-V9-2: Guided Tour
- [ ] Tour visits multiple regions automatically.
- [ ] Bird highlights shown during tour.
- [ ] Pause/resume controls work.

### AC-V9-3: AI Bird Guide
- [ ] Guide character appears contextually.
- [ ] Shows fun facts and prompts.
- [ ] Does not overlap other UI.

### AC-V9-4: Learning Quiz
- [ ] Multiple choice questions work.
- [ ] Immediate feedback displayed.
- [ ] Score tracked per session.

### AC-V9-5: Bird Rarity
- [ ] Rarity badges visible on birds.
- [ ] Visual effects for rare/legendary birds.

### AC-V9-6: Bird Radar
- [ ] Radar shows nearby birds.
- [ ] Updates as camera moves.

### AC-V9-7: Story Exploration
- [ ] Themed sets available.
- [ ] Progress tracked.
- [ ] Badge unlocked on completion.

### AC-UI-1: ActionButton Component
- [ ] Consistent height 44px, min-width 120px.
- [ ] Hover scale 1.05, click scale 0.95.
- [ ] Glass-morphism background.

### AC-UI-2: Right Control Panel
- [ ] All buttons in single container.
- [ ] No overlap with other UI.
- [ ] Responsive horizontal layout on mobile.

### AC-UI-3: Z-Index Hierarchy
- [ ] Canvas z-0, markers z-1, HUD z-10, modals z-20.
- [ ] No z-fighting or overlap issues.

### AC-UI-4: Mobile Safe Areas
- [ ] Safe area insets respected.
- [ ] UI usable on notched devices.

### AC-UI-5: Loading UI
- [ ] Progress indicator visible during load.
- [ ] Smooth transition to app.

### AC-UI-6: Bird Tooltip
- [ ] Tooltip shows on bird hover.
- [ ] Displays name and region.

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
