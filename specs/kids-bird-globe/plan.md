# 万羽拾音 (Kids Bird Globe) — Implementation Plan (v3)

> **v3 changelog**: Bird marker redesign (golden glowing spheres as Earth children), migration path system (CatmullRomCurve3 + dash shader), cloud layer, atmosphere artifact fix, auto-rotation lifecycle fix, bird data reduction to 15 (5 Singapore), new `MigrationPath` type and component.
>
> **Status**: Phases 1–10 (v1 + v2) are complete. This plan covers Phases 11–16 (v3).

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
│  │  │   <Atmosphere />           — tuned Fresnel glow │   │   │
│  │  │   <EarthGroup>             — shared parent ★    │   │   │
│  │  │   │  <Globe />             — earth + clouds     │   │   │
│  │  │   │  <BirdMarker /> × 15   — golden spheres ★   │   │   │
│  │  │   │  <MigrationPaths />    — dash curves ★      │   │   │
│  │  │   </EarthGroup>                                 │   │   │
│  │  │   <CameraController />     — zoom + auto-rotate │   │   │
│  │  │   <OrbitControls />        — user camera input  │   │   │
│  │  │                                                 │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  ┌─────────────────┐  ┌──────────────┐                │   │
│  │  │<BirdInfoCard /> │  │<LangToggle />│                │   │
│  │  │ (2D overlay)    │  │(top corner)  │                │   │
│  │  └─────────────────┘  └──────────────┘                │   │
│  │                                                        │   │
│  │  <AudioPlayer />   (hidden, manages playback)          │   │
│  │  <LoadingScreen />  (tied to globeReady)               │   │
│  │  <AppTitle />       (top-left branding)                │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Key architectural change (★)**: The globe mesh, bird markers, and migration paths now share a common parent `<group>` (`EarthGroup`). This is implemented inside `GlobeScene` as a `<group ref={earthGroupRef}>` that wraps `<Globe />`, all `<BirdMarker />`s, and `<MigrationPaths />`. OrbitControls rotates the camera around this group, so all children rotate together. This fixes BUG-12 (birds not following globe rotation).

### Rendering Layers

Same two layers as v1/v2:

1. **3D layer** — R3F `<Canvas>` filling the viewport. The `EarthGroup` contains the globe, clouds, markers, and migration curves. `Atmosphere`, `Starfield`, `CameraController`, and `OrbitControls` remain as scene-level siblings.
2. **2D overlay layer** — React DOM elements positioned over the canvas.

### State Management

Zustand store — unchanged from v2:

```
selectedBirdId: string | null     — which bird's card is open
language: "zh" | "en"             — current UI language
audioStatus: "idle" | "loading" | "playing" | "error"
globeReady: boolean               — true when Earth texture has loaded
```

No new Zustand fields needed for v3. Migration paths are purely visual (no selection state). Auto-rotation state remains local to `CameraController` via refs.

### Interaction Flow: Click → Fly Camera + Card + Audio

When a user clicks a bird marker, the following sequence occurs:

1. **BirdMarker `onClick`** → calls `setSelectedBird(bird.id)` in Zustand.
2. **CameraController** (subscribes to `selectedBirdId`) → computes target camera position from bird's lat/lng, begins frame-based lerp animation to zoom in.
3. **BirdInfoCard** (subscribes to `selectedBirdId`) → slides in with bird data (photo, names, fun fact).
4. **AudioPlayer** (subscribes to `selectedBirdId`) → aborts previous fetch, fetches new audio (direct `audioUrl` first, then xeno-canto fallback), plays.
5. **CameraController** → disables `autoRotate` during bird selection.

On card close (`setSelectedBird(null)`):
1. CameraController lerps camera back to default distance.
2. AudioPlayer stops playback.
3. After 5s idle, CameraController re-enables `autoRotate`.

## 2. Components

