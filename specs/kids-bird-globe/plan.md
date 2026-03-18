# 万羽拾音 (Kids Bird Globe) — Implementation Plan (v4)

> **v4 changelog**: Atmosphere component removed and replaced with rim-glow shader on globe material (BUG-9). Bird markers redesigned from golden MeshPhong spheres to low-poly 3D GLTF bird models with surface-normal orientation and hover glow (R-3). Auto-rotation lifecycle hardened with explicit `start`/`end` event pairing and zoom-interaction tracking (BUG-11). Camera `minDistance` enforced at 1.15 to prevent globe penetration (BUG-13). Migration arc height reduced from 0.15–0.4 to 0.03–0.12 with multi-point great-circle control points (BUG-14).
>
> **v3 changelog**: Bird marker redesign (golden glowing spheres as Earth children), migration path system (CatmullRomCurve3 + dash shader), cloud layer, atmosphere artifact fix, auto-rotation lifecycle fix, bird data reduction to 15 (5 Singapore), new `MigrationPath` type and component.
>
> **Status**: Phases 1–16 (v1 + v2 + v3) are complete. This plan covers Phases 17–21 (v4).

## 1. Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────────────┐
│  Browser Viewport                                             │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  <App />                                               │   │
│  │                                                        │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  <Canvas>  +  <Suspense>                        │   │   │
│  │  │                                                 │   │   │
│  │  │   <Starfield />            — varied-size stars  │   │   │
│  │  │   ██ Atmosphere REMOVED ██  — see Globe rim glow│   │   │
│  │  │   <EarthGroup>             — shared parent ★    │   │   │
│  │  │   │  <Globe />             — earth + rim glow ★ │   │   │
│  │  │   │  <CloudLayer />        — semi-transparent   │   │   │
│  │  │   │  <BirdMarker /> × 15   — 3D GLTF models ★  │   │   │
│  │  │   │  <MigrationPaths />    — low-arc curves ★   │   │   │
│  │  │   </EarthGroup>                                 │   │   │
│  │  │   <CameraController />     — zoom + auto-rotate │   │   │
│  │  │   <OrbitControls />        — minDistance=1.15 ★ │   │   │
│  │  │                                                 │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  ┌─────────────────┐  ┌──────────────┐                │   │
│  │  │<BirdInfoCard /> │  │<LangToggle />│                │   │
│  │  │ (2D overlay)    │  │(top corner)  │                │   │
│  │  └─────────────────┘  └──────────────┘                │   │
│  │                                                        │   │
│  │  <AudioPlayer />   (hidden, manages playback)          │   │
│  │  <LoadingScreen />  (tied to globeReady + modelsReady) │   │
│  │  <AppTitle />       (top-left branding)                │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Key architectural changes (★ = v4)**:
- **Atmosphere removed**: The standalone `<Atmosphere />` component (BackSide sphere at scale 1.06 with Fresnel shader) is deleted. Atmospheric glow is now a rim-light effect integrated into the `<Globe />` material's fragment shader. No separate mesh.
- **Bird markers as 3D models**: `<BirdMarker />` now loads a shared low-poly GLTF bird model via `useGLTF` (from `@react-three/drei`) and instances it for each bird. Models are oriented outward from the globe surface.
- **Camera constraints**: `<OrbitControls minDistance={1.15} />` prevents the camera from penetrating the globe. `CameraController` clamps zoom-to-bird target distance to this minimum.
- **Migration arcs lowered**: `<MigrationPaths />` uses multi-point great-circle control points with peak heights of 0.03–0.12 instead of the previous 0.15–0.4.

### Rendering Layers

Same two layers as v1/v2/v3:

1. **3D layer** — R3F `<Canvas>` filling the viewport. The `EarthGroup` contains the globe (with integrated rim glow), clouds, bird model markers, and migration curves. `Starfield`, `CameraController`, and `OrbitControls` remain as scene-level siblings.
2. **2D overlay layer** — React DOM elements positioned over the canvas.

### State Management

Zustand store — extended for v4:

```
selectedBirdId: string | null     — which bird's card is open
language: "zh" | "en"             — current UI language
audioStatus: "idle" | "loading" | "playing" | "error"
globeReady: boolean               — true when Earth texture has loaded
modelsReady: boolean              — NEW v4: true when bird GLTF model has loaded
```

New field: `modelsReady` tracks whether the shared bird model GLTF has finished loading. The `<LoadingScreen />` waits for both `globeReady && modelsReady` before dismissing. Auto-rotation state remains local to `CameraController` via refs.

