# 万羽拾音 (Kids Bird Globe) — Feature Specification (v4)

> **v4 changelog**: Auto-rotation resume fix after user interaction, camera zoom-through-globe prevention, atmosphere visual overhaul (remove blue ring artifact, replace with realistic atmospheric glow), migration arc height reduction for natural surface-following paths, bird markers redesigned from golden dots to small 3D bird models with outward orientation and hover glow.
>
> **v3 changelog**: New migration-path animations, globe rendering fixes, bird marker redesign (golden glowing points), auto-rotation fix, Singapore-focused bird data, cloud layer.
>
> **v2 changelog**: Bug fixes, visual/interaction improvements, camera zoom-to-bird, richer bird data.

## Goal

Build an interactive 3D globe web application that teaches children (ages 5–12) about birds around the world. Users spin a clean, realistic globe, tap on small 3D bird models perched on the surface, watch natural migration arcs flowing between continents, and hear real bird calls while reading bilingual fun facts. The experience should feel playful, immediate, and educational — every click rewards the child with sound and visual feedback. The globe should auto-rotate smoothly and recover gracefully from all user interactions.

## User Stories

### US-1: Explore the Globe
As a child, I can drag to rotate and scroll to zoom a 3D Earth so that I feel like I'm exploring the real world.

### US-2: Discover Birds
As a child, I can see small 3D bird models perched on the globe so that I know where different birds live. The birds glow softly and respond when I hover over them.

### US-3: Learn About a Bird
As a child, I can click a bird marker to open an info card showing the bird's photo, Chinese name with pinyin, English name, and a fun fact in both languages so that I learn something new.

### US-4: Hear Bird Calls
As a child, I can hear the real call of a bird when I click its marker so that I connect the bird to its sound.

### US-5: Switch Languages
As a user, I can toggle between Chinese and English so that I can read in my preferred language.

### US-6: Navigate Intuitively
As a parent, I can hand the app to my child without explanation because the interface is self-evident — large targets, clear icons, no text-heavy menus.

### US-7: Zoom Into a Bird's Home
As a child, when I click a bird marker, the globe smoothly rotates and zooms to center that bird's location, making me feel like I'm flying there.

### US-8: Watch Migration Paths *(new v3)*
As a child, I can see animated glowing curved lines connecting birds across the globe, showing me how birds migrate between regions — like a stork flying from Singapore to Europe.

## Requirements

### R-1: 3D Globe (React Three Fiber) — updated v4
- Render a textured Earth sphere using a NASA Blue Marble (or equivalent free) texture.
- **Globe geometry**: The Earth sphere must have radius exactly `1.0`. No scaling artifacts.
- **Cloud layer**: Render a separate semi-transparent cloud mesh at radius ~1.005 (slightly above the Earth surface) using a cloud/alpha texture. This must be a distinct mesh from the Earth, not baked into the Earth material.
- **Atmosphere — redesigned v4**: The previous `Atmosphere` component (BackSide sphere at scale 1.12 with Fresnel shader) produced a hard-edged blue ring artifact. This must be completely removed or replaced:
  - **Option A (preferred)**: Replace with a subtle post-processing atmospheric glow — a soft, view-dependent rim light on the globe edge using a custom fragment shader that blends a faint blue-white glow based on the viewing angle (dot product of surface normal and view direction). No separate geometry required.
  - **Option B**: Use a very thin atmosphere shell (scale 1.01–1.03) with a smooth Fresnel falloff (exponent 4.0–6.0, low opacity 0.15–0.25) that fades gracefully rather than producing a hard edge. Must be validated artifact-free at all zoom levels and camera angles.
  - **Forbidden**: No visible blue ring, hard-edged band, or clipping artifact at any zoom level. If neither option produces a clean result, remove the atmosphere entirely and rely on the cloud layer and lighting for visual depth.
- **Camera zoom constraint — new v4**: The camera must never penetrate the globe surface. Enforce a minimum camera distance from the globe center of at least `1.15` (globe radius 1.0 + buffer). OrbitControls `minDistance` must be set to prevent the camera from entering or clipping through the Earth sphere. This must hold during scroll zoom, pinch zoom, and programmatic camera animations (e.g., zoom-to-bird).
- Dark starry background (particle-based starfield).
- Orbit controls: mouse/touch drag to rotate, scroll/pinch to zoom.
- Smooth damping on all camera movements.
- Responsive — fills the viewport on desktop and mobile.

