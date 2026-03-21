import { useMemo, useState } from "react";
import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];

const REGIONS = [
  { id: "asia", zh: "亚洲", en: "Asia", emoji: "🏯", color: "#3b82f6" },
  { id: "europe", zh: "欧洲", en: "Europe", emoji: "🏰", color: "#8b5cf6" },
  { id: "africa", zh: "非洲", en: "Africa", emoji: "🌍", color: "#f59e0b" },
  { id: "north-america", zh: "北美洲", en: "North America", emoji: "🗽", color: "#ef4444" },
  { id: "south-america", zh: "南美洲", en: "South America", emoji: "🌿", color: "#22c55e" },
  { id: "oceania", zh: "大洋洲", en: "Oceania", emoji: "🐨", color: "#14b8a6" },
  { id: "antarctica", zh: "南极洲", en: "Antarctica", emoji: "🧊", color: "#06b6d4" },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedRegions, setCollapsedRegions] = useState<Set<string>>(new Set());

  const discoveredSet = useMemo(() => new Set(discoveredBirds), [discoveredBirds]);

  const filteredBirds = useMemo(() => {
    if (!searchQuery.trim()) return birds;
    const q = searchQuery.toLowerCase();
    return birds.filter(
      (b) =>
        b.nameZh.toLowerCase().includes(q) ||
        b.nameEn.toLowerCase().includes(q) ||
        (b.pinyin && b.pinyin.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  const groupedBirds = useMemo(() => {
    const groups: Record<string, { discovered: Bird[]; locked: Bird[] }> = {};
    for (const region of REGIONS) {
      groups[region.id] = { discovered: [], locked: [] };
    }
    for (const bird of filteredBirds) {
      const group = groups[bird.region];
      if (!group) continue;
      if (discoveredSet.has(bird.id)) {
        group.discovered.push(bird);
      } else {
        group.locked.push(bird);
      }
    }
    return groups;
  }, [filteredBirds, discoveredSet]);

  const title = language === "zh" ? "鸟类百科" : "Bird Encyclopedia";
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

  const toggleRegion = (regionId: string) => {
    setCollapsedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(regionId)) next.delete(regionId);
      else next.add(regionId);
      return next;
    });
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
                <h2 className="text-lg font-bold text-amber-900">📖 {title}</h2>
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

              <div className="mt-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === "zh" ? "🔍 搜索鸟类..." : "🔍 Search birds..."}
                  className="w-full rounded-lg border border-amber-200 bg-white/80 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300"
                />
              </div>
            </header>

            <div className="h-[calc(100%-8rem)] overflow-y-auto overscroll-contain">
              {REGIONS.map((region) => {
                const group = groupedBirds[region.id];
                if (!group) return null;
                const regionBirds = [...group.discovered, ...group.locked];
                if (regionBirds.length === 0) return null;
                const isCollapsed = collapsedRegions.has(region.id);
                const regionDiscovered = group.discovered.length;
                const regionTotal = birds.filter((b) => b.region === region.id).length;

                return (
                  <div key={region.id}>
                    <button
                      type="button"
                      onClick={() => toggleRegion(region.id)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <span>{region.emoji}</span>
                        <span className="text-sm font-bold text-gray-700">
                          {language === "zh" ? region.zh : region.en}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                          style={{ background: region.color }}
                        >
                          {regionDiscovered}/{regionTotal}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {isCollapsed ? "▶" : "▼"}
                      </span>
                    </button>

                    {!isCollapsed && (
                      <ul className="divide-y divide-gray-50 px-2 pb-1">
                        {regionBirds.map((bird) => {
                          const isDiscovered = discoveredSet.has(bird.id);
                          return (
                            <li key={bird.id}>
                              <button
                                type="button"
                                onClick={() => handleBirdClick(bird)}
                                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors duration-200 ${
                                  isDiscovered ? "hover:bg-amber-50" : "hover:bg-gray-50"
                                }`}
                              >
                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
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
                                    <div className="flex h-full w-full items-center justify-center bg-gray-200 text-lg text-gray-400">
                                      ?
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  {isDiscovered ? (
                                    <>
                                      <div className="text-sm font-medium text-gray-800">
                                        {language === "zh" ? bird.nameZh : bird.nameEn}
                                      </div>
                                      <div className="text-[11px] text-gray-500">
                                        {language === "zh" ? bird.nameEn : bird.nameZh}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="text-sm font-medium text-gray-400">???</div>
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
                    )}
                  </div>
                );
              })}
            </div>

            {hintRegion && (
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg"
                style={{ animation: "panelSlideUp 0.3s ease-out" }}
              >
                {language === "zh"
                  ? `💡 试试探索${REGIONS.find((r) => r.id === hintRegion)?.zh ?? hintRegion}！`
                  : `💡 Try exploring ${REGIONS.find((r) => r.id === hintRegion)?.en ?? hintRegion}!`}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
