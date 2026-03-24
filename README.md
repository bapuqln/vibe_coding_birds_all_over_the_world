# Kids Bird Globe (万羽拾音)

An interactive 3D globe web application that teaches children (ages 6-12) about birds around the world. Built with React, Three.js, and TypeScript.

## Features

### Core Experience
- **3D Globe Exploration** — Spin a realistic Earth, discover animated birds flying around their regions
- **Bird Discovery** — Click birds to learn about them, collect them into a personal album
- **Bird Encyclopedia** — Search, filter by continent/diet/wingspan, view detailed entries with 3D previews
- **Quests & Expeditions** — Complete discovery missions to earn badges and rewards
- **Story Mode** — Guided bird adventure stories with camera travel and narration

### Learning Tracks (v31)
Themed learning journeys children can follow to discover birds systematically:
- **Birds of Prey** — Eagles, hawks, owls, and other powerful hunters
- **Ocean Birds** — Penguins, albatross, puffins, and coastal species
- **Rainforest Birds** — Toucans, macaws, parrots, and tropical species
- **Migratory Birds** — Arctic terns, swallows, and long-distance travelers
- **Colorful Birds** — Flamingos, peacocks, kingfishers, and vibrant species

Each track contains 5-10 birds. Discover all birds in a track to unlock a badge.

### AI Bird Guide (v31)
An interactive Q&A assistant for kids:
- Ask questions like "Why do birds migrate?" or "Why are flamingos pink?"
- RAG-like architecture with BirdGuideService, PromptBuilder, and ResponseRenderer
- Prewritten fallback answers from bird_facts.json when offline
- Speech bubble with typing animation and text-to-speech narration

### Ecosystem Simulation (v31)
Environmental simulation influencing bird behavior:
- Season cycle: spring, summer, autumn, winter
- Bird density shifts with seasons (more equatorial in winter)
- Temperature and wind affect bird animation
- Season indicator in HUD

### Habitat Filter (v31)
Filter birds by habitat type:
- Forest, Wetlands, Ocean, Grassland, Mountain, Urban
- Toggle filters in the sidebar
- Non-matching birds fade but remain visible for context

### Seasonal Migration Visualization (v31)
Upgraded migration arc system:
- Migration paths appear only during migration seasons (autumn/spring)
- Glowing arc lines with directional particle flow
- Particles move in the direction of migration
- Integrated with ecosystem simulation

### Data Expansion (v31)
Prepared for larger datasets with lazy loading:
- Regional JSON files (asia.json, europe.json, americas.json)
- BirdDataLoader supports on-demand loading
- Backward compatible with monolithic birds.json

### Additional Features
- **Flocking System** — Boids algorithm for natural bird movement
- **Day/Night Cycle** — Real-time lighting with city lights
- **Weather System** — Cloud clusters, rain, storms per region
- **AR Mode** — View birds in augmented reality
- **Photo Mode** — Capture and save bird photos
- **Classroom Mode** — Teacher controls for educational use
- **Sandbox Mode** — Free-form bird spawning and exploration

## Tech Stack

- **React** + **TypeScript**
- **Three.js** via **@react-three/fiber** and **@react-three/drei**
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Vite** for build tooling

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── core/           Engine, SceneManager, CameraController
├── systems/        BirdSystem, MigrationSystem, EcosystemSystem, LearningTrackSystem, ...
├── features/       BirdGuideService, HabitatFilter, SeasonController, MigrationVisualizer, BirdDataLoader
├── components/
│   ├── three/      Globe, BirdMarker, MigrationPaths, ...
│   └── ui/         TrackPanel, AIBirdGuidePanel, Encyclopedia, ...
├── data/           birds.json, learning-tracks.json, bird_facts.json, birds/regions/
├── hooks/          useAudio, useNarration
└── utils/          birdModelLoader, coordinates, migration, ...
```

## Performance

- 60 FPS target on mid-range hardware
- InstancedMesh for distant birds
- LOD system: particles (far) → instanced meshes (mid) → full 3D model (near)
- Dynamic LOD tuning based on FPS
- Lazy loading for models, textures, and regional data
