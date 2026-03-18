# 万羽拾音 (Kids Bird Globe) — Task Breakdown (v4)

> Each task is small and independently implementable.
> Tasks are ordered by dependency — complete top-to-bottom.
> Mapped to spec requirements (R-x), acceptance criteria (AC-x), and bugs (BUG-x).
> **v4 changes**: Auto-rotation hardening, camera zoom constraint, atmosphere redesign, migration arc reduction, 3D bird models.
> **v3 priority**: Auto-rotation fix (BUG-11) is first — smooth experience for daughter.

---

## Phase 1: Project Scaffold ✅

- [x] **1.1** Initialize Vite project with React + TypeScript template (`npm create vite@latest`)
- [x] **1.2** Install core 3D dependencies: `three`, `@react-three/fiber`, `@react-three/drei`
- [x] **1.3** Install state management: `zustand`
- [x] **1.4** Install and configure Tailwind CSS v4 (+ PostCSS + autoprefixer)
- [x] **1.5** Create directory structure: `src/components/three/`, `src/components/ui/`, `src/data/`, `src/utils/`, `src/hooks/`, `src/assets/silhouettes/`
- [x] **1.6** Create `src/types.ts` with `Bird`, `AppStore`, and `XenoCantoResponse` interfaces
- [x] **1.7** Create `src/store.ts` with Zustand store (`selectedBirdId`, `language`, `audioStatus` + actions)
- [x] **1.8** Create empty shell components: `GlobeScene.tsx`, `Globe.tsx`, `Starfield.tsx`, `BirdMarker.tsx`, `BirdInfoCard.tsx`, `LangToggle.tsx`, `AudioPlayer.tsx`
- [x] **1.9** Wire `App.tsx` to render `<Canvas>` with `<GlobeScene />` and a 2D overlay div
- [x] **1.10** Verify `npm run dev` serves the app without errors

---

## Phase 2: Globe + Starfield ✅ → AC-1

- [x] **2.1** Download NASA Blue Marble texture (2048×1024 JPEG) and place in `public/textures/earth.jpg`
- [x] **2.2** Implement `<Globe />`: `SphereGeometry(1, 64, 64)` + `MeshStandardMaterial` with Earth texture and slight emissive tint
- [x] **2.3** Implement `<Starfield />`: ~2000 random particles using drei `<Points>`, white, spread in a large sphere
- [x] **2.4** Implement `<GlobeScene />`: perspective camera (FOV 45, position `[0, 0, 2.5]`), ambient light, directional light, render `<Globe />` + `<Starfield />`
- [x] **2.5** Add `<OrbitControls />` from drei with: `enableDamping`, `minDistance=1.5`, `maxDistance=5`, touch support enabled
- [x] **2.6** Set Canvas background to transparent/black so starfield reads as deep space
- [x] **2.7** Verify: globe renders, drag-to-rotate works (mouse + touch), scroll-to-zoom is clamped, starfield visible

---

## Phase 3: Bird Data + Markers ✅ → AC-2

### 3A: Data Authoring

- [x] **3.1** Create `src/utils/coordinates.ts` with `latLngToVector3(lat, lng, radius)` function
- [x] **3.2** Author `src/data/birds.json` — first 10 birds (Asia + Europe) with all fields
- [x] **3.3** Author next 10 birds (Africa + North America)
- [x] **3.4** Author next 10 birds (South America + Oceania + Antarctica)
- [x] **3.5** Author remaining birds to reach 30+ total, verify all regions covered

### 3B: Bird Photos

- [x] **3.6** Collect and optimize bird photos for the first 15 birds, place in `public/images/birds/`
- [x] **3.7** Collect and optimize bird photos for the remaining 15+ birds

### 3C: Bird Silhouettes

- [x] **3.8** Create or source bird silhouette SVGs for all 30+ birds, place in `src/assets/silhouettes/`
- [x] **3.9** Create a silhouette index (`src/assets/silhouettes/index.ts`) that exports all SVGs by bird id

### 3D: Marker Component

- [x] **3.10** Implement `<BirdMarker />`: position using `latLngToVector3` at radius 1.02, wrap in drei `<Billboard>` + `<Float>`
- [x] **3.11** Render pin visual: colored teardrop shape with bird silhouette SVG rendered as `CanvasTexture`
- [x] **3.12** Add hover interaction: `onPointerOver` scales to 1.3× + emissive glow, `onPointerOut` reverts
- [x] **3.13** Add click interaction: `onClick` dispatches `setSelectedBird(bird.id)` to Zustand store
- [x] **3.14** Render all birds from `birds.json` as `<BirdMarker />` instances inside `<GlobeScene />`
- [x] **3.15** Verify: 30+ markers visible, geographically correct, bouncing animation, hover glow, click selects

---

## Phase 4: Info Card + Language Toggle ✅ → AC-3, AC-5

### 4A: Info Card

- [x] **4.1** Implement `<BirdInfoCard />` shell: conditionally render when `selectedBirdId !== null`, read bird data from JSON
- [x] **4.2** Build card layout — desktop: slide-in from right, max-width 380px; mobile (<768px): slide-up from bottom, full-width
- [x] **4.3** Add card content: bird photo (`<img>` with lazy loading), Chinese name + pinyin, English name, fun fact paragraph
- [x] **4.4** Add close button (top-right X) that dispatches `setSelectedBird(null)`
- [x] **4.5** Add click-outside-to-dismiss behavior
- [x] **4.6** Add slide-in/out CSS transitions (transform + opacity, 300ms ease)
- [x] **4.7** Add audio status indicator in card (speaker icon: loading spinner / playing animation / muted icon for error)
- [x] **4.8** Add ARIA labels and focus management (focus trap on open, return focus on close)

### 4B: Language Toggle

