import { useRef, useCallback } from "react";

interface UseAudioOptions {
  onEnded?: () => void;
}

export function useAudio(options?: UseAudioOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndedRef = useRef(options?.onEnded);
  onEndedRef.current = options?.onEnded;

  const play = useCallback((url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      stop();

      const audio = new Audio();
      audioRef.current = audio;

      audio.addEventListener("canplaythrough", () => resolve(), { once: true });
      audio.addEventListener("error", () => reject(audio.error), {
        once: true,
      });
      audio.addEventListener(
        "ended",
        () => {
          onEndedRef.current?.();
        },
        { once: true },
      );

      audio.crossOrigin = "anonymous";
      audio.src = url;
      audio.play().catch(reject);
    });
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    }
  }, []);

  return { play, stop };
}