### Interaction Flow: Click → Fly Camera + Card + Audio

Unchanged from v3. When a user clicks a bird marker:

1. **BirdMarker `onClick`** → calls `setSelectedBird(bird.id)` in Zustand.
2. **CameraController** (subscribes to `selectedBirdId`) → computes target camera position from bird's lat/lng, begins frame-based lerp animation to zoom in. Target distance is clamped to `max(ZOOM_DISTANCE, MIN_DISTANCE)`.
3. **BirdInfoCard** (subscribes to `selectedBirdId`) → slides in with bird data.
4. **AudioPlayer** (subscribes to `selectedBirdId`) → fetches and plays audio.
5. **CameraController** → disables `autoRotate` during bird selection.

On card close (`setSelectedBird(null)`):
1. CameraController lerps camera back to default distance.
2. AudioPlayer stops playback.
3. CameraController records `lastInteractionRef.current = Date.now()`. After 5s idle, re-enables `autoRotate`.

## 2. Components

### Unchanged from v3
- **`<App />`** — Root component.
- **`<LangToggle />`** — Language toggle button.
- **`<Starfield />`** — Varied-size star particles.
- **`<BirdInfoCard />`** — Springy card transitions.
- **`<CloudLayer />`** — Semi-transparent cloud sphere at radius 1.005.

### Removed Components

#### ~~`<Atmosphere />`~~ — REMOVED (v4, BUG-9)

**Previous state**: Sphere at scale `[1.06, 1.06, 1.06]` with BackSide Fresnel shader, AdditiveBlending.

**Why removed**: Despite v3 tuning (scale 1.12 → 1.06, exponent 3.0 → 2.5, opacity 0.6 → 0.4), the BackSide sphere approach still produces a visible blue ring artifact at certain camera angles and zoom levels. The fundamental issue is that a separate BackSide-rendered sphere creates a hard geometric edge that no amount of Fresnel tuning can fully eliminate.

**Replacement**: The atmospheric glow is now integrated into `<Globe />`'s material as a view-dependent rim-light effect. See section 2.1 below.

**File action**: Delete `src/components/three/Atmosphere.tsx`. Remove the `<Atmosphere />` import and JSX from `GlobeScene.tsx`.

### Modified Components

#### 2.1 `<Globe />` — modified (BUG-9, R-1 atmosphere redesign)

**Current state**: Single `<mesh>` with `sphereGeometry(1, 64, 64)` + `meshStandardMaterial` with Earth texture.

**Changes (v4)**:
- **Rim-glow atmosphere**: Replace `meshStandardMaterial` with a `shaderMaterial` (or `onBeforeCompile` injection on `MeshStandardMaterial`) that adds a view-dependent rim glow to the globe's own fragment shader. The glow is computed as:
  - `rimIntensity = pow(1.0 - abs(dot(worldNormal, viewDirection)), exponent)` where `exponent` is 4.0–6.0.
  - The rim color is a soft blue-white (`vec3(0.4, 0.6, 1.0)`) blended additively with the base Earth texture color.
  - Rim opacity is low (0.15–0.25) so it produces a subtle halo at the globe edge without dominating the texture.
- **Approach**: Use `MeshStandardMaterial.onBeforeCompile` to inject the rim-glow logic into the existing standard material. This preserves PBR lighting on the Earth texture while adding the glow. The injection appends to the fragment shader's `#include <output_fragment>` section.
- **Fallback**: If the `onBeforeCompile` approach produces visual issues, fall back to a standalone `ShaderMaterial` that combines the Earth texture with rim glow manually. If neither approach is artifact-free, remove the glow entirely (the cloud layer and directional lighting provide sufficient visual depth).
- **No separate geometry**: The glow is rendered on the globe mesh itself. No BackSide sphere, no additional draw call.

#### 2.2 `<BirdMarker />` — rewritten (R-3, BUG-10)

**Current state**: Small `sphereGeometry(0.015)` with `MeshPhongMaterial(color: 0xFFD700, emissive: 0x444444)`. Pulse animation via scale modulation.

