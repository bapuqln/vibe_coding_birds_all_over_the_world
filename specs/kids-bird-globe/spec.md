# 万羽拾音 (Kids Bird Globe) — Feature Specification v7

> **v7 changelog**: Global migration map overlay with all-routes toggle, bird evolution timeline UI, bird diet visualization system, wingspan comparison bar, sound guess gameplay mode, improved starfield with parallax depth layers. Extended data model with `evolutionEra`, `dietType`, `wingspanCm`. All new features follow declarative R3F patterns. OrbitControls target remains locked at [0,0,0].
>
> **v6 changelog**: Sound ripple visualization, habitat highlighting, discover mode (random bird), enhanced migration story animation with flying bird icon and distance text, bird size comparison in info card, continent learning panel, mini quiz mode (geography/sound/size), wing flap animation, bird encyclopedia panel. Extended data model with `sizeCategory`, `habitatType`, `migrationDistanceKm`, `diet`, `wingspan`, `lifespan`. All new features follow declarative R3F patterns. OrbitControls target remains locked at [0,0,0].
>
> **v5 changelog**: Higher-quality bird models (replace low-poly generated GLB with elegant stylized GLTF), great-circle migration arcs with distance-scaled height, OrbitControls target locked to [0,0,0] (fix rotation pivot drift on bird click), country/continent borders via GeoJSON overlay, zoom-dependent map labels (continent names, ocean names), improved lighting (hemisphere light + soft fill), improved atmosphere glow (Fresnel shell with tuned falloff), improved materials throughout, declarative R3F patterns enforced.
>
> **v4 changelog**: Auto-rotation resume fix after user interaction, camera zoom-through-globe prevention, atmosphere visual overhaul (remove blue ring artifact, replace with realistic atmospheric glow), migration arc height reduction for natural surface-following paths, bird markers redesigned from golden dots to small 3D bird models with outward orientation and hover glow.
>
> **v3 changelog**: New migration-path animations, globe rendering fixes, bird marker redesign (golden glowing points), auto-rotation fix, Singapore-focused bird data, cloud layer.
>
> **v2 changelog**: Bug fixes, visual/interaction improvements, camera zoom-to-bird, richer bird data.

## Goal

Build an interactive 3D globe web application that teaches children (ages 5–12) about birds around the world. Users spin a clean, realistic globe with visible country borders and continent labels, tap on elegant 3D bird models perched on the surface, watch natural great-circle migration arcs flowing between continents, and hear real bird calls while reading bilingual fun facts. The experience should feel polished, immediate, and educational — every click rewards the child with sound and visual feedback. The globe should auto-rotate smoothly and recover gracefully from all user interactions. Visual elegance is prioritized over technical complexity. v6 adds interactive discovery, quizzes, encyclopedia, habitat visualization, and sound feedback to deepen the educational experience. v7 adds a global migration map, evolution timeline, diet system, wingspan visualization, sound guessing game, and improved starfield depth for a richer educational experience.

## User Stories

### US-1: Explore the Globe
As a child, I can drag to rotate and scroll to zoom a 3D Earth so that I feel like I'm exploring the real world. The rotation always pivots around the center of the globe, never drifting to an offset point.

### US-2: Discover Birds
As a child, I can see elegant 3D bird models perched on the globe so that I know where different birds live. The birds glow softly and respond when I hover over them.

### US-3: Learn About a Bird
As a child, I can click a bird marker to open an info card showing the bird's photo, Chinese name with pinyin, English name, and a fun fact in both languages so that I learn something new.

### US-4: Hear Bird Calls
As a child, I can hear the real call of a bird when I click its marker so that I connect the bird to its sound.

### US-5: Switch Languages
As a user, I can toggle between Chinese and English so that I can read in my preferred language.

### US-6: Navigate Intuitively
As a parent, I can hand the app to my child without explanation because the interface is self-evident — large targets, clear icons, no text-heavy menus.

### US-7: Zoom Into a Bird's Home
As a child, when I click a bird marker, the globe smoothly rotates and zooms to center that bird's location, making me feel like I'm flying there. The globe always stays centered in the screen.

### US-8: Watch Migration Paths
As a child, I can see animated glowing curved lines connecting birds across the globe, showing me how birds migrate between regions — like a stork flying from Singapore to Europe. The arcs follow the Earth's surface naturally.

### US-9: See the World Map *(v5)*
As a child, when I zoom in I can see country borders and continent names appear on the globe, helping me learn geography alongside bird habitats.

