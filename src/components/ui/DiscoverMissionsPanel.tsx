import missionsData from "../../data/discover-missions.json";
import { useAppStore } from "../../store";
import type { DiscoveryMission, DiscoveryMissionProgress } from "../../types";

const missions = missionsData as DiscoveryMission[];

type DiscoveryMissionsStoreFields = {
  discoveryMissionsPanelOpen: boolean;
  setDiscoveryMissionsPanelOpen: (open: boolean) => void;
  discoveryMissions: DiscoveryMissionProgress[];
  discoveryBadges: string[];
};

function withDiscoveryFields<S>(s: S): S & DiscoveryMissionsStoreFields {
  return s as S & DiscoveryMissionsStoreFields;
}

function progressFor(
  discoveryMissions: DiscoveryMissionProgress[],
  missionId: string
): DiscoveryMissionProgress | undefined {
  return discoveryMissions.find((p) => p.missionId === missionId);
}

export function DiscoverMissionsPanel() {
  const discoveryMissionsPanelOpen = useAppStore(
    (s) => withDiscoveryFields(s).discoveryMissionsPanelOpen ?? false
  );
  const setDiscoveryMissionsPanelOpen = useAppStore(
    (s) => withDiscoveryFields(s).setDiscoveryMissionsPanelOpen
  );
  const discoveryMissions = useAppStore(
    (s) => withDiscoveryFields(s).discoveryMissions ?? []
  );
  const discoveryBadges = useAppStore((s) => withDiscoveryFields(s).discoveryBadges ?? []);
  const language = useAppStore((s) => s.language);
  const setActivePanel = useAppStore((s) => s.setActivePanel);

  if (!discoveryMissionsPanelOpen) return null;

  const handleClose = () => {
    setDiscoveryMissionsPanelOpen(false);
    setActivePanel(null);
  };

  const completedCount = missions.filter((m) => progressFor(discoveryMissions, m.id)?.completed)
    .length;
  const totalMissions = missions.length;

  const headerTitle = language === "zh" ? "🎯 发现任务" : "🎯 Discovery Missions";
  const progressLabel = language === "zh" ? "进度" : "Progress";
  const badgesTitle = language === "zh" ? "获得的徽章" : "Your badges";
  const badgesEmpty =
    language === "zh" ? "完成更多任务来收集徽章！" : "Complete missions to earn badges!";
  const closeLabel = language === "zh" ? "关闭" : "Close";

  return (
    <>
      <div
        className="pointer-events-auto fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        style={{ zIndex: "calc(var(--z-modal) - 1)" }}
        onClick={handleClose}
        aria-hidden
      />
      <aside
        className="glass-panel pointer-events-auto fixed right-4 flex max-h-[80vh] w-full max-w-90 flex-col overflow-hidden rounded-[20px] p-0 text-white shadow-2xl"
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: "var(--z-modal)",
          animation: "scaleFade 250ms ease-out",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="discover-missions-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 id="discover-missions-title" className="text-lg font-bold">
            {headerTitle}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-white/10 text-lg text-white/80 transition hover:bg-white/20 hover:text-white"
            aria-label={closeLabel}
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4">
          {missions.map((mission) => {
            const prog = progressFor(discoveryMissions, mission.id);
            const current = Math.min(prog?.current ?? 0, mission.goal);
            const completed = prog?.completed ?? false;
            const pct = mission.goal > 0 ? Math.min((current / mission.goal) * 100, 100) : 0;
            const title = language === "zh" ? mission.titleZh : mission.titleEn;
            const description = language === "zh" ? mission.descriptionZh : mission.descriptionEn;

            return (
              <div
                key={mission.id}
                className={`rounded-2xl border p-4 ${
                  completed
                    ? "border-amber-300/45 bg-white/10"
                    : "border-white/15 bg-white/5"
                }`}
                style={{
                  boxShadow: completed
                    ? "0 0 16px rgba(251, 191, 36, 0.25), inset 0 0 0 1px rgba(253, 224, 71, 0.15)"
                    : undefined,
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl leading-none" aria-hidden>
                    {mission.badge}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold leading-snug">{title}</h3>
                      {completed && (
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/30 text-base text-emerald-100"
                          aria-label={language === "zh" ? "已完成" : "Completed"}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/70">{description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/30">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            completed
                              ? "bg-linear-to-r from-amber-300 to-yellow-400"
                              : "bg-linear-to-r from-sky-400 to-cyan-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-xs font-medium tabular-nums text-white/85">
                        {current} / {mission.goal}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="shrink-0 space-y-3 border-t border-white/10 px-4 py-4">
          <p className="text-center text-sm font-semibold text-white/90">
            {progressLabel}: {completedCount} / {totalMissions}
          </p>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-white/50">
              {badgesTitle}
            </p>
            {discoveryBadges.length === 0 ? (
              <p className="text-xs text-white/55">{badgesEmpty}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {discoveryBadges.map((emoji, i) => (
                  <span
                    key={`${emoji}-${i}`}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-2xl shadow-inner"
                    aria-hidden
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
