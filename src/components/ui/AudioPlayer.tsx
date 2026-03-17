import { useEffect, useRef, useMemo, useCallback } from "react";
import { useAppStore } from "../../store";
import { useAudio } from "../../hooks/useAudio";
import { fetchBirdAudio } from "../../utils/xeno-canto";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];
const birdMap = new Map(birds.map((b) => [b.id, b]));

export function AudioPlayer() {
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);
  const setAudioStatus = useAppStore((s) => s.setAudioStatus);

  const handleEnded = useCallback(() => {
    setAudioStatus("idle");
  }, [setAudioStatus]);

  const { play, stop } = useAudio({ onEnded: handleEnded });
  const abortRef = useRef<AbortController | null>(null);

  const bird = useMemo(
    () => (selectedBirdId ? birdMap.get(selectedBirdId) ?? null : null),
    [selectedBirdId],
  );

  useEffect(() => {
    abortRef.current?.abort();
    stop();

    if (!bird) {
      setAudioStatus("idle");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setAudioStatus("loading");

    const tryPlay = async () => {
      if (controller.signal.aborted) return;

      if (bird.audioUrl) {
        try {
          await play(bird.audioUrl);
          if (!controller.signal.aborted) setAudioStatus("playing");
          return;
        } catch {
          // direct URL failed, fall through to xeno-canto
        }
      }

      const url = await fetchBirdAudio(bird.xenoCantoQuery, controller.signal);
      if (controller.signal.aborted) return;
      if (!url) {
        setAudioStatus("error");
        return;
      }
      await play(url);
      if (!controller.signal.aborted) setAudioStatus("playing");
    };

    tryPlay().catch((err) => {
      if (controller.signal.aborted) return;
      console.warn("Audio playback failed:", err);
      setAudioStatus("error");
    });

    return () => {
      controller.abort();
      stop();
    };
  }, [bird, play, stop, setAudioStatus]);

  return null;
}