### US-10: Sound Ripple Feedback *(v6)*
As a child, when I hear a bird call, I see expanding ripple waves around the bird marker so that I connect the sound to the bird visually.

### US-11: Habitat Highlight *(v6)*
As a child, when I select a bird, I see its habitat type highlighted on the globe so that I learn where different types of birds live.

### US-12: Discover Random Bird *(v6)*
As a child, I can press a "Discover Bird" button to fly to a random bird and learn about it, making exploration feel like an adventure.

### US-13: Migration Story *(v6)*
As a child, I see a tiny bird icon flying along migration arcs with a glowing trail, plus text showing how far the bird travels, so migration feels real and impressive.

### US-14: Bird Size Comparison *(v6)*
As a child, I can see how big a bird is compared to familiar references (sparrow, pigeon, duck, eagle) in the info card.

### US-15: Continent Learning *(v6)*
As a child, I can click a continent label to see which birds live there, connecting geography to bird habitats.

### US-16: Mini Quiz *(v6)*
As a child, I can play a quiz game with geography, sound, and size questions to test what I've learned, with confetti for correct answers.

### US-17: Wing Flap Animation *(v6)*
As a child, I see bird markers with subtle wing flapping animation, making them feel alive.

### US-18: Bird Encyclopedia *(v6)*
As a child, I can open a scrollable list of all birds and click any entry to fly to that bird on the globe.

### US-19: Global Migration Map *(v7)*
As a child, I can toggle a "Show All Routes" button to see every migration path at once, turning the globe into a colorful web of bird journeys so I understand the scale of global bird migration.

### US-20: Bird Evolution Timeline *(v7)*
As a child, I can open a timeline panel that shows when different bird families first appeared in history, helping me understand that birds have been around for millions of years.

### US-21: Bird Diet System *(v7)*
As a child, I can see what each bird eats displayed with fun food icons in the info card, helping me understand the diversity of bird diets.

### US-22: Wingspan Visualization *(v7)*
As a child, I can see a wingspan comparison bar in the info card that shows how wide each bird's wings are compared to my own arm span, making bird sizes tangible.

### US-23: Sound Guess Mode *(v7)*
As a child, I can play a "Guess the Bird" game where I hear a bird call and try to identify which bird it belongs to from visual choices on the globe, testing my listening skills.

### US-24: Immersive Starfield *(v7)*
As a child, I see a beautiful deep-space background with multiple layers of stars that shift subtly as I rotate the globe, creating a sense of cosmic depth.

## Requirements

### R-1: 3D Globe (React Three Fiber) — updated v5
- Render a textured Earth sphere using a NASA Blue Marble (or equivalent free) texture.
- **Globe geometry**: The Earth sphere must have radius exactly `1.0`. No scaling artifacts.
- **Cloud layer**: Render a separate semi-transparent cloud mesh at radius ~1.005 using a cloud/alpha texture. Distinct mesh from the Earth.
- **Atmosphere — improved v5**: Replace the v4 `onBeforeCompile` rim glow with a dedicated thin Fresnel atmosphere shell for better visual quality:
  - Use a separate sphere mesh at scale `[1.025, 1.025, 1.025]` with `BackSide` rendering.
  - Custom `ShaderMaterial` with smooth Fresnel falloff: exponent `3.0`, base color `vec3(0.3, 0.6, 1.0)`, max opacity `0.15`.
  - `AdditiveBlending`, `transparent: true`, `depthWrite: false`.
  - Must produce a soft, natural atmospheric glow at all zoom levels with no hard edges or ring artifacts.
  - **Forbidden**: No visible blue ring, hard-edged band, or clipping artifact at any zoom level.
- **Camera zoom constraint**: Minimum camera distance `1.15` from globe center. OrbitControls `minDistance` enforced.
- **Country borders — v5**: Render lightweight country/continent boundary lines on the globe surface using simplified GeoJSON data. Lines should be thin, semi-transparent (white or light gray, opacity 0.3–0.5), and rendered as `<Line>` elements from `@react-three/drei` or as `BufferGeometry` line segments projected onto the globe sphere at radius `1.001` (just above the surface). Use a simplified/low-resolution GeoJSON (~50 KB) to keep performance acceptable.
- **Map labels — v5**: Display continent names and major ocean names as text labels on the globe. Labels should:
  - Use `<Html>` from `@react-three/drei` for crisp text rendering, or `<Text>` (troika-three-text) for 3D text.
  - Be positioned at the geographic center of each continent/ocean.
  - Only appear when the camera is zoomed in (distance < 2.0). Fade in/out smoothly based on camera distance.
  - Be styled as semi-transparent, uppercase, letter-spaced text that doesn't compete with bird markers.
  - Support bilingual display (Chinese/English based on language toggle).
