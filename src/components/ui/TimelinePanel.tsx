import { useCallback, useRef } from "react";
import { useAppStore } from "../../store";
import { getMonthLabel, getMonthLabelZh } from "../../core/TimeController";

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => i);

export function TimelinePanel() {
  const timeState = useAppStore((s) => s.timeState);
  const language = useAppStore((s) => s.language);
  const playTimeline = useAppStore((s) => s.playTimeline);
  const pauseTimeline = useAppStore((s) => s.pauseTimeline);
  const setTimeMonth = useAppStore((s) => s.setTimeMonth);
  const setTimeSpeed = useAppStore((s) => s.setTimeSpeed);
  const barRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleScrub = useCallback(
    (clientX: number) => {
      const bar = barRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const x = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      const month = Math.floor(ratio * 12);
      setTimeMonth(Math.min(month, 11));
    },
    [setTimeMonth],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    handleScrub(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    handleScrub(e.clientX);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const totalProgress =
    (timeState.month + timeState.progress) / 12;

  return (
    <div
      className="pointer-events-auto fixed bottom-20 left-1/2 -translate-x-1/2"
      style={{ zIndex: "var(--z-bottom-panel)" }}
    >
      <div className="glass-panel flex flex-col items-center gap-2 rounded-2xl px-4 py-3"
        style={{ minWidth: 320, maxWidth: 480 }}
      >
        <div className="flex w-full items-center gap-3">
          <button
            className="glass-button flex h-9 w-9 items-center justify-center rounded-full text-lg"
            onClick={() => (timeState.isPlaying ? pauseTimeline() : playTimeline())}
            aria-label={timeState.isPlaying ? "Pause" : "Play"}
          >
            {timeState.isPlaying ? "⏸" : "▶"}
          </button>

          <div
            ref={barRef}
            className="relative h-6 flex-1 cursor-pointer rounded-full bg-white/10"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-linear-to-r from-cyan-400/60 to-emerald-400/60"
              style={{ width: `${totalProgress * 100}%` }}
            />
            <div
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-cyan-400 shadow-lg"
              style={{ left: `${totalProgress * 100}%` }}
            />
          </div>

          <button
            className="glass-button rounded-full px-2 py-1 text-xs font-bold"
            onClick={() => setTimeSpeed(timeState.speed === 1 ? 2 : 1)}
          >
            {timeState.speed}x
          </button>
        </div>

        <div className="flex w-full justify-between px-1">
          {MONTH_LABELS.map((m) => (
            <button
              key={m}
              className={`text-[10px] transition-colors ${
                m === timeState.month
                  ? "font-bold text-cyan-300"
                  : "text-white/40 hover:text-white/70"
              }`}
              onClick={() => setTimeMonth(m)}
            >
              {language === "zh" ? getMonthLabelZh(m).slice(0, -1) : getMonthLabel(m)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
