import type { StateCreator } from "zustand";
import type { KnowledgeResult, TTSStatus } from "../../types";
import type { AppStore } from "../types";

export interface AiGuideSlice {
  aiGuideOpen: boolean;
  aiGuideQuestion: string | null;
  aiGuideAnswer: string | null;
  birdExplanation: KnowledgeResult | null;
  birdExplanationLoading: boolean;
  ttsStatus: TTSStatus;

  setAiGuideOpen: (open: boolean) => void;
  setAiGuideQuestion: (q: string | null) => void;
  setAiGuideAnswer: (a: string | null) => void;
  requestBirdExplanation: (birdId: string) => void;
  clearBirdExplanation: () => void;
  speakExplanation: () => void;
  stopSpeaking: () => void;
}

export const createAiGuideSlice: StateCreator<
  AppStore,
  [],
  [],
  AiGuideSlice
> = (set, get) => ({
  aiGuideOpen: false,
  aiGuideQuestion: null,
  aiGuideAnswer: null,
  birdExplanation: null,
  birdExplanationLoading: false,
  ttsStatus: "idle" as TTSStatus,

  setAiGuideOpen: (aiGuideOpen) => set({ aiGuideOpen }),
  setAiGuideQuestion: (aiGuideQuestion) => set({ aiGuideQuestion }),
  setAiGuideAnswer: (aiGuideAnswer) => set({ aiGuideAnswer }),

  requestBirdExplanation: (birdId) => {
    set({ birdExplanationLoading: true, birdExplanation: null });
    import("../../features/KnowledgeService").then(
      ({ queryBirdExplanation }) => {
        queryBirdExplanation(birdId)
          .then((result) => {
            set({
              birdExplanation: result,
              birdExplanationLoading: false,
              aiGuideOpen: true,
            });
          })
          .catch(() => {
            set({ birdExplanationLoading: false });
          });
      },
    );
  },
  clearBirdExplanation: () =>
    set({ birdExplanation: null, birdExplanationLoading: false }),
  speakExplanation: () => {
    const { birdExplanation, language } = get();
    if (!birdExplanation) return;
    import("../../features/tts-service").then(({ speak }) => {
      const text =
        language === "zh" ? birdExplanation.textZh : birdExplanation.text;
      const status = speak(text, language, () => set({ ttsStatus: "idle" }));
      set({ ttsStatus: status });
    });
  },
  stopSpeaking: () => {
    import("../../features/tts-service").then(({ stop }) => {
      stop();
      set({ ttsStatus: "idle" });
    });
  },
});