### Unchanged from v2
- **`<App />`** — Root component.
- **`<LangToggle />`** — Language toggle button.
- **`<Starfield />`** — Varied-size star particles (completed in v2).
- **`<LoadingScreen />`** — Tied to `globeReady` (completed in v2).
- **`<BirdInfoCard />`** — Springy card transitions (completed in v2).

### Modified Components

#### 2.1 `<Globe />` — modified (BUG-9, R-1 cloud layer)

Current state: Single `<mesh>` with `sphereGeometry(1, 64, 64)` + `meshStandardMaterial` with Earth texture.

Changes:
- **Cloud layer**: Add a second `<mesh>` at radius `1.005` with a semi-transparent cloud texture. Use `meshStandardMaterial` with `transparent: true`, `opacity: 0.35`, `depthWrite: false`. The cloud texture is a grayscale alpha map (white = cloud, black = transparent) loaded from `/public/textures/clouds.png`.
- **Return structure**: Return a `<group>` containing the Earth mesh and the cloud mesh. The cloud mesh rotates very slowly relative to the Earth (e.g., `rotation.y += 0.0001` per frame) for a subtle atmospheric drift effect.
- **No auto-rotation logic here** — that's handled by `CameraController` via OrbitControls.

#### 2.2 `<Atmosphere />` — modified (BUG-9)

Current state: Sphere at scale `[1.12, 1.12, 1.12]` with Fresnel shader, `BackSide`, `AdditiveBlending`.

Changes to fix BUG-9 (blue halo artifact):
- **Reduce scale** from `1.12` to `1.06`. The oversized sphere creates a hard visible ring at certain camera angles.
- **Tune Fresnel exponent** from `3.0` to `2.5` for a softer falloff.
- **Reduce opacity multiplier** from `0.6` to `0.4` in the fragment shader output.
- **Verify**: No hard-edged blue ring at any zoom level (min 1.5 to max 5.0 distance).

#### 2.3 `<BirdMarker />` — rewritten (BUG-10, BUG-12, R-3)

Current state: Uses `Billboard` + `Float` + `CanvasTexture` teardrop pin in world space.

**Complete rewrite**:
- **Remove**: `Billboard`, `Float`, `CanvasTexture`, `createPinTexture`, silhouette imports. The entire teardrop-pin approach is replaced.
- **New visual**: A small `<mesh>` with `sphereGeometry(0.015, 16, 16)` and `meshPhongMaterial` (`color: 0xFFD700`, `emissive: 0x444444`, `shininess: 80`). This produces a golden glowing sphere.
- **Positioning**: Use `latLngToVector3(bird.lat, bird.lng, 1.02)` to place the marker slightly above the Earth surface. The position is set as a local coordinate within the `EarthGroup` parent — NOT in world space. The marker is rendered as a child of the earth group in `GlobeScene`, so it inherits the globe's rotation.
- **Pulse animation**: In `useFrame`, modulate the mesh scale using `1.0 + 0.1 * Math.sin(clock.elapsedTime * 2.0 + phaseOffset)` where `phaseOffset` is derived from the bird's index to stagger pulses.
- **Hover**: On `pointerOver`, set `emissive` to `0x888844` and scale to `1.3×`. On `pointerOut`, revert.
- **Click**: Same as before — `setSelectedBird(bird.id)`.
- **No texture loading, no async, no dispose needed** — the material is a simple `MeshPhongMaterial` with no textures.

#### 2.4 `<CameraController />` — modified (BUG-11, R-11)

Current state: Listens for OrbitControls `start` event to disable auto-rotation, but never re-enables it after drag ends.

