# 万羽拾音 (Kids Bird Globe) — Feature Specification v20

> **v20 changelog**: Asset Quality & Exploration Upgrade — rebuilt build-bird-assets.mjs with significantly improved bird geometry (more anatomically accurate silhouettes with species-specific features, better wing shapes, proper body proportions, and enhanced detail for all 12 bird types), improved BirdMarker rendering to use full GLB scene clones with original materials instead of extracting only the first mesh geometry (preserving multi-mesh models and embedded materials), enhanced bird idle animation with dual-layer system (gentle wing flap via Y-scale sine wave + smooth vertical floating via normal-direction offset, both with per-bird phase offsets for natural variety), improved marker hover/click feedback with enhanced glow pulse and scale animations, strengthened UI layer structure with explicit z-index CSS custom properties and spacing tokens (xs=6px, sm=10px, md=16px, lg=24px), improved globe visuals with higher-resolution sphere geometry (80 segments), enhanced cloud layer opacity and rotation, improved atmosphere shell with refined Fresnel shaders for softer glow, improved camera fly-to with 1s smoothstep animation and gentle orbit after arrival, enhanced discovery notification with discovery counter and celebration animations, improved BirdInfoCard with 200px left margin on desktop to prevent sidebar overlap, added model preloading for all 12 bird GLB assets, maintained Draco compression support for GLB loading.
>
> **v19 changelog**: High-Quality Bird Models Upgrade — removed ALL procedurally generated bird geometry (scripts/generate-bird-models.mjs and its outputs), established proper asset pipeline with /public/models/birds/ for external GLB bird models, integrated high-quality stylized low-poly bird starter set (eagle, owl, parrot, penguin, flamingo, duck, sparrow, crow, toucan, peacock, woodpecker, seagull) loaded exclusively from GLB files via useGLTF with Draco compression support, standardized model scale normalization (1-unit bounding box with auto-scaling on load), added idle bird animation system (subtle wing flap + vertical sine-wave floating with 3–5s loop), improved bird markers with glowing ring base and soft hover glow, enhanced bird discovery interaction with "You discovered a new bird!" feedback and X/Total progress tracking, fixed UI layering with strict z-index hierarchy (globe 0, markers 5, sidebar 20, bottom panel 30, info card 60, modal 100), added safe layout margins (info card left: 200px on desktop), improved camera fly-to experience (~1s smooth animation stopping above bird marker), enabled DRACOLoader for compressed GLB loading, added visual polish with subtle floating sine-wave motion on all bird models.
>
> **v18 changelog**: Stability & Core Experience — fixed critical UI overlap where sidebar buttons covered bird info cards by enforcing strict z-index hierarchy (sidebar z-20, info card z-60) and adding sidebar collision avoidance (opacity reduction when card opens), replaced unrealistic procedural 3D bird geometry with stylized low-poly bird model featuring proper wings/tail/beak silhouette and slow wing-flap animation, improved bird marker visuals with glowing base circle and bird icon, enhanced bird info card with section titles (Habitat, Lifespan, Wingspan) and safe left margin (200px) to prevent sidebar collision, improved camera fly-to experience with ~1s smooth animation, added discovery glow pulse on bird click, added discovery counter display, reduced sidebar button width for cleaner layout, enforced consistent spacing tokens (xs=6px, sm=10px, md=16px, lg=24px) across all UI, ensured all panels respect safe margins and never overlap.
>
> **v17 changelog**: Game-Like Exploration Polish — enhanced daily mission panel with continent progress mini-bars and animated completion badges, bird photo mode upgraded with full-screen photo overlay including zoom slider and rotation controls, bird encyclopedia improved with continent section grouping and search filter, explorer achievement system enhanced with progress bars showing requirement completion percentage, discovery celebration upgraded with layered confetti + sparkle + glow pulse animation lasting 2.5s, bottom discovery panel now shows continent-level progress bars with color-coded regions, bird hint system improved with proximity-based pulse intensity and undiscovered bird flutter animation, exploration encouragement messages now rotate through suggestions, performance verified with all v17 features active at 60 FPS.
>
> **v16 changelog**: Game-Like Exploration Upgrade — daily bird discovery mission system with progress tracking and celebration animations, bird photo mode with camera freeze / zoom / rotate and local photo gallery, enhanced bird encyclopedia with discovered/locked entries and progress indicator, explorer achievement system with badges (First Discovery, Explorer, World Traveler, Bird Listener), improved discovery celebration with confetti burst and sparkle particles, continent exploration progress with hint animations and exploration encouragement messages, performance optimization with lazy loading for photos/models/sounds and 15-model limit enforcement.
>
> **v15 changelog**: Immersive Experience Upgrade — real-time day-night Earth rendering with dynamic sun-position lighting (bright day side, dark night side with city lights texture), atmospheric glow ring, cloud layer visible in both day and night, enhanced bird migration route visualization with Whooping Crane route added and glowing animated arcs with particle dots, AI bird narration system using Web Speech API (text-to-speech) with "Tell me about this bird" button and friendly child-oriented narration content, improved bird discovery experience with star-particle celebration animation and continent-level discovery progress UI, enhanced educational bird info card with scientific name / habitat / wingspan / lifespan / fun fact sections and wingspan comparison bar, improved camera fly-to experience with gentle orbit after arrival, performance optimization with 15-model limit fallback to icon markers and lazy loading for models/audio/textures and KTX2 compressed texture support.
>
> **v14 changelog**: Visual & Interaction Upgrade — glassmorphism design system (semi-transparent backgrounds, backdrop blur 20px, soft shadows, rounded corners), modern pill-shaped buttons with hover glow and scale effects, improved globe rendering (enhanced atmosphere glow, better cloud layer, rim lighting, higher-quality Fresnel shader), bird hover interactions (scale animation, soft glow, floating motion, styled tooltip), particle bird silhouettes flying around the globe, improved camera animation system (ease-in-out transitions, 1.2s duration), bottom discovery panel with progress bar, responsive panel layout improvements, rendering performance optimizations (lazy loading, compressed textures, model limits).
>
> **v13 changelog**: Global UI Layer System — unified z-index hierarchy (7 layers from canvas z-0 to overlay z-100), refactored App root into layered container architecture (GlobeLayer → MarkerLayer → SidebarLayer → BottomPanelLayer → CardLayer → ModalLayer → OverlayLayer), panel collision avoidance system (only one panel type active at a time), bird info card repositioned to right side to prevent overlap with bottom panels, responsive layout rules (desktop: sidebar+bottom+right card, tablet: collapsed sidebar+center modal, mobile: full-screen sheets), safe area padding (20px all sides), modal priority system with semi-transparent overlay blocking lower layers, smooth panel animations (slide-up 250ms for bottom, slide-right 250ms for side, scale-fade 250ms for modal).
>
> **v12 changelog**: Full-scope expansion — dataset expanded to 50+ birds with comprehensive global coverage, migration visualization with animated arc lines and moving dots for Arctic Tern / Bar-tailed Godwit / Swallow routes, bird distribution heatmap layer with blue-green-red density visualization and toggle button, AR bird viewing mode via WebXR with camera overlay and 3D model placement, enhanced bird animations (wing flap, hop, look-toward-camera, circle flight), performance optimization with model lazy loading (max 15 simultaneous 3D models), KTX2 texture compression, educational wingspan visualization bar, fun fact section redesign. All UI layout issues resolved with strict flex-column card structure, spacing tokens, tag wrapping, sidebar alignment, and glass-morphism design.
>
> **v11 changelog**: Full-scope upgrade — UI layout overhaul (strict flex-column card structure, zero-overlap enforcement, spacing tokens, tag row wrapping, sidebar button alignment, card scroll), 3D bird model system with GLTFLoader and LOD switching, bird dataset expansion to 40+ species across all continents, bird sound playback feature with xeno-canto integration and lazy-loaded audio, bird discovery and collection system with "New bird discovered!" notification, exploration progress system with continent-level tracking and progress bars, bird animation interactions (wing flap, lift, rotate-to-camera on click), performance optimizations (model lazy loading, visibility culling, texture compression, max 15 simultaneous 3D models), child-friendly design polish (glass-morphism cards, habitat/continent/lifespan tag colors, wingspan visualization bar, typography hierarchy).
>
> **v10 changelog**: Major upgrade — UI layout overhaul (strict flex-column card structure, spacing tokens, tag row wrapping, sidebar button alignment, card scroll), 3D bird model system with GLTFLoader and LOD (level-of-detail) switching, bird dataset expansion to 30+ species across all continents, bird sound playback feature with xeno-canto integration, performance optimizations (model lazy loading, visibility culling, texture compression), child-friendly design polish (glass-morphism cards, habitat/continent/lifespan tag colors, wingspan visualization bar).
>
> **v9 changelog**: Educational exploration expansion — migration mode with animated arcs, guided discovery tour, AI bird guide character, enhanced learning quiz, bird rarity system, bird radar, story-based themed exploration sets. New data fields: `rarity`, `migration_path`, `storyTheme`. New components: `MigrationModePanel`, `GuidedTour`, `BirdGuide`, `BirdRadar`, `StoryExplorer`.
>
> **v8 changelog**: Core interactive learning features — bird information card redesign as center-bottom modal, animated birds replacing static markers, bird collection system with localStorage, region filter with camera zoom, kid quest system with missions/badges, globe visual improvements (atmosphere glow, cloud layer, lighting), bird data model refactor with `latin_name`, `habitat`, `fun_fact`, `image`, `audio`, `migration_path`. Complete UI system overhaul — ActionButton component, right control panel, mobile safe areas, responsive layout, z-index hierarchy, bird tooltip, loading UI with progress, National Geographic Kids visual style.