- [x] **4.9** Implement `<LangToggle />`: fixed top-right button, displays "中/EN", min 48×48px tap target, rounded-full, semi-transparent bg
- [x] **4.10** Wire toggle to Zustand `toggleLanguage` action
- [x] **4.11** Update `<BirdInfoCard />` to read `language` from store and display the correct `nameZh`/`nameEn` and `funFactZh`/`funFactEn`
- [x] **4.12** Verify: card opens/closes correctly, only one card at a time, bilingual toggle switches all text, default is Chinese

---

## Phase 5: Audio Playback ✅ → AC-4

- [x] **5.1** Implement `src/utils/xeno-canto.ts`: `fetchBirdAudio(query: string)` → fetches from xeno-canto API, returns best recording URL
- [x] **5.2** Handle CORS: if xeno-canto blocks direct browser requests, add a CORS proxy fallback URL
- [x] **5.3** Implement `src/hooks/useAudio.ts`: manages `HTMLAudioElement` lifecycle — create, play, stop, dispose
- [x] **5.4** Implement `<AudioPlayer />`: subscribes to `selectedBirdId`, on change → stop current audio → fetch new → play
- [x] **5.5** Wire `audioStatus` updates: "loading" on fetch start, "playing" on `canplaythrough`, "error" on failure
- [x] **5.6** Add cleanup: abort pending fetch and stop audio on component unmount
- [x] **5.7** Verify: audio auto-plays on bird select, stops on switch, stops on card close, graceful fallback on API error

---

## Phase 6: Polish + Responsive ✅ → AC-6

### 6A: Visual Polish

- [x] **6.1** Tune color palette: warm, child-friendly colors for card background, pin colors, glow effects
- [x] **6.2** Ensure all tap targets are min 44px (markers, close button, language toggle)
- [x] **6.3** Add subtle shadow and rounded corners (border-radius ≥ 16px) to the info card
- [x] **6.4** Add a loading state for the globe (spinner or progress bar while Earth texture loads)

### 6B: Responsive Layout

- [x] **6.5** Test and fix layout at 375px width (iPhone SE) — card as bottom sheet, toggle repositioned if needed
- [x] **6.6** Test and fix layout at 768px width (tablet) — verify card and globe coexist
- [x] **6.7** Test and fix layout at 1920px width (desktop) — verify card doesn't obscure too much of the globe

### 6C: Performance

- [x] **6.8** Lazy-load Earth texture with a fallback color while loading
- [x] **6.9** Lazy-load bird photos in the info card (only load when card opens)
- [x] **6.10** Verify globe renders within 3 seconds on a mid-range device

---

## Phase 7: Bug Fixes ✅ → BUG-1 through BUG-6

### 7A: BirdMarker Texture Bugs

- [x] **7.1** In `BirdMarker.tsx`, replace `useMemo` with `useEffect` for async texture creation (BUG-1)
- [x] **7.2** In the `useEffect` cleanup, call `texture.dispose()` on the previous texture before creating a new one (BUG-2)
- [x] **7.3** Rewrite `createPinTexture` draw order: draw shadow (offset darker teardrop or `ctx.shadowBlur`) first, then base color teardrop, then white circle, then silhouette (BUG-3)
- [x] **7.4** Replace emoji fallback (`🐦`) with a simple canvas-drawn generic bird path for consistent cross-platform rendering (BUG-3)
- [x] **7.5** Verify: pin renders with visible shadow, white circle, and silhouette on all platforms

### 7B: Data Key Mismatches

- [x] **7.6** In `birds.json`, fix `silhouette` value: `greater-flamingo` → `flamingo` (BUG-4)
- [x] **7.7** In `birds.json`, fix `silhouette` value: `greater-bird-of-paradise` → `bird-of-paradise` (BUG-4)
- [x] **7.8** In `birds.json`, fix `silhouette` value: `laughing-kookaburra` → `kookaburra` (BUG-4)
- [x] **7.9** Verify: all 35 markers render with a silhouette (no solid-color fallback pins)

### 7C: Audio Lifecycle

- [x] **7.10** In `useAudio.ts`, add an `onEnded` callback parameter to the `play` function (BUG-5)
- [x] **7.11** In `AudioPlayer.tsx`, wire the `onEnded` callback to set `audioStatus = "idle"` (BUG-5)
- [x] **7.12** Verify: after a bird call finishes playing, the audio indicator returns to idle state

### 7D: API Error Handling

- [x] **7.13** In `xeno-canto.ts`, wrap `response.json()` in try/catch; on parse failure, throw a descriptive error (BUG-6)
- [x] **7.14** Verify: if xeno-canto returns malformed HTML instead of JSON, the app shows the error fallback without crashing

### 7E: Final Bug Fix Verification

- [x] **7.15** Run `npx tsc --noEmit` — zero errors
- [x] **7.16** Run `npm run build` — production build succeeds

---

## Phase 8: Camera Zoom-to-Bird ✅ → R-8, AC-7

### 8A: Camera Utility

- [x] **8.1** Create `src/utils/camera.ts` with `computeCameraTarget(lat, lng, distance)` that returns `{ position, target }` vectors

### 8B: CameraController Component

- [x] **8.2** Create `src/components/three/CameraController.tsx` shell: access camera + OrbitControls ref via `useThree()`
- [x] **8.3** Subscribe to `selectedBirdId` from Zustand; look up the bird's lat/lng from bird data
- [x] **8.4** On bird select: use `useFrame` to lerp OrbitControls target toward the bird's 3D position on the globe surface (easing factor ~0.05)
- [x] **8.5** On bird select: simultaneously lerp camera distance from current to ~1.8 (zoom in)
- [x] **8.6** On bird deselect (card close): lerp camera distance back to 2.5 (default), keep current rotation
- [x] **8.7** Add interruption detection: listen for OrbitControls `change` event during animation; if user drags, stop the lerp
- [x] **8.8** Verify: smooth ~1s zoom on click, zoom out on close, user can interrupt by dragging

### 8C: Auto-Rotation

