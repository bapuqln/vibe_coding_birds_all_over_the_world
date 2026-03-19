# 万羽拾音 (Kids Bird Globe) — Implementation Plan (v5)

> **v5 changelog**: Fix OrbitControls target lock to [0,0,0], replace low-quality bird model, fix useGLTF hooks violation, add country borders via GeoJSON, add zoom-dependent map labels, improve lighting with hemisphere light, improve atmosphere with Fresnel shell, enforce declarative R3F patterns throughout.

## High-Level Architecture

```
App.tsx
├── Canvas (camera, background)
│   └── Suspense
│       └── GlobeScene
│           ├── Lighting (ambient + directional + hemisphere)
│           ├── Starfield (Points + PointMaterial)
│           ├── AtmosphereShell (Fresnel BackSide sphere)
│           ├── group (earth group — all children rotate together)
│           │   ├── Globe (textured sphere + rim glow)
│           │   ├── CloudLayer (semi-transparent sphere)
│           │   ├── CountryBorders (GeoJSON line segments)
│           │   ├── BirdMarker × 15 (GLTF models)
│           │   └── MigrationPaths
│           │       └── MigrationArc × N
│           ├── MapLabels (Html elements, zoom-dependent)
│           ├── CameraController (useFrame animation)
│           └── OrbitControls (target=[0,0,0], locked)
├── LoadingScreen
├── AppTitle
├── LangToggle
├── BirdInfoCard
└── AudioPlayer
```

## Key Technical Decisions (v5)

### TD-25: OrbitControls target locked to [0,0,0]
**Problem**: v4 CameraController lerps `controls.target` toward bird position, causing rotation pivot drift.
**Solution**: Never modify `controls.target`. Camera zoom-to-bird only changes camera position (direction + distance). Remove all `controls.target.lerp()` calls. OrbitControls target prop is `[0, 0, 0]` and never changes.

### TD-26: Declarative R3F patterns
**Problem**: v4 uses imperative patterns (try-catch around hooks, `new Material()` in useMemo, `primitive object=`).
**Solution**: Use declarative JSX for materials and geometry. Use `<meshStandardMaterial>` instead of `new MeshStandardMaterial()`. Use `<Suspense>` + error boundaries for loading states. Call hooks unconditionally.

### TD-27: Atmosphere as Fresnel shell
**Problem**: v4 `onBeforeCompile` rim glow is fragile and hard to tune.
**Solution**: Dedicated `<AtmosphereShell>` component — a BackSide sphere at scale 1.025 with custom ShaderMaterial using smooth Fresnel falloff (exponent 3.0, opacity 0.15, additive blending).

### TD-28: Country borders via GeoJSON
**Problem**: Globe has no geographic reference points.
**Solution**: Load simplified Natural Earth GeoJSON (110m resolution). Project coordinates to 3D at radius 1.001. Render as `<Line>` segments from drei. Thin, semi-transparent white lines.

### TD-29: Zoom-dependent map labels
**Problem**: No continent/ocean names on globe.
**Solution**: Use `<Html>` from drei positioned at continent/ocean centers. Visibility controlled by camera distance (< 2.0). Opacity fades smoothly. Bilingual text from language store.

### TD-30: Improved lighting
**Problem**: Flat lighting (ambient 0.4 + two directionals) lacks depth.
**Solution**: Reduce ambient to 0.3, add `<hemisphereLight>` for sky-ground gradient, keep directionals for sun/fill.

### TD-31: Higher-quality bird model
**Problem**: Generated bird.glb is crude geometric shapes.
**Solution**: Source a quality stylized bird GLB from free asset library or create a proper one. Must look recognizable at 0.03 scale.

## Component Changes

### New Components
- `<AtmosphereShell />` — Fresnel atmosphere with custom ShaderMaterial
- `<CountryBorders />` — GeoJSON country boundary lines
- `<MapLabels />` — Zoom-dependent continent/ocean labels using Html

### Modified Components
- `<GlobeScene />` — Add new components, improve lighting, lock OrbitControls target
- `<CameraController />` — Remove target lerping, only animate camera position
- `<BirdMarker />` — Fix hooks violation, use Suspense pattern, declarative materials
- `<Globe />` — Remove onBeforeCompile, use declarative meshStandardMaterial
- `<MigrationPaths />` — Refactor to use great-circle slerp interpolation

### Removed
- `onBeforeCompile` rim glow in Globe.tsx (replaced by AtmosphereShell)

## State Management

Zustand store additions:
```typescript
interface AppStore {
  // existing...
  selectedBirdId: string | null;
  language: Language;
  audioStatus: AudioStatus;
  globeReady: boolean;
  modelsReady: boolean;
  // no new state needed for v5 — labels use camera distance from useThree
}
```

