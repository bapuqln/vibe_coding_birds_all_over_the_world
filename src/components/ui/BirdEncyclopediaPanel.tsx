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
      {/* Toggle button - always visible */}
      <button
        type="button"
        onClick={() => setEncyclopediaOpen(true)}
        className="fixed left-4 top-20 z-30 flex min-h-12 items-center justify-center rounded-full bg-white/95 px-4 shadow-lg backdrop-blur-sm transition-transform duration-200 hover:scale-105 active:scale-95 md:left-6 md:top-24"
        aria-label={language === "zh" ? "打开鸟类百科" : "Open Bird Encyclopedia"}
      >
        <span className="text-xl">📖</span>
      </button>

      {/* Slide-in panel */}
      <div
        className="fixed left-0 top-0 bottom-0 z-40 w-80 max-w-[85vw] bg-white/95 shadow-xl backdrop-blur-sm transition-transform duration-300 ease-out"
        style={{
          transform: encyclopediaOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button
            type="button"
            onClick={() => setEncyclopediaOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors duration-200 hover:bg-slate-200 hover:text-slate-700"
            aria-label={language === "zh" ? "关闭" : "Close"}
          >
            ✕
          </button>
        </header>

        <div className="h-[calc(100%-3.5rem)] overflow-y-auto overscroll-contain">
          <ul className="divide-y divide-slate-100 p-2">
            {birds.map((bird) => (
              <li key={bird.id}>
                <button
                  type="button"
                  onClick={() => handleBirdClick(bird)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors duration-200 hover:bg-amber-50"
                >
                  <img
                    src={bird.photoUrl}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-800">
                      {language === "zh" ? bird.nameZh : bird.nameEn}
                    </div>
                    <div className="text-xs text-slate-500">
                      {language === "zh" ? bird.nameEn : bird.nameZh}
                    </div>
                    <span className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                      {REGION_EMOJI[bird.region] ?? "🌐"} {bird.region}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
