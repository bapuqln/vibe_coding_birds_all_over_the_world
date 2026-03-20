# 万羽拾音 (Kids Bird Globe) — Feature Specification v12

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

### R-19: UI System (v12 CRITICAL)

#### Sidebar Buttons
- All sidebar buttons must have identical width and height.
- Vertically aligned, never overlap the globe.
- Position: `fixed; left: 24px; top: 120px;`
- Layout: `display: flex; flex-direction: column; gap: 16px;`

#### Right Control Panel
- All action buttons in a single container.
- Position: absolute, right: 16px, bottom: 16px.
- Flex column, gap: 8px, align-items: flex-end.
- Buttons: Discover, Birds, Regions, Migration, Heatmap, Quests, Tour, AR, Reset.
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
- Loading: z-index 100

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

## Non-goals
- User accounts or server-side progress tracking.
- Offline support / PWA.
- Server-side rendering.
- CMS or admin panel.
- Deployment pipeline.
- High-resolution GeoJSON.

## Acceptance Criteria

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
