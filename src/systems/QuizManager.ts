import birdsData from "../data/birds.json";
import type { Bird, QuizQuestion } from "../types";

const birds = birdsData as Bird[];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  return shuffle(arr).slice(0, count);
}

function generateGeographyQuestion(): QuizQuestion {
  const bird = birds[Math.floor(Math.random() * birds.length)];
  const regionMap: Record<string, string> = {
    asia: "Asia",
    europe: "Europe",
    africa: "Africa",
    "north-america": "North America",
    "south-america": "South America",
    oceania: "Oceania",
    antarctica: "Antarctica",
  };
  const regionMapZh: Record<string, string> = {
    asia: "亚洲",
    europe: "欧洲",
    africa: "非洲",
    "north-america": "北美洲",
    "south-america": "南美洲",
    oceania: "大洋洲",
    antarctica: "南极洲",
  };
  const regionName = regionMap[bird.region] || bird.region;
  const regionNameZh = regionMapZh[bird.region] || bird.region;

  const wrongBirds = birds.filter((b) => b.region !== bird.region);
  const wrongOptions = pickRandom(wrongBirds, 2).map((b) => b.id);
  const options = shuffle([bird.id, ...wrongOptions]);

  return {
    type: "geography",
    prompt: `Which bird lives in ${regionName}?`,
    promptZh: `哪只鸟生活在${regionNameZh}？`,
    correctBirdId: bird.id,
    options,
  };
}

function generateSoundQuestion(): QuizQuestion {
  const bird = birds[Math.floor(Math.random() * birds.length)];
  const wrongBirds = birds.filter((b) => b.id !== bird.id);
  const wrongOptions = pickRandom(wrongBirds, 2).map((b) => b.id);
  const options = shuffle([bird.id, ...wrongOptions]);

  return {
    type: "sound",
    prompt: "Listen to the bird call. Which bird is it?",
    promptZh: "听这个鸟叫声，这是哪只鸟？",
    correctBirdId: bird.id,
    options,
  };
}

function generateSizeQuestion(): QuizQuestion {
  const birdsWithSize = birds.filter((b) => b.sizeCategory);
  if (birdsWithSize.length < 3) return generateGeographyQuestion();

  const sizeOrder = { tiny: 0, small: 1, medium: 2, large: 3 };
  const selected = pickRandom(birdsWithSize, 3);
  selected.sort(
    (a, b) =>
      (sizeOrder[b.sizeCategory!] ?? 0) - (sizeOrder[a.sizeCategory!] ?? 0),
  );
  const largest = selected[0];
  const options = shuffle(selected.map((b) => b.id));

  return {
    type: "size",
    prompt: "Which of these birds is the largest?",
    promptZh: "这些鸟中哪只最大？",
    correctBirdId: largest.id,
    options,
  };
}

export function generateQuizRound(): QuizQuestion[] {
  const generators = [
    generateGeographyQuestion,
    generateSoundQuestion,
    generateSizeQuestion,
  ];
  return shuffle(generators)
    .slice(0, 3)
    .map((gen) => gen());
}
