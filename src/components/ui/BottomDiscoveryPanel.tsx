import { useMemo } from "react";
import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];

const REGIONS = [
  { id: "asia", zh: "亚洲", en: "Asia", emoji: "🏯" },
  { id: "europe", zh: "欧洲", en: "Europe", emoji: "🏰" },
  { id: "africa", zh: "非洲", en: "Africa", emoji: "🌍" },
  { id: "north-america", zh: "北美洲", en: "North America", emoji: "🗽" },
  { id: "south-america", zh: "南美洲", en: "South America", emoji: "🌿" },
  { id: "oceania", zh: "大洋洲", en: "Oceania", emoji: "🐨" },
  { id: "antarctica", zh: "南极洲", en: "Antarctica", emoji: "🧊" },
];

const ENCOURAGEMENTS_ZH: Record<string, string> = {
  "south-america": "试试探索南美洲吧！那里有很多色彩缤纷的鸟类。",
  africa: "去非洲看看吧！那里有许多独特的鸟类等你发现。",
  asia: "亚洲有很多美丽的鸟类，快去探索吧！",
  europe: "欧洲的鸟类也很有趣，去看看吧！",
  oceania: "大洋洲有很多独特的鸟类，快去发现吧！",
  "north-america": "北美洲有很多壮观的鸟类等你发现！",
  antarctica: "南极洲的企鹅在等你！去探索吧！",
};

const ENCOURAGEMENTS_EN: Record<string, string> = {
  "south-america": "Try exploring South America. Many colorful birds live there!",
  africa: "Explore Africa! Many unique birds are waiting for you.",
  asia: "Asia has beautiful birds to discover. Go explore!",
  europe: "European birds are fascinating. Take a look!",
  oceania: "Oceania has unique birds. Go discover them!",
  "north-america": "North America has amazing birds waiting for you!",
  antarctica: "Penguins are waiting in Antarctica! Go explore!",
};

export function BottomDiscoveryPanel() {
  const discoveredBirds = useAppStore((s) => s.discoveredBirds);
  const language = useAppStore((s) => s.language);
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);

  const totalBirds = birds.length;
  const discoveredCount = discoveredBirds.length;
  const pct = totalBirds > 0 ? (discoveredCount / totalBirds) * 100 : 0;

  const encouragement = useMemo(() => {
    if (discoveredCount === 0) return null;
    const discoveredSet = new Set(discoveredBirds);
    let lowestRegion: string | null = null;
    let lowestPct = 1;

    for (const region of REGIONS) {
      const regionBirds = birds.filter((b) => b.region === region.id);
      if (regionBirds.length === 0) continue;
      const found = regionBirds.filter((b) => discoveredSet.has(b.id)).length;
      const regionPct = found / regionBirds.length;
      if (regionPct < lowestPct) {
        lowestPct = regionPct;
        lowestRegion = region.id;
      }
    }

    if (!lowestRegion || lowestPct >= 0.5) return null;
    return language === "zh"
      ? ENCOURAGEMENTS_ZH[lowestRegion]
      : ENCOURAGEMENTS_EN[lowestRegion];
  }, [discoveredBirds, discoveredCount, language]);

  if (selectedBirdId) return null;

  return (
    <div
      className="pointer-events-auto fixed glass-panel"
      style={{
        bottom: "var(--safe-area)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(400px, calc(100% - 280px))",
        padding: "12px 20px",
        animation: "panelSlideUp var(--panel-duration) var(--panel-ease)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
          {language === "zh" ? "🌍 世界鸟类探索" : "🌍 World Bird Discovery"}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>
          {discoveredCount} / {totalBirds}
        </span>
      </div>

      <div style={{
        height: 6,
        borderRadius: 3,
        background: "rgba(255,255,255,0.12)",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          borderRadius: 3,
          background: "linear-gradient(90deg, #fbbf24, #f59e0b, #f97316)",
          width: `${pct}%`,
          transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 0 8px rgba(251, 191, 36, 0.4)",
        }} />
      </div>

      {discoveredCount > 0 && (
        <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
          {discoveredBirds.slice(-5).map((id) => {
            const b = birds.find((bird) => bird.id === id);
            if (!b) return null;
            return (
              <span
                key={id}
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.6)",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: "2px 8px",
                }}
              >
                {language === "zh" ? b.nameZh : b.nameEn}
              </span>
            );
          })}
        </div>
      )}

      {encouragement && (
        <div style={{
          marginTop: 8,
          padding: "6px 10px",
          borderRadius: 10,
          background: "rgba(251, 191, 36, 0.15)",
          border: "1px solid rgba(251, 191, 36, 0.2)",
        }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.4 }}>
            💡 {encouragement}
          </p>
        </div>
      )}
    </div>
  );
}
