import { useAppStore } from "../../store";

const SEASON_LABELS: Record<string, { zh: string; en: string; icon: string }> = {
  spring: { zh: "春季", en: "Spring", icon: "🌸" },
  summer: { zh: "夏季", en: "Summer", icon: "☀️" },
  autumn: { zh: "秋季", en: "Autumn", icon: "🍂" },
  winter: { zh: "冬季", en: "Winter", icon: "❄️" },
};

const BIOME_LABELS: Record<string, { zh: string; en: string }> = {
  rainforest: { zh: "热带雨林", en: "Tropical Rainforest" },
  savannah: { zh: "热带草原", en: "Savannah" },
  arctic: { zh: "北极苔原", en: "Arctic Tundra" },
  ocean: { zh: "海洋", en: "Ocean" },
  forest: { zh: "温带森林", en: "Temperate Forest" },
  wetlands: { zh: "湿地", en: "Wetlands" },
  grassland: { zh: "草原", en: "Grassland" },
  desert: { zh: "沙漠", en: "Desert" },
  mountains: { zh: "山地", en: "Mountains" },
  coast: { zh: "海岸", en: "Coast" },
  polar: { zh: "极地", en: "Polar" },
  tundra: { zh: "苔原", en: "Tundra" },
};

function getBiomeFromSeason(season: string): string {
  const map: Record<string, string> = {
    spring: "forest",
    summer: "grassland",
    autumn: "forest",
    winter: "arctic",
  };
  return map[season] || "forest";
}

function getTemperatureFromSeason(temp: number): string {
  return `${temp}°C`;
}

export function ScienceHUD() {
  const language = useAppStore((s) => s.language);
  const ecosystemState = useAppStore((s) => s.ecosystemState);
  const activeBiome = useAppStore((s) => s.activeBiome);
  const globeReady = useAppStore((s) => s.globeReady);

  if (!globeReady) return null;

  const season = ecosystemState.season;
  const seasonInfo = SEASON_LABELS[season] || SEASON_LABELS.spring;
  const biomeKey = activeBiome || getBiomeFromSeason(season);
  const biomeInfo = BIOME_LABELS[biomeKey] || { zh: biomeKey, en: biomeKey };
  const temperature = getTemperatureFromSeason(ecosystemState.temperature);

  return (
    <div
      className="pointer-events-none fixed"
      style={{
        left: "var(--safe-area)",
        top: 80,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "10px 14px",
        borderRadius: 14,
        background: "rgba(0, 10, 30, 0.55)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(100, 180, 255, 0.12)",
        boxShadow: "0 2px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
        minWidth: 160,
      }}
    >
      <HUDRow
        label={language === "zh" ? "生态区" : "Biome"}
        value={language === "zh" ? biomeInfo.zh : biomeInfo.en}
      />
      <HUDRow
        label={language === "zh" ? "季节" : "Season"}
        value={`${seasonInfo.icon} ${language === "zh" ? seasonInfo.zh : seasonInfo.en}`}
      />
      <HUDRow
        label={language === "zh" ? "温度" : "Temp"}
        value={temperature}
      />
      <HUDRow
        label={language === "zh" ? "风速" : "Wind"}
        value={`${ecosystemState.wind} m/s`}
      />
    </div>
  );
}

function HUDRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "2px 0" }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "rgba(125, 211, 252, 0.6)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "rgba(255, 255, 255, 0.85)",
          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        }}
      >
        {value}
      </span>
    </div>
  );
}