### R-2: Bird Data — updated v3
- Ship a `birds.json` file containing **15 bird entries** (reduced from 35 for focused quality).
- **Singapore focus**: Include **5 birds based in Singapore** with real geographic coordinates (e.g., Sungei Buloh, Jurong Bird Park, Pulau Ubin, Botanic Gardens, East Coast Park).
- The remaining 10 birds should cover other major regions: Europe, Africa, North America, South America, Oceania.
- Each entry includes: `id`, `nameZh`, `pinyin`, `nameEn`, `scientificName`, `lat`, `lng`, `funFactZh`, `funFactEn`, `photoUrl`, `xenoCantoQuery`, `silhouette`, `region`, and `audioUrl` (optional direct audio URL as fallback).
- Bird photos bundled in `/public/images/birds/` — real photographs, not placeholders.
- **Data consistency**: The `silhouette` field in each bird entry must exactly match the filename (minus extension) of the corresponding SVG in `src/assets/silhouettes/`. No mismatches allowed.
- **Extensibility**: The data schema should be documented. Adding a new bird requires only: (1) a new entry in `birds.json`, (2) a photo in `/public/images/birds/`, (3) a silhouette SVG in `src/assets/silhouettes/`. No code changes.

### R-3: Bird Markers — updated v4
- **Visual style — redesigned v4**: Replace the golden dot markers with **small 3D bird models** on the globe surface.
  - **Model**: Use a low-poly 3D bird mesh (GLTF/GLB format, <50 KB per model). A single shared bird model can be instanced for all markers with per-bird color tinting if desired. Alternatively, use 2–3 distinct silhouette variants (e.g., songbird, raptor, waterbird) mapped via the bird's `silhouette` field.
  - **Scale**: Each bird model should be small relative to the globe — approximately 0.02–0.04 units in size. Large enough to be clearly visible and tappable, small enough not to clutter the globe.
  - **Orientation**: Each bird model must face **outward from the globe surface** (normal to the sphere at its lat/lng position). The model's "up" direction should align with the surface normal so the bird appears to stand on the globe. Use a lookAt or quaternion rotation derived from the position vector.
  - **Material**: Warm-toned material (gold/amber base color) with subtle emissive glow so birds are visible against both land and ocean textures. Not flat or unlit.
  - **Idle animation**: Gentle hover/bob animation — the bird model floats slightly above its anchor point with a slow sine-wave vertical oscillation (amplitude ~0.005 units, period ~2 seconds).
- **Positioning**: Markers must be positioned using `latLngToVector3(lat, lng, 1.02)` and then **added as children of the Earth mesh** (`earth.add(birdMesh)`) so they rotate with the globe. They must NOT be positioned in world space independently.
- **Hover interaction — new v4**: On hover (pointer enter), the bird model should:
  - Scale up to 1.4× smoothly (spring or lerp transition, ~200ms).
  - Emit a soft glow effect — increase emissive intensity or add a small point light / bloom highlight around the model.
  - Optionally show the bird's name as a floating label above the model.
- **Click**: Select the bird, open the info card, trigger camera zoom, and play audio.
- **Fallback**: If 3D bird models cannot be loaded (network error, unsupported device), fall back to the v3 golden sphere markers with pulse animation as a graceful degradation.

### R-4: Info Card
- 2D overlay card that slides in from the side (or bottom on mobile).
- Displays: bird photo (real photograph with gradient fallback on error), Chinese name, pinyin, English name, fun fact (bilingual).
- Close button and click-outside-to-dismiss.
- Accessible: proper focus management, ARIA labels.

### R-5: Audio Playback
- On bird selection, fetch a recording from the xeno-canto API (`https://xeno-canto.org/api/2/recordings?query={species}`).
- If the bird entry has a direct `audioUrl` field, use that as a primary source before falling back to xeno-canto.
- Auto-play the first high-quality result.
- Clicking a different bird stops the current audio and starts the new one.
- Closing the card stops playback.
- **When audio finishes playing naturally**, status must return to `"idle"` (listen for the `ended` event).
- Graceful fallback if the API is unavailable, returns no results, or returns malformed JSON (show a muted-speaker icon, no crash).
- Wrap `response.json()` in try/catch to handle malformed API responses.