Changes to fix BUG-11 (drag permanently stops auto-rotation):
- **Add `end` event listener**: In addition to the existing `start` listener, listen for the OrbitControls `end` event. On `end`, record `lastInteractionRef.current = Date.now()` but do NOT set `autoRotate = false`. The idle-timeout logic in `useFrame` will re-enable auto-rotation after 5 seconds.
- **Revised `start` handler**: On `start`, only set `autoRotate = false` and stop any in-progress zoom animation. Do NOT update `lastInteractionRef` here (that happens on `end`).
- **Distance-aware auto-rotate speed**: In the `useFrame` idle-rotation block, scale `autoRotateSpeed` inversely with camera distance: `autoRotateSpeed = 1.0 * (DEFAULT_DISTANCE / camera.position.length())`. This prevents auto-rotation from appearing too fast when zoomed in.
- **Bird deselect resume**: When `selectedBirdId` becomes `null`, reset `lastInteractionRef.current = Date.now()` so the 5-second idle timer starts fresh.

#### 2.5 `<AudioPlayer />` — modified (R-5 audioUrl fallback)

Current state: Fetches audio from xeno-canto only.

Changes:
- Before calling `fetchBirdAudio(bird.xenoCantoQuery)`, check if `bird.audioUrl` is defined and non-empty. If so, try playing that URL directly first.
- If the direct URL fails (error event on `HTMLAudioElement`), fall back to the xeno-canto fetch.
- This requires the `Bird` type to include the optional `audioUrl` field.

#### 2.6 `<GlobeScene />` — modified (BUG-12, R-12)

Current state: Renders `<Globe />`, `<BirdMarker />`s, `<Atmosphere />`, `<CameraController />`, and `<OrbitControls />` as flat siblings.

