export type SizeCategory = "tiny" | "small" | "medium" | "large";

export type HabitatType =
  | "rainforest"
  | "wetlands"
  | "coast"
  | "grassland"
  | "forest"
  | "polar";

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
}

export interface MigrationRoute {
  id: string;
  from: string;
  to: string;
  nameZh?: string;
  nameEn?: string;
  migrationDistanceKm?: number;
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