### R-6: Bilingual UI
- All user-facing text has Chinese and English variants stored in the bird data.
- A language toggle (top corner) switches between `zh` and `en`.
- Default language: Chinese.

### R-7: Tech Stack
- React 18+ with TypeScript.
- Vite as the build tool.
- `three` / `@react-three/fiber` / `@react-three/drei` for 3D.
- Tailwind CSS for 2D UI styling.
- No backend — fully static single-page application.

### R-8: Camera Zoom-to-Bird — updated v4
- When a bird marker is clicked, the camera smoothly animates to center on that bird's geographic location.
- The animation should:
  - Rotate the globe so the bird's lat/lng faces the camera.
  - Zoom in to a closer distance (e.g., from default 2.5 to ~1.8), but **never closer than the minimum distance** defined in R-1 (1.15 from globe center). Clamp the target zoom distance to `max(targetDistance, minDistance)`.
  - Use eased interpolation (e.g., `THREE.MathUtils.lerp` or a spring) over ~1 second.
  - Not block user interaction — the user can interrupt the animation by dragging.
- When the info card is closed, the camera should smoothly zoom back out to the default distance (but not reset rotation).

### R-9: Visual Polish — updated v4
- **Loading screen**: Tied to actual asset loading completion (texture loaded, bird models loaded), not a fixed timer. Use `Suspense` state or texture/model `onLoad` callback.
- **Globe atmosphere — revised v4**: A subtle atmospheric glow around the globe edge — must be artifact-free (see R-1). No visible blue ring or hard-edged band. If a clean glow cannot be achieved, omit the atmosphere entirely; the cloud layer and lighting provide sufficient visual depth.
- **Starfield depth**: Stars should have slight size variation for depth perception.
- **Card transitions**: Slide-in/out should feel springy and responsive, not linear.
- **Visual goal (v4)**: The overall visual impression should be a clean, realistic globe with natural migration arcs, elegant bird models, and stable auto-rotation. No visual artifacts or jarring elements.

### R-10: Rich Bird Resources
- **Real photographs**: Every bird must have a real photograph (sourced from royalty-free/CC-licensed sources like Unsplash, Pixabay, or Wikimedia Commons). Placeholder 1×1 JPEGs are not acceptable.
- **Photo quality**: Images should be at least 400×300px, optimized to <80 KB each, in JPEG or WebP format.
- **Data documentation**: Include a `src/data/README.md` explaining the data schema, how to add a new bird, and attribution/licensing for photos and audio.

### R-11: Auto-Rotation — updated v4
- Use `OrbitControls.autoRotate = true` with `autoRotateSpeed = 1.0` for idle rotation.
- **Interaction lifecycle — refined v4**: Auto-rotation must correctly pause and resume across all interaction types (drag, zoom, bird click). The following state machine governs auto-rotation:
  1. **On drag start (mousedown/touchstart or OrbitControls `start` event)**: Set `autoRotate = false` immediately. The globe stops rotating while the user is actively dragging.
  2. **On drag end (mouseup/touchend or OrbitControls `end` event)**: Record the interaction timestamp. Do NOT immediately re-enable `autoRotate`. Instead, let the idle-timeout logic handle resumption.
  3. **Idle timeout**: In the per-frame update loop (`useFrame`), check if the time since the last interaction exceeds the idle threshold (5 seconds). If so, set `autoRotate = true` and `autoRotateSpeed = 1.0`. This ensures auto-rotation resumes with the correct speed and axis regardless of what interaction preceded it.
  4. **On bird select**: Set `autoRotate = false`. Auto-rotation stays paused for the duration of the bird card being open.
  5. **On bird deselect (card close)**: Record the interaction timestamp. Auto-rotation resumes after the idle timeout (same as drag end).
  6. **On zoom (scroll/pinch)**: Record the interaction timestamp. Auto-rotation pauses during active zooming and resumes via idle timeout.