## Data Files

### New: `public/data/countries-110m.json`
Simplified Natural Earth GeoJSON (110m resolution). Contains country boundary MultiLineString/Polygon geometries. ~200 KB uncompressed.

### New: `src/data/labels.ts`
Static data for continent and ocean label positions:
```typescript
export const continentLabels = [
  { id: "asia", lat: 34, lng: 100, nameZh: "亚洲", nameEn: "Asia" },
  { id: "europe", lat: 54, lng: 15, nameZh: "欧洲", nameEn: "Europe" },
  { id: "africa", lat: 2, lng: 20, nameZh: "非洲", nameEn: "Africa" },
  { id: "north-america", lat: 45, lng: -100, nameZh: "北美洲", nameEn: "North America" },
  { id: "south-america", lat: -15, lng: -60, nameZh: "南美洲", nameEn: "South America" },
  { id: "oceania", lat: -25, lng: 135, nameZh: "大洋洲", nameEn: "Oceania" },
  { id: "antarctica", lat: -82, lng: 0, nameZh: "南极洲", nameEn: "Antarctica" },
];

export const oceanLabels = [
  { id: "pacific", lat: 0, lng: -160, nameZh: "太平洋", nameEn: "Pacific Ocean" },
  { id: "atlantic", lat: 0, lng: -30, nameZh: "大西洋", nameEn: "Atlantic Ocean" },
  { id: "indian", lat: -20, lng: 75, nameZh: "印度洋", nameEn: "Indian Ocean" },
  { id: "arctic", lat: 80, lng: 0, nameZh: "北冰洋", nameEn: "Arctic Ocean" },
  { id: "southern", lat: -65, lng: 0, nameZh: "南冰洋", nameEn: "Southern Ocean" },
];
```

## Implementation Phases

### Phase 26: Fix OrbitControls Target Lock
1. In `CameraController.tsx`, remove all `controls.target.lerp()` calls.
2. In `CameraController.tsx`, zoom-to-bird only animates camera position direction + distance.
3. In `GlobeScene.tsx`, add `target={[0, 0, 0]}` prop to `<OrbitControls>`.
4. Verify: click bird → zoom → close → manual rotation pivots around globe center.

### Phase 27: Improve Lighting
1. In `GlobeScene.tsx`, update lighting setup:
   - `<ambientLight intensity={0.3} />`
   - `<hemisphereLight skyColor="#b1e1ff" groundColor="#000000" intensity={0.4} />`
   - Keep directional lights, adjust intensities.
2. Verify: globe has natural depth, not flat.

### Phase 28: Replace Atmosphere with Fresnel Shell
1. Create `src/components/three/AtmosphereShell.tsx` with custom ShaderMaterial.
2. In `Globe.tsx`, remove `onBeforeCompile` and `useMemo` material — use declarative `<meshStandardMaterial>`.
3. In `GlobeScene.tsx`, add `<AtmosphereShell />` outside the earth group.
4. Verify: soft atmospheric glow, no hard edges at any zoom level.

### Phase 29: Fix BirdMarker Hooks & Declarative Pattern
1. Rewrite `BirdMarker.tsx` — call `useGLTF` unconditionally (no try-catch).
2. Use `<Suspense>` boundary in `GlobeScene.tsx` around bird markers for loading.
3. Use declarative `<meshStandardMaterial>` instead of `new MeshStandardMaterial()`.
4. Verify: no React hooks warnings, fallback renders during loading.

### Phase 30: Replace Bird Model
1. Source or create a quality stylized bird GLB.
2. Replace `public/models/bird.glb`.
3. Verify: birds look recognizable and appealing at 0.03 scale.

### Phase 31: Improve Migration Paths
1. In `migration.ts`, use spherical linear interpolation (slerp) for control points.
2. Verify: arcs follow great-circle paths, hug globe surface.

### Phase 32: Add Country Borders
1. Download simplified Natural Earth GeoJSON.
2. Create `src/components/three/CountryBorders.tsx`.
3. Project GeoJSON coordinates to 3D sphere.
4. Render as line segments at radius 1.001.
5. Verify: borders visible, thin, semi-transparent, no performance issues.

### Phase 33: Add Map Labels
1. Create `src/data/labels.ts` with continent/ocean positions.
2. Create `src/components/three/MapLabels.tsx` using `<Html>` from drei.
3. Implement zoom-dependent visibility (camera distance < 2.0).
4. Support bilingual display.
5. Verify: labels appear on zoom, fade smoothly, switch language.

### Phase 34: Final Verification
1. `npx tsc --noEmit` — zero errors.
2. `npm run build` — production build succeeds.
3. Visual verification of all acceptance criteria.
