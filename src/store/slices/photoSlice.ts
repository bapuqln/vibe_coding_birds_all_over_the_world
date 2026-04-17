import type { StateCreator } from "zustand";
import type { BirdPhoto, PhotoScore } from "../../types";
import type { AppStore } from "../types";
import {
  MAX_PHOTOS,
  PHOTOS_KEY,
  loadFromStorage,
  saveToStorage,
} from "../persistence";

export interface PhotoSlice {
  birdPhotos: BirdPhoto[];
  photoGalleryOpen: boolean;
  photoModeActive: boolean;
  photographerModeActive: boolean;
  photographerScore: PhotoScore | null;
  sharePanelOpen: boolean;
  screenshotFlash: boolean;
  recentScreenshots: string[];

  capturePhoto: (
    birdId: string,
    birdNameZh: string,
    birdNameEn: string,
    dataUrl: string,
  ) => void;
  deletePhoto: (photoId: string) => void;
  setPhotoGalleryOpen: (open: boolean) => void;
  setPhotoModeActive: (active: boolean) => void;
  setPhotographerModeActive: (active: boolean) => void;
  setPhotographerScore: (score: PhotoScore | null) => void;
  setSharePanelOpen: (open: boolean) => void;
  addScreenshot: (dataUrl: string) => void;
  setScreenshotFlash: (flash: boolean) => void;
}

export const createPhotoSlice: StateCreator<AppStore, [], [], PhotoSlice> = (
  set,
  get,
) => ({
  birdPhotos: loadFromStorage<BirdPhoto[]>(PHOTOS_KEY, []),
  photoGalleryOpen: false,
  photoModeActive: false,
  photographerModeActive: false,
  photographerScore: null,
  sharePanelOpen: false,
  screenshotFlash: false,
  recentScreenshots: [],

  capturePhoto: (birdId, birdNameZh, birdNameEn, dataUrl) => {
    const state = get();
    const photo: BirdPhoto = {
      id: `photo-${Date.now()}`,
      birdId,
      birdNameZh,
      birdNameEn,
      dataUrl,
      capturedAt: Date.now(),
    };
    let updated = [photo, ...state.birdPhotos];
    if (updated.length > MAX_PHOTOS) {
      updated = updated.slice(0, MAX_PHOTOS);
    }
    saveToStorage(PHOTOS_KEY, updated);
    set({ birdPhotos: updated });
  },
  deletePhoto: (photoId) => {
    const state = get();
    const updated = state.birdPhotos.filter((p) => p.id !== photoId);
    saveToStorage(PHOTOS_KEY, updated);
    set({ birdPhotos: updated });
  },
  setPhotoGalleryOpen: (photoGalleryOpen) => set({ photoGalleryOpen }),
  setPhotoModeActive: (photoModeActive) => set({ photoModeActive }),
  setPhotographerModeActive: (photographerModeActive) =>
    set({ photographerModeActive, photographerScore: null }),
  setPhotographerScore: (photographerScore) => set({ photographerScore }),
  setSharePanelOpen: (sharePanelOpen) => set({ sharePanelOpen }),
  addScreenshot: (dataUrl) =>
    set((state) => ({
      recentScreenshots: [dataUrl, ...state.recentScreenshots].slice(0, 10),
    })),
  setScreenshotFlash: (screenshotFlash) => set({ screenshotFlash }),
});