- [x] **8.9** Remove manual `useFrame` rotation (`rotation.y += 0.0005`) from `Globe.tsx`
- [x] **8.10** In `CameraController`, manage `OrbitControls.autoRotate`: enable when idle >5s with no bird selected, disable on any interaction or bird select
- [x] **8.11** Set `OrbitControls.autoRotateSpeed` to a slow value (e.g., 0.5)

### 8D: Integration

- [x] **8.12** Update `GlobeScene.tsx`: create an OrbitControls ref, pass it to `<CameraController />`
- [x] **8.13** Add `<CameraController />` to `GlobeScene` render tree
- [x] **8.14** Verify: AC-7 complete (zoom on click, zoom out on close, interruptible, auto-rotate on idle)

---

## Phase 9: Visual Polish ✅ → R-9, AC-1, AC-6

### 9A: Atmosphere Glow

- [x] **9.1** Create `src/components/three/Atmosphere.tsx`: sphere at radius ~1.015 with custom `ShaderMaterial`
- [x] **9.2** Write vertex shader: pass view-space normal to fragment
- [x] **9.3** Write fragment shader: Fresnel glow — `intensity = pow(1.0 - dot(normal, viewDir), 3.0)`, output `vec4(0.3, 0.6, 1.0, intensity * 0.6)`
- [x] **9.4** Set material: `transparent`, `side: BackSide`, `blending: AdditiveBlending`, `depthWrite: false`
- [x] **9.5** Add `<Atmosphere />` to `GlobeScene.tsx`
- [x] **9.6** Verify: subtle blue halo visible around the globe edge

### 9B: Starfield Depth

- [x] **9.7** In `Starfield.tsx`, generate a `Float32Array` of random sizes (0.04–0.12) for each particle
- [x] **9.8** Pass sizes to `<Points>` via the `sizes` attribute or use `<PointMaterial>` with `sizeAttenuation`
- [x] **9.9** Verify: stars have visible size variation, creating a sense of depth

### 9C: Loading Screen Fix

- [x] **9.10** Add `globeReady: boolean` and `setGlobeReady` action to Zustand store
- [x] **9.11** In `Globe.tsx`, call `setGlobeReady(true)` when the Earth texture finishes loading (use `useTexture` callback or `useEffect` after texture is available)
- [x] **9.12** Update `LoadingScreen.tsx`: subscribe to `globeReady` from store; fade out when `true`; keep 8s safety timeout as fallback
- [x] **9.13** Verify: loading screen stays visible until globe actually renders, then fades out

### 9D: Card Transition Polish

- [x] **9.14** In `BirdInfoCard.tsx`, replace `ease-out` transition with `cubic-bezier(0.34, 1.56, 0.64, 1)` for a springy overshoot feel
- [x] **9.15** Verify: card slide-in feels bouncy and playful, slide-out is smooth

### 9E: Phase 9 Verification

- [x] **9.16** Run `npx tsc --noEmit` — zero errors
- [x] **9.17** Visual check: atmosphere glow + varied stars + springy card + correct loading screen

---

## Phase 10: Rich Bird Data ✅ → R-10, AC-8, BUG-8

### 10A: Real Bird Photographs

- [x] **10.1** Source real photographs for the first 12 birds (Asia + Europe) from Wikimedia Commons / Pixabay (CC/free license)
- [x] **10.2** Source real photographs for the next 10 birds (Africa + North America)
- [x] **10.3** Source real photographs for the next 10 birds (South America + Oceania)
- [x] **10.4** Source real photographs for the remaining 3 birds (Antarctica)
- [x] **10.5** Optimize all 35 photos to 400×300 JPEG, <80 KB each, replace placeholders in `public/images/birds/`
- [x] **10.6** Verify: every bird's info card shows a real photograph, no gradient-only fallbacks

### 10B: Dynamic Silhouette Import

- [x] **10.7** Rewrite `src/assets/silhouettes/index.ts` to use `import.meta.glob('./*.svg', { eager: true, query: '?url', import: 'default' })` instead of 35 manual imports
- [x] **10.8** Verify: all 35 silhouettes still load correctly after the refactor

### 10C: Data Documentation

- [x] **10.9** Create `src/data/README.md` with: Bird schema (all fields explained), step-by-step "How to add a new bird" guide
- [x] **10.10** Add attribution/licensing section to `src/data/README.md`: photo sources, xeno-canto API terms, SVG licensing
- [x] **10.11** Verify: a developer can follow the README to add a 36th bird with zero code changes (only JSON + photo + SVG)

### 10D: Phase 10 Verification

- [x] **10.12** Run `npx tsc --noEmit` — zero errors
- [x] **10.13** Run `npm run build` — production build succeeds
- [x] **10.14** Spot-check 5 random birds: photo loads, silhouette renders, audio plays, card shows correct data

---

## Phase 11: ⚡ Restore Auto-Rotation After Drag → BUG-11, R-11, AC-9

> **Priority**: This phase runs first in v3 — fixes the most noticeable UX issue (globe stops spinning after any drag).

### 11A: OrbitControls Event Lifecycle Fix

- [x] **11.1** In `CameraController.tsx`, add an `end` event listener on OrbitControls alongside the existing `start` listener (BUG-11)
- [x] **11.2** Revise the `start` handler: set `controls.autoRotate = false` and stop any in-progress zoom animation, but do NOT update `lastInteractionRef` (BUG-11)
- [x] **11.3** In the new `end` handler: set `lastInteractionRef.current = Date.now()` to start the idle countdown (BUG-11)
- [x] **11.4** In the `useFrame` idle-rotation block, scale `autoRotateSpeed` by `DEFAULT_DISTANCE / camera.position.length()` so speed stays consistent when zoomed in (R-11)
- [x] **11.5** When `selectedBirdId` becomes `null` (bird deselected), reset `lastInteractionRef.current = Date.now()` so the 5s idle timer starts fresh (R-11)
- [x] **11.6** Verify: drag globe → release → wait 5s → auto-rotation resumes smoothly (AC-9)
- [x] **11.7** Verify: zoom in close → auto-rotation speed does not appear faster than at default distance (AC-9)
- [x] **11.8** Verify: select bird → close card → wait 5s → auto-rotation resumes (AC-9)

