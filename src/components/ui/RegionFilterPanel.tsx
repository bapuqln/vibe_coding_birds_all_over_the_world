import { useAppStore } from "../../store";

const REGIONS = [
  { id: null, labelZh: "所有鸟类", labelEn: "All Birds", icon: "🌐" },
  { id: "north-america", labelZh: "北美洲", labelEn: "North America", icon: "🗽" },
  { id: "south-america", labelZh: "南美洲", labelEn: "South America", icon: "🌿" },
  { id: "europe", labelZh: "欧洲", labelEn: "Europe", icon: "🏰" },
  { id: "africa", labelZh: "非洲", labelEn: "Africa", icon: "🌍" },
  { id: "asia", labelZh: "亚洲", labelEn: "Asia", icon: "🏯" },
  { id: "oceania", labelZh: "大洋洲", labelEn: "Australia", icon: "🐨" },
  { id: "antarctica", labelZh: "南极洲", labelEn: "Antarctica", icon: "🧊" },
] as const;

export function RegionFilterPanel() {
  const regionFilterOpen = useAppStore((s) => s.regionFilterOpen);
  const setRegionFilterOpen = useAppStore((s) => s.setRegionFilterOpen);
  const activeRegion = useAppStore((s) => s.activeRegion);
  const setActiveRegion = useAppStore((s) => s.setActiveRegion);
  const language = useAppStore((s) => s.language);

  if (!regionFilterOpen) return null;

  const handleSelect = (regionId: string | null) => {
    setActiveRegion(regionId);
    setRegionFilterOpen(false);
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={() => setRegionFilterOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label={language === "zh" ? "关闭" : "Close"}
      />

      <div className="relative w-full max-w-sm rounded-[20px] bg-white/95 p-5 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {language === "zh" ? "🌍 选择区域" : "🌍 Select Region"}
          </h2>
          <button
            type="button"
            onClick={() => setRegionFilterOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            aria-label={language === "zh" ? "关闭" : "Close"}
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {REGIONS.map((region) => {
            const isActive = activeRegion === region.id;
            return (
              <button
                key={region.id ?? "all"}
                type="button"
                onClick={() => handleSelect(region.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-medium transition-all hover:scale-[1.02] active:scale-95 ${
                  isActive
                    ? "bg-amber-500 text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-amber-50"
                }`}
              >
                <span className="text-lg">{region.icon}</span>
                <span>{language === "zh" ? region.labelZh : region.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
