import type { Language, HabitatType } from "../../types";

const HABITAT_COLORS: Record<string, string> = {
  rainforest: "#22c55e",
  wetlands: "#06b6d4",
  coast: "#3b82f6",
  grassland: "#eab308",
  forest: "#16a34a",
  polar: "#93c5fd",
  mountains: "#a855f7",
  desert: "#f97316",
  ocean: "#0ea5e9",
  tundra: "#94a3b8",
};

interface WingspanBarProps {
  wingspanCm: number;
  habitatType?: HabitatType;
  language: Language;
}

export function WingspanBar({ wingspanCm, habitatType, language }: WingspanBarProps) {
  if (wingspanCm <= 0) return null;

  const maxRange = 370;
  const childArmSpan = 120;
  const pct = Math.min((wingspanCm / maxRange) * 100, 100);
  const refPct = (childArmSpan / maxRange) * 100;
  const barColor = habitatType ? HABITAT_COLORS[habitatType] || "#3b82f6" : "#3b82f6";

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "#6d28d9" }}>
        <span>
          {language === "zh" ? `翼展：${wingspanCm}厘米` : `Wingspan: ${wingspanCm} cm`}
        </span>
      </div>
      <div style={{ position: "relative", marginTop: 6, height: 12, width: "100%", overflow: "hidden", borderRadius: 9999, background: "#ede9fe" }}>
        <div
          style={{
            height: "100%",
            borderRadius: 9999,
            transition: "width 0.5s",
            width: `${pct}%`,
            backgroundColor: barColor,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            height: "100%",
            borderRight: "2px dashed rgba(107,114,128,0.6)",
            left: `${refPct}%`,
          }}
        />
      </div>
      <div style={{ marginTop: 2, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af" }}>
        <span>0</span>
        <span style={{ position: "relative", left: `${refPct - 50}%`, fontWeight: 500, color: "#6b7280" }}>
          {language === "zh" ? "你的臂展" : "Your arm span"}
        </span>
        <span>{maxRange}cm</span>
      </div>
    </div>
  );
}