Changes:
- **EarthGroup**: Wrap `<Globe />`, all `<BirdMarker />`s, and `<MigrationPaths />` inside a `<group ref={earthGroupRef}>`. This group is the shared parent that ensures markers and migration paths rotate with the globe.
- **Bird data**: Load the new 15-bird `birds.json` instead of 35.
- **Migration data**: Load `migrations.json` and pass it to `<MigrationPaths />`.
- **Render order**: `<Atmosphere />` and `<Starfield />` remain outside the earth group (they don't rotate with the globe). `<CameraController />` and `<OrbitControls />` also remain outside.

### New Components

#### 2.7 `<MigrationPaths />` — new (R-12)

Renders all migration path curves as children of the earth group.

**Props**: `migrations: MigrationRoute[]`, `birds: Bird[]`.

**For each migration route**:
1. Look up the `from` and `to` bird entries to get their lat/lng.
2. Convert both positions to 3D vectors on the globe surface using `latLngToVector3(lat, lng, 1.0)`.
3. Compute a midpoint that arcs outward: take the midpoint of the two surface positions, normalize it, and scale to radius `1.0 + arcHeight` (where `arcHeight` is proportional to the great-circle distance between the two birds, clamped to 0.15–0.4).
4. Create a `CatmullRomCurve3` through `[fromPos, midPos, toPos]` with ~64 sample points.
5. Create a `BufferGeometry` from the curve points using `setFromPoints()`.
6. Apply a custom `ShaderMaterial` with:
   - **Vertex shader**: Pass a `vArc` varying (0.0 at start, 1.0 at end) based on vertex index / total vertices.
   - **Fragment shader**: Compute a dash pattern using `mod(vArc * dashCount - uTime * dashSpeed, 1.0)`. If the result is below a threshold (e.g., 0.4), render the fragment with the line color and glow; otherwise, discard or set alpha to 0.
   - **Uniforms**: `uTime` (updated per frame via `useFrame`), `uColor` (vec3, gold `#FFD700`), `dashCount` (float, ~8.0), `dashSpeed` (float, ~0.3).
7. Render as `<line>` (Three.js `Line` object) with the geometry and material.

**Performance**: Curve geometries and materials are created once in `useMemo`. Only `uTime` uniform updates per frame.

#### 2.8 `<CloudLayer />` — new (R-1)

Alternative approach: Instead of embedding the cloud mesh inside `<Globe />`, create a standalone `<CloudLayer />` component rendered as a child of the earth group. This keeps `Globe` focused on the Earth texture.

- Sphere geometry at radius `1.005`, segments `48, 48`.
- `meshStandardMaterial` with `alphaMap` (cloud texture), `transparent: true`, `opacity: 0.35`, `depthWrite: false`, `color: 0xffffff`.
- Slow independent rotation in `useFrame`: `mesh.rotation.y += 0.0001`.

**Decision**: Implement clouds as a separate component (`CloudLayer`) rather than embedding in `Globe`, for cleaner separation of concerns.

## 3. Data Structures

### 3.1 Bird Entry (`Bird` type) — extended

```typescript
interface Bird {
  id: string;
  nameZh: string;
  pinyin: string;
  nameEn: string;
  scientificName: string;          // new: Latin binomial
  lat: number;
  lng: number;
  funFactZh: string;
  funFactEn: string;
  photoUrl: string;
  xenoCantoQuery: string;
  silhouette: string;
  region: string;
  audioUrl?: string;               // new: optional direct audio URL
}
```

New fields:
- `scientificName`: Required. Already present in some v2 entries but now mandatory in the type.
- `audioUrl`: Optional. If provided, `AudioPlayer` tries this URL before falling back to xeno-canto. Useful for birds where xeno-canto results are unreliable.

### 3.2 Migration Route — new

```typescript
interface MigrationRoute {
  id: string;
  from: string;       // bird id
  to: string;         // bird id
  nameZh?: string;    // optional display name
  nameEn?: string;
}
```

Stored in `src/data/migrations.json` as an array. Example:

```json
[
  { "id": "sg-stork-eu-robin", "from": "white-stork-sg", "to": "european-robin" },
  { "id": "sg-plover-au-fairy", "from": "pacific-golden-plover-sg", "to": "superb-fairywren" },
  { "id": "barn-swallow-condor", "from": "barn-swallow-sg", "to": "andean-condor" }
]
```

### 3.3 App Store (`useAppStore`) — unchanged from v2

No new Zustand fields. Migration paths have no selection state. Auto-rotation state is local to `CameraController`.

### 3.4 Coordinate Conversion — unchanged

```typescript
function latLngToVector3(lat: number, lng: number, radius: number): [number, number, number]
```

Used by both `BirdMarker` (at radius 1.02) and `MigrationPaths` (at radius 1.0 for endpoints, 1.0 + arcHeight for midpoint).

### 3.5 Camera Target Utility — unchanged

```typescript
function computeCameraTarget(lat: number, lng: number, distance: number):
  { position: [number, number, number]; target: [number, number, number] }
```

### 3.6 Migration Curve Utility — new

```typescript
function buildMigrationCurve(
  fromLatLng: [number, number],
  toLatLng: [number, number],
  globeRadius: number,
  segments: number,
): { points: Vector3[]; arcHeight: number }
```

Computes the `CatmullRomCurve3` control points and samples `segments` points along it. The `arcHeight` is proportional to the angular distance between the two positions (longer routes arc higher).

## 4. Technical Decisions

### Retained from v2
- TD-1: Zustand over React Context
- TD-3: xeno-canto Fetched at Runtime
- TD-4: Single JSON File (now two: `birds.json` + `migrations.json`)
- TD-5: Tailwind CSS for 2D UI
- TD-6: Vite over Next.js / CRA
- TD-7: Earth Texture Resolution
- TD-9: Frame-based Lerp over Tween Libraries
- TD-11: OrbitControls `autoRotate` for Idle Rotation
- TD-12: Dynamic Silhouette Import via Vite Glob
- TD-13: Real Photos via Wikimedia Commons

### Superseded Decisions

#### TD-2: ~~Billboard Markers over HTML Overlays~~ → TD-14: MeshPhong Spheres
The teardrop-pin Billboard approach (CanvasTexture + async loading) is replaced with simple `MeshPhongMaterial` spheres. Rationale: the pin textures were the root cause of BUG-10 (black markers when texture fails) and BUG-1/2/3 (texture lifecycle issues). Golden spheres require no textures, no async loading, no dispose logic. They receive scene lighting naturally via Phong shading.

#### TD-8: ~~SVG Silhouettes as Sprite Textures~~ → removed
No longer needed. Bird markers are golden spheres, not silhouette pins. Silhouette SVGs are no longer loaded or rendered. The `src/assets/silhouettes/` directory can be retained for future use but is not referenced by any component.

#### TD-10: ~~Fresnel Shader at scale 1.12~~ → TD-15: Tuned Fresnel at scale 1.06
The original parameters produced BUG-9. The shader itself is correct; only the scale, exponent, and opacity need tuning.

### New Decisions

#### TD-14: MeshPhong Golden Spheres for Bird Markers
Use `MeshPhongMaterial(color: 0xFFD700, emissive: 0x444444)` on a small `SphereGeometry(0.015)`. Rationale: zero texture overhead, natural lighting, visible glow, no async loading, no memory leaks. Pulse animation via `useFrame` scale modulation is trivial and GPU-efficient.

#### TD-15: Atmosphere Scale 1.06, Exponent 2.5, Opacity 0.4
Reduced from v2's scale 1.12 / exponent 3.0 / opacity 0.6. These values were determined by the artifact analysis in BUG-9. The smaller scale keeps the glow closer to the globe edge; the lower exponent produces a softer gradient; the lower opacity prevents the glow from dominating.

#### TD-16: Earth Group Pattern for Co-Rotation
Instead of adding markers as children of the globe mesh directly (which would require a ref and imperative `earth.add()`), we use a declarative R3F `<group>` that wraps `<Globe />`, `<BirdMarker />`s, and `<MigrationPaths />`. OrbitControls rotates the camera around this group, so all children rotate together. This is the standard R3F pattern for grouped scene objects.

#### TD-17: CatmullRomCurve3 + Custom Dash Shader for Migration Paths
`CatmullRomCurve3` is Three.js's built-in smooth curve through control points — ideal for great-circle-like arcs. A custom `ShaderMaterial` with an animated dash pattern (uniform `uTime` offset) is more performant than CPU-side dash recalculation or using `LineDashedMaterial` (which doesn't support animation). The shader is ~15 lines of GLSL.

