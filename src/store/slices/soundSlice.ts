import type { StateCreator } from "zustand";
import type { SoundGuessOption, SoundGuessState } from "../../types";
import type { AppStore } from "../types";

export interface SoundSlice {
  soundGuessState: SoundGuessState;
  soundGuessRound: number;
  soundGuessScore: number;
  soundGuessOptions: SoundGuessOption[];
  soundGuessCorrectId: string | null;
  soundRecognitionActive: boolean;
  soundRecognitionResult: string | null;
  soundRecognitionConfidence: number;

  startSoundGuess: () => void;
  setSoundGuessOptions: (
    options: SoundGuessOption[],
    correctId: string,
  ) => void;
  answerSoundGuess: (birdId: string) => void;
  nextSoundGuessRound: () => void;
  endSoundGuess: () => void;
  setSoundRecognitionActive: (active: boolean) => void;
  setSoundRecognitionResult: (birdId: string | null) => void;
  setSoundRecognitionConfidence: (confidence: number) => void;
}

export const createSoundSlice: StateCreator<AppStore, [], [], SoundSlice> = (
  set,
) => ({
  soundGuessState: "idle",
  soundGuessRound: 0,
  soundGuessScore: 0,
  soundGuessOptions: [],
  soundGuessCorrectId: null,
  soundRecognitionActive: false,
  soundRecognitionResult: null,
  soundRecognitionConfidence: 0,

  startSoundGuess: () =>
    set({
      soundGuessState: "playing",
      soundGuessRound: 1,
      soundGuessScore: 0,
      soundGuessOptions: [],
      soundGuessCorrectId: null,
    }),
  setSoundGuessOptions: (options, correctId) =>
    set({
      soundGuessState: "guessing",
      soundGuessOptions: options,
      soundGuessCorrectId: correctId,
    }),
  answerSoundGuess: (birdId) =>
    set((state) => ({
      soundGuessScore:
        birdId === state.soundGuessCorrectId
          ? state.soundGuessScore + 1
          : state.soundGuessScore,
    })),
  nextSoundGuessRound: () =>
    set((state) => {
      if (state.soundGuessRound >= 5) {
        return { soundGuessState: "result" as const };
      }
      return {
        soundGuessState: "playing" as const,
        soundGuessRound: state.soundGuessRound + 1,
        soundGuessOptions: [],
        soundGuessCorrectId: null,
      };
    }),
  endSoundGuess: () =>
    set({
      soundGuessState: "idle",
      soundGuessRound: 0,
      soundGuessScore: 0,
      soundGuessOptions: [],
      soundGuessCorrectId: null,
    }),

  setSoundRecognitionActive: (soundRecognitionActive) =>
    set({ soundRecognitionActive }),
  setSoundRecognitionResult: (soundRecognitionResult) =>
    set({ soundRecognitionResult }),
  setSoundRecognitionConfidence: (soundRecognitionConfidence) =>
    set({ soundRecognitionConfidence }),
});
