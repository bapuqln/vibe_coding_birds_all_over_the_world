import { useAppStore } from "../../store";
import type { Season } from "../../types";

const SEASONS: { id: Season; icon: string; labelZh: string; labelEn: string }[] = [
  { id: "spring", icon: "🌸", labelZh: "春", labelEn: "Spring" },
  { id: "summer", icon: "☀️", labelZh: "夏", labelEn: "Summer" },
  { id: "autumn", icon: "🍂", labelZh: "秋", labelEn: "Autumn" },
  { id: "winter", icon: "❄️", labelZh: "冬", labelEn: "Winter" },
];

export function SeasonSelector() {
  const language = useAppStore((s) => s.language);
  const currentSeason = useAppStore((s) => s.currentSeason);
  const setCurrentSeason = useAppStore((s) => s.setCurrentSeason);

  return (
    <div
      className="pointer-events-auto fixed"
      style={{
        top: "var(--safe-area)",
        right: "var(--safe-area)",
        display: "flex",
        gap: 3,
        padding: 3,
        borderRadius: 20,
        background: "rgba(0, 10, 30, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(100, 180, 255, 0.12)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
      }}
    >
      {SEASONS.map((season) => {
        const active = currentSeason === season.id;
        return (
          <button
            key={season.id}
            type="button"
            onClick={() => setCurrentSeason(season.id)}
            aria-label={language === "zh" ? season.labelZh : season.labelEn}
            title={language === "zh" ? season.labelZh : season.labelEn}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              padding: "6px 10px",
              borderRadius: 16,
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              background: active
                ? "linear-gradient(135deg, rgba(56, 189, 248, 0.85), rgba(59, 130, 246, 0.85))"
                : "transparent",
              color: active ? "white" : "rgba(255, 255, 255, 0.5)",
              boxShadow: active
                ? "0 2px 10px rgba(56, 189, 248, 0.35)"
                : "none",
            }}
          >
            <span style={{ fontSize: 13 }}>{season.icon}</span>
            <span>{language === "zh" ? season.labelZh : season.labelEn}</span>
          </button>
        );
      })}
    </div>
  );
}