- Dark starry background (particle-based starfield).
- Orbit controls: mouse/touch drag to rotate, scroll/pinch to zoom.
- Smooth damping on all camera movements.
- Responsive — fills the viewport on desktop and mobile.

### R-2: Bird Data — unchanged from v4
- Ship a `birds.json` file containing **15 bird entries**.
- **Singapore focus**: Include **5 birds based in Singapore** with real geographic coordinates.
- The remaining 10 birds cover other major regions: Europe, Africa, North America, South America, Oceania, Antarctica.
- Each entry includes: `id`, `nameZh`, `pinyin`, `nameEn`, `scientificName`, `lat`, `lng`, `funFactZh`, `funFactEn`, `photoUrl`, `xenoCantoQuery`, `silhouette`, `region`, and `audioUrl` (optional).
- Bird photos bundled in `/public/images/birds/`.
- Data consistency and extensibility requirements unchanged.

### R-3: Bird Markers — improved v5
- **Visual style — improved v5**: Replace the current low-poly generated bird GLB with a higher-quality, visually appealing 3D bird model:
  - **Model quality**: Use a clean, stylized low-poly bird model that looks good at small scale. The model should have recognizable bird features (body, wings, tail, beak) with smooth geometry. Source from a free asset library (Kenney, Quaternius, Sketchfab CC0) or create a quality model. Target: <100 KB, <500 triangles.
  - **Material**: Use `MeshStandardMaterial` with warm tones — base color `#FFB347` (warm amber), emissive `#332200`, emissiveIntensity `0.5`, metalness `0.2`, roughness `0.6`. The bird should appear warm and inviting against both land and ocean.
  - **Scale**: `0.02–0.04` units. Visible and tappable but not cluttering.
  - **Orientation**: Face outward from globe surface using quaternion derived from surface normal.
  - **Idle animation**: Gentle bob along surface normal — amplitude `0.005`, period ~2s.
- **Hover interaction**: Scale to 1.4x with emissive intensity increase to 1.5, smooth lerp transition ~200ms.
- **Click**: Select bird, open info card, trigger camera zoom, play audio.
- **Fallback**: If GLTF loading fails, render golden sphere markers with pulse animation.
- **R3F pattern**: Use `useGLTF` hook from drei. Preload at module level. No imperative `scene.add()`.

### R-4: Info Card — unchanged
- 2D overlay card that slides in from the side (or bottom on mobile).
- Displays: bird photo, Chinese name, pinyin, English name, fun fact (bilingual).
- Close button and click-outside-to-dismiss.
- Accessible: proper focus management, ARIA labels.

### R-5: Audio Playback — unchanged
- On bird selection, fetch a recording from xeno-canto API or use direct `audioUrl`.
- Auto-play first high-quality result.
- Graceful fallback if API unavailable.

### R-6: Bilingual UI — unchanged
- All user-facing text has Chinese and English variants.
- Language toggle switches between `zh` and `en`.
- Default language: Chinese.

### R-7: Tech Stack — updated v5
- React 19+ with TypeScript.
- Vite as the build tool.
- `three` / `@react-three/fiber` / `@react-three/drei` for 3D.
- Tailwind CSS for 2D UI styling.
- Zustand for state management.
- **v5**: Use `@react-three/drei` helpers wherever possible — `<Html>`, `<Text>`, `<Line>`, `<OrbitControls>`, `useGLTF`, `useTexture`, `<Points>`, `<PointMaterial>`.
- **Pattern**: All 3D logic must follow React/R3F declarative patterns. No `scene.add/remove`. No direct Three.js object mutation outside React lifecycle. Use `useFrame` for per-frame updates, `useEffect` for side effects, `useMemo` for expensive computations.
- No backend — fully static single-page application.

### R-8: Camera Zoom-to-Bird — updated v5
- When a bird marker is clicked, the camera smoothly animates to center on that bird's geographic location.
- **Critical v5 fix**: OrbitControls `target` must ALWAYS remain at `[0, 0, 0]` (the globe center). The camera moves around the globe; the globe does not move. When zooming to a bird, only the camera position changes (distance + direction), NOT the OrbitControls target. This prevents the rotation pivot from drifting away from the globe center after clicking a bird.
- The animation should:
  - Move the camera position toward the bird's lat/lng direction at zoom distance.
  - Never move closer than `minDistance` (1.15).
  - Use eased interpolation over ~1 second.
  - Not block user interaction — the user can interrupt by dragging.
