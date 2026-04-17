# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b (strict type check) + vite build → dist/
npm run preview   # Preview production build
```

No test runner is configured — the build pipeline is the type check + compile. Treat `npm run build` as the quality gate.

Node **20.19+ or 22.12+** is required (Vite 8 constraint). If shell invokes the wrong node, check `.nvmrc` (target 22).

Deploy target is Cloudflare Pages via `wrangler.jsonc` (assets served from `./dist`).

## Architecture

### Single-Canvas + HTML Overlay Layers

`src/App.tsx` mounts exactly one `<Canvas>` (R3F) plus a stack of `fixed inset-0` HTML layers ordered by CSS variables (`--z-globe`, `--z-sidebar`, `--z-bottom-panel`, `--z-card`, `--z-modal`, `--z-overlay`). Every UI panel is unconditionally rendered into the DOM and hidden/shown by two mechanisms:

1. `ModeGate` (`src/components/ui/ModeGate.tsx`) — gates by `appMode`, which is one of `"explore" | "migration" | "learning"` (see `src/types.ts`).
2. The panel's own open/close state in the Zustand store.

When adding a panel, wrap it in the right `<ModeGate modes={[...]}>` block in `App.tsx`. Don't unmount panels conditionally — they rely on store-driven visibility.

### State: one Zustand store composed of 12 slices

`src/store/` is the single source of truth. **Do not add Context providers or second stores** — `ai/gstack.yaml` explicitly forbids it. The contract is one `useAppStore` hook whose type is `AppStore` (intersection of all slice shapes).

- `src/store/index.ts` — 30-line composition: `create<AppStore>()((...a) => ({ ...createCoreSlice(...a), ... }))`.
- `src/store/types.ts` — `AppStore` interface and `PanelType` union. Source of truth for the public store type.
- `src/store/persistence.ts` — storage-key constants, `loadFromStorage` / `saveToStorage`, `loadMissions`. Every `kids-bird-globe-*` localStorage key lives here.
- `src/store/slices/*Slice.ts` — one file per cohesive subsystem. Each exports `XxxSlice` interface and `createXxxSlice: StateCreator<AppStore, [], [], XxxSlice>`.

Current slices: `core`, `discovery`, `progression` (6 progression subsystems — quests, dailyMissions, achievements, expeditions, learningTracks, discoveryMissions), `photo`, `quiz`, `sound`, `tour`, `story`, `aiGuide`, `ecosystem`, `migration`, `specialModes` (classroom + sandbox + AR).

**Cross-slice reads**: actions call `get().otherSliceAction()` — `get()` returns the full merged store. Never import one slice's creator from another slice; depend only on the `AppStore` type.

**When adding state**: put the field + its actions in the most cohesive existing slice; don't widen `AppStore` directly. TypeScript enforces that every `AppStore` field appears in exactly one slice interface.

Other store rules:
- Selectors should be narrow: `useAppStore((s) => s.someField)`.
- Panel open/close state lives in the store, not in parent components.

### Layered source tree

```
src/
├── core/        Engine, SceneManager, CameraController, TimeController, AnimationScheduler
│                (low-level primitives; barrel export via core/index.ts)
├── systems/     Pure TS game logic modules — no React, no store access
│                (Flocking, Bird, Weather, Migration, Ecosystem, LearningTrack, …)
│                All exported via systems/index.ts barrel.
├── domain/      Static data definitions (flock-config, migration-paths)
├── features/    Feature-coupled services (BirdGuideService, BirdDataLoader,
│                KnowledgeService, ai-provider, tts-service)
├── components/
│   ├── three/   R3F scene components — must live inside <Canvas>
│   └── ui/      HTML overlay panels — live outside <Canvas>
├── render/      Specialized R3F renderers (MigrationFlockRenderer, SeasonOverlay)
├── hooks/       useAudio, useNarration
├── utils/       coordinates, migration helpers, bird model loading
├── store/       One Zustand store composed of 12 slices (see store/slices/)
└── types.ts     Central type module (AppMode, Bird, Season, …)
```

**Rule of thumb**: pure logic → `systems/`; data tables → `domain/`; stateful service with side effects → `features/`; anything with JSX → `components/` or `render/`.

### Data pipeline

- `src/data/birds.json` — monolithic bird list (primary source).
- `src/data/birds/regions/*.json` — regional shards, loaded on demand via `features/BirdDataLoader.ts`.
- `src/data/{missions,achievements,expeditions,learning-tracks,bird_facts}.json` — static gameplay data.
- `public/{textures,models,images,data}/` — runtime-fetched assets.

### 3D performance model (LOD tiers)

Birds render in one of three tiers depending on camera distance, tuned by FPS:
1. Particles (`BirdParticles`) — far
2. Instanced meshes (`InstancedBirdMarkers`, `FlockRenderer`) — mid
3. Full `BirdMarker` (GLTF) — near

Module-scope `THREE.BufferGeometry` / `Material` in renderers (e.g. `FlockRenderer.tsx`) are intentional — shared for the app lifetime, do not dispose.

### Hidden interactions

- `AppTitle` in `App.tsx` has a **3-second long-press** that toggles classroom mode. Don't "fix" this — it's an intentional teacher-only entry point.

## Spec-Kit Workflow

This repo drives feature work through [spec-kit](https://github.com/github/spec-kit) (v0.3.0). See `AGENT.md` and `ai/INTEGRATION.md`.

**Never write code during `/speckit.spec`, `/speckit.plan`, or `/speckit.tasks` stages** — those stages only produce markdown under `specs/{feature}/`. Code writes happen only during `/speckit.implement`.

Active feature directory: `specs/kids-bird-globe/` (`spec.md`, `plan.md`, `tasks.md`).

## Conventions

From `ai/gstack.yaml` (these are project rules, not generic advice):

- TypeScript strict mode is non-negotiable; `tsc -b` is part of `npm run build`.
- Functional React components with hooks — no class components.
- Tailwind CSS v4 utility classes; avoid inline `style` except for CSS variables (`--z-*`, `--safe-area`) and dynamic values.
- Three.js access must go through `@react-three/fiber` / `@react-three/drei` — don't instantiate a renderer yourself.
- Before renaming/deleting anything under `src/components/`, confirm it isn't referenced by `App.tsx` mode-gated trees.
- `index.html`, `vite.config.ts`, `tsconfig.json`, `.specify/`, `.cursor/commands/` require explicit user confirmation before modification.
