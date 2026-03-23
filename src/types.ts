export type SizeCategory = "tiny" | "small" | "medium" | "large";

export type HabitatType =
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

export type EvolutionEra =
  | "mesozoic"
  | "paleogene"
  | "neogene"
  | "quaternary";

export type DietType =
  | "insects"
  | "fish"
  | "seeds"
  | "fruit"
  | "meat"
  | "omnivore";

export type Rarity = "common" | "rare" | "legendary";

export interface Bird {
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
  sizeCategory?: SizeCategory;
  habitatType?: HabitatType;
  migrationDistanceKm?: number;
  diet?: string;
  wingspan?: string;
  lifespan?: string;
  evolutionEra?: EvolutionEra;
  dietType?: DietType;
  wingspanCm?: number;
  rarity?: Rarity;
  storyTheme?: string;
  soundUrl?: string;
  modelPath?: string;
  soundPath?: string;
  migration?: boolean;
  activityPeriod?: "diurnal" | "nocturnal" | "crepuscular";
  biome?: BiomeType;
}

export interface MigrationRoute {
  id: string;
  from: string;
  to: string;
  nameZh?: string;
  nameEn?: string;
  migrationDistanceKm?: number;
  color?: string;
}

export type QuizType = "geography" | "sound" | "size";

export interface QuizQuestion {
  type: QuizType;
  prompt: string;
  promptZh: string;
  correctBirdId: string;
  options?: string[];
}

export type QuizState = "idle" | "active" | "result";

export type SoundGuessState = "idle" | "playing" | "guessing" | "result";

export interface SoundGuessOption {
  birdId: string;
  photoUrl: string;
  nameZh: string;
  nameEn: string;
}

export type Language = "zh" | "en";

export type AudioStatus = "idle" | "loading" | "playing" | "error";

export interface XenoCantoRecording {
  id: string;
  sp: string;
  file: string;
  "file-name": string;
  q: string;
  type: string;
}

export interface XenoCantoResponse {
  numRecordings: string;
  recordings: XenoCantoRecording[];
}

export interface CollectedBird {
  birdId: string;
  collectedAt: number;
}

export interface Quest {
  id: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  type: "find_region" | "collect_count" | "discover_bird";
  target: string | number;
  reward: number;
  badge: string;
}

export interface QuestProgress {
  questId: string;
  current: number;
  completed: boolean;
  completedAt?: number;
}

export interface StoryTheme {
  id: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  birdIds: string[];
  badge: string;
}

export interface MissionTemplate {
  id: string;
  type: "find_region" | "discover_count" | "listen_sounds";
  titleZh: string;
  titleEn: string;
  target: string | number;
  goal: number;
  badge: string;
}

export interface DailyMission {
  id: string;
  templateId: string;
  type: "find_region" | "discover_count" | "listen_sounds";
  titleZh: string;
  titleEn: string;
  target: string | number;
  goal: number;
  current: number;
  completed: boolean;
  badge: string;
}

export interface BirdPhoto {
  id: string;
  birdId: string;
  birdNameZh: string;
  birdNameEn: string;
  dataUrl: string;
  capturedAt: number;
}

export interface AchievementDef {
  id: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  icon: string;
  requirement: number;
  type: "discover" | "continent" | "listen" | "photo" | "mission";
}

export interface AchievementProgress {
  achievementId: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export type TourState = "idle" | "intro" | "touring" | "paused" | "complete";

export interface TourWaypoint {
  lat: number;
  lng: number;
  zoom: number;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  featuredBirdId?: string;
  durationMs: number;
}

export interface Expedition {
  id: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  type: "region" | "trait" | "collection" | "continents";
  target: string;
  goal: number;
  badge: string;
  reward: string;
}

export interface ExpeditionProgress {
  expeditionId: string;
  current: number;
  completed: boolean;
  completedAt?: number;
}

export type ActivityPeriod = "diurnal" | "nocturnal" | "crepuscular";

export type WeatherType = "clear" | "cloudy" | "rainy" | "stormy";

export interface RegionWeather {
  region: string;
  weather: WeatherType;
  intensity: number;
}

export type TimeOfDay = "dawn" | "morning" | "afternoon" | "dusk" | "night";

export interface StoryAdventure {
  id: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  steps: StoryStep[];
  badge: string;
}

export interface StoryStep {
  lat: number;
  lng: number;
  zoom: number;
  narrationZh: string;
  narrationEn: string;
  featuredBirdId: string;
  durationMs: number;
}

export type StoryPlayState = "idle" | "selecting" | "playing" | "paused" | "complete";

// V31 — AI Bird Guide
export interface GuideQuestion {
  id: string;
  pattern: string[];
  birdId?: string;
  category: "behavior" | "habitat" | "diet" | "appearance" | "migration" | "general";
  answerZh: string;
  answerEn: string;
}

// V32 — AR Mode
export type ARSessionState = "inactive" | "requesting" | "active" | "error";

// V33 — Animation
export type BirdAnimState = "idle" | "takeoff" | "flying" | "landing" | "perching";

export interface AnchorPoint {
  lat: number;
  lng: number;
  region: string;
}

// V34 — Photographer
export interface PhotoScore {
  distance: number;
  pose: number;
  composition: number;
  rarity: number;
  total: number;
  stars: number;
}

// V35 — Biomes
export type BiomeType = "rainforest" | "savannah" | "arctic" | "ocean";

export interface BiomeZone {
  id: string;
  type: BiomeType;
  nameZh: string;
  nameEn: string;
  centerLat: number;
  centerLng: number;
  radius: number;
  color: string;
  particleType: "leaves" | "dust" | "snow" | "shimmer";
}

// V36 — Migration
export interface MigrationWaypoint {
  lat: number;
  lng: number;
}

export interface DetailedMigrationRoute {
  id: string;
  birdId: string;
  nameZh: string;
  nameEn: string;
  waypoints: MigrationWaypoint[];
  distanceKm: number;
  durationDays: number;
  season: string;
  funFactZh: string;
  funFactEn: string;
  color: string;
}

// V39 — Classroom
export interface LessonStep {
  narrationZh: string;
  narrationEn: string;
  action: "focus_bird" | "show_migration" | "start_quiz" | "focus_region" | "narrate";
  target?: string;
  durationMs: number;
}

export interface Lesson {
  id: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  steps: LessonStep[];
}

// V40 — Sandbox
export interface SpawnedBird {
  id: string;
  birdId: string;
  lat: number;
  lng: number;
  spawnedAt: number;
}
