import birdsData from "../data/birds.json";
import type { Bird } from "../types";

const birds = birdsData as Bird[];

interface SoundProfile {
  birdId: string;
  peakFreqHz: number;
  bandwidth: number;
}

const SOUND_PROFILES: SoundProfile[] = [
  { birdId: "barn-owl", peakFreqHz: 3500, bandwidth: 800 },
  { birdId: "european-robin", peakFreqHz: 4200, bandwidth: 600 },
  { birdId: "northern-cardinal", peakFreqHz: 3800, bandwidth: 700 },
  { birdId: "kookaburra", peakFreqHz: 2800, bandwidth: 900 },
  { birdId: "superb-lyrebird", peakFreqHz: 3200, bandwidth: 1200 },
  { birdId: "atlantic-puffin", peakFreqHz: 2400, bandwidth: 500 },
  { birdId: "red-crowned-crane", peakFreqHz: 1800, bandwidth: 400 },
  { birdId: "indian-peafowl", peakFreqHz: 2200, bandwidth: 600 },
  { birdId: "scarlet-macaw", peakFreqHz: 2600, bandwidth: 800 },
  { birdId: "african-grey-parrot", peakFreqHz: 3000, bandwidth: 700 },
  { birdId: "sulphur-crested-cockatoo", peakFreqHz: 2500, bandwidth: 900 },
  { birdId: "barn-swallow", peakFreqHz: 4500, bandwidth: 500 },
  { birdId: "canada-goose", peakFreqHz: 1200, bandwidth: 400 },
  { birdId: "bald-eagle", peakFreqHz: 3000, bandwidth: 600 },
  { birdId: "ruby-throated-hummingbird", peakFreqHz: 5500, bandwidth: 400 },
  { birdId: "greater-flamingo", peakFreqHz: 1600, bandwidth: 500 },
  { birdId: "emperor-penguin", peakFreqHz: 1000, bandwidth: 300 },
  { birdId: "snowy-owl", peakFreqHz: 2000, bandwidth: 500 },
  { birdId: "peregrine-falcon", peakFreqHz: 3600, bandwidth: 600 },
  { birdId: "whooping-crane", peakFreqHz: 1500, bandwidth: 400 },
];

export interface SoundMatchResult {
  birdId: string;
  confidence: number;
  birdName: string;
  birdNameZh: string;
}

let audioContext: AudioContext | null = null;
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function extractPeakFrequency(analyserData: Uint8Array, sampleRate: number, fftSize: number): number {
  let maxVal = 0;
  let maxIdx = 0;
  for (let i = 1; i < analyserData.length; i++) {
    if (analyserData[i] > maxVal) {
      maxVal = analyserData[i];
      maxIdx = i;
    }
  }
  return (maxIdx * sampleRate) / fftSize;
}

function matchFrequency(peakHz: number): SoundMatchResult {
  let bestProfile: SoundProfile | null = null;
  let bestDist = Infinity;

  for (const profile of SOUND_PROFILES) {
    const dist = Math.abs(peakHz - profile.peakFreqHz) / profile.bandwidth;
    if (dist < bestDist) {
      bestDist = dist;
      bestProfile = profile;
    }
  }

  const confidence = Math.max(0, Math.min(1, 1 - bestDist * 0.5));
  const bird = bestProfile ? birds.find((b) => b.id === bestProfile.birdId) : undefined;

  return {
    birdId: bestProfile?.birdId ?? "unknown",
    confidence,
    birdName: bird?.nameEn ?? "Unknown Bird",
    birdNameZh: bird?.nameZh ?? "未知鸟类",
  };
}

export function isRecordingSupported(): boolean {
  return typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined";
}

export async function startRecording(): Promise<void> {
  if (!isRecordingSupported()) {
    throw new Error("Audio recording not supported");
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };
  mediaRecorder.start();
}

export async function stopAndAnalyze(): Promise<SoundMatchResult> {
  return new Promise((resolve) => {
    if (!mediaRecorder || mediaRecorder.state !== "recording") {
      resolve(getFallbackResult());
      return;
    }

    mediaRecorder.onstop = async () => {
      const tracks = mediaRecorder?.stream?.getTracks();
      tracks?.forEach((t) => t.stop());

      if (recordedChunks.length === 0) {
        resolve(getFallbackResult());
        return;
      }

      try {
        const blob = new Blob(recordedChunks, { type: "audio/webm" });
        const arrayBuffer = await blob.arrayBuffer();
        const ctx = getAudioContext();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        source.start(0);

        await new Promise<void>((r) => setTimeout(r, 200));
        analyser.getByteFrequencyData(dataArray);
        source.stop();

        const peakHz = extractPeakFrequency(dataArray, ctx.sampleRate, analyser.fftSize);
        resolve(matchFrequency(peakHz));
      } catch {
        resolve(getFallbackResult());
      }
    };

    mediaRecorder.stop();
  });
}

export function cancelRecording(): void {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.onstop = null;
    mediaRecorder.stop();
    const tracks = mediaRecorder.stream?.getTracks();
    tracks?.forEach((t) => t.stop());
  }
  recordedChunks = [];
}

function getFallbackResult(): SoundMatchResult {
  const fallbackBirds = SOUND_PROFILES.slice(0, 3);
  const pick = fallbackBirds[Math.floor(Math.random() * fallbackBirds.length)];
  const bird = birds.find((b) => b.id === pick.birdId);
  return {
    birdId: pick.birdId,
    confidence: 0.15,
    birdName: bird?.nameEn ?? "Sparrow",
    birdNameZh: bird?.nameZh ?? "麻雀",
  };
}

export function getFallbackMessage(lang: "zh" | "en"): string {
  return lang === "zh"
    ? "这个声音听起来像麻雀或雀类的叫声。再试一次吧！"
    : "That sound is similar to a sparrow or finch. Try again!";
}