#### TD-18: Separate Cloud Mesh over Baked Texture
A separate semi-transparent sphere for clouds (rather than compositing clouds into the Earth texture) allows independent rotation, adjustable opacity, and cleaner layering. The cloud texture is a single grayscale alpha map (~200 KB). This also helps break up the hard atmosphere edge (BUG-9).

#### TD-19: OrbitControls `start` + `end` Events for Auto-Rotation Lifecycle
The v2 approach only listened for `start` and permanently killed auto-rotation. The fix uses both `start` (pause) and `end` (record timestamp, let idle timer resume). This matches OrbitControls' intended event lifecycle and avoids the permanent-stop bug.

## 5. File Structure — Changes from v2

```
src/
├── components/
│   ├── three/
│   │   ├── GlobeScene.tsx          # MODIFIED: EarthGroup wrapper, 15 birds, MigrationPaths
│   │   ├── Globe.tsx               # MODIFIED: no auto-rotation logic, just earth mesh
│   │   ├── CloudLayer.tsx          # NEW: semi-transparent cloud sphere
│   │   ├── Starfield.tsx           # unchanged
│   │   ├── BirdMarker.tsx          # REWRITTEN: golden MeshPhong sphere, pulse, no textures
│   │   ├── MigrationPaths.tsx      # NEW: CatmullRomCurve3 + dash shader
│   │   ├── Atmosphere.tsx          # MODIFIED: scale 1.06, exponent 2.5, opacity 0.4
│   │   └── CameraController.tsx    # MODIFIED: end event, distance-aware speed
│   └── ui/
│       ├── BirdInfoCard.tsx        # unchanged
│       ├── LangToggle.tsx          # unchanged
│       ├── AudioPlayer.tsx         # MODIFIED: audioUrl fallback
│       └── LoadingScreen.tsx       # unchanged
├── types.ts                        # MODIFIED: + scientificName, + audioUrl?, + MigrationRoute
├── store.ts                        # unchanged
├── hooks/
│   └── useAudio.ts                 # unchanged
├── utils/
│   ├── coordinates.ts              # unchanged
│   ├── xeno-canto.ts              # unchanged
│   ├── camera.ts                   # unchanged
│   └── migration.ts                # NEW: buildMigrationCurve utility
├── assets/
│   └── silhouettes/                # RETAINED but no longer imported by BirdMarker
├── data/
│   ├── birds.json                  # REWRITTEN: 15 birds (5 Singapore + 10 global)
│   ├── migrations.json             # NEW: 3–5 migration route definitions
│   └── README.md                   # MODIFIED: updated schema, migration docs
└── ...

public/
├── textures/
│   ├── earth.jpg                   # unchanged
│   └── clouds.png                  # NEW: grayscale cloud alpha map
├── images/
│   └── birds/                      # MODIFIED: 15 photos (down from 35)
└── ...
```

