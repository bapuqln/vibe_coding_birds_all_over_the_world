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
}

export interface MigrationRoute {
  id: string;
  from: string;
  to: string;
  nameZh?: string;
  nameEn?: string;
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