- **Speed consistency**: When zoomed in close to the globe, auto-rotation can appear faster because the camera is nearer to the surface. To maintain a visually consistent rotation speed, scale `autoRotateSpeed` inversely with camera distance: `autoRotateSpeed = baseSpeed * (currentDistance / defaultDistance)`. This keeps the perceived surface movement speed constant.
- **Critical fix from v3**: The v3 implementation's `start` event handler set `autoRotate = false` but no corresponding `end` handler re-enabled it. The `end` event listener (or `mouseup`/`touchend`) was missing entirely. This v4 spec requires both `start` and `end` event handling as described above.

### R-12: Migration Paths — updated v4
- Render animated curved lines between pairs of birds to visualize migration routes.
- **Curve geometry — revised v4**: Use `THREE.CatmullRomCurve3` (or `QuadraticBezierCurve3`) to create smooth arcs between two bird positions on the globe. The curves must follow the Earth's surface more closely than v3:
  - **Peak height**: The maximum arc height above the globe surface should be **~0.05–0.10 units** (previously ~0.3). This produces a natural, surface-hugging trajectory rather than an exaggerated space-arc.
  - **Height scaling by distance**: For short-distance migrations (birds on the same continent), use a lower arc (~0.03–0.05). For long-distance migrations (cross-continental), allow a slightly higher arc (~0.08–0.12) so the curve remains visible and doesn't clip through the globe at the midpoint.
  - **Intermediate control points**: For long arcs, use 3–5 intermediate control points placed along the great-circle path at radius `1.0 + arcHeight`, ensuring the curve follows the globe's curvature rather than cutting a straight chord through it.
  - **No clipping**: Curves must never pass through the Earth sphere. All control points must be at radius ≥ 1.01.
- **Visual style**: Glowing lines with animated dashes.
  - Use a custom `ShaderMaterial` with a dash pattern that animates along the curve (moving dash offset over time).
  - Line color: warm gradient (e.g., gold → orange) or a single glowing color matching the bird markers.
  - Line width: Thin but visible (~2px equivalent via `LineBasicMaterial` or `MeshLine`).
- **Animation**: The dash pattern should continuously animate along the curve direction, creating the illusion of particles/energy flowing along the migration path.
- **Data**: Migration routes are defined as an array of `{ from: birdId, to: birdId }` pairs in a `migrations.json` file (or embedded in `birds.json`). Example routes:
  - White Stork (Singapore) → European Robin (Europe)
  - Arctic Tern (if included) → Emperor Penguin (Antarctica)
  - At least 3–5 migration paths for the initial dataset.
- **Interaction**: Migration paths are decorative/ambient — they animate continuously. No click interaction required on the paths themselves.
- **Performance**: Curves should be computed once and cached. Only the dash offset uniform needs to update per frame.

## Non-goals

These are explicitly out of scope:

- ~~**Seasonal migration routes** — no animated flight paths between habitats.~~ *(moved to R-12 in v3)*
- **Continent-based filtering** — no filter/search UI to narrow birds by region.
- **User accounts or progress tracking** — no login, no "birds collected" state.
- **Offline support / PWA** — no service worker or offline caching.
- **Server-side rendering** — purely client-side.
- **CMS or admin panel** — bird data is a static JSON file, edited by hand.
- **Deployment pipeline** — local development only for now.
- **Click interaction on migration paths** — paths are purely visual/decorative.

## Known Bugs to Fix (v4)

These bugs exist in the current implementation and must be resolved:

### BUG-9: Blue background halo / atmosphere artifact — updated v4
The `Atmosphere` component renders a sphere at scale 1.12 with `BackSide` + Fresnel shader. This produces a visible hard-edged blue ring or clipping artifact instead of a smooth atmospheric glow.
**Fix (v4)**: Remove the current `Atmosphere` component entirely. Replace with either (a) a view-dependent rim-glow shader on the globe material itself, or (b) a very thin atmosphere shell at scale 1.01–1.03 with smooth Fresnel falloff (exponent 4.0–6.0, opacity 0.15–0.25). If neither approach eliminates the artifact, remove the atmosphere visual entirely. See R-1 for full requirements.