## Goal

Build an interactive 3D globe web application that teaches children (ages 6–12) about birds around the world. The experience should feel like an **interactive science discovery game for kids** — similar to Google Earth + Natural History Museum + Discovery Game. Users spin a realistic globe, discover animated 3D birds flying around their regions, collect birds into a personal album, complete quests, take guided tours, listen to bird calls, view migration routes, explore bird diversity heatmaps, and even view birds in AR. The UI must be kid-friendly with rounded corners, playful colors, large icons, and readable fonts. Zero UI overlap, consistent layout, glass-morphism card design, and smooth 3D interaction are mandatory.

## User Stories

### US-1: Explore the Globe
As a child, I can drag to rotate and scroll to zoom a 3D Earth so that I feel like I'm exploring the real world.

### US-2: Discover Animated Birds
As a child, I can see animated 3D birds slowly flying around their regions on the globe, making the world feel alive.

### US-3: Learn About a Bird
As a child, I can click a bird to open an information card showing the bird's name, image, region, habitat, fun fact, sound playback button, and a collect button.

### US-4: Hear Bird Calls
As a child, I can play bird sounds from the info card to connect each bird to its call via a dedicated "Listen" button.

### US-5: Collect Birds
As a child, I can collect discovered birds into "My Birds" album that persists between sessions.

### US-6: Filter by Region
As a child, I can filter birds by continent/region, with the camera smoothly zooming to that region.

### US-7: Complete Quests
As a child, I can complete discovery missions like "Find 3 birds in Africa" to earn points and badges.

### US-8: Watch Migration Paths
As a child, I can enter migration mode to see animated arcs showing how birds travel across the globe, with glowing arc lines and moving dots along the path.

### US-9: Take a Guided Tour
As a child, I can start an automated tour that visits different regions and highlights special birds.

### US-10: Get Help from Bird Guide
As a child, I see a friendly AI guide character that gives me fun facts and learning prompts.

### US-11: Take Quizzes
As a child, I can answer quiz questions about birds with immediate feedback.

### US-12: Discover Rare Birds
As a child, I can find common, rare, and legendary birds — rare ones appear less frequently.

### US-13: Use Bird Radar
As a child, I can see a radar showing nearby birds in my current view.

### US-14: Explore Themed Stories
As a child, I can explore themed bird sets like "Rainforest Birds" or "Arctic Birds" and earn badges.

### US-15: See Bird Tooltips
As a child, when I hover over a bird I see its name and region as a tooltip.

### US-16: Switch Languages
As a user, I can toggle between Chinese and English.

### US-17: Navigate Intuitively
As a parent, I can hand the app to my child without explanation because the interface is self-evident.

### US-18: See 3D Bird Models
As a child, I see realistic 3D bird models on the globe that have idle animations and gentle floating motion.

### US-19: Listen to Bird Sounds
As a child, I can press a "Listen" button on the bird card to hear the bird's real call sound.

### US-20: Explore Many Birds (v12)
As a child, I can discover 50+ birds from every continent including South America, North America, Africa, Asia, Oceania, Europe, and polar regions.

### US-21: Discover New Birds
As a child, when I click a bird for the first time, I see a "New bird discovered!" celebration message and the bird is marked as discovered.

### US-22: Track Discovery Progress
As a child, I can see my global bird discovery progress (e.g. "12/50 Birds Found") and continent-level progress bars.

### US-23: View Bird Collection
As a child, I can open a collection screen showing all discovered birds and locked birds not yet discovered, motivating me to explore more.

### US-24: See Bird Click Animations (v12 enhanced)
As a child, when I click a bird marker, it plays a short animation — wings flap, bird hops, looks toward camera, and does a short circle flight.

### US-25: View Migration Routes (v12)
As a child, I can see animated migration routes for migratory birds like Arctic Tern, Bar-tailed Godwit, and Swallow, displayed as glowing arc lines with moving dots.

### US-26: View Bird Diversity Heatmap (v12)
As a child, I can toggle a "Bird Diversity Map" to see a heatmap overlay showing where birds are most concentrated, with blue (few) to red (many) colors.

### US-27: View Birds in AR (v12)
As a child, I can click "View in AR" to open my device camera and place a 3D bird model in my real environment, rotating and zooming it.

### US-28: Compare Wingspans (v12)
As a child, I can see a visual bar comparing different birds' wingspan sizes in the info card.

### US-29: See Day and Night on Earth (v15)
As a child, I can see the globe with realistic day and night regions based on the sun's position, with city lights glowing on the dark side, making the Earth feel alive.

### US-30: Hear Bird Narration (v15)
As a child, I can press "Tell me about this bird" to hear a friendly spoken narration about the bird, including where it lives, what it eats, and a fun fact.

### US-31: See Discovery Celebration (v15)
As a child, when I discover a new bird, I see a celebration animation with star particles and a "New Bird Discovered" message, making exploration feel rewarding.

### US-32: Track Continent Progress (v15)
As a child, I can see how many birds I've discovered on each continent with visual progress indicators like "Asia: 4/10 birds discovered".

