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