### BUG-10: Black anchor points / bird markers not glowing — superseded v4
Bird markers currently use `meshBasicMaterial` with a `CanvasTexture` (teardrop pin). They appear as "black anchor points."
**Fix (v4)**: This bug is superseded by the R-3 redesign. Markers are now 3D bird models (not golden spheres or dots). The new models use lit materials with emissive glow. If model loading fails, fall back to golden `MeshPhongMaterial` spheres. See R-3 for full requirements.

### BUG-11: Drag permanently stops auto-rotation — updated v4
The `CameraController` listens for OrbitControls `start` event and sets `autoRotate = false`, but never re-enables it after the drag ends. This also affects zoom and bird-click interactions — any user interaction can permanently kill auto-rotation.
**Fix (v4)**: Implement the full interaction lifecycle described in R-11. Key changes: (1) Add an OrbitControls `end` event listener that records the interaction timestamp. (2) The idle-timeout logic in `useFrame` re-enables `autoRotate = true` with `autoRotateSpeed = 1.0` after 5 seconds of no interaction. (3) Scale `autoRotateSpeed` inversely with camera distance for consistent perceived speed. (4) Ensure zoom (scroll/pinch) also records interaction timestamps and pauses auto-rotation.

### BUG-12: Birds don't follow globe rotation *(from v3)*
Bird markers are positioned in world space as siblings of the globe mesh. When the globe rotates, markers stay fixed in space.
**Fix**: Bird meshes must be added as **children** of the Earth mesh group (`earth.add(birdMesh)`) so they inherit the globe's rotation transform. The `latLngToVector3` positions must be in the globe's local coordinate space, not world space.

### BUG-13: Camera can zoom through the globe *(new v4)*
The camera zoom (scroll/pinch) has no minimum distance constraint, allowing the camera to penetrate the Earth sphere. This produces visual glitches (seeing the inside of the globe, inverted normals, disappearing textures).
**Fix**: Set `OrbitControls.minDistance = 1.15` (globe radius 1.0 + 0.15 buffer). Also ensure that programmatic camera animations (zoom-to-bird in R-8) clamp the target distance to this minimum. Verify the constraint holds for both scroll zoom and pinch zoom on touch devices.

### BUG-14: Migration arcs too high above the globe *(new v4)*
Migration path curves arc ~0.3 units above the globe surface, making them look like satellite orbits rather than bird flight paths. The visual effect is unnatural and disconnected from the Earth.
**Fix**: Reduce peak arc height to 0.05–0.10 units above the surface. Use distance-scaled heights (shorter migrations = lower arcs). Add intermediate control points along the great-circle path for long routes so curves follow the globe curvature. See R-12 for full requirements.

### Previously Fixed Bugs (v2)
The following bugs from v2 have been resolved and should remain fixed:
- BUG-1: `useMemo` for side effects → fixed with `useEffect`
- BUG-2: Texture memory leak → fixed with `dispose()` in cleanup
- BUG-3: Pin shadow rendering → fixed with `ctx.shadowBlur`
- BUG-4: Silhouette key mismatches → fixed in `birds.json`
- BUG-5: Audio `ended` event → fixed with `onEnded` callback
- BUG-6: Malformed JSON handling → fixed with try/catch
- BUG-7: Fixed-timer loading screen → fixed with `globeReady` state
- BUG-8: Placeholder photos → replaced with real Wikimedia photos

## Acceptance Criteria

### AC-1: Globe Interaction — updated v4
- [ ] Globe renders within 3 seconds on a mid-range laptop.
- [ ] Earth sphere has radius exactly 1.0 with no scaling artifacts.
- [ ] Cloud layer is visible as a separate semi-transparent mesh above the Earth surface.
- [ ] No blue ring artifact — the old BackSide/Fresnel atmosphere is removed or replaced with an artifact-free alternative. Verified at all zoom levels and camera angles.
- [ ] If an atmosphere glow is present, it is a subtle, smooth rim effect with no hard edges.
- [ ] Drag-to-rotate works with mouse and touch.
- [ ] Scroll/pinch-to-zoom works and is clamped: minimum distance ≥ 1.15 from globe center (camera cannot penetrate the globe).
- [ ] Zoom constraint holds for scroll zoom, pinch zoom, and programmatic zoom-to-bird animations.
- [ ] Starfield background is visible behind the globe with varied star sizes.