### US-33: See Enhanced Bird Info (v15)
As a child, I can see detailed bird information including scientific name, habitat, wingspan comparison, lifespan, and fun facts in a beautifully designed card.

### US-34: Experience Smooth Camera Flight (v15)
As a child, when I click a bird, the camera smoothly flies to it in about 1.2 seconds and then gently orbits so I can see the bird clearly.

### US-35: Complete Daily Missions (v16)
As a child, I can see a set of daily discovery missions like "Find a bird in South America" or "Discover 2 new birds today", track my progress, and see a celebration animation when I complete a mission.

### US-36: Take Bird Photos (v16)
As a child, I can take a photo of a bird I discover by freezing the camera, zooming and rotating, then capturing the image to save in my photo gallery.

### US-37: Browse Bird Encyclopedia (v16)
As a child, I can open a bird encyclopedia that shows all birds with discovered entries unlocked and undiscovered entries locked, along with a progress indicator showing how many I've found.

### US-38: Earn Explorer Achievements (v16)
As a child, I can earn achievement badges like "First Discovery", "Explorer", "World Traveler", and "Bird Listener" that appear in my explorer profile panel.

### US-39: See Discovery Celebrations (v16)
As a child, when I discover a new bird I see a celebration with sparkle particles, confetti burst, and a "New Bird Discovered" message that makes exploration feel rewarding.

### US-40: Track Continent Progress (v16)
As a child, I can see my exploration progress for each continent and receive encouragement messages like "Try exploring South America. Many colorful birds live there."

### US-41: See Bird Hints (v16)
As a child, when I rotate the globe near a bird location, I see subtle hint animations like a marker pulse or small bird icon flutter that guide me to undiscovered birds.

### US-42: See Mission Continent Progress (v17)
As a child, I can see mini continent progress bars inside the daily missions panel, showing how close I am to completing region-specific missions.

### US-43: Use Photo Mode Overlay (v17)
As a child, when I enter photo mode I see a full-screen overlay with zoom slider and rotation controls so I can frame the bird perfectly before capturing.

### US-44: Search Bird Encyclopedia (v17)
As a child, I can search for birds by name in the encyclopedia and see them grouped by continent for easier browsing.

### US-45: See Achievement Progress (v17)
As a child, I can see progress bars on each achievement showing how close I am to unlocking it, motivating me to keep exploring.

### US-46: See Continent Progress Bars (v17)
As a child, I can see color-coded continent progress bars in the bottom discovery panel showing my exploration progress for each region.

### US-47: Get Rotating Exploration Tips (v17)
As a child, I see rotating exploration tip messages that suggest different continents and activities to keep me engaged.

## Requirements

### R-1: 3D Globe (React Three Fiber)
- Render a textured Earth sphere using NASA Blue Marble texture, radius `1.0`.
- Cloud layer at radius ~1.005.
- Atmosphere glow: Fresnel shell at scale 1.025, BackSide rendering, smooth falloff.
- Enhanced lighting with hemisphere light for natural illumination.
- Country borders via simplified GeoJSON.
- Zoom-dependent map labels (continent/ocean names).
- Dark parallax starfield background.
- Orbit controls with smooth damping.
- Responsive — fills viewport on desktop and mobile.

### R-2: Bird Data Model (v12 expanded)
- Each bird entry follows the enhanced data model:
```json
{
  "id": "",
  "nameZh": "",
  "pinyin": "",
  "nameEn": "",
  "scientificName": "",
  "lat": 0,
  "lng": 0,
  "region": "",
  "funFactZh": "",
  "funFactEn": "",
  "photoUrl": "",
  "xenoCantoQuery": "",
  "silhouette": "",
  "sizeCategory": "",
  "habitatType": "",
  "diet": "",
  "wingspan": "",
  "lifespan": "",
  "evolutionEra": "",
  "dietType": "",
  "wingspanCm": 0,
  "rarity": "common",
  "storyTheme": "",
  "soundUrl": "",
  "migration": false,
  "model": ""
}
```
- 50+ bird entries covering all major continents.
- Rarity field: `"common"`, `"rare"`, `"legendary"`.
- Story theme field for themed exploration sets.
- `soundUrl` field for direct audio playback.
- `migration` field indicating if bird is migratory.
- `model` field for custom 3D model path.

### R-3: Animated Bird Markers (v12 — enhanced animations)
- Use GLTFLoader to load 3D bird models in glTF/GLB format.
- Birds display small idle animation (wing flap) and slow floating motion with gentle rotation.
- Model scale: 0.2–0.3 relative to marker size.
- LOD system: show simple icon marker when camera is far, load 3D model when camera zooms closer.
- Clicking a bird temporarily pauses its movement.
- Hover shows tooltip with bird name and region.
- Click animation sequence: wing flap → short hop → look toward camera → short circle flight.
- Animations should feel playful and child-friendly.

### R-4: Bird Information Card (v12 design)
- Strict flex-column layout with no absolute positioning inside the card.
- Structure: ImageHeader → TitleSection → FunFact → TagRow → InfoGrid → ActionButtons.
- Spacing tokens: xs=6px, sm=10px, md=16px, lg=24px, xl=32px.
- Tag row: `display: flex; flex-wrap: wrap; gap: 8px;` — tags wrap instead of overflowing.
- Card: `max-height: 80vh; overflow-y: auto;` — content scrolls, never overflows.
- Glass-morphism: `border-radius: 20px; soft shadow; semi-transparent background; backdrop-filter: blur`.
- Tag colors: continent=blue, habitat=green, lifespan=orange.
- Typography hierarchy: bird Chinese name large bold, English name medium, pinyin small subtle.
- Bird sound playback button with "Listen" label.
- "Collect Bird" button with sparkle animation.
- Close button and click-outside-to-dismiss.
- Springy slide-up animation.
- Must not overlap with sidebar or right control panel.
- Fun Fact section: short and exciting with "Did you know?" prompt.
- Wingspan visualization bar comparing sizes.

### R-5: Bird Collection System (v12 enhanced)
- Clicking "Collect" saves bird to localStorage.
- "My Birds" panel shows collected birds with image and name.
- Works like a bird discovery album.
- Persists across browser sessions.
- Visual feedback on collection (sparkle animation).
- First-time discovery shows "New bird discovered!" notification.
- Collection screen shows discovered birds and locked/undiscovered birds.
- Progress display: "12 / 50 birds discovered".

### R-6: Region Filter
- Filter controls for: All Birds, North America, South America, Europe, Africa, Asia, Oceania, Antarctica.
- When selected: camera smoothly zooms to region center.
- Only birds in that region appear (others fade out).
- Region filter UI in the right control panel.

### R-7: Kid Quest System
- Simple discovery missions.
- Example quests: "Find 3 birds in Africa", "Discover a bird in Antarctica", "Collect 5 birds".
- Completing quests awards points and small badges.
- Quest progress persisted in localStorage.
- Quest panel accessible from right control panel.

### R-8: Globe Visual Improvements
- Enhanced atmosphere glow effect.
- Subtle lighting improvements.
- Smoother camera transitions.
- Optional cloud layer toggle.

