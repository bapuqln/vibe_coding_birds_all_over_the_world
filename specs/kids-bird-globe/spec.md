# 万羽拾音 (Kids Bird Globe) — Feature Specification (v3)

> **v3 changelog**: New migration-path animations, globe rendering fixes, bird marker redesign (golden glowing points), auto-rotation fix, Singapore-focused bird data, cloud layer.
>
> **v2 changelog**: Bug fixes, visual/interaction improvements, camera zoom-to-bird, richer bird data.

## Goal

Build an interactive 3D globe web application that teaches children (ages 5–12) about birds around the world. Users spin a globe, tap on golden glowing bird points, watch animated migration paths, and hear real bird calls while reading bilingual fun facts. The experience should feel playful, immediate, and educational — every click rewards the child with sound and visual feedback.

## User Stories

### US-1: Explore the Globe
As a child, I can drag to rotate and scroll to zoom a 3D Earth so that I feel like I'm exploring the real world.

### US-2: Discover Birds
As a child, I can see golden glowing anchor points on the globe so that I know where different birds live.

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

### R-1: 3D Globe (React Three Fiber) — updated v3
- Render a textured Earth sphere using a NASA Blue Marble (or equivalent free) texture.
- **Globe geometry**: The Earth sphere must have radius exactly `1.0`. No scaling artifacts.
- **Cloud layer**: Render a separate semi-transparent cloud mesh at radius ~1.005 (slightly above the Earth surface) using a cloud/alpha texture. This must be a distinct mesh from the Earth, not baked into the Earth material.
- **No blue halo artifact**: The `Atmosphere` component must not produce a visible clipping artifact or unnatural blue band. Verify that the atmosphere sphere scale, `BackSide` rendering, and Fresnel parameters produce a clean, subtle glow — not a hard-edged ring. If the current Fresnel shader at scale 1.12 produces artifacts, adjust the scale, exponent, or opacity until the glow is smooth.
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

### R-3: Bird Markers — updated v3
- **Visual style**: Render each bird as a **golden glowing point** on the globe surface, not a teardrop pin.
  - Material: `MeshPhongMaterial` with `color: 0xFFD700` (gold) and `emissive: 0x444444` for a warm glow.
  - Geometry: Small sphere (radius ~0.015) or an emoji-textured sprite (e.g., 🦜).
  - **Pulse animation**: Idle markers should pulse in scale between 1.0× and 1.1× using a sine-wave animation in `useFrame`.
- **Positioning**: Markers must be positioned using `latLngToVector3(lat, lng, 1.02)` and then **added as children of the Earth mesh** (`earth.add(birdMesh)`) so they rotate with the globe. They must NOT be positioned in world space independently.
- Hover state: scale up to 1.3× + brighter emissive.
- Click: select the bird, open the info card, trigger camera zoom, and play audio.

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

### R-8: Camera Zoom-to-Bird
- When a bird marker is clicked, the camera smoothly animates to center on that bird's geographic location.
- The animation should:
  - Rotate the globe so the bird's lat/lng faces the camera.
  - Zoom in to a closer distance (e.g., from default 2.5 to ~1.8).
  - Use eased interpolation (e.g., `THREE.MathUtils.lerp` or a spring) over ~1 second.
  - Not block user interaction — the user can interrupt the animation by dragging.
- When the info card is closed, the camera should smoothly zoom back out to the default distance (but not reset rotation).

### R-9: Visual Polish
- **Loading screen**: Tied to actual asset loading completion (texture loaded), not a fixed timer. Use `Suspense` state or texture `onLoad` callback.
- **Globe atmosphere**: A subtle atmospheric glow (blue halo) around the globe edge — must be artifact-free (see R-1).
- **Starfield depth**: Stars should have slight size variation for depth perception.
- **Card transitions**: Slide-in/out should feel springy and responsive, not linear.

### R-10: Rich Bird Resources
- **Real photographs**: Every bird must have a real photograph (sourced from royalty-free/CC-licensed sources like Unsplash, Pixabay, or Wikimedia Commons). Placeholder 1×1 JPEGs are not acceptable.
- **Photo quality**: Images should be at least 400×300px, optimized to <80 KB each, in JPEG or WebP format.
- **Data documentation**: Include a `src/data/README.md` explaining the data schema, how to add a new bird, and attribution/licensing for photos and audio.

### R-11: Auto-Rotation — updated v3
- Use `OrbitControls.autoRotate = true` with `autoRotateSpeed = 1.0` for idle rotation.
- **On user drag (mousedown/touchstart)**: Pause auto-rotation by setting `autoRotate = false`.
- **On user release (mouseup/touchend)**: Resume auto-rotation by setting `autoRotate = true` and resetting `autoRotateSpeed = 1.0`.
- **On bird select**: Pause auto-rotation.
- **On bird deselect (card close)**: Resume auto-rotation after a short delay.
- **Bug to fix**: Currently, dragging permanently stops auto-rotation because the `start` event handler sets `autoRotate = false` but nothing re-enables it after the drag ends. The fix must listen for the OrbitControls `end` event (or `mouseup`/`touchend`) to resume rotation.
- **Bug to fix**: When zoomed in close to the globe, auto-rotation speed should remain consistent (not appear to speed up due to proximity). Consider scaling `autoRotateSpeed` inversely with camera distance if needed.

