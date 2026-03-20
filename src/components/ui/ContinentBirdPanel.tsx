import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];

const REGION_NAMES: Record<
  string,
  { zh: string; en: string; emoji: string }
> = {
  asia: { zh: "亚洲", en: "Asia", emoji: "🏯" },
  europe: { zh: "欧洲", en: "Europe", emoji: "🏰" },
  africa: { zh: "非洲", en: "Africa", emoji: "🌍" },
  "north-america": { zh: "北美洲", en: "North America", emoji: "🗽" },
  "south-america": { zh: "南美洲", en: "South America", emoji: "🌿" },
  oceania: { zh: "大洋洲", en: "Oceania", emoji: "🐨" },
  antarctica: { zh: "南极洲", en: "Antarctica", emoji: "🧊" },
};

export function ContinentBirdPanel() {
  const continentPanelRegion = useAppStore((s) => s.continentPanelRegion);
  const language = useAppStore((s) => s.language);
  const setContinentPanelRegion = useAppStore((s) => s.setContinentPanelRegion);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);

  if (continentPanelRegion === null) return null;

  const regionInfo = REGION_NAMES[continentPanelRegion] ?? {
    zh: continentPanelRegion,
    en: continentPanelRegion,
    emoji: "🌐",
  };

  const regionBirds = birds.filter((b) => b.region === continentPanelRegion);
  const headerTitle =
    language === "zh"
      ? `${regionInfo.emoji} ${regionInfo.zh}`
      : `${regionInfo.emoji} ${regionInfo.en}`;

  const handleBirdClick = (bird: Bird) => {
    setSelectedBird(bird.id);
    setContinentPanelRegion(null);
  };

  const handleBackdropClick = () => {
    setContinentPanelRegion(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        onClick={handleBackdropClick}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label={language === "zh" ? "关闭" : "Close"}
      />

      {/* Panel */}
      <div
        className="relative max-h-[85vh] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 bg-amber-50 px-4 py-3">
          <h2 className="text-lg font-bold text-slate-800">{headerTitle}</h2>
          <button
            type="button"
            onClick={handleBackdropClick}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors duration-200 hover:bg-slate-200 hover:text-slate-700"
            aria-label={language === "zh" ? "关闭" : "Close"}
          >
            ✕
          </button>
        </header>

        <div className="max-h-[calc(85vh-3.5rem)] overflow-y-auto overscroll-contain p-3">
          <ul className="space-y-2">
            {regionBirds.map((bird) => (
              <li key={bird.id}>
                <button
                  type="button"
                  onClick={() => handleBirdClick(bird)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-3 text-left shadow-sm transition-all duration-200 hover:border-amber-200 hover:bg-amber-50 hover:shadow-md"
                >
                  <img
                    src={bird.photoUrl}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-800">
                      {bird.nameZh} / {bird.nameEn}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