### R-9: Migration Visualization (v12 enhanced)
- Toggle migration exploration mode.
- Visualize migration paths as animated curved arc lines on the globe.
- Glowing arc line with moving dot along the path.
- Example migration birds: Arctic Tern (Arctic to Antarctic), Bar-tailed Godwit (Alaska to New Zealand), Barn Swallow (Europe to Africa).
- Each route has distinct color.
- Flying bird icon animates along the path.

### R-10: Guided Discovery Tour
- Automated tour mode.
- Camera automatically visits: Amazon Rainforest, African Savanna, Antarctica, etc.
- During tour, show bird highlights with info cards.
- "Welcome explorer!" introduction.
- Pause/resume/skip controls.

### R-11: AI Bird Guide
- Simple guide character (owl or parrot avatar).
- Provides short explanations, fun facts, learning prompts.
- Appears contextually when exploring.
- Keep explanations short and child-friendly.
- Positioned bottom-left, does not overlap other UI.

### R-12: Learning Quiz Mode
- Quiz questions: "Where does this bird live?" with multiple choice.
- Immediate feedback (correct/wrong).
- Confetti on correct, shake on wrong.
- Score tracking per session.

### R-13: Bird Rarity System
- Rarity classification: Common, Rare, Legendary.
- Rare birds have subtle glow effect.
- Legendary birds have special particle effect.
- Rarity badge shown in info card and collection.

### R-14: Bird Radar
- Small radar UI showing nearby birds in current camera view.
- Circular radar display in corner.
- Dots represent birds, pulsing when close to center of view.

### R-15: Story-Based Exploration
- Themed discovery sets: Rainforest Birds, Arctic Birds, Desert Birds, Ocean Birds.
- Each theme has a set of birds to discover.
- Completing a theme unlocks a badge.
- Progress tracked in localStorage.

### R-16: Audio Playback (v12 enhanced)
- Bird sound playback via xeno-canto API or direct `soundUrl`.
- Dedicated "Listen" button with speaker icon on bird info card.
- Play/pause control with visual feedback (animated bars).
- Audio files lazy-loaded and compressed.
- Graceful fallback if API unavailable.

### R-17: Bilingual UI
- All user-facing text has Chinese and English variants.
- Language toggle switches between `zh` and `en`.
- Default language: Chinese.

### R-18: Camera System
- Smooth zoom-to-bird on click.
- OrbitControls target always [0,0,0].
- Auto-rotation when idle (>5s).
- Region zoom for filter feature.
- Minimum camera distance 1.15.

### R-19: UI System (v13 CRITICAL — Global UI Layer System)

#### UI Layer Architecture
- All UI components organized into strict layer hierarchy.
- Layer 0: 3D Globe Canvas (z-index: 0)
- Layer 1: Map markers (z-index: 5)
- Layer 2: Left sidebar controls (z-index: 20)
- Layer 3: Bottom panels (z-index: 40)
- Layer 4: Information cards (z-index: 60)
- Layer 5: Modal dialogs (z-index: 80)
- Layer 6: Full screen overlays (z-index: 100)
- No component may randomly assign z-index outside this hierarchy.

#### UI Root Structure
- AppRoot contains layered containers:
  - GlobeLayer (Three.js canvas, z-0)
  - UILayer (all floating UI):
    - SidebarLayer (left controls, z-20)
    - BottomPanelLayer (bottom panels, z-40)
    - CardLayer (info cards, z-60)
    - ModalLayer (modal dialogs, z-80)
    - OverlayLayer (full-screen overlays, z-100)
- All floating UI must live inside UILayer, never attached directly to globe container.

#### Sidebar Buttons
- All sidebar buttons must have identical width and height.
- Vertically aligned, never overlap the globe.
- Position: `fixed; left: 20px; top: 120px;`
- Layout: `display: flex; flex-direction: column; gap: 16px;`
- Z-index: 20 (sidebar layer).

#### Right Control Panel
- All action buttons in a single container.
- Position: fixed, right: 20px, bottom: 20px.
- Flex column, gap: 8px, align-items: flex-end.
- Buttons: Discover, Birds, Regions, Migration, Heatmap, Quests, Tour, Reset.
- Z-index: 20 (sidebar layer).
- No other UI may overlap this panel.

#### Card Layout Structure
- BirdCard → ImageHeader → TitleSection → FunFact → TagRow → InfoGrid → ActionButtons.
- No absolute positioning inside the card.
- Use flex column layout.
- Consistent spacing between sections using tokens: xs=6px, sm=10px, md=16px, lg=24px, xl=32px.

#### Tag Row
- `display: flex; flex-wrap: wrap; gap: 8px;`
- Tags wrap instead of overflowing.

#### Card Scroll
- `max-height: 80vh; overflow-y: auto;`
- Content never overflows the container.

#### Glass-morphism Card Style
- `border-radius: 20px;`
- Soft shadow.
- Semi-transparent glass background with backdrop blur.

#### Tag Color Rules
- Continent tags = blue.
- Habitat tags = green.
- Lifespan tags = orange.

#### Safe Area Rules (v13)
- Every floating panel must respect screen safe area.
- Top safe area: 20px padding.
- Left safe area: 20px padding.
- Right safe area: 20px padding.
- Bottom safe area: 20px padding.
- Plus device safe-area-inset values where applicable.

#### Responsive Layout (v13)
- Desktop (>= 1024px): Left sidebar + Bottom discovery panel + Right info card.
- Tablet (768px–1023px): Sidebar collapses, info card becomes center modal.
- Mobile (< 768px): Panels become full-screen sheets.

#### Panel Collision Avoidance (v13)
- Only one panel type can be active at a time.
- Bird card open → hide discovery panel.
- Modal open → hide all panels.
- Settings open → hide bird card.
- Managed via `activePanel` state in store.

#### Modal Priority (v13)
- Modal dialogs always appear above all panels.
- Modals block interaction with lower layers.
- Semi-transparent overlay backdrop.
- Overlay z-index: 80, Modal content z-index: 80.

#### Panel Animation Rules (v13)
- Bottom panel: slide up, 250ms ease-out.
- Side panel: slide from right, 250ms ease-out.
- Modal: scale fade, 250ms ease-out.
- All animations use CSS transitions or keyframes.

### R-27: Glass UI Design System (v14)
- Glassmorphism applied to all floating UI panels.
- Glass card properties: `background: rgba(255,255,255,0.2)`, `backdrop-filter: blur(20px)`, `border-radius: 20px`, soft shadow.
- Applied to: bird info card, discovery panel, floating buttons, progress bar.
- CSS utility classes for glass variants (light, dark, accent).

### R-28: Modern Button Design (v14)
- Rounded pill shape (`border-radius: 9999px`).
- Subtle shadow with hover glow effect.
- Hover: `scale(1.05)`, increased shadow, subtle glow.
- Active: `scale(0.97)` press feedback.
- Consistent across all ActionButtons.

### R-29: Globe Visual Improvements (v14)
- Enhanced atmosphere glow with two-layer Fresnel (inner warm, outer cool).
- Improved cloud layer with higher opacity and better blending.
- Three-light setup: ambient, directional sunlight, subtle rim light.
- Atmospheric glow ring around Earth visible from all angles.

### R-30: Bird Hover Interaction (v14)
- Hover over bird marker triggers: scale slightly larger, soft glow, small floating animation.
- Display styled tooltip showing bird name and region.
- Tooltip: glass-style background, rounded corners, smooth fade-in.