### R-12: Migration Paths *(new v3)*
- Render animated curved lines between pairs of birds to visualize migration routes.
- **Curve geometry**: Use `THREE.CatmullRomCurve3` to create smooth arcs between two bird positions on the globe. The curve should arc outward from the globe surface (peak height ~0.3 above the surface) so it's visible and doesn't clip through the Earth.
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

## Known Bugs to Fix (v3)

These bugs exist in the current v2 implementation and must be resolved:

### BUG-9: Blue background halo / atmosphere artifact *(new v3)*
The `Atmosphere` component renders a sphere at scale 1.12 with `BackSide` + Fresnel shader. This produces a visible hard-edged blue ring or clipping artifact instead of a smooth atmospheric glow. Possible causes:
- Atmosphere sphere scale too large relative to globe radius 1.0.
- Fresnel exponent or opacity too aggressive.
- `BackSide` rendering interacting poorly with the camera near-plane.
**Fix**: Adjust the atmosphere sphere scale (try 1.04–1.08), tune the Fresnel exponent (try 2.0–4.0), and reduce opacity. Alternatively, consider a cloud mesh as a separate layer to break up the hard edge. Verify no artifact at all zoom levels.

### BUG-10: Black anchor points / bird markers not glowing *(new v3)*
Bird markers currently use `meshBasicMaterial` with a `CanvasTexture` (teardrop pin). The user reports they appear as "black anchor points" — likely because the texture fails to load or the material doesn't receive light.
**Fix**: Replace the entire marker visual with a `MeshPhongMaterial` golden sphere (`color: 0xFFD700`, `emissive: 0x444444`) that glows and pulses. Alternatively, use an emoji texture (🦜) on a sprite. The key requirement is that markers must be **visibly golden and glowing**, not black or invisible.

### BUG-11: Drag permanently stops auto-rotation *(new v3)*
The `CameraController` listens for OrbitControls `start` event and sets `autoRotate = false`, but never re-enables it after the drag ends. Once the user drags, auto-rotation never resumes (even after the 5-second idle timeout, because the `start` handler also resets `lastInteractionRef`).
**Fix**: Listen for the OrbitControls `end` event. On `end`, record the interaction time but do NOT disable auto-rotation permanently. Let the idle-timeout logic in `useFrame` re-enable auto-rotation after 5 seconds of no interaction. Also fix: when zoomed in, auto-rotation can appear too fast — consider capping or scaling `autoRotateSpeed`.

### BUG-12: Birds don't follow globe rotation *(new v3)*
Bird markers are positioned in world space as siblings of the globe mesh. When the globe rotates (via auto-rotation or user drag), the markers stay fixed in space and don't rotate with the Earth.
**Fix**: Bird meshes must be added as **children** of the Earth mesh group (`earth.add(birdMesh)`) so they inherit the globe's rotation transform. Alternatively, use a shared parent `<group>` that both the globe and markers belong to, and rotate that group. The `latLngToVector3` positions are correct — they just need to be in the globe's local coordinate space, not world space.

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

### AC-1: Globe Interaction
- [ ] Globe renders within 3 seconds on a mid-range laptop.
- [ ] Earth sphere has radius exactly 1.0 with no scaling artifacts.
- [ ] Cloud layer is visible as a separate semi-transparent mesh above the Earth surface.
- [ ] No blue halo artifact — atmosphere glow is smooth and subtle at all zoom levels.
- [ ] Drag-to-rotate works with mouse and touch.
- [ ] Scroll/pinch-to-zoom works and is clamped to reasonable min/max distances.
- [ ] Starfield background is visible behind the globe with varied star sizes.

### AC-2: Bird Markers
- [ ] 15 bird markers are visible on the globe as golden glowing points.
- [ ] Markers are positioned at geographically correct locations.
- [ ] Markers rotate with the globe (they are children of the globe mesh, not world-space objects).
- [ ] Markers have a visible pulse animation (scale 1.0 → 1.1).
- [ ] Hovering a marker shows a scale/glow effect.
- [ ] No markers appear as black dots or invisible — all are golden and glowing.

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

### AC-9: Auto-Rotation *(new v3)*
- [ ] Globe auto-rotates when idle (no user interaction for >5 seconds, no bird selected).
- [ ] Dragging the globe pauses auto-rotation; releasing resumes it after idle timeout.
- [ ] Auto-rotation speed is consistent regardless of zoom level.
- [ ] Selecting a bird pauses auto-rotation; closing the card eventually resumes it.

### AC-10: Migration Paths *(new v3)*
- [ ] At least 3 animated migration path curves are visible on the globe.
- [ ] Curves arc smoothly above the globe surface (no clipping through the Earth).
- [ ] Dash animation flows continuously along each curve.
- [ ] Migration paths are defined in data (not hardcoded geometry).
- [ ] Paths are decorative — no click interaction required.
