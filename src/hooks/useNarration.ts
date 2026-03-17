import { useState, useCallback, useRef, useEffect } from "react";
import type { Bird, Language } from "../types";
import { useAppStore } from "../store";

export type NarrationState = "idle" | "speaking" | "unavailable";

function buildNarrationText(bird: Bird, language: Language): string {
  const name = language === "zh" ? bird.nameZh : bird.nameEn;
  const funFact = language === "zh" ? bird.funFactZh : bird.funFactEn;

  if (language === "zh") {
    const parts = [`这是${name}。`];
    if (bird.scientificName) {
      parts.push(`它的学名是${bird.scientificName}。`);
    }
    if (bird.habitatType) {
      const habitatMap: Record<string, string> = {
        rainforest: "热带雨林", wetlands: "湿地", coast: "海岸",
        grassland: "草原", forest: "森林", polar: "极地",
        mountains: "山地", desert: "沙漠", ocean: "海洋", tundra: "苔原",
      };
      parts.push(`它生活在${habitatMap[bird.habitatType] || bird.habitatType}中。`);
    }
    if (bird.wingspan) {
      parts.push(`它的翼展约为${bird.wingspan}。`);
    }
    if (bird.lifespan) {
      parts.push(`它的寿命大约是${bird.lifespan}。`);
    }
    if (funFact) {
      parts.push(funFact);
    }
    return parts.join(" ");
  }

  const parts = [`This is the ${name}.`];
  if (bird.scientificName) {
    parts.push(`Its scientific name is ${bird.scientificName}.`);
  }
  if (bird.habitatType) {
    const habitatMap: Record<string, string> = {
      rainforest: "rainforests", wetlands: "wetlands", coast: "coastal areas",
      grassland: "grasslands", forest: "forests", polar: "polar regions",
      mountains: "mountains", desert: "deserts", ocean: "oceans", tundra: "tundra",
    };
    parts.push(`It lives in ${habitatMap[bird.habitatType] || bird.habitatType}.`);
  }
  if (bird.wingspan) {
    parts.push(`Its wingspan is about ${bird.wingspan}.`);
  }
  if (bird.lifespan) {
    parts.push(`It can live for ${bird.lifespan}.`);
  }
  if (funFact) {
    parts.push(funFact);
  }
  return parts.join(" ");
}

export function useNarration() {
  const [state, setState] = useState<NarrationState>("idle");
  const [narrationText, setNarrationText] = useState<string>("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isAvailable = typeof window !== "undefined" && "speechSynthesis" in window;

  const stop = useCallback(() => {
    if (isAvailable) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setState("idle");
  }, [isAvailable]);

  useEffect(() => {
    return () => {
      if (isAvailable) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isAvailable]);

  const speak = useCallback(
    (bird: Bird, language: Language) => {
      const text = buildNarrationText(bird, language);
      setNarrationText(text);

      if (!isAvailable) {
        setState("unavailable");
        return;
      }

      useAppStore.getState().stopSpeaking();
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.9;

      const voices = window.speechSynthesis.getVoices();
      if (language === "zh") {
        const zhVoice = voices.find(
          (v) => v.lang.startsWith("zh") && !v.name.includes("Compact"),
        );
        if (zhVoice) utterance.voice = zhVoice;
        utterance.lang = "zh-CN";
      } else {
        const enVoice = voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Samantha") ||
              v.name.includes("Karen") ||
              v.name.includes("Google") ||
              v.name.includes("Female")),
        ) || voices.find((v) => v.lang.startsWith("en"));
        if (enVoice) utterance.voice = enVoice;
        utterance.lang = "en-US";
      }

      utterance.onstart = () => setState("speaking");
      utterance.onend = () => {
        setState("idle");
        utteranceRef.current = null;
      };
      utterance.onerror = () => {
        setState("idle");
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isAvailable],
  );

  return { state, narrationText, speak, stop, isAvailable };
}
