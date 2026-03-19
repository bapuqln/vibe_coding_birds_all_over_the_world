# 万羽拾音 (Kids Bird Globe) — Feature Specification (v5)

> **v5 changelog**: Higher-quality bird models (replace low-poly generated GLB with elegant stylized GLTF), great-circle migration arcs with distance-scaled height, OrbitControls target locked to [0,0,0] (fix rotation pivot drift on bird click), country/continent borders via GeoJSON overlay, zoom-dependent map labels (continent names, ocean names), improved lighting (hemisphere light + soft fill), improved atmosphere glow (Fresnel shell with tuned falloff), improved materials throughout, declarative R3F patterns enforced.
>
> **v4 changelog**: Auto-rotation resume fix after user interaction, camera zoom-through-globe prevention, atmosphere visual overhaul (remove blue ring artifact, replace with realistic atmospheric glow), migration arc height reduction for natural surface-following paths, bird markers redesigned from golden dots to small 3D bird models with outward orientation and hover glow.
>
> **v3 changelog**: New migration-path animations, globe rendering fixes, bird marker redesign (golden glowing points), auto-rotation fix, Singapore-focused bird data, cloud layer.
>
> **v2 changelog**: Bug fixes, visual/interaction improvements, camera zoom-to-bird, richer bird data.

## Goal

Build an interactive 3D globe web application that teaches children (ages 5–12) about birds around the world. Users spin a clean, realistic globe with visible country borders and continent labels, tap on elegant 3D bird models perched on the surface, watch natural great-circle migration arcs flowing between continents, and hear real bird calls while reading bilingual fun facts. The experience should feel polished, immediate, and educational — every click rewards the child with sound and visual feedback. The globe should auto-rotate smoothly and recover gracefully from all user interactions. Visual elegance is prioritized over technical complexity.

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

### US-9: See the World Map *(new v5)*
As a child, when I zoom in I can see country borders and continent names appear on the globe, helping me learn geography alongside bird habitats.

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
- **Country borders — new v5**: Render lightweight country/continent boundary lines on the globe surface using simplified GeoJSON data. Lines should be thin, semi-transparent (white or light gray, opacity 0.3–0.5), and rendered as `<Line>` elements from `@react-three/drei` or as `BufferGeometry` line segments projected onto the globe sphere at radius `1.001` (just above the surface). Use a simplified/low-resolution GeoJSON (~50 KB) to keep performance acceptable.
- **Map labels — new v5**: Display continent names and major ocean names as text labels on the globe. Labels should:
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
- **New v5**: Use `@react-three/drei` helpers wherever possible — `<Html>`, `<Text>`, `<Line>`, `<OrbitControls>`, `useGLTF`, `useTexture`, `<Points>`, `<PointMaterial>`.
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

### R-13: Map Overlays — new v5
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

## Non-goals

- **Seasonal migration routes** — no animated flight paths between habitats beyond the defined routes.
- **Continent-based filtering** — no filter/search UI.
- **User accounts or progress tracking**.
- **Offline support / PWA**.
- **Server-side rendering**.
- **CMS or admin panel**.
- **Deployment pipeline**.
- **Click interaction on migration paths**.
- **Click interaction on country borders or labels**.
- **High-resolution GeoJSON** — use simplified/low-res data only.

## Known Bugs to Fix (v5)

### BUG-15: OrbitControls target drifts on bird click *(new v5)*
The `CameraController` lerps `controls.target` toward the bird's position when zooming to a bird. This moves the rotation pivot away from the globe center, causing erratic rotation behavior after the bird card is closed.
**Fix**: Never modify `controls.target`. Keep it locked at `[0, 0, 0]`. When zooming to a bird, only animate the camera position (direction + distance). The camera orbits around the origin at all times.

### BUG-16: Bird model quality too low *(new v5)*
The current `bird.glb` was generated programmatically with basic Three.js geometries (sphere body, cone beak, box wings). It looks crude and unrecognizable at the small scale used on the globe.
**Fix**: Replace with a higher-quality stylized bird model from a free asset library, or create a proper model with smooth geometry and recognizable bird silhouette. See R-3.

### BUG-17: useGLTF inside try-catch violates React hooks rules *(new v5)*
The current `BirdMarker.tsx` wraps `useGLTF()` in a try-catch block. React hooks must be called unconditionally — wrapping in try-catch can cause inconsistent hook call order.
**Fix**: Use React `<Suspense>` boundary with an `<ErrorBoundary>` for fallback handling instead of try-catch around hooks. Or use a loading state pattern with `useGLTF` called unconditionally.

### Previously fixed bugs
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

### AC-11: Map Overlays — new v5
- [ ] Country/continent borders visible as thin semi-transparent lines on globe.
- [ ] Borders do not interfere with bird marker interactions.
- [ ] Continent labels appear when zoomed in (camera distance < 2.0).
- [ ] Ocean labels appear when zoomed in.
- [ ] Labels fade in/out smoothly based on zoom level.
- [ ] Labels switch language with the language toggle.
- [ ] Labels are readable but subtle — they don't dominate the visual.