**Complete rewrite (v4)**:
- **Remove**: The `sphereGeometry` + `MeshPhongMaterial` golden sphere approach.
- **New visual**: Load a shared low-poly 3D bird model (GLTF/GLB format) using `useGLTF` from `@react-three/drei`.
  - **Model source**: A single generic bird model (e.g., a stylized songbird) stored at `public/models/bird.glb`. File size target: <50 KB.
  - **Instancing**: Call `useGLTF` once at the top level (in `GlobeScene` or a shared context). Each `<BirdMarker />` receives the loaded geometry and creates a `<mesh>` clone with its own material instance.
  - **Material**: `MeshStandardMaterial` with `color: 0xFFB347` (warm amber), `emissive: 0x332200`, `emissiveIntensity: 0.5`, `metalness: 0.2`, `roughness: 0.6`. This produces a warm, subtly glowing bird visible against both land and ocean.
- **Scale**: `[0.03, 0.03, 0.03]` — small but clearly visible and tappable.
- **Orientation**: Each bird model must face outward from the globe surface. Compute the surface normal at the bird's lat/lng position (which is simply the normalized position vector from `latLngToVector3`). Use a quaternion to rotate the model so its local "up" axis aligns with this surface normal:
  - `const up = new Vector3(0, 1, 0);`
  - `const normal = new Vector3(...position).normalize();`
  - `quaternion.setFromUnitVectors(up, normal);`
  - Apply this quaternion to the mesh.
- **Idle animation**: Gentle bob along the surface normal direction. In `useFrame`, offset the mesh position along the normal by `0.005 * Math.sin(clock.elapsedTime * Math.PI + phaseOffset)`. This makes the bird float slightly above its anchor point with a slow oscillation.
- **Hover interaction**: On `pointerOver`:
  - Lerp scale to `1.4×` over ~200ms (use a ref + `useFrame` lerp, not a spring library).
  - Increase `emissiveIntensity` to `1.5` for a visible glow.
  - On `pointerOut`: lerp back to `1.0×` scale and `0.5` emissive intensity.
- **Click**: Same as before — `setSelectedBird(bird.id)`.
- **Fallback**: Wrap the GLTF loading in an error boundary or try/catch. If `useGLTF` fails, render the v3 golden sphere (`sphereGeometry(0.015)` + `MeshPhongMaterial(color: 0xFFD700, emissive: 0x444444)`) with the pulse animation as a graceful degradation.
- **Preloading**: Call `useGLTF.preload('/models/bird.glb')` at module level to start loading immediately. Set `modelsReady = true` in the store once the model is available.

#### 2.3 `<CameraController />` — modified (BUG-11, BUG-13, R-11)

**Current state**: Listens for OrbitControls `start` and `end` events. On `start`: disables `autoRotate`. On `end`: records `lastInteractionRef`. In `useFrame`: re-enables `autoRotate` after 5s idle with distance-scaled speed.

**Changes (v4)**:

**BUG-11 — Auto-rotation recovery hardening**:
The current implementation has the correct `start`/`end` event structure but the auto-rotation recovery can still fail in edge cases:
- **Zoom interaction tracking**: The OrbitControls `start`/`end` events fire for drag but may not fire for scroll-wheel zoom on all browsers. Add explicit `wheel` and `touchmove` event listeners on the canvas DOM element that record `lastInteractionRef.current = Date.now()` and set `autoRotate = false`. This ensures zoom interactions are always tracked.
- **Explicit speed reset**: When the idle timeout fires and re-enables auto-rotation, always explicitly set `autoRotateSpeed = baseSpeed * (DEFAULT_DISTANCE / camera.position.length())`. The current code does this, but ensure it runs on every frame while auto-rotating (not just on the transition frame) so the speed stays correct as the camera drifts.
- **Bird deselect interaction recording**: When `selectedBirdId` transitions from non-null to null (card close), record `lastInteractionRef.current = Date.now()` to restart the idle timer. The current code does this via the zoom-back animation, but add an explicit timestamp update at the moment of deselection.

**BUG-13 — Camera zoom-through prevention**:
- **OrbitControls config**: Change `minDistance` from `1.5` to `1.15` in `GlobeScene.tsx` where `<OrbitControls>` is rendered. This is the primary enforcement — OrbitControls natively clamps the camera distance.
- **Zoom-to-bird clamping**: In the camera animation logic, clamp the target distance: `const targetDist = Math.max(ZOOM_DISTANCE, MIN_CAMERA_DISTANCE)` where `MIN_CAMERA_DISTANCE = 1.15`. Currently `ZOOM_DISTANCE = 1.8` which is already above 1.15, but this guard protects against future changes.
- **Constants**: Define `MIN_CAMERA_DISTANCE = 1.15` as a named constant alongside `DEFAULT_DISTANCE = 2.5` and `ZOOM_DISTANCE = 1.8`.

