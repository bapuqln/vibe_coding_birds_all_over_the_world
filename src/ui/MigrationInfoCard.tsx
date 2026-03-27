import { useAppStore } from "../store";
import { getAllMigrationIntelligencePaths } from "../domain/migration-paths";

export function MigrationInfoCard() {
  const pathIndex = useAppStore((s) => s.migrationInfoPathIndex);
  const language = useAppStore((s) => s.language);
  const playTimeline = useAppStore((s) => s.playTimeline);
  const setMigrationInfoPathIndex = useAppStore(
    (s) => s.setMigrationInfoPathIndex,
  );

  if (pathIndex === null) return null;

  const paths = getAllMigrationIntelligencePaths();
  const path = paths[pathIndex];
  if (!path) return null;

  const isZh = language === "zh";
  const origin = path.waypoints[0];
  const dest = path.waypoints[path.waypoints.length - 1];

  const handleDismiss = () => {
    setMigrationInfoPathIndex(null);
    playTimeline();
  };

  return (
    <div
      className="pointer-events-auto fixed bottom-40 left-1/2 -translate-x-1/2"
      style={{ zIndex: "var(--z-card)" }}
    >
      <div
        className="glass-panel animate-scaleFade w-85 rounded-2xl p-5"
        style={{ borderLeft: `3px solid ${path.color}` }}
      >
        <div className="mb-3 flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: path.color }}
          />
          <h3 className="text-base font-bold text-white">
            {isZh ? path.nameZh : path.nameEn}
          </h3>
        </div>

        <div className="mb-3 space-y-1 text-sm text-white/70">
          <p>
            📍 {origin[0].toFixed(1)}°{origin[0] >= 0 ? "N" : "S"},{" "}
            {origin[1].toFixed(1)}°{origin[1] >= 0 ? "E" : "W"} →{" "}
            {dest[0].toFixed(1)}°{dest[0] >= 0 ? "N" : "S"},{" "}
            {dest[1].toFixed(1)}°{dest[1] >= 0 ? "E" : "W"}
          </p>
          <p>
            🛫 {path.distanceKm.toLocaleString()} km ·{" "}
            {isZh
              ? path.season === "spring"
                ? "春季"
                : "秋季"
              : path.season}
          </p>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-white/90">
          {isZh ? path.funFactZh : path.funFactEn}
        </p>

        <button
          className="glass-button w-full rounded-xl py-2 text-sm font-medium"
          onClick={handleDismiss}
        >
          {isZh ? "继续播放" : "Resume Timeline"}
        </button>
      </div>
    </div>
  );
}
