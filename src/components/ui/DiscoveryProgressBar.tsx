import { useMemo, useState } from "react";
import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];

const REGIONS: { id: string; labelZh: string; labelEn: string; emoji: string }[] = [
  { id: "asia", labelZh: "亚洲", labelEn: "Asia", emoji: "🏯" },
  { id: "europe", labelZh: "欧洲", labelEn: "Europe", emoji: "🏰" },
  { id: "africa", labelZh: "非洲", labelEn: "Africa", emoji: "🌍" },
  { id: "north-america", labelZh: "北美洲", labelEn: "N. America", emoji: "🗽" },
  { id: "south-america", labelZh: "南美洲", labelEn: "S. America", emoji: "🌿" },
  { id: "oceania", labelZh: "大洋洲", labelEn: "Oceania", emoji: "🐨" },
  { id: "antarctica", labelZh: "南极洲", labelEn: "Antarctica", emoji: "🧊" },
];

export function DiscoveryProgressBar() {
  const discoveredBirds = useAppStore((s) => s.discoveredBirds);
  const language = useAppStore((s) => s.language);
  const [expanded, setExpanded] = useState(false);

  const totalBirds = birds.length;
  const discoveredCount = discoveredBirds.length;
  const globalPct = totalBirds > 0 ? (discoveredCount / totalBirds) * 100 : 0;

  const regionStats = useMemo(() => {
    const discoveredSet = new Set(discoveredBirds);
    return REGIONS.map((r) => {
      const regionBirds = birds.filter((b) => b.region === r.id);
      const found = regionBirds.filter((b) => discoveredSet.has(b.id)).length;
      return { ...r, total: regionBirds.length, found };
    }).filter((r) => r.total > 0);
  }, [discoveredBirds]);

  if (discoveredCount === 0) return null;

  return (
    <div
      className="pointer-events-auto fixed"
      style={{
        left: "var(--safe-area)",
        top: 80,
        width: 200,
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          borderRadius: 14,
          background: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          padding: "10px 14px",
          border: "none",
          cursor: "pointer",
          color: "white",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>
            {language === "zh" ? "🐦 探索进度" : "🐦 Discovery"}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700 }}>
            {discoveredCount} / {totalBirds}
          </span>
        </div>
        <div style={{
          height: 6,
          borderRadius: 3,
          background: "rgba(255,255,255,0.15)",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            borderRadius: 3,
            background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
            width: `${globalPct}%`,
            transition: "width 0.5s ease-out",
          }} />
        </div>
      </button>

      {expanded && (
        <div style={{
          marginTop: 6,
          borderRadius: 14,
          background: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          {regionStats.map((r) => {
            const pct = r.total > 0 ? (r.found / r.total) * 100 : 0;
            return (
              <div key={r.id}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                    {r.emoji} {language === "zh" ? r.labelZh : r.labelEn}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                    {r.found}/{r.total}
                  </span>
                </div>
                <div style={{
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.1)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    borderRadius: 2,
                    background: pct === 100 ? "#22c55e" : "#fbbf24",
                    width: `${pct}%`,
                    transition: "width 0.5s ease-out",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