---

## Phase 12: Fix Blue Halo Artifact → BUG-9, R-1, AC-1

### 12A: Atmosphere Tuning

- [x] **12.1** In `Atmosphere.tsx`, reduce mesh scale from `[1.12, 1.12, 1.12]` to `[1.06, 1.06, 1.06]` (BUG-9)
- [x] **12.2** In the fragment shader, change Fresnel exponent from `3.0` to `2.5` (BUG-9)
- [x] **12.3** In the fragment shader, reduce opacity multiplier from `0.6` to `0.4` (BUG-9)
- [x] **12.4** Verify at min zoom (1.5): no hard-edged blue ring visible (AC-1)
- [x] **12.5** Verify at default zoom (2.5): subtle smooth glow around globe edge (AC-1)
- [x] **12.6** Verify at max zoom (5.0): glow fades naturally, no artifact (AC-1)

---

## Phase 13: Fix Black Anchor Points → BUG-10, R-3, AC-2

### 13A: Rewrite BirdMarker as Golden Sphere

- [x] **13.1** In `BirdMarker.tsx`, remove all imports: `Billboard`, `Float`, `CanvasTexture`, `silhouettes`, `createPinTexture`, `drawGenericBirdFallback` (BUG-10)
- [x] **13.2** Replace the mesh with `<sphereGeometry args={[0.015, 16, 16]} />` + `<meshPhongMaterial color={0xFFD700} emissive={0x444444} shininess={80} />` (R-3)
- [x] **13.3** Add `useFrame` pulse animation: `scale = 1.0 + 0.1 * Math.sin(clock.elapsedTime * 2.0 + phaseOffset)` where `phaseOffset` is derived from bird index (R-3)
- [x] **13.4** Update hover: on `pointerOver` set emissive to `0x888844` and scale to 1.3×; on `pointerOut` revert to `0x444444` and base scale (R-3)
- [x] **13.5** Keep click handler unchanged: `setSelectedBird(bird.id)` (R-3)
- [x] **13.6** Verify: all markers appear as golden glowing spheres, no black dots (AC-2)
- [x] **13.7** Verify: pulse animation visible — markers gently breathe in size (AC-2)

---

## Phase 14: Birds Follow Globe Rotation → BUG-12, AC-2

### 14A: EarthGroup Wrapper