- When the info card is closed, the camera zooms back out to default distance (rotation preserved).

### R-9: Visual Polish — updated v5
- **Lighting — improved v5**: Replace the current flat lighting setup with a more natural configuration:
  - `<ambientLight intensity={0.3} />` — reduced for better contrast.
  - `<directionalLight position={[5, 3, 5]} intensity={1.2} />` — main sun light.
  - `<directionalLight position={[-3, -1, -3]} intensity={0.2} />` — subtle fill from opposite side.
  - `<hemisphereLight skyColor="#b1e1ff" groundColor="#000000" intensity={0.4} />` — sky-ground gradient for natural illumination.
- **Loading screen**: Tied to actual asset loading (`globeReady && modelsReady`).
- **Globe atmosphere**: Soft Fresnel shell (see R-1). No hard edges.
- **Starfield depth**: Stars with slight size variation.
- **Card transitions**: Springy slide-in/out.
- **Materials**: All materials should use `MeshStandardMaterial` (physically-based) rather than `MeshPhongMaterial` or `MeshBasicMaterial` for consistent, high-quality rendering under the improved lighting.
- **Visual goal (v5)**: A polished, educational globe with visible geography (borders + labels), elegant bird models, natural migration arcs, and stable interaction. Clean and modern — no visual artifacts.

### R-10: Rich Bird Resources — unchanged
- Real photographs for every bird.
- Photo quality: at least 400×300px, <80 KB each.
- Data documentation in `src/data/README.md`.

### R-11: Auto-Rotation — updated v5
- Use `OrbitControls.autoRotate = true` with `autoRotateSpeed = 1.0` for idle rotation.
- **Interaction lifecycle**: Same state machine as v4 (drag start/end, idle timeout 5s, bird select/deselect, zoom).
- **Speed consistency**: Scale `autoRotateSpeed` inversely with camera distance.
- **Critical v5 constraint**: OrbitControls target must remain `[0, 0, 0]` at all times. Auto-rotation rotates the camera around the origin. The target must never be modified by any code path.

### R-12: Migration Paths — improved v5
- Render animated curved lines between pairs of birds to visualize migration routes.
- **Curve geometry — improved v5**: Use great-circle interpolation for natural-looking arcs:
  - Compute intermediate points using spherical linear interpolation (slerp) between start and end positions on the unit sphere.
  - Elevate intermediate points to `globeRadius + arcHeight` where `arcHeight = clamp(angularDistance * 0.04, 0.03, 0.12)`.
  - Start and end points remain at `globeRadius` (on the surface).
  - Use `CatmullRomCurve3` with 3–7 control points (scaled by angular distance) for smooth curves.
  - No clipping: all intermediate points at radius >= `globeRadius + 0.01`.
- **Visual style**: Animated dashed lines with warm gold color. Custom `ShaderMaterial` with time-based dash offset.
- **R3F component**: `<MigrationArc>` component that takes `from`/`to` bird positions and renders a `<line>` element.
- **Performance**: Geometry computed once via `useMemo`. Only the time uniform updates per frame.

### R-13: Map Overlays — v5
- **Country borders**: Render simplified world country boundaries as thin line segments on the globe surface.
  - Source: Natural Earth simplified GeoJSON (110m resolution, ~200 KB uncompressed, ~50 KB gzipped).
  - Project each GeoJSON coordinate to 3D using `latLngToVector3(lat, lng, 1.001)`.
  - Render as `<Line>` from drei or `BufferGeometry` line segments.
  - Style: white/light gray, opacity 0.3, linewidth 0.5.
  - Must not interfere with bird marker click targets.
- **Continent labels**: Display continent names positioned at geographic centers.
  - Use `<Html>` from drei for crisp rendering.
  - Only visible when camera distance < 2.0 (fade in/out with opacity transition).
  - Styled: uppercase, letter-spaced, semi-transparent, small font.
  - Bilingual: show Chinese or English based on language toggle.
- **Ocean labels**: Display major ocean names (Pacific, Atlantic, Indian, Arctic, Southern).
  - Same rendering approach as continent labels.
  - Positioned at approximate ocean centers.
  - Same zoom-dependent visibility.

### R-14: Sound Ripple *(v6)*
- When bird audio plays, render expanding concentric ring meshes at the bird's globe position.
- Ring mesh: `RingGeometry`, radius expands from 0 to ~0.08 over ~2 seconds.
- Color: soft cyan `#67e8f9` or warm gold `#fbbf24`, opacity fades from 0.6 to 0.
- 2-3 concurrent rings with staggered start times.
- Component: `SoundRipple.tsx`. Uses `useFrame` for animation.
- Positioned at bird marker height (~1.02), oriented along surface normal.

