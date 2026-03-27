import type { TTSStatus } from "../types";

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isTTSAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(
  text: string,
  lang: "zh" | "en",
  onEnd?: () => void,
): TTSStatus {
  if (!isTTSAvailable()) return "unavailable";
  stop();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.lang = lang === "zh" ? "zh-CN" : "en-US";

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };
  utterance.onerror = () => {
    currentUtterance = null;
    onEnd?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return "speaking";
}

export function stop() {
  if (isTTSAvailable()) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function getTTSStatus(): TTSStatus {
  if (!isTTSAvailable()) return "unavailable";
  if (currentUtterance && window.speechSynthesis.speaking) return "speaking";
  return "idle";
}
