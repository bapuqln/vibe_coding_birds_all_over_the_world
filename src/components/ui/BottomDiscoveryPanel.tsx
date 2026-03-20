import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];

export function BottomDiscoveryPanel() {
  const discoveredBirds = useAppStore((s) => s.discoveredBirds);
  const language = useAppStore((s) => s.language);
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);

  const totalBirds = birds.length;
  const discoveredCount = discoveredBirds.length;
  const pct = totalBirds > 0 ? (discoveredCount / totalBirds) * 100 : 0;

  if (selectedBirdId) return null;

  return (
    <div
      className="pointer-events-auto fixed glass-panel"
      style={{
        bottom: "var(--safe-area)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(360px, calc(100% - 280px))",
        padding: "12px 20px",
        animation: "panelSlideUp var(--panel-duration) var(--panel-ease)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
          {language === "zh" ? "🐦 已发现鸟类" : "🐦 Birds Discovered"}
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
    </div>
  );
}
