import { useAppStore } from "../../store";
import type { Season, TimeOfDay } from "../../types";

const SEASONS: { id: Season; zh: string; en: string; icon: string }[] = [
  { id: "spring", zh: "春天", en: "Spring", icon: "🌸" },
  { id: "summer", zh: "夏天", en: "Summer", icon: "☀️" },
  { id: "autumn", zh: "秋天", en: "Autumn", icon: "🍂" },
  { id: "winter", zh: "冬天", en: "Winter", icon: "❄️" },
];

const TIMES: { id: TimeOfDay; zh: string; en: string; icon: string }[] = [
  { id: "dawn", zh: "黎明", en: "Dawn", icon: "🌅" },
  { id: "morning", zh: "上午", en: "Morning", icon: "🌤️" },
  { id: "afternoon", zh: "下午", en: "Afternoon", icon: "☀️" },
  { id: "dusk", zh: "黄昏", en: "Dusk", icon: "🌇" },
  { id: "night", zh: "夜晚", en: "Night", icon: "🌙" },
];

export function EcosystemPanel() {
  const language = useAppStore((s) => s.language);
  const open = useAppStore((s) => s.ecosystemPanelOpen);
  const setOpen = useAppStore((s) => s.setEcosystemPanelOpen);
  const manualOverride = useAppStore((s) => s.ecosystemManualOverride);
  const setManualOverride = useAppStore((s) => s.setEcosystemManualOverride);
  const ecosystemState = useAppStore((s) => s.ecosystemState);
  const setCurrentSeason = useAppStore((s) => s.setCurrentSeason);
  const setEcosystemState = useAppStore((s) => s.setEcosystemState);

  if (!open) return null;

  const title = language === "zh" ? "生态模拟" : "Ecosystem Simulation";
  const closeLabel = language === "zh" ? "关闭" : "Close";
  const autoLabel = language === "zh" ? "自动模式" : "Auto Mode";
  const manualLabel = language === "zh" ? "手动控制" : "Manual Control";
  const seasonLabel = language === "zh" ? "季节" : "Season";
  const tempLabel = language === "zh" ? "温度" : "Temperature";
  const timeLabel = language === "zh" ? "时间" : "Time of Day";

  const handleSeasonChange = (season: Season) => {
    setCurrentSeason(season);
    setEcosystemState({ ...ecosystemState, season });
  };

  const handleTempChange = (temp: number) => {
    setEcosystemState({ ...ecosystemState, temperature: temp });
  };

  const handleTimeChange = (time: TimeOfDay) => {
    setEcosystemState({ ...ecosystemState, timeOfDay: time });
  };

  return (
    <div
      className="pointer-events-auto fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: "var(--z-modal)" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="glass-panel relative mx-auto max-h-[85vh] w-full max-w-sm overflow-y-auto overscroll-contain rounded-[20px] p-0 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "scaleFade 250ms ease-out" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/10 text-lg text-white/80 transition hover:bg-white/20 hover:text-white"
            aria-label={closeLabel}
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white/80">
              {manualOverride ? manualLabel : autoLabel}
            </span>
            <button
              type="button"
              onClick={() => setManualOverride(!manualOverride)}
              className="rounded-full px-3 py-1.5 text-xs font-bold transition"
              style={{
                minHeight: 36,
                background: manualOverride
                  ? "rgba(245, 158, 11, 0.4)"
                  : "rgba(255,255,255,0.15)",
              }}
            >
              {manualOverride
                ? language === "zh" ? "切换自动" : "Switch to Auto"
                : language === "zh" ? "切换手动" : "Switch to Manual"}
            </button>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold tracking-wide text-white/60">
              {seasonLabel}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {SEASONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSeasonChange(s.id)}
                  disabled={!manualOverride}
                  className="flex flex-col items-center gap-1 rounded-xl py-2 text-xs font-semibold transition disabled:opacity-40"
                  style={{
                    minHeight: 56,
                    background:
                      ecosystemState.season === s.id
                        ? "rgba(245, 158, 11, 0.35)"
                        : "rgba(255,255,255,0.08)",
                  }}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span>{language === "zh" ? s.zh : s.en}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold tracking-wide text-white/60">
              <span>{tempLabel}</span>
              <span className="text-white/90">
                {Math.round(ecosystemState.temperature)}°C
              </span>
            </div>
            <input
              type="range"
              min={-10}
              max={40}
              step={1}
              value={Math.round(ecosystemState.temperature)}
              onChange={(e) => handleTempChange(Number(e.target.value))}
              disabled={!manualOverride}
              className="w-full accent-amber-400 disabled:opacity-40"
              style={{ minHeight: 44 }}
            />
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold tracking-wide text-white/60">
              {timeLabel}
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {TIMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTimeChange(t.id)}
                  disabled={!manualOverride}
                  className="flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition disabled:opacity-40"
                  style={{
                    minHeight: 48,
                    background:
                      ecosystemState.timeOfDay === t.id
                        ? "rgba(245, 158, 11, 0.35)"
                        : "rgba(255,255,255,0.08)",
                  }}
                >
                  <span className="text-base">{t.icon}</span>
                  <span>{language === "zh" ? t.zh : t.en}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white/5 p-3 text-xs leading-relaxed text-white/70">
            {language === "zh"
              ? "调整环境参数来观察鸟类行为变化。夜行鸟只在夜晚出现，候鸟在春秋季迁徙。"
              : "Adjust environment parameters to observe bird behavior changes. Nocturnal birds appear at night, migratory birds travel in spring and autumn."}
          </div>
        </div>
      </div>
    </div>
  );
}
