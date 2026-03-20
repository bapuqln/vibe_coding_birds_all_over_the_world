import type { Language, HabitatType } from "../../types";

const HABITAT_COLORS: Record<string, string> = {
  rainforest: "#22c55e",
  wetlands: "#06b6d4",
  coast: "#3b82f6",
  grassland: "#eab308",
  forest: "#16a34a",
  polar: "#93c5fd",
};

interface WingspanBarProps {
  wingspanCm: number;
  habitatType?: HabitatType;
  language: Language;
}

export function WingspanBar({ wingspanCm, habitatType, language }: WingspanBarProps) {
  const maxRange = 250;
  const childArmSpan = 120;
  const pct = Math.min((wingspanCm / maxRange) * 100, 100);
  const refPct = (childArmSpan / maxRange) * 100;
  const barColor = habitatType ? HABITAT_COLORS[habitatType] || "#3b82f6" : "#3b82f6";

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-violet-700">
        <span>
          {language === "zh" ? `翼展：${wingspanCm}厘米` : `Wingspan: ${wingspanCm} cm`}
        </span>
      </div>
      <div className="relative mt-1.5 h-3 w-full overflow-hidden rounded-full bg-violet-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
        <div
          className="absolute top-0 h-full border-r-2 border-dashed border-gray-500/60"
          style={{ left: `${refPct}%` }}
        />
      </div>
      <div className="mt-0.5 flex justify-between text-[10px] text-gray-400">
        <span>0</span>
        <span
          style={{ position: "relative", left: `${refPct - 50}%` }}
          className="text-gray-500 font-medium"
        >
          {language === "zh" ? "你的臂展" : "Your arm span"}
        </span>
        <span>{maxRange}cm</span>
      </div>
    </div>
  );
}