### R-15: Habitat Highlight *(v6)*
- When a bird is selected, render a soft translucent glow patch on the globe at the bird's location.
- Glow represents habitat type with distinct colors:
  - rainforest: `#22c55e` (green)
  - wetlands: `#06b6d4` (cyan)
  - coast: `#3b82f6` (blue)
  - grassland: `#eab308` (yellow)
  - forest: `#16a34a` (dark green)
  - polar: `#e0f2fe` (ice blue)
- Visual: `CircleGeometry` projected onto globe surface at radius 1.003, with `MeshBasicMaterial`, transparent, additive blending.
- Radius: ~0.15 units. Soft edge via opacity gradient.

### R-16: Discover Mode *(v6)*
- UI button: "🎲 Discover Bird" / "🎲 发现鸟类" (bilingual).
- Action: select random bird from `birds.json`, trigger camera fly-to, open info card, play audio.
- Reuses existing `setSelectedBird` store action.
- Button positioned in bottom-right corner, large tap target (min 48px).

### R-17: Migration Story Animation *(v6)*
- Enhance existing migration arcs with a small bird icon (sphere or triangle) that moves along the arc path.
- Movement: traverse full arc over 3 seconds, loop continuously.
- Glow trail: short fading trail behind the moving icon using opacity.
- Display text via `<Html>` from drei at arc midpoint: "This bird travels XXXX km every year" / "这只鸟每年飞行XXXX公里".
- Data: `migrationDistanceKm` field on migration routes.
- Text only visible when camera is close enough (distance < 2.5).

### R-18: Bird Size Comparison *(v6)*
- Show relative size category in info card with visual indicator.
- Categories: tiny (sparrow), small (pigeon), medium (duck), large (eagle).
- Data field: `sizeCategory` on each bird.
- Visual: horizontal bar or icon scale in the info card.

### R-19: Continent Learning Panel *(v6)*
- When a continent label is clicked, show a slide-in panel listing all birds in that continent.
- Panel shows bird name + thumbnail for each entry.
- Click a bird entry → camera flies to that bird (reuse existing zoom).
- Panel styled consistently with BirdInfoCard.

### R-20: Mini Quiz Mode *(v6)*
- Quiz button: "🎮 Quiz" / "🎮 答题" in UI.
- Three game types per round (randomly selected):
  A) Geography: "Find the bird that lives in [region]" — user clicks correct bird on globe.
  B) Sound: Play a bird call — user picks from 3 choices.
  C) Size: "Which bird is the largest?" — user picks from 3 choices.
- 3 questions per round, score displayed.
- Correct: confetti animation. Wrong: card shake.
- State managed in Zustand store.

### R-21: Wing Flap Animation *(v6)*
- Bird markers have subtle wing rotation animation.
- Period: ~1.2 seconds. Small amplitude.
- Implemented via `useFrame` in BirdMarker, rotating wing sub-meshes or applying a gentle scale oscillation on Y-axis.

### R-22: Bird Encyclopedia Panel *(v6)*
- Scrollable panel listing all 15 birds.
- Each entry: bird photo thumbnail, Chinese name, English name.
- Click entry → camera flies to bird, info card opens.
- Toggle button: "📖" in UI toolbar.
- Panel slides in from left side.

### R-23: Global Migration Map *(v7)*
- Add a toggle button: "🗺️ All Routes" / "🗺️ 全部路线" in the UI toolbar.
- When active, render ALL migration routes simultaneously with distinct colors per route.
- Each route uses a unique warm color from a predefined palette (gold, coral, teal, violet).
- Routes that are not currently active are rendered with reduced opacity (0.3).
- The flying bird icons continue to animate on all visible routes.
- Toggle state managed in Zustand store: `showAllRoutes: boolean`.
- When a specific bird is selected, its migration route highlights at full opacity while others dim.
- Button positioned near the quiz/discover buttons for consistency.

### R-24: Bird Evolution Timeline *(v7)*
- Slide-in panel from the bottom showing a horizontal timeline.
- Timeline spans from 150 million years ago (Archaeopteryx) to present day.
- Each bird in the dataset is placed on the timeline based on its `evolutionEra` field.
- Eras: `"mesozoic"` (150–66 Mya), `"paleogene"` (66–23 Mya), `"neogene"` (23–2.6 Mya), `"quaternary"` (2.6 Mya–present).
- Each bird appears as a small circular avatar on the timeline at its era position.
- Click a bird on the timeline → camera flies to that bird on the globe.
- Timeline is scrollable horizontally on mobile.
- Toggle button: "🦕 Timeline" / "🦕 时间线" in UI toolbar.
- Panel styled consistently with other panels (rounded corners, warm colors).
- Uses `evolutionTimelineOpen: boolean` in Zustand store.

