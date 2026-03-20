import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];

const REGION_EMOJI: Record<string, string> = {
  asia: "🏯",
  europe: "🏰",
  africa: "🌍",
  "north-america": "🗽",
  "south-america": "🌿",
  oceania: "🐨",
  antarctica: "🧊",
};

const RARITY_BADGE: Record<string, string> = {
  rare: "💎",
  legendary: "👑",
};

export function BirdEncyclopediaPanel() {
  const encyclopediaOpen = useAppStore((s) => s.encyclopediaOpen);
  const language = useAppStore((s) => s.language);
  const setEncyclopediaOpen = useAppStore((s) => s.setEncyclopediaOpen);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);

  const title = language === "zh" ? "📖 鸟类百科" : "📖 Bird Encyclopedia";

  const handleBirdClick = (bird: Bird) => {
    setSelectedBird(bird.id);
    setEncyclopediaOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setEncyclopediaOpen(true)}
        className="fixed left-4 top-52 z-10 flex h-10 items-center gap-1.5 rounded-full bg-black/65 px-3 text-sm font-semibold text-white shadow-lg backdrop-blur-lg transition-all hover:scale-105 active:scale-95"
        aria-label={language === "zh" ? "打开鸟类百科" : "Open Bird Encyclopedia"}
      >
        <span className="text-base">📖</span>
        <span className="hidden sm:inline">
          {language === "zh" ? "百科" : "Wiki"}
        </span>
      </button>

      {encyclopediaOpen && (
        <div className="fixed inset-0 z-20 flex">
          <button
            type="button"
            onClick={() => setEncyclopediaOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label={language === "zh" ? "关闭" : "Close"}
          />

          <div className="relative h-full w-80 max-w-[85vw] bg-white/95 shadow-2xl backdrop-blur-xl">
            <header className="flex items-center justify-between border-b border-amber-100 bg-amber-50/80 px-4 py-3">
              <h2 className="text-lg font-bold text-amber-900">{title}</h2>
              <button
                type="button"
                onClick={() => setEncyclopediaOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200/60 text-amber-700 hover:bg-amber-300"
                aria-label={language === "zh" ? "关闭" : "Close"}
              >
                ✕
              </button>
            </header>

            <div className="h-[calc(100%-3.5rem)] overflow-y-auto overscroll-contain">
              <ul className="divide-y divide-gray-100 p-2">
                {birds.map((bird) => (
                  <li key={bird.id}>
                    <button
                      type="button"
                      onClick={() => handleBirdClick(bird)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors duration-200 hover:bg-amber-50"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={bird.photoUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        {bird.rarity && RARITY_BADGE[bird.rarity] && (
                          <span className="absolute right-0 top-0 text-[10px]">
                            {RARITY_BADGE[bird.rarity]}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-800">
                          {language === "zh" ? bird.nameZh : bird.nameEn}
                        </div>
                        <div className="text-xs text-gray-500">
                          {language === "zh" ? bird.nameEn : bird.nameZh}
                        </div>
                        <span className="mt-0.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                          {REGION_EMOJI[bird.region] ?? "🌐"} {bird.region}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
