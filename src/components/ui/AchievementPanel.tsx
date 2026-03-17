import { useCallback, useEffect, useMemo } from "react";
import { useAppStore } from "../../store";
import achievementDefs from "../../data/achievements.json";
import birdsData from "../../data/birds.json";
import type { AchievementDef, Bird } from "../../types";

const defs = achievementDefs as AchievementDef[];
const birds = birdsData as Bird[];

export function AchievementPanel() {
  const achievementPanelOpen = useAppStore((s) => s.achievementPanelOpen);
  const setAchievementPanelOpen = useAppStore((s) => s.setAchievementPanelOpen);
  const achievements = useAppStore((s) => s.achievements);
  const language = useAppStore((s) => s.language);
  const achievementNotification = useAppStore((s) => s.achievementNotification);
  const dismissAchievementNotification = useAppStore((s) => s.dismissAchievementNotification);
  const discoveredBirds = useAppStore((s) => s.discoveredBirds);
  const listenCount = useAppStore((s) => s.listenCount);
  const birdPhotos = useAppStore((s) => s.birdPhotos);
  const completedMissionCount = useAppStore((s) => s.completedMissionCount);

  useEffect(() => {
    if (!achievementNotification) return;
    const timer = setTimeout(dismissAchievementNotification, 3500);
    return () => clearTimeout(timer);
  }, [achievementNotification, dismissAchievementNotification]);

  const handleClose = useCallback(() => setAchievementPanelOpen(false), [setAchievementPanelOpen]);

  const progressMap = useMemo(() => {
    const regions = new Set(
      birds.filter((b) => discoveredBirds.includes(b.id)).map((b) => b.region),
    );
    return {
      discover: discoveredBirds.length,
      continent: regions.size,
      listen: listenCount,
      photo: birdPhotos.length,
      mission: completedMissionCount,
    } as Record<string, number>;
  }, [discoveredBirds, listenCount, birdPhotos.length, completedMissionCount]);

  if (!achievementPanelOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

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

      <div className="relative max-h-[85vh] w-full max-w-md overflow-hidden rounded-[20px] bg-white/95 shadow-2xl backdrop-blur-xl">
        <header className="flex items-center justify-between border-b border-purple-100 bg-linear-to-r from-purple-50/80 to-indigo-50/80 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-purple-900">
              {language === "zh" ? "🏅 探索者徽章" : "🏅 Explorer Badges"}
            </h2>
            <p className="text-xs text-purple-600">
              {language === "zh"
                ? `已解锁 ${unlockedCount} / ${defs.length}`
                : `Unlocked ${unlockedCount} / ${defs.length}`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-200/60 text-purple-700 hover:bg-purple-300"
            aria-label={language === "zh" ? "关闭" : "Close"}
          >
            ✕
          </button>
        </header>

        <div className="max-h-[calc(85vh-4rem)] overflow-y-auto overscroll-contain p-4">
          <div className="grid grid-cols-2 gap-3">
            {defs.map((def) => {
              const progress = achievements.find((a) => a.achievementId === def.id);
              const isUnlocked = progress?.unlocked ?? false;
              const currentValue = progressMap[def.type] ?? 0;
              const pct = Math.min((currentValue / def.requirement) * 100, 100);

              return (
                <div
                  key={def.id}
                  className={`flex flex-col items-center rounded-xl border p-4 text-center transition-all ${
                    isUnlocked
                      ? "border-purple-200 bg-linear-to-b from-purple-50 to-indigo-50 shadow-sm"
                      : "border-gray-100 bg-gray-50/50"
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
                      isUnlocked
                        ? "bg-linear-to-br from-purple-100 to-indigo-100 shadow-inner"
                        : "bg-gray-100"
                    }`}
                    style={isUnlocked ? { boxShadow: "0 0 12px rgba(139, 92, 246, 0.3)" } : undefined}
                  >
                    {isUnlocked ? def.icon : "🔒"}
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-gray-800">
                    {language === "zh" ? def.titleZh : def.titleEn}
                  </h3>
                  <p className="mt-1 text-[10px] leading-tight text-gray-500">
                    {language === "zh" ? def.descriptionZh : def.descriptionEn}
                  </p>

                  <div className="mt-2 w-full">
                    <div className="flex items-center justify-between text-[9px] text-gray-400">
                      <span>{Math.min(currentValue, def.requirement)}/{def.requirement}</span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isUnlocked
                            ? "bg-linear-to-r from-purple-400 to-indigo-400"
                            : "bg-gray-300"
                        }`}
                        style={{
                          width: `${pct}%`,
                          boxShadow: isUnlocked ? "0 0 6px rgba(139, 92, 246, 0.4)" : "none",
                        }}
                      />
                    </div>
                  </div>

                  {isUnlocked && progress?.unlockedAt && (
                    <p className="mt-1 text-[9px] text-purple-400">
                      {new Date(progress.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AchievementNotification() {
  const achievementNotification = useAppStore((s) => s.achievementNotification);
  const language = useAppStore((s) => s.language);
  const dismissAchievementNotification = useAppStore((s) => s.dismissAchievementNotification);

  useEffect(() => {
    if (!achievementNotification) return;
    const timer = setTimeout(dismissAchievementNotification, 3500);
    return () => clearTimeout(timer);
  }, [achievementNotification, dismissAchievementNotification]);

  if (!achievementNotification) return null;

  const def = defs.find((d) => d.id === achievementNotification);
  if (!def) return null;

  return (
    <div
      className="pointer-events-auto fixed left-1/2 -translate-x-1/2"
      onClick={dismissAchievementNotification}
      style={{
        bottom: 100,
        animation: "achievementSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        cursor: "pointer",
        zIndex: "var(--z-card)",
      }}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-linear-to-r from-purple-500 to-indigo-500 px-5 py-3 shadow-xl">
        <span className="text-2xl">{def.icon}</span>
        <div>
          <p className="text-xs font-semibold text-purple-100">
            {language === "zh" ? "成就解锁！" : "Achievement Unlocked!"}
          </p>
          <p className="text-sm font-bold text-white">
            {language === "zh" ? def.titleZh : def.titleEn}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes achievementSlideUp {
          0% { opacity: 0; transform: translateX(-50%) translateY(30px) scale(0.9); }
          60% { opacity: 1; transform: translateX(-50%) translateY(-5px) scale(1.03); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