### R-31: Particle Bird Effects (v14)
- Subtle bird silhouette particles flying around the globe.
- Very low density (~8-12 particles), slow movement, small size.
- Creates ambient sense of life around the globe.
- Particles rendered as simple bird shapes using Points or small meshes.

### R-32: Camera Animation System (v14)
- Smooth fly-to animation when bird is clicked.
- Ease-in-out timing function.
- Duration ~1.2 seconds.
- Camera stops at comfortable viewing distance.
- Smooth deceleration at end of animation.

### R-33: Bottom Discovery Panel (v14)
- Bottom-center panel showing recently discovered birds and exploration progress.
- Displays "Birds discovered: X / Y" with progress bar.
- Glass UI styling consistent with design system.
- Slide-up animation on open.

### R-20: Performance (v12 enhanced)
- Model lazy loading: only load bird models when they enter the visible region.
- Limit simultaneously visible 3D models to 15; fallback to icon markers for others.
- Use KTX2 texture compression where possible.
- Minimize draw calls.
- Keep bird animations lightweight.
- Ensure smooth globe rotation.
- Target ~60 FPS on mid-range laptop.
- Compressed textures preferred.

### R-21: Bird Discovery System
- First-time bird click triggers "New bird discovered!" notification with celebration animation.
- Discovery state stored in localStorage separately from collection.
- Discovery count displayed in UI: "12 / 50 birds discovered".
- Continent-level discovery progress: "Asia: 3/8 birds discovered".

### R-22: Exploration Progress System
- Global progress bar: "Bird Discovery Progress — 12/50 Birds Found".
- Continent progress breakdown with individual progress bars.
- Progress indicator visible in HUD layer.
- Updates in real-time as birds are discovered.

### R-23: Bird Click Animation (v12 enhanced)
- On click: bird flaps wings rapidly for 0.5s.
- Bird lifts slightly into the air (0.02 units along surface normal).
- Bird rotates to face the camera direction.
- Short hop animation.
- Brief circle flight around position.
- Animation is short, playful, and does not block interaction.

### R-24: Bird Distribution Heatmap (v12 new)
- Heatmap layer visualizing bird population density on the globe.
- Colors: blue = few birds, green = moderate, red = high diversity.
- Toggle button: "Bird Diversity Map".
- Heatmap generated from bird coordinates with Gaussian spread.
- Semi-transparent overlay that doesn't obscure the globe.

### R-25: AR Bird Viewing Mode (v12 new)
- Optional AR viewing mode for supported devices.
- Click "View in AR" button on bird info card.
- Opens device camera with 3D bird model overlay.
- Children can rotate and zoom the bird model.
- Uses WebXR API or simple camera overlay fallback.
- Graceful degradation on unsupported devices.

### R-26: Educational Features (v12 enhanced)
- Fun Fact section: short, exciting, child-friendly.
- Example: "Did you know? Andean Condors can glide for hours without flapping their wings."
- Wingspan visualization bar comparing bird sizes.
- Visual comparison to child's arm span.

## Extended Data Model (v12)

### Bird type additions:
```typescript
interface Bird {
  // ... existing fields ...
  rarity?: "common" | "rare" | "legendary";
  storyTheme?: string;
  migration_path?: [number, number][];
  soundUrl?: string;
  migration?: boolean;
  model?: string;
}
```

### Habitat types expanded:
```typescript
type HabitatType =
  | "rainforest"
  | "wetlands"
  | "coast"
  | "grassland"
  | "forest"
  | "polar"
  | "mountains"
  | "desert"
  | "ocean"
  | "tundra";
```

### New types:
```typescript
interface Quest {
  id: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  type: "find_region" | "collect_count" | "discover_bird";
  target: string | number;
  reward: number;
  badge?: string;
}

interface CollectedBird {
  birdId: string;
  collectedAt: number;
}

interface StoryTheme {
  id: string;
  titleZh: string;
  titleEn: string;
  birdIds: string[];
  badge: string;
}

type Rarity = "common" | "rare" | "legendary";
```

### New types (v16):
```typescript
interface DailyMission {
  id: string;
  type: "find_region" | "discover_count" | "listen_sounds" | "explore_region";
  titleZh: string;
  titleEn: string;
  target: string | number;
  current: number;
  completed: boolean;
  badge: string;
}

interface BirdPhoto {
  id: string;
  birdId: string;
  dataUrl: string;
  capturedAt: number;
}

interface Achievement {
  id: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  icon: string;
  requirement: number;
  type: "discover" | "continent" | "listen" | "photo" | "mission";
  unlocked: boolean;
  unlockedAt?: number;
}
```

### R-34: Real-Time Day-Night Earth (v15)
- Dynamic lighting system simulating day and night on the globe.
- Directional light representing the sun, slowly rotating to simulate Earth rotation.
- Day side: bright, fully lit by directional light.
- Night side: dark with city lights texture visible (emissive map on night hemisphere).
- Earth rendering layers: base Earth texture, night city lights (emissive), cloud layer, atmosphere glow.
- Atmosphere: soft blue glow ring around the planet using slightly transparent sphere with additive blending.
- Sun rotation speed: very slow (~0.02 radians per second) for gentle day-night cycle.
- City lights fade in/out based on sun angle per fragment.

### R-35: Enhanced Bird Migration Route Visualization (v15)
- Migration routes displayed as curved glowing arcs connecting regions.
- Moving particle/dot traveling along each path with smooth animation.
- Toggle button "Migration Routes" to show/hide all migration paths.
- Whooping Crane migration route added (North America).
- Animation speed slow and smooth.
- Each route has distinct color for visual clarity.
- Arc lines glow with emissive shader effect.

### R-36: AI Bird Narration System (v15)
- "Tell me about this bird" button on bird info card.
- Narration content: friendly, short, child-oriented.
- Example: "This is the Scarlet Macaw. It lives in the rainforests of South America. Its bright feathers help it communicate with other birds. Scarlet Macaws can live for more than fifty years."
- Audio: use browser Web Speech API (SpeechSynthesis) as primary.
- Voice: friendly, clear, moderate speed.
- Fallback: display narration text if speech synthesis unavailable.
- Narration auto-generated from bird data fields (name, habitat, fun fact, lifespan, wingspan).

### R-37: Bird Discovery Celebration (v15)
- When a new bird is discovered: show celebration animation with star particles.
- Soft sound effect (optional, CSS animation primary).
- Message: "New Bird Discovered!" with bird name.
- Star particles: small sparkle/burst animation around notification.
- Bird discovery counter: "Birds Found: 14 / 50" displayed in UI.
- Continent discovery progress: "Asia: 4/10 birds discovered", "Africa: 3/8 birds discovered".

### R-38: Enhanced Bird Information Card (v15)
- Sections: Bird name, Scientific name, Habitat, Wingspan, Lifespan, Fun fact.
- Wingspan comparison visualization bar.
- Habitat region indicator: briefly highlight region on globe when card opens.
- Scientific name displayed in italic below common name.
- All sections use consistent spacing tokens.

