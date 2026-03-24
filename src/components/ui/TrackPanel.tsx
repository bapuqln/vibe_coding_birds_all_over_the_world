import { useEffect } from "react";
import { useAppStore } from "../../store";
import { getAllTracks } from "../../systems/LearningTrackSystem";

export function TrackPanel() {
  const open = useAppStore((s) => s.learningTracksOpen);
  const setOpen = useAppStore((s) => s.setLearningTracksOpen);
  const trackProgress = useAppStore((s) => s.trackProgress);
  const discoveredBirds = useAppStore((s) => s.discoveredBirds);
  const language = useAppStore((s) => s.language);
  const setActivePanel = useAppStore((s) => s.setActivePanel);
  const updateTrackProgress = useAppStore((s) => s.updateTrackProgress);

  useEffect(() => {
    if (open) updateTrackProgress();
  }, [open, updateTrackProgress, discoveredBirds]);

  if (!open) return null;

  const tracks = getAllTracks();
  const discoveredSet = new Set(discoveredBirds);

  const handleClose = () => {
    setOpen(false);
    setActivePanel(null);
  };

  return (
    <div
      className="pointer-events-auto fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: "var(--z-modal)" }}
      onClick={handleClose}
    >
      <div
        className="glass-panel relative mx-auto flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-[20px] p-0 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "scaleFade 250ms ease-out" }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <h2 className="text-lg font-bold">
              {language === "zh" ? "学习路线" : "Learning Tracks"}
            </h2>
            <p className="text-xs text-white/60">
              {language === "zh" ? "按主题发现鸟类" : "Themed discovery paths"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-white/10 text-lg text-white/80 transition hover:bg-white/20 hover:text-white"
            aria-label={language === "zh" ? "关闭" : "Close"}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4">
          {tracks.map((track) => {
            const saved = trackProgress.find((p) => p.trackId === track.id);
            const total = track.birdIds.length;
            const discoveredCount = track.birdIds.filter((id) => discoveredSet.has(id)).length;
            const completed = saved?.completed ?? discoveredCount >= total;
            const pct = total > 0 ? Math.min((discoveredCount / total) * 100, 100) : 0;

            return (
              <div
                key={track.id}
                className={`rounded-2xl border p-4 transition-all ${
                  completed
                    ? "border-amber-300/50 bg-white/10"
                    : "border-white/15 bg-white/5"
                }`}
                style={{
                  minHeight: 56,
                  boxShadow: completed
                    ? "0 0 20px rgba(251, 191, 36, 0.35), inset 0 0 0 1px rgba(253, 224, 71, 0.2)"
                    : undefined,
                }}
              >
                <div className="mb-2 flex items-start gap-3">
                  <span className="text-3xl leading-none" aria-hidden>
                    {track.badgeIcon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {language === "zh" ? track.nameZh : track.name}
                      </h3>
                      {completed && (
                        <span
                          className="rounded-full bg-amber-400/25 px-2 py-0.5 text-xs font-bold text-amber-100"
                          style={{
                            boxShadow: "0 0 12px rgba(251, 191, 36, 0.6)",
                          }}
                        >
                          {language === "zh" ? "完成" : "Done"}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-white/70">
                      {language === "zh" ? track.descriptionZh : track.description}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/30">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        completed
                          ? "bg-gradient-to-r from-amber-300 to-yellow-400"
                          : "bg-gradient-to-r from-sky-400 to-cyan-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-xs font-medium text-white/85">
                    {discoveredCount} / {total}{" "}
                    {language === "zh" ? "已发现" : "found"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TrackNotification() {
  const trackId = useAppStore((s) => s.trackNotification);
  const dismiss = useAppStore((s) => s.dismissTrackNotification);
  const language = useAppStore((s) => s.language);

  useEffect(() => {
    if (!trackId) return;
    const t = setTimeout(dismiss, 3500);
    return () => clearTimeout(t);
  }, [trackId, dismiss]);

  if (!trackId) return null;

  const track = getAllTracks().find((tr) => tr.id === trackId);
  if (!track) return null;

  return (
    <div
      className="pointer-events-auto fixed bottom-32 left-1/2 -translate-x-1/2"
      style={{ zIndex: "var(--z-card)" }}
    >
      <div
        className="glass-panel flex items-center gap-3 px-6 py-4 text-white"
        style={{ animation: "scaleFade 250ms ease-out" }}
      >
        <span className="text-3xl">{track.badgeIcon}</span>
        <div>
          <p className="text-sm font-bold">
            {language === "zh" ? "路线完成！" : "Track complete!"}
          </p>
          <p className="text-xs text-white/80">
            {language === "zh" ? track.nameZh : track.name}
          </p>
        </div>
      </div>
    </div>
  );
}