#### 2.4 `<MigrationPaths />` — modified (BUG-14, R-12)

**Current state**: Uses `buildMigrationCurve()` which creates a 3-point `CatmullRomCurve3` with arc height clamped to [0.15, 0.4].

**Changes (v4)**:
- The component itself (`MigrationPaths.tsx`) requires no structural changes — it already iterates over migration routes and renders `<line>` elements with the dash shader. The change is in the `buildMigrationCurve()` utility it calls.
- Update the import if the utility signature changes (it will gain a new return type field but the points array is the same).

#### 2.5 `<GlobeScene />` — modified (BUG-9, BUG-13)

**Current state**: Renders `<Atmosphere />` outside the earth group, `<OrbitControls minDistance={1.5}>`.

**Changes (v4)**:
- **Remove `<Atmosphere />`**: Delete the import and JSX for `<Atmosphere />`. The rim glow is now part of `<Globe />`.
- **Update OrbitControls**: Change `minDistance={1.5}` to `minDistance={1.15}`.
- **Bird model preload**: Add `useGLTF.preload('/models/bird.glb')` call and track `modelsReady` state.
- **Loading gate**: Update `<LoadingScreen />` condition to wait for both `globeReady && modelsReady`.

#### 2.6 `<LoadingScreen />` — modified (R-9)

**Current state**: Waits for `globeReady` from the Zustand store.

**Changes (v4)**:
- Also wait for `modelsReady` before dismissing. The loading screen remains visible until both the Earth texture and the bird GLTF model have loaded.

### No New Components

All v4 changes are modifications to existing components or deletion of `Atmosphere.tsx`. No new component files are created.

## 3. Data Structures

### 3.1 Bird Entry (`Bird` type) — unchanged from v3

```typescript
interface Bird {
  id: string;
  nameZh: string;
  pinyin: string;
  nameEn: string;
  scientificName: string;
  lat: number;
  lng: number;
  funFactZh: string;
  funFactEn: string;
  photoUrl: string;
  xenoCantoQuery: string;
  silhouette: string;
  region: string;
  audioUrl?: string;
}
```

### 3.2 Migration Route — unchanged from v3

```typescript
interface MigrationRoute {
  id: string;
  from: string;
  to: string;
  nameZh?: string;
  nameEn?: string;
}
```

### 3.3 App Store (`useAppStore`) — extended

```typescript
interface AppStore {
  selectedBirdId: string | null;
  language: "zh" | "en";
  audioStatus: "idle" | "loading" | "playing" | "error";
  globeReady: boolean;
  modelsReady: boolean;    // NEW v4
  // ... actions
}
```

### 3.4 Coordinate Conversion — unchanged

```typescript
function latLngToVector3(lat: number, lng: number, radius: number): [number, number, number]
```

### 3.5 Camera Constants — updated

```typescript
const DEFAULT_DISTANCE = 2.5;
const ZOOM_DISTANCE = 1.8;
const MIN_CAMERA_DISTANCE = 1.15;   // NEW v4: globe radius (1.0) + 0.15 buffer
const MAX_CAMERA_DISTANCE = 5.0;
const IDLE_TIMEOUT = 5000;           // ms
const BASE_AUTO_ROTATE_SPEED = 1.0;
```

### 3.6 Migration Curve Utility — updated signature

```typescript
function buildMigrationCurve(
  fromLatLng: [number, number],
  toLatLng: [number, number],
  globeRadius: number,
  segments?: number,          // default 64
): Vector3[]
```

Internal changes only (arc height formula and control point count). The return type remains `Vector3[]`.

## 4. Technical Decisions

### Retained from v3
- TD-1: Zustand over React Context
- TD-3: xeno-canto Fetched at Runtime
- TD-4: Single JSON File (two: `birds.json` + `migrations.json`)
- TD-5: Tailwind CSS for 2D UI
- TD-6: Vite over Next.js / CRA
- TD-7: Earth Texture Resolution
- TD-9: Frame-based Lerp over Tween Libraries
- TD-12: Dynamic Silhouette Import via Vite Glob
- TD-13: Real Photos via Wikimedia Commons
- TD-16: Earth Group Pattern for Co-Rotation
- TD-17: CatmullRomCurve3 + Custom Dash Shader for Migration Paths
- TD-18: Separate Cloud Mesh over Baked Texture

### Superseded Decisions