### R-39: Camera Experience Improvements (v15)
- On bird selection: camera smoothly flies to bird location.
- Animation duration ~1.2 seconds with ease-in-out.
- Camera stops slightly above bird location.
- After arrival: gentle camera orbit (slow auto-rotate around the bird's position).
- Orbit helps user see the bird model clearly from multiple angles.

### R-40: Performance Optimization (v15)
- Limit visible 3D bird models to 15; fallback to icon markers for others.
- Lazy loading for bird models, audio files, high-resolution textures.
- Use compressed textures (KTX2) when possible.
- Day-night shader optimized for mobile (single-pass fragment shader).
- Migration arc geometry cached and reused.
- Narration audio generated on-demand, not preloaded.

### R-41: Daily Bird Mission System (v16)
- Daily mission set generated from predefined mission templates.
- Mission types: find a bird in a specific continent, discover N new birds, listen to N bird sounds, explore birds from a specific region.
- Mission progress tracked in localStorage with daily reset.
- Mission UI displayed in a dedicated panel accessible from the right control panel.
- Mission completion triggers celebration animation with star particles and a "Mission Complete" message.
- Completing missions awards badges stored in localStorage.

### R-42: Bird Photo Mode (v16)
- "Take Photo" button on bird info card.
- Photo mode freezes the current camera view.
- In photo mode: user can zoom and rotate to frame the bird.
- Capture button saves the current view as a base64 image to localStorage.
- Photo gallery panel ("My Bird Photos") accessible from the right control panel.
- Gallery shows saved photos with bird name labels.
- Photos lazy-loaded from localStorage.

### R-43: Bird Encyclopedia Enhancement (v16)
- Encyclopedia shows all birds: discovered birds with full info, undiscovered birds as locked entries.
- Locked entries display bird silhouette or question mark instead of photo.
- Progress indicator: "17 / 50 birds discovered" at the top of the encyclopedia.
- Clicking a discovered bird opens the bird info card.
- Clicking a locked bird shows a hint about the bird's continent.

### R-44: Explorer Achievement System (v16)
- Achievement definitions: First Discovery (discover 1 bird), Explorer (discover 10 birds), World Traveler (discover birds from all continents), Bird Listener (listen to 10 bird sounds), Photographer (take 5 bird photos), Mission Master (complete 5 missions).
- Achievement progress tracked in localStorage.
- Achievement unlock triggers celebration animation.
- Explorer profile panel showing earned badges.
- Badge icons displayed as visual indicators.

### R-45: Discovery Celebration Enhancement (v16)
- Enhanced celebration on new bird discovery: sparkle particles + confetti burst.
- Soft celebration sound effect (CSS animation primary, optional audio).
- "New Bird Discovered!" message with bird name prominently displayed.
- Celebration animation duration ~2s, non-blocking.

### R-46: Exploration Progress Enhancement (v16)
- Global progress: "World Bird Discovery: 17 / 50 birds discovered".
- Continent progress with individual bars: "Asia: 4/10", "Africa: 3/8".
- Exploration encouragement messages when a continent has low discovery rate.
- Example: "Try exploring South America. Many colorful birds live there."

### R-47: Bird Hint System (v16)
- When globe rotates near an undiscovered bird location, show subtle hint animation.
- Hint types: marker pulse animation, small bird icon flutter.
- Hints only appear for undiscovered birds.
- Hints are subtle and do not reveal the exact bird identity.

### R-48: Performance — Photo & Mission Storage (v16)
- Photos stored as compressed base64 in localStorage with size limits.
- Mission progress and achievements use efficient localStorage keys.
- Lazy loading for photo gallery thumbnails.
- Maximum 50 stored photos; oldest auto-removed when limit reached.

### R-49: Enhanced Mission Panel (v17)
- Daily missions panel shows continent mini-progress bars for region missions.
- Completed missions display animated badge with glow effect.
- Mission completion celebration includes confetti particles.
- Panel header shows daily progress ring indicator.

### R-50: Photo Mode Overlay (v17)
- Full-screen photo mode overlay with semi-transparent background.
- Zoom slider control (1x to 3x).
- Rotation controls for framing.
- Capture button with flash animation feedback.
- Exit photo mode button clearly visible.

### R-51: Encyclopedia Search and Grouping (v17)
- Search input at top of encyclopedia panel filters birds by name.
- Birds grouped by continent with collapsible sections.
- Each continent section shows discovery count.
- Smooth scroll to section when continent header tapped.

### R-52: Achievement Progress Bars (v17)
- Each achievement card shows a progress bar indicating completion percentage.
- Progress bar fills based on current count vs requirement.
- Unlocked achievements show full bar with glow effect.
- Locked achievements show current progress value.

### R-53: Continent Progress in Bottom Panel (v17)
- Bottom discovery panel shows compact continent progress bars.
- Each continent has a color-coded mini bar.
- Bars animate on discovery updates.
- Continent names shown as abbreviated labels.

### R-54: Rotating Exploration Tips (v17)
- Exploration encouragement messages rotate every 8 seconds.
- Tips suggest continents, activities (listen, photograph, collect).
- Tips context-aware based on current discovery state.
- Smooth fade transition between tips.

### R-55: Enhanced Bird Hint Animations (v17)
- Undiscovered bird markers pulse with intensity based on camera proximity.
- Closer camera = stronger pulse and flutter.
- Pulse color shifts subtly (warm amber glow).
- Flutter animation uses sine wave with varying amplitude.

### R-56: UI Overlap Fix — Sidebar Collision Avoidance (v18 CRITICAL)
- When bird info card opens, sidebar layer reduces opacity to 0.4 and shifts left by 10px.
- Info card z-index (60) always above sidebar z-index (20).
- Bird info card left margin: 200px on desktop to prevent collision with sidebar.
- Sidebar buttons width: 120px, height: 44px with 10px gap between buttons.
- All UI elements respect strict z-index hierarchy: globe(0) → markers(5) → sidebar(20) → bottom-panel(30) → info-card(60) → modal(100).

### R-57: Improved 3D Bird Model (v18)
- Replace generic GLTF geometry with procedural stylized low-poly bird shape.
- Bird shape: elongated body, swept-back wings, tail fan, pointed beak.
- Slow wing-flap idle animation (gentle sine wave every few seconds).
- Correct bird silhouette recognizable from all angles.
- If external models unavailable, use procedural geometry that looks like a bird.

### R-58: Bird Marker Visual Improvement (v18)
- Markers display a small glowing circle at base position.
- Bird icon/model hovers above the glowing circle.
- Hover effect: scale up to 1.35x with soft glow intensification.
- Undiscovered birds show warm amber pulse.

### R-59: Bird Info Card Section Titles (v18)
- Info card sections have clear titles: Habitat, Lifespan, Wingspan, Fun Fact.
- Card content: bird name, English name, continent, habitat, lifespan, wingspan, fun fact.
- Card never overflows: max-height 80vh, overflow-y auto.
- Left margin 200px on desktop prevents sidebar overlap.

### R-60: Discovery Feedback Improvement (v18)
- Bird click triggers glow pulse animation around marker.
- Discovery notification: "You discovered a new bird!" message.
- Discovery counter visible: "Birds Found: 8 / 50".

### R-61: Camera Experience Improvement (v18)
- Bird click triggers smooth camera fly-to (~1s duration).
- Camera stops slightly above bird location.
- Ease-in-out animation curve.

### R-62: UI Stability — Consistent Spacing (v18)
- Spacing tokens enforced: xs=6px, sm=10px, md=16px, lg=24px.
- All floating panels respect 20px safe area margins.
- Left margin for info cards: 200px to avoid sidebar collision.
- No UI element may overlap another at any viewport size.

## Non-goals
- User accounts or server-side progress tracking.
- Offline support / PWA.
- Server-side rendering.
- CMS or admin panel.
- Deployment pipeline.
- High-resolution GeoJSON.

## Acceptance Criteria

### AC-V18-1: UI Overlap Fix
- [ ] Info card (z-60) always renders above sidebar (z-20).
- [ ] Sidebar reduces opacity when bird info card is open.
- [ ] Bird info card has 200px left margin on desktop.
- [ ] No UI elements overlap at any viewport size.

### AC-V18-2: Improved Bird Model
- [ ] Bird model has recognizable bird silhouette (wings, tail, beak).
- [ ] Slow wing-flap idle animation visible.
- [ ] Model renders correctly at all LOD distances.

### AC-V18-3: Bird Marker Visuals
- [ ] Glowing base circle visible at marker position.
- [ ] Hover triggers scale and glow effect.
- [ ] Undiscovered birds show amber pulse.

### AC-V18-4: Bird Info Card Sections
- [ ] Section titles (Habitat, Lifespan, Wingspan) visible.
- [ ] Card never overflows viewport.
- [ ] Card respects left margin on desktop.

### AC-V18-5: Discovery Feedback
- [ ] Glow pulse on bird click.
- [ ] Discovery counter visible in UI.
- [ ] "New bird discovered" notification works.

### AC-V18-6: Camera Experience
- [ ] Smooth fly-to on bird click (~1s).
- [ ] Camera stops above bird location.
- [ ] Ease-in-out animation.

### AC-V18-7: UI Stability
- [ ] Consistent spacing tokens used.
- [ ] Safe area margins respected.
- [ ] ~60 FPS maintained.

### AC-V17-1: Enhanced Mission Panel
- [ ] Mission panel shows continent mini-progress bars for region missions.
- [ ] Completed missions display animated badge with glow.
- [ ] Panel header shows daily progress summary.

### AC-V17-2: Photo Mode Overlay
- [ ] Photo mode shows full-screen overlay with controls.
- [ ] Zoom slider works (1x-3x).
- [ ] Capture button provides flash feedback.
- [ ] Exit button returns to normal view.

### AC-V17-3: Encyclopedia Search and Grouping
- [ ] Search input filters birds by name.
- [ ] Birds grouped by continent sections.
- [ ] Each section shows continent discovery count.

### AC-V17-4: Achievement Progress Bars
- [ ] Each achievement shows progress bar.
- [ ] Progress percentage displayed.
- [ ] Unlocked achievements show full bar with glow.

### AC-V17-5: Continent Progress in Bottom Panel
- [ ] Bottom panel shows continent mini-bars.
- [ ] Bars are color-coded by continent.
- [ ] Bars animate on discovery.

### AC-V17-6: Rotating Exploration Tips
- [ ] Tips rotate every 8 seconds.
- [ ] Tips are context-aware.
- [ ] Smooth fade transition between tips.

### AC-V17-7: Enhanced Bird Hints
- [ ] Pulse intensity varies with camera proximity.
- [ ] Flutter animation visible on undiscovered birds.

### AC-V17-8: Performance
- [ ] ~60 FPS maintained with all v17 features.
- [ ] Build succeeds with no TypeScript errors.

### AC-V16-1: Daily Bird Mission System
- [ ] Daily missions displayed in a dedicated panel.
- [ ] Mission types include find_region, discover_count, listen_sounds, explore_region.
- [ ] Mission progress updates in real-time.
- [ ] Mission completion triggers celebration animation.
- [ ] Completed missions award badges.
- [ ] Mission progress persisted in localStorage with daily reset.

### AC-V16-2: Bird Photo Mode
- [ ] "Take Photo" button on bird info card.
- [ ] Photo mode freezes camera and allows zoom/rotate.
- [ ] Capture saves image to localStorage.
- [ ] Photo gallery panel shows saved photos with bird names.
- [ ] Photos lazy-loaded in gallery.

### AC-V16-3: Bird Encyclopedia Enhancement
- [ ] Encyclopedia shows discovered birds with full info.
- [ ] Undiscovered birds shown as locked entries.
- [ ] Progress indicator shows "X / Y birds discovered".
- [ ] Clicking discovered bird opens info card.

### AC-V16-4: Explorer Achievement System
- [ ] Achievement definitions for First Discovery, Explorer, World Traveler, Bird Listener, Photographer, Mission Master.
- [ ] Achievement progress tracked and persisted.
- [ ] Achievement unlock triggers celebration.
- [ ] Explorer profile panel shows earned badges.

### AC-V16-5: Discovery Celebration Enhancement
- [ ] Sparkle particles and confetti on new bird discovery.
- [ ] "New Bird Discovered" message with bird name.
- [ ] Celebration animation ~2s, non-blocking.

### AC-V16-6: Exploration Progress Enhancement
- [ ] Global progress displayed.
- [ ] Continent progress with individual bars.
- [ ] Encouragement messages for low-discovery continents.

### AC-V16-7: Bird Hint System
- [ ] Subtle hint animation near undiscovered bird locations.
- [ ] Hints only for undiscovered birds.
- [ ] Hints do not reveal bird identity.

### AC-V16-8: Performance
- [ ] Photo storage with size limits.
- [ ] Max 15 simultaneous 3D models enforced.
- [ ] Lazy loading for photos, models, sounds.
- [ ] ~60 FPS maintained with all v16 features.

### AC-V15-1: Real-Time Day-Night Earth
- [ ] Globe displays bright day side and dark night side.
- [ ] City lights visible on night side.
- [ ] Directional sun light slowly rotates.
- [ ] Atmosphere glow ring visible around planet.
- [ ] Cloud layer renders in both day and night.

### AC-V15-2: Bird Migration Routes
- [ ] Migration arcs display as glowing curved lines.
- [ ] Moving particle dot animates along each path.
- [ ] Toggle button shows/hides migration routes.
- [ ] Whooping Crane route included.
- [ ] Each route has distinct color.

### AC-V15-3: AI Bird Narration
- [ ] "Tell me about this bird" button on info card.
- [ ] Clicking triggers spoken narration via Web Speech API.
- [ ] Narration content is friendly and child-oriented.
- [ ] Fallback text display when speech unavailable.

### AC-V15-4: Bird Discovery Celebration
- [ ] Star particle celebration on new bird discovery.
- [ ] "New Bird Discovered" message displays.
- [ ] Discovery counter shows "Birds Found: X / Y".
- [ ] Continent progress shows per-continent discovery.

### AC-V15-5: Enhanced Bird Info Card
- [ ] Scientific name displayed in italic.
- [ ] Habitat, wingspan, lifespan sections present.
- [ ] Wingspan comparison bar works.
- [ ] Fun fact section styled with "Did you know?" prompt.

### AC-V15-6: Camera Experience
- [ ] Camera fly-to uses ease-in-out over ~1.2s.
- [ ] Camera stops above bird location.
- [ ] Gentle orbit after arrival.

### AC-V15-7: Performance
- [ ] Max 15 simultaneous 3D models enforced.
- [ ] Lazy loading for models and audio.
- [ ] ~60 FPS maintained with all v15 features.

### AC-V14-1: Glass UI Design System
- [ ] Glassmorphism CSS utility classes defined.
- [ ] Bird info card uses glass background with backdrop blur.
- [ ] Discovery panel uses glass styling.
- [ ] Floating buttons use glass design.

### AC-V14-2: Modern Button Design
- [ ] Buttons use rounded pill shape.
- [ ] Hover glow and scale effect works.
- [ ] Active press feedback works.

### AC-V14-3: Globe Visual Improvements
- [ ] Enhanced atmosphere glow visible.
- [ ] Cloud layer renders with improved quality.
- [ ] Rim light adds depth to globe.

### AC-V14-4: Bird Hover Interaction
- [ ] Hover triggers scale and glow animation.
- [ ] Tooltip displays bird name and region.
- [ ] Tooltip has glass-style design.

### AC-V14-5: Particle Bird Effects
- [ ] Bird silhouette particles visible around globe.
- [ ] Low density, slow movement.
- [ ] Particles do not impact performance.

### AC-V14-6: Camera Animation
- [ ] Camera fly-to uses ease-in-out.
- [ ] Animation duration ~1.2s.
- [ ] Smooth deceleration at end.

### AC-V14-7: Bottom Discovery Panel
- [ ] Discovery panel shows progress.
- [ ] Glass UI styling applied.
- [ ] Slide-up animation works.

### AC-V14-8: Performance
- [ ] ~60 FPS maintained with all v14 features.
- [ ] No jank during hover or camera animations.

### AC-V13-1: Global UI Layer System
- [ ] Unified z-index hierarchy with 7 defined layers.
- [ ] All components use layer-appropriate z-index values.
- [ ] No random z-index assignments outside the hierarchy.

### AC-V13-2: UI Root Structure
- [ ] App root refactored into layered container architecture.
- [ ] All floating UI lives inside UILayer containers.
- [ ] GlobeLayer, SidebarLayer, BottomPanelLayer, CardLayer, ModalLayer, OverlayLayer defined.

### AC-V13-3: Panel Collision Avoidance
- [ ] Only one panel type active at a time.
- [ ] Bird card open hides discovery panel.
- [ ] Modal open hides all panels.
- [ ] activePanel state manages panel exclusivity.

### AC-V13-4: Bird Panel Behavior
- [ ] Bird info card opens from right side (desktop) or bottom center (mobile).
- [ ] Bird card and bottom panels never overlap.
- [ ] Left side: navigation. Bottom: discovery panel. Right: bird info card.

### AC-V13-5: Responsive Layout
- [ ] Desktop: sidebar + bottom panel + right card.
- [ ] Tablet: collapsed sidebar, center modal card.
- [ ] Mobile: full-screen sheet panels.

### AC-V13-6: Safe Area Rules
- [ ] 20px padding on all sides for floating panels.
- [ ] Device safe-area-inset respected.

### AC-V13-7: Modal Priority
- [ ] Modals appear above all panels.
- [ ] Semi-transparent overlay blocks lower layers.
- [ ] Overlay and modal use z-index 80+.

### AC-V13-8: Panel Animations
- [ ] Bottom panels slide up (250ms).
- [ ] Side panels slide from right (250ms).
- [ ] Modals scale-fade in (250ms).

### AC-V12-1: Expanded Dataset
- [ ] 50+ birds in birds.json.
- [ ] Birds from South America, North America, Africa, Asia, Oceania, Europe, Polar regions.
- [ ] Each bird has all required fields including soundUrl, migration, model.

### AC-V12-2: Migration Visualization
- [ ] Animated arc lines for migration routes.
- [ ] Moving dot along migration path.
- [ ] Arctic Tern, Bar-tailed Godwit, Swallow routes included.
- [ ] Glowing arc effect.

### AC-V12-3: Bird Distribution Heatmap
- [ ] Heatmap layer toggleable via "Bird Diversity Map" button.
- [ ] Blue-green-red color gradient.
- [ ] Semi-transparent overlay.

### AC-V12-4: AR Bird Viewing
- [ ] "View in AR" button on bird info card.
- [ ] Camera overlay with 3D model (on supported devices).
- [ ] Graceful fallback on unsupported devices.

### AC-V12-5: Enhanced Animations
- [ ] Wing flap on click.
- [ ] Hop animation.
- [ ] Look-toward-camera.
- [ ] Short circle flight.

### AC-V12-6: UI Layout
- [ ] No absolute positioning inside bird info card.
- [ ] Card uses strict flex-column layout with spacing tokens.
- [ ] Tag row wraps instead of overflowing.
- [ ] Card has max-height 80vh with overflow-y auto.
- [ ] Glass-morphism style with border-radius 20px.
- [ ] Continent tags blue, habitat tags green, lifespan tags orange.
- [ ] Sidebar buttons identical size, vertically aligned.
- [ ] No UI overlap between any panels.

### AC-V12-7: Performance
- [ ] Model lazy loading implemented.
- [ ] Max 15 visible 3D models.
- [ ] KTX2 texture compression where possible.
- [ ] ~60 FPS maintained.

### AC-V12-8: Educational
- [ ] Fun facts short and exciting.
- [ ] Wingspan visualization bar works.
- [ ] "Did you know?" section styled.

### AC-V11-1: UI Layout Fix
- [x] No absolute positioning inside bird info card.
- [x] Card uses strict flex-column layout with spacing tokens.
- [x] Tag row wraps instead of overflowing.
- [x] Card has max-height 80vh with overflow-y auto.
- [x] Glass-morphism style with border-radius 20px.
- [x] Continent tags blue, habitat tags green, lifespan tags orange.
- [x] Sidebar buttons identical size, vertically aligned.
- [x] No UI overlap between any panels.

### AC-V11-2: 3D Bird Models
- [x] GLTFLoader loads bird models in GLB format.
- [x] Birds display idle animation and floating motion.
- [x] LOD: icon markers when far, 3D models when close.
- [x] Max 15 simultaneous 3D models.
- [x] Click animation: wing flap, lift, rotate toward camera.

### AC-V11-3: Expanded Bird Dataset
- [x] 40+ birds in birds.json.
- [x] Birds from South America, North America, Africa, Asia, Oceania, Polar regions.
- [x] Each bird has all required fields including soundUrl.

### AC-V11-4: Bird Sound Feature
- [x] "Listen" button on bird info card.
- [x] Clicking plays bird call audio.
- [x] Audio lazy-loaded.
- [x] Graceful fallback on error.

### AC-V11-5: Bird Discovery System
- [x] First-time click shows "New bird discovered!" notification.
- [x] Discovery state persisted in localStorage.
- [x] Collection screen shows discovered and locked birds.

### AC-V11-6: Exploration Progress
- [x] Global progress bar: "12/40 Birds Found".
- [x] Continent-level progress displayed.
- [x] Progress updates in real-time.

### AC-V11-7: Bird Click Animation
- [x] Wing flap animation on click.
- [x] Bird lifts slightly on click.
- [x] Bird rotates toward camera on click.

### AC-V11-8: Performance
- [x] Model lazy loading implemented.
- [x] Max 15 visible 3D models.
- [x] ~60 FPS maintained.

### AC-PERF: Performance
- [ ] ~60 FPS on mid-range laptop.
- [ ] No jank during animations.
- [ ] Smooth globe rotation at all times.

### AC-ARCH: Architecture Invariants
- [ ] OrbitControls target always [0,0,0].
- [ ] Camera zoom respects minDistance 1.15.
- [ ] No scene.add() or scene.remove() calls.
- [ ] All animations via useFrame.
- [ ] All geometry via useMemo.
- [ ] Declarative R3F patterns throughout.