### AC-2: Bird Markers — updated v4
- [ ] 15 bird markers are visible on the globe as small 3D bird models (not yellow dots or golden spheres).
- [ ] Bird models face outward from the globe surface (oriented along the surface normal).
- [ ] Models are appropriately scaled (0.02–0.04 units) — visible and tappable but not cluttering the globe.
- [ ] Markers are positioned at geographically correct locations.
- [ ] Markers rotate with the globe (they are children of the globe mesh, not world-space objects).
- [ ] Markers have a subtle idle animation (gentle hover/bob oscillation).
- [ ] Hovering a marker shows a smooth scale-up (to ~1.4×) and glow/emissive highlight.
- [ ] No markers appear as black dots, invisible, or flat — all have warm-toned lit materials.
- [ ] If 3D model loading fails, markers gracefully fall back to golden glowing spheres (v3 style).

### AC-3: Info Card
- [ ] Clicking a marker opens the info card with correct data for that bird.
- [ ] Card displays: real bird photo (not a placeholder), Chinese name, pinyin, English name, fun fact.
- [ ] Card can be closed via close button or clicking outside.
- [ ] Only one card is open at a time.

### AC-4: Audio
- [ ] Bird call audio plays automatically when a card opens.
- [ ] Switching birds stops the previous audio and plays the new one.
- [ ] Closing the card stops audio.
- [ ] When audio finishes playing naturally, the status indicator returns to idle.
- [ ] If xeno-canto is unreachable or returns bad data, the app does not crash; a fallback state is shown.

### AC-5: Bilingual
- [ ] Language toggle is visible and functional.
- [ ] Toggling switches all card text and UI labels between Chinese and English.
- [ ] Default language is Chinese.

### AC-6: Visual Quality
- [ ] UI feels child-friendly: rounded corners, warm colors, large tap targets (min 44px).
- [ ] No text-heavy screens — visuals dominate.
- [ ] Works on screens from 375px (phone) to 1920px (desktop) wide.
- [ ] Loading screen is tied to actual asset loading, not a fixed timer.

### AC-7: Camera Zoom-to-Bird
- [ ] Clicking a bird marker smoothly rotates and zooms the camera to center on that bird.
- [ ] The animation takes ~1 second with eased interpolation.
- [ ] The user can interrupt the animation by dragging the globe.
- [ ] Closing the info card zooms the camera back out to the default distance.

### AC-8: Data Quality
- [ ] All 15 birds have real photographs (not 1×1 placeholders).
- [ ] 5 birds are based in Singapore with accurate coordinates.
- [ ] All silhouette keys in `birds.json` match the SVG filenames in `src/assets/silhouettes/`.
- [ ] A `src/data/README.md` documents the schema and how to add new birds.
- [ ] Adding a new bird requires no code changes — only data files.

### AC-9: Auto-Rotation — updated v4
- [ ] Globe auto-rotates when idle (no user interaction for >5 seconds, no bird selected).
- [ ] Dragging the globe pauses auto-rotation; releasing resumes it after the 5-second idle timeout.
- [ ] Zooming (scroll/pinch) pauses auto-rotation; it resumes after idle timeout.
- [ ] Clicking a bird pauses auto-rotation; closing the card resumes it after idle timeout.
- [ ] After any interaction type (drag, zoom, bird click), auto-rotation resumes with the correct speed (1.0) and axis — no permanent stall.
- [ ] Auto-rotation speed is visually consistent regardless of zoom level (speed scales inversely with camera distance).
- [ ] Verified: performing drag → release → wait 5s → auto-rotation resumes. Repeat for zoom and bird-click interactions.

### AC-10: Migration Paths — updated v4
- [ ] At least 3 animated migration path curves are visible on the globe.
- [ ] Curves follow the globe surface closely — peak arc height is 0.05–0.10 units above the surface (not 0.3).
- [ ] Short-distance migrations have lower arcs than long-distance migrations.
- [ ] Curves follow the globe's curvature (no straight chords cutting through the Earth).
- [ ] No curve geometry clips through the Earth sphere at any point.
- [ ] Dash animation flows continuously along each curve.
- [ ] Migration paths are defined in data (not hardcoded geometry).
- [ ] Paths are decorative — no click interaction required.