- [x] **14.1** In `GlobeScene.tsx`, create a `<group>` (EarthGroup) that wraps `<Globe />` and all `<BirdMarker />`s (BUG-12)
- [x] **14.2** Move bird marker rendering inside the EarthGroup: `{birds.map(b => <BirdMarker key={b.id} bird={b} />)}` as children of the group (BUG-12)
- [x] **14.3** Keep `<Atmosphere />`, `<Starfield />`, `<CameraController />`, and `<OrbitControls />` outside the EarthGroup (they don't rotate with the globe) (BUG-12)
- [x] **14.4** Verify: drag globe → golden markers rotate with the Earth surface (AC-2)
- [x] **14.5** Verify: markers are still at geographically correct positions after grouping (AC-2)

---

## Phase 15: Bird Data Overhaul → R-2, R-10, AC-8

### 15A: Type Updates

- [x] **15.1** In `src/types.ts`, add `scientificName: string` to the `Bird` interface (R-2)
- [x] **15.2** In `src/types.ts`, add `audioUrl?: string` (optional) to the `Bird` interface (R-2, R-5)
- [x] **15.3** In `src/types.ts`, add `MigrationRoute` interface: `{ id: string; from: string; to: string; nameZh?: string; nameEn?: string }` (R-12)

### 15B: Singapore Birds (5)

- [x] **15.4** Author bird entry: White-bellied Sea Eagle — Sungei Buloh (lat 1.4475, lng 103.7250), region `asia`, with real `scientificName`, `xenoCantoQuery`, photo URL (R-2)
- [x] **15.5** Author bird entry: Collared Kingfisher — Pulau Ubin (lat 1.4070, lng 103.9650) (R-2)
- [x] **15.6** Author bird entry: White Stork — Jurong Bird Park (lat 1.3187, lng 103.7064) (R-2)
- [x] **15.7** Author bird entry: Pacific Golden Plover — East Coast Park (lat 1.3008, lng 103.9120) (R-2)
- [x] **15.8** Author bird entry: Barn Swallow — Botanic Gardens (lat 1.3138, lng 103.8159) (R-2)

### 15C: Global Birds (10)

- [x] **15.9** Select 10 birds from existing dataset covering Europe, Africa, North America, South America, Oceania — at least 2 per region (R-2)
- [x] **15.10** Add `scientificName` field to each of the 10 selected birds (R-2)
- [x] **15.11** Add `audioUrl` field where a direct audio URL is available (R-5)

### 15D: Assemble New Dataset

- [x] **15.12** Rewrite `src/data/birds.json` with the 15 birds (5 Singapore + 10 global), all fields complete (R-2)
- [x] **15.13** Download real photos for the 5 Singapore birds from Wikimedia Commons, save to `public/images/birds/` (R-10)
- [x] **15.14** Verify: all 15 `photoUrl` paths resolve to real images >2 KB (AC-8)
- [x] **15.15** Verify: all 15 birds render on the globe at correct geographic positions (AC-8)
- [x] **15.16** Verify: 5 Singapore birds cluster visibly in Southeast Asia (AC-8)

---

## Phase 16: Cloud Layer → R-1, AC-1

### 16A: Cloud Texture + Component

- [x] **16.1** Download a cloud alpha-map texture (NASA or CC-licensed) and save to `public/textures/clouds.png` (R-1)
- [x] **16.2** Create `src/components/three/CloudLayer.tsx`: `sphereGeometry(1.005, 48, 48)` + `meshStandardMaterial` with `alphaMap` from cloud texture, `transparent: true`, `opacity: 0.35`, `depthWrite: false` (R-1)
- [x] **16.3** Add slow drift rotation in `useFrame`: `mesh.rotation.y += 0.0001` (R-1)
- [x] **16.4** Add `<CloudLayer />` inside the EarthGroup in `GlobeScene.tsx`, between `<Globe />` and `<BirdMarker />`s (R-1)
- [x] **16.5** Verify: clouds visible as semi-transparent layer above Earth, drift slowly, don't obscure bird markers (AC-1)

---

## Phase 17: Migration Paths → R-12, AC-10

### 17A: Migration Data

- [x] **17.1** Create `src/data/migrations.json` with 3–5 routes connecting Singapore birds to global birds (R-12)
- [x] **17.2** Example routes: White Stork (SG) → European Robin (EU), Pacific Golden Plover (SG) → Superb Fairywren (AU), Barn Swallow (SG) → Andean Condor (SA) (R-12)

### 17B: Curve Utility

- [x] **17.3** Create `src/utils/migration.ts` with `buildMigrationCurve(fromLatLng, toLatLng, globeRadius, segments)` (R-12)
- [x] **17.4** Implement midpoint calculation: average the two surface vectors, normalize, scale to `radius + arcHeight` where `arcHeight = angularDistance * 0.3` clamped to `[0.15, 0.4]` (R-12)
- [x] **17.5** Create `CatmullRomCurve3([from, mid, to])`, sample 64 points, return as `Vector3[]` (R-12)

### 17C: MigrationPaths Component

- [x] **17.6** Create `src/components/three/MigrationPaths.tsx`: load migrations + birds data (R-12)
- [x] **17.7** For each route, build curve geometry via `buildMigrationCurve()` and create `BufferGeometry` from points (R-12)
- [x] **17.8** Write vertex shader: compute `vArc = float(vertexIndex) / float(totalVertices)` and pass to fragment (R-12)
- [x] **17.9** Write fragment shader: `float dash = mod(vArc * 8.0 - uTime * 0.3, 1.0); if (dash > 0.4) discard; gl_FragColor = vec4(1.0, 0.84, 0.0, 1.0 - dash);` (R-12)
- [x] **17.10** Add `uTime` uniform updated in `useFrame` via `material.uniforms.uTime.value = clock.elapsedTime` (R-12)
- [x] **17.11** Render each route as `<line>` with the geometry and dash shader material (R-12)
- [x] **17.12** Add `<MigrationPaths />` inside the EarthGroup in `GlobeScene.tsx` (R-12)
- [x] **17.13** Verify: 3+ curves arc smoothly above the globe, no clipping through Earth (AC-10)
- [x] **17.14** Verify: dash animation flows continuously along each curve (AC-10)
- [x] **17.15** Verify: migration paths rotate with the globe (children of EarthGroup) (AC-10)

---

## Phase 18: Audio Fallback + Data Docs → R-5, R-10

- [x] **18.1** In `AudioPlayer.tsx`, before calling `fetchBirdAudio()`, check if `bird.audioUrl` is defined; if so, try playing it directly first (R-5)
- [x] **18.2** If direct `audioUrl` playback fails (error event), fall back to xeno-canto fetch as before (R-5)
- [x] **18.3** Update `src/data/README.md`: add `scientificName`, `audioUrl` field docs, migration route schema, updated bird count (15) (R-10)
- [x] **18.4** Verify: audio plays from direct URL when `audioUrl` is set; falls back to xeno-canto when not (AC-4)

---

## Phase 19: Final Verification → AC-1 through AC-10

- [x] **19.1** Run `npx tsc --noEmit` — zero errors
- [x] **19.2** Run `npm run build` — production build succeeds
- [x] **19.3** Visual: globe renders with cloud layer, no atmosphere artifact (AC-1)
- [x] **19.4** Visual: 15 golden glowing markers visible, pulse animation, rotate with globe (AC-2)
- [x] **19.5** Visual: 3+ migration path curves with animated dashes (AC-10)
- [x] **19.6** Interaction: click marker → camera zooms → card slides in → audio plays (AC-3, AC-4, AC-7)
- [x] **19.7** Interaction: close card → camera zooms out → auto-rotation resumes after 5s (AC-7, AC-9)
- [x] **19.8** Interaction: drag → auto-rotation pauses → release → resumes after 5s (AC-9)
- [x] **19.9** Interaction: language toggle switches all text (AC-5)
- [x] **19.10** Responsive: works at 375px, 768px, and 1920px widths (AC-6)
- [x] **19.11** Data: 5 Singapore birds at correct coordinates, all 15 with real photos (AC-8)

---

## Phase 20: Auto-Rotation Lifecycle Hardening → BUG-11, R-11, AC-9

> **Goal**: Ensure auto-rotation correctly resumes after ALL interaction types (drag, zoom, bird click).
> **Depends on**: Phases 1–19 (all v3 work complete).
> **Independent test**: Drag → release → wait 5s → globe resumes rotating. Repeat with scroll-zoom and bird-click.

- [x] **20.1** [P] In `src/components/three/CameraController.tsx`, add `wheel` event listener on `gl.domElement` (via `useThree`) that sets `controls.autoRotate = false` and updates `lastInteractionRef.current = Date.now()`. Clean up in `useEffect` return. (BUG-11, R-11)
- [x] **20.2** [P] In `src/components/three/CameraController.tsx`, add `touchmove` event listener on `gl.domElement` with the same logic as 20.1 for pinch-zoom tracking on mobile. (BUG-11, R-11)
- [x] **20.3** In `src/components/three/CameraController.tsx`, in the `useFrame` idle-rotation block, move `autoRotateSpeed` recalculation to run on every frame while auto-rotating (not just the re-enable frame): `controls.autoRotateSpeed = 1.0 * (DEFAULT_DISTANCE / camera.position.length())`. (R-11)
- [x] **20.4** In `src/components/three/CameraController.tsx`, when `selectedBirdId` transitions from non-null to null (bird deselect), explicitly set `lastInteractionRef.current = Date.now()` before starting the zoom-back animation. (BUG-11)
- [x] **20.5** Verify: drag globe → release → wait 5s → auto-rotation resumes at correct speed. (AC-9)
- [x] **20.6** Verify: scroll-zoom in/out → stop → wait 5s → auto-rotation resumes. (AC-9)
- [x] **20.7** Verify: click bird → close card → wait 5s → auto-rotation resumes. (AC-9)
- [x] **20.8** Verify: zoom in close → auto-rotation surface speed appears the same as when zoomed out. (AC-9)

---

## Phase 21: Camera Zoom Constraint → BUG-13, R-1, R-8, AC-1

> **Goal**: Prevent the camera from penetrating the globe surface.
> **Depends on**: Phase 20 (CameraController changes must be compatible).
> **Independent test**: Scroll-zoom as far in as possible — camera stops before entering the globe.

- [x] **21.1** In `src/components/three/CameraController.tsx`, add constant `MIN_CAMERA_DISTANCE = 1.15` alongside existing `DEFAULT_DISTANCE` and `ZOOM_DISTANCE`. (BUG-13)
- [x] **21.2** In `src/components/three/GlobeScene.tsx`, change `<OrbitControls minDistance={1.5}>` to `<OrbitControls minDistance={1.15}>`. (BUG-13)
- [x] **21.3** In `src/components/three/CameraController.tsx`, in the zoom-to-bird animation logic, clamp the target distance: `const targetDist = Math.max(ZOOM_DISTANCE, MIN_CAMERA_DISTANCE)`. (R-8)
- [x] **21.4** Verify: scroll-zoom as far in as possible → camera stops at ~1.15, globe surface not penetrated. (AC-1)
- [x] **21.5** Verify: click bird → zoom-to-bird → camera stops at 1.8 (above 1.15). No visual glitches. (AC-7)
- [x] **21.6** Verify: no inverted normals or disappearing textures at maximum zoom. (AC-1)

---

## Phase 22: Atmosphere Redesign → BUG-9, R-1, R-9, AC-1

> **Goal**: Remove the blue ring artifact and replace with a clean rim glow on the globe material.
> **Depends on**: Phase 21 (camera constraints must be in place to verify at all zoom levels).
> **Independent test**: Rotate globe at all zoom levels — no blue ring or hard-edged band visible.

- [x] **22.1** Delete `src/components/three/Atmosphere.tsx`. (BUG-9)
- [x] **22.2** In `src/components/three/GlobeScene.tsx`, remove the `<Atmosphere />` import statement. (BUG-9)
- [x] **22.3** In `src/components/three/GlobeScene.tsx`, remove the `<Atmosphere />` JSX element from the render tree. (BUG-9)
- [x] **22.4** In `src/components/three/Globe.tsx`, replace `meshStandardMaterial` with a `MeshStandardMaterial` that uses `onBeforeCompile` to inject rim-glow GLSL into the fragment shader after `#include <output_fragment>`. Inject: `float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 5.0); gl_FragColor.rgb += vec3(0.4, 0.6, 1.0) * rim * 0.2;`. (R-1)
- [x] **22.5** In `src/components/three/Globe.tsx`, set `material.needsUpdate = true` after the `onBeforeCompile` modification to ensure the shader recompiles. (R-1)
- [x] **22.6** Tune the rim-glow exponent (try 4.0–6.0) and intensity multiplier (try 0.15–0.25) until the glow is subtle and artifact-free at all zoom levels. (R-9)
- [x] **22.7** Verify: no blue ring or hard-edged band at zoom distances 1.15 to 5.0. (AC-1)
- [x] **22.8** Verify: subtle atmospheric glow visible at the globe edge from default distance (2.5). (AC-1)
- [x] **22.9** Verify: glow fades gracefully — no abrupt transitions when rotating or zooming. (AC-1)
- [x] **22.10** Fallback: if rim glow still produces artifacts after tuning, set intensity to 0 (remove glow entirely) and rely on cloud layer + lighting. (R-1)
- [x] **22.11** Run `npx tsc --noEmit` — zero errors after Atmosphere removal. (AC-1)

---

## Phase 23: Migration Arc Height Reduction → BUG-14, R-12, AC-10

> **Goal**: Make migration paths follow the globe surface closely with natural-looking arcs.
> **Depends on**: None (independent of phases 20–22, can run in parallel).
> **Independent test**: Migration arcs hug the globe — peak height ~0.05–0.10 above surface, no clipping.

- [x] **23.1** In `src/utils/migration.ts`, change the arc height formula from `Math.min(0.4, Math.max(0.15, angularDistance * 0.3))` to `Math.min(0.12, Math.max(0.03, angularDistance * 0.04))`. (BUG-14, R-12)
- [x] **23.2** In `src/utils/migration.ts`, compute the number of intermediate control points: `const numPoints = Math.min(7, Math.max(3, Math.floor(angularDistance / 0.3)))`. (R-12)
- [x] **23.3** In `src/utils/migration.ts`, replace the single-midpoint curve construction with a multi-point approach: generate `numPoints` control points evenly spaced along the great-circle arc between `from` and `to`, each at radius `globeRadius + arcHeight`. Use `Vector3.lerpVectors` + normalize + scale for each intermediate point. (R-12)
- [x] **23.4** In `src/utils/migration.ts`, create the `CatmullRomCurve3` with the full array of control points (not just 3) and sample 64 points as before. (R-12)
- [x] **23.5** In `src/utils/migration.ts`, verify all control points have radius ≥ `globeRadius + 0.01` to prevent clipping. (R-12)
- [x] **23.6** Verify: migration arcs hug the globe surface — peak height ~0.05–0.10 above surface. (AC-10)
- [x] **23.7** Verify: short-distance arcs (same continent) are visibly lower than cross-continental arcs. (AC-10)
- [x] **23.8** Verify: no curve clips through the Earth sphere at any point — rotate globe to check all paths. (AC-10)
- [x] **23.9** Verify: curves follow the globe's curvature — no straight chords visible for long routes. (AC-10)
- [x] **23.10** Verify: dash animation still flows smoothly along the lower curves. (AC-10)

---

## Phase 24: 3D Bird Models → R-3, BUG-10, R-9, AC-2

> **Goal**: Replace golden sphere markers with 3D GLTF bird models oriented outward from the globe.
> **Depends on**: Phase 22 (Atmosphere removal must be done so GlobeScene imports are clean).
> **Independent test**: 15 small 3D birds visible on globe, facing outward, warm glow, hover interaction works.

### Setup

- [x] **24.1** Source a low-poly stylized bird model in GLB format (<50 KB, single mesh, CC0 licensed). Options: Kenney Nature Kit, Quaternius low-poly animals, or create in Blender (~200 triangles). (R-3)
- [x] **24.2** Save the bird model to `public/models/bird.glb`. (R-3)
- [x] **24.3** In `src/store.ts`, add `modelsReady: boolean` field (default `false`) and `setModelsReady: (ready: boolean) => void` action to the Zustand store. (R-9)

### BirdMarker Rewrite

- [x] **24.4** In `src/components/three/BirdMarker.tsx`, add `useGLTF.preload('/models/bird.glb')` at module level (outside the component) to start loading immediately. (R-3)
- [x] **24.5** In `src/components/three/BirdMarker.tsx`, call `const gltf = useGLTF('/models/bird.glb')` inside the component and extract the first mesh's geometry: `const geometry = (gltf.scene.children[0] as THREE.Mesh).geometry`. (R-3)
- [x] **24.6** In `src/components/three/BirdMarker.tsx`, replace the `sphereGeometry` + `MeshPhongMaterial` with a `<mesh>` using the extracted GLTF geometry and a new `MeshStandardMaterial`: `color: 0xFFB347`, `emissive: 0x332200`, `emissiveIntensity: 0.5`, `metalness: 0.2`, `roughness: 0.6`. (R-3)
- [x] **24.7** In `src/components/three/BirdMarker.tsx`, set mesh scale to `[0.03, 0.03, 0.03]`. (R-3)

### Orientation

- [x] **24.8** In `src/components/three/BirdMarker.tsx`, compute the surface-normal quaternion for each bird: `const normal = new Vector3(...position).normalize(); const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), normal);` and apply it to the mesh. (R-3)
- [x] **24.9** Verify: all 15 bird models face outward from the globe surface (perpendicular to the sphere at their lat/lng). (AC-2)

### Animation & Interaction

- [x] **24.10** In `src/components/three/BirdMarker.tsx`, replace the pulse scale animation with a bob animation: in `useFrame`, offset the mesh position along the surface normal by `0.005 * Math.sin(clock.elapsedTime * Math.PI + phaseOffset)`. (R-3)
- [x] **24.11** In `src/components/three/BirdMarker.tsx`, update hover interaction: on `pointerOver`, lerp scale to `1.4×` and set `emissiveIntensity` to `1.5`. On `pointerOut`, lerp back to `1.0×` scale and `0.5` emissive intensity. Use a ref + `useFrame` lerp (~200ms transition). (R-3)
- [x] **24.12** Verify: hover produces a smooth scale-up and visible glow effect. (AC-2)

### Fallback & Loading

- [x] **24.13** In `src/components/three/BirdMarker.tsx`, add a fallback: if GLTF geometry is unavailable (loading error), render the v3 golden sphere (`sphereGeometry(0.015)` + `MeshPhongMaterial(color: 0xFFD700, emissive: 0x444444)`) with pulse animation. (R-3)
- [x] **24.14** In `src/components/three/BirdMarker.tsx` or `GlobeScene.tsx`, call `setModelsReady(true)` once `useGLTF` has successfully loaded the bird model. (R-9)
- [x] **24.15** In `src/components/ui/LoadingScreen.tsx`, update the dismiss condition from `globeReady` to `globeReady && modelsReady`. (R-9)

### Verification

- [x] **24.16** Verify: 15 bird models visible on the globe as small 3D birds (not yellow dots or golden spheres). (AC-2)
- [x] **24.17** Verify: models are warm-toned and visible against both land and ocean textures. (AC-2)
- [x] **24.18** Verify: models rotate with the globe (children of earth group). (AC-2)
- [x] **24.19** Verify: click on bird model → info card opens → camera zooms → audio plays. (AC-3, AC-7)
- [x] **24.20** Verify: loading screen waits for bird model to load before dismissing. (AC-6)
- [x] **24.21** Verify: if `bird.glb` is deleted/unreachable, golden sphere fallback renders instead. (AC-2)

---

## Phase 25: Final Verification (v4) → AC-1 through AC-10

> **Goal**: End-to-end validation of all v4 changes working together.
> **Depends on**: Phases 20–24 all complete.

- [x] **25.1** Run `npx tsc --noEmit` — zero TypeScript errors.
- [x] **25.2** Run `npm run build` — production build succeeds with no warnings.
- [x] **25.3** Visual: globe renders with subtle rim glow, no blue ring artifact at any zoom level (1.15–5.0). (AC-1)
- [x] **25.4** Visual: cloud layer visible, drifts slowly. (AC-1)
- [x] **25.5** Visual: 15 bird models visible as small 3D birds, oriented outward, warm glow. (AC-2)
- [x] **25.6** Visual: hover on bird → scale up + glow. Click → card + zoom + audio. (AC-2, AC-3, AC-7)
- [x] **25.7** Visual: 3+ migration path curves with low arcs following the globe surface. (AC-10)
- [x] **25.8** Visual: dash animation flows along curves. (AC-10)
- [x] **25.9** Interaction: camera cannot zoom through the globe — stops at 1.15. (AC-1)
- [x] **25.10** Interaction: drag → release → wait 5s → auto-rotation resumes. (AC-9)
- [x] **25.11** Interaction: scroll-zoom → stop → wait 5s → auto-rotation resumes. (AC-9)
- [x] **25.12** Interaction: click bird → close card → wait 5s → auto-rotation resumes. (AC-9)
- [x] **25.13** Interaction: auto-rotation speed consistent at all zoom levels. (AC-9)
- [x] **25.14** Interaction: language toggle switches all text. (AC-5)
- [x] **25.15** Responsive: works at 375px, 768px, and 1920px widths. (AC-6)
- [x] **25.16** Loading: loading screen waits for both Earth texture and bird model. (AC-6)

---

## Summary

| Phase | Tasks | Covers |
|-------|-------|--------|
| 1. Scaffold ✅ | 1.1 – 1.10 | Project setup, dependencies, file structure |
| 2. Globe ✅ | 2.1 – 2.7 | R-1, AC-1 |
| 3. Birds ✅ | 3.1 – 3.15 | R-2, R-3, AC-2 |
| 4. Card + i18n ✅ | 4.1 – 4.12 | R-4, R-6, AC-3, AC-5 |
| 5. Audio ✅ | 5.1 – 5.7 | R-5, AC-4 |
| 6. Polish ✅ | 6.1 – 6.10 | AC-6 |
| 7. Bug Fixes ✅ | 7.1 – 7.16 | BUG-1 through BUG-6, AC-2, AC-4, AC-6 |
| 8. Camera Zoom ✅ | 8.1 – 8.14 | R-8, AC-7 |
| 9. Visual Polish ✅ | 9.1 – 9.17 | R-9, AC-1, AC-6 |
| 10. Rich Data ✅ | 10.1 – 10.14 | R-10, BUG-8, AC-8 |
| 11. ⚡ Auto-Rotation Fix ✅ | 11.1 – 11.8 | BUG-11, R-11, AC-9 |
| 12. Blue Halo Fix ✅ | 12.1 – 12.6 | BUG-9, R-1, AC-1 |
| 13. Golden Markers ✅ | 13.1 – 13.7 | BUG-10, R-3, AC-2 |
| 14. Globe Co-Rotation ✅ | 14.1 – 14.5 | BUG-12, AC-2 |
| 15. Bird Data Overhaul ✅ | 15.1 – 15.16 | R-2, R-10, AC-8 |
| 16. Cloud Layer ✅ | 16.1 – 16.5 | R-1, AC-1 |
| 17. Migration Paths ✅ | 17.1 – 17.15 | R-12, AC-10 |
| 18. Audio + Docs ✅ | 18.1 – 18.4 | R-5, R-10 |
| 19. Final Verification ✅ | 19.1 – 19.11 | AC-1 through AC-10 |
| 20. Auto-Rotation Hardening ✅ | 20.1 – 20.8 | BUG-11, R-11, AC-9 |
| 21. Camera Zoom Constraint ✅ | 21.1 – 21.6 | BUG-13, R-1, R-8, AC-1 |
| 22. Atmosphere Redesign ✅ | 22.1 – 22.11 | BUG-9, R-1, R-9, AC-1 |
| 23. Migration Arc Reduction ✅ | 23.1 – 23.10 | BUG-14, R-12, AC-10 |
| 24. 3D Bird Models ✅ | 24.1 – 24.21 | R-3, BUG-10, R-9, AC-2 |
| 25. Final Verification (v4) ✅ | 25.1 – 25.16 | AC-1 through AC-10 |
| **Total** | **266 tasks** | **266 complete, 0 remaining** |

---

## Dependencies & Execution Order (v4)

### Phase Dependencies

- **Phase 20 (Auto-Rotation)**: No dependencies on other v4 phases — can start immediately.
- **Phase 21 (Camera Constraint)**: Depends on Phase 20 (CameraController changes must be compatible).
- **Phase 22 (Atmosphere)**: Depends on Phase 21 (need camera constraints to verify at all zoom levels).
- **Phase 23 (Migration Arcs)**: **Independent** — can run in parallel with Phases 20–22.
- **Phase 24 (3D Bird Models)**: Depends on Phase 22 (GlobeScene imports must be clean after Atmosphere removal).
- **Phase 25 (Final Verification)**: Depends on all of Phases 20–24.

### Parallel Opportunities

```
Phase 20 (Auto-Rotation) ──┐
                            ├──→ Phase 21 ──→ Phase 22 ──→ Phase 24 ──┐
Phase 23 (Migration Arcs) ─┼─────────────────────────────────────────┤──→ Phase 25
                            │                                          │
                            └── (independent, runs in parallel) ───────┘
```

Within phases:
- **Phase 20**: Tasks 20.1 and 20.2 are [P] (different event listeners, same file but independent additions).
- **Phase 22**: Tasks 22.1–22.3 (delete Atmosphere) can run before 22.4–22.5 (add rim glow to Globe).
- **Phase 24**: Tasks 24.1–24.3 (setup) are [P]. Tasks 24.8–24.9 (orientation) are independent of 24.10–24.11 (animation).

### Implementation Strategy

**Recommended order** (sequential, single developer):
1. Phase 20 → Phase 21 → Phase 22 (camera + atmosphere fixes, 25 tasks)
2. Phase 23 (migration arcs, 10 tasks — can overlap with step 1)
3. Phase 24 (3D bird models, 21 tasks)
4. Phase 25 (final verification, 16 tasks)

**Parallel strategy** (two developers):
- Developer A: Phase 20 → 21 → 22 → 24
- Developer B: Phase 23 (then assist with Phase 24 verification)
- Both: Phase 25