### R-25: Bird Diet System *(v7)*
- Display bird diet information in the info card with visual food icons.
- Diet types: `"insects"`, `"fish"`, `"seeds"`, `"fruit"`, `"meat"`, `"omnivore"`.
- Each diet type has a corresponding emoji icon: insects 🐛, fish 🐟, seeds 🌾, fruit 🍎, meat 🥩, omnivore 🍽️.
- Data field: `dietType` on each bird (replaces free-text `diet` for structured display).
- Show diet type label + icon in a compact row in the info card.
- Bilingual labels: e.g., "Diet: Insects" / "食性：昆虫".

### R-26: Wingspan Visualization *(v7)*
- Display a horizontal wingspan comparison bar in the info card.
- Data field: `wingspanCm` (number) on each bird — wingspan in centimeters.
- Bar shows the bird's wingspan relative to a child's arm span (~120 cm) as reference.
- Visual: colored bar with the bird's wingspan, a dashed line at 120 cm labeled "Your arm span" / "你的臂展".
- Scale: 0–250 cm range. Bar color matches the bird's habitat color.
- Show numeric value: "Wingspan: 180 cm" / "翼展：180厘米".

### R-27: Sound Guess Mode *(v7)*
- New gameplay mode: "🎵 Sound Guess" / "🎵 听声辨鸟" button in UI.
- Gameplay flow:
  1. Play a random bird's audio call.
  2. Show 3 bird photo options (one correct, two distractors).
  3. Child selects the bird they think matches the sound.
  4. Correct: confetti + fly to the bird on globe. Wrong: shake + reveal correct answer.
- 5 rounds per game session.
- Score tracked and displayed at end.
- Reuses audio playback system and confetti/shake from quiz mode.
- State managed in Zustand: `soundGuessState`, `soundGuessRound`, `soundGuessScore`, `soundGuessOptions`, `soundGuessCorrectId`.

### R-28: Improved Starfield Depth *(v7)*
- Replace single-layer starfield with a multi-layer parallax starfield.
- **Layer 1 (far)**: 3000 tiny stars at radius 15–20, very slow rotation offset.
- **Layer 2 (mid)**: 1500 medium stars at radius 10–15, moderate rotation offset.
- **Layer 3 (near)**: 500 larger stars at radius 6–10, faster rotation offset.
- Each layer rotates at a slightly different speed relative to camera movement, creating parallax depth.
- Use `<Points>` + `<PointMaterial>` from drei for each layer.
- Star colors: mostly white with occasional warm tint (5% of stars have a slight gold or blue hue).
- Total particle count: ~5000 (performance-safe).
- Subtle twinkle effect: 10% of stars have a slow opacity oscillation via custom shader or `useFrame`.

## Extended Data Model (v7)

### Bird type additions (v7 — backward compatible, all optional):
```typescript
interface Bird {
  // ... existing fields ...
  evolutionEra?: "mesozoic" | "paleogene" | "neogene" | "quaternary";
  dietType?: "insects" | "fish" | "seeds" | "fruit" | "meat" | "omnivore";
  wingspanCm?: number;
}
```

## Extended Data Model (v6)

### Bird type additions (backward compatible — all optional):
```typescript
interface Bird {
  // ... existing fields ...
  sizeCategory?: "tiny" | "small" | "medium" | "large";
  habitatType?: "rainforest" | "wetlands" | "coast" | "grassland" | "forest" | "polar";
  migrationDistanceKm?: number;
  diet?: string;
  wingspan?: string;
  lifespan?: string;
}
```

### MigrationRoute type additions:
```typescript
interface MigrationRoute {
  // ... existing fields ...
  migrationDistanceKm?: number;
}
```

## Non-goals

- **Seasonal migration routes** — no animated flight paths between habitats beyond the defined routes.
- **User accounts or progress tracking**.
- **Offline support / PWA**.
- **Server-side rendering**.
- **CMS or admin panel**.
- **Deployment pipeline**.
- **Click interaction on migration paths**.
- **High-resolution GeoJSON** — use simplified/low-res data only.

## Known Bugs Fixed

