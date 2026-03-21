import { useMemo, useState } from "react";
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

const REGION_NAME_ZH: Record<string, string> = {
  asia: "亚洲",
  europe: "欧洲",
  africa: "非洲",
  "north-america": "北美洲",
  "south-america": "南美洲",
  oceania: "大洋洲",
  antarctica: "南极洲",
};

const REGION_NAME_EN: Record<string, string> = {
  asia: "Asia",
  europe: "Europe",
  africa: "Africa",
  "north-america": "North America",
  "south-america": "South America",
  oceania: "Oceania",
  antarctica: "Antarctica",
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
  const discoveredBirds = useAppStore((s) => s.discoveredBirds);
  const [hintRegion, setHintRegion] = useState<string | null>(null);

  const discoveredSet = useMemo(() => new Set(discoveredBirds), [discoveredBirds]);

  const sortedBirds = useMemo(() => {
    const discovered = birds.filter((b) => discoveredSet.has(b.id));
    const locked = birds.filter((b) => !discoveredSet.has(b.id));
    return [...discovered, ...locked];
  }, [discoveredSet]);

  const title = language === "zh" ? "📖 鸟类百科" : "📖 Bird Encyclopedia";
  const discoveredCount = discoveredBirds.length;
  const totalCount = birds.length;
  const progressPct = totalCount > 0 ? (discoveredCount / totalCount) * 100 : 0;

  const handleBirdClick = (bird: Bird) => {
    if (discoveredSet.has(bird.id)) {
      setSelectedBird(bird.id);
      setEncyclopediaOpen(false);
    } else {
      setHintRegion(bird.region);
      setTimeout(() => setHintRegion(null), 2500);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setEncyclopediaOpen(true)}
        className="fixed flex h-10 items-center gap-1.5 rounded-full bg-black/65 px-3 text-sm font-semibold text-white shadow-lg backdrop-blur-lg transition-all hover:scale-105 active:scale-95"
        style={{ left: "var(--safe-area)", top: 192 }}
        aria-label={language === "zh" ? "打开鸟类百科" : "Open Bird Encyclopedia"}
      >
        <span className="text-base">📖</span>
        <span className="hidden sm:inline">
          {language === "zh" ? "百科" : "Wiki"}
        </span>
      </button>

      {encyclopediaOpen && (
        <div className="pointer-events-auto fixed inset-0 flex" style={{ zIndex: "var(--z-modal)", animation: "panelSlideRight var(--panel-duration) var(--panel-ease)" }}>
          <button
            type="button"
            onClick={() => setEncyclopediaOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label={language === "zh" ? "关闭" : "Close"}
          />

          <div className="relative h-full w-80 max-w-[85vw] bg-white/95 shadow-2xl backdrop-blur-xl">
            <header className="border-b border-amber-100 bg-amber-50/80 px-4 py-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-amber-900">{title}</h2>
                <button
                  type="button"
                  onClick={() => setEncyclopediaOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200/60 text-amber-700 hover:bg-amber-300"
                  aria-label={language === "zh" ? "关闭" : "Close"}
                >
                  ✕
                </button>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-amber-700">
                  <span>
                    {language === "zh"
                      ? `${discoveredCount} / ${totalCount} 种鸟类已发现`
                      : `${discoveredCount} / ${totalCount} birds discovered`}
                  </span>
                  <span>{Math.round(progressPct)}%</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-amber-100">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-400 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </header>

            <div className="h-[calc(100%-5.5rem)] overflow-y-auto overscroll-contain">
              <ul className="divide-y divide-gray-100 p-2">
                {sortedBirds.map((bird) => {
                  const isDiscovered = discoveredSet.has(bird.id);
                  return (
                    <li key={bird.id}>
                      <button
                        type="button"
                        onClick={() => handleBirdClick(bird)}
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors duration-200 ${
                          isDiscovered ? "hover:bg-amber-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                          {isDiscovered ? (
                            <>
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
                            </>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xl text-gray-400">
                              ?
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          {isDiscovered ? (
                            <>
                              <div className="font-medium text-gray-800">
                                {language === "zh" ? bird.nameZh : bird.nameEn}
                              </div>
                              <div className="text-xs text-gray-500">
                                {language === "zh" ? bird.nameEn : bird.nameZh}
                              </div>
                              <span className="mt-0.5 inline-block rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-600">
                                {language === "zh" ? "已发现" : "Discovered"}
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="font-medium text-gray-400">
                                {language === "zh" ? "???" : "???"}
                              </div>
                              <div className="text-xs text-gray-300">
                                {REGION_EMOJI[bird.region] ?? "🌐"}{" "}
                                {language === "zh"
                                  ? REGION_NAME_ZH[bird.region] ?? bird.region
                                  : REGION_NAME_EN[bird.region] ?? bird.region}
                              </div>
                              <span className="mt-0.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                                🔒 {language === "zh" ? "未发现" : "Locked"}
                              </span>
                            </>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {hintRegion && (
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg"
                style={{ animation: "panelSlideUp 0.3s ease-out" }}
              >
                {language === "zh"
                  ? `💡 试试探索${REGION_NAME_ZH[hintRegion] ?? hintRegion}！`
                  : `💡 Try exploring ${REGION_NAME_EN[hintRegion] ?? hintRegion}!`}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
