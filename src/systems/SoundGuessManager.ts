import birdsData from "../data/birds.json";
import type { Bird, SoundGuessOption } from "../types";

const birds = birdsData as Bird[];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateSoundGuessRound(): {
  correctBird: Bird;
  options: SoundGuessOption[];
} {
  const birdsWithAudio = birds.filter((b) => b.audioUrl || b.xenoCantoQuery);
  const pool = birdsWithAudio.length >= 3 ? birdsWithAudio : birds;
  const correctBird = pool[Math.floor(Math.random() * pool.length)];

  const distractors = shuffle(
    birds.filter((b) => b.id !== correctBird.id && b.region !== correctBird.region),
  );

  let picked = distractors.slice(0, 2);
  if (picked.length < 2) {
    const fallback = birds.filter((b) => b.id !== correctBird.id);
    picked = shuffle(fallback).slice(0, 2);
  }

  const allBirds = shuffle([correctBird, ...picked]);

  const options: SoundGuessOption[] = allBirds.map((b) => ({
    birdId: b.id,
    photoUrl: b.photoUrl,
    nameZh: b.nameZh,
    nameEn: b.nameEn,
  }));

  return { correctBird, options };
}