#### TD-10/TD-15: ~~Fresnel Shader Atmosphere~~ → TD-20: Rim-Glow on Globe Material
Both the original scale-1.12 approach (TD-10) and the v3 tuned scale-1.06 approach (TD-15) produced blue ring artifacts. The separate BackSide sphere is fundamentally flawed for this use case because it creates a hard geometric boundary. Replaced with a rim-glow effect injected into the globe's own material shader.

#### TD-14: ~~MeshPhong Golden Spheres for Bird Markers~~ → TD-21: GLTF 3D Bird Models
Golden spheres solved BUG-10 (black markers) but don't meet the v4 visual goal of "elegant bird models." Replaced with low-poly GLTF bird models loaded via `useGLTF`.

#### TD-11: ~~OrbitControls `autoRotate` basic~~ → TD-22: Hardened Auto-Rotation Lifecycle
The v3 `start`/`end` event approach was correct in structure but incomplete in coverage (zoom events not tracked, speed not continuously updated). Replaced with a comprehensive lifecycle that covers drag, zoom, and bird-click interactions.

### New Decisions

#### TD-20: Rim-Glow via `onBeforeCompile` on Globe Material
Inject a view-dependent rim-light calculation into the globe's `MeshStandardMaterial` using the `onBeforeCompile` callback. This adds ~10 lines of GLSL to the fragment shader's output section. The glow is computed per-fragment using the dot product of the surface normal and view direction, producing a smooth falloff with no geometric edge.

**Rationale**: No separate geometry means no hard edge, no additional draw call, and no z-fighting. The `onBeforeCompile` approach preserves the standard material's PBR lighting pipeline (important for the Earth texture to look realistic) while adding the glow as a final color adjustment.

**Alternatives considered**:
- Post-processing bloom: Too heavy for a children's app; affects the entire scene not just the globe edge.
- Thin atmosphere shell (scale 1.01–1.03): Still creates a geometric edge, just smaller. Risk of the same artifact at extreme zoom.
- Remove atmosphere entirely: Acceptable fallback, but the rim glow adds significant visual polish at minimal cost.

#### TD-21: Shared GLTF Bird Model via `useGLTF`
Load a single low-poly bird model (`bird.glb`, <50 KB) using `@react-three/drei`'s `useGLTF` hook. Each `<BirdMarker />` clones the geometry and creates its own material instance for independent hover state. The model is preloaded at module level via `useGLTF.preload()`.

**Rationale**: GLTF is the standard 3D format for the web. `useGLTF` handles loading, caching, and Suspense integration automatically. A single shared model keeps the download small. Cloning geometry (not the entire scene) is cheap — Three.js shares the underlying buffer data.

**Alternatives considered**:
- Multiple bird model variants (songbird, raptor, waterbird): More visually diverse but 3× the download and complexity. Deferred to v5.
- Procedural bird geometry (custom `BufferGeometry`): More control but much more code and harder to iterate on visually.
- Sprite-based birds (2D textures on planes): Simpler but doesn't meet the "3D bird models" requirement.

**Orientation approach**: Use `Quaternion.setFromUnitVectors(localUp, surfaceNormal)` where `localUp = (0, 1, 0)` and `surfaceNormal` is the normalized position vector from `latLngToVector3`. This rotates the model so it stands perpendicular to the globe surface at its location.

#### TD-22: Hardened Auto-Rotation with Wheel/Touch Tracking
Extend the v3 `start`/`end` OrbitControls event approach with explicit `wheel` and `touchmove` DOM event listeners on the canvas element. These listeners record `lastInteractionRef.current = Date.now()` and disable `autoRotate`, ensuring that scroll-zoom and pinch-zoom are tracked even if OrbitControls doesn't fire `start`/`end` for them.

**Rationale**: OrbitControls `start`/`end` events reliably fire for pointer drag but their behavior for scroll/pinch zoom varies across browsers and Three.js versions. Adding DOM-level listeners provides a reliable fallback.

**Speed formula**: `autoRotateSpeed = BASE_SPEED * (DEFAULT_DISTANCE / currentDistance)`. Applied on every frame while auto-rotating, not just on the re-enable transition. This ensures consistent perceived surface speed at all zoom levels.

#### TD-23: Camera `minDistance = 1.15` for Globe Penetration Prevention
Set `OrbitControls.minDistance = 1.15` (globe radius 1.0 + 0.15 buffer). The buffer accounts for the cloud layer (radius 1.005), bird markers (radius 1.02), and provides clearance so the camera never clips through any globe-attached geometry.