## 6. Implementation Phases

> Phases 1–10 (v1 + v2) are complete. The following phases address v3 requirements.

### Phase 11: Bug Fixes (BUG-9 through BUG-12)

**BUG-9 — Atmosphere artifact**:
- In `Atmosphere.tsx`, change mesh scale from `[1.12, 1.12, 1.12]` to `[1.06, 1.06, 1.06]`.
- In the fragment shader, change exponent from `3.0` to `2.5` and opacity multiplier from `0.6` to `0.4`.
- Verify at min zoom (1.5), default zoom (2.5), and max zoom (5.0).

**BUG-10 — Black bird markers**:
- Rewrite `BirdMarker.tsx`: remove all CanvasTexture/Billboard/Float logic. Replace with `<mesh>` + `sphereGeometry(0.015, 16, 16)` + `meshPhongMaterial(color: 0xFFD700, emissive: 0x444444)`.
- Add `useFrame` pulse animation.
- Verify: all markers appear as golden glowing spheres.

**BUG-11 — Auto-rotation stops permanently**:
- In `CameraController.tsx`, add an `end` event listener on OrbitControls.
- On `end`: set `lastInteractionRef.current = Date.now()` (start idle timer).
- On `start`: set `autoRotate = false`, stop zoom animation. Do NOT update `lastInteractionRef`.
- In `useFrame` idle block: scale `autoRotateSpeed` by `DEFAULT_DISTANCE / camera.position.length()`.
- Verify: drag → release → wait 5s → auto-rotation resumes. Zoom in → auto-rotation speed stays consistent.

**BUG-12 — Birds don't follow rotation**:
- In `GlobeScene.tsx`, wrap `<Globe />` and all `<BirdMarker />`s in a `<group>`.
- BirdMarker positions are already in globe-local coordinates (via `latLngToVector3`), so no position changes needed — only the parent hierarchy changes.
- Verify: drag globe → markers rotate with it.

Verify: `tsc --noEmit` passes, `npm run build` succeeds.

### Phase 12: Cloud Layer (R-1)

- Download a cloud alpha-map texture (e.g., NASA cloud composite or a free CC-licensed one) and save to `public/textures/clouds.png`.
- Create `src/components/three/CloudLayer.tsx`: sphere at radius 1.005, `meshStandardMaterial` with `alphaMap`, `transparent`, `opacity: 0.35`, `depthWrite: false`.
- Add slow independent rotation in `useFrame` (`rotation.y += 0.0001`).
- Add `<CloudLayer />` inside the earth group in `GlobeScene.tsx`.
- Verify: clouds visible as semi-transparent layer, drift slowly, don't obscure markers.

### Phase 13: Bird Data Overhaul (R-2, R-3, R-10)

**Data reduction**: Replace the 35-bird `birds.json` with a new 15-bird dataset.

