import { useEffect, useCallback, useMemo } from "react";
import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];

const REGION_EMOJI: Record<string, string> = {
  asia: "🏯",
  europe: "🏰",
  africa: "🌍",
  "north-america": "🗽",
  "south-america": "🌿",
  oceania: "🐨",
  antarctica: "🧊",
};

export function DailyMissionsPanel() {
  const missionsPanelOpen = useAppStore((s) => s.missionsPanelOpen);
  const setMissionsPanelOpen = useAppStore((s) => s.setMissionsPanelOpen);
  const dailyMissions = useAppStore((s) => s.dailyMissions);
  const language = useAppStore((s) => s.language);
  const missionNotification = useAppStore((s) => s.missionNotification);
  const dismissMissionNotification = useAppStore((s) => s.dismissMissionNotification);
  const discoveredBirds = useAppStore((s) => s.discoveredBirds);

  useEffect(() => {
    if (!missionNotification) return;
    const timer = setTimeout(dismissMissionNotification, 3000);
    return () => clearTimeout(timer);
  }, [missionNotification, dismissMissionNotification]);

  const handleClose = useCallback(() => setMissionsPanelOpen(false), [setMissionsPanelOpen]);

  const continentProgress = useMemo(() => {
    const discoveredSet = new Set(discoveredBirds);
    const regions: Record<string, { total: number; found: number }> = {};
    for (const bird of birds) {
      if (!regions[bird.region]) regions[bird.region] = { total: 0, found: 0 };
      regions[bird.region].total++;
      if (discoveredSet.has(bird.id)) regions[bird.region].found++;
    }
    return regions;
  }, [discoveredBirds]);

  if (!missionsPanelOpen) return null;

  const completedCount = dailyMissions.filter((m) => m.completed).length;
  const totalCount = dailyMissions.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
        <header className="flex items-center justify-between border-b border-amber-100 bg-linear-to-r from-amber-50/80 to-orange-50/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <ProgressRing pct={progressPct} />
            <div>
              <h2 className="text-lg font-bold text-amber-900">
                {language === "zh" ? "每日任务" : "Daily Missions"}
              </h2>
              <p className="text-xs text-amber-600">
                {language === "zh"
                  ? `已完成 ${completedCount} / ${totalCount}`
                  : `Completed ${completedCount} / ${totalCount}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200/60 text-amber-700 hover:bg-amber-300"
            aria-label={language === "zh" ? "关闭" : "Close"}
          >
            ✕
          </button>
        </header>

        <div className="max-h-[calc(85vh-4rem)] overflow-y-auto overscroll-contain p-4">
          <div className="space-y-3">
            {dailyMissions.map((mission) => {
              const pct = Math.min((mission.current / mission.goal) * 100, 100);
              const regionKey = mission.type === "find_region" ? String(mission.target) : null;
              const regionData = regionKey ? continentProgress[regionKey] : null;

              return (
                <div
                  key={mission.id}
                  className={`rounded-xl border p-4 transition-all ${
                    mission.completed
                      ? "border-green-200 bg-green-50/80"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-lg ${mission.completed ? "animate-[badgeGlow_1.5s_ease-in-out_infinite]" : ""}`}
                        >
                          {mission.badge}
                        </span>
                        <h3 className="font-semibold text-gray-800">
                          {language === "zh" ? mission.titleZh : mission.titleEn}
                        </h3>
                        {mission.completed && (
                          <span className="text-green-500">✓</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {language === "zh" ? "进度" : "Progress"} {mission.current}/{mission.goal}
                      </span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          mission.completed ? "bg-green-400" : "bg-amber-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {regionData && (
                    <div className="mt-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                        <span>{REGION_EMOJI[regionKey!] ?? "🌐"}</span>
                        <span>
                          {language === "zh"
                            ? `大陆探索: ${regionData.found}/${regionData.total}`
                            : `Continent: ${regionData.found}/${regionData.total}`}
                        </span>
                      </div>
                      <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-50">
                        <div
                          className="h-full rounded-full bg-blue-300 transition-all duration-500"
                          style={{ width: `${regionData.total > 0 ? (regionData.found / regionData.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {mission.completed && (
                    <div className="mt-2 text-center">
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 shadow-[0_0_8px_rgba(34,197,94,0.3)]">
                        {language === "zh" ? "任务完成！" : "Mission Complete!"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {completedCount === totalCount && totalCount > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-4 text-center">
              <p className="text-lg font-bold text-amber-800">
                {language === "zh" ? "所有任务已完成！" : "All Missions Complete!"}
              </p>
              <p className="mt-1 text-xs text-amber-600">
                {language === "zh" ? "明天再来挑战新任务吧！" : "Come back tomorrow for new missions!"}
              </p>
            </div>
          )}
        </div>
      </div>

      {missionNotification && <MissionCelebration />}

      <style>{`
        @keyframes badgeGlow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(251, 191, 36, 0.3)); }
          50% { filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6)); transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0">
      <circle
        cx="22" cy="22" r={radius}
        fill="none"
        stroke="rgba(251, 191, 36, 0.15)"
        strokeWidth="4"
      />
      <circle
        cx="22" cy="22" r={radius}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 22 22)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text
        x="22" y="22"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="700"
        fill="#b45309"
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

function MissionCelebration() {
  const language = useAppStore((s) => s.language);

  return (
    <div
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        zIndex: "var(--z-overlay)",
        animation: "missionCelebrate 2s ease-out forwards",
        pointerEvents: "none",
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-2xl bg-linear-to-r from-amber-400 to-orange-400 px-8 py-4 shadow-2xl">
          <p className="text-center text-lg font-bold text-white">
            {language === "zh" ? "任务完成！" : "Mission Complete!"}
          </p>
        </div>
        <CelebrationStars />
      </div>

      <style>{`
        @keyframes missionCelebrate {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          40% { transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -60%) scale(0.9); }
        }
      `}</style>
    </div>
  );
}

function CelebrationStars() {
  const stars = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 50 + Math.random() * 30;
    const size = 6 + Math.random() * 8;
    const delay = Math.random() * 0.3;
    const colors = ["#fbbf24", "#f59e0b", "#fb923c", "#facc15", "#fcd34d"];
    return { angle, distance, size, delay, color: colors[i % colors.length] };
  });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
      {stars.map((star, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: star.size,
            height: star.size,
            marginLeft: -star.size / 2,
            marginTop: -star.size / 2,
            animation: `missionStar 0.8s ease-out ${star.delay}s forwards`,
            ["--sx" as string]: `${Math.cos(star.angle) * star.distance}px`,
            ["--sy" as string]: `${Math.sin(star.angle) * star.distance}px`,
          }}
        >
          <svg viewBox="0 0 24 24" width={star.size} height={star.size} fill={star.color}>
            <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6.4 4.8 2.4-7.2-6-4.8h7.6z" />
          </svg>
        </div>
      ))}
      <style>{`
        @keyframes missionStar {
          0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: translate(var(--sx), var(--sy)) scale(1) rotate(180deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
