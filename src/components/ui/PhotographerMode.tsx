import { useState, useEffect } from "react";
import { useAppStore } from "../../store";

export function PhotographerMode() {
  const active = useAppStore((s) => s.photographerModeActive);
  const setActive = useAppStore((s) => s.setPhotographerModeActive);
  const score = useAppStore((s) => s.photographerScore);
  const setScore = useAppStore((s) => s.setPhotographerScore);
  const language = useAppStore((s) => s.language);
  const addScreenshot = useAppStore((s) => s.addScreenshot);
  const setScreenshotFlash = useAppStore((s) => s.setScreenshotFlash);

  const [timerMode, setTimerMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [, setTotalScore] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);

  useEffect(() => {
    if (!timerMode || !active || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerMode(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timerMode, active, timeLeft]);

  const handleCapture = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    addScreenshot(dataUrl);
    setScreenshotFlash(true);
    setPhotoCount((c) => c + 1);

    const mockScore = {
      distance: Math.round(Math.random() * 30),
      pose: Math.round(Math.random() * 30),
      composition: Math.round(Math.random() * 20),
      rarity: Math.round(Math.random() * 20),
      total: 0,
      stars: 0,
    };
    mockScore.total = mockScore.distance + mockScore.pose + mockScore.composition + mockScore.rarity;
    mockScore.stars = mockScore.total >= 90 ? 5 : mockScore.total >= 70 ? 4 : mockScore.total >= 50 ? 3 : mockScore.total >= 30 ? 2 : 1;
    setScore(mockScore);
    setTotalScore((t) => t + mockScore.total);
  };

  if (!active) return null;

  return (
    <div className="pointer-events-auto fixed inset-0" style={{ zIndex: "var(--z-overlay)" }}>
      {/* Rule of thirds grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 h-full w-px bg-white/20" />
        <div className="absolute left-2/3 top-0 h-full w-px bg-white/20" />
        <div className="absolute left-0 top-1/3 h-px w-full bg-white/20" />
        <div className="absolute left-0 top-2/3 h-px w-full bg-white/20" />
        {/* Crosshair */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-8 w-px bg-white/30" style={{ marginBottom: -4 }} />
          <div className="h-px w-8 bg-white/30" style={{ marginLeft: -12, marginTop: -16 }} />
        </div>
      </div>

      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
        <div className="glass-panel px-4 py-2 text-white">
          <span className="text-sm font-bold">📸 {language === "zh" ? "摄影师模式" : "Photographer Mode"}</span>
        </div>
        {timerMode && (
          <div className="glass-panel px-4 py-2 text-white">
            <span className="text-lg font-bold">{timeLeft}s</span>
          </div>
        )}
        <button
          onClick={() => { setActive(false); setScore(null); }}
          className="glass-button px-4 py-2 text-sm text-white"
        >
          ✕ {language === "zh" ? "退出" : "Exit"}
        </button>
      </div>

      {/* Score popup */}
      {score && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="glass-panel animate-bounce p-6 text-center text-white">
            <div className="mb-2 text-3xl">
              {"⭐".repeat(score.stars)}{"☆".repeat(5 - score.stars)}
            </div>
            <div className="text-2xl font-bold">{score.total}</div>
            <div className="mt-1 text-xs text-white/60">
              {language === "zh" ? "距离" : "Distance"}: {score.distance} |{" "}
              {language === "zh" ? "姿态" : "Pose"}: {score.pose} |{" "}
              {language === "zh" ? "构图" : "Comp"}: {score.composition}
            </div>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-4">
        <button
          onClick={() => { setTimerMode(!timerMode); setTimeLeft(60); setTotalScore(0); setPhotoCount(0); }}
          className="glass-button px-4 py-2 text-sm text-white"
        >
          ⏱️ {timerMode ? (language === "zh" ? "停止" : "Stop") : (language === "zh" ? "计时赛" : "Timer")}
        </button>
        <button
          onClick={handleCapture}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white/30 text-2xl shadow-lg transition hover:bg-white/40 active:scale-90"
        >
          📷
        </button>
        <div className="glass-panel px-3 py-2 text-center text-white">
          <div className="text-xs text-white/60">{language === "zh" ? "照片" : "Photos"}</div>
          <div className="text-sm font-bold">{photoCount}</div>
        </div>
      </div>
    </div>
  );
}
