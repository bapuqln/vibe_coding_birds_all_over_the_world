import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];

function pickRandomBird(excludeId: string | null): Bird {
  const candidates = excludeId
    ? birds.filter((b) => b.id !== excludeId)
    : birds;
  if (candidates.length === 0) return birds[0];
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function DiscoverButton() {
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);
  const language = useAppStore((s) => s.language);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);

  const label = language === "zh" ? "🎲 发现" : "🎲 Discover";

  const handleClick = () => {
    const bird = pickRandomBird(selectedBirdId);
    setSelectedBird(bird.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed right-4 bottom-4 z-30 flex min-h-12 items-center justify-center rounded-full bg-linear-to-r from-amber-400 to-orange-500 px-5 font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
      aria-label={language === "zh" ? "随机发现一只鸟" : "Discover a random bird"}
    >
      {label}
    </button>
  );
}