### Previously fixed bugs
- BUG-15: OrbitControls target drifts on bird click — Fixed in v5.
- BUG-16: Bird model quality too low — Fixed in v5.
- BUG-17: useGLTF inside try-catch violates React hooks rules — Fixed in v5.
- BUG-9 through BUG-14: Fixed in v4 (atmosphere, markers, auto-rotation, camera zoom, migration arcs).
- BUG-1 through BUG-8: Fixed in v2/v3.

## Acceptance Criteria

### AC-1: Globe Interaction — updated v5
- [ ] Globe renders within 3 seconds on a mid-range laptop.
- [ ] Earth sphere has radius exactly 1.0 with no scaling artifacts.
- [ ] Cloud layer visible as separate semi-transparent mesh.
- [ ] Atmosphere glow is a soft Fresnel shell — no hard edges, no blue ring artifact at any zoom level.
- [ ] Country borders visible as thin semi-transparent lines on the globe surface.
- [ ] Drag-to-rotate works with mouse and touch. Rotation always pivots around globe center [0,0,0].
- [ ] Scroll/pinch-to-zoom clamped: minimum distance >= 1.15.
- [ ] Starfield background visible with varied star sizes.

### AC-2: Bird Markers — updated v5
- [ ] 15 bird markers visible as recognizable 3D bird models (not crude geometric shapes).
- [ ] Bird models face outward from globe surface.
- [ ] Models appropriately scaled (0.02–0.04 units).
- [ ] Markers at geographically correct locations.
- [ ] Markers rotate with the globe.
- [ ] Subtle idle bob animation.
- [ ] Hover shows smooth scale-up and glow.
- [ ] Warm-toned lit materials visible against land and ocean.
- [ ] Fallback to golden spheres if model loading fails.

### AC-3: Info Card — unchanged
- [ ] Clicking a marker opens info card with correct data.
- [ ] Card displays real photo, Chinese name, pinyin, English name, fun fact.
- [ ] Close via button or click outside.
- [ ] Only one card open at a time.

### AC-4: Audio — unchanged
- [ ] Bird call plays on card open.
- [ ] Switching birds stops previous audio.
- [ ] Closing card stops audio.
- [ ] Audio ended returns to idle status.
- [ ] Graceful fallback if API unavailable.

### AC-5: Bilingual — unchanged
- [ ] Language toggle visible and functional.
- [ ] All text switches between Chinese and English.
- [ ] Default: Chinese.

### AC-6: Visual Quality — updated v5
- [ ] Child-friendly UI: rounded corners, warm colors, large tap targets (min 44px).
- [ ] Improved lighting: hemisphere light provides natural sky-ground gradient.
- [ ] All materials use physically-based rendering (MeshStandardMaterial).
- [ ] Works on 375px to 1920px screens.
- [ ] Loading screen tied to actual asset loading.

### AC-7: Camera Zoom-to-Bird — updated v5
- [ ] Clicking bird smoothly rotates and zooms camera.
- [ ] OrbitControls target remains [0,0,0] throughout animation and after.
- [ ] Animation ~1 second with eased interpolation.
- [ ] User can interrupt by dragging.
- [ ] Closing card zooms back out (rotation preserved).
- [ ] After zoom-back, manual rotation works correctly around globe center.

### AC-8: Data Quality — unchanged
- [ ] All 15 birds have real photographs.
- [ ] 5 Singapore birds with accurate coordinates.
- [ ] Silhouette keys match SVG filenames.
- [ ] Data README documents schema.

### AC-9: Auto-Rotation — updated v5
- [ ] Globe auto-rotates when idle (>5 seconds, no bird selected).
- [ ] Drag pauses; resumes after 5s idle.
- [ ] Zoom pauses; resumes after 5s idle.
- [ ] Bird click pauses; card close resumes after 5s idle.
- [ ] Auto-rotation speed consistent at all zoom levels.
- [ ] OrbitControls target never changes from [0,0,0].

### AC-10: Migration Paths — updated v5
- [ ] At least 3 animated migration arcs visible.
- [ ] Arcs follow globe surface closely (peak 0.05–0.10 above surface).
- [ ] Short-distance arcs lower than long-distance arcs.
- [ ] Arcs follow globe curvature (no straight chords).
- [ ] No curve clips through Earth sphere.
- [ ] Dash animation flows continuously.

### AC-11: Map Overlays — v5
- [ ] Country/continent borders visible as thin semi-transparent lines on globe.
- [ ] Borders do not interfere with bird marker interactions.
- [ ] Continent labels appear when zoomed in (camera distance < 2.0).
- [ ] Ocean labels appear when zoomed in.
- [ ] Labels fade in/out smoothly based on zoom level.
- [ ] Labels switch language with the language toggle.
- [ ] Labels are readable but subtle — they don't dominate the visual.

