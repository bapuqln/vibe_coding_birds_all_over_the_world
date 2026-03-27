import { useMemo } from "react";
import { useAppStore } from "../../store";
import journeysData from "../../data/migration-journeys.json";
import type { MigrationJourney } from "../../types";

const journeys = journeysData as MigrationJourney[];

export function MigrationJourneyPanel() {
  const journeyPanelOpen = useAppStore((s) => s.journeyPanelOpen);
  const setJourneyPanelOpen = useAppStore((s) => s.setJourneyPanelOpen);
  const activeJourneyId = useAppStore((s) => s.activeJourneyId);
  const setActiveJourney = useAppStore((s) => s.setActiveJourney);
  const journeyProgress = useAppStore((s) => s.journeyProgress);
  const currentSeason = useAppStore((s) => s.currentSeason);
  const language = useAppStore((s) => s.language);
  const setActivePanel = useAppStore((s) => s.setActivePanel);

  const progressMap = useMemo(() => {
    const map = new Map<string, { visited: number; completed: boolean }>();
    for (const p of journeyProgress) {
      map.set(p.journeyId, { visited: p.visitedStopIds.length, completed: p.completed });
    }
    return map;
  }, [journeyProgress]);

  if (!journeyPanelOpen) return null;

  const handleClose = () => {
    setJourneyPanelOpen(false);
    setActivePanel(null);
  };

  const handleStartJourney = (journeyId: string) => {
    if (activeJourneyId === journeyId) {
      setActiveJourney(null);
    } else {
      setActiveJourney(journeyId);
    }
  };

  const seasonFiltered = journeys.filter((j) => j.seasons.includes(currentSeason));

  return (
    <div
      className="pointer-events-auto fixed inset-0 flex items-center justify-center p-5"
      style={{ animation: "panelScaleFade var(--panel-duration) var(--panel-ease)" }}
    >
      <button
        type="button"
        onClick={handleClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label={language === "zh" ? "关闭" : "Close"}
      />

      <div
        className="relative max-h-[85vh] w-full max-w-md overflow-hidden shadow-2xl"
        style={{
          borderRadius: 20,
          background: "rgba(8, 15, 35, 0.95)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(100, 180, 255, 0.15)",
        }}
      >
        <header
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(100, 180, 255, 0.1)" }}
        >
          <div>
            <h2 className="text-lg font-bold text-white/90">
              {language === "zh" ? "🗺️ 迁徙旅程" : "🗺️ Migration Journeys"}
            </h2>
            <p className="text-xs text-white/50">
              {language === "zh"
                ? `当前季节: ${seasonLabel(currentSeason, "zh")} · ${seasonFiltered.length} 条路线`
                : `Season: ${seasonLabel(currentSeason, "en")} · ${seasonFiltered.length} routes`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={language === "zh" ? "关闭" : "Close"}
          >
            ✕
          </button>
        </header>

        <div className="max-h-[calc(85vh-5rem)] overflow-y-auto overscroll-contain p-4">
          <div className="flex flex-col gap-3">
            {seasonFiltered.length === 0 && (
              <p className="py-8 text-center text-sm text-white/40">
                {language === "zh"
                  ? "当前季节没有可用的迁徙路线"
                  : "No migration routes available this season"}
              </p>
            )}
            {seasonFiltered.map((journey) => {
              const progress = progressMap.get(journey.id);
              const visited = progress?.visited ?? 0;
              const total = journey.stops.length;
              const completed = progress?.completed ?? false;
              const isActive = activeJourneyId === journey.id;
              const pct = total > 0 ? (visited / total) * 100 : 0;

              return (
                <button
                  key={journey.id}
                  type="button"
                  onClick={() => handleStartJourney(journey.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: "14px 16px",
                    borderRadius: 16,
                    border: isActive
                      ? `1px solid ${journey.color}66`
                      : "1px solid rgba(100, 180, 255, 0.08)",
                    cursor: "pointer",
                    background: isActive
                      ? `${journey.color}15`
                      : "rgba(255, 255, 255, 0.03)",
                    textAlign: "left",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{journey.badge}</span>
                      <div>
                        <p className="text-sm font-bold text-white/90">
                          {language === "zh" ? journey.nameZh : journey.nameEn}
                        </p>
                        <p className="text-xs text-white/45">
                          {language === "zh" ? journey.descriptionZh : journey.descriptionEn}
                        </p>
                      </div>
                    </div>
                    {completed && <span className="text-lg">🏆</span>}
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="h-1.5 flex-1 overflow-hidden rounded-full"
                      style={{ background: "rgba(255, 255, 255, 0.08)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: completed
                            ? "#4ade80"
                            : `linear-gradient(90deg, ${journey.color}, ${journey.color}88)`,
                        }}
                      />
                    </div>
                    <span className="shrink-0 text-xs font-medium text-white/50">
                      {visited}/{total}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {journey.stops.map((stop) => {
                        const isVisited = progress?.visited
                          ? (journeyProgress.find((p) => p.journeyId === journey.id)?.visitedStopIds ?? []).includes(stop.id)
                          : false;
                        return (
                          <div
                            key={stop.id}
                            title={language === "zh" ? stop.nameZh : stop.nameEn}
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: isVisited ? "#4ade80" : "rgba(255, 255, 255, 0.15)",
                              transition: "background 0.3s",
                            }}
                          />
                        );
                      })}
                    </div>
                    <span
                      className="ml-auto text-xs font-semibold"
                      style={{
                        color: isActive ? journey.color : "rgba(255, 255, 255, 0.4)",
                      }}
                    >
                      {isActive
                        ? (language === "zh" ? "进行中" : "Active")
                        : completed
                          ? (language === "zh" ? "已完成" : "Completed")
                          : (language === "zh" ? "开始旅程" : "Start Journey")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function seasonLabel(season: string, lang: "zh" | "en"): string {
  const labels: Record<string, { zh: string; en: string }> = {
    spring: { zh: "🌸 春", en: "🌸 Spring" },
    summer: { zh: "☀️ 夏", en: "☀️ Summer" },
    autumn: { zh: "🍂 秋", en: "🍂 Autumn" },
    winter: { zh: "❄️ 冬", en: "❄️ Winter" },
  };
  return labels[season]?.[lang] ?? season;
}
