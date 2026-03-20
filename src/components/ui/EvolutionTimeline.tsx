import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird, EvolutionEra } from "../../types";

const birds = birdsData as Bird[];

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

  const birdsWithEra = birds.filter((b) => b.evolutionEra);

  return (
    <>
      <button
        onClick={() => setEvolutionTimelineOpen(!evolutionTimelineOpen)}
        className={`
          fixed bottom-48 right-4 z-30
          flex items-center gap-1.5
          rounded-full px-4 py-2.5
          text-sm font-semibold shadow-lg
          transition-all duration-200
          min-h-12 min-w-12
          ${
            evolutionTimelineOpen
              ? "bg-amber-500 text-white ring-2 ring-amber-300"
              : "bg-white/90 text-gray-700 ring-1 ring-gray-200/50 backdrop-blur-sm hover:bg-white"
          }
        `}
        aria-label={language === "zh" ? "时间线" : "Timeline"}
      >
        <span className="text-base">🦕</span>
        <span className="hidden sm:inline">
          {language === "zh" ? "时间线" : "Timeline"}
        </span>
      </button>

      <div
        className={`
          fixed bottom-0 left-0 right-0 z-40
          transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${evolutionTimelineOpen ? "translate-y-0" : "translate-y-full"}
        `}
      >
        <div className="mx-auto max-w-4xl rounded-t-[28px] bg-white/95 p-5 shadow-2xl backdrop-blur-xl">
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

          <div className="overflow-x-auto pb-2">
            <div className="relative min-w-150">
              <div className="flex h-8">
                {(Object.entries(ERA_CONFIG) as [EvolutionEra, (typeof ERA_CONFIG)[EvolutionEra]][]).map(
                  ([era, config]) => {
                    const widthPct =
                      ((config.startMya - config.endMya) / TOTAL_MYA) * 100;
                    return (
                      <div
                        key={era}
                        className="flex items-center justify-center text-xs font-semibold text-white"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: config.color,
                          borderRadius: "6px",
                          margin: "0 1px",
                        }}
                      >
                        {language === "zh" ? config.labelZh : config.labelEn}
                      </div>
                    );
                  },
                )}
              </div>

              <div className="mt-1 flex justify-between text-[10px] text-gray-400 px-1">
                <span>150 Mya</span>
                <span>66 Mya</span>
                <span>23 Mya</span>
                <span>{language === "zh" ? "现在" : "Now"}</span>
              </div>

              <div className="relative mt-3 h-20">
                {birdsWithEra.map((bird) => {
                  const leftPct = eraPosition(bird.evolutionEra!);
                  const jitter = (bird.id.charCodeAt(0) % 5) * 12;
                  return (
                    <button
                      key={bird.id}
                      onClick={() => {
                        setSelectedBird(bird.id);
                        setEvolutionTimelineOpen(false);
                      }}
                      className="absolute flex flex-col items-center gap-0.5 transition-transform hover:scale-110"
                      style={{ left: `${leftPct}%`, top: `${jitter}px`, transform: "translateX(-50%)" }}
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