### AC-12: Sound Ripple *(v6)*
- [ ] Expanding ring waves visible when bird audio plays.
- [ ] Rings fade out over ~2 seconds.
- [ ] Rings positioned at bird marker location on globe surface.
- [ ] No performance degradation from ripple animation.

### AC-13: Habitat Highlight *(v6)*
- [ ] Colored glow patch visible on globe when bird selected.
- [ ] Color matches bird's habitat type.
- [ ] Glow does not clip into globe.
- [ ] Glow disappears when bird deselected.

### AC-14: Discover Mode *(v6)*
- [ ] "Discover Bird" button visible and tappable.
- [ ] Clicking selects random bird, flies camera, opens card, plays audio.
- [ ] Button bilingual (zh/en).

### AC-15: Migration Story *(v6)*
- [ ] Small icon moves along migration arc paths.
- [ ] Movement loops over 3 seconds.
- [ ] Distance text visible when zoomed in.
- [ ] Text bilingual.

### AC-16: Bird Size Comparison *(v6)*
- [ ] Size category displayed in info card.
- [ ] Visual indicator shows relative size.

### AC-17: Continent Learning *(v6)*
- [ ] Clicking continent label opens bird list panel.
- [ ] Panel shows correct birds for that continent.
- [ ] Clicking bird entry flies camera to bird.

### AC-18: Mini Quiz *(v6)*
- [ ] Quiz button visible and functional.
- [ ] 3 question types work correctly.
- [ ] Score displayed after round.
- [ ] Confetti on correct answer.
- [ ] Card shake on wrong answer.

### AC-19: Wing Flap *(v6)*
- [ ] Bird markers show subtle wing animation.
- [ ] Animation period ~1.2 seconds.
- [ ] Animation does not affect marker click targets.

### AC-20: Bird Encyclopedia *(v6)*
- [ ] Encyclopedia panel opens with all 15 birds listed.
- [ ] Each entry shows thumbnail and names.
- [ ] Clicking entry flies to bird and opens info card.
- [ ] Panel scrollable on overflow.

### AC-21: Global Migration Map *(v7)*
- [ ] "All Routes" toggle button visible and functional.
- [ ] All migration routes render simultaneously when toggled on.
- [ ] Each route has a distinct color.
- [ ] Selected bird's route highlights while others dim.
- [ ] Flying bird icons animate on all visible routes.
- [ ] Toggle off hides non-selected routes.

### AC-22: Bird Evolution Timeline *(v7)*
- [ ] Timeline panel opens from bottom with toggle button.
- [ ] Birds placed on timeline at correct era positions.
- [ ] Click bird on timeline flies camera to that bird.
- [ ] Timeline scrollable on mobile.
- [ ] Panel bilingual (zh/en).

### AC-23: Bird Diet System *(v7)*
- [ ] Diet type displayed in info card with food icon.
- [ ] Correct emoji icon for each diet type.
- [ ] Label bilingual.

### AC-24: Wingspan Visualization *(v7)*
- [ ] Wingspan bar visible in info card.
- [ ] Bar shows bird's wingspan relative to child's arm span.
- [ ] Reference line at 120 cm labeled correctly.
- [ ] Numeric value displayed.
- [ ] Bar bilingual.

### AC-25: Sound Guess Mode *(v7)*
- [ ] "Sound Guess" button visible and functional.
- [ ] Audio plays for random bird.
- [ ] 3 photo options displayed.
- [ ] Correct answer triggers confetti + fly-to.
- [ ] Wrong answer triggers shake + reveal.
- [ ] Score displayed after 5 rounds.

### AC-26: Improved Starfield *(v7)*
- [ ] Multiple star layers visible with depth variation.
- [ ] Parallax effect visible when rotating globe.
- [ ] Star size variation across layers.
- [ ] Subtle twinkle effect on some stars.
- [ ] No performance degradation (~60 FPS maintained).

### AC-ARCH: Architecture Invariants (unchanged)
- [ ] OrbitControls target always [0,0,0].
- [ ] Camera zoom respects minDistance 1.15.
- [ ] Bird markers face outward from globe surface.
- [ ] Migration arcs follow globe curvature.
- [ ] No scene.add() or scene.remove() calls.
- [ ] All animations via useFrame.
- [ ] All geometry via useMemo.
- [ ] GLTF loading via Suspense.