**Rationale**: The current `minDistance = 1.5` already prevents penetration but is being reduced to 1.15 to allow closer zoom (the spec's zoom-to-bird distance of 1.8 is well above this). The 0.15 buffer is sufficient because OrbitControls enforces the constraint in its internal update loop, which runs before rendering.

**Programmatic clamping**: The `CameraController` zoom-to-bird animation clamps its target distance to `Math.max(targetDistance, MIN_CAMERA_DISTANCE)`. Currently `ZOOM_DISTANCE = 1.8 > 1.15` so this is a safety guard.

#### TD-24: Multi-Point Great-Circle Migration Curves
Replace the 3-point `CatmullRomCurve3` (from → mid → to) with a multi-point curve that follows the great-circle path between the two bird positions. For long-distance routes, generate 3–5 intermediate control points evenly spaced along the great-circle arc, each elevated by `globeRadius + arcHeight` above the surface. This produces curves that hug the globe's curvature rather than cutting straight chords through it.

**Arc height formula (v4)**:
```
angularDistance = fromVec.angleTo(toVec)  // radians
arcHeight = clamp(angularDistance * 0.04, 0.03, 0.12)
```

Compared to v3's `clamp(angularDistance * 0.3, 0.15, 0.4)`, this produces arcs 3–5× closer to the surface.

**Control point count**: `numPoints = max(3, floor(angularDistance / 0.3))`, clamped to [3, 7]. Short routes (same continent) get 3 points; cross-continental routes get 5–7 points for smoother curvature.

**Rationale**: With lower arc heights, a 3-point curve can clip through the globe at the midpoint for long routes (the chord between from and to passes inside the sphere). Adding intermediate points along the great-circle path keeps all control points at radius ≥ `globeRadius + arcHeight`, preventing clipping.

## 5. File Structure — Changes from v3

```
src/
├── components/
│   ├── three/
│   │   ├── GlobeScene.tsx          # MODIFIED: remove Atmosphere, minDistance=1.15, model preload
│   │   ├── Globe.tsx               # MODIFIED: onBeforeCompile rim-glow shader injection
│   │   ├── CloudLayer.tsx          # unchanged
│   │   ├── Starfield.tsx           # unchanged
│   │   ├── BirdMarker.tsx          # REWRITTEN: GLTF model, orientation, hover glow, fallback
│   │   ├── MigrationPaths.tsx      # unchanged (calls updated buildMigrationCurve)
│   │   ├── Atmosphere.tsx          # DELETED
│   │   └── CameraController.tsx    # MODIFIED: wheel/touch listeners, MIN_CAMERA_DISTANCE
│   └── ui/
│       ├── BirdInfoCard.tsx        # unchanged
│       ├── LangToggle.tsx          # unchanged
│       ├── AudioPlayer.tsx         # unchanged
│       └── LoadingScreen.tsx       # MODIFIED: wait for modelsReady
├── types.ts                        # unchanged (Bird, MigrationRoute already defined)
├── store.ts                        # MODIFIED: + modelsReady field
├── hooks/
│   └── useAudio.ts                 # unchanged
├── utils/
│   ├── coordinates.ts              # unchanged
│   ├── xeno-canto.ts              # unchanged
│   ├── camera.ts                   # MODIFIED: + MIN_CAMERA_DISTANCE constant
│   └── migration.ts                # MODIFIED: new arc height formula, multi-point control
├── assets/
│   └── silhouettes/                # retained, not referenced by BirdMarker
├── data/
│   ├── birds.json                  # unchanged
│   ├── migrations.json             # unchanged
│   └── README.md                   # unchanged
└── ...

public/
├── models/
│   └── bird.glb                    # NEW: low-poly bird model (<50 KB)
├── textures/
│   ├── earth.jpg                   # unchanged
│   └── clouds.png                  # unchanged
├── images/
│   └── birds/                      # unchanged (15 photos)
└── ...
```

## 6. Implementation Phases

> Phases 1–16 (v1 + v2 + v3) are complete. The following phases address v4 requirements.

### Phase 17: Auto-Rotation Lifecycle Hardening (BUG-11, R-11)

**Goal**: Ensure auto-rotation correctly resumes after all interaction types.

**Steps**:
1. In `CameraController.tsx`, define `MIN_CAMERA_DISTANCE = 1.15` alongside existing constants.
2. Add `wheel` event listener to the canvas DOM element (via `gl.domElement` from `useThree`):
   - On `wheel`: set `autoRotate = false` on the controls ref, update `lastInteractionRef.current = Date.now()`.
   - Clean up the listener in the `useEffect` return.
3. Add `touchmove` event listener similarly for pinch-zoom tracking on mobile.
4. In the `useFrame` idle-rotation block, ensure `autoRotateSpeed` is recalculated on every frame (not just the re-enable frame): `controls.autoRotateSpeed = BASE_AUTO_ROTATE_SPEED * (DEFAULT_DISTANCE / camera.position.length())`.
5. When `selectedBirdId` transitions from non-null to null, explicitly set `lastInteractionRef.current = Date.now()` before starting the zoom-back animation.
6. **Verify**: 
   - Drag globe → release → wait 5s → auto-rotation resumes at correct speed.
   - Scroll-zoom → stop → wait 5s → auto-rotation resumes.
   - Click bird → close card → wait 5s → auto-rotation resumes.
   - Zoom in close → auto-rotation speed appears the same as when zoomed out.

### Phase 18: Camera Zoom Constraint (BUG-13, R-1, R-8)

**Goal**: Prevent the camera from penetrating the globe.

**Steps**:
1. In `GlobeScene.tsx`, change `<OrbitControls minDistance={1.5}>` to `<OrbitControls minDistance={1.15}>`.
2. In `CameraController.tsx`, clamp the zoom-to-bird target distance: where the target position is computed, ensure `const targetDist = Math.max(ZOOM_DISTANCE, MIN_CAMERA_DISTANCE)`. Currently `ZOOM_DISTANCE = 1.8 > 1.15` so this is a safety guard.
3. In `camera.ts` (or wherever `computeCameraTarget` is defined), add `MIN_CAMERA_DISTANCE` as an exported constant.
4. **Verify**:
   - Scroll-zoom as far in as possible → camera stops at ~1.15 distance, globe surface is not penetrated.
   - Pinch-zoom on mobile → same constraint holds.
   - Click bird → zoom-to-bird animation → camera stops at 1.8 (above 1.15).
   - No visual glitches (inverted normals, disappearing textures) at maximum zoom.

### Phase 19: Atmosphere Redesign (BUG-9, R-1, R-9)

**Goal**: Remove the blue ring artifact and replace with a clean rim glow.

**Steps**:
1. **Delete** `src/components/three/Atmosphere.tsx`.
2. In `GlobeScene.tsx`, remove the `<Atmosphere />` import and JSX element.
3. In `Globe.tsx`, modify the Earth mesh material to use `onBeforeCompile`:
   - Create the `MeshStandardMaterial` with the Earth texture as before.
   - Add an `onBeforeCompile` callback that injects rim-glow GLSL:
     - In the fragment shader, after `#include <output_fragment>`, add:
       ```glsl
       vec3 viewDir = normalize(vViewPosition);
       vec3 worldNorm = normalize(vNormal);
       float rim = pow(1.0 - abs(dot(worldNorm, viewDir)), 5.0);
       gl_FragColor.rgb += vec3(0.4, 0.6, 1.0) * rim * 0.2;
       ```
     - This adds a faint blue-white glow at the globe edges that fades smoothly toward the center.
   - Set `material.needsUpdate = true` after modifying the shader.
4. **Tune**: Adjust the exponent (4.0–6.0) and intensity multiplier (0.15–0.25) until the glow is subtle and artifact-free.
5. **Verify**:
   - No blue ring or hard-edged band at any zoom level (1.15 to 5.0).
   - Subtle atmospheric glow visible at the globe edge when viewed from default distance.
   - Glow fades gracefully — no abrupt transitions.
   - If the glow still produces artifacts, reduce intensity to 0 (effectively removing it) and rely on cloud layer + lighting.

### Phase 20: Bird Marker 3D Models (R-3, BUG-10)

**Goal**: Replace golden sphere markers with 3D bird models.

**Steps**:
1. **Source a bird model**: Find or create a low-poly stylized bird model in GLB format. Options:
   - [Kenney's Nature Kit](https://kenney.nl/assets/nature-kit) (CC0, includes bird models).
   - [Quaternius low-poly animals](https://quaternius.com/packs/ultimateanimatedanimals.html) (CC0).
   - Create a simple bird in Blender (~200 triangles) and export as GLB.
   - Target: <50 KB file size, single mesh, no animations baked in.
2. Save the model to `public/models/bird.glb`.
3. Add `useGLTF.preload('/models/bird.glb')` at the top of `BirdMarker.tsx` (module level).
4. Rewrite `BirdMarker.tsx`:
   - Call `useGLTF('/models/bird.glb')` to get the loaded scene.
   - Extract the first mesh's geometry from the GLTF scene: `const geometry = (gltf.scene.children[0] as THREE.Mesh).geometry`.
   - Create a `MeshStandardMaterial` per marker instance: `color: 0xFFB347`, `emissive: 0x332200`, `emissiveIntensity: 0.5`, `metalness: 0.2`, `roughness: 0.6`.
   - Position using `latLngToVector3(bird.lat, bird.lng, 1.02)`.
   - Compute orientation quaternion: `new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(...position).normalize())`.
   - Apply scale `[0.03, 0.03, 0.03]`.
   - Idle animation: in `useFrame`, offset position along the surface normal by `0.005 * Math.sin(clock.elapsedTime * Math.PI + phaseOffset)`.
   - Hover: lerp scale to 1.4× and `emissiveIntensity` to 1.5 on `pointerOver`; lerp back on `pointerOut`.
   - Click: `setSelectedBird(bird.id)`.
5. Add fallback: wrap the GLTF-dependent rendering in a check (`if (!gltf) { render golden sphere fallback }`). The golden sphere fallback uses the v3 `sphereGeometry(0.015)` + `MeshPhongMaterial(color: 0xFFD700, emissive: 0x444444)`.
6. In `store.ts`, add `modelsReady: boolean` field (default `false`) and a `setModelsReady` action.
7. In `GlobeScene.tsx` or `BirdMarker.tsx`, set `setModelsReady(true)` once `useGLTF` has loaded the model.
8. In `LoadingScreen.tsx`, update the dismiss condition to `globeReady && modelsReady`.
9. **Verify**:
   - 15 bird models visible on the globe, oriented outward from the surface.
   - Models are warm-toned and visible against both land and ocean.
   - Hover produces a smooth scale-up and glow.
   - Models rotate with the globe (children of earth group).
   - Loading screen waits for model load.
   - If `bird.glb` is deleted/unreachable, golden sphere fallback renders instead.

### Phase 21: Migration Arc Height Reduction (BUG-14, R-12)

**Goal**: Make migration paths follow the globe surface more closely.

**Steps**:
1. In `src/utils/migration.ts`, rewrite `buildMigrationCurve()`:
   - **New arc height formula**: `arcHeight = clamp(angularDistance * 0.04, 0.03, 0.12)` (was `clamp(angularDistance * 0.3, 0.15, 0.4)`).
   - **Multi-point control**: Compute `numPoints = max(3, floor(angularDistance / 0.3))`, clamped to [3, 7].
   - For each intermediate point (evenly spaced along the great-circle arc between `from` and `to`):
     - Use spherical linear interpolation (`Vector3.lerpVectors` + normalize) to find the point on the great circle.
     - Scale to `globeRadius + arcHeight` to elevate above the surface.
   - Create `CatmullRomCurve3(controlPoints)` with the full array of control points.
   - Sample 64 points as before.
2. The `MigrationPaths.tsx` component requires no changes — it already calls `buildMigrationCurve()` and renders the returned points.
3. **Verify**:
   - Migration arcs hug the globe surface (peak height ~0.05–0.10 above surface).
   - Short-distance arcs (same continent) are lower than cross-continental arcs.
   - No curve clips through the Earth sphere at any point.
   - Curves follow the globe's curvature (no straight chords visible).
   - Dash animation still flows smoothly along the curves.

### Phase 22: Final Verification

- Run `npx tsc --noEmit` — zero errors.
- Run `npm run build` — production build succeeds.
- Visual verification:
  - Globe renders with subtle rim glow, no blue ring artifact at any zoom level.
  - Cloud layer visible, drifts slowly.
  - 15 bird models visible as small 3D birds, oriented outward, warm glow.
  - Hover on bird → scale up + glow. Click → card + zoom + audio.
  - 3+ migration path curves with low arcs following the globe surface.
  - Dash animation flows along curves.
  - Camera cannot zoom through the globe (stops at 1.15).
  - Drag → release → wait 5s → auto-rotation resumes.
  - Scroll-zoom → stop → wait 5s → auto-rotation resumes.
  - Click bird → close card → wait 5s → auto-rotation resumes.
  - Auto-rotation speed consistent at all zoom levels.
  - Language toggle works.
  - Works at 375px, 768px, and 1920px widths.
  - Loading screen waits for both texture and bird model.
- Verify all acceptance criteria: AC-1 through AC-10.
