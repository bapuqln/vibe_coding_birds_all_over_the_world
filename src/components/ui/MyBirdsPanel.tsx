import { useMemo, useState } from "react";
import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];

const RARITY_BADGE: Record<string, string> = {
  common: "",
  rare: "💎",
  legendary: "👑",
};

const REGION_TABS = [
  { id: "all", labelZh: "全部", labelEn: "All" },
  { id: "asia", labelZh: "亚洲", labelEn: "Asia" },
  { id: "europe", labelZh: "欧洲", labelEn: "Europe" },
  { id: "africa", labelZh: "非洲", labelEn: "Africa" },
  { id: "north-america", labelZh: "北美", labelEn: "N.Am" },
  { id: "south-america", labelZh: "南美", labelEn: "S.Am" },
  { id: "oceania", labelZh: "大洋洲", labelEn: "Oceania" },
  { id: "antarctica", labelZh: "南极", labelEn: "Antarctic" },
];

export function MyBirdsPanel() {
  const isCollectionOpen = useAppStore((s) => s.isCollectionOpen);
  const setCollectionOpen = useAppStore((s) => s.setCollectionOpen);
  const collectedBirds = useAppStore((s) => s.collectedBirds);
  const discoveredBirds = useAppStore((s) => s.discoveredBirds);
  const language = useAppStore((s) => s.language);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);
  const [activeTab, setActiveTab] = useState("all");

  const collectedSet = useMemo(
    () => new Set(collectedBirds.map((b) => b.birdId)),
    [collectedBirds],
  );
  const discoveredSet = useMemo(
    () => new Set(discoveredBirds),
    [discoveredBirds],
  );

  const filteredBirds = useMemo(
    () => activeTab === "all" ? birds : birds.filter((b) => b.region === activeTab),
    [activeTab],
  );

  if (!isCollectionOpen) return null;

  const handleBirdClick = (birdId: string) => {
    if (discoveredSet.has(birdId)) {
      setSelectedBird(birdId);
      setCollectionOpen(false);
    }
  };

  const totalDiscovered = discoveredBirds.length;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={() => setCollectionOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label={language === "zh" ? "关闭" : "Close"}
      />

      <div
        className="relative max-h-[85vh] w-full max-w-lg overflow-hidden shadow-2xl"
        style={{
          borderRadius: 20,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <header className="flex items-center justify-between border-b border-amber-100 bg-amber-50/80 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-amber-900">
              {language === "zh" ? "🐦 鸟类图鉴" : "🐦 Bird Collection"}
            </h2>
            <p className="text-xs text-amber-600">
              {language === "zh"
                ? `已发现 ${totalDiscovered}/${birds.length} · 已收集 ${collectedBirds.length}`
                : `Discovered ${totalDiscovered}/${birds.length} · Collected ${collectedBirds.length}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCollectionOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200/60 text-amber-700 transition-colors hover:bg-amber-300"
            aria-label={language === "zh" ? "关闭" : "Close"}
          >
            ✕
          </button>
        </header>

        {/* Region tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-4 py-2" style={{ scrollbarWidth: "none" }}>
          {REGION_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="shrink-0 transition-all"
              style={{
                borderRadius: 9999,
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: activeTab === tab.id ? 700 : 500,
                border: "none",
                cursor: "pointer",
                background: activeTab === tab.id ? "#f59e0b" : "rgba(0,0,0,0.05)",
                color: activeTab === tab.id ? "white" : "#6b7280",
              }}
            >
              {language === "zh" ? tab.labelZh : tab.labelEn}
            </button>
          ))}
        </div>

        <div className="max-h-[calc(85vh-8rem)] overflow-y-auto overscroll-contain p-4">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {filteredBirds.map((bird) => {
              const isDiscovered = discoveredSet.has(bird.id);
              const isCollected = collectedSet.has(bird.id);
              return (
                <button
                  key={bird.id}
                  type="button"
                  onClick={() => handleBirdClick(bird.id)}
                  className="group flex flex-col items-center gap-1.5 rounded-xl border p-2 shadow-sm transition-all active:scale-95"
                  style={{
                    borderColor: isCollected ? "rgba(251, 191, 36, 0.4)" : isDiscovered ? "rgba(209, 213, 219, 0.5)" : "rgba(229, 231, 235, 0.3)",
                    background: isCollected ? "rgba(255, 251, 235, 0.8)" : "white",
                    cursor: isDiscovered ? "pointer" : "default",
                    opacity: isDiscovered ? 1 : 0.6,
                  }}
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg" style={{ background: isDiscovered ? undefined : "#e5e7eb" }}>
                    {isDiscovered ? (
                      <>
                        <img
                          src={bird.photoUrl}
                          alt={bird.nameEn}
                          className="h-full w-full object-cover"
                        />
                        {bird.rarity && RARITY_BADGE[bird.rarity] && (
                          <span className="absolute right-0.5 top-0.5 text-xs">
                            {RARITY_BADGE[bird.rarity]}
                          </span>
                        )}
                        {isCollected && (
                          <span className="absolute bottom-0.5 left-0.5 text-xs">⭐</span>
                        )}
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl text-gray-400">
                        ?
                      </div>
                    )}
                  </div>
                  <span className="max-w-full truncate text-[11px] font-medium" style={{ color: isDiscovered ? "#374151" : "#9ca3af" }}>
                    {isDiscovered
                      ? (language === "zh" ? bird.nameZh : bird.nameEn)
                      : "???"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
