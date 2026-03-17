import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import erasData from "../../data/evolution-eras.json";
import type { Bird, EvolutionEra, EvolutionEraInfo } from "../../types";

const birds = birdsData as Bird[];
const eras = erasData as EvolutionEraInfo[];

const ERA_ORDER: EvolutionEra[] = ["mesozoic", "paleogene", "neogene", "quaternary"];

const ERA_CONFIG: Record<
  EvolutionEra,
  { labelZh: string; labelEn: string; startMya: number; endMya: number; color: string }
> = {
  mesozoic: { labelZh: "中生代", labelEn: "Mesozoic", startMya: 150, endMya: 66, color: "#a3e635" },
  paleogene: { labelZh: "古近纪", labelEn: "Paleogene", startMya: 66, endMya: 23, color: "#fbbf24" },
  neogene: { labelZh: "新近纪", labelEn: "Neogene", startMya: 23, endMya: 2.6, color: "#f97316" },
  quaternary: { labelZh: "第四纪", labelEn: "Quaternary", startMya: 2.6, endMya: 0, color: "#ef4444" },
};

const TOTAL_MYA = 150;

function eraPosition(era: EvolutionEra): number {
  const config = ERA_CONFIG[era];
  const midMya = (config.startMya + config.endMya) / 2;
  return ((TOTAL_MYA - midMya) / TOTAL_MYA) * 100;
}

export function EvolutionTimeline() {
  const evolutionTimelineOpen = useAppStore((s) => s.evolutionTimelineOpen);
  const setEvolutionTimelineOpen = useAppStore((s) => s.setEvolutionTimelineOpen);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);
  const language = useAppStore((s) => s.language);
  const sliderValue = useAppStore(
    (s) => (s as typeof s & { evolutionTimelineValue: number }).evolutionTimelineValue ?? 3,
  );
  const setSliderValue = useAppStore(
    (s) => (s as typeof s & { setEvolutionTimelineValue: (v: number) => void }).setEvolutionTimelineValue,
  );

  const birdsWithEra = birds.filter((b) => b.evolutionEra);
  const selectedEra = ERA_ORDER[sliderValue] ?? "quaternary";
  const selectedEraInfo = eras.find((e) => e.era === selectedEra);
  const isFiltering = sliderValue < 3;

  return (
    <>
      <button
        onClick={() => setEvolutionTimelineOpen(!evolutionTimelineOpen)}
        className={`
          fixed
          flex h-11 min-w-30 items-center justify-center gap-2
          rounded-xl px-4 text-sm font-semibold
          shadow-lg backdrop-blur-lg
          transition-all duration-200
          hover:scale-105 active:scale-95
          ${
            evolutionTimelineOpen
              ? "bg-amber-500 text-white ring-2 ring-amber-300/50"
              : "bg-black/65 text-white hover:bg-black/75"
          }
        `}
        style={{ left: "var(--safe-area)", bottom: "calc(var(--safe-area) + 96px)" }}
        aria-label={language === "zh" ? "时间线" : "Timeline"}
      >
        <span>🦕</span>
        <span>{language === "zh" ? "时间线" : "Timeline"}</span>
      </button>

      <div
        className={`
          pointer-events-auto fixed bottom-0 left-0 right-0
          transition-transform duration-300 ease-out
          ${evolutionTimelineOpen ? "translate-y-0" : "translate-y-full"}
        `}
        style={{ zIndex: "var(--z-bottom-panel)" }}
      >
        <div className="mx-auto max-w-4xl rounded-t-[20px] bg-white/95 p-5 shadow-2xl backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">
              {language === "zh" ? "🦕 鸟类演化时间线" : "🦕 Bird Evolution Timeline"}
            </h3>
            <button
              onClick={() => setEvolutionTimelineOpen(false)}
              aria-label={language === "zh" ? "关闭" : "Close"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="mb-4 px-1">
            <label className="mb-2 block text-xs font-semibold text-gray-500">
              {language === "zh" ? "拖动滑块探索不同时代" : "Drag slider to explore different eras"}
            </label>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="w-full accent-amber-500"
              aria-label={language === "zh" ? "演化时代滑块" : "Evolution era slider"}
            />
            <div className="mt-1 flex justify-between text-[10px] text-gray-400">
              <span>150M</span>
              <span>60M</span>
              <span>5M</span>
              <span>{language === "zh" ? "今天" : "Today"}</span>
            </div>
          </div>

          {selectedEraInfo && (
            <div
              className="mb-4 rounded-xl p-3"
              style={{ backgroundColor: `${selectedEraInfo.color}20`, borderLeft: `4px solid ${selectedEraInfo.color}` }}
            >
              <h4 className="text-sm font-bold text-gray-800">
                {language === "zh" ? selectedEraInfo.nameZh : selectedEraInfo.nameEn}
                <span className="ml-2 text-xs font-normal text-gray-500">{selectedEraInfo.yearsAgo}</span>
              </h4>
              <p className="mt-1 text-xs text-gray-600">
                {language === "zh" ? selectedEraInfo.descriptionZh : selectedEraInfo.descriptionEn}
              </p>
              <p className="mt-1 text-xs font-medium text-gray-500">
                {language === "zh" ? selectedEraInfo.representativeBirdZh : selectedEraInfo.representativeBird}
              </p>
            </div>
          )}

          <div className="overflow-x-auto pb-2">
            <div className="relative min-w-150">
              <div className="flex h-8">
                {(Object.entries(ERA_CONFIG) as [EvolutionEra, (typeof ERA_CONFIG)[EvolutionEra]][]).map(
                  ([era, config]) => {
                    const widthPct = ((config.startMya - config.endMya) / TOTAL_MYA) * 100;
                    const isSelected = era === selectedEra;
                    return (
                      <div
                        key={era}
                        className="flex items-center justify-center text-xs font-semibold text-white transition-opacity"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: config.color,
                          borderRadius: "6px",
                          margin: "0 1px",
                          opacity: isFiltering && !isSelected ? 0.3 : 1,
                          outline: isSelected ? `2px solid ${config.color}` : "none",
                          outlineOffset: "2px",
                        }}
                      >
                        {language === "zh" ? config.labelZh : config.labelEn}
                      </div>
                    );
                  },
                )}
              </div>

              <div className="mt-1 flex justify-between px-1 text-[10px] text-gray-400">
                <span>150 Mya</span>
                <span>66 Mya</span>
                <span>23 Mya</span>
                <span>{language === "zh" ? "现在" : "Now"}</span>
              </div>

              <div className="relative mt-3 h-20">
                {birdsWithEra.map((bird) => {
                  const leftPct = eraPosition(bird.evolutionEra!);
                  const jitter = (bird.id.charCodeAt(0) % 5) * 12;
                  const matchesEra = !isFiltering || bird.evolutionEra === selectedEra;
                  return (
                    <button
                      key={bird.id}
                      onClick={() => {
                        setSelectedBird(bird.id);
                        setEvolutionTimelineOpen(false);
                      }}
                      className="absolute flex flex-col items-center gap-0.5 transition-all hover:scale-110"
                      style={{
                        left: `${leftPct}%`,
                        top: `${jitter}px`,
                        transform: "translateX(-50%)",
                        opacity: matchesEra ? 1 : 0.15,
                        filter: matchesEra ? "none" : "grayscale(1)",
                      }}
                      title={language === "zh" ? bird.nameZh : bird.nameEn}
                    >
                      <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white shadow-md">
                        <img
                          src={bird.photoUrl}
                          alt={bird.nameEn}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="max-w-15 truncate text-[9px] font-medium text-gray-600">
                        {language === "zh" ? bird.nameZh : bird.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