**Singapore birds (5)**:
1. White-bellied Sea Eagle — Sungei Buloh (1.4475, 103.7250)
2. Collared Kingfisher — Pulau Ubin (1.4070, 103.9650)
3. White Stork — Jurong Bird Park area (1.3187, 103.7064)
4. Pacific Golden Plover — East Coast Park (1.3008, 103.9120)
5. Barn Swallow — Botanic Gardens (1.3138, 103.8159)

**Global birds (10)**: Select 10 from the existing 35 that best represent each region and have good xeno-canto coverage. Ensure at least one from Europe, Africa, North America, South America, Oceania.

**For each bird**:
- Verify `lat`/`lng` are accurate real-world coordinates.
- Add `scientificName` field.
- Add `audioUrl` field where a direct MP3/OGG URL is available.
- Download a real photo from Wikimedia Commons.
- Ensure `silhouette` key matches an SVG file (or remove the field if silhouettes are no longer used by markers).

**Update `src/types.ts`**: Add `scientificName: string` and `audioUrl?: string` to the `Bird` interface. Add `MigrationRoute` interface.

**Remove unused assets**: Delete the 20 bird photos and silhouette SVGs that are no longer in the dataset (or leave them for future extensibility — decision: leave them, they cost nothing at build time since they're in `/public/` and `silhouettes/` is no longer imported).

### Phase 14: Migration Paths (R-12)

- Create `src/data/migrations.json` with 3–5 routes connecting Singapore birds to global birds.
- Create `src/utils/migration.ts` with `buildMigrationCurve()`:
  - Input: two lat/lng pairs + globe radius + segment count.
  - Convert both to 3D positions on the globe surface.
  - Compute midpoint: average the two vectors, normalize, scale to `radius + arcHeight`.
  - `arcHeight` = `angularDistance * 0.3`, clamped to `[0.15, 0.4]`.
  - Create `CatmullRomCurve3([from, mid, to])`, sample 64 points.
  - Return the points array.
- Create `src/components/three/MigrationPaths.tsx`:
  - Load `migrations.json` and `birds.json`.
  - For each route, build the curve geometry via `buildMigrationCurve()`.
  - Create a `ShaderMaterial` with animated dash pattern:
    - Vertex shader: compute `vArc = position_index / total_points` and pass to fragment.
    - Fragment shader: `float dash = mod(vArc * 8.0 - uTime * 0.3, 1.0); if (dash > 0.4) discard; gl_FragColor = vec4(1.0, 0.84, 0.0, 1.0 - dash);`
    - Uniform `uTime` updated in `useFrame`.
  - Render each route as a `<line>` with the geometry and material.
  - Wrap all lines in a `<group>` that is a child of the earth group.
- Add `<MigrationPaths />` inside the earth group in `GlobeScene.tsx`.
- Verify: curves arc above the globe, dashes animate, no clipping.

### Phase 15: Audio Fallback + Data Docs

- Update `AudioPlayer.tsx`: check `bird.audioUrl` before xeno-canto fetch.
- Update `src/data/README.md`: document the `scientificName` and `audioUrl` fields, migration route schema, updated bird count.
- Verify: audio plays from direct URL when available, falls back to xeno-canto otherwise.

### Phase 16: Final Verification

- Run `npx tsc --noEmit` — zero errors.
- Run `npm run build` — production build succeeds.
- Visual verification:
  - Globe renders with cloud layer, no atmosphere artifact.
  - 15 golden glowing markers visible, pulse animation, rotate with globe.
  - 3+ migration path curves with animated dashes.
  - Click marker → camera zooms → card slides in → audio plays.
  - Close card → camera zooms out → auto-rotation resumes after 5s.
  - Drag → auto-rotation pauses → release → resumes after 5s.
  - Language toggle switches all text.
  - Works at 375px, 768px, and 1920px widths.
- Verify all acceptance criteria: AC-1 through AC-10.
